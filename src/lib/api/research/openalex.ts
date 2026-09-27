import { fetchFromProvider, providerKey } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type ResearchItem } from '../core/types';
import { isDoiResolver, preferredReadUrl, stripMarkup } from '../core/urls';
import { normaliseLanguage } from '../core/language';

/**
 * OpenAlex - handoff p. 212 (Provider ID: openalex).
 *
 * Two things p. 212 is firm about:
 *  1. Enforce `filter=is_oa:true`. Current OpenAlex documentation defines that
 *     as full text readable without paying or logging in, which is exactly the
 *     test p. 209 applies to every destination.
 *  2. Prefer `best_oa_location.pdf_url`, then its landing page, and only fall
 *     back to `open_access.oa_url`. Do NOT link the generic DOI page when a
 *     vetted open copy exists - the DOI often lands on a paywall.
 *
 * Cost control: search costs $0.001/call against a $1/day free-key budget,
 * list/filter calls cost a tenth of that. One cached call per topic per day is
 * nowhere near the ceiling, but the budget in core/fetch.ts guards it anyway.
 */

const BASE = 'https://api.openalex.org/works';

type OpenAlexLocation = {
  is_oa?: boolean;
  pdf_url?: string | null;
  landing_page_url?: string | null;
  source?: { display_name?: string; host_organization_name?: string | null; type?: string | null } | null;
  /** e.g. "cc-by", "cc-by-nc-nd", "other-oa" - the licence of THIS copy (p. 212). */
  license?: string | null;
  /** "publishedVersion", "acceptedVersion" or "submittedVersion". */
  version?: string | null;
};

type OpenAlexWork = {
  id?: string;
  doi?: string | null;
  title?: string | null;
  display_name?: string | null;
  publication_date?: string | null;
  type?: string | null;
  /** ISO 639-1, detected by OpenAlex from the title and abstract. */
  language?: string | null;
  open_access?: { is_oa?: boolean; oa_url?: string | null };
  best_oa_location?: OpenAlexLocation | null;
  primary_location?: OpenAlexLocation | null;
  /** Every known copy. Used for alternative open copies when the first is gated. */
  locations?: OpenAlexLocation[] | null;
  authorships?: { author?: { display_name?: string } }[];
  abstract_inverted_index?: Record<string, number[]> | null;
};

/** OpenAlex work types that are not research at all, so never a "Research" card. */
const NOT_RESEARCH = new Set(['erratum', 'paratext', 'retraction', 'grant', 'peer-review', 'libguides', 'supplementary-materials']);

/** OpenAlex licence ids as a reader would write them. Anything unlisted is shown as given. */
const LICENCE_LABEL: Record<string, string> = {
  'cc-by': 'CC BY',
  'cc-by-sa': 'CC BY-SA',
  'cc-by-nd': 'CC BY-ND',
  'cc-by-nc': 'CC BY-NC',
  'cc-by-nc-sa': 'CC BY-NC-SA',
  'cc-by-nc-nd': 'CC BY-NC-ND',
  cc0: 'CC0',
  'public-domain': 'Public domain',
  // OpenAlex's own label for a free-to-read copy with no stated licence.
  'other-oa': 'Free to read, no open licence stated',
};

export function licenceLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  return LICENCE_LABEL[id.toLowerCase()] ?? id;
}

/** p. 212 "version ... labels": which manuscript the linked copy is. */
const VERSION_LABEL: Record<string, string> = {
  publishedVersion: 'Published version',
  acceptedVersion: 'Accepted version',
  submittedVersion: 'Submitted version',
};

export function versionLabel(version: string | null | undefined): string | null {
  return version ? VERSION_LABEL[version] ?? null : null;
}

/**
 * The other open copies of a work, repositories first (p. 212: prefer "a
 * vetted repository OA copy"), each with its own licence and version. The
 * access check tries them in turn when the preferred copy is gated.
 */
export function alternativeCopies(work: OpenAlexWork, readUrl: string): { url: string; licence: string | null; version: string | null }[] {
  const open = (work.locations ?? []).filter((loc) => loc?.is_oa);
  const ranked = [
    ...open.filter((loc) => loc.source?.type === 'repository'),
    ...open.filter((loc) => loc.source?.type !== 'repository'),
  ];
  const seen = new Set([readUrl]);
  const copies: { url: string; licence: string | null; version: string | null }[] = [];
  for (const loc of ranked) {
    for (const url of [loc.pdf_url, loc.landing_page_url]) {
      if (!url || !url.startsWith('http') || seen.has(url) || isDoiResolver(url)) continue;
      seen.add(url);
      copies.push({ url, licence: licenceLabel(loc.license), version: versionLabel(loc.version) });
    }
  }
  return copies.slice(0, 4);
}

/** The location the reader is actually sent to, so its licence and version describe what they get. */
function locationFor(work: OpenAlexWork, readUrl: string): OpenAlexLocation | null {
  for (const loc of [work.best_oa_location, work.primary_location]) {
    if (loc && (loc.pdf_url === readUrl || loc.landing_page_url === readUrl)) return loc;
  }
  return work.best_oa_location ?? null;
}

/**
 * p. 212's destination order: repository PDF, then its landing page, then the
 * open_access URL. `preferredReadUrl` additionally pushes a bare doi.org link
 * behind any real host, so a repository copy always wins over the resolver.
 */
function readUrlFor(work: OpenAlexWork): string | null {
  return preferredReadUrl([
    work.best_oa_location?.pdf_url,
    work.best_oa_location?.landing_page_url,
    work.open_access?.oa_url,
    work.primary_location?.pdf_url,
    work.primary_location?.landing_page_url,
  ]);
}

export function reconstructAbstract(invertedIndex: Record<string, number[]> | null | undefined): string | null {
  if (!invertedIndex) return null;
  const entries = Object.entries(invertedIndex);
  if (entries.length === 0) return null;
  
  let maxIndex = 0;
  for (const [, positions] of entries) {
    for (const pos of positions) {
      if (pos > maxIndex) maxIndex = pos;
    }
  }
  
  const words = new Array(maxIndex + 1).fill('');
  for (const [word, positions] of entries) {
    for (const pos of positions) {
      words[pos] = word;
    }
  }
  return words.join(' ');
}

export async function fetchOpenAlexWorks(options: {
  search: string;
  perPage?: number;
  /** Only works published on or after this date, ISO yyyy-mm-dd. */
  fromDate?: string;
}): Promise<ConnectorResult<ResearchItem[]>> {
  const { search, perPage = 6, fromDate } = options;
  if (!search.trim()) return fail('openalex', 'no_results', 'No search term supplied.');

  const filters = ['is_oa:true'];
  if (fromDate) filters.push(`from_publication_date:${fromDate}`);

  const params = new URLSearchParams({
    filter: filters.join(','),
    search: search.trim(),
    // p. 212: per_page max is 100. A few extra cover items we drop for
    // having no usable open destination.
    per_page: String(Math.min(perPage * 2, 100)),
    // Asking for only the fields we use keeps the response small.
    select: 'id,doi,title,display_name,publication_date,type,language,open_access,best_oa_location,primary_location,locations,authorships,abstract_inverted_index',
  });

  // The key is optional: OpenAlex has a no-key tier with a smaller allowance.
  const key = providerKey('openalex');
  if (key) params.set('api_key', key);

  const res = await fetchFromProvider<{ results?: OpenAlexWork[] }>('openalex', `${BASE}?${params.toString()}`);
  if (!res.ok) return res;

  const items: ResearchItem[] = [];

  for (const work of res.data.results ?? []) {
    const title = work.title ?? work.display_name;
    const readUrl = readUrlFor(work);
    // No open destination means the record does not publish (p. 227).
    if (!title || !readUrl) continue;
    if (work.type && NOT_RESEARCH.has(work.type)) continue;

    const location = locationFor(work, readUrl);
    // p. 28: "Separate journal research, reports and unreviewed preprints."
    // Only OpenAlex's own work type says "preprint". A submitted-version copy
    // of a published work is labelled by its version instead - OpenAlex marks
    // many repository copies that way, including a copy of an IPCC report.
    const preprint = work.type === 'preprint';

    items.push({
      id: work.id ?? readUrl,
      title: stripMarkup(title),
      summary: reconstructAbstract(work.abstract_inverted_index),
      authors: (work.authorships ?? [])
        .map((a) => a.author?.display_name)
        .filter((n): n is string => Boolean(n))
        .slice(0, 5),
      source: work.primary_location?.source?.display_name ?? work.best_oa_location?.source?.display_name ?? null,
      publishedAt: work.publication_date ?? null,
      doi: work.doi ?? null,
      readUrl,
      kind: work.type === 'report' ? 'report' : 'research',
      // p. 212: "not every indexed work is peer reviewed". OpenAlex does not
      // state it per work, so this stays null rather than being guessed.
      peerReviewed: null,
      organisation: work.primary_location?.source?.host_organization_name ?? null,
      docType: null,
      // p. 212: "Keep copyright/licence/version and preprint labels".
      articleLicence: licenceLabel(location?.license),
      articleVersion: versionLabel(location?.version),
      preprint,
      altCopies: alternativeCopies(work, readUrl),
      language: normaliseLanguage(work.language),
      provenance: buildProvenance('openalex', {
        retrievedAt: res.retrievedAt,
        sourceUrl: readUrl,
        sourceId: work.id ?? null,
        sourceReleasedAt: work.publication_date ?? null,
        // Documented OA only. `verified_open` needs the anonymous check of
        // the destination itself (p. 209), which the research aggregator runs
        // on the records it is about to show.
        accessStatus: 'unknown',
        accessEvidence: `Documented open access: selected via filter=is_oa:true (OpenAlex: readable without payment or login) and resolved to ${isDoiResolver(readUrl) ? 'the publisher copy through its DOI, no repository copy being indexed' : 'an indexed open-access location'}.`,
        transformations: ['Preferred a repository open-access copy over the DOI landing page'],
      }),
    });

    if (items.length >= perPage) break;
  }

  if (items.length === 0) return fail('openalex', 'no_results', 'No open-access research matched this topic.');
  return ok('openalex', items);
}
