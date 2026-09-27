import { isStale, publishableOnly } from '../core/provenance';
import { applyVerdict, firstVerified, type AccessVerdict } from '../core/accessCheck';
import { allAskedFailed, type ConnectorResult, type ResearchItem, type ProviderId } from '../core/types';
import { extractRegions, type RegionKey } from '../news/geography';
import { fetchOpenAlexWorks } from './openalex';
import { fetchDoajArticles, fetchDoajJournalLicence } from './doaj';
import { fetchGbifLiterature } from './gbifLiterature';
import { fetchOstiRecords } from './osti';
import { fetchReliefWebReports } from './reliefweb';

export type { ResearchItem } from '../core/types';
export { fetchIssuerFilings, DEFAULT_WATCHLIST } from './secEdgar';

/**
 * One entry point for "Research and Articles" (handoff p. 212 onward).
 *
 * Same shape as the news aggregator: several providers, one shared cache, a
 * single gate on the way out. A provider that is disabled, unconfigured or
 * unreachable contributes nothing and costs nothing - it does not fail the
 * batch and it never produces a placeholder.
 */

/** The research connectors that take a keyword search. */
export type ResearchProvider = 'openalex' | 'doaj' | 'osti' | 'gbif-literature' | 'reliefweb';

/**
 * pp. 28, 37, 48, 59 (CR/ER/NR/BR) and p. 65 (I{nn}R): "OpenAlex with
 * is_oa:true first, DOAJ supplementary". The order of this list IS the
 * ranking. OSTI and GBIF literature are specialist feeds that the spec places
 * only in particular official-updates modules, never here.
 */
export const SCHOLARLY_PROVIDERS: ResearchProvider[] = ['openalex', 'doaj'];

/**
 * A research record with the coverage geography p. 226 asks for ("apply
 * language/geography tags ... before display"). Regions come from the title and
 * abstract only - p. 179 rules out a researcher's affiliation, and OSTI puts
 * affiliations inside the author strings, so authors are never read.
 */
export type TaggedResearchItem = ResearchItem & { regions: RegionKey[] };

export type ResearchResult = {
  items: TaggedResearchItem[];
  /** Providers that actually contributed a displayed item. */
  sources: { id: ProviderId; name: string }[];
  /**
   * Providers that were asked but returned nothing, with the reason. Useful in
   * the server log and for an honest "some sources unavailable" note; never a
   * reason to invent a result.
   */
  skipped: { id: string; reason: string; message: string }[];
  retrievedAt: string;
  unavailable: boolean;
  /** No provider answered at all (as opposed to answering with nothing relevant). */
  sourcesFailed: boolean;
  /** A displayed item is older than its provider's refresh interval (p. 227). */
  stale: boolean;
};

/** DOI is the strongest identity; fall back to the destination URL. */
function dedupeKey(item: ResearchItem): string {
  if (item.doi) return item.doi.toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, '');
  return item.readUrl.split('?')[0].toLowerCase();
}

/**
 * Which COPY survives when the same paper arrives from two indexes. DOAJ and
 * GBIF state peer-review status and carry an abstract, so their copy is the
 * richer one. This never changes the ranking: the survivor keeps the place of
 * the higher-ranked provider.
 */
const DEDUPE_PRIORITY: Record<string, number> = {
  doaj: 0,
  'gbif-literature': 1,
  openalex: 2,
  osti: 3,
  reliefweb: 4,
  'sec-edgar': 5,
};

/**
 * Publication-date validation (p. 226). OSTI and OpenAlex both carry the
 * scheduled date of a future journal issue ("1 Feb 2027"); a date after today
 * is not a publication date yet, so the record waits until it is.
 */
export function isFutureDate(iso: string | null, now = new Date()): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return false;
  return d.toISOString().slice(0, 10) > now.toISOString().slice(0, 10);
}

/**
 * "Recent research" (p. 212). OpenAlex ranks a search by relevance across its
 * whole index, which put papers from 1999 and 2006 on the Energy page. p. 212
 * suggests a "daily batch per topic/date filter", so OpenAlex is asked for the
 * last three calendar years. The window moves once a year, so the cached URL -
 * and the daily budget - stay stable.
 */
export function recentFromDate(now = new Date()): string {
  return `${now.getUTCFullYear() - 3}-01-01`;
}

/** Theme words too general to show that a record is on topic. */
const GENERIC_WORDS = new Set([
  'and', 'with', 'from', 'into', 'data', 'activity', 'assessment', 'analysis', 'system', 'systems',
  'model', 'models', 'modelling', 'feasibility', 'impact', 'impacts', 'evaluation', 'monitoring',
  'project', 'projects', 'screening', 'public', 'development',
]);

/**
 * The distinctive words of a research theme, as word-start stems so
 * "decarbonisation" also matches "decarbonization" and "electricity" matches
 * "electric". Short acronyms (ESG, MRV, GHG) are kept whole.
 */
export function themeStems(theme: string): string[] {
  return [
    ...new Set(
      theme
        .split(/\s+/)
        .filter(Boolean)
        .flatMap((word) => {
          if (/^[A-Z0-9]{2,}$/.test(word)) return [word.toLowerCase()];
          const w = word.toLowerCase();
          if (w.length < 4 || GENERIC_WORDS.has(w)) return [];
          return [w.slice(0, 6)];
        }),
    ),
  ];
}

/**
 * Relevance filtering (p. 226: "domain and industry relevance ... before
 * display"). A record must share at least one distinctive theme word with the
 * query in its title or abstract. This is what removes the off-topic OSTI
 * records the search engine returns for a long theme ("Large language models
 * for transportation research" on the ESG page).
 */
export function isOnTheme(item: Pick<ResearchItem, 'title' | 'summary'>, theme: string): boolean {
  const stems = themeStems(theme);
  if (stems.length === 0) return true;
  const text = `${item.title} ${item.summary ?? ''}`;
  return stems.some((stem) => new RegExp(`(?<![\\p{L}\\p{N}])${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'iu').test(text));
}

function callProvider(provider: ResearchProvider, search: string, limit: number): Promise<ConnectorResult<ResearchItem[]>> {
  switch (provider) {
    case 'openalex':
      return fetchOpenAlexWorks({ search, perPage: limit, fromDate: recentFromDate() });
    case 'doaj':
      return fetchDoajArticles({ search, pageSize: limit, fromYear: Number(recentFromDate().slice(0, 4)) });
    case 'osti':
      return fetchOstiRecords({ search, rows: limit });
    case 'gbif-literature':
      return fetchGbifLiterature({ search, limit });
    case 'reliefweb':
      return fetchReliefWebReports({ query: search, limit });
  }
}

/**
 * The shared gate for one provider's records: no future dates, on the theme,
 * and tagged with coverage geography. Access is NOT decided here: every
 * connector returns `unknown` with its documented OA evidence, and only the
 * records about to be shown are checked (`verifyForDisplay`), because p. 209
 * wants the anonymous check of the final destination, not the index's word.
 */
export function gateResearch(items: ResearchItem[], theme: string, now = new Date()): TaggedResearchItem[] {
  return items
    .filter((item) => !isFutureDate(item.publishedAt, now))
    .filter((item) => isOnTheme(item, theme))
    .map((item) => ({ ...item, regions: extractRegions(item.title, item.summary) }));
}

/**
 * p. 209 / p. 227: open each candidate's destination anonymously, in rank
 * order, until `limit` have passed. Only those publish, carrying the real
 * check time and what was seen. Everything else stays `unknown`, `gated` or
 * `broken` and is dropped by `publishableOnly()`.
 */
export async function verifyForDisplay<T extends ResearchItem>(
  candidates: T[],
  limit: number,
  check?: (url: string) => Promise<AccessVerdict>,
): Promise<T[]> {
  const passed = await firstVerified(candidates, {
    urls: (item) => [item.readUrl, ...(item.altCopies ?? []).map((c) => c.url)],
    limit,
    check,
  });
  // The copy that passed becomes the reading destination (p. 209: "A vetted
  // alternative OA copy can replace a gated publisher/DOI destination"), and
  // its own licence and version replace the first copy's.
  const verified = passed.map(({ item, verdict, url }) => {
    const alt = url === item.readUrl ? null : item.altCopies?.find((c) => c.url === url);
    return {
      ...item,
      readUrl: url,
      ...(alt ? { articleLicence: alt.licence ?? null, articleVersion: alt.version ?? null } : {}),
      provenance: applyVerdict({ ...item.provenance, sourceUrl: url }, verdict),
    };
  });
  return publishableOnly(await withDoajLicences(verified));
}

/**
 * DOAJ article records carry no licence of their own (p. 213 "identify the
 * article's own licence"), so the journal's declared licence is looked up -
 * only for the DOAJ records actually being shown, to stay inside the DOAJ
 * throttle.
 */
async function withDoajLicences<T extends ResearchItem>(items: T[]): Promise<T[]> {
  return Promise.all(
    items.map(async (item) => {
      if (item.provenance.providerId !== 'doaj' || item.articleLicence || !item.issn) return item;
      const licence = await fetchDoajJournalLicence(item.issn);
      return licence ? { ...item, articleLicence: `${licence} (journal licence)` } : item;
    }),
  );
}

/**
 * Merge per-provider lists into one ranked list: the providers' order first
 * (p. 28), then each provider's own order - OpenAlex and DOAJ rank a search by
 * relevance, which is worth keeping. A duplicate DOI keeps the richer copy in
 * the higher-ranked slot.
 */
/**
 * The same work indexed twice under different DOIs (a report and a
 * collection's copy of it) still reads as a duplicate: the Climate page showed
 * the IPCC AR6 Synthesis Report twice. Titles are compared as letters and
 * digits only, and one containing the other counts - above a length where that
 * could happen by chance.
 */
function titleKey(title: string): string {
  return title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}

const MIN_TITLE_KEY = 25;

export function rankByProvider(lists: TaggedResearchItem[][]): TaggedResearchItem[] {
  const out: TaggedResearchItem[] = [];
  const slot = new Map<string, number>();
  const titles: string[] = [];
  for (const list of lists) {
    for (const item of list) {
      const key = dedupeKey(item);
      const tKey = titleKey(item.title);
      let at = slot.get(key);
      if (at === undefined && tKey.length >= MIN_TITLE_KEY) {
        const same = titles.findIndex((t) => t.length >= MIN_TITLE_KEY && (t.includes(tKey) || tKey.includes(t)));
        if (same >= 0) at = same;
      }
      if (at === undefined) {
        slot.set(key, out.length);
        titles.push(tKey);
        out.push(item);
      } else if (
        (DEDUPE_PRIORITY[item.provenance.providerId] ?? 9) < (DEDUPE_PRIORITY[out[at].provenance.providerId] ?? 9)
      ) {
        out[at] = item;
      }
    }
  }
  return out;
}

/** One search through each provider, gated and ranked, before any access check. */
async function researchCandidates(
  search: string,
  limit: number,
  providers: ResearchProvider[],
): Promise<{ lists: TaggedResearchItem[][]; results: ConnectorResult<ResearchItem[]>[]; skipped: ResearchResult['skipped'] }> {
  const results = await Promise.all(providers.map((p) => callProvider(p, search, limit)));
  const skipped: ResearchResult['skipped'] = [];
  const lists: TaggedResearchItem[][] = [];
  for (const result of results) {
    if (result.ok) lists.push(gateResearch(result.data, search));
    else skipped.push({ id: result.providerId, reason: result.reason, message: result.message });
  }
  return { lists, results, skipped };
}

export async function fetchResearch(options: {
  search: string;
  limit?: number;
  /** In ranking order. Defaults to the scholarly pair, OpenAlex then DOAJ. */
  providers?: ResearchProvider[];
}): Promise<ResearchResult> {
  const { search, limit = 6, providers = SCHOLARLY_PROVIDERS } = options;
  const { lists, results, skipped } = await researchCandidates(search, limit, providers);
  const items = await verifyForDisplay(rankByProvider(lists), limit);
  return summarise(items, skipped, sourcesFailed(results));
}

function summarise(
  items: TaggedResearchItem[],
  skipped: ResearchResult['skipped'],
  failed: boolean,
): ResearchResult {
  const sources = [...new Set(items.map((i) => i.provenance.providerId))].map((id) => ({
    id,
    name: items.find((i) => i.provenance.providerId === id)!.provenance.providerName,
  }));

  return {
    items,
    sources,
    skipped,
    retrievedAt: oldestRetrieval(items),
    unavailable: items.length === 0,
    sourcesFailed: failed,
    stale: items.some((i) => isStale(i.provenance)),
  };
}

/** See `allAskedFailed` in core/types.ts: the same rule for news and research. */
export const sourcesFailed = allAskedFailed;

function oldestRetrieval(items: ResearchItem[]): string {
  const times = items.map((i) => i.provenance.retrievedAt).sort();
  return times[0] ?? new Date().toISOString();
}

/**
 * "Research and Articles" for a domain or industry page (pp. 30, 38, 49, 60 and
 * each industry's configuration page).
 *
 * The handoff gives every page its own research themes, e.g. "carbon markets
 * climate finance decarbonisation". Each theme is one query through the same
 * server-side connectors and shared fetch cache as everything else (p. 226), so
 * a theme is fetched once per cache lifetime for all visitors - not per visit
 * and not per page view.
 *
 * Ranking: provider first, then theme. Every OpenAlex record (taken in turn
 * from each theme, so one busy theme cannot crowd out the others) comes before
 * any DOAJ record. The old version sorted newest-first across providers, and
 * OSTI's future-dated records pushed OpenAlex and DOAJ off every page.
 */
export async function fetchResearchForThemes(
  themes: string[],
  limit = 4,
  opts: { providers?: ResearchProvider[] } = {},
): Promise<ResearchResult> {
  const { providers = SCHOLARLY_PROVIDERS } = opts;
  const perTheme = await Promise.all(themes.map((search) => researchCandidates(search, limit, providers)));

  // The full ranked candidate list, then the access check walks it until
  // `limit` records have passed - so a gated OpenAlex record is replaced by
  // the next candidate rather than leaving a gap.
  const candidates = mergeByProvider(
    providers,
    perTheme.map(({ lists }) => lists.flat()),
  );
  const merged = await verifyForDisplay(candidates, limit);

  const sources = [...new Set(merged.map((i) => i.provenance.providerId))].map((id) => ({
    id,
    name: merged.find((i) => i.provenance.providerId === id)!.provenance.providerName,
  }));

  return {
    items: merged,
    sources,
    skipped: perTheme.flatMap((r) => r.skipped),
    retrievedAt: oldestRetrieval(merged),
    unavailable: merged.length === 0,
    sourcesFailed: sourcesFailed(perTheme.flatMap((r) => r.results)),
    stale: merged.some((i) => isStale(i.provenance)),
  };
}

/**
 * Provider first, then theme. Every OpenAlex record (taken in turn from each
 * theme, so one busy theme cannot crowd out the others) comes before any DOAJ
 * record. The old version sorted newest-first across providers, and OSTI's
 * future-dated records pushed OpenAlex and DOAJ off every page.
 */
export function mergeByProvider(providers: ResearchProvider[], perTheme: TaggedResearchItem[][]): TaggedResearchItem[] {
  const ordered: TaggedResearchItem[] = [];
  for (const provider of providers) {
    const queues = perTheme.map((items) => items.filter((i) => i.provenance.providerId === provider));
    while (queues.some((q) => q.length > 0)) {
      for (const q of queues) {
        const next = q.shift();
        if (next) ordered.push(next);
      }
    }
  }
  // rankByProvider dedupes by DOI: the first slot is kept, filled with the
  // richer copy when the same paper also came from DOAJ or GBIF.
  return rankByProvider([ordered]);
}
