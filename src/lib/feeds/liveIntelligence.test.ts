import { beforeEach, expect, it, vi } from 'vitest';
import { tagIntelligence } from './intelligence';
const mocks = vi.hoisted(() => ({ news: vi.fn(), research: vi.fn(), saved: vi.fn(), cache: new Map<string, unknown>() }));
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: (f: unknown) => Promise<unknown>) => async (filters: unknown) => {
  const key = JSON.stringify(filters);
  if (!mocks.cache.has(key)) mocks.cache.set(key, await fn(filters));
  return mocks.cache.get(key);
} }));
vi.mock('@/lib/api/news', () => ({ fetchLiveNews: mocks.news, fetchNews: vi.fn(), isNewsItemStale: () => false }));
vi.mock('@/lib/api/research', () => ({ fetchResearch: mocks.research, fetchIssuerFilings: vi.fn(), verifyForDisplay: vi.fn(), isFutureDate: () => false }));
vi.mock('./intelligenceIndex', async original => ({ ...await original<typeof import('./intelligenceIndex')>(), getIntelligenceIndex: mocks.saved }));
import { liveProviders, searchLiveIntelligence } from './liveIntelligence';

const saved = tagIntelligence({
  id: 'saved', title: 'Renewable energy in Germany', summary: null, url: 'https://example.org/saved', type: 'news',
  publisher: 'Publisher', source: 'APITube', sourceId: 'apitube', publishedAt: '2026-10-10', retrievedAt: '2026-10-11',
  language: 'en', authors: [], doi: null, documentType: null, verifiedOpen: true, stale: false,
});
beforeEach(() => {
  vi.clearAllMocks(); mocks.cache.clear();
  mocks.saved.mockResolvedValue({ items: [saved], sourcesFailed: false });
  mocks.news.mockResolvedValue({ items: [], providerStatus: { apitube: 'ok' } });
});
it('requests only providers for selected content types and sources, respecting disabled sources', () => {
  expect(liveProviders({ type: ['news'], source: ['apitube', 'openalex'] })).toEqual(['apitube']);
  // DOAJ and ReliefWeb remain paused in the reviewed source registry.
  expect(liveProviders({ type: ['research'] })).toEqual(['openalex']);
  expect(liveProviders({ type: ['official'], source: ['reliefweb'] })).toEqual([]);
});
it('calls live discovery and applies every facet to saved and returned records', async () => {
  const result = await searchLiveIntelligence({ type: ['news'], source: ['apitube'], country: ['DEU'], domain: ['energy-systems-transition'] });
  expect(mocks.news).toHaveBeenCalledWith(expect.objectContaining({ providers: ['apitube'], query: expect.stringContaining('Germany') }));
  expect(result.items.map(i => i.id)).toEqual(['saved']);
  expect(result.sourcesFailed).toBe(false); expect(mocks.research).not.toHaveBeenCalled();
});
it('coalesces simultaneous identical searches and reuses the short shared result', async () => {
  const filters = { type: ['news'], source: ['apitube'] };
  await Promise.all([searchLiveIntelligence(filters), searchLiveIntelligence(filters)]);
  await searchLiveIntelligence(filters);
  expect(mocks.news).toHaveBeenCalledTimes(1);
});
it('retains saved cards and reports all-source failures honestly', async () => {
  mocks.news.mockRejectedValue(new Error('private provider details'));
  const result = await searchLiveIntelligence({ type: ['news'], source: ['apitube'] });
  expect(result.items).toEqual([saved]); expect(result.sourcesFailed).toBe(true);
  expect(result.unavailableSources).toEqual(['apitube']);
  expect(JSON.stringify(result)).not.toContain('private provider details');
});
it('excludes cached legacy news even when live discovery fails', async () => {
  mocks.saved.mockResolvedValue({ items: [saved, { ...saved, id: 'legacy', url: 'https://example.org/legacy', sourceId: 'newsdata' }], sourcesFailed: false });
  mocks.news.mockRejectedValue(new Error('Provider unavailable'));
  const result = await searchLiveIntelligence({ type: ['news'] });
  expect(result.items.map(item => item.id)).toEqual(['saved']);
  expect(liveProviders({ type: ['news'], source: ['newsdata', 'gdelt'] })).toEqual([]);
});
it('requests a fresh keyword search from the selected scholarly API', async () => {
  mocks.research.mockResolvedValue({ items: [], skipped: [] });
  await searchLiveIntelligence({ q: ['solar'], type: ['research'], source: ['openalex'] });
  expect(mocks.research).toHaveBeenCalledWith(expect.objectContaining({ search: '"solar"', limit: 8, providers: ['openalex'], fresh: true }));
  expect(mocks.news).not.toHaveBeenCalled();
});

it('sends language and the widest selected publication window to research discovery', async () => {
  mocks.research.mockResolvedValue({ items: [], skipped: [] });
  await searchLiveIntelligence({ q: ['solar'], type: ['research'], source: ['openalex'], dateRange: ['7d', '30d'], language: ['en'] });
  expect(mocks.research).toHaveBeenCalledWith(expect.objectContaining({
    fromDate: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10), languages: ['en'],
  }));
});
