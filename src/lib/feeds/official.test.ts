import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NewsItem, NewsResult } from '@/lib/api/news';
import type { ResearchItem } from '@/lib/api/core/types';

const state = vi.hoisted(() => ({
  records: new Map<string, unknown>(),
  disabled: new Set<string>(),
  gated: new Set<string>(),
}));

vi.mock('@/lib/api/core/registry', async (original) => ({
  ...await original<typeof import('@/lib/api/core/registry')>(),
  providerEnabled: (id: string) => !state.disabled.has(id),
}));
vi.mock('@/lib/api/core/storage', async (original) => ({
  ...await original<typeof import('@/lib/api/core/storage')>(),
  // Model the real upsert: a card saved under the same key replaces its source.
  storeRecords: vi.fn(async (records) => {
    for (const row of records) state.records.set(`${row.provider}:${row.sourceId}`, row.record);
    return true;
  }),
}));
vi.mock('@/lib/api/news', () => ({
  fetchOfficialNews: vi.fn(),
  isNewsItemStale: () => false,
}));
vi.mock('@/lib/api/research', async (original) => ({
  ...await original<typeof import('@/lib/api/research')>(),
  fetchIssuerFilings: vi.fn(),
  fetchResearchForThemes: vi.fn(),
}));
vi.mock('@/lib/api/core/accessCheck', async (original) => ({
  ...await original<typeof import('@/lib/api/core/accessCheck')>(),
  firstVerified: vi.fn(async (items, options) => items.flatMap((item: unknown) => {
    const url = options.urls ? options.urls(item)[0] : options.url(item);
    return state.gated.has(url) ? [] : [{ item, url, verdict: {
      status: 'verified_open', checkedAt: '2026-10-11T01:00:00.000Z', evidence: 'Complete document opened.', finalUrl: url,
    } }];
  }).slice(0, options.limit)),
}));

import { fetchOfficialNews } from '@/lib/api/news';
import { fetchIssuerFilings, fetchResearchForThemes } from '@/lib/api/research';
import { storeRecords } from '@/lib/api/core/storage';
import { buildProvenance } from '@/lib/api/core/provenance';
import { fetchSpecialistUpdates } from './official';

beforeEach(() => {
  vi.clearAllMocks();
  state.records.clear();
  state.disabled.clear();
  state.gated.clear();
  vi.mocked(fetchOfficialNews).mockImplementation(async (provider) => ({
    // Saved-news reading needs these original fields after every page visit.
    items: [...state.records.values()].filter((record): record is NewsItem => {
      const item = record as Partial<NewsItem>;
      return item.provider === provider && typeof item.publisher === 'string' && typeof item.rights === 'string';
    }),
    sourcesFailed: false,
  } as NewsResult));
});

describe('official cards preserve saved source records', () => {
  it.each(['eia_rss', 'eea_rss'] as const)('keeps %s readable across repeated page visits', async (provider) => {
    const url = `https://example.org/${provider}/energy-efficiency`;
    const original: NewsItem = {
      id: url, sourceId: url, title: 'Energy efficiency and environment updates', summary: 'Original feed summary.',
      url, domain: 'example.org', publisher: 'Official organisation', publishedAt: '2026-10-05',
      language: 'en', provider, providerLabel: 'Official source', retrievedAt: '2026-10-11T00:00:00.000Z',
      rights: 'Original feed reuse terms', regions: ['Europe'], accessStatus: 'verified_open',
      accessCheckedAt: '2026-10-11T01:00:00.000Z',
    };
    state.records.set(`${provider}:${url}`, original);

    const options = { feeds: [provider], themes: [] };
    expect((await fetchSpecialistUpdates(options)).items).toHaveLength(1);
    expect((await fetchSpecialistUpdates(options)).items).toHaveLength(1);
    expect(state.records.get(`${provider}:${url}`)).toEqual(original);
    expect(storeRecords).not.toHaveBeenCalled();
  });

  it('keeps the original research provenance when making an OSTI card', async () => {
    const original = researchItem('osti');
    state.records.set('osti:source-1', original);
    vi.mocked(fetchResearchForThemes).mockResolvedValue({
      items: [{ ...original, regions: [] }], sources: [], skipped: [], retrievedAt: original.provenance.retrievedAt,
      unavailable: false, sourcesFailed: false, stale: false,
    });
    expect((await fetchSpecialistUpdates({ feeds: ['osti'], themes: ['energy'] })).items).toHaveLength(1);
    expect(state.records.get('osti:source-1')).toEqual(original);
    expect(storeRecords).not.toHaveBeenCalled();
  });

  it('stores a verified SEC filing in its original research format', async () => {
    const original = researchItem('sec-edgar');
    vi.mocked(fetchIssuerFilings).mockResolvedValue({
      ok: true, providerId: 'sec-edgar', data: [original], retrievedAt: original.provenance.retrievedAt, stale: false,
    });
    const result = await fetchSpecialistUpdates({ feeds: ['sec_edgar'], themes: [] });
    expect(result.items).toHaveLength(1);
    expect(storeRecords).toHaveBeenCalledTimes(1);
    expect(state.records.get('sec-edgar:source-1')).toMatchObject({
      readUrl: original.readUrl, kind: 'disclosure',
      provenance: { accessStatus: 'verified_open', accessCheckedAt: '2026-10-11T01:00:00.000Z' },
    });
  });

  it('continues to withhold documents that fail the access check', async () => {
    const original = researchItem('sec-edgar');
    state.gated.add(original.readUrl);
    vi.mocked(fetchIssuerFilings).mockResolvedValue({
      ok: true, providerId: 'sec-edgar', data: [original], retrievedAt: original.provenance.retrievedAt, stale: false,
    });
    expect((await fetchSpecialistUpdates({ feeds: ['sec_edgar'], themes: [] })).items).toEqual([]);
    expect(state.records.size).toBe(0);
  });
});

describe('official source availability', () => {
  it('distinguishes a disabled source from a successful empty search', async () => {
    state.disabled.add('reliefweb');
    const result = await fetchSpecialistUpdates({ feeds: ['reliefweb'], themes: ['climate'] });
    expect(result).toMatchObject({ items: [], notEnabled: true, sourcesFailed: false });
    expect(fetchResearchForThemes).not.toHaveBeenCalled();
  });

  it('does not let a disabled feed hide a failure in the enabled feed', async () => {
    state.disabled.add('reliefweb');
    vi.mocked(fetchOfficialNews).mockResolvedValue({ items: [], sourcesFailed: true } as unknown as NewsResult);
    const result = await fetchSpecialistUpdates({ feeds: ['eea_rss', 'reliefweb'], themes: [] });
    expect(result).toMatchObject({ items: [], notEnabled: false, sourcesFailed: true });
  });

  it('keeps a successful search with no matching items as an empty result', async () => {
    const result = await fetchSpecialistUpdates({ feeds: ['eia_rss'], themes: [] });
    expect(result).toMatchObject({ items: [], notEnabled: false, sourcesFailed: false });
  });
});

function researchItem(provider: 'osti' | 'sec-edgar'): ResearchItem {
  return {
    id: 'source-1', title: 'Original energy report', summary: null, authors: [], source: 'Original issuer',
    organisation: 'Original issuer', docType: provider === 'osti' ? 'Technical report' : 'Corporate disclosure, Form 8-K',
    publishedAt: '2026-10-05', doi: null, readUrl: 'https://example.org/document',
    kind: provider === 'osti' ? 'report' : 'disclosure', peerReviewed: false,
    provenance: buildProvenance(provider, { sourceUrl: 'https://example.org/document', retrievedAt: '2026-10-11T00:00:00.000Z' }),
  };
}
