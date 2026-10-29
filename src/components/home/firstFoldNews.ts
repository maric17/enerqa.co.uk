import { isStockMarketNews } from '@/lib/api/news/markets';
import type { NewsBasketKey, NewsItem } from '@/lib/api/news/types';
import { applyGate, byNewest, getBasket, matchesBasket, NEWS_BASKETS, newsImageUrl } from '@/lib/api/news/types';

/**
 * Pure helpers behind H03 Global News and H04 Major Markets (p. 13).
 *
 * Kept free of React and of any provider call so the filtering and labelling
 * rules can be unit-tested, and so the client panel only ever receives plain,
 * already-formatted data (dates are formatted here, on the server, which also
 * rules out a hydration mismatch between Node's and the browser's locale data).
 */

/** What one news card needs. Everything is serialisable for the client panel. */
export type NewsCardData = {
  id: string;
  title: string;
  /** Optional so cached stories without images keep working. */
  imageUrl?: string | null;
  /** Publisher's own licensed teaser, shortened. null when none is licensed (GDELT). */
  teaser: string | null;
  url: string;
  /** p. 13: the card names the publisher, not its web address. */
  publisher: string;
  /** Aggregator attribution, separate from the publisher of the article. */
  providerLabel?: string;
  publishedAt: string | null;
  /** Article age stays separate from the last successful feed check. */
  older?: boolean;
  /** p. 13 asks for publication date AND time; the year is included too. */
  dateLabel: string | null;
};

export type NewsFilter = { key: NewsBasketKey; label: string };

/** The five approved filter labels (p. 13), in their approved order. */
export const NEWS_FILTERS: NewsFilter[] = NEWS_BASKETS.map(({ key, label }) => ({ key, label }));

/**
 * Height the H03 / H04 card areas reserve while loading, when empty and when
 * loaded, so the fold does not move as the feeds stream in (p. 15, 226). Lives
 * here, not in the client panel, because the server skeleton needs it too.
 * Both are literal strings on purpose: Tailwind only generates classes it can
 * find written out in the source.
 */
export const NEWS_AREA_HEIGHT = 'min-h-[96px]';
export const NEWS_SKELETON_HEIGHT = 'h-[126px]';

/** Enough slides for the requested five-story minimum when the feed can supply them. */
export const STORIES_PER_VIEW = 8;

/** "25 Sept 2026, 09:05 UTC". UTC so every visitor sees the same label. */
export function formatDateTimeUtc(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return (
    date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    }) + ' UTC'
  );
}

/**
 * "Short teaser only" (p. 13, 226). The CSS clamp limits what is shown; this
 * also stops a long licensed description being shipped in full. Cuts on a word
 * boundary and never rewrites the publisher's words.
 */
export function shortTeaser(summary: string | null, max = 180): string | null {
  const text = summary?.replace(/\s+/g, ' ').trim();
  if (!text) return null;
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.-]+$/, '')}…`;
}

export function toCard(item: NewsItem): NewsCardData {
  return {
    id: item.id,
    title: item.title,
    imageUrl: newsImageUrl(item.imageUrl),
    teaser: shortTeaser(item.summary),
    url: item.url,
    publisher: item.publisher || item.domain,
    providerLabel: item.providerLabel,
    publishedAt: item.publishedAt,
    older: Boolean(item.publishedAt && Date.now() - Date.parse(item.publishedAt) > 48 * 3600_000),
    dateLabel: formatDateTimeUtc(item.publishedAt),
  };
}

/**
 * One view per filter, all cut from the same cached "All" pool.
 *
 * Deriving the four topic views here, instead of calling fetchNews once per
 * topic, costs zero extra provider requests: each topic would otherwise add its
 * own GDELT query, and GDELT sheds bursts of parallel requests (p. 211). The
 * same relevance rule and publisher cap as everywhere else are reapplied, so a
 * "Climate" view here matches what the Climate basket means site-wide.
 *
 * `pool` must be newest-first, as fetchNews returns it.
 */
export function buildNewsViews(
  pool: NewsItem[],
  perView = STORIES_PER_VIEW,
): Record<NewsBasketKey, NewsItem[]> {
  const views = {} as Record<NewsBasketKey, NewsItem[]>;
  for (const { key } of NEWS_FILTERS) {
    const basket = getBasket(key);
    const matching = key === 'all' ? pool : pool.filter((item) => matchesBasket(item, basket));
    const eligible = applyGate(matching);
    // Reserve a place for each domain before filling with the newest stories.
    // All entries still pass the shared rights, access and publisher gates.
    if (key === 'all' && perView >= 4) {
      const representatives = NEWS_FILTERS.filter(filter => filter.key !== 'all')
        .map(filter => eligible.find(item => matchesBasket(item, getBasket(filter.key))))
        .filter((item): item is NewsItem => Boolean(item));
      views[key] = [...new Map([...representatives, ...eligible].map(item => [item.id, item])).values()]
        .slice(0, perView).sort(byNewest);
    } else {
      views[key] = eligible.slice(0, perView);
    }
  }
  return views;
}

/**
 * The same story can legitimately match All and Business and Finance. Showing it
 * in both panels on one screen looks like a bug, so Major Markets skips anything
 * the default Global News view already shows.
 */
export function withoutShown(items: NewsItem[], shown: NewsItem[], limit: number): NewsItem[] {
  const shownIds = new Set(shown.map((item) => item.id));
  return items.filter((item) => !shownIds.has(item.id)).slice(0, limit);
}

/** Market stories can arrive in any topic feed; select them from the shared pool. */
export function buildMarketView(pool: NewsItem[], shown: NewsItem[], limit = 2): NewsItem[] {
  const matching = pool.filter(isStockMarketNews);
  // Remove shown stories before the publisher cap so they do not use up its slots.
  // News and official commentary can be merged in either order; publication
  // date decides which stories get the publisher slots and the visible cards.
  return applyGate(withoutShown(matching, shown, matching.length).sort(byNewest)).slice(0, limit);
}

export type HeroCategoryKey = Exclude<NewsBasketKey, 'all'>;
export type HeroStory = {
  item: NewsCardData;
  retrievedAt: string | null;
  delayed: boolean;
  stale: boolean;
};
export type HeroSlide = {
  /** Domain keys on the homepage, or an industry slug for a sector hero. */
  key: string;
  label: string;
  item: NewsCardData | null;
  sourcesFailed: boolean;
  retrievedAt: string | null;
  delayed: boolean;
  stale: boolean;
  /** Extra stories use the same verified saved pool as the lead story. */
  stories?: HeroStory[];
};

/** The hero contains only the four domains; markets has its own section. */
export const HERO_CATEGORIES: { key: HeroCategoryKey; label: string }[] = [
  { key: 'climate', label: 'Climate Action & Carbon Management' },
  { key: 'energy', label: 'Energy Systems & Transition' },
  { key: 'environment', label: 'Environment, Nature & Circularity' },
  { key: 'business', label: 'Sustainable Business, ESG & Finance' },
];

/** Reuse the saved feed and its access gates; selecting slides costs no API calls. */
export function selectHeroStories(pool: NewsItem[]): (NewsItem | null)[] {
  // A publisher's climate stories must not consume its energy or finance slots.
  const eligible = applyGate([...pool].sort(byNewest), { maxPerPublisher: Infinity });
  return HERO_CATEGORIES.map(category => {
    const matches = eligible.filter(item => matchesBasket(item, getBasket(category.key)));
    // A story may lead two relevant domains; freshness takes priority over variety.
    return matches[0] ?? null;
  });
}

/** Keep each domain's lead, then add up to two distinct relevant articles. */
export function selectHeroStoryGroups(pool: NewsItem[], limit = 3): NewsItem[][] {
  const leads = selectHeroStories(pool);
  const eligible = applyGate([...pool].sort(byNewest), { maxPerPublisher: Infinity });
  return HERO_CATEGORIES.map((category, index) => {
    const matches = eligible.filter(item => matchesBasket(item, getBasket(category.key)));
    const lead = leads[index];
    return (lead ? [lead, ...matches.filter(item => item.id !== lead.id)] : matches).slice(0, limit);
  });
}
