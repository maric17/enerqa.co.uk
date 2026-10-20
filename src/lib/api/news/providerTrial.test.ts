import { beforeEach, expect, it, vi } from 'vitest';
import { fail, ok } from '../core/types';
import { THE_NEWS_API_TOPIC_QUERIES, type NewsItem } from './types';
import { selectHeroStories } from '../../../components/home/firstFoldNews';

vi.mock('./thenewsapi', () => ({ fetchTheNewsApiBasket: vi.fn(), fetchTheNewsApiQuery: vi.fn() }));
vi.mock('./newsdata', () => ({ NEWSDATA_DELAY_HOURS: 12, PAGE_BASKET_SECONDS: 43200,
  basketQuery: (phrases: string[]) => phrases.join(' OR '), fetchNewsdataBasket: vi.fn(), fetchNewsdataQuery: vi.fn() }));
vi.mock('./gdelt', () => ({ fetchGdeltNews: vi.fn(), fetchGdeltQuery: vi.fn() }));
vi.mock('./eiaRss', () => ({ EIA_BASKETS: ['all', 'energy'], fetchEiaNews: vi.fn() }));
vi.mock('./eeaRss', () => ({ EEA_BASKETS: ['all', 'environment'], fetchEeaNews: vi.fn() }));
vi.mock('./storage', () => ({ readNewsStore: vi.fn(), claimNewsRefresh: vi.fn(), finishNewsRefresh: vi.fn() }));
vi.mock('../core/storage', () => ({ storeRecords: vi.fn() }));
import { fetchTheNewsApiBasket, fetchTheNewsApiQuery } from './thenewsapi';
import { fetchNewsdataBasket, fetchNewsdataQuery } from './newsdata';
import { fetchGdeltNews } from './gdelt';
import { fetchEiaNews } from './eiaRss';
import { fetchEeaNews } from './eeaRss';
import { claimNewsRefresh, readNewsStore } from './storage';
import { storeRecords } from '../core/storage';
import { fetchNews, fetchNewsForKeywords, PAGE_NEWS_PROVIDERS, refreshScheduledNews, searchNews } from './index';

function article(provider: NewsItem['provider']): NewsItem {
  const now = new Date().toISOString();
  return { id: provider, provider, title: 'Solar power generation grows', summary: null,
    url: `https://www.eia.gov/todayinenergy/detail.php?id=${provider}`, domain: 'eia.gov', publisher: 'U.S. EIA',
    publishedAt: now, retrievedAt: now, language: 'en', regions: [], rights: 'Metadata', providerLabel: provider,
    accessStatus: 'verified_open', accessCheckedAt: now };
}
const legacyCalls = [fetchNewsdataBasket, fetchNewsdataQuery, fetchGdeltNews, fetchEiaNews, fetchEeaNews];
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(readNewsStore).mockResolvedValue({ available: true, state: {}, items: [article('thenewsapi'), article('newsdata'), article('gdelt'), article('eia_rss')] });
  vi.mocked(claimNewsRefresh).mockResolvedValue({ token: 'lease', state: {} });
  vi.mocked(fetchTheNewsApiBasket).mockResolvedValue(ok('thenewsapi', []));
  vi.mocked(fetchTheNewsApiQuery).mockResolvedValue(ok('thenewsapi', []));
  vi.mocked(storeRecords).mockResolvedValue(true);
});

it('shows only TheNewsAPI on homepage, domain/industry and saved-search reads despite old saved articles', async () => {
  expect(PAGE_NEWS_PROVIDERS).toEqual(['thenewsapi']);
  for (const result of [await fetchNews(), await fetchNewsForKeywords(['solar']), await searchNews('solar')]) {
    expect(result.items.map(item => item.provider)).toEqual(['thenewsapi']);
    expect(result.sources.map(source => source.label)).toEqual(['TheNewsAPI']);
    expect(result.hasDelayedSource).toBe(false);
  }
  for (const call of [...legacyCalls, fetchTheNewsApiBasket, fetchTheNewsApiQuery]) expect(call).not.toHaveBeenCalled();
});

it('prefers a direct energy discovery to a newer fuel-pollution story without losing either article', async () => {
  const solar = { ...article('thenewsapi'), matchedQueries: [THE_NEWS_API_TOPIC_QUERIES.energy],
    publishedAt: new Date(Date.now() - 86400000).toISOString() };
  const pollution = { ...article('thenewsapi'), id: 'pollution', title: 'River fuel pollution spreads',
    url: 'https://www.bbc.co.uk/news/pollution', domain: 'bbc.co.uk', matchedQueries: [THE_NEWS_API_TOPIC_QUERIES.environment] };
  vi.mocked(readNewsStore).mockResolvedValue({ available: true, state: {}, items: [pollution, solar] });
  expect(selectHeroStories([pollution, solar])[1]?.title).toBe(solar.title);
  const domain = await fetchNewsForKeywords(['solar', 'fuel'], 1, { basket: 'energy' });
  expect(domain.items[0].title).toBe(solar.title);
  expect((await fetchNews()).items).toHaveLength(2);
});

it('keeps the trial empty when only legacy articles exist, without activating fallback', async () => {
  vi.mocked(readNewsStore).mockResolvedValue({ available: true, state: {}, items: [article('newsdata'), article('eia_rss')] });
  expect((await fetchNews()).items).toEqual([]);
  vi.mocked(fetchTheNewsApiBasket).mockResolvedValue(fail('thenewsapi', 'unavailable', 'HTTP 401'));
  vi.mocked(fetchTheNewsApiQuery).mockResolvedValue(fail('thenewsapi', 'unavailable', 'HTTP 401'));
  const refreshed = await refreshScheduledNews();
  expect(refreshed.sourcesFailed).toBe(true);
  expect(refreshed.storedItems).toBe(0);
  for (const call of legacyCalls) expect(call).not.toHaveBeenCalled();
});

it('refreshes only TheNewsAPI, checks article access and makes the saved article available to pages', async () => {
  const fresh = article('thenewsapi');
  vi.mocked(fetchTheNewsApiBasket).mockResolvedValue(ok('thenewsapi', [fresh]));
  const check = vi.fn(async (url: string) => ({ status: 'verified_open' as const,
    checkedAt: new Date().toISOString(), evidence: 'Opened', finalUrl: url }));
  expect((await refreshScheduledNews(check, { manual: true })).storedItems).toBe(1);
  expect(fetchTheNewsApiBasket).toHaveBeenCalledTimes(4);
  expect(check).toHaveBeenCalledExactlyOnceWith(fresh.url);
  expect(storeRecords).toHaveBeenCalledWith([expect.objectContaining({ provider: 'thenewsapi' })]);
  for (const call of legacyCalls) expect(call).not.toHaveBeenCalled();
});

it('limits a manual domain preview to four topic requests without sector discovery', async () => {
  const result = await refreshScheduledNews(async url => ({ status: 'verified_open',
    checkedAt: new Date().toISOString(), evidence: 'Opened', finalUrl: url }), { manual: true, topicsOnly: true });
  expect(fetchTheNewsApiBasket).toHaveBeenCalledTimes(4);
  expect(fetchTheNewsApiQuery).not.toHaveBeenCalled();
  expect(result.diagnostics?.scope).toBe('topics');
  for (const call of legacyCalls) expect(call).not.toHaveBeenCalled();
});

it.each([{ topicsOnly: true }, { manual: true, topicsOnly: true, industriesOnly: true }])
('rejects an ambiguous or non-manual topic preview before claiming a lease: %j', async options => {
  await expect(refreshScheduledNews(undefined, options)).rejects.toThrow('manual pull without industry');
  expect(claimNewsRefresh).not.toHaveBeenCalled();
});
