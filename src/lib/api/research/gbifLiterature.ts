import { fetchFromProvider } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type ResearchItem } from '../core/types';

/**
 * GBIF Literature API - handoff pp. 216-217 (Provider ID: gbif-literature).
 *
 * p. 216: "Require openAccess=true, then resolve a vetted OA full-text
 * location rather than blindly linking DOI." GBIF gives a `websites` array; a
 * record with nothing in it is dropped rather than linked on faith.
 *
 * `peerReview` is reported by GBIF per record, so unlike OpenAlex this
 * connector can state it instead of leaving it null.
 */

const BASE = 'https://api.gbif.org/v1/literature/search';

type GbifLiterature = {
  id?: string;
  title?: string;
  abstract?: string;
  authors?: { firstName?: string; lastName?: string }[];
  year?: number;
  month?: number;
  source?: string;
  websites?: string[];
  identifiers?: { doi?: string };
  literatureType?: string;
  peerReview?: boolean;
  openAccess?: boolean;
};

/** doi.org and dx.doi.org are resolvers, not reading destinations. */
function isDoiResolver(url: string): boolean {
  try {
    return /^(dx\.)?doi\.org$/i.test(new URL(url).hostname.replace(/^www\./, ''));
  } catch {
    return false;
  }
}

function authorName(a: { firstName?: string; lastName?: string }): string | null {
  const name = [a.firstName, a.lastName].filter(Boolean).join(' ').trim();
  return name || null;
}

export async function fetchGbifLiterature(options: {
  search: string;
  limit?: number;
}): Promise<ConnectorResult<ResearchItem[]>> {
  const { search, limit = 6 } = options;
  if (!search.trim()) return fail('gbif-literature', 'no_results', 'No search term supplied.');

  const params = new URLSearchParams({
    openAccess: 'true',
    q: search.trim(),
    limit: String(Math.min(limit * 2, 50)),
  });

  const res = await fetchFromProvider<{ results?: GbifLiterature[] }>(
    'gbif-literature',
    `${BASE}?${params.toString()}`,
    { timeoutMs: 20000 },
  );
  if (!res.ok) return res;

  const items: ResearchItem[] = [];

  for (const record of res.data.results ?? []) {
    const title = record.title?.trim();
    // p. 216: "resolve a vetted OA full-text location rather than blindly
    // linking DOI" and "exclude records without a verified full-reading URL".
    // GBIF often lists only a doi.org resolver in `websites`, which is the
    // blind DOI link the rule exists to prevent - it frequently lands on a
    // publisher paywall. So a non-resolver website is required.
    const readUrl = record.websites?.find((w) => w?.startsWith('http') && !isDoiResolver(w));
    if (!title || !readUrl) continue;
    // Belt and braces: the query asks for open access, and so does this.
    if (record.openAccess === false) continue;

    const published =
      record.year && Number.isFinite(record.year)
        ? `${record.year}-${String(record.month ?? 1).padStart(2, '0')}-01`
        : null;

    items.push({
      id: record.id ?? readUrl,
      title,
      summary: record.abstract?.trim() || null,
      authors: (record.authors ?? []).map(authorName).filter((n): n is string => Boolean(n)).slice(0, 5),
      source: record.source ?? null,
      publishedAt: published,
      doi: record.identifiers?.doi ?? null,
      readUrl,
      kind: 'research',
      // Reported by the provider, so it can be stated rather than assumed.
      peerReviewed: typeof record.peerReview === 'boolean' ? record.peerReview : null,
      provenance: buildProvenance('gbif-literature', {
        sourceUrl: readUrl,
        sourceId: record.id ?? null,
        sourceReleasedAt: published,
        accessStatus: 'verified_open',
        accessEvidence: 'Selected with openAccess=true and resolved to the record\'s own website link.',
        transformations: ['Kept only records carrying a full-text website link, excluding bare DOI resolvers'],
      }),
    });

    if (items.length >= limit) break;
  }

  if (items.length === 0) {
    return fail('gbif-literature', 'no_results', 'No open-access biodiversity literature matched this topic.');
  }
  return ok('gbif-literature', items);
}
