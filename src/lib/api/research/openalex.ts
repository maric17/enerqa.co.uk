import { fetchFromProvider, providerKey } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type ResearchItem } from '../core/types';
import { isDoiResolver, preferredReadUrl } from '../core/urls';

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
  source?: { display_name?: string } | null;
};

type OpenAlexWork = {
  id?: string;
  doi?: string | null;
  title?: string | null;
  display_name?: string | null;
  publication_date?: string | null;
  type?: string | null;
  open_access?: { is_oa?: boolean; oa_url?: string | null };
  best_oa_location?: OpenAlexLocation | null;
  primary_location?: OpenAlexLocation | null;
  authorships?: { author?: { display_name?: string } }[];
};

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
    select: 'id,doi,title,display_name,publication_date,type,open_access,best_oa_location,primary_location,authorships',
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
    // No verified open destination means the record does not publish (p. 227).
    if (!title || !readUrl) continue;

    items.push({
      id: work.id ?? readUrl,
      title: title.trim(),
      summary: null, // OpenAlex abstracts are inverted indexes; not worth reconstructing.
      authors: (work.authorships ?? [])
        .map((a) => a.author?.display_name)
        .filter((n): n is string => Boolean(n))
        .slice(0, 5),
      source: work.best_oa_location?.source?.display_name ?? work.primary_location?.source?.display_name ?? null,
      publishedAt: work.publication_date ?? null,
      doi: work.doi ?? null,
      readUrl,
      kind: 'research',
      // p. 212: "not every indexed work is peer reviewed". OpenAlex does not
      // state it per work, so this stays null rather than being guessed.
      peerReviewed: null,
      provenance: buildProvenance('openalex', {
        sourceUrl: readUrl,
        sourceId: work.id ?? null,
        sourceReleasedAt: work.publication_date ?? null,
        accessStatus: 'verified_open',
        accessEvidence: `Selected via filter=is_oa:true and resolved to ${isDoiResolver(readUrl) ? 'the publisher copy through its DOI, no repository copy being indexed' : 'an indexed open-access location'}; OpenAlex defines is_oa as readable without payment or login.`,
        transformations: ['Preferred a repository open-access copy over the DOI landing page'],
      }),
    });

    if (items.length >= perPage) break;
  }

  if (items.length === 0) return fail('openalex', 'no_results', 'No open-access research matched this topic.');
  return ok('openalex', items);
}
