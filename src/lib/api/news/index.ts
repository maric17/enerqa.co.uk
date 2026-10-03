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
  isOnSiteTopic,
  matchesBasket,
  normaliseUrl,
  NEWS_BASKETS,
  PROVIDER_META,
} from './types';
import { basketQuery, fetchNewsdataBasket, fetchNewsdataQuery, NEWSDATA_DELAY_HOURS, PAGE_BASKET_SECONDS } from './newsdata';
import { fetchEiaNews, EIA_BASKETS } from './eiaRss';
import { fetchEeaNews, EEA_BASKETS } from './eeaRss';
import { fetchGdeltNews } from './gdelt';
import { REGION_ORDER } from './geography';
import { providerEnabled } from '../core/registry';
import { claimNewsRefresh, finishNewsRefresh, readNewsStore, NEWS_PROVIDERS } from './storage';
import { NEWS_REFRESH_SECONDS } from './schedule';
import { createNewsDiagnostics, logNewsDiagnostics, noteNewsProvider, type NewsDiagnostics } from './diagnostics';

export type { NewsItem, NewsBasketKey, NewsProvider } from './types';
export { NEWS_BASKETS, PROVIDER_META } from './types';
export { NEWSDATA_DELAY_HOURS } from './newsdata';

/**
 * The one entry point the rest of the site uses for external news.
 *
 * Four approved providers feed it (handoff pp. 210-216). None of them is
 * sufficient alone:
 *
 *   NewsData.io  primary global coverage, and the only general source that
 *                licenses a short description. Needs a key; free plan is
 *                delayed 12 hours and capped at 200 credits/day.
 *   EIA RSS      keyless, public domain, has summaries, but U.S. energy only.
 *   EEA RSS      keyless, CC-BY, has summaries, but Europe and environment only.
 *   GDELT        keyless and very broad, but headline-only, no summary.
 *
 * Combining them means a single provider being rate-limited, re-priced or
 * simply quiet does not empty the panel - which is what p. 227 requires when
 * it says a provider going chargeable must disable that connector alone.
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
   * The same judgement made on PAGE_NEWS_PROVIDERS alone (NewsData and GDELT).
   * A panel that shows only those two - the homepage H03/H04, CN/EN/NN/BN,
   * I{nn}N - must say "unavailable" when both failed, even if the EIA and EEA
   * feeds in the same pool answered.
   */
  newsSourcesFailed: boolean;
  /** How each provider asked for this result answered: "ok" or its failure reason. */
  providerStatus: Partial<Record<NewsProvider, ProviderOutcome>>;
  /** True when a displayed item came from the delayed NewsData free plan. */
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

/**
 * The news-page providers. pp. 28, 37, 48, 58 and every industry page (e.g.
 * p. 64) name the same two for CN/EN/NN/BN and I{nn}N: "NewsData.io is
 * primary; legacy GDELT supplies additional geographic coverage". The EIA and
 * EEA feeds are official analysis and belong in the official-updates modules
 * (pp. 37, 48 and the industry specialist feeds), not in "news".
 */
export const PAGE_NEWS_PROVIDERS: NewsProvider[] = ['newsdata', 'gdelt'];

/**
 * Ranking used only while deduplicating. If the same article arrives from two
 * providers we keep the richer record - the one that carries a licensed
 * summary - rather than whichever happened to be fetched first.
 *
 * This affects which COPY of a duplicate survives, never which stories are
 * shown or in what order. Display order is strictly newest first.
 */
const DEDUPE_PRIORITY: Record<NewsProvider, number> = {
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
  pageBaskets: string[][] = [],
  fresh = false,
): Promise<Collected> {
  const basket = getBasket(basketKey);
  const wants = (p: NewsProvider) => providers.includes(p);

  // NewsData charges a credit per query, so "All" reuses the four cached topic
  // baskets instead of paying for a fifth (p. 210). A domain or industry page
  // adds its own "News query baskets", each cached for 12 hours (newsdata.ts
  // has the credit sum).
  const newsdataCalls = !wants('newsdata')
    ? []
    : basketKey === 'all'
      ? NEWS_BASKETS.filter((b) => b.newsdataQuery).map((b) => safeNewsCall('newsdata', fetchNewsdataBasket(b.key, fresh)))
      : [safeNewsCall('newsdata', fetchNewsdataBasket(basketKey, fresh))];
  const pageCalls = wants('newsdata')
    ? pageBaskets.map((phrases) => safeNewsCall('newsdata', fetchNewsdataQuery(basketQuery(phrases), PAGE_BASKET_SECONDS)))
    : [];

  const wantsEia = wants('eia_rss') && EIA_BASKETS.includes(basketKey);
  const wantsEea = wants('eea_rss') && EEA_BASKETS.includes(basketKey);

  // Every connector returns a typed result rather than throwing, so one source
  // being down cannot reject the whole batch.
  const [newsdataResults, pageResults, eia, eea, gdelt] = await Promise.all([
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

  /**
   * Relevance filtering (p. 226), applied to every provider.
   *
   * It is not optional. A live NewsData query for "biodiversity OR circular
   * economy OR pollution OR water" came back with a data-centre debt story, a
   * rapper's mural and a cat-cruelty case - all of which the provider
   * considered a match.
   *
   * The official feeds go through the same check, because a feed is curated
   * for its own subject, not for whichever basket we are borrowing it for:
   * EIA's energy-market analysis belongs in Business and Finance only when the
   * individual article is actually about markets or prices.
   */
  const relevant = raw.filter((item) => matchesBasket(item, basket));

  // A page basket's results are already about the page's own phrases (the
  // page matches them again before showing any); they only need the site-wide
  // test that the headline is about our subject (p. 64: "the industry and
  // related sustainability themes together").
  for (const result of pageResults) {
    note(status, 'newsdata', result);
    noteNewsProvider(diagnostics, 'newsdata', result);
    if (result.ok) relevant.push(...result.data.filter(isOnSiteTopic));
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
    hasDelayedSource: items.some((i) => i.provider === 'newsdata'),
    stale: items.some((i) => isNewsItemStale(i)),
  };
}

export type NewsOptions = {
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

const ALL_PROVIDERS: NewsProvider[] = ['newsdata', 'gdelt', 'eia_rss', 'eea_rss'];

/**
 * The shared pool for a basket, gated (allowlist, dates, URL dedupe,
 * publisher cap) and newest first, BEFORE the access check. Callers narrow it
 * and then check only what they will show.
 */
async function providerPool(basketKey: NewsBasketKey, opts: NewsOptions): Promise<Collected> {
  const { items: collected, status, diagnostics } = await collect(basketKey, opts.providers ?? ALL_PROVIDERS, opts.pageBaskets);

  // The same article can arrive from a topic basket and a page basket; the
  // surviving copy keeps every query that found it.
  const queries = new Map<string, Set<string>>();
  for (const item of collected) {
    for (const q of item.matchedQueries ?? []) {
      const key = normaliseUrl(item.url);
      queries.set(key, (queries.get(key) ?? new Set()).add(q));
    }
  }

  // Sort by provider richness FIRST so the gate's URL dedupe keeps the copy
  // with a summary, then re-sort the survivors into newest-first order.
  const deduped = applyGate(
    [...collected].sort((a, b) => DEDUPE_PRIORITY[a.provider] - DEDUPE_PRIORITY[b.provider]),
    { maxPerPublisher: opts.maxPerPublisher },
  ).map((item) => {
    const found = queries.get(normaliseUrl(item.url));
    return found ? { ...item, matchedQueries: [...found] } : item;
  });
  diagnostics.counts.afterGate = deduped.length;
  return { items: deduped.sort(byNewest), status, diagnostics };
}

/** Public pages read approved saved records, including after a failed refresh. */
async function pool(basketKey: NewsBasketKey, opts: NewsOptions): Promise<Collected> {
  const saved = await readNewsStore();
  const providers = opts.providers ?? ALL_PROVIDERS;
  const diagnostics = createNewsDiagnostics(basketKey);
  diagnostics.mode = 'database';
  diagnostics.providers = (saved.state.diagnostics?.providers ?? []).filter(p => providers.includes(p.provider));
  diagnostics.refresh = {
    lastAttemptAt: saved.state.lastAttemptAt ?? null,
    lastCompletedAt: saved.state.lastCompletedAt ?? null,
    lastSuccessAt: saved.state.lastSuccessAt ?? {},
  };
  diagnostics.storage = saved.available ? 'ok' : 'failed';
  const status: Collected['status'] = {};
  const eligible = saved.items.filter(item => item.accessStatus === 'verified_open' &&
    Boolean(item.accessCheckedAt && Date.now() - Date.parse(item.accessCheckedAt) <= RECHECK_SECONDS * 1000) &&
    providers.includes(item.provider) && providerEnabled(item.provider));
  for (const provider of providers) {
    const latest = diagnostics.providers.filter(p => p.provider === provider);
    // Saved articles keep a failed provider usable; fresh empty replies remain healthy empty.
    status[provider] = !providerEnabled(provider) ? 'disabled' : !saved.available ? 'unavailable'
      : eligible.some(item => item.provider === provider) || latest.some(p => p.outcome === 'ok') ? 'ok'
        : latest.at(-1)?.outcome ?? 'unavailable';
  }
  // Page matching may reuse legacy page-basket records; the homepage keeps its stricter topic gate.
  const relevant = eligible.filter(item => opts.pageBaskets && basketKey === 'all'
    ? isOnSiteTopic(item) : matchesBasket(item, getBasket(basketKey))).map(item => ({
    ...normalise(item), refreshSeconds: NEWS_REFRESH_SECONDS,
    feedRefreshedAt: saved.state.lastSuccessAt?.[item.provider],
    refreshFailed: diagnostics.providers.some(p => p.provider === item.provider && (p.outcome !== 'ok' || p.stale)) ||
      Boolean(saved.state.lastSuccessAt?.[item.provider] && Date.now() - Date.parse(saved.state.lastSuccessAt[item.provider]!) > 2 * NEWS_REFRESH_SECONDS * 1000),
  }));
  diagnostics.counts.received = eligible.length;
  diagnostics.counts.relevant = relevant.length;
  const items = applyGate([...relevant].sort((a, b) => DEDUPE_PRIORITY[a.provider] - DEDUPE_PRIORITY[b.provider]),
    { maxPerPublisher: opts.maxPerPublisher }).sort(byNewest);
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
  // Count the existing checks without making extra requests or loosening access rules.
  const countedCheck = diagnostics ? async (url: string) => {
    const verdict = await (check ?? checkAccess)(url);
    diagnostics.counts.accessChecked++;
    diagnostics.access[verdict.status] = (diagnostics.access[verdict.status] ?? 0) + 1;
    return verdict;
  } : check;
  const passed = await firstVerified(items, { url: (i) => i.url, limit, maxChecks: limit + 6, check: countedCheck });
  const records = passed.map(({ item, verdict }) => ({ ...item, accessStatus: verdict.status, accessCheckedAt: verdict.checkedAt, accessEvidence: verdict.evidence, finalUrl: verdict.finalUrl }));
  const stored = await storeRecords(records.map(item => ({ provider: item.provider, sourceId: item.sourceId ?? item.id, destination: item.url, accessStatus: item.accessStatus, accessCheckedAt: item.accessCheckedAt, retrievedAt: item.retrievedAt, record: item })));
  if (diagnostics) {
    diagnostics.counts.verifiedOpen = records.length;
    diagnostics.storage = records.length ? (stored ? 'ok' : 'failed') : 'not_attempted';
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

/** Provider pipeline for scheduled ingestion and offline connector tests only. */
export async function pullNews(basketKey: NewsBasketKey = 'all', limit = 80, opts: NewsOptions = {}): Promise<NewsResult> {
  const { items, status, diagnostics } = await providerPool(basketKey, opts);
  diagnostics.mode = 'refresh';
  const shown = await verified(items, limit, opts.check, diagnostics);
  logNewsDiagnostics(diagnostics);
  return { ...buildResult(shown, status), diagnostics };
}

/** Three daily pulls of one shared pool, with independent provider storage. */
export async function refreshScheduledNews(check?: NewsOptions['check']) {
  const claim = await claimNewsRefresh();
  if (!claim) return { skipped: true as const, storedItems: 0, sourcesFailed: false };
  const diagnostics = createNewsDiagnostics('all');
  diagnostics.mode = 'refresh';
  const lastSuccessAt = { ...claim.state.lastSuccessAt };
  try {
    const collected = await collect('all', NEWS_PROVIDERS, [], true);
    diagnostics.providers = collected.diagnostics.providers;
    diagnostics.counts.received = collected.diagnostics.counts.received;
    diagnostics.counts.relevant = collected.items.length;
    // Recheck still-recent saved candidates on the job, never during page visits.
    const saved = await readNewsStore(true);
    for (const provider of NEWS_PROVIDERS) {
      if (!providerEnabled(provider)) continue;
      const fresh = collected.items.filter(i => i.provider === provider);
      const previous = saved.items.filter(i => i.provider === provider);
      const candidates = applyGate([...fresh, ...previous].map(i => ({ ...i, refreshSeconds: NEWS_REFRESH_SECONDS })), { maxPerPublisher: 500 }).sort(byNewest);
      const counts = createNewsDiagnostics('all');
      try {
        await verified(candidates, 80, check, counts);
      } catch {
        counts.storage = 'failed';
      }
      diagnostics.counts.afterGate += candidates.length;
      for (const key of ['accessChecked', 'verifiedOpen', 'returned'] as const) diagnostics.counts[key] += counts.counts[key];
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
      if (replies.some(p => p.outcome === 'ok' && !p.stale) && counts.storage !== 'failed') lastSuccessAt[provider] = new Date().toISOString();
    }
    await finishNewsRefresh(claim, { lastCompletedAt: new Date().toISOString(), lastSuccessAt, diagnostics });
    logNewsDiagnostics(diagnostics);
    return { skipped: false as const, storedItems: diagnostics.counts.returned,
      sourcesFailed: sourcesFailedFor({ providerStatus: collected.status }, NEWS_PROVIDERS) || diagnostics.storage === 'failed', diagnostics };
  } catch {
    diagnostics.storage = 'failed';
    await finishNewsRefresh(claim, { lastCompletedAt: new Date().toISOString(), lastSuccessAt, diagnostics });
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
  opts: { providers?: NewsProvider[]; maxPerPublisher?: number; check?: NewsOptions['check']; baskets?: string[][] } = {},
): Promise<NewsResult> {
  const { providers = PAGE_NEWS_PROVIDERS, maxPerPublisher = 10, baskets = [] } = opts;
  // Only the page's own providers are asked. A high cap for the pool: the real
  // cap is applied after matching, below.
  const { items: pooled, status, diagnostics } = await pool('all', { maxPerPublisher: 500, providers, pageBaskets: baskets });
  const terms = keywords.map((k) => k.trim()).filter(Boolean);

  // Word-boundary matching, the same as the basket filter uses, so an industry
  // called "Mining" does not pick up every headline containing "determining".
  // An item that NewsData returned for one of this page's own basket queries
  // matched it in the full text (which we may not show), so it counts too -
  // its headline has already passed the site-topic test in collect().
  const ownQueries = new Set(baskets.map(basketQuery));
  const matched = pooled.filter(
    (item) =>
      terms.length === 0 ||
      containsAny(`${item.title} ${item.summary ?? ''}`, terms) ||
      (item.matchedQueries ?? []).some((q) => ownQueries.has(q)),
  );

  const perPublisher = new Map<string, number>();
  const capped: NewsItem[] = [];
  for (const item of matched) {
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
