import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ok, fail, type ConnectorResult } from '../core/types';
import type { AccessVerdict } from '../core/accessCheck';
import type { NewsItem, NewsBasketKey } from './types';
import * as storage from '../core/storage';

/**
 * The aggregator with every connector stubbed, so the rules can be checked
 * without a network: provider-scoped failure, official items kept out of
 * "news", the access check on what is shown, and the wider shared pool.
 */

const results: Record<string, ConnectorResult<NewsItem[]>> = {};
const savedItems: NewsItem[] = [];

vi.mock('./storage', () => ({
  readNewsStore: vi.fn(async () => ({ items: savedItems, state: {}, available: true })),
  claimNewsRefresh: vi.fn(), finishNewsRefresh: vi.fn(),
  NEWS_PROVIDERS: ['newsdata', 'gdelt', 'eia_rss', 'eea_rss'],
}));

vi.mock('./newsdata', () => ({
  NEWSDATA_DELAY_HOURS: 12,
  PAGE_BASKET_SECONDS: 43200,
  basketQuery: (phrases: string[]) => phrases.join(' OR '),
  fetchNewsdataBasket: vi.fn(async (key: NewsBasketKey) => results[`newsdata:${key}`] ?? ok('newsdata', [])),
  fetchNewsdataQuery: vi.fn(async (q: string) => results[`query:${q}`] ?? ok('newsdata', [])),
}));
vi.mock('./gdelt', () => ({ fetchGdeltNews: vi.fn(async () => results.gdelt ?? ok('gdelt', [])) }));
vi.mock('./eiaRss', () => ({ EIA_BASKETS: ['all', 'energy', 'business'], fetchEiaNews: vi.fn(async () => results.eia ?? ok('eia_rss', [])) }));
vi.mock('./eeaRss', () => ({ EEA_BASKETS: ['all', 'environment', 'climate'], fetchEeaNews: vi.fn(async () => results.eea ?? ok('eea_rss', [])) }));

import { pullNews as fetchNews, fetchNewsForKeywords, normaliseLanguage, sourcesFailedFor, toTeaser, PAGE_NEWS_PROVIDERS } from './index';
import { NEWS_BASKETS } from './types';

const { gdeltQuery: realGdeltQuery, GDELT_MAX_QUERY: realMax, rejectGdeltBody: realReject } = await vi.importActual<typeof import('./gdelt')>('./gdelt');
const { rejectNewsdataBody: realNewsdataReject, basketQuery: realBasketQuery } = await vi.importActual<typeof import('./newsdata')>('./newsdata');
const { DOMAIN_FEEDS, INDUSTRY_FEEDS } = await import('../../feeds/contextual');

const openCheck = async (url: string): Promise<AccessVerdict> => ({
  status: url.includes('gated') ? 'gated' : 'verified_open',
  checkedAt: '2026-09-25T10:00:00.000Z',
  evidence: 'x',
  finalUrl: url,
});

function news(n: number, over: Partial<NewsItem> = {}): NewsItem {
  const url = over.url ?? `https://www.theguardian.com/environment/2026/sep/${n}`;
  return {
    id: url,
    title: `Climate finance deal agreed ${n}`,
    summary: null,
    url,
    domain: 'theguardian.com',
    publisher: 'The Guardian',
    publishedAt: new Date(Date.now() - n * 60_000).toISOString(),
    language: 'english',
    provider: 'newsdata',
    providerLabel: 'NewsData.io',
    retrievedAt: new Date().toISOString(),
    rights: 'r',
    regions: ['Not Specified'],
    accessStatus: 'verified_open',
    accessCheckedAt: new Date().toISOString(),
    ...over,
  };
}

beforeEach(() => {
  for (const k of Object.keys(results)) delete results[k];
  savedItems.length = 0;
});

describe('provider-scoped failure (homepage flag)', () => {
  it('reports missing configuration and request accounting before filtering', async () => {
    for (const key of ['climate', 'energy', 'environment', 'business']) {
      results[`newsdata:${key}`] = fail('newsdata', 'not_configured', 'NEWSDATA_API_KEY is not set.');
    }
    results.gdelt = fail('gdelt', 'unavailable', 'GDELT: shared request accounting unavailable');
    const pool = await fetchNews('all', 80, { providers: PAGE_NEWS_PROVIDERS, check: openCheck });
    expect(pool.sourcesFailed).toBe(true);
    expect(pool.diagnostics?.providers).toHaveLength(5);
    expect(pool.diagnostics?.providers.find((p) => p.provider === 'gdelt')?.issue).toBe('request_accounting_unavailable');
    expect(pool.diagnostics?.counts.received).toBe(0);
    expect(pool.diagnostics?.counts.accessChecked).toBe(0);
    expect(pool.diagnostics?.storage).toBe('not_attempted');
  });

  it('distinguishes relevance filtering from anonymous access rejections', async () => {
    results['newsdata:climate'] = ok('newsdata', [
      news(1, { title: 'Football team wins the final' }),
      news(2, { url: 'https://www.theguardian.com/gated/2' }),
      news(3),
    ]);
    const pool = await fetchNews('all', 80, { providers: PAGE_NEWS_PROVIDERS, check: openCheck });
    expect(pool.diagnostics?.counts).toEqual({ received: 3, relevant: 2, afterGate: 2, accessChecked: 2, verifiedOpen: 1, returned: 1 });
    expect(pool.diagnostics?.access).toEqual({ gated: 1, verified_open: 1 });
    expect(pool.diagnostics?.storage).toBe('ok');
  });

  it('reports a storage outage when verified articles cannot be recorded', async () => {
    results['newsdata:climate'] = ok('newsdata', [news(1)]);
    const save = vi.spyOn(storage, 'storeRecords').mockResolvedValueOnce(false);
    try {
      const pool = await fetchNews('all', 80, { providers: PAGE_NEWS_PROVIDERS, check: openCheck });
      expect(pool.items).toEqual([]);
      expect(pool.sourcesFailed).toBe(false);
      expect(pool.diagnostics?.counts.verifiedOpen).toBe(1);
      expect(pool.diagnostics?.counts.returned).toBe(0);
      expect(pool.diagnostics?.storage).toBe('failed');
    } finally { save.mockRestore(); }
  });

  it('says "unavailable" for a NewsData+GDELT panel when those two fail, even though EIA answered', async () => {
    results['newsdata:climate'] = fail('newsdata', 'unavailable', 'down');
    results['newsdata:energy'] = fail('newsdata', 'unavailable', 'down');
    results['newsdata:environment'] = fail('newsdata', 'rate_limited', 'busy');
    results['newsdata:business'] = fail('newsdata', 'unavailable', 'down');
    results.gdelt = fail('gdelt', 'rate_limited', 'busy');
    results.eia = ok('eia_rss', [news(1, { provider: 'eia_rss', url: 'https://www.eia.gov/todayinenergy/detail.php?id=1', domain: 'eia.gov', title: 'Electricity prices rise' })]);

    const pool = await fetchNews('all', 10, { check: openCheck });
    expect(pool.sourcesFailed).toBe(false);
    expect(pool.newsSourcesFailed).toBe(true);
    expect(sourcesFailedFor(pool, PAGE_NEWS_PROVIDERS)).toBe(true);

    // Asking only the page providers gives the same answer and skips EIA/EEA.
    const scoped = await fetchNews('all', 10, { providers: PAGE_NEWS_PROVIDERS, check: openCheck });
    expect(scoped.sourcesFailed).toBe(true);
    expect(scoped.providerStatus.eia_rss).toBeUndefined();
  });

  it('treats one answering basket as the provider answering', async () => {
    results['newsdata:climate'] = fail('newsdata', 'unavailable', 'down');
    results['newsdata:energy'] = ok('newsdata', []);
    const pool = await fetchNews('all', 5, { providers: PAGE_NEWS_PROVIDERS, check: openCheck });
    expect(pool.providerStatus.newsdata).toBe('ok');
    expect(pool.sourcesFailed).toBe(false);
  });
});

describe('domain and industry news (L443, L539)', () => {
  it('keeps EIA and EEA official items out of "news"', async () => {
    savedItems.push(news(1, { provider: 'eia_rss', url: 'https://www.eia.gov/todayinenergy/detail.php?id=2', domain: 'eia.gov', title: 'Climate finance and electricity markets' }), news(2));
    const res = await fetchNewsForKeywords(['climate finance'], 3, { check: openCheck });
    expect(res.items.map((i) => i.provider)).toEqual(['newsdata']);
  });

  it('matches a page baskets against the whole shared pool, GDELT included', async () => {
    savedItems.push(news(1), news(2),
      news(3, { provider: 'gdelt', url: 'https://www.reuters.com/a', domain: 'reuters.com', title: 'Climate finance talks resume' }),
    );
    const res = await fetchNewsForKeywords(['climate finance'], 3, { check: openCheck });
    expect(res.items).toHaveLength(3);
  });

  it('uses saved articles for page baskets without sending extra provider queries', async () => {
    savedItems.push(
      news(1, { title: 'Sustainable tourism plan agreed for coastal towns' }),
    );
    const without = await fetchNewsForKeywords(['sustainable tourism'], 3, { check: openCheck });
    expect(without.items).toHaveLength(1);
    const withBaskets = await fetchNewsForKeywords(['sustainable tourism'], 3, {
      check: openCheck,
      baskets: [['sustainable tourism', 'green hotels']],
    });
    expect(withBaskets.items.map((i) => i.title)).toEqual(['Sustainable tourism plan agreed for coastal towns']);
  });

  it('trusts a page basket match made on the full text, for that page only', async () => {
    // NewsData matched "climate change" in the article body; the headline is
    // on the site's subject but does not repeat the phrase.
    savedItems.push(
      news(1, { title: 'Fossil-fuel firms in line for billions in benefits', matchedQueries: ['climate change OR climate policy'] }),
    );
    const own = await fetchNewsForKeywords(['climate change'], 3, { check: openCheck, baskets: [['climate change', 'climate policy']] });
    expect(own.items).toHaveLength(1);
    const other = await fetchNewsForKeywords(['sustainable tourism'], 3, { check: openCheck, baskets: [['sustainable tourism']] });
    expect(other.items).toHaveLength(0);
  });

  it('shows only items whose article passed the access check', async () => {
    savedItems.push(news(1, { url: 'https://www.theguardian.com/gated/1', accessStatus: 'gated' }), news(2), news(3));
    const res = await fetchNewsForKeywords(['climate finance'], 3, { check: openCheck });
    expect(res.items.map((i) => i.url)).not.toContain('https://www.theguardian.com/gated/1');
    expect(res.items).toHaveLength(2);
  });
});

describe('normalisation', () => {
  it('stores one language code whatever the provider said (L946)', () => {
    expect(normaliseLanguage('English')).toBe('en');
    expect(normaliseLanguage('ENGLISH')).toBe('en');
    expect(normaliseLanguage('EN')).toBe('en');
    expect(normaliseLanguage('en-GB')).toBe('en');
  });

  it('trims a long provider description to a short teaser (L372)', () => {
    const long = 'word '.repeat(300);
    const teaser = toTeaser(long)!;
    expect(teaser.length).toBeLessThanOrEqual(201);
    expect(teaser.endsWith('…')).toBe(true);
    expect(toTeaser('Short.')).toBe('Short.');
  });
});

describe('GDELT query and replies (p. 211, L1030)', () => {
  it('keeps every basket query under the length GDELT accepts', () => {
    for (const b of NEWS_BASKETS) expect(realGdeltQuery(b.key).length, b.key).toBeLessThanOrEqual(realMax);
  });

  it('refuses rate-limit and error text, and unreadable JSON', () => {
    expect(realReject('Please limit requests to one every 5 seconds')?.reason).toBe('rate_limited');
    expect(realReject('Your query was too short or too long.')?.reason).toBe('unavailable');
    expect(realReject('{"articles": [bad')?.reason).toBe('unavailable');
    expect(realReject('{"articles": []}')).toBeNull();
  });

  it('keeps every page basket inside the NewsData 100-character cap (p. 210)', () => {
    const baskets = Object.values({ ...DOMAIN_FEEDS, ...INDUSTRY_FEEDS }).flatMap((f) => f.newsBaskets);
    expect(baskets).toHaveLength(38);
    for (const b of baskets) expect(realBasketQuery(b).length).toBeLessThanOrEqual(100);
    expect(realBasketQuery(['climate change', 'NDC'])).toBe('"climate change" OR NDC');
  });

  it('refuses NewsData error payloads sent with HTTP 200', () => {
    expect(realNewsdataReject({ status: 'error', results: { code: 'RateLimitExceeded', message: 'x' } })?.reason).toBe('rate_limited');
    expect(realNewsdataReject({ status: 'success', results: [] })).toBeNull();
  });
});
