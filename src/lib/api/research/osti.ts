import { fetchFromProvider } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type ResearchItem } from '../core/types';
import { stripMarkup } from '../core/urls';
import { normaliseLanguage } from '../core/language';

/**
 * DOE OSTI.GOV API v1 - handoff p. 215 (Provider ID: osti).
 *
 * ⚠️ NOT VERIFIED LIVE. On 2026-09-19 osti.gov resolved in DNS but every TCP
 * connection from the development network timed out. p. 215 records the same
 * thing happening during the spec review ("public docs briefly timed out
 * during recheck"), so this is a known flaky host rather than a wrong URL.
 *
 * The query below is the one p. 215 confirms:
 *   /api/v1/records?has_fulltext=true&q=energy%20storage
 *
 * Because the connector returns a typed failure rather than throwing, an
 * unreachable OSTI costs a page nothing. Confirm before launch.
 *
 * p. 215 rules encoded here:
 *  - Require has_fulltext=true.
 *  - Prefer the returned links entry with rel=fulltext. Never guess a purl.
 *  - Link out to OSTI rather than mirroring the material.
 */

const BASE = 'https://www.osti.gov/api/v1/records';

type OstiLink = { rel?: string; href?: string };

type OstiRecord = {
  osti_id?: string | number;
  title?: string;
  description?: string;
  authors?: string[];
  publication_date?: string;
  product_type?: string;
  doi?: string;
  links?: OstiLink[];
  journal_name?: string;
  publisher?: string;
  research_orgs?: string[];
  language?: string;
};

/**
 * OSTI's own product types, written as a reader would (p. 215 "product
 * type"). Reports and program documents are official reports; the rest are
 * research outputs (p. 37: "distinguish technical reports from market news").
 */
const PRODUCT_TYPES: Record<string, { label: string; kind: ResearchItem['kind'] }> = {
  'journal article': { label: 'Journal article', kind: 'research' },
  'technical report': { label: 'Technical report', kind: 'report' },
  'program document': { label: 'Program document', kind: 'report' },
  conference: { label: 'Conference paper', kind: 'research' },
  book: { label: 'Book', kind: 'research' },
  'thesis/dissertation': { label: 'Thesis', kind: 'research' },
  dataset: { label: 'Dataset', kind: 'report' },
  software: { label: 'Software', kind: 'report' },
  patent: { label: 'Patent', kind: 'report' },
};

/**
 * The issuing organisation as OSTI states it: the journal for an article, the
 * publisher for a book, the performing research organisation for a report.
 * Never the product type - the old code put "Journal Article" here (L454).
 */
export function ostiOrganisation(record: Pick<OstiRecord, 'product_type' | 'journal_name' | 'publisher' | 'research_orgs'>): string | null {
  const type = record.product_type?.toLowerCase();
  const org = record.research_orgs?.find((o) => o && o.trim())?.trim() ?? null;
  if (type === 'journal article') return record.journal_name?.trim() || record.publisher?.trim() || org;
  if (type === 'book') return record.publisher?.trim() || org;
  return org ?? record.publisher?.trim() ?? null;
}

export async function fetchOstiRecords(options: {
  search: string;
  rows?: number;
}): Promise<ConnectorResult<ResearchItem[]>> {
  const { search, rows = 6 } = options;
  if (!search.trim()) return fail('osti', 'no_results', 'No search term supplied.');

  const params = new URLSearchParams({
    has_fulltext: 'true',
    q: search.trim(),
    rows: String(Math.min(rows * 2, 50)),
  });

  const res = await fetchFromProvider<OstiRecord[]>('osti', `${BASE}?${params.toString()}`, {
    // Shorter than the default: this host is known to hang, and a page render
    // must not wait on it.
    timeoutMs: 8000,
  });
  if (!res.ok) return res;

  const records = Array.isArray(res.data) ? res.data : [];
  const items: ResearchItem[] = [];

  for (const record of records) {
    // L524: OSTI titles carry markup ("<em>in situ</em>"); we print text.
    const title = record.title ? stripMarkup(record.title) : '';
    // p. 215: use the returned rel=fulltext href, and if it is absent, skip
    // the record rather than constructing a URL and hoping.
    const fulltext = (record.links ?? []).find((l) => l.rel === 'fulltext' && l.href)?.href;
    if (!title || !fulltext) continue;

    const type = PRODUCT_TYPES[record.product_type?.toLowerCase() ?? ''];
    const organisation = ostiOrganisation(record);

    items.push({
      id: String(record.osti_id ?? fulltext),
      title,
      summary: record.description ? stripMarkup(record.description) || null : null,
      // OSTI appends affiliations to author names ("Smith, J. [NREL]"); keep
      // the name only, since affiliation is not coverage (p. 179).
      authors: (record.authors ?? []).map((a) => a.replace(/\s*[[(].*$/, '').trim()).filter(Boolean).slice(0, 5),
      source: organisation,
      publishedAt: record.publication_date ?? null,
      doi: record.doi ?? null,
      readUrl: fulltext,
      kind: type?.kind ?? 'research',
      peerReviewed: null,
      organisation,
      // p. 215 "product type", as OSTI states it; nothing when it is missing.
      docType: type?.label ?? record.product_type ?? null,
      language: normaliseLanguage(record.language),
      provenance: buildProvenance('osti', {
        retrievedAt: res.retrievedAt,
        sourceUrl: fulltext,
        sourceId: record.osti_id ? String(record.osti_id) : null,
        sourceReleasedAt: record.publication_date ?? null,
        // Documented only; verified_open waits for the anonymous check (p. 209).
        accessStatus: 'unknown',
        accessEvidence: 'Documented full text: selected with has_fulltext=true and a provider-supplied rel=fulltext link.',
        transformations: ['Rejected citation-only and request-access records', 'Removed inline markup from the title'],
      }),
    });

    if (items.length >= rows) break;
  }

  if (items.length === 0) return fail('osti', 'no_results', 'No full-text DOE research matched this topic.');
  return ok('osti', items);
}
