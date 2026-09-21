import type { NewsItem, NewsBasketKey, NewsProvider } from './types';
import {
  applyGate,
  byNewest,
  containsAny,
  getBasket,
  matchesBasket,
  NEWS_BASKETS,
  PROVIDER_META,
} from './types';
import { fetchNewsdataBasket, NEWSDATA_DELAY_HOURS } from './newsdata';
import { fetchEiaNews, EIA_BASKETS } from './eiaRss';
import { fetchEeaNews, EEA_BASKETS } from './eeaRss';
import { fetchGdeltNews } from './gdelt';

export type { NewsItem, NewsBasketKey } from './types';
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

export type NewsResult = {
  items: NewsItem[];
  /** Only the providers that actually contributed a displayed item. */
  sources: { id: NewsProvider; label: string; href: string }[];
  /** Regions present in the fetched items before filtering. */
  availableRegions: string[];
  /** Languages present in the fetched items before filtering. */
  availableLanguages: string[];
  /** When this set was assembled. Kept separate from publication dates (p. 226). */
  retrievedAt: string;
  /** True when every provider returned nothing usable. */
  unavailable: boolean;
  /** True when a displayed item came from the delayed NewsData free plan. */
  hasDelayedSource: boolean;
};

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

async function collect(basketKey: NewsBasketKey): Promise<NewsItem[]> {
  const basket = getBasket(basketKey);

  // NewsData charges a credit per query, so "All" reuses the four cached topic
  // baskets instead of paying for a fifth (p. 210).
  const newsdataCalls =
    basketKey === 'all'
      ? NEWS_BASKETS.filter((b) => b.newsdataQuery).map((b) => fetchNewsdataBasket(b.key))
      : [fetchNewsdataBasket(basketKey)];

  const wantsEia = EIA_BASKETS.includes(basketKey);
  const wantsEea = EEA_BASKETS.includes(basketKey);

  // Every provider function already resolves to [] on failure, so one source
  // being down cannot reject the whole batch.
  const [newsdataResults, eia, eea, gdelt] = await Promise.all([
    Promise.all(newsdataCalls),
    wantsEia ? fetchEiaNews() : Promise.resolve([]),
    wantsEea ? fetchEeaNews() : Promise.resolve([]),
    fetchGdeltNews(basketKey),
  ]);

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
  return [...newsdataResults.flat(), ...gdelt, ...eia, ...eea].filter((item) =>
    matchesBasket(item, basket),
  );
}

export async function fetchNews(
  basketKey: NewsBasketKey = 'all',
  limit = 6,
  opts: { maxPerPublisher?: number } = {},
): Promise<NewsResult> {
  const collected = await collect(basketKey);

  // Sort by provider richness FIRST so the gate's URL dedupe keeps the copy
  // with a summary, then re-sort the survivors into newest-first order.
  const deduped = applyGate(
    [...collected].sort((a, b) => DEDUPE_PRIORITY[a.provider] - DEDUPE_PRIORITY[b.provider]),
    opts,
  );

  const items = deduped.sort(byNewest).slice(0, limit);

  const sources = [...new Set(items.map((i) => i.provider))].map((id) => ({
    id,
    ...PROVIDER_META[id],
  }));

  const availableRegions = [...new Set(items.flatMap((i) => i.regions || []))].sort();
  const availableLanguages = [...new Set(items.map((i) => i.language).filter((l): l is string => Boolean(l)))].sort();

  return {
    items,
    sources,
    availableRegions,
    availableLanguages,
    retrievedAt: new Date().toISOString(),
    unavailable: items.length === 0,
    hasDelayedSource: items.some((i) => i.provider === 'newsdata'),
  };
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
}

export async function searchNews(
  query: string,
  basketKey: NewsBasketKey = 'all',
  filters: SearchFilters = {},
  limit = 24,
): Promise<NewsResult> {
  const result = await fetchNews(basketKey, 80, { maxPerPublisher: 10 });
  
  let items = result.items;

  // Apply filters
  if (filters.region) {
    items = items.filter((item) => item.regions?.includes(filters.region!));
  }
  if (filters.source) {
    items = items.filter((item) => item.provider === filters.source);
  }
  if (filters.language) {
    items = items.filter((item) => item.language === filters.language);
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

  const needle = query.trim().toLowerCase();
  if (needle) {
    const terms = needle.split(/\s+/).filter(Boolean);
    items = items.filter((item) => {
      const haystack = `${item.title} ${item.summary ?? ''} ${item.publisher}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }

  return withItems(result, items.slice(0, limit));
}

/**
 * Industry and domain pages reuse the same cached pool rather than making
 * their own provider calls - p. 226: "Reuse filtered records across home,
 * domains, industries and Global Intelligence." An industry page therefore
 * costs zero extra API requests.
 *
 * `keywords` are matched case-insensitively against the headline and summary;
 * an item needs to match any one of them.
 */
export async function fetchNewsForKeywords(
  keywords: string[],
  limit = 4,
  basketKey: NewsBasketKey = 'all',
): Promise<NewsResult> {
  const result = await fetchNews(basketKey, 80, { maxPerPublisher: 10 });
  const terms = keywords.map((k) => k.trim()).filter(Boolean);
  if (terms.length === 0) return withItems(result, result.items.slice(0, limit));

  // Word-boundary matching, the same as the basket filter uses, so an industry
  // called "Mining" does not pick up every headline containing "determining".
  const items = result.items
    .filter((item) => containsAny(`${item.title} ${item.summary ?? ''}`, terms))
    .slice(0, limit);

  return withItems(result, items);
}

/** Rebuild a result around a narrowed item list so the labels stay truthful. */
function withItems(result: NewsResult, items: NewsItem[]): NewsResult {
  const ids = new Set(items.map((i) => i.provider));
  return {
    ...result,
    items,
    // Note: We intentionally don't filter `availableRegions` and `availableLanguages` 
    // so the UI dropdowns can still show siblings. But `sources` is updated to reflect 
    // what's actually contributing to the current displayed result.
    sources: result.sources.filter((s) => ids.has(s.id)),
    unavailable: items.length === 0,
    hasDelayedSource: items.some((i) => i.provider === 'newsdata'),
  };
}

/** Re-exported so UI files can label the free-plan delay without importing the connector. */
export const NEWS_DELAY_HOURS = NEWSDATA_DELAY_HOURS;
