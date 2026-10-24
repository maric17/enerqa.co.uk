import { beforeEach, expect, it, vi } from 'vitest';
import { fail, ok } from '../core/types';
import { mapApiTubeResults, fetchApiTubeBasket, fetchApiTubeQuery } from './apitube';
import { screenApiTubeItem } from './apitubeScreening';
import { storeRecords } from '../core/storage';
import { claimNewsRefresh, finishNewsRefresh, readNewsStore } from './storage';
import { fetchTheNewsApiBasket, fetchTheNewsApiQuery } from './thenewsapi';
import { fetchNewsdataBasket } from './newsdata';
import { fetchNews, fetchNewsForKeywords, refreshScheduledNews, searchNews, PAGE_NEWS_PROVIDERS } from './index';
import { industryDiscoveryQueries, industryRefreshSlugs } from './discovery';
import { STOCK_MARKET_QUERIES } from './markets';
import { INDUSTRY_FEEDS, newsPhrases } from '../../feeds/contextual';
import { newsIntelligence } from '../../feeds/intelligenceIndex';

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

it('saves screened market commentary and reads it without another provider or AI request', async () => {
  const headlines = ['Sharp drops for AI stocks overwhelm markets worldwide as oil prices jump',
    'Chip stocks slide after Broadcom boss likens AI investing to a casino'];
  const template = article();
  const candidates = headlines.map((title, index) => ({ ...template, id: `market-${index}`, title,
    url: `https://www.theguardian.com/business/market-${index}`, summary: 'Technology share prices fall.',
    providerCategories: [{ id: 'medtop:04000000', name: 'economy, business and finance', score: 2 }] }));
  vi.mocked(fetchApiTubeQuery).mockResolvedValueOnce(ok('apitube', candidates));
  expect((await refreshScheduledNews(check, { manual: true, marketsOnly: true })).storedItems).toBe(2);
  const rows = vi.mocked(storeRecords).mock.calls.flatMap(([records]) => records);
  expect(rows).toHaveLength(2);
  expect(rows.every(row => row.accessStatus === 'verified_open')).toBe(true);
  // A completed API request alone cannot publish a card; the saved read supplies it.
  expect((await fetchNews('all', 2, { stockMarkets: true })).items).toEqual([]);
  vi.mocked(readNewsStore).mockResolvedValue({ available: true, state: {}, items: rows.map(row => row.record as ReturnType<typeof article>) });
  expect((await fetchNews('all', 2, { stockMarkets: true })).items.map(item => item.title)).toEqual(headlines);
  expect(fetchApiTubeBasket).not.toHaveBeenCalled();
  expect(fetchApiTubeQuery).toHaveBeenCalledTimes(3);
  expect(fetchTheNewsApiQuery).not.toHaveBeenCalled(); expect(fetchNewsdataBasket).not.toHaveBeenCalled();
  expect(ai).not.toHaveBeenCalled();
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

it('shows saved government policy stories without exact basket wording or another API call', async () => {
  const slug = 'government-regulators-public-institutions';
  const feed = INDUSTRY_FEEDS[slug];
  const template = article();
  const inputs = [
    ['Prime minister vows to meet net zero target', 'The government approved a gasfield while maintaining its climate commitment.'],
    ['Corporate lobbyists seek to dilute EU deforestation law', 'Businesses challenge environmental obligations.'],
    ['Calls for inquiry into health impacts of air pollution', 'The government is urged to hold an inquiry into unequal exposure.'],
    ['Company sets net zero target for its offices', 'The company announced a voluntary emissions target.'],
    ['Minister visits air pollution art installation', 'The exhibition explores environmental damage through sculpture.'],
  ];
  const saved = inputs.map(([title, summary], index) => screenApiTubeItem({ ...template,
    id: `policy-${index}`, url: `https://www.theguardian.com/policy-${index}`, title, summary,
    accessStatus: 'verified_open', accessCheckedAt: new Date().toISOString(),
    providerCategories: [{ id: 'medtop:06000000', name: 'environment', score: 2 }] }));
  vi.mocked(readNewsStore).mockResolvedValue({ available: true, state: {}, items: saved });
  // Reproduce the old empty page, then exercise the same context used by the real hero.
  expect((await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets })).items).toEqual([]);
  const result = await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets, contextRules: feed.newsContextRules });
  expect(result.items.map(item => item.title)).toEqual(inputs.slice(0, 3).map(([title]) => title));
  expect(saved.filter(item => newsIntelligence(item).industries.includes(slug)).map(item => item.title))
    .toEqual(inputs.slice(0, 3).map(([title]) => title));
  expect(fetchApiTubeBasket).not.toHaveBeenCalled(); expect(fetchApiTubeQuery).not.toHaveBeenCalled();
  expect(fetchTheNewsApiQuery).not.toHaveBeenCalled(); expect(ai).not.toHaveBeenCalled();
});

it('discovers coastal tourism impacts, saves checked originals and shares the result with the industry news index', async () => {
  const slug = 'tourism-hospitality-destinations';
  const feed = INDUSTRY_FEEDS[slug];
  const candidate = { ...article(), title: 'Tourism development threatens turtle nests',
    summary: 'Resort development affects coral reefs and coastal communities.',
    providerCategories: [{ id: 'medtop:06000000', name: 'environment', score: 2 }] };
  vi.mocked(fetchApiTubeQuery).mockResolvedValueOnce(ok('apitube', [candidate]));
  expect((await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets })).items).toEqual([]);
  expect((await refreshScheduledNews(check, { manual: true, industriesOnly: true, industrySlugs: [slug] })).storedItems).toBe(1);
  expect(fetchApiTubeQuery).toHaveBeenCalledExactlyOnceWith(feed.newsDiscoveryQuery, expect.any(Number), true, ['en'], { days: 31 });
  const rows = vi.mocked(storeRecords).mock.calls.flatMap(([records]) => records);
  expect(rows).toHaveLength(1);
  const saved = rows[0].record as ReturnType<typeof article>;
  expect(saved.accessStatus).toBe('verified_open');
  expect(saved.editorialReview?.topics).toEqual(['environment']);
  vi.mocked(readNewsStore).mockResolvedValue({ available: true, state: {}, items: [saved] });
  expect((await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets })).items.map(item => item.title)).toEqual([candidate.title]);
  expect(newsIntelligence(saved).industries).toContain(slug);
  expect(fetchApiTubeQuery).toHaveBeenCalledTimes(1);
  expect(fetchApiTubeBasket).not.toHaveBeenCalled();
  expect(fetchTheNewsApiQuery).not.toHaveBeenCalled(); expect(fetchNewsdataBasket).not.toHaveBeenCalled();
  expect(ai).not.toHaveBeenCalled();
});

it('rejects incidental university coverage before storing a targeted estates pull', async () => {
  const slug = 'healthcare-education-institutional-estates';
  const feed = INDUSTRY_FEEDS[slug];
  const candidates = [
    { ...article(), title: 'Hospital signs renewable energy supply deal', summary: 'Power supply supports the medical center.' },
    { ...article(), id: 'appointment', url: 'https://www.theguardian.com/appointment', title: 'University appoints oil and gas heir as professor',
      summary: 'The professor will teach renewable energy research.' },
  ];
  vi.mocked(fetchApiTubeQuery).mockResolvedValueOnce(ok('apitube', candidates));
  expect((await refreshScheduledNews(check, { manual: true, industriesOnly: true, industrySlugs: [slug] })).storedItems).toBe(1);
  const records = vi.mocked(storeRecords).mock.calls.flatMap(([rows]) => rows);
  expect(records).toHaveLength(1);
  const saved = records[0].record as ReturnType<typeof article>;
  expect(saved.editorialReview?.industries).toContain(slug);
  vi.mocked(readNewsStore).mockResolvedValue({ available: true, state: {}, items: [saved] });
  expect((await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets, sectorRules: feed.newsSectorRules })).items).toHaveLength(1);
  expect(newsIntelligence(candidates[1]).industries).not.toContain(slug);
  expect(ai).not.toHaveBeenCalled();
});

it('does not save a sector candidate whose only relevance evidence is outside the licensed teaser', async () => {
  vi.mocked(fetchApiTubeQuery).mockResolvedValueOnce(ok('apitube', [{ ...article(), title: 'Hospital expands its estate',
    summary: `${'General institutional update. '.repeat(12)}The project uses renewable energy and electricity.` }]));
  const result = await refreshScheduledNews(check, { manual: true, industriesOnly: true,
    industrySlugs: ['healthcare-education-institutional-estates'] });
  expect(result.storedItems).toBe(0);
  expect(check).not.toHaveBeenCalled();
  expect(vi.mocked(storeRecords).mock.calls.flatMap(([records]) => records)).toHaveLength(0);
});

it('runs scheduled general news without spending stock or industry queries', async () => {
  const result = await refreshScheduledNews(check, { job: 'general' });
  expect(result.sourcesFailed).toBe(false);
  expect(fetchApiTubeBasket).toHaveBeenCalledTimes(4);
  expect(fetchApiTubeQuery).not.toHaveBeenCalled();
  expect(result.diagnostics?.job).toBe('general');
  expect(finishNewsRefresh).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ status: 'succeeded' }));
});

it.each([1, 2, 3] as const)('runs scheduled industry batch %i without topic or stock calls', async batch => {
  const result = await refreshScheduledNews(check, { job: `industries-${batch}` });
  expect(result.sourcesFailed).toBe(false);
  expect(fetchApiTubeBasket).not.toHaveBeenCalled();
  expect(vi.mocked(fetchApiTubeQuery).mock.calls.map(([query]) => query))
    .toEqual(industryRefreshSlugs(batch).map(slug => INDUSTRY_FEEDS[slug].newsDiscoveryQuery));
  expect(fetchTheNewsApiQuery).not.toHaveBeenCalled();
  expect(fetchNewsdataBasket).not.toHaveBeenCalled();
  expect(ai).not.toHaveBeenCalled();
});

it('runs scheduled stocks independently and rejects a relevant-energy story without stock reporting', async () => {
  const market = { ...article(), title: 'Global stocks fall as oil prices rise', summary: 'Equities drop on global exchanges.',
    providerCategories: [{ id: 'medtop:04000000', name: 'economy, business and finance', score: 1 }] };
  vi.mocked(fetchApiTubeQuery).mockResolvedValueOnce(ok('apitube', [market, { ...article(), id: 'nonmarket',
    url: 'https://www.theguardian.com/nonmarket' }]));
  const result = await refreshScheduledNews(check, { job: 'stocks' });
  expect(result.sourcesFailed).toBe(false);
  expect(fetchApiTubeBasket).not.toHaveBeenCalled();
  expect(vi.mocked(fetchApiTubeQuery).mock.calls.map(([query]) => query)).toEqual(STOCK_MARKET_QUERIES);
  const records = vi.mocked(storeRecords).mock.calls.flatMap(([rows]) => rows);
  expect(records).toHaveLength(1);
  expect((records[0].record as ReturnType<typeof article>).title).toBe(market.title);
  expect(ai).not.toHaveBeenCalled();
});

it('reports a partially failed stock job and retrying stocks does not fetch general or industry news', async () => {
  const previousSuccess = '2026-10-23T06:00:00.000Z';
  vi.mocked(claimNewsRefresh).mockResolvedValue({ token: 'stock-lease', job: 'stocks',
    state: { lastSuccessAt: { apitube: previousSuccess } } });
  vi.mocked(fetchApiTubeQuery).mockResolvedValueOnce(ok('apitube', []))
    .mockResolvedValueOnce(fail('apitube', 'unavailable', 'HTTP 503'))
    .mockResolvedValueOnce(ok('apitube', []));
  expect((await refreshScheduledNews(check, { job: 'stocks' })).sourcesFailed).toBe(true);
  expect(finishNewsRefresh).toHaveBeenLastCalledWith(expect.objectContaining({ job: 'stocks' }),
    expect.objectContaining({ status: 'failed', lastSuccessAt: { apitube: previousSuccess } }));
  vi.mocked(fetchApiTubeQuery).mockClear();
  expect((await refreshScheduledNews(check, { job: 'stocks' })).sourcesFailed).toBe(false);
  expect(vi.mocked(fetchApiTubeQuery).mock.calls.map(([query]) => query)).toEqual(STOCK_MARKET_QUERIES);
  expect(fetchApiTubeBasket).not.toHaveBeenCalled();
  expect(finishNewsRefresh).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ status: 'succeeded' }));
});

it('keeps stock health and refresh time separate from healthy general news', async () => {
  const now = new Date().toISOString();
  const old = '2026-10-23T06:00:00.000Z';
  const stock = screenApiTubeItem({ ...article(), title: 'Global stocks fall as oil prices rise',
    summary: 'Equities drop on global exchanges.', accessStatus: 'verified_open', accessCheckedAt: now,
    providerCategories: [{ id: 'medtop:04000000', name: 'economy, business and finance', score: 1 }] });
  const solar = { ...screenApiTubeItem(article()), id: 'solar', url: 'https://www.theguardian.com/solar',
    accessStatus: 'verified_open' as const, accessCheckedAt: now };
  vi.mocked(readNewsStore).mockResolvedValue({ available: true, items: [stock, solar], state: {
    lastSuccessAt: { apitube: now }, jobs: {
      general: { status: 'succeeded', lastSuccessAt: { apitube: now } },
      stocks: { status: 'failed', lastSuccessAt: { apitube: old } },
    },
  } });
  const market = await fetchNews('all', 3, { stockMarkets: true });
  expect(market.items).toHaveLength(1);
  expect(market.items[0].feedRefreshedAt).toBe(old);
  expect(market.items[0].refreshFailed).toBe(true);
  const general = await fetchNews('energy', 3);
  expect(general.items.every(item => !item.refreshFailed && item.feedRefreshedAt === now)).toBe(true);
  expect(fetchApiTubeQuery).not.toHaveBeenCalled();
});

it('rejects mixed fixed-job and manual scopes before claiming a lease', async () => {
  await expect(refreshScheduledNews(check, { job: 'stocks', topicsOnly: true })).rejects.toThrow('one fixed news job');
  expect(claimNewsRefresh).not.toHaveBeenCalled();
});
