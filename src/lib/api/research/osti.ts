import { fetchFromProvider } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type ResearchItem } from '../core/types';

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
};

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
    const title = record.title?.trim();
    // p. 215: use the returned rel=fulltext href, and if it is absent, skip
    // the record rather than constructing a URL and hoping.
    const fulltext = (record.links ?? []).find((l) => l.rel === 'fulltext' && l.href)?.href;
    if (!title || !fulltext) continue;

    items.push({
      id: String(record.osti_id ?? fulltext),
      title,
      summary: record.description?.trim() || null,
      authors: (record.authors ?? []).slice(0, 5),
      source: record.product_type ?? 'DOE OSTI',
      publishedAt: record.publication_date ?? null,
      doi: record.doi ?? null,
      readUrl: fulltext,
      kind: 'research',
      peerReviewed: null,
      provenance: buildProvenance('osti', {
        sourceUrl: fulltext,
        sourceId: record.osti_id ? String(record.osti_id) : null,
        sourceReleasedAt: record.publication_date ?? null,
        accessStatus: 'verified_open',
        accessEvidence: 'Selected with has_fulltext=true and a provider-supplied rel=fulltext link.',
        transformations: ['Rejected citation-only and request-access records'],
      }),
    });

    if (items.length >= rows) break;
  }

  if (items.length === 0) return fail('osti', 'no_results', 'No full-text DOE research matched this topic.');
  return ok('osti', items);
}
