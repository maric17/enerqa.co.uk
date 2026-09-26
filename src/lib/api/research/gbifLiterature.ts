import { fetchFromProvider } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type ResearchItem } from '../core/types';
import { stripMarkup } from '../core/urls';
import { normaliseLanguage } from '../core/language';

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
  publisher?: string;
  /** ISO 639-2, e.g. "eng". */
  language?: string;
  /** p. 216: the study-focus geography, as ISO 3166 alpha-2 codes. */
  countriesOfCoverage?: string[];
  /** p. 216: the researchers' institutional countries. Never used as coverage. */
  countriesOfResearcher?: string[];
};

/** GBIF's literature types, as a reader would write them. */
const LITERATURE_TYPES: Record<string, { label: string; kind: ResearchItem['kind'] }> = {
  JOURNAL: { label: 'Journal article', kind: 'research' },
  BOOK: { label: 'Book', kind: 'research' },
  BOOK_SECTION: { label: 'Book chapter', kind: 'research' },
  CONFERENCE_PROCEEDINGS: { label: 'Conference paper', kind: 'research' },
  THESIS: { label: 'Thesis', kind: 'research' },
  REPORT: { label: 'Report', kind: 'report' },
  WORKING_PAPER: { label: 'Working paper', kind: 'report' },
  GENERIC: { label: 'Publication', kind: 'research' },
};

/**
 * The organisation that issued the work: the publisher GBIF records, else the
 * journal. Never "GBIF Literature API" - that is the index, not the issuer
 * (L1043).
 */
export function gbifOrganisation(record: Pick<GbifLiterature, 'publisher' | 'source'>): string | null {
  return record.publisher?.trim() || record.source?.trim() || null;
}

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

    const type = LITERATURE_TYPES[record.literatureType?.toUpperCase() ?? ''];

    items.push({
      id: record.id ?? readUrl,
      title: stripMarkup(title),
      summary: record.abstract ? stripMarkup(record.abstract) || null : null,
      authors: (record.authors ?? []).map(authorName).filter((n): n is string => Boolean(n)).slice(0, 5),
      source: record.source?.trim() || gbifOrganisation(record),
      publishedAt: published,
      doi: record.identifiers?.doi ?? null,
      readUrl,
      kind: type?.kind ?? 'research',
      // Reported by the provider, so it can be stated rather than assumed.
      peerReviewed: typeof record.peerReview === 'boolean' ? record.peerReview : null,
      organisation: gbifOrganisation(record),
      docType: type?.label ?? null,
      // p. 216: "Preserve researcher-country versus coverage-country
      // distinction." Kept apart here; only coverage ever becomes geography.
      countriesOfCoverage: (record.countriesOfCoverage ?? []).filter(Boolean),
      countriesOfResearcher: (record.countriesOfResearcher ?? []).filter(Boolean),
      language: normaliseLanguage(record.language),
      provenance: buildProvenance('gbif-literature', {
        retrievedAt: res.retrievedAt,
        sourceUrl: readUrl,
        sourceId: record.id ?? null,
        sourceReleasedAt: published,
        // Documented only; verified_open waits for the anonymous check (p. 209).
        accessStatus: 'unknown',
        accessEvidence: 'Documented open access: selected with openAccess=true and resolved to the record\'s own website link.',
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
