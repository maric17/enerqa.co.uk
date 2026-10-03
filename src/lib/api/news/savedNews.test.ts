import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fail, ok } from '../core/types';
import type { NewsItem } from './types';

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
import { fetchNews, fetchNewsForKeywords, fetchOfficialNews, refreshScheduledNews, searchNews } from './index';
import { createNewsDiagnostics } from './diagnostics';
import { NEWS_CRON_SCHEDULES, NEWS_REFRESH_SECONDS, newsScheduleSlot } from './schedule';

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
  vi.mocked(fetchGdeltNews).mockResolvedValue(ok('gdelt', []));
  vi.mocked(fetchEiaNews).mockResolvedValue(ok('eia_rss', []));
  vi.mocked(fetchEeaNews).mockResolvedValue(ok('eea_rss', []));
});
afterEach(() => vi.restoreAllMocks());

describe('database-backed news reads', () => {
  it('uses saved articles on all public news paths without provider or destination requests', async () => {
    const destinationCheck = vi.fn();
    vi.mocked(readNewsStore).mockResolvedValue({ items: [article('1'), article('2', 'eia_rss')], state: {}, available: true });
    expect((await fetchNews('all', 80, { check: destinationCheck })).items).toHaveLength(2);
    expect((await fetchNewsForKeywords(['climate finance'], 4, { check: destinationCheck, baskets: [['climate finance']] })).items).toHaveLength(1);
    expect((await searchNews('electricity', 'all')).items).toHaveLength(2);
    expect((await fetchOfficialNews('eia_rss', 'energy')).items).toHaveLength(1);
    for (const call of [fetchNewsdataBasket, fetchNewsdataQuery, fetchGdeltNews, fetchEiaNews, fetchEeaNews, destinationCheck, storeRecords]) expect(call).not.toHaveBeenCalled();
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
  });

  it('pulls four fresh topic requests once and retains saved cards through provider failures', async () => {
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
    expect(fetchNewsdataQuery).not.toHaveBeenCalled();
    expect(fetchGdeltNews).toHaveBeenCalledWith('all', true);
    expect(finishNewsRefresh).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ lastSuccessAt: expect.objectContaining({ eia_rss: expect.any(String) }) }));
    expect((await fetchNews('all', 80)).items).toHaveLength(2);
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
  expect(config.crons.map((job: { schedule: string }) => job.schedule)).toEqual([...NEWS_CRON_SCHEDULES]);
  expect(config.crons.every((job: { path: string }) => job.path === '/api/ingest/news')).toBe(true);
});
