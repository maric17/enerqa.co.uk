import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fail, ok } from '../core/types';
import type { NewsItem } from './types';

// Keep the legacy connector contract covered independently of the client trial.
vi.mock('./policy', () => ({
  PAGE_NEWS_PROVIDERS: ['newsdata', 'gdelt'],
  DEFAULT_NEWS_PROVIDERS: ['newsdata', 'gdelt', 'eia_rss', 'eea_rss'],
  REFRESH_NEWS_PROVIDERS: ['newsdata', 'gdelt', 'eia_rss', 'eea_rss'],
}));

vi.mock('./newsdata', () => ({
  NEWSDATA_DELAY_HOURS: 12, PAGE_BASKET_SECONDS: 43200,
  basketQuery: (phrases: string[]) => phrases.join(' OR '),
  fetchNewsdataBasket: vi.fn(), fetchNewsdataQuery: vi.fn(),
}));
vi.mock('./gdelt', () => ({ fetchGdeltNews: vi.fn() }));
vi.mock('./eiaRss', () => ({ EIA_BASKETS: ['all', 'energy', 'business'], fetchEiaNews: vi.fn() }));
vi.mock('./eeaRss', () => ({ EEA_BASKETS: ['all', 'environment', 'climate'], fetchEeaNews: vi.fn() }));
vi.mock('./storage', () => ({
  readNewsStore: vi.fn(), claimNewsRefresh: vi.fn(), finishNewsRefresh: vi.fn(),
  NEWS_PROVIDERS: ['newsdata', 'gdelt', 'eia_rss', 'eea_rss'],
}));
vi.mock('../core/storage', () => ({ storeRecords: vi.fn() }));

import { fetchNewsdataBasket, fetchNewsdataQuery } from './newsdata';
import { fetchGdeltNews } from './gdelt';
import { fetchEiaNews } from './eiaRss';
import { fetchEeaNews } from './eeaRss';
import { storeRecords } from '../core/storage';
import { claimNewsRefresh, finishNewsRefresh, readNewsStore } from './storage';
import { fetchLiveNews, fetchNews, fetchNewsForKeywords, fetchOfficialNews, PAGE_NEWS_PROVIDERS, refreshScheduledNews, searchNews } from './index';
import { createNewsDiagnostics } from './diagnostics';
import { NEWS_CRON_SCHEDULES, NEWS_REFRESH_SECONDS, newsScheduleSlot } from './schedule';
import { DOMAIN_FEEDS, INDUSTRY_FEEDS, newsPhrases } from '../../feeds/contextual';
import { LIMITS } from '../core/health';
import { basketQuery } from './newsdata';
import { industryDiscoveryQueries } from './discovery';

function article(id: string, provider: NewsItem['provider'] = 'newsdata'): NewsItem {
  const domain = provider === 'eia_rss' ? 'eia.gov' : 'theguardian.com';
  const url = `https://${domain}/${id}`;
  return { id: url, title: `Climate finance and electricity prices ${id}`, summary: null, url,
    domain, publisher: domain, publishedAt: new Date().toISOString(), language: 'en', provider,
    providerLabel: provider, retrievedAt: new Date(Date.now() - 86400000).toISOString(),
    rights: 'Permitted metadata', regions: ['Europe'], accessStatus: 'verified_open', accessCheckedAt: new Date().toISOString() };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(readNewsStore).mockResolvedValue({ items: [], state: {}, available: true });
  vi.mocked(claimNewsRefresh).mockResolvedValue({ token: 'fixture', state: {} });
  vi.mocked(storeRecords).mockResolvedValue(true);
  vi.mocked(fetchNewsdataBasket).mockResolvedValue(ok('newsdata', []));
  vi.mocked(fetchNewsdataQuery).mockResolvedValue(ok('newsdata', []));
  vi.mocked(fetchGdeltNews).mockResolvedValue(ok('gdelt', []));
  vi.mocked(fetchEiaNews).mockResolvedValue(ok('eia_rss', []));
  vi.mocked(fetchEeaNews).mockResolvedValue(ok('eea_rss', []));
});
afterEach(() => vi.restoreAllMocks());

describe('database-backed news reads', () => {
  it('uses saved articles on ordinary public news reads without provider or destination requests', async () => {
    const destinationCheck = vi.fn();
    vi.mocked(readNewsStore).mockResolvedValue({ items: [article('1'), article('2', 'eia_rss')], state: {}, available: true });
    expect((await fetchNews('all', 80, { check: destinationCheck })).items).toHaveLength(2);
    expect((await fetchNewsForKeywords(['climate finance'], 4, { check: destinationCheck, baskets: [['climate finance']] })).items).toHaveLength(1);
    expect((await searchNews('electricity', 'all')).items).toHaveLength(2);
    expect((await fetchOfficialNews('eia_rss', 'energy')).items).toHaveLength(1);
    for (const call of [fetchNewsdataBasket, fetchNewsdataQuery, fetchGdeltNews, fetchEiaNews, fetchEeaNews, destinationCheck, storeRecords]) expect(call).not.toHaveBeenCalled();
  });

  it('saves interactive discoveries without erasing existing page-query evidence', async () => {
    const saved = { ...article('shared'), matchedQueries: ['old-domain-query'] };
    vi.mocked(readNewsStore).mockResolvedValue({ items: [saved], state: {}, available: true });
    vi.mocked(fetchNewsdataQuery).mockResolvedValue(ok('newsdata', [{ ...saved, matchedQueries: ['new-search'] }]));
    const result = await fetchLiveNews({ query: 'new-search', gdeltQuery: '', providers: ['newsdata'],
      check: async url => ({ status: 'verified_open', checkedAt: new Date().toISOString(), evidence: 'Opened.', finalUrl: url }),
    });
    expect(fetchNewsdataQuery).toHaveBeenCalledWith('new-search', NEWS_REFRESH_SECONDS, true, undefined);
    expect(result.items[0].matchedQueries).toEqual(['old-domain-query', 'new-search']);
    expect(storeRecords).toHaveBeenCalledWith([expect.objectContaining({ record: expect.objectContaining({ matchedQueries: ['old-domain-query', 'new-search'] }) })]);
    expect(claimNewsRefresh).not.toHaveBeenCalled();
  });

  it.each([
    ['energy-systems-transition', 'Solar traffic controller wins design award'],
    ['environment-nature-circularity', 'Air pollution falls as waste recycling improves'],
    ['environment-nature-circularity', 'Tourism project threatens turtle nesting sites'],
    ['sustainable-business-esg-finance', 'Company wins sustainability award'],
    ['sustainable-business-esg-finance', 'Africa faces failed adaptation as climate finance falls billions short'],
    ['climate-action-carbon-management', 'Emissions rules challenged in court'],
  ])('selects relevant saved vocabulary on %s without a new provider request', async (slug, title) => {
    const saved = { ...article('related'), title, matchedQueries: [] };
    vi.mocked(readNewsStore).mockResolvedValue({ items: [saved], state: {}, available: true });
    const feed = DOMAIN_FEEDS[slug];
    expect((await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets })).items).toEqual([
      expect.objectContaining({ id: saved.id, title }),
    ]);
    expect(fetchNewsdataBasket).not.toHaveBeenCalled();
    expect(fetchNewsdataQuery).not.toHaveBeenCalled();
  });

  it('keeps unrelated headlines, unknown access and official commentary out of domain news', async () => {
    const unrelated = { ...article('actor'), title: 'Actor talks about feeling powerless', summary: 'A passing mention of solar and electricity.' };
    const unknown = { ...article('unknown'), title: 'Solar power output rises', accessStatus: 'unknown' as const };
    const official = { ...article('official', 'eia_rss'), title: 'Solar power output rises' };
    vi.mocked(readNewsStore).mockResolvedValue({ items: [unrelated, unknown, official], state: {}, available: true });
    const feed = DOMAIN_FEEDS['energy-systems-transition'];
    expect((await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets })).items).toHaveLength(0);
  });

  it.each([
    ['government-regulators-public-institutions', 'Government tightens emissions rules'],
    ['financial-institutions-investors-development-finance', 'Green bonds finance solar projects'],
    ['energy-utilities', 'Solar traffic controller wins design award'],
    ['oil-gas-petrochemicals', 'UK diesel supplies face disruption'],
    ['industry-manufacturing-materials', 'Steel factories cut carbon emissions'],
    ['industry-manufacturing-materials', 'Electricity costs put UK steelmakers in worst position in three years against EU rivals'],
    ['infrastructure-real-estate-industrial-zones', 'Apartments share rooftop solar power'],
    ['transport-logistics-mobility', 'UK motorists can now see live fuel prices'],
    ['water-waste-circular-economy', 'Water pollution threatens river wildlife'],
    ['agriculture-food-aquaculture', 'Is local food better for the environment?'],
    ['mining-natural-resources', 'Copper mining threatens biodiversity'],
    ['tourism-hospitality-destinations', 'Hotels cut electricity use'],
    ['tourism-hospitality-destinations', 'Tourism project threatens turtle nesting sites'],
    ['technology-telecoms-data-infrastructure', 'Datacenter discharged pollution without permits'],
    ['healthcare-education-institutional-estates', 'Hospital reduces energy costs'],
  ])('selects saved sector news on %s without spending provider credits', async (slug, title) => {
    const saved = { ...article('sector'), title, matchedQueries: ['broad-topic'] };
    vi.mocked(readNewsStore).mockResolvedValue({ items: [saved], state: {}, available: true });
    const feed = INDUSTRY_FEEDS[slug];
    expect((await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets })).items).toEqual([
      expect.objectContaining({ id: saved.id, title }),
    ]);
    for (const call of [fetchNewsdataBasket, fetchNewsdataQuery, fetchGdeltNews, fetchEiaNews, fetchEeaNews, storeRecords]) {
      expect(call).not.toHaveBeenCalled();
    }
  });

  it('does not mistake the name Steele for steel manufacturing', async () => {
    const saved = { ...article('politics'), title: 'Climate policy divides political parties',
      summary: 'Senator Jordan Steele-Johns discussed the policy.' };
    vi.mocked(readNewsStore).mockResolvedValue({ available: true, state: {}, items: [saved] });
    const feed = INDUSTRY_FEEDS['industry-manufacturing-materials'];
    expect((await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets })).items).toHaveLength(0);
  });

  it.each([
    'New solar farm adds electricity output',
    'Farmers celebrate a football win',
    'Climate change increases global heat',
  ])('does not use unrelated or general headlines to fill agriculture news: %s', async title => {
    vi.mocked(readNewsStore).mockResolvedValue({ items: [{ ...article('unrelated'), title }], state: {}, available: true });
    const feed = INDUSTRY_FEEDS['agriculture-food-aquaculture'];
    expect((await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets })).items).toHaveLength(0);
  });

  it('keeps the newest publisher story even when older metadata comes from a richer provider', async () => {
    const old = { ...article('old'), publishedAt: new Date(Date.now() - 3 * 86400000).toISOString() };
    const newest = { ...article('newest'), provider: 'gdelt' as const };
    vi.mocked(readNewsStore).mockResolvedValue({ items: [old, newest], state: {}, available: true });
    const result = await fetchNews('all', 80, { providers: PAGE_NEWS_PROVIDERS, maxPerPublisher: 1 });
    expect(result.items.map(item => item.id)).toEqual([newest.id]);
  });

  it('keeps saved cards and filters usable after the last provider refresh failed', async () => {
    const diagnostics = createNewsDiagnostics('all');
    diagnostics.providers = [{ provider: 'newsdata', outcome: 'unavailable', items: 0, stale: false, retrievedAt: null, issue: 'unavailable', httpStatus: 401 }];
    vi.mocked(readNewsStore).mockResolvedValue({ items: [article('1')], state: { diagnostics }, available: true });
    const result = await fetchNews('all', 80, { providers: ['newsdata', 'gdelt'] });
    expect(result.items).toHaveLength(1);
    expect(result.sourcesFailed).toBe(false);
    expect(result.stale).toBe(true);
    expect(result.diagnostics?.providers[0].httpStatus).toBe(401);
    expect(result.diagnostics?.mode).toBe('database');
  });

  it('fails closed on a database outage without falling back to upstream calls', async () => {
    vi.mocked(readNewsStore).mockResolvedValue({ items: [], state: {}, available: false });
    const result = await fetchNews();
    expect(result.sourcesFailed).toBe(true);
    expect(result.diagnostics?.storage).toBe('failed');
    expect(fetchNewsdataBasket).not.toHaveBeenCalled();
  });

  it('keeps publication dates, retrieval times and last successful poll separate', async () => {
    const item = article('1');
    const now = new Date().toISOString();
    const state = { lastSuccessAt: { newsdata: now }, token: 'private-lease-token' };
    vi.mocked(readNewsStore).mockResolvedValue({ items: [item], state, available: true });
    const result = await fetchNews();
    expect(result.retrievedAt).toBe(item.retrievedAt);
    expect(result.refreshedAt).toBe(now);
    expect(result.items[0].publishedAt).toBe(item.publishedAt);
    expect(result.stale).toBe(false);
    expect(JSON.stringify(result)).not.toContain('private-lease-token');
  });

  it('withholds saved access evidence that expires while the database snapshot is cached', async () => {
    const expired = { ...article('expired'), accessCheckedAt: new Date(Date.now() - 8 * 86400000).toISOString() };
    vi.mocked(readNewsStore).mockResolvedValue({ items: [expired], state: {}, available: true });
    expect((await fetchNews()).items).toHaveLength(0);
    expect(fetchNewsdataBasket).not.toHaveBeenCalled();
  });

  it('reports another search page only when another saved result exists', async () => {
    vi.mocked(readNewsStore).mockResolvedValue({ items: [article('1'), article('2')], state: {}, available: true });
    expect((await searchNews('', 'all', {}, 2)).hasNextPage).toBe(false);
    expect((await searchNews('', 'all', {}, 1)).hasNextPage).toBe(true);
    expect((await searchNews('', 'all', { page: 2 }, 1)).items[0].url).toContain('/2');
  });
});

describe('scheduled news refresh', () => {
  it('skips a duplicate scheduled run before contacting any provider', async () => {
    vi.mocked(claimNewsRefresh).mockResolvedValue(null);
    expect((await refreshScheduledNews()).skipped).toBe(true);
    expect(fetchNewsdataBasket).not.toHaveBeenCalled();
    expect(fetchNewsdataQuery).not.toHaveBeenCalled();
  });

  it('uses the same fresh provider pipeline for a manual pull and skips when its lease is unavailable', async () => {
    const result = await refreshScheduledNews(undefined, { manual: true });
    expect(result.skipped).toBe(false);
    expect(claimNewsRefresh).toHaveBeenCalledWith({ manual: true });
    expect(fetchNewsdataBasket).toHaveBeenCalledTimes(4);
    expect(fetchNewsdataQuery).toHaveBeenCalledTimes(3 + 12 + industryDiscoveryQueries().length);
    expect(fetchNewsdataBasket).toHaveBeenCalledWith('climate', true);
    vi.mocked(fetchNewsdataBasket).mockClear();
    vi.mocked(fetchNewsdataQuery).mockClear();
    vi.mocked(claimNewsRefresh).mockResolvedValue(null);
    expect((await refreshScheduledNews(undefined, { manual: true })).skipped).toBe(true);
    expect(fetchNewsdataBasket).not.toHaveBeenCalled();
    expect(fetchNewsdataQuery).not.toHaveBeenCalled();
  });

  it('pulls fresh topic, domain and sector requests once and retains saved cards through provider failures', async () => {
    const previous = article('previous');
    const latest = article('latest', 'eia_rss');
    const saved = [previous];
    vi.mocked(readNewsStore).mockImplementation(async () => ({ items: saved, state: {}, available: true }));
    vi.mocked(fetchNewsdataBasket).mockResolvedValue(fail('newsdata', 'unavailable', 'HTTP 401'));
    vi.mocked(fetchGdeltNews).mockResolvedValue(fail('gdelt', 'rate_limited', 'HTTP 429'));
    vi.mocked(fetchEiaNews).mockResolvedValue(ok('eia_rss', [latest]));
    vi.mocked(storeRecords).mockImplementation(async records => {
      for (const row of records) {
        const index = saved.findIndex(i => i.id === (row.record as NewsItem).id);
        if (index === -1) saved.push(row.record as NewsItem);
        else saved[index] = row.record as NewsItem;
      }
      return true;
    });
    const check = vi.fn(async (url: string) => ({ status: 'verified_open' as const, checkedAt: new Date().toISOString(), evidence: 'Opened', finalUrl: url }));
    const result = await refreshScheduledNews(check);
    expect(result.storedItems).toBe(2);
    expect(saved.map(i => i.id)).toContain(previous.id);
    expect(saved.map(i => i.id)).toContain(latest.id);
    expect(fetchNewsdataBasket).toHaveBeenCalledTimes(4);
    expect(fetchNewsdataBasket).toHaveBeenCalledWith('climate', true);
    expect(fetchNewsdataQuery).toHaveBeenCalledTimes(3 + 12 + industryDiscoveryQueries().length);
    for (const feed of Object.values(DOMAIN_FEEDS)) {
      for (const phrases of feed.newsBaskets) {
        expect(fetchNewsdataQuery).toHaveBeenCalledWith(basketQuery(phrases), 43200, true);
      }
    }
    for (const query of industryDiscoveryQueries()) {
      expect(fetchNewsdataQuery).toHaveBeenCalledWith(query, 43200, true);
    }
    // The normal daily schedule must fit the existing shared budgets.
    const requests = vi.mocked(fetchNewsdataBasket).mock.calls.length + vi.mocked(fetchNewsdataQuery).mock.calls.length;
    expect(requests).toBeLessThanOrEqual(LIMITS.newsdata!.window!.max);
    expect(requests * NEWS_CRON_SCHEDULES.length).toBeLessThanOrEqual(LIMITS.newsdata!.daily);
    expect(fetchGdeltNews).toHaveBeenCalledWith('all', true);
    expect(finishNewsRefresh).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ lastSuccessAt: expect.objectContaining({ eia_rss: expect.any(String) }) }));
    expect((await fetchNews('all', 80)).items).toHaveLength(2);
  });

  it('requires an explicit manual option before industry maintenance can claim a lease', async () => {
    await expect(refreshScheduledNews(undefined, { industriesOnly: true })).rejects.toThrow('explicit manual');
    expect(claimNewsRefresh).not.toHaveBeenCalled();
  });

  it.each([
    { manual: true, industriesOnly: true, industrySlugs: [] },
    { manual: true, industriesOnly: true, industrySlugs: ['unknown-sector'] },
    { manual: true, industriesOnly: true, industrySlugs: ['constructor'] },
    { manual: true, industrySlugs: ['tourism-hospitality-destinations'] },
  ])('rejects an invalid targeted pull before claiming the shared lease: %j', async options => {
    await expect(refreshScheduledNews(undefined, options)).rejects.toThrow('known industries');
    expect(claimNewsRefresh).not.toHaveBeenCalled();
    expect(fetchNewsdataQuery).not.toHaveBeenCalled();
  });

  it('repairs one industry through a single fresh query and keeps destination checks and saved reads', async () => {
    const feed = INDUSTRY_FEEDS['tourism-hospitality-destinations'];
    const tourism = { ...article('tourism'), title: 'Tourism project threatens turtle nesting sites',
      matchedQueries: [feed.newsDiscoveryQuery] };
    const saved: NewsItem[] = [];
    vi.mocked(readNewsStore).mockImplementation(async () => ({ items: saved, state: {}, available: true }));
    vi.mocked(fetchNewsdataQuery).mockResolvedValue(ok('newsdata', [tourism]));
    vi.mocked(storeRecords).mockImplementation(async records => { saved.push(...records.map(row => row.record as NewsItem)); return true; });
    const check = vi.fn(async (url: string) => ({ status: 'verified_open' as const,
      checkedAt: new Date().toISOString(), evidence: 'Opened', finalUrl: url }));
    const result = await refreshScheduledNews(check, { manual: true, industriesOnly: true,
      industrySlugs: ['tourism-hospitality-destinations', 'tourism-hospitality-destinations'] });
    expect(fetchNewsdataQuery).toHaveBeenCalledExactlyOnceWith(feed.newsDiscoveryQuery, 43200, true);
    for (const call of [fetchNewsdataBasket, fetchGdeltNews, fetchEiaNews, fetchEeaNews]) expect(call).not.toHaveBeenCalled();
    expect(check).toHaveBeenCalledExactlyOnceWith(tourism.url);
    expect(result.storedItems).toBe(1);
    expect(saved).toHaveLength(1);
    vi.mocked(fetchNewsdataQuery).mockClear();
    const page = await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets });
    expect(page.items.map(item => item.id)).toEqual([tourism.id]);
    expect((await fetchNews('all', 24)).items.map(item => item.id)).toEqual([tourism.id]);
    expect(fetchNewsdataQuery).not.toHaveBeenCalled();
  });

  it('discovers every industry in one bounded maintenance pull and preserves untouched provider health', async () => {
    const other = { provider: 'gdelt' as const, outcome: 'unavailable' as const, items: 0, stale: false, retrievedAt: null, issue: 'request_timeout', httpStatus: null };
    const previous = createNewsDiagnostics('all');
    previous.providers = [other];
    vi.mocked(claimNewsRefresh).mockResolvedValue({ token: 'fixture', state: {
      diagnostics: previous, lastSuccessAt: { gdelt: '2026-10-10T06:00:00Z' },
    } });
    const tourist = { ...article('hotel'), title: 'Hotels cut energy costs', matchedQueries: [INDUSTRY_FEEDS['tourism-hospitality-destinations'].newsDiscoveryQuery] };
    const gated = { ...article('campus'), title: 'Campus reduces carbon emissions' };
    vi.mocked(fetchNewsdataQuery).mockImplementation(async query => ok('newsdata', query === tourist.matchedQueries[0] ? [tourist, gated] : []));
    const check = vi.fn(async (url: string) => ({ status: url === tourist.url ? 'verified_open' as const : 'gated' as const,
      checkedAt: new Date().toISOString(), evidence: 'Checked', finalUrl: url }));
    const result = await refreshScheduledNews(check, { manual: true, industriesOnly: true });
    expect(claimNewsRefresh).toHaveBeenCalledWith({ manual: true, industriesOnly: true });
    expect(fetchNewsdataQuery).toHaveBeenCalledTimes(13);
    expect(vi.mocked(fetchNewsdataQuery).mock.calls.map(call => call[0])).toEqual(industryDiscoveryQueries(Date.now(), true));
    for (const call of vi.mocked(fetchNewsdataQuery).mock.calls) expect(call.slice(1)).toEqual([43200, true]);
    for (const call of [fetchNewsdataBasket, fetchGdeltNews, fetchEiaNews, fetchEeaNews]) expect(call).not.toHaveBeenCalled();
    expect(result.storedItems).toBe(1);
    expect(result.diagnostics?.scope).toBe('industries');
    expect(result.diagnostics?.providers).toContainEqual(other);
    expect(storeRecords).toHaveBeenCalledWith([expect.objectContaining({ destination: tourist.url })]);
    expect(finishNewsRefresh).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      lastSuccessAt: expect.objectContaining({ gdelt: '2026-10-10T06:00:00Z' }),
    }));
  });

  it('saves domain query matches when a duplicate topic article has no domain phrase in its headline', async () => {
    const feed = DOMAIN_FEEDS['energy-systems-transition'];
    const query = basketQuery(feed.newsBaskets[0]);
    const broad = { ...article('solar'), title: 'Solar investment accelerates worldwide', matchedQueries: ['broad-topic'] };
    const saved: NewsItem[] = [];
    vi.mocked(readNewsStore).mockImplementation(async () => ({ items: saved, state: {}, available: true }));
    vi.mocked(fetchNewsdataBasket).mockResolvedValue(ok('newsdata', [broad]));
    vi.mocked(fetchNewsdataQuery).mockImplementation(async requested =>
      ok('newsdata', requested === query ? [{ ...broad, matchedQueries: [query] }] : []));
    vi.mocked(storeRecords).mockImplementation(async records => {
      saved.push(...records.map(row => row.record as NewsItem));
      return true;
    });
    await refreshScheduledNews(async url => ({ status: 'verified_open', checkedAt: new Date().toISOString(), evidence: 'Opened', finalUrl: url }));
    expect(saved).toHaveLength(1);
    expect(saved[0].matchedQueries).toEqual(expect.arrayContaining(['broad-topic', query]));
    // Page reads must recognize the saved query match without another API call.
    vi.mocked(fetchNewsdataQuery).mockClear();
    const page = await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets });
    expect(page.items).toHaveLength(1);
    expect(fetchNewsdataQuery).not.toHaveBeenCalled();
  });

  it('makes one completed refresh available to homepage, domain and industry news reads', async () => {
    const saved: NewsItem[] = [];
    const energy = { ...article('solar'), title: 'Solar power output increases' };
    const food = { ...article('food'), title: 'Is local food better for the environment?' };
    vi.mocked(readNewsStore).mockImplementation(async () => ({ items: saved, state: {}, available: true }));
    vi.mocked(fetchNewsdataBasket).mockResolvedValue(ok('newsdata', [energy, food]));
    vi.mocked(storeRecords).mockImplementation(async records => {
      saved.push(...records.map(row => row.record as NewsItem));
      return true;
    });
    await refreshScheduledNews(async url => ({ status: 'verified_open', checkedAt: new Date().toISOString(), evidence: 'Opened', finalUrl: url }));
    // Public reads select the saved refresh; they do not request their own new articles.
    vi.mocked(fetchNewsdataBasket).mockClear();
    vi.mocked(fetchNewsdataQuery).mockClear();
    expect((await fetchNews('all', 3, { providers: PAGE_NEWS_PROVIDERS })).items).toHaveLength(2);
    const domain = DOMAIN_FEEDS['energy-systems-transition'];
    const industry = INDUSTRY_FEEDS['agriculture-food-aquaculture'];
    expect((await fetchNewsForKeywords(newsPhrases(domain), 3, { baskets: domain.newsBaskets })).items[0].id).toBe(energy.id);
    expect((await fetchNewsForKeywords(newsPhrases(industry), 3, { baskets: industry.newsBaskets })).items[0].id).toBe(food.id);
    expect(fetchNewsdataBasket).not.toHaveBeenCalled();
    expect(fetchNewsdataQuery).not.toHaveBeenCalled();
  });

  it('records storage failures without claiming successful ingestion', async () => {
    vi.mocked(fetchNewsdataBasket).mockResolvedValue(ok('newsdata', [article('1')]));
    vi.mocked(storeRecords).mockResolvedValue(false);
    const result = await refreshScheduledNews(async url => ({ status: 'verified_open', checkedAt: new Date().toISOString(), evidence: 'Opened', finalUrl: url }));
    expect(result.sourcesFailed).toBe(true);
    expect(result.storedItems).toBe(0);
    expect(finishNewsRefresh).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ diagnostics: expect.objectContaining({ storage: 'failed' }) }));
  });

  it('preserves eligible saved articles when healthy providers have no new articles', async () => {
    const previous = article('previous');
    vi.mocked(readNewsStore).mockResolvedValue({ items: [previous], state: {}, available: true });
    const result = await refreshScheduledNews(async url => ({ status: 'verified_open', checkedAt: new Date().toISOString(), evidence: 'Opened', finalUrl: url }));
    expect(result.storedItems).toBe(1);
    expect(result.sourcesFailed).toBe(false);
    expect(storeRecords).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ destination: previous.url })]));
    expect((await fetchNews()).items[0].id).toBe(previous.id);
  });

  it('allows healthy providers to refresh when another connector throws', async () => {
    vi.mocked(fetchGdeltNews).mockRejectedValue(new Error('fixture'));
    vi.mocked(fetchEiaNews).mockResolvedValue(ok('eia_rss', [article('eia', 'eia_rss')]));
    const result = await refreshScheduledNews(async url => ({ status: 'verified_open', checkedAt: new Date().toISOString(), evidence: 'Opened', finalUrl: url }));
    expect(result.storedItems).toBe(1);
    expect(result.sourcesFailed).toBe(false);
  });
});

it('maps the three Manila refresh times to distinct eight-hour UTC slots', () => {
  const times = ['2026-10-03T06:00:00+08:00', '2026-10-03T14:00:00+08:00', '2026-10-03T22:00:00+08:00'];
  expect(times.map(t => newsScheduleSlot(Date.parse(t)))).toEqual(['2026-10-02T22:00:00.000Z', '2026-10-03T06:00:00.000Z', '2026-10-03T14:00:00.000Z']);
  expect(newsScheduleSlot(Date.parse('2026-10-03T06:59:00+08:00'))).toBe('2026-10-02T22:00:00.000Z');
  expect(NEWS_REFRESH_SECONDS).toBe(28800);
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  // Other maintenance jobs can coexist with the three news refresh slots.
  const newsJobs = config.crons.filter((job: { path: string }) => job.path === '/api/ingest/news');
  expect(newsJobs.map((job: { schedule: string }) => job.schedule)).toEqual([...NEWS_CRON_SCHEDULES]);
});
