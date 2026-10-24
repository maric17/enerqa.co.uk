import { beforeEach, expect, it, vi } from 'vitest';
import { fail, ok } from '../core/types';
import { mapApiTubeResults, fetchApiTubeBasket, fetchApiTubeQuery } from './apitube';
import { screenApiTubeItem } from './apitubeScreening';
import { storeRecords } from '../core/storage';
import { claimNewsRefresh, readNewsStore } from './storage';
import { fetchTheNewsApiBasket, fetchTheNewsApiQuery } from './thenewsapi';
import { fetchNewsdataBasket } from './newsdata';
import { fetchNews, fetchNewsForKeywords, refreshScheduledNews, searchNews, PAGE_NEWS_PROVIDERS } from './index';
import { industryDiscoveryQueries } from './discovery';
import { STOCK_MARKET_QUERIES } from './markets';

const ai = vi.hoisted(() => vi.fn());
vi.mock('openai', () => ({ default: class { responses = { create: ai }; } }));
vi.mock('./apitube', async original => ({ ...await original<typeof import('./apitube')>(), fetchApiTubeBasket: vi.fn(), fetchApiTubeQuery: vi.fn() }));
vi.mock('./thenewsapi', () => ({ fetchTheNewsApiBasket: vi.fn(), fetchTheNewsApiQuery: vi.fn() }));
vi.mock('./newsdata', async original => ({ ...await original<typeof import('./newsdata')>(), fetchNewsdataBasket: vi.fn() }));
vi.mock('./storage', () => ({ readNewsStore: vi.fn(), claimNewsRefresh: vi.fn(), finishNewsRefresh: vi.fn() }));
vi.mock('../core/storage', () => ({ storeRecords: vi.fn(), reserveRequest: vi.fn() }));

function article() {
  return mapApiTubeResults([{ id: 'solar', title: 'Solar power expands at steel factory', description: 'Renewable electricity cuts industrial emissions.',
    href: 'https://www.theguardian.com/environment/solar', published_at: new Date().toISOString(), language: 'en',
    categories: [{ id: 'medtop:20000257', name: 'renewable energy' }, { id: 'medtop:06000000', name: 'environment' }] }], new Date().toISOString())[0];
}
const check = vi.fn(async (url: string) => ({ status: 'verified_open' as const, checkedAt: new Date().toISOString(), evidence: 'Opened', finalUrl: url }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(readNewsStore).mockResolvedValue({ available: true, state: {}, items: [] });
  vi.mocked(claimNewsRefresh).mockResolvedValue({ token: 'trial-lease', state: {} });
  vi.mocked(fetchApiTubeBasket).mockResolvedValue(ok('apitube', []));
  vi.mocked(fetchApiTubeQuery).mockResolvedValue(ok('apitube', []));
  vi.mocked(storeRecords).mockResolvedValue(true);
});

it('saves checked APITube originals before any homepage, domain, industry or search can show them', async () => {
  expect(PAGE_NEWS_PROVIDERS).toEqual(['apitube']);
  vi.mocked(fetchApiTubeBasket).mockResolvedValue(ok('apitube', [article()]));
  const result = await refreshScheduledNews(check, { manual: true, topicsOnly: true });
  expect(result.storedItems).toBe(1); expect(check).toHaveBeenCalledExactlyOnceWith(article().url);
  const rows = vi.mocked(storeRecords).mock.calls[0][0];
  expect(rows).toEqual([expect.objectContaining({ provider: 'apitube', accessStatus: 'verified_open', record: expect.objectContaining({
    provider: 'apitube', editorialReview: expect.objectContaining({ method: 'apitube-categories-and-rules-v1', decision: 'approved' }),
  }) })]);
  // Pages still see nothing until a database read returns the saved record.
  expect((await fetchNews()).items).toEqual([]);
  const saved = rows[0].record as ReturnType<typeof article>;
  vi.mocked(readNewsStore).mockResolvedValue({ available: true, state: {}, items: [saved,
    { ...saved, provider: 'thenewsapi' }, { ...saved, provider: 'newsdata' }] });
  for (const feed of [await fetchNews(), await fetchNewsForKeywords(['solar']), await fetchNewsForKeywords(['steel']), await searchNews('solar')]) {
    expect(feed.items.map(item => item.provider)).toEqual(['apitube']);
    expect(feed.sources.map(source => source.label)).toEqual(['APITube']);
  }
  expect(fetchApiTubeBasket).toHaveBeenCalledTimes(4);
  expect(fetchApiTubeQuery).not.toHaveBeenCalled();
  expect(fetchTheNewsApiBasket).not.toHaveBeenCalled(); expect(fetchTheNewsApiQuery).not.toHaveBeenCalled();
  expect(fetchNewsdataBasket).not.toHaveBeenCalled(); expect(ai).not.toHaveBeenCalled();
});

it('withholds records when database storage fails', async () => {
  vi.mocked(fetchApiTubeBasket).mockResolvedValue(ok('apitube', [article()]));
  vi.mocked(storeRecords).mockResolvedValue(false);
  const result = await refreshScheduledNews(check, { manual: true, topicsOnly: true });
  expect(result.storedItems).toBe(0); expect(result.sourcesFailed).toBe(true);
  expect((await fetchNews()).items).toEqual([]);
});

it('covers domains through four category calls and avoids twelve redundant legacy searches', async () => {
  await refreshScheduledNews(check, { manual: true });
  expect(fetchApiTubeBasket).toHaveBeenCalledTimes(4);
  expect(vi.mocked(fetchApiTubeQuery).mock.calls.map(([query]) => query).sort()).toEqual([
    ...new Set([...STOCK_MARKET_QUERIES, ...industryDiscoveryQueries()]),
  ].sort());
  expect(vi.mocked(fetchApiTubeQuery).mock.calls.length).toBeLessThanOrEqual(8);
});

it('uses saved domain classifications when a corporate environmental story does not spell out ESG', async () => {
  const saved = screenApiTubeItem({ ...article(), title: 'Corporate lobbyists seek to dilute deforestation law',
    summary: 'Companies challenge environmental obligations.', accessStatus: 'verified_open', accessCheckedAt: new Date().toISOString(),
    providerCategories: [{ id: 'medtop:06000000', name: 'environment', score: 1 }] });
  vi.mocked(readNewsStore).mockResolvedValue({ available: true, state: {}, items: [saved] });
  expect((await fetchNewsForKeywords(['ESG', 'green bond'], 3, { basket: 'business' })).items.map(item => item.title)).toEqual([saved.title]);
  expect(fetchApiTubeBasket).not.toHaveBeenCalled(); expect(fetchApiTubeQuery).not.toHaveBeenCalled();
});

it('keeps an APITube outage empty without fetching from another news API', async () => {
  const legacy = { ...screenApiTubeItem(article()), provider: 'thenewsapi' as const, accessStatus: 'verified_open' as const, accessCheckedAt: new Date().toISOString() };
  vi.mocked(readNewsStore).mockResolvedValue({ available: true, state: {}, items: [legacy] });
  vi.mocked(fetchApiTubeBasket).mockResolvedValue(fail('apitube', 'unavailable', 'HTTP 401'));
  expect((await refreshScheduledNews(check, { manual: true, topicsOnly: true })).sourcesFailed).toBe(true);
  expect((await fetchNews()).items).toEqual([]); expect(check).not.toHaveBeenCalled();
  expect(fetchTheNewsApiBasket).not.toHaveBeenCalled(); expect(fetchNewsdataBasket).not.toHaveBeenCalled();
});
