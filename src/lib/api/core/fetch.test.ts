import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * A stand-in for Next's `unstable_cache` with the behaviour fetch.ts relies on
 * (node_modules/next/dist/server/web/spec-extension/unstable-cache.js):
 *   - fresh entry: returned, callback not run
 *   - stale entry: returned at once, callback run in the background; if it
 *     throws, the old entry stays
 *   - no entry: callback run; a throw propagates and nothing is stored
 */
const store = new Map<string, { value: unknown; at: number }>();
const background: Promise<unknown>[] = [];

vi.mock('next/cache', () => ({
  unstable_cache:
    (fn: () => Promise<unknown>, keyParts: string[], opts: { revalidate: number }) =>
    async () => {
      const key = keyParts.join('|');
      const hit = store.get(key);
      if (hit) {
        if (Date.now() - hit.at > opts.revalidate * 1000) {
          background.push(
            fn().then(
              (value) => store.set(key, { value, at: Date.now() }),
              () => undefined,
            ),
          );
        }
        return hit.value;
      }
      const value = await fn();
      store.set(key, { value, at: Date.now() });
      return value;
    },
}));

import { fetchFromProvider, redactUrl } from './fetch';
import { PROVIDERS } from './registry';
import { limitsFor, refusal, resetHealth, usedToday } from './health';

const HOUR = 3600 * 1000;

function stub(...responses: (() => Response)[]) {
  const queue = [...responses];
  const fn = vi.fn(async () => (queue.length > 1 ? queue.shift()! : queue[0])());
  vi.stubGlobal('fetch', fn);
  return fn;
}

const okJson = (body: unknown = { status: 'success', results: [] }) => () =>
  new Response(JSON.stringify(body), { status: 200, headers: { Date: new Date().toUTCString() } });

beforeEach(() => {
  store.clear();
  background.length = 0;
  resetHealth();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('request budgets count real upstream requests only (L379, L1016)', () => {
  it('does not spend the budget on a cache hit', async () => {
    const fetch = stub(okJson());
    for (let i = 0; i < 5; i += 1) {
      const res = await fetchFromProvider('newsdata', 'https://newsdata.io/api/1/latest?q=climate&apikey=SECRET');
      expect(res.ok).toBe(true);
    }
    // Five renders, one real request, one credit.
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(usedToday('newsdata')).toBe(1);
  });

  it('keeps serving the cached copy once the budget is spent, without asking upstream', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-25T08:00:00Z'));
    const fetch = stub(okJson({ status: 'success', results: [{ n: 1 }] }));
    const url = 'https://newsdata.io/api/1/latest?q=energy';
    expect((await fetchFromProvider('newsdata', url)).ok).toBe(true);

    // Spend the rest of the day's budget, pacing it past the 15-minute window.
    const daily = limitsFor('newsdata').daily;
    for (let i = 1; i < daily; i += 1) {
      if (i % 20 === 0) vi.setSystemTime(Date.now() + 16 * 60 * 1000);
      await fetchFromProvider('newsdata', `${url}&n=${i}`);
    }
    expect(usedToday('newsdata')).toBe(daily);
    expect(refusal('newsdata')).toMatch(/daily request budget/);
    fetch.mockClear();

    // Later the same day the entry is stale and the budget is gone.
    vi.setSystemTime(new Date('2026-09-25T23:00:00Z'));
    const res = await fetchFromProvider<{ results: unknown[] }>('newsdata', url);
    await Promise.all(background);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.results).toEqual([{ n: 1 }]);
      // Honest age: retrieved at 08:00, and flagged stale because the refresh was refused.
      expect(res.retrievedAt.slice(11, 16)).toBe('08:00');
      expect(res.stale).toBe(true);
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it('reports rate_limited, and sends nothing, when the budget is spent and nothing is cached', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-25T01:00:00Z'));
    const fetch = stub(okJson());
    const daily = limitsFor('newsdata').daily;
    for (let i = 0; i < daily; i += 1) {
      if (i % 20 === 0) vi.setSystemTime(Date.now() + 16 * 60 * 1000);
      await fetchFromProvider('newsdata', `https://newsdata.io/api/1/latest?n=${i}`);
    }
    fetch.mockClear();
    const res = await fetchFromProvider('newsdata', 'https://newsdata.io/api/1/latest?q=new');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('rate_limited');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('keeps OpenAlex under the no-key allowance (p. 212, L1032)', () => {
    const before = process.env.OPENALEX_API_KEY;
    delete process.env.OPENALEX_API_KEY;
    expect(limitsFor('openalex').daily).toBeLessThan(100);
    process.env.OPENALEX_API_KEY = 'k';
    expect(limitsFor('openalex').daily).toBeLessThan(1000);
    if (before === undefined) delete process.env.OPENALEX_API_KEY;
    else process.env.OPENALEX_API_KEY = before;
  });
});

describe('errors and rate-limit replies are never cached (pp. 209, 226, L1030)', () => {
  const gdeltText = (body: unknown) =>
    typeof body === 'string' && body.trim().startsWith('{') ? null : { reason: 'rate_limited' as const, message: 'rate-limit reply' };

  it('does not cache GDELT rate-limit text sent with HTTP 200', async () => {
    const fetch = stub(
      () => new Response('Please limit requests to one every 5 seconds', { status: 200 }),
      () => new Response('{"articles":[]}', { status: 200 }),
    );
    const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=x';
    const first = await fetchFromProvider('gdelt', url, { asText: true, rejectBody: gdeltText });
    expect(first.ok).toBe(false);
    if (!first.ok) expect(first.reason).toBe('rate_limited');
    expect(store.size).toBe(0);

    // A rate-limit reply opens the breaker at once...
    expect(refusal('gdelt')).toMatch(/backing off/);
    // ...and once it has closed, the real answer is fetched and cached.
    resetHealth();
    const second = await fetchFromProvider<string>('gdelt', url, { asText: true, rejectBody: gdeltText });
    expect(second.ok && second.data).toBe('{"articles":[]}');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('honours Retry-After on a 429 and asks nothing until it has passed', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-25T08:00:00Z'));
    const fetch = stub(() => new Response('slow down', { status: 429, headers: { 'Retry-After': '600' } }));
    const res = await fetchFromProvider('openalex', 'https://api.openalex.org/works?search=a');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toBe('rate_limited');

    vi.setSystemTime(new Date('2026-09-25T08:09:00Z'));
    await fetchFromProvider('openalex', 'https://api.openalex.org/works?search=b');
    expect(fetch).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date('2026-09-25T08:10:30Z'));
    await fetchFromProvider('openalex', 'https://api.openalex.org/works?search=c');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('opens the breaker after two ordinary failures in a row, with growing backoff', async () => {
    const fetch = stub(() => new Response('oops', { status: 500 }));
    await fetchFromProvider('doaj', 'https://doaj.org/api/search/articles/a');
    expect(refusal('doaj')).toBeNull();
    await fetchFromProvider('doaj', 'https://doaj.org/api/search/articles/b');
    expect(refusal('doaj')).toMatch(/backing off for 60s/);
    await fetchFromProvider('doaj', 'https://doaj.org/api/search/articles/c');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(store.size).toBe(0);
  });

  it('stops asking when the provider says its allowance is spent (usage headers, p. 212)', async () => {
    stub(
      () =>
        new Response('{"results":[]}', {
          status: 200,
          headers: { 'X-RateLimit-Remaining-USD': '0', 'X-RateLimit-Reset': '3600' },
        }),
    );
    await fetchFromProvider('openalex', 'https://api.openalex.org/works?search=d');
    expect(refusal('openalex')).toMatch(/allowance is spent/);
  });
});

describe('registry switches (L1023)', () => {
  it('stops a news provider everywhere when its registry row is switched off', async () => {
    const fetch = stub(okJson());
    for (const id of ['newsdata', 'gdelt', 'eia_rss', 'eea_rss'] as const) {
      const row = PROVIDERS[id];
      const was = row.enabled;
      row.enabled = false;
      try {
        const res = await fetchFromProvider(id, `https://example.org/${id}`);
        expect(res.ok).toBe(false);
        if (!res.ok) expect(res.reason).toBe('disabled');
      } finally {
        row.enabled = was;
      }
    }
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('credentials stay out of cache keys and logs', () => {
  it('removes api keys from the URL', () => {
    expect(redactUrl('https://newsdata.io/api/1/latest?apikey=SECRET&q=a')).toBe('https://newsdata.io/api/1/latest?q=a');
    expect(redactUrl('https://api.openalex.org/works?search=a&api_key=K')).toBe('https://api.openalex.org/works?search=a');
  });
});

describe('stale notices (p. 227)', () => {
  it('does not call data stale just because the first visitor after a quiet spell got the old copy', async () => {
    const old = new Date(Date.now() - 1.5 * 24 * HOUR).toUTCString();
    stub(() => new Response('{}', { status: 200, headers: { Date: old } }));
    // Healthy provider, 36 h old for a 24 h interval: Next is refreshing it.
    const res = await fetchFromProvider('world-bank-indicators', 'https://api.worldbank.org/z');
    expect(res.ok && res.stale).toBe(false);
  });
});
