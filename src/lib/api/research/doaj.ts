import { fetchFromProvider } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type ResearchItem } from '../core/types';
import { preferredReadUrl } from '../core/urls';

/**
 * DOAJ - handoff pp. 213-214 (Provider ID: doaj).
 *
 * ⚠️ LAUNCH GATE. p. 213: "Current API docs blocked during recheck. No
 * confidently reverified current numeric quota: use conservative <=2
 * requests/sec initially and verify official docs before launch; do not
 * advertise unlimited." The registry records the same. We cache for a day and
 * make one call per topic, which is far inside any plausible limit, but the
 * quota still has to be confirmed by a human before go-live.
 *
 * p. 213 also asks for the article's own full-text link rather than a journal
 * homepage or a DOI abstract, so a record without a `fulltext` link is
 * dropped rather than linked hopefully.
 */

const BASE = 'https://doaj.org/api/search/articles';

type DoajLink = { type?: string; url?: string; content_type?: string };
type DoajIdentifier = { id?: string; type?: string };

type DoajArticle = {
  id?: string;
  bibjson?: {
    title?: string;
    abstract?: string;
    year?: string;
    month?: string;
    author?: { name?: string }[];
    journal?: { title?: string };
    link?: DoajLink[];
    identifier?: DoajIdentifier[];
  };
};

function publishedDate(year?: string, month?: string): string | null {
  if (!year || !/^\d{4}$/.test(year)) return null;
  const m = month && /^\d{1,2}$/.test(month) ? month.padStart(2, '0') : '01';
  return `${year}-${m}-01`;
}

export async function fetchDoajArticles(options: {
  search: string;
  pageSize?: number;
}): Promise<ConnectorResult<ResearchItem[]>> {
  const { search, pageSize = 6 } = options;
  if (!search.trim()) return fail('doaj', 'no_results', 'No search term supplied.');

  const url = `${BASE}/${encodeURIComponent(search.trim())}?pageSize=${Math.min(pageSize * 2, 50)}`;
  const res = await fetchFromProvider<{ results?: DoajArticle[] }>('doaj', url, { timeoutMs: 20000 });
  if (!res.ok) return res;

  const items: ResearchItem[] = [];

  for (const article of res.data.results ?? []) {
    const b = article.bibjson;
    const title = b?.title?.trim();
    if (!title) continue;

    // Only a link the provider itself labels full text counts as a
    // destination. A journal homepage is not the article (p. 213). Where DOAJ
    // lists several, a direct publisher host is preferred over a doi.org
    // resolver.
    const fulltextUrl = preferredReadUrl((b?.link ?? []).filter((l) => l.type === 'fulltext').map((l) => l.url));
    if (!fulltextUrl) continue;

    const doi = (b?.identifier ?? []).find((i) => i.type === 'doi')?.id ?? null;

    items.push({
      id: article.id ?? fulltextUrl,
      title,
      summary: b?.abstract?.trim() || null,
      authors: (b?.author ?? []).map((a) => a.name).filter((n): n is string => Boolean(n)).slice(0, 5),
      source: b?.journal?.title ?? null,
      publishedAt: publishedDate(b?.year, b?.month),
      doi,
      readUrl: fulltextUrl,
      kind: 'research',
      // Every DOAJ journal is peer reviewed as a condition of being indexed.
      peerReviewed: true,
      provenance: buildProvenance('doaj', {
        sourceUrl: fulltextUrl,
        sourceId: article.id ?? null,
        sourceReleasedAt: publishedDate(b?.year, b?.month),
        accessStatus: 'verified_open',
        accessEvidence: 'DOAJ indexes open-access journals only, and the destination is the record\'s own full-text link.',
        transformations: ['Selected the provider full-text link rather than the journal homepage or DOI'],
      }),
    });

    if (items.length >= pageSize) break;
  }

  if (items.length === 0) return fail('doaj', 'no_results', 'No open-access articles matched this topic.');
  return ok('doaj', items);
}
