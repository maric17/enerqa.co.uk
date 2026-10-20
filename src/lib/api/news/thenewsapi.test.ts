import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFromProvider, providerKey, redactUrl } from '../core/fetch';
import { ok } from '../core/types';
import { STOCK_MARKET_QUERIES } from './markets';
import { SOURCE_ALLOWLIST } from './types';
import { fetchTheNewsApiBasket, fetchTheNewsApiQuery, mapTheNewsApiResults, rejectTheNewsApiBody, theNewsApiQuery } from './thenewsapi';

// Mock transport only so request construction and article mapping run for real.
vi.mock('../core/fetch', async original => ({
  ...await original<typeof import('../core/fetch')>(), fetchFromProvider: vi.fn(), providerKey: vi.fn(),
}));
beforeEach(() => {
  vi.mocked(providerKey).mockReturnValue('private-test-token');
  vi.mocked(fetchFromProvider).mockReset().mockResolvedValue(ok('thenewsapi', { data: [] }));
});

describe('TheNewsAPI connector', () => {
  it('reserves stock-search results for matching headlines rather than incidental descriptions', async () => {
    // The three-result allowance should contain candidates the stock panel can use.
    await fetchTheNewsApiQuery(STOCK_MARKET_QUERIES[0], 28800, true);
    const url = new URL(vi.mocked(fetchFromProvider).mock.calls[0][1]);
    expect(url.searchParams.get('search_fields')).toBe('title');
  });
  it('uses a wider dated window only for the less frequent business topic', async () => {
    await fetchTheNewsApiBasket('business', true);
    let url = new URL(vi.mocked(fetchFromProvider).mock.calls.at(-1)![1]);
    expect(url.searchParams.get('published_after')).toBe(new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10));
    await fetchTheNewsApiBasket('energy', true);
    url = new URL(vi.mocked(fetchFromProvider).mock.calls.at(-1)![1]);
    expect(url.searchParams.get('published_after')).toBe(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  });
  it('can search an explicitly wider dated window without increasing the plan limit', async () => {
    await fetchTheNewsApiQuery('"climate finance"', 28800, true, ['en'], { days: 30 });
    const url = new URL(vi.mocked(fetchFromProvider).mock.calls[0][1]);
    expect(url.searchParams.get('published_after')).toBe(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
    expect(url.searchParams.has('limit')).toBe(false);
  });
  it('uses the existing server token, approved publishers and plan maximum without requesting paid features', async () => {
    await fetchTheNewsApiQuery('climate OR "carbon market"', 28800, true);
    const [provider, request, options] = vi.mocked(fetchFromProvider).mock.calls[0];
    const url = new URL(request);
    expect(provider).toBe('thenewsapi');
    expect(url.pathname).toBe('/v1/news/all');
    expect(url.searchParams.get('api_token')).toBe('private-test-token');
    expect(url.searchParams.get('search')).toBe('climate | "carbon market"');
    expect(url.searchParams.get('search_fields')).toBe('title,description');
    expect(url.searchParams.get('domains')).toBe(SOURCE_ALLOWLIST.join(','));
    expect(url.searchParams.has('limit')).toBe(false);
    expect(url.searchParams.get('published_after')).toBe(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
    expect(options?.fresh).toBe(true);
    expect(redactUrl(request)).not.toContain('private-test-token');
    expect(theNewsApiQuery('("energy" OR "OR") AND solar')).toBe('("energy" | "OR") + solar');
  });

  it('stops before a request when the token is missing', async () => {
    vi.mocked(providerKey).mockReturnValue(null);
    expect(await fetchTheNewsApiQuery('climate')).toMatchObject({ ok: false, reason: 'not_configured' });
    expect(fetchFromProvider).not.toHaveBeenCalled();
  });

  it('maps supplied metadata and validates dates, destinations and images independently of source claims', () => {
    const article = { uuid: 'original-id', title: ' Solar generation grows ',
      url: 'https://www.eia.gov/todayinenergy/detail.php?id=123', source: 'wrong.example',
      published_at: '2026-10-16T14:00:00.000000Z', language: 'en', image_url: 'javascript:alert(1)',
      description: ' Publisher description ', snippet: 'Do not copy article text' };
    const [item] = mapTheNewsApiResults([null, {}, article], '2026-10-19T00:00:00Z');
    expect(item).toMatchObject({ provider: 'thenewsapi', providerLabel: 'TheNewsAPI', sourceId: 'original-id',
      domain: 'eia.gov', summary: 'Publisher description', imageUrl: null, publishedAt: '2026-10-16T14:00:00.000Z' });
    expect(mapTheNewsApiResults([{ ...article, description: null, published_at: 'invalid' }], '')[0])
      .toMatchObject({ summary: null, publishedAt: null });
  });

  it('rejects unusable payloads and hides raw provider errors', () => {
    expect(rejectTheNewsApiBody({ data: [] })).toBeNull();
    expect(rejectTheNewsApiBody({ data: {} })?.reason).toBe('unavailable');
    const rejected = rejectTheNewsApiBody({ error: { code: 'usage_limit_reached', message: 'private-test-token' } });
    expect(rejected?.reason).toBe('rate_limited');
    expect(JSON.stringify(rejected)).not.toContain('private-test-token');
  });
});
