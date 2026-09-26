import { fetchFromProvider } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type ResearchItem } from '../core/types';
import { preferredReadUrl, stripMarkup } from '../core/urls';
import { normaliseLanguage } from '../core/language';

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
 *
 * Throttle: p. 213's "<=2 requests/sec" is enforced for every DOAJ call in
 * core/health.ts (500 ms between requests, two in flight at most).
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
    journal?: { title?: string; publisher?: string; language?: string[] };
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
  /**
   * Only articles from this year on. DOAJ ranks by relevance across its whole
   * index, which put a 2011 paper on the Climate page; the research modules
   * use the same three-year window as OpenAlex.
   */
  fromYear?: number;
}): Promise<ConnectorResult<ResearchItem[]>> {
  const { search, pageSize = 6, fromYear } = options;
  if (!search.trim()) return fail('doaj', 'no_results', 'No search term supplied.');

  // DOAJ's search path takes Elasticsearch query-string syntax (checked live
  // on 25 Sep 2026: "... AND bibjson.year:[2023 TO 2026]" narrows the set).
  const query = fromYear ? `${search.trim()} AND bibjson.year:[${fromYear} TO ${new Date().getUTCFullYear()}]` : search.trim();
  const url = `${BASE}/${encodeURIComponent(query)}?pageSize=${Math.min(pageSize * 2, 50)}`;
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

    const ids = b?.identifier ?? [];
    const doi = ids.find((i) => i.type === 'doi')?.id ?? null;
    const issn = ids.find((i) => i.type === 'eissn')?.id ?? ids.find((i) => i.type === 'pissn')?.id ?? null;

    items.push({
      id: article.id ?? fulltextUrl,
      title: stripMarkup(title),
      summary: b?.abstract ? stripMarkup(b.abstract) || null : null,
      authors: (b?.author ?? []).map((a) => a.name).filter((n): n is string => Boolean(n)).slice(0, 5),
      source: b?.journal?.title ?? null,
      publishedAt: publishedDate(b?.year, b?.month),
      doi,
      readUrl: fulltextUrl,
      kind: 'research',
      // DOAJ does not state peer review per article, and not everything a
      // journal publishes (editorials, letters) is reviewed. The old blanket
      // "Peer reviewed" badge was an inference, which types.ts forbids.
      peerReviewed: null,
      organisation: b?.journal?.publisher ?? null,
      docType: null,
      // Filled for the records actually shown, from the journal's declared
      // article licence (see fetchDoajJournalLicence): DOAJ article records
      // carry none of their own.
      articleLicence: null,
      issn,
      // The journal's publishing language; DOAJ records no per-article one.
      language: b?.journal?.language?.length === 1 ? normaliseLanguage(b.journal.language[0]) : null,
      provenance: buildProvenance('doaj', {
        retrievedAt: res.retrievedAt,
        sourceUrl: fulltextUrl,
        sourceId: article.id ?? null,
        sourceReleasedAt: publishedDate(b?.year, b?.month),
        // Documented only; verified_open waits for the anonymous check (p. 209).
        accessStatus: 'unknown',
        accessEvidence: 'Documented open access: DOAJ indexes open-access journals only, and the destination is the record\'s own full-text link.',
        transformations: ['Selected the provider full-text link rather than the journal homepage or DOI'],
      }),
    });

    if (items.length >= pageSize) break;
  }

  if (items.length === 0) return fail('doaj', 'no_results', 'No open-access articles matched this topic.');
  return ok('doaj', items);
}

type DoajJournal = { bibjson?: { license?: { type?: string }[] } };

/**
 * p. 213: "identify the article's own licence". DOAJ article records have no
 * licence field; the journal record declares the licence its articles are
 * published under. Only a journal that declares exactly one licence gives an
 * article licence we can state - with several, which one applies is unknown,
 * so nothing is shown. Cached for a week: journal licences rarely change, and
 * each lookup counts against the same <=2 req/s DOAJ throttle.
 */
export async function fetchDoajJournalLicence(issn: string): Promise<string | null> {
  if (!/^\d{4}-\d{3}[\dXx]$/.test(issn)) return null;
  const res = await fetchFromProvider<{ results?: DoajJournal[] }>(
    'doaj',
    `https://doaj.org/api/search/journals/${encodeURIComponent(`issn:${issn}`)}`,
    { revalidate: 7 * 86400, timeoutMs: 15000 },
  );
  if (!res.ok) return null;
  const licences = (res.data.results?.[0]?.bibjson?.license ?? []).map((l) => l.type?.trim()).filter(Boolean);
  return licences.length === 1 ? (licences[0] as string) : null;
}
