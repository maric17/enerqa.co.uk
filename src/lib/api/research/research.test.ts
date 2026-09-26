import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildProvenance } from '../core/provenance';
import { resetHealth } from '../core/health';
import type { AccessVerdict } from '../core/accessCheck';
import { stripMarkup } from '../core/urls';
import type { ProviderId, ResearchItem } from '../core/types';
import {
  gateResearch,
  isFutureDate,
  mergeByProvider,
  SCHOLARLY_PROVIDERS,
  verifyForDisplay,
  type TaggedResearchItem,
} from './index';
import { fetchOstiRecords, ostiOrganisation } from './osti';
import { fetchDoajArticles } from './doaj';
import { gbifOrganisation } from './gbifLiterature';
import { reliefWebDestination } from './reliefweb';
import { alternativeCopies, licenceLabel, versionLabel } from './openalex';

afterEach(() => {
  vi.unstubAllGlobals();
  resetHealth();
});

function item(id: string, providerId: ProviderId, extra: Partial<ResearchItem> = {}): TaggedResearchItem {
  return {
    id,
    title: `Carbon markets and climate finance ${id}`,
    summary: null,
    authors: [],
    source: null,
    publishedAt: '2025-03-01',
    doi: `10.1/${id}`,
    readUrl: `https://example.org/${id}`,
    kind: 'research',
    peerReviewed: null,
    regions: [],
    provenance: buildProvenance(providerId, { sourceUrl: `https://example.org/${id}` }),
    ...extra,
  };
}

const open = async (): Promise<AccessVerdict> => ({
  status: 'verified_open',
  checkedAt: '2026-09-25T10:00:00.000Z',
  evidence: 'Opened.',
  finalUrl: null,
});

describe('research ranking (pp. 28, 37, 48, 59, 65; L417, L522)', () => {
  it('ranks by provider - OpenAlex first, DOAJ second - never newest-first', () => {
    expect(SCHOLARLY_PROVIDERS).toEqual(['openalex', 'doaj']);
    const merged = mergeByProvider(SCHOLARLY_PROVIDERS, [
      [item('d1', 'doaj', { publishedAt: '2026-09-01' }), item('o1', 'openalex', { publishedAt: '2023-01-01' })],
      [item('o2', 'openalex'), item('d2', 'doaj')],
    ]);
    expect(merged.map((i) => i.id)).toEqual(['o1', 'o2', 'd1', 'd2']);
  });

  it('takes OpenAlex records from each theme in turn', () => {
    const merged = mergeByProvider(['openalex'], [
      [item('a1', 'openalex'), item('a2', 'openalex')],
      [item('b1', 'openalex')],
    ]);
    expect(merged.map((i) => i.id)).toEqual(['a1', 'b1', 'a2']);
  });

  it('keeps one card per DOI, in the higher-ranked slot', () => {
    const merged = mergeByProvider(SCHOLARLY_PROVIDERS, [[item('same', 'openalex'), item('same', 'doaj')]]);
    expect(merged).toHaveLength(1);
  });

  it('treats the same work under two DOIs as one record', () => {
    const merged = mergeByProvider(['openalex'], [[
      item('a', 'openalex', { title: 'IPCC, 2023: Climate Change 2023: Synthesis Report. Contribution of Working Groups I, II and III' }),
      item('b', 'openalex', { title: 'Climate Change 2023 Synthesis Report' }),
      item('c', 'openalex', { title: 'Climate change' }),
    ]]);
    expect(merged.map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('drops records dated after today (p. 226)', () => {
    const now = new Date('2026-09-25T12:00:00Z');
    expect(isFutureDate('2027-02-01', now)).toBe(true);
    expect(isFutureDate('2026-09-25', now)).toBe(false);
    const kept = gateResearch([item('f', 'osti', { publishedAt: '2027-01-01' }), item('p', 'osti')], 'carbon markets', now);
    expect(kept.map((i) => i.id)).toEqual(['p']);
  });

  it('publishes only records whose destination passed the anonymous check', async () => {
    const check = async (url: string): Promise<AccessVerdict> => ({
      status: url.endsWith('/o1') ? 'gated' : 'verified_open',
      checkedAt: '2026-09-25T10:00:00.000Z',
      evidence: 'x',
      finalUrl: url,
    });
    const shown = await verifyForDisplay([item('o1', 'openalex'), item('o2', 'openalex'), item('o3', 'openalex')], 2, check);
    expect(shown.map((i) => i.id)).toEqual(['o2', 'o3']);
    expect(shown.every((i) => i.provenance.accessStatus === 'verified_open')).toBe(true);
    expect(shown[0].provenance.accessCheckedAt).toBe('2026-09-25T10:00:00.000Z');
  });

  it('switches to an alternative open copy, with that copy\'s own licence', async () => {
    const check = async (url: string): Promise<AccessVerdict> => ({
      status: url.includes('repository') ? 'verified_open' : 'unknown',
      checkedAt: '2026-09-25T10:00:00.000Z',
      evidence: 'x',
      finalUrl: url,
    });
    const record = item('o1', 'openalex', {
      articleLicence: 'CC BY-NC-ND',
      altCopies: [{ url: 'https://repository.org/o1.pdf', licence: 'CC BY', version: 'Accepted version' }],
    });
    const [shown] = await verifyForDisplay([record], 1, check);
    expect(shown.readUrl).toBe('https://repository.org/o1.pdf');
    expect(shown.articleLicence).toBe('CC BY');
    expect(shown.articleVersion).toBe('Accepted version');
  });
});

describe('OSTI (p. 215; L524, L1039)', () => {
  it('strips inline markup from titles', () => {
    expect(stripMarkup('Upgrading Biogas through <em>in situ</em> CO<sub>2</sub> &amp; H&#8322;')).toBe('Upgrading Biogas through in situ CO2 & H₂');
  });

  it('names the real organisation, never the product type', () => {
    expect(ostiOrganisation({ product_type: 'Journal Article', journal_name: 'Applied Energy', research_orgs: ['NREL'] })).toBe('Applied Energy');
    expect(ostiOrganisation({ product_type: 'Technical Report', research_orgs: ['National Renewable Energy Laboratory (NREL), Golden, CO (United States)'] })).toBe(
      'National Renewable Energy Laboratory (NREL), Golden, CO (United States)',
    );
  });

  it('maps OSTI records: document type, organisation, clean title, access left to the check', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify([
            {
              osti_id: '1',
              title: 'Upgrading Biogas through <em>in situ</em> methanation',
              product_type: 'Technical Report',
              research_orgs: ['Argonne National Laboratory (ANL), Argonne, IL (United States)'],
              authors: ['Smith, Jane [ANL]', 'Doe, J. (ORCID:0000)'],
              publication_date: '2026-03-01T00:00:00Z',
              links: [{ rel: 'fulltext', href: 'https://www.osti.gov/servlets/purl/1' }],
            },
          ]),
          { status: 200 },
        ),
      ),
    );
    const res = await fetchOstiRecords({ search: 'biogas upgrading' });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const [r] = res.data;
    expect(r.title).toBe('Upgrading Biogas through in situ methanation');
    expect(r.docType).toBe('Technical report');
    expect(r.kind).toBe('report');
    expect(r.organisation).toMatch(/^Argonne/);
    expect(r.authors).toEqual(['Smith, Jane', 'Doe, J.']);
    // No connector claims verified_open any more (L1021).
    expect(r.provenance.accessStatus).toBe('unknown');
  });
});

describe('DOAJ (p. 213; L1034)', () => {
  it('no longer asserts peer review for every article, and keeps the ISSN for the licence lookup', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            results: [
              {
                id: 'a',
                bibjson: {
                  title: 'Circular economy in food waste',
                  year: '2025',
                  journal: { title: 'Holistic Approach', publisher: 'HRCPO' },
                  link: [{ type: 'fulltext', url: 'https://journal.example/a.pdf' }],
                  identifier: [{ type: 'doi', id: '10.1/a' }, { type: 'eissn', id: '1848-0071' }],
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );
    const res = await fetchDoajArticles({ search: 'circular economy', fromYear: 2023 });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data[0].peerReviewed).toBeNull();
    expect(res.data[0].issn).toBe('1848-0071');
    expect(res.data[0].organisation).toBe('HRCPO');
  });
});

describe('GBIF literature (pp. 216-217; L1043)', () => {
  it('never uses the index name as the organisation', () => {
    expect(gbifOrganisation({ publisher: 'The World Bank Group', source: undefined })).toBe('The World Bank Group');
    expect(gbifOrganisation({ publisher: undefined, source: 'Ecology Letters' })).toBe('Ecology Letters');
    expect(gbifOrganisation({})).toBeNull();
  });
});

describe('ReliefWeb (p. 214; L1036)', () => {
  it('rejects a summary-only report and prefers the hosted PDF', () => {
    expect(reliefWebDestination({ url: 'https://reliefweb.int/report/x', body: 'Short summary.' })).toBeNull();
    expect(
      reliefWebDestination({ url: 'https://reliefweb.int/report/x', body: 'x', file: [{ url: 'https://reliefweb.int/a.pdf', mimetype: 'application/pdf' }] }),
    ).toBe('https://reliefweb.int/a.pdf');
    expect(reliefWebDestination({ url: 'https://reliefweb.int/report/y', body: 'word '.repeat(400) })).toBe('https://reliefweb.int/report/y');
  });
});

describe('OpenAlex labels (p. 212; L1032)', () => {
  it('states licence and version in plain words', () => {
    expect(licenceLabel('cc-by-nc-nd')).toBe('CC BY-NC-ND');
    expect(licenceLabel(null)).toBeNull();
    expect(versionLabel('acceptedVersion')).toBe('Accepted version');
  });

  it('lists repository copies first as alternatives', () => {
    const copies = alternativeCopies(
      {
        locations: [
          { is_oa: true, pdf_url: 'https://publisher.com/x.pdf', source: { type: 'journal' }, license: 'cc-by' },
          { is_oa: true, pdf_url: 'https://europepmc.org/x.pdf', source: { type: 'repository' }, version: 'acceptedVersion' },
          { is_oa: false, pdf_url: 'https://closed.com/x.pdf', source: { type: 'repository' } },
        ],
      },
      'https://publisher.com/x.pdf',
    );
    expect(copies.map((c) => c.url)).toEqual(['https://europepmc.org/x.pdf']);
    expect(copies[0].version).toBe('Accepted version');
  });
});

it('verifies with the default check when none is injected (smoke, no network)', async () => {
  // A disabled-network check always fails closed, so nothing publishes.
  vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
  const shown = await verifyForDisplay([item('z1', 'openalex')], 1);
  expect(shown).toEqual([]);
  expect(await open()).toBeTruthy();
});
