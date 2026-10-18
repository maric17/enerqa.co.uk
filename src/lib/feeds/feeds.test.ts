import { describe, it, expect, vi, afterEach } from 'vitest';
import { DOMAIN_FEEDS, INDUSTRY_FEEDS, newsPhrases } from './contextual';
import { interleaveFeeds, type OfficialUpdate } from './official';
import { cardFromOfficial, cardFromResearch, researchLabel } from './research';
import { publishedCuratedSources } from './curated';
import { fetchFromProvider, upstreamRetrievedAt } from '@/lib/api/core/fetch';
import { buildProvenance, isStale } from '@/lib/api/core/provenance';
import { mixedMeasureReason } from '@/components/data/DataSeriesTable';
import type { DataSeries } from '@/lib/api/core/types';

afterEach(() => vi.unstubAllGlobals());

describe('contextual feed configuration (pp. 30, 38, 49, 60, 66-138)', () => {
  it('covers all 4 domains and all 13 industries', () => {
    expect(Object.keys(DOMAIN_FEEDS)).toHaveLength(4);
    expect(Object.keys(INDUSTRY_FEEDS)).toHaveLength(13);
  });

  it('gives every page at least one basket and one research theme', () => {
    for (const [slug, feed] of Object.entries({ ...DOMAIN_FEEDS, ...INDUSTRY_FEEDS })) {
      expect(newsPhrases(feed).length, slug).toBeGreaterThan(0);
      expect(feed.researchThemes.length, slug).toBeGreaterThan(0);
      // An empty phrase would match every headline in the pool.
      expect(newsPhrases(feed).every((p) => p.trim().length > 1), slug).toBe(true);
    }
  });
});

describe('industry specialist feeds (pp. 66-138, L541)', () => {
  // Each industry's "Specialist feeds for I{nn}R" line, in the spec's order.
  const SPEC: Record<string, [number, string[]]> = {
    'government-regulators-public-institutions': [66, ['reliefweb']],
    'financial-institutions-investors-development-finance': [72, ['sec_edgar']],
    'energy-utilities': [78, ['eia_rss', 'osti']],
    'oil-gas-petrochemicals': [84, ['eia_rss', 'osti', 'sec_edgar']],
    'industry-manufacturing-materials': [90, ['osti', 'eea_rss']],
    'infrastructure-real-estate-industrial-zones': [96, ['eea_rss', 'osti']],
    'transport-logistics-mobility': [102, ['eia_rss', 'osti']],
    'water-waste-circular-economy': [108, ['eea_rss', 'reliefweb']],
    'agriculture-food-aquaculture': [114, ['reliefweb', 'gbif_literature']],
    'mining-natural-resources': [120, ['gbif_literature', 'eea_rss']],
    'tourism-hospitality-destinations': [126, ['eea_rss', 'gbif_literature']],
    'technology-telecoms-data-infrastructure': [132, ['osti', 'eia_rss', 'sec_edgar']],
    'healthcare-education-institutional-estates': [138, ['osti', 'eea_rss']],
  };

  it('matches the spec page for every industry', () => {
    for (const [slug, [page, feeds]] of Object.entries(SPEC)) {
      expect(INDUSTRY_FEEDS[slug].pdfPage, slug).toBe(page);
      expect(INDUSTRY_FEEDS[slug].specialistFeeds, slug).toEqual(feeds);
    }
  });
});

describe('labels on research and official cards (pp. 28, 29, 217)', () => {
  it('separates research, reports, preprints and disclosures', () => {
    expect(researchLabel({ kind: 'research', preprint: true })).toBe('Preprint');
    expect(researchLabel({ kind: 'report' })).toBe('Report');
    expect(researchLabel({ kind: 'disclosure' })).toBe('Corporate disclosure');
  });

  it('carries licence and version onto the card', () => {
    const card = cardFromResearch({
      id: 'w', title: 't', summary: null, authors: [], source: 'Energy Policy', publishedAt: '2025-01-01', doi: null,
      readUrl: 'https://x', kind: 'research', peerReviewed: null, regions: [], articleLicence: 'CC BY', articleVersion: 'Accepted version',
      provenance: buildProvenance('openalex', { sourceUrl: 'https://x', accessStatus: 'verified_open' }),
    });
    expect(card.licence).toBe('CC BY');
    expect(card.version).toBe('Accepted version');
    expect(card.openAccess).toBe(true);
  });

  const official = (over: Partial<OfficialUpdate>): OfficialUpdate => ({
    id: 'o', title: 'T', url: 'https://www.osti.gov/servlets/purl/1', organisation: 'Argonne National Laboratory', docType: 'Technical report',
    publishedAt: '2026-08-01', retrievedAt: new Date().toISOString(), sourceLabel: 'DOE OSTI.GOV', feed: 'osti', coverage: [], focus: null,
    verifiedOpen: true, accessCheckedAt: '2026-09-25T10:00:00.000Z', stale: false, authors: [], doi: null, peerReviewed: null,
    ...over,
  });

  it('shows the organisation and document type, not the product type as organisation (L454)', () => {
    const card = cardFromOfficial(official({}));
    expect(card.label).toBe('Technical report');
    expect(card.source).toBe('Argonne National Laboratory');
  });

  it('takes items from each feed in turn and drops future dates', () => {
    const eia = [official({ id: 'e1', url: 'https://eia/1', feed: 'eia_rss', publishedAt: '2026-09-20' }), official({ id: 'e2', url: 'https://eia/2', feed: 'eia_rss', publishedAt: '2026-09-19' })];
    const osti = [official({ id: 'x1', url: 'https://osti/1', publishedAt: '2027-02-01' }), official({ id: 'x2', url: 'https://osti/2', publishedAt: '2026-01-01' })];
    expect(interleaveFeeds([eia, osti]).map((i) => i.id)).toEqual(['e1', 'x2', 'e2']);
  });
});

describe('curated official source links (pp. 29, 48, 59)', () => {
  it('lists only links whose anonymous check opened the page', () => {
    const climate = publishedCuratedSources('climate-action-carbon-management').map((s) => s.organisation);
    // The UNFCCC pages answer with a bot wall, so they wait for a person.
    expect(climate).not.toContain('UNFCCC');
    expect(climate).toContain('IPCC');
  });
});

describe('news phrase matching variants', () => {
  const phrases = newsPhrases({ pdfPage: 0, researchThemes: [], newsBaskets: [['carbon markets', 'industrial decarbonisation', 'green data centres', 'ESG', 'loss and damage']] });

  it('keeps every original phrase', () => {
    expect(phrases).toEqual(expect.arrayContaining(['carbon markets', 'industrial decarbonisation', 'ESG', 'loss and damage']));
  });

  it('adds the singular so "carbon market" headlines match', () => {
    expect(phrases).toContain('carbon market');
  });

  it('adds US spellings', () => {
    expect(phrases).toContain('industrial decarbonization');
    expect(phrases).toContain('green data center');
  });

  it('leaves single words and "ss" endings alone', () => {
    expect(phrases).not.toContain('ES');
    expect(newsPhrases({ pdfPage: 0, researchThemes: [], newsBaskets: [['sustainable business']] })).toEqual(['sustainable business']);
  });
});

describe('cached data keeps its real age (p. 226)', () => {
  const HOUR = 3600 * 1000;

  it('reads the retrieval time from the provider Date header', () => {
    const res = new Response('{}', { headers: { Date: 'Wed, 23 Sep 2026 08:00:00 GMT' } });
    expect(upstreamRetrievedAt(res)).toBe('2026-09-23T08:00:00.000Z');
  });

  it('falls back to now when there is no usable Date header', () => {
    const before = Date.now();
    const at = Date.parse(upstreamRetrievedAt(new Response('{}')));
    expect(at).toBeGreaterThanOrEqual(before - 1000);
  });

  it('flags a response older than the provider refresh interval as stale', async () => {
    // A response the shared cache has held for 3 days, for a provider that
    // refreshes daily - i.e. refreshes have been failing.
    const old = new Date(Date.now() - 72 * HOUR).toUTCString();
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"ok":1}', { status: 200, headers: { Date: old } })));

    const result = await fetchFromProvider('world-bank-indicators', 'https://api.worldbank.org/x');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.stale).toBe(true);
    expect(Date.parse(result.retrievedAt)).toBe(Date.parse(old));
  });

  it('does not flag a fresh response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 200, headers: { Date: new Date().toUTCString() } })));
    const result = await fetchFromProvider('world-bank-indicators', 'https://api.worldbank.org/y');
    expect(result.ok && result.stale).toBe(false);
  });

  it('isStale compares a record against its own provider interval', () => {
    const provenance = buildProvenance('world-bank-indicators', {
      sourceUrl: 'https://data.worldbank.org/x',
      retrievedAt: new Date(Date.now() - 72 * HOUR).toISOString(),
    });
    expect(isStale(provenance)).toBe(true);
    expect(isStale({ ...provenance, retrievedAt: new Date().toISOString() })).toBe(false);
  });
});

describe('never silently mix measures (p. 227)', () => {
  const base: DataSeries = {
    id: 'a',
    label: 'A',
    unit: 'tonnes CO2e',
    frequency: 'annual',
    measureNote: 'CO2e, 100-year global warming potential.',
    area: 'QAT',
    observations: [{ period: '2022', value: 1 }],
    provenance: buildProvenance('climate-trace', { sourceUrl: 'https://climatetrace.org' }),
  };

  it('allows series measured the same way', () => {
    expect(mixedMeasureReason([base, { ...base, id: 'b', area: 'ARE' }])).toBeNull();
  });

  it('refuses annual next to monthly', () => {
    expect(mixedMeasureReason([base, { ...base, id: 'b', frequency: 'monthly' }])).toMatch(/frequencies/);
  });

  it('refuses different units', () => {
    expect(mixedMeasureReason([base, { ...base, id: 'b', unit: 'kt CO2e' }])).toMatch(/units/);
  });

  it('refuses different CO2e warming horizons', () => {
    const gwp20 = { ...base, id: 'b', measureNote: 'CO2e, 20-year global warming potential.' };
    expect(mixedMeasureReason([base, gwp20])).toMatch(/different bases/);
  });
});
