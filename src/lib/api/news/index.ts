import { storeRecords } from '../core/storage';
import { allAskedFailed, fail, type ConnectorFailure, type ConnectorResult } from '../core/types';
import { checkAccess, firstVerified, RECHECK_SECONDS, type AccessVerdict } from '../core/accessCheck';
import { isStaleAge } from '../core/health';
import { normaliseLanguage } from '../core/language';
import type { NewsItem, NewsBasketKey, NewsProvider } from './types';
import {
  applyGate,
  byNewest,
  containsAny,
  getBasket,
  hasEditorialApproval,
  isNewsCandidate,
  isOnSiteTopic,
  matchesBasket,
  normaliseUrl,
  NEWS_BASKETS,
  PROVIDER_META,
} from './types';
import { basketQuery, fetchNewsdataBasket, fetchNewsdataQuery, NEWSDATA_DELAY_HOURS, PAGE_BASKET_SECONDS } from './newsdata';
import { fetchEiaNews, EIA_BASKETS } from './eiaRss';
import { fetchTheNewsApiBasket, fetchTheNewsApiQuery } from './thenewsapi';
import { fetchApiTubeBasket, fetchApiTubeQuery } from './apitube';
import { apiTubeTopics } from './apitubeScreening';
import { PAGE_NEWS_PROVIDERS, DEFAULT_NEWS_PROVIDERS, REFRESH_NEWS_PROVIDERS } from './policy';
import { fetchEeaNews, EEA_BASKETS } from './eeaRss';
import { fetchGdeltNews, fetchGdeltQuery } from './gdelt';
import { REGION_ORDER } from './geography';
import { providerEnabled } from '../core/registry';
import { claimNewsRefresh, finishNewsRefresh, readNewsStore, type NewsRefreshOptions } from './storage';
import { GENERAL_NEWS_REFRESH_SECONDS, NEWS_REFRESH_SECONDS, isNewsRefreshJob, type NewsRefreshJob } from './schedule';
import { createNewsDiagnostics, logNewsDiagnostics, noteNewsProvider, type NewsDiagnostics } from './diagnostics';
import { DOMAIN_FEEDS, INDUSTRY_FEEDS, matchesNewsContext, matchesNewsSector, newsIndustries, type NewsContextRule, type NewsSectorRule } from '../../feeds/contextual';
import { industryDiscoveryQueries, industryRefreshSlugs } from './discovery';
import { isStockMarketNews, STOCK_MARKET_QUERIES } from './markets';
import { reviewNewsItems, type EditorialStats } from './editorial';

export type { NewsItem, NewsBasketKey, NewsProvider } from './types';
export { NEWS_BASKETS, PROVIDER_META } from './types';
export { NEWSDATA_DELAY_HOURS } from './newsdata';

/** Shared saved-news pipeline. This evaluation branch uses APITube alone.
 * Legacy connectors are kept for explicit maintenance and a later fallback rollout.
 */

export type ProviderOutcome = 'ok' | ConnectorFailure['reason'];

export type NewsResult = {
  /** Safe provider outcomes and stage counts for troubleshooting an empty feed. */
  diagnostics?: NewsDiagnostics;
  /** Last successful scheduled poll for the providers contributing saved articles. */
  refreshedAt?: string | null;
  items: NewsItem[];
  /** Only the providers that actually contributed a displayed item. */
  sources: { id: NewsProvider; label: string; href: string }[];
  /** Regions present in the fetched items before filtering. */
  availableRegions: string[];
  /** Languages present in the fetched items before filtering (ISO 639-1 codes). */
  availableLanguages: string[];
  /** When this set was assembled. Kept separate from publication dates (p. 226). */
  retrievedAt: string;
  /** True when every provider returned nothing usable. */
  unavailable: boolean;
  /**
   * True when no provider returned anything at all, before relevance
   * filtering. p. 226 tells these apart: "No relevant updates are available"
   * when the sources answered but nothing fitted, an honest unavailable state
   * when the sources themselves failed.
   */
  sourcesFailed: boolean;
  /**
   * The same judgement made on PAGE_NEWS_PROVIDERS alone (APITube during this trial).
   * A panel that shows only those two - the homepage H03/H04, CN/EN/NN/BN,
   * I{nn}N - must say "unavailable" when its news provider failed, even if the EIA and EEA
   * feeds in the same pool answered.
   */
  newsSourcesFailed: boolean;
  /** How each provider asked for this result answered: "ok" or its failure reason. */
  providerStatus: Partial<Record<NewsProvider, ProviderOutcome>>;
  /** True when a displayed item came from a delayed free news plan. */
  hasDelayedSource: boolean;
  /**
   * True when a displayed item is older than its provider's refresh interval,
   * i.e. the shared cache could not be refreshed. p. 227: show the cached items
   * with a stale-data notice rather than nothing.
   */
  stale: boolean;
  /** Optional pagination state for search results. */
  page?: number;
  hasNextPage?: boolean;
};

export { PAGE_NEWS_PROVIDERS } from './policy';

/**
 * Ranking used only while deduplicating. If the same article arrives from two
 * providers we keep the richer record - the one that carries a licensed
 * summary - rather than whichever happened to be fetched first.
 *
 * This affects which COPY of a duplicate survives, never which stories are
 * shown or in what order. Display order is strictly newest first.
 */
const DEDUPE_PRIORITY: Record<NewsProvider, number> = {
  apitube: -2,
  thenewsapi: -1,
  newsdata: 0,
  eea_rss: 1,
  eia_rss: 2,
  gdelt: 3,
};

/**
 * All saved news refreshes on the agreed three-times-daily schedule.
 * Last successful poll time is separate from each article's retrieval time.
 */
const REFRESH_SECONDS: Record<NewsProvider, number> = {
  apitube: NEWS_REFRESH_SECONDS,
  thenewsapi: NEWS_REFRESH_SECONDS,
  newsdata: NEWS_REFRESH_SECONDS,
  gdelt: NEWS_REFRESH_SECONDS,
  eia_rss: NEWS_REFRESH_SECONDS,
  eea_rss: NEWS_REFRESH_SECONDS,
};

/** p. 227 stale notice: the same rule as every other connector (`isStaleAge`). */
export function isNewsItemStale(item: NewsItem, now = Date.now()): boolean {
  if (item.refreshFailed) return true;
  return isStaleAge(item.provider, item.feedRefreshedAt ?? item.retrievedAt, item.refreshSeconds ?? REFRESH_SECONDS[item.provider], now);
}

/**
 * H03 / CN "short permitted description" (pp. 13, 28). NewsData sometimes
 * returns the opening of the article body as its description - 1,285
 * characters in one Guardian record - and a CSS line-clamp only hides that, it
 * still ships in the HTML. So the text is cut here, on a word boundary, before
 * any page sees it. The words are the publisher's; only the length changes.
 */
export const TEASER_MAX_CHARS = 200;

export function toTeaser(text: string | null, max = TEASER_MAX_CHARS): string | null {
  if (!text) return null;
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:.–—-]+$/, '')}…`;
}

export { normaliseLanguage } from '../core/language';

/** The normalisation every item gets, whichever connector produced it. */
function normalise(item: NewsItem): NewsItem {
  return {
    ...item,
    summary: toTeaser(item.summary),
    language: normaliseLanguage(item.language),
  };
}

type Collected = { items: NewsItem[]; status: Partial<Record<NewsProvider, ProviderOutcome>>; diagnostics: NewsDiagnostics };

/** One unexpected connector exception must not stop healthy sources refreshing. */
async function safeNewsCall(provider: NewsProvider, request: Promise<ConnectorResult<NewsItem[]>>): Promise<ConnectorResult<NewsItem[]>> {
  try { return await request; }
  catch { return fail(provider, 'unavailable', 'News connector failed to complete.'); }
}

/** Record a provider's answer, merging several calls (four NewsData baskets) into one outcome. */
function note(status: Collected['status'], provider: NewsProvider, result: ConnectorResult<unknown>): void {
  const outcome: ProviderOutcome = result.ok ? 'ok' : result.reason;
  // One basket answering is enough for the provider to have answered.
  if (status[provider] !== 'ok') status[provider] = outcome;
}

async function collect(
  basketKey: NewsBasketKey,
  providers: readonly NewsProvider[],
  pageQueries: string[] = [],
  fresh = false,
  includeTopics = true,
): Promise<Collected> {
  const basket = getBasket(basketKey);
  const wants = (p: NewsProvider) => providers.includes(p);
  const apiTubeCalls = !wants('apitube') || !includeTopics ? [] : basketKey === 'all'
    ? NEWS_BASKETS.filter(b => b.newsdataQuery).map(b => safeNewsCall('apitube', fetchApiTubeBasket(b.key, fresh)))
    : [safeNewsCall('apitube', fetchApiTubeBasket(basketKey, fresh))];
  const apiTubePageCalls = wants('apitube')
    ? pageQueries.map(query => safeNewsCall('apitube', fetchApiTubeQuery(query, PAGE_BASKET_SECONDS, fresh, ['en'], { days: 31 }))) : [];

  // NewsData charges a credit per query, so "All" reuses the four cached topic
  // baskets instead of paying for a fifth (p. 210). Context discovery belongs
  // to ingestion; an industry-only maintenance pull skips the topic calls.
  const theNewsApiCalls = !wants('thenewsapi') || !includeTopics ? []
    : basketKey === 'all'
      ? NEWS_BASKETS.filter(b => b.newsdataQuery).map(b => safeNewsCall('thenewsapi', fetchTheNewsApiBasket(b.key, fresh)))
      : [safeNewsCall('thenewsapi', fetchTheNewsApiBasket(basketKey, fresh))];
  const theNewsApiPageCalls = wants('thenewsapi')
    ? pageQueries.map(query => safeNewsCall('thenewsapi', fetchTheNewsApiQuery(query, PAGE_BASKET_SECONDS, fresh))) : [];

  const newsdataCalls = !wants('newsdata') || !includeTopics
    ? []
    : basketKey === 'all'
      ? NEWS_BASKETS.filter((b) => b.newsdataQuery).map((b) => safeNewsCall('newsdata', fetchNewsdataBasket(b.key, fresh)))
      : [safeNewsCall('newsdata', fetchNewsdataBasket(basketKey, fresh))];
  const pageCalls = wants('newsdata')
    ? pageQueries.map(query => safeNewsCall('newsdata', fetchNewsdataQuery(query, PAGE_BASKET_SECONDS, fresh)))
    : [];

  const wantsEia = wants('eia_rss') && EIA_BASKETS.includes(basketKey);
  const wantsEea = wants('eea_rss') && EEA_BASKETS.includes(basketKey);

  // Every connector returns a typed result rather than throwing, so one source
  // being down cannot reject the whole batch.
  const [apiTubeResults, apiTubePageResults, theNewsApiResults, theNewsApiPageResults, newsdataResults, pageResults, eia, eea, gdelt] = await Promise.all([
    Promise.all(apiTubeCalls),
    Promise.all(apiTubePageCalls),
    Promise.all(theNewsApiCalls),
    Promise.all(theNewsApiPageCalls),
    Promise.all(newsdataCalls),
    Promise.all(pageCalls),
    wantsEia ? safeNewsCall('eia_rss', fetchEiaNews(fresh)) : null,
    wantsEea ? safeNewsCall('eea_rss', fetchEeaNews(fresh)) : null,
    wants('gdelt') ? safeNewsCall('gdelt', fetchGdeltNews(basketKey, fresh)) : null,
  ]);

  const status: Collected['status'] = {};
  const diagnostics = createNewsDiagnostics(basketKey);
  const raw: NewsItem[] = [];
  for (const [provider, result] of [
    ...apiTubeResults.map(r => ['apitube', r] as const),
    ...theNewsApiResults.map(r => ['thenewsapi', r] as const),
    ...newsdataResults.map((r) => ['newsdata', r] as const),
    ['gdelt', gdelt] as const,
    ['eia_rss', eia] as const,
    ['eea_rss', eea] as const,
  ]) {
    if (!result) continue;
    note(status, provider, result);
    noteNewsProvider(diagnostics, provider, result);
    if (result.ok) raw.push(...result.data);
  }

  // Categories plus context screen APITube; the earlier connectors retain their
  // separate review policy. Discovery itself never grants permission to publish.
  const relevant = raw.filter(item => (item.provider === 'apitube' ? apiTubeTopics(item).length > 0 : isNewsCandidate(item)) && (basket.key === 'all'
    || containsAny(`${item.title} ${item.summary ?? ''}`, basket.keywords)));

  // Query provenance helps discovery but never substitutes for editorial approval.
  for (const result of [...apiTubePageResults, ...theNewsApiPageResults, ...pageResults]) {
    const provider = result.providerId as NewsProvider;
    const query = pageQueries[apiTubePageResults.indexOf(result)];
    const sector = provider === 'apitube' ? Object.values(INDUSTRY_FEEDS)
      .find(feed => feed.newsDiscoveryQuery === query) : undefined;
    note(status, provider, result);
    noteNewsProvider(diagnostics, provider, result);
    // Sector evidence must survive the licensed teaser limit used by saved records and cards.
    if (result.ok) relevant.push(...result.data.map(item => item.provider === 'apitube' ? normalise(item) : item).filter(item => item.provider === 'apitube'
      ? apiTubeTopics(item).length > 0 && matchesNewsSector(item, sector?.newsSectorRules)
        && (!STOCK_MARKET_QUERIES.includes(query) || apiTubeTopics(item).includes('markets')) :
      item.matchedQueries?.some(query => STOCK_MARKET_QUERIES.includes(query)) ? isStockMarketNews(item) : isNewsCandidate(item)));
  }

  diagnostics.counts.relevant = relevant.length;
  return { items: relevant.map(normalise), status, diagnostics };
}

/**
 * p. 226 "service failures ... an honest unavailable state": true only when
 * every provider that could be asked failed. One switched off or awaiting a
 * key is not asked; "nothing relevant" is an answer, not an outage. Same rule
 * as the research modules.
 */
export function sourcesFailedFor(result: Pick<NewsResult, 'providerStatus'>, providers: readonly NewsProvider[]): boolean {
  const asked = providers
    .map((p) => result.providerStatus[p])
    .filter((o): o is ProviderOutcome => Boolean(o))
    .map((o) => (o === 'ok' ? { ok: true } : { ok: false, reason: o }));
  return allAskedFailed(asked);
}

function buildResult(items: NewsItem[], status: Collected['status']): NewsResult {
  const sources = [...new Set(items.map((i) => i.provider))].map((id) => ({
    id,
    ...PROVIDER_META[id],
  }));

  const availableRegions = REGION_ORDER.filter((r) => items.some((i) => i.regions?.includes(r)));
  const availableLanguages = [...new Set(items.map((i) => i.language).filter((l): l is string => Boolean(l)))].sort();
  const all = Object.keys(status) as NewsProvider[];

  return {
    items,
    sources,
    availableRegions,
    availableLanguages,
    // The oldest displayed item is the honest age of this set: with the shared
    // cache, "assembled now" can hide hours-old data (p. 226).
    retrievedAt: oldestRetrieval(items),
    refreshedAt: items.map(i => i.feedRefreshedAt).filter((t): t is string => Boolean(t)).sort()[0] ?? null,
    unavailable: items.length === 0,
    sourcesFailed: sourcesFailedFor({ providerStatus: status }, all),
    newsSourcesFailed: sourcesFailedFor({ providerStatus: status }, PAGE_NEWS_PROVIDERS),
    providerStatus: status,
    hasDelayedSource: items.some((i) => i.provider === 'newsdata' || i.provider === 'apitube'),
    stale: items.some((i) => isNewsItemStale(i)),
  };
}

export type NewsOptions = {
  /** Dedicated stocks panel, independent of sustainability topic matching. */
  stockMarkets?: boolean;
  /** Use the matching job's health; a stock outage must not mark other feeds refreshed. */
  refreshJob?: NewsRefreshJob;
  maxPerPublisher?: number;
  /**
   * Only read these providers, and judge `sourcesFailed` on them alone. A panel
   * limited to PAGE_NEWS_PROVIDERS should pass them here rather than filtering
   * afterwards, so EIA and EEA are not counted.
   */
  providers?: readonly NewsProvider[];
  /** Ingestion tests only: the access check to run instead of the real one. */
  check?: (url: string) => Promise<AccessVerdict>;
  /** A page's phrases; public reads use only previously saved query metadata. */
  pageBaskets?: string[][];
};

const ALL_PROVIDERS = DEFAULT_NEWS_PROVIDERS;

/**
 * The shared pool for a basket, gated (allowlist, dates, URL dedupe,
 * publisher cap) and newest first, BEFORE the access check. Callers narrow it
 * and then check only what they will show.
 */
async function providerPool(basketKey: NewsBasketKey, opts: NewsOptions): Promise<Collected> {
  const { items: collected, status, diagnostics } = await collect(basketKey, opts.providers ?? ALL_PROVIDERS, opts.pageBaskets?.map(basketQuery));
  const items = dedupeNews(collected, opts.maxPerPublisher);
  diagnostics.counts.afterGate = items.length;
  return { items, status, diagnostics };
}

/** Keep query provenance when the same URL appears in several query groups. */
function dedupeNews(collected: NewsItem[], maxPerPublisher?: number): NewsItem[] {
  // The same article can arrive from a topic basket and a page basket; the
  // surviving copy keeps every query that found it.
  const queries = new Map<string, Set<string>>();
  for (const item of collected) {
    for (const q of item.matchedQueries ?? []) {
      const key = normaliseUrl(item.url);
      queries.set(key, (queries.get(key) ?? new Set()).add(q));
    }
  }

  // Prefer licensed summaries when choosing a duplicate, without using up
  // publisher slots until all surviving stories have been sorted by publication.
  const deduped = applyGate(
    [...collected].sort((a, b) => DEDUPE_PRIORITY[a.provider] - DEDUPE_PRIORITY[b.provider]),
    { maxPerPublisher: Infinity },
  ).map((item) => {
    const found = queries.get(normaliseUrl(item.url));
    return found ? { ...item, matchedQueries: [...found] } : item;
  });
  return applyGate(deduped.sort(byNewest), { maxPerPublisher });
}

/** Public pages read approved saved records, including after a failed refresh. */
async function pool(basketKey: NewsBasketKey, opts: NewsOptions): Promise<Collected> {
  const saved = await readNewsStore();
  const job = opts.refreshJob ?? (opts.stockMarkets ? 'stocks' : 'general');
  const state = saved.state.jobs?.[job] ?? saved.state;
  const refreshSeconds = job === 'general' ? GENERAL_NEWS_REFRESH_SECONDS : NEWS_REFRESH_SECONDS;
  const providers = opts.providers ?? ALL_PROVIDERS;
  const diagnostics = createNewsDiagnostics(basketKey);
  diagnostics.mode = 'database';
  diagnostics.job = job;
  diagnostics.providers = (state.diagnostics?.providers ?? []).filter(p => providers.includes(p.provider));
  diagnostics.refresh = {
    lastAttemptAt: state.lastAttemptAt ?? null,
    lastCompletedAt: state.lastCompletedAt ?? null,
    lastSuccessAt: state.lastSuccessAt ?? {},
  };
  diagnostics.storage = saved.available ? 'ok' : 'failed';
  diagnostics.editorial = state.diagnostics?.editorial;
  const status: Collected['status'] = {};
  const eligible = saved.items.filter(item => item.accessStatus === 'verified_open' &&
    Boolean(item.accessCheckedAt && Date.now() - Date.parse(item.accessCheckedAt) <= RECHECK_SECONDS * 1000) &&
    providers.includes(item.provider) && providerEnabled(item.provider));
  for (const provider of providers) {
    const latest = diagnostics.providers.filter(p => p.provider === provider);
    // Saved articles keep a failed provider usable; fresh empty replies remain healthy empty.
    status[provider] = !providerEnabled(provider) ? 'disabled' : !saved.available ? 'unavailable'
      : !eligible.some(item => item.provider === provider) && diagnostics.editorial?.pending && diagnostics.editorial.issue ? 'unavailable'
      : eligible.some(item => item.provider === provider) || latest.some(p => p.outcome === 'ok') ? 'ok'
        : latest.at(-1)?.outcome ?? 'unavailable';
  }
  // Page matching may reuse legacy page-basket records; the homepage keeps its stricter topic gate.
  const relevant = eligible.filter(item => opts.stockMarkets ? isStockMarketNews(item) : opts.pageBaskets && basketKey === 'all'
    ? isOnSiteTopic(item) : matchesBasket(item, getBasket(basketKey))).map(item => ({
    ...normalise(item), refreshSeconds,
    feedRefreshedAt: state.lastSuccessAt?.[item.provider],
    refreshFailed: diagnostics.providers.some(p => p.provider === item.provider && (p.outcome !== 'ok' || p.stale)) ||
      Boolean(state.status === 'failed') ||
      Boolean(state.lastSuccessAt?.[item.provider] && Date.now() - Date.parse(state.lastSuccessAt[item.provider]!) > 2 * refreshSeconds * 1000),
  }));
  diagnostics.counts.received = eligible.length;
  diagnostics.counts.relevant = relevant.length;
  const items = dedupeNews(relevant, opts.maxPerPublisher);
  diagnostics.counts.afterGate = items.length;
  diagnostics.counts.verifiedOpen = items.length;
  return { items, status, diagnostics };
}

/**
 * pp. 209, 227: news goes through the same verified_open gate as research.
 * The allowlist is the vetted official-source list p. 209 allows; the
 * anonymous check of each article's destination is the second half. Items
 * are checked in display order and the walk stops at `limit`, so nothing that
 * could not be shown is checked.
 */
async function verified(items: NewsItem[], limit: number, check?: NewsOptions['check'], diagnostics?: NewsDiagnostics): Promise<NewsItem[]> {
  const editorial: EditorialStats = { approved: 0, rejected: 0, pending: 0, issue: null };
  const reviewed = await reviewNewsItems(items, editorial);
  if (diagnostics) diagnostics.editorial = editorial;
  const approved = reviewed.filter(hasEditorialApproval);
  // Count the existing checks without making extra requests or loosening access rules.
  const countedCheck = diagnostics ? async (url: string) => {
    const verdict = await (check ?? checkAccess)(url);
    diagnostics.counts.accessChecked++;
    diagnostics.access[verdict.status] = (diagnostics.access[verdict.status] ?? 0) + 1;
    return verdict;
  } : check;
  const passed = await firstVerified(approved, { url: (i) => i.url, limit, maxChecks: limit + 6, check: countedCheck });
  const records = passed.map(({ item, verdict }) => ({ ...item, imageUrl: verdict.imageUrl ?? item.imageUrl,
    accessStatus: verdict.status, accessCheckedAt: verdict.checkedAt, accessEvidence: verdict.evidence, finalUrl: verdict.finalUrl }));
  // Save withheld decisions privately too, so older versions cannot remain published.
  const withheld = reviewed.filter(item => !hasEditorialApproval(item));
  const stored = await storeRecords([
    ...records.map(item => ({ provider: item.provider, sourceId: item.sourceId ?? item.id, destination: item.url, accessStatus: item.accessStatus, accessCheckedAt: item.accessCheckedAt, retrievedAt: item.retrievedAt, record: item })),
    ...withheld.map(item => ({ provider: item.provider, sourceId: item.sourceId ?? item.id, destination: item.url,
      accessStatus: 'unknown', accessCheckedAt: null, retrievedAt: item.retrievedAt,
      record: { ...item, accessStatus: 'unknown', accessCheckedAt: null } })),
  ]);
  if (diagnostics) {
    diagnostics.counts.verifiedOpen = records.length;
    diagnostics.storage = records.length + withheld.length ? (stored ? 'ok' : 'failed') : 'not_attempted';
    diagnostics.counts.returned = stored ? records.length : 0;
  }
  return stored ? records : [];
}

export async function fetchNews(
  basketKey: NewsBasketKey = 'all',
  limit = 6,
  opts: NewsOptions = {},
): Promise<NewsResult> {
  const { items, status, diagnostics } = await pool(basketKey, opts);
  const shown = items.slice(0, limit);
  diagnostics.counts.returned = shown.length;
  logNewsDiagnostics(diagnostics);
  return { ...buildResult(shown, status), diagnostics };
}

/** Interactive discovery is separate from database-only page reads and scheduled pulls. */
export async function fetchLiveNews(options: {
  query: string; gdeltQuery: string; providers: NewsProvider[]; languages?: string[];
  /** Offline connector checks only; the HTTP handler never accepts a callback. */
  check?: NewsOptions['check'];
}): Promise<NewsResult> {
  const results = await Promise.all(options.providers.map(provider => safeNewsCall(provider,
    provider === 'apitube' ? fetchApiTubeQuery(options.query, NEWS_REFRESH_SECONDS, true, options.languages) :
    provider === 'thenewsapi' ? fetchTheNewsApiQuery(options.query, NEWS_REFRESH_SECONDS, true, options.languages) :
    provider === 'newsdata' ? fetchNewsdataQuery(options.query, NEWS_REFRESH_SECONDS, true, options.languages) :
    provider === 'gdelt' ? fetchGdeltQuery(options.gdeltQuery, true) :
    provider === 'eia_rss' ? fetchEiaNews(true) : fetchEeaNews(true),
  )));
  const status: Collected['status'] = {};
  const candidates: NewsItem[] = [];
  for (const result of results) {
    note(status, result.providerId as NewsProvider, result);
    if (result.ok) candidates.push(...result.data.filter(item => item.provider === 'apitube' ? apiTubeTopics(item).length > 0 : isNewsCandidate(item)).map(normalise));
  }
  const saved = await readNewsStore();
  const previousItems = new Map(saved.items.map(item => [normaliseUrl(item.url), item]));
  const discovered = candidates.map(item => {
    const previous = previousItems.get(normaliseUrl(item.url));
    return { ...item,
      // Interactive discovery preserves query evidence and unchanged editorial decisions.
      matchedQueries: [...new Set([...(previous?.matchedQueries ?? []), ...(item.matchedQueries ?? [])])],
      editorialReview: previous?.title === item.title && previous.summary === item.summary ? previous.editorialReview : item.editorialReview,
    };
  });
  // Reuse publisher, date, rights and anonymous-access gates before saving originals.
  const items = await verified(dedupeNews(discovered, 30), 30, options.check);
  return buildResult(items, status);
}

/** Provider pipeline for scheduled ingestion and offline connector tests only. */
export async function pullNews(basketKey: NewsBasketKey = 'all', limit = 80, opts: NewsOptions = {}): Promise<NewsResult> {
  const { items, status, diagnostics } = await providerPool(basketKey, opts);
  diagnostics.mode = 'refresh';
  const approved = await verified(items, limit, opts.check, diagnostics);
  const shown = approved.filter(item => matchesBasket(item, getBasket(basketKey)));
  diagnostics.counts.returned = shown.length;
  logNewsDiagnostics(diagnostics);
  return { ...buildResult(shown, status), diagnostics };
}

/** Independent scheduled units share screening and storage, never completion guards. */
export async function refreshScheduledNews(check?: NewsOptions['check'], options: NewsRefreshOptions = {}) {
  if (options.job) {
    if (!isNewsRefreshJob(options.job) || options.topicsOnly || options.marketsOnly || options.industriesOnly || options.industrySlugs) {
      throw new Error('Select one fixed news job without manual scope options.');
    }
    const batch = options.job.startsWith('industries-') ? Number(options.job.slice(-1)) as 1 | 2 | 3 : undefined;
    options = { ...options, ...(batch ? { industriesOnly: true, industrySlugs: industryRefreshSlugs(batch) }
      : options.job === 'stocks' ? { marketsOnly: true } : { topicsOnly: true }) };
  }
  if (options.marketsOnly && ((!options.manual && !options.job) || options.topicsOnly || options.industriesOnly || options.industrySlugs)) {
    throw new Error('Market preview requires a manual pull without other scope options.');
  }
  if (options.topicsOnly && ((!options.manual && !options.job) || options.industriesOnly || options.industrySlugs)) {
    throw new Error('Topic preview requires a manual pull without industry options.');
  }
  if (options.industriesOnly && !options.manual && !options.job) throw new Error('Industry maintenance requires an explicit manual pull.');
  if (options.industrySlugs && (!options.industriesOnly || options.industrySlugs.length === 0 ||
    options.industrySlugs.some(slug => !Object.hasOwn(INDUSTRY_FEEDS, slug)))) {
    throw new Error('Select known industries for a manual industry pull.');
  }
  const claim = await claimNewsRefresh(options);
  if (!claim) return { skipped: true as const, storedItems: 0, sourcesFailed: false };
  const diagnostics = createNewsDiagnostics('all');
  diagnostics.mode = 'refresh';
  diagnostics.job = options.job;
  diagnostics.scope = options.marketsOnly ? 'markets' : options.topicsOnly ? 'topics' : options.industriesOnly ? 'industries' : 'all';
  const providers = options.industriesOnly || options.marketsOnly
    ? REFRESH_NEWS_PROVIDERS.filter(provider => ['apitube', 'thenewsapi', 'newsdata'].includes(provider))
    : REFRESH_NEWS_PROVIDERS;
  const lastSuccessAt = { ...claim.state.lastSuccessAt };
  try {
    // APITube's four category requests cover the domains. Repeating twelve legacy
    // phrase searches wasted credits and exceeded the route's five-minute runtime.
    // Fixed scheduled industry jobs each cover one batch every cycle. Older manual
    // maintenance retains its explicit scope without changing the scheduled units.
    const domainQueries = options.industriesOnly || providers.includes('apitube') ? []
      : Object.values(DOMAIN_FEEDS).flatMap(feed => feed.newsBaskets.map(basketQuery));
    const queries = options.marketsOnly ? STOCK_MARKET_QUERIES : options.topicsOnly ? []
      : [...new Set([...(options.industriesOnly ? [] : STOCK_MARKET_QUERIES), ...domainQueries, ...industryDiscoveryQueries(Date.now(), options.industriesOnly, options.industrySlugs)])];
    const collected = await collect('all', providers, queries, true, !options.industriesOnly && !options.marketsOnly);
    // Maintenance preserves the last outcomes of providers it did not contact.
    diagnostics.providers = [
      ...(options.industriesOnly && !options.job ? claim.state.diagnostics?.providers.filter(p => !providers.includes(p.provider)) ?? [] : []),
      ...collected.diagnostics.providers,
    ];
    diagnostics.counts.received = collected.diagnostics.counts.received;
    diagnostics.counts.relevant = collected.items.length;
    // Recheck still-recent saved candidates on the job, never during page visits.
    const saved = await readNewsStore(true);
    for (const provider of providers) {
      if (!providerEnabled(provider)) continue;
      const fresh = collected.items.filter(i => i.provider === provider);
      const previous = saved.items.filter(i => i.provider === provider && (!options.job || (
        options.marketsOnly ? isStockMarketNews(i) : options.industriesOnly
          ? newsIndustries(i).some(slug => options.industrySlugs!.includes(slug)) : !isStockMarketNews(i))));
      const previousByUrl = new Map(previous.map(item => [normaliseUrl(item.url), item]));
      const candidates = dedupeNews([...fresh, ...previous].map(item => {
        const old = previousByUrl.get(normaliseUrl(item.url));
        // Reuse a review only for the exact same licensed text, not merely the URL.
        return { ...item, refreshSeconds: NEWS_REFRESH_SECONDS,
          editorialReview: old && old.title === item.title && old.summary === item.summary ? old.editorialReview : item.editorialReview };
      }), 500);
      const counts = createNewsDiagnostics('all');
      try {
        await verified(candidates, 80, check, counts);
      } catch {
        counts.storage = 'failed';
      }
      diagnostics.counts.afterGate += candidates.length;
      for (const key of ['accessChecked', 'verifiedOpen', 'returned'] as const) diagnostics.counts[key] += counts.counts[key];
      if (counts.editorial) {
        diagnostics.editorial ??= { approved: 0, rejected: 0, pending: 0, issue: null };
        for (const key of ['approved', 'rejected', 'pending'] as const) diagnostics.editorial[key] += counts.editorial[key];
        diagnostics.editorial.issue = counts.editorial.issue ?? diagnostics.editorial.issue;
      }
      for (const [key, value] of Object.entries(counts.access)) {
        const status = key as keyof NewsDiagnostics['access'];
        diagnostics.access[status] = (diagnostics.access[status] ?? 0) + value!;
      }
      if (counts.storage === 'failed') {
        diagnostics.storage = 'failed';
        diagnostics.providers.push({ provider, outcome: 'unavailable', issue: 'record_storage_failed',
          items: 0, retrievedAt: null, stale: false, httpStatus: null });
      }
      else if (diagnostics.storage !== 'failed' && counts.storage === 'ok') diagnostics.storage = 'ok';
      const replies = diagnostics.providers.filter(p => p.provider === provider);
      if (replies.length && replies.every(p => p.outcome === 'ok' && !p.stale) && counts.storage !== 'failed'
        && !counts.editorial?.pending) lastSuccessAt[provider] = new Date().toISOString();
    }
    // Any missing query makes a split job incomplete, even if its other requests succeeded.
    const sourcesFailed = sourcesFailedFor({ providerStatus: collected.status }, providers) || diagnostics.storage === 'failed'
      || Boolean(diagnostics.editorial?.pending && diagnostics.editorial.issue)
      || Boolean(options.job && collected.diagnostics.providers.some(p => p.outcome !== 'ok' || p.stale));
    await finishNewsRefresh(claim, { lastCompletedAt: new Date().toISOString(), lastSuccessAt, diagnostics,
      status: sourcesFailed ? 'failed' : 'succeeded' });
    logNewsDiagnostics(diagnostics);
    return { skipped: false as const, storedItems: diagnostics.counts.returned,
      sourcesFailed, diagnostics };
  } catch {
    diagnostics.storage = 'failed';
    await finishNewsRefresh(claim, { lastCompletedAt: new Date().toISOString(), lastSuccessAt, diagnostics, status: 'failed' });
    throw new Error('Scheduled news refresh failed; previously saved articles are retained.');
  }
}

function oldestRetrieval(items: NewsItem[]): string {
  const times = items.map((i) => i.retrievedAt).filter(Boolean).sort();
  return times[0] ?? new Date().toISOString();
}

/**
 * Free-text search across the cached baskets, for Global Intelligence.
 *
 * It deliberately searches what we already have rather than sending the
 * visitor's keywords upstream: p. 210 says to "use a shared feed cache rather
 * than upstream per-user keyword search", because a per-visitor query would
 * burn the daily credit budget in minutes.
 */
export interface SearchFilters {
  region?: string;
  source?: string;
  language?: string;
  dateRange?: string; // e.g. '24h', '7d', '30d'
  /** A domain or industry page's handoff baskets, from ?domain= / ?industry=. */
  phrases?: string[];
  page?: number;
}

export async function searchNews(
  query: string,
  basketKey: NewsBasketKey = 'all',
  filters: SearchFilters = {},
  limit = 24,
): Promise<NewsResult> {
  const { items: pooled, status } = await pool(basketKey, { maxPerPublisher: 10 });
  const result = buildResult(pooled, status);

  let items = pooled;

  // Apply filters
  if (filters.region) {
    items = items.filter((item) => item.regions?.includes(filters.region!));
  }
  if (filters.source) {
    items = items.filter((item) => item.provider === filters.source);
  }
  if (filters.language) {
    // Old shared links may still say ?language=english.
    const wanted = normaliseLanguage(filters.language);
    items = items.filter((item) => item.language === wanted);
  }
  if (filters.dateRange) {
    const now = Date.now();
    let maxAgeMs = Infinity;
    if (filters.dateRange === '24h') maxAgeMs = 24 * 60 * 60 * 1000;
    else if (filters.dateRange === '7d') maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    else if (filters.dateRange === '30d') maxAgeMs = 30 * 24 * 60 * 60 * 1000;

    items = items.filter((item) => {
      if (!item.publishedAt) return false;
      const age = now - Date.parse(item.publishedAt);
      return age <= maxAgeMs;
    });
  }

  // Same whole-word matching as the domain and industry modules, so "View All
  // News" shows the same kind of stories as the page it came from.
  if (filters.phrases && filters.phrases.length > 0) {
    items = items.filter((item) => containsAny(`${item.title} ${item.summary ?? ''}`, filters.phrases!));
  }

  const needle = query.trim().toLowerCase();
  if (needle) {
    const terms = needle.split(/\s+/).filter(Boolean);
    items = items.filter((item) => {
      const haystack = `${item.title} ${item.summary ?? ''} ${item.publisher}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }

  const page = filters.page ?? 1;
  const needed = page * limit;
  const passed = items.slice(0, needed + 1);
  
  const hasNextPage = passed.length > needed;
  const start = (page - 1) * limit;
  const pagedItems = passed.slice(start, start + limit);

  return { ...withItems(result, pagedItems), page, hasNextPage };
}

/**
 * CN/EN/NN/BN "Latest News" and I{nn}N "Industry News".
 *
 * Every page reads the same approved database pool and selects its own phrases.
 * Selection, pagination and access evidence reads never call news providers.
 * The publisher cap is applied after phrase matching so relevant saved stories
 * are not removed before the page gets to choose them.
 *
 * `keywords` are matched as whole phrases in the headline and summary; an item
 * needs to match any one of them.
 */
export async function fetchNewsForKeywords(
  keywords: string[],
  limit = 4,
  opts: { providers?: NewsProvider[]; maxPerPublisher?: number; check?: NewsOptions['check']; baskets?: string[][]; basket?: NewsBasketKey; contextRules?: NewsContextRule[]; sectorRules?: NewsSectorRule[]; refreshJob?: NewsRefreshJob } = {},
): Promise<NewsResult> {
  const { providers = PAGE_NEWS_PROVIDERS, maxPerPublisher = 10, baskets = [] } = opts;
  // Only the page's own providers are asked. A high cap for the pool: the real
  // cap is applied after matching, below.
  const { items: pooled, status, diagnostics } = await pool('all', { maxPerPublisher: 500, providers, pageBaskets: baskets, refreshJob: opts.refreshJob });
  const terms = keywords.map((k) => k.trim()).filter(Boolean);

  // Word-boundary matching, the same as the basket filter uses, so an industry
  // called "Mining" does not pick up every headline containing "determining".
  // An item that NewsData returned for one of this page's own basket queries
  // matched it in the full text (which we may not show), so it counts too -
  // its headline has already passed the site-topic test in collect().
  const ownQueries = new Set(baskets.map(basketQuery));
  const matched = pooled.filter(
    (item) => matchesNewsSector(item, opts.sectorRules) && (
      // A reviewed domain assignment can cover wording omitted from its search phrases.
      opts.basket && hasEditorialApproval(item) ? opts.basket === 'all' || item.editorialReview!.topics.includes(opts.basket) :
      terms.length === 0 ||
      containsAny(`${item.title} ${item.summary ?? ''}`, terms) ||
      matchesNewsContext(item, opts.contextRules) ||
      (item.matchedQueries ?? []).some((q) => ownQueries.has(q))),
  );

  const perPublisher = new Map<string, number>();
  const capped: NewsItem[] = [];
  for (const item of [...matched].sort(byNewest)) {
    const used = perPublisher.get(item.domain) ?? 0;
    if (used >= maxPerPublisher) continue;
    perPublisher.set(item.domain, used + 1);
    capped.push(item);
  }

  // "Sources failed" is judged on this page's own providers only (p. 226).
  diagnostics.counts.returned = Math.min(capped.length, limit);
  return withItems({ ...buildResult(pooled, status), diagnostics }, capped.slice(0, limit));
}

/**
 * One official RSS feed (EIA p. 214, EEA pp. 215-216) through the same
 * relevance check, teaser cut and gate as everything else, for the
 * official-updates modules. `basketKey` decides relevance: EIA analysis is
 * checked against Energy, EEA updates against Environment and Nature.
 */
export async function fetchOfficialNews(
  provider: 'eia_rss' | 'eea_rss',
  basketKey: Exclude<NewsBasketKey, 'all'>,
): Promise<NewsResult> {
  return fetchNews(basketKey, 500, { providers: [provider], maxPerPublisher: 500 });
}

/** Rebuild a result around a narrowed item list so the labels stay truthful. */
function withItems(result: NewsResult, items: NewsItem[]): NewsResult {
  const ids = new Set(items.map((i) => i.provider));
  return {
    ...result,
    items,
    refreshedAt: items.map(i => i.feedRefreshedAt).filter((t): t is string => Boolean(t)).sort()[0] ?? result.refreshedAt,
    retrievedAt: items.length > 0 ? oldestRetrieval(items) : result.retrievedAt,
    // Note: We intentionally don't filter `availableRegions` and `availableLanguages`
    // so the UI dropdowns can still show siblings. But `sources` is updated to reflect
    // what's actually contributing to the current displayed result.
    sources: result.sources.filter((s) => ids.has(s.id)),
    unavailable: items.length === 0,
    hasDelayedSource: items.some((i) => i.provider === 'newsdata'),
    stale: items.some((i) => isNewsItemStale(i)),
  };
}

/** Re-exported so UI files can label the free-plan delay without importing the connector. */
export const NEWS_DELAY_HOURS = NEWSDATA_DELAY_HOURS;
