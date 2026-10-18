import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ cache: new Map<string, unknown>(), relatedTerms: [] as string[] }));

vi.mock('next/cache', () => ({
  // Model a shared cache that survives module reloads, as it can across deployments.
  unstable_cache: (fn: () => Promise<unknown>, keys: string[]) => async () => {
    const key = JSON.stringify(keys);
    if (!mocks.cache.has(key)) mocks.cache.set(key, await fn());
    return mocks.cache.get(key);
  },
}));
vi.mock('./contextual', async importOriginal => {
  const actual = await importOriginal<typeof import('./contextual')>();
  return {
    ...actual,
    INDUSTRY_FEEDS: {
      ...actual.INDUSTRY_FEEDS,
      'agriculture-food-aquaculture': {
        ...actual.INDUSTRY_FEEDS['agriculture-food-aquaculture'],
        relatedNewsTerms: mocks.relatedTerms,
      },
    },
  };
});
vi.mock('@/lib/api/news', () => ({
  // Saved metadata only: rebuilding search tags must not need a fresh news-provider call.
  fetchNews: async () => ({ sourcesFailed: false, items: [{
    id: 'food', title: 'Is local food better for the environment?', summary: null,
    url: 'https://www.theguardian.com/food', provider: 'newsdata', publisher: 'The Guardian',
    providerLabel: 'NewsData.io', publishedAt: '2026-10-09', retrievedAt: '2026-10-11', language: 'en', accessStatus: 'verified_open',
  }] }),
  isNewsItemStale: () => false,
}));
vi.mock('@/lib/api/research', () => ({ fetchResearchForThemes: async () => ({ items: [], sourcesFailed: false }) }));
vi.mock('./official', () => ({ fetchSpecialistUpdates: async () => ({ items: [], sourcesFailed: false }) }));
vi.mock('./savedIntelligence', () => ({ readSavedResearch: async () => ({ items: [], available: true }) }));

beforeEach(() => { mocks.cache.clear(); mocks.relatedTerms.length = 0; vi.resetModules(); });

it('refreshes cached industry tags when sector terms change, without retaining the old empty selection', async () => {
  const before = await (await import('./intelligenceIndex')).getIntelligenceIndex();
  expect(before.items[0].industries).not.toContain('agriculture-food-aquaculture');

  // Update vocabulary while keeping the old cached result to reproduce the reported link failure.
  mocks.relatedTerms.push('local food');
  vi.resetModules();
  const after = await (await import('./intelligenceIndex')).getIntelligenceIndex();
  expect(after.items[0].industries).toContain('agriculture-food-aquaculture');
});
