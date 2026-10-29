import type { AccessStatus } from '../core/types';

/**
 * Shared vocabulary for every news connector (handoff pp. 209-216, 226).
 *
 * Each provider file turns its own response shape into the one `NewsItem`
 * below, so the rest of the site never has to know which API a headline came
 * from. Everything the spec asks us to record about provenance lives on the
 * item itself.
 */

export type NewsProvider = 'apitube' | 'thenewsapi' | 'newsdata' | 'eia_rss' | 'eea_rss' | 'gdelt';

export type NewsItem = {
  /** Normalised URL - the deduplication key required by p. 226. */
  id: string;
  /** Original provider identifier, independent of our URL deduplication key. */
  sourceId?: string | null;
  title: string;
  /** Image URL supplied by the feed; absent in older cached records. */
  imageUrl?: string | null;
  /**
   * The publisher's own short description, where the provider licenses one.
   * GDELT licenses no teaser text, so its items carry `null` and the card
   * shows a headline only. We never write a summary ourselves (p. 226).
   */
  summary: string | null;
  /** Original article URL at the publisher. */
  url: string;
  /** Publisher hostname - this is what the allowlist gate matches on. */
  domain: string;
  /** Human-readable publisher name for the source label. */
  publisher: string;
  /** Source publication timestamp, ISO 8601. */
  publishedAt: string | null;
  language: string | null;
  provider: NewsProvider;
  /** Filled by the anonymous destination check, never inferred from the feed. */
  accessStatus?: AccessStatus;
  accessCheckedAt?: string | null;
  accessEvidence?: string | null;
  finalUrl?: string | null;
  /** Attribution label shown to the reader, e.g. "U.S. EIA". */
  providerLabel: string;
  /** When Enerqa retrieved it. p. 226 keeps this separate from publishedAt. */
  retrievedAt: string;
  /**
   * How often the query that found it is refreshed, in seconds, where that
   * differs from the provider's usual interval (NewsData page baskets: 12 h).
   * The stale notice is judged against this.
   */
  refreshSeconds?: number;
  /** Saved refresh health, evaluated without making requests during a page visit. */
  refreshFailed?: boolean;
  /** Last successful scheduled poll, separate from this article's retrieval time. */
  feedRefreshedAt?: string;
  /**
   * The page "News query baskets" (as NewsData queries) that returned this
   * item. NewsData matches a query against the full article text, which we
   * are not licensed to see, so this is how a page knows the article matched
   * its own basket when the headline and teaser do not repeat the phrase.
   */
  matchedQueries?: string[];
  /** Short rights note kept with the record for the provenance trail. */
  rights: string;
  /** Extracted geographic regions (e.g. 'North America', 'Europe'). */
  regions: string[];
  /** An official feed's own label for the item ("Press release", "Publication"). */
  docType?: string;
  /** Editorial approval applies to this exact headline and publisher description. */
  editorialReview?: EditorialReview;
  /** Original article classifications; scores are provider weights, not probabilities. */
  providerCategories?: { id: string; name: string; score: number | null }[];
};

export const EDITORIAL_REVIEW_VERSION = '2026-10-23-v1';
export const EDITORIAL_TOPICS = ['climate', 'energy', 'environment', 'business', 'markets'] as const;
export type EditorialTopic = typeof EDITORIAL_TOPICS[number];
export type EditorialReview = {
  /** Sector assignments apply to the same exact title/teaser as the topic approval. */
  industries?: string[];
  industryVersion?: string;
  /** Distinguish provider classification and local rules from a human or model review. */
  method?: 'apitube-categories-and-rules-v1';
  version: string;
  decision: 'approved' | 'rejected' | 'pending';
  topics: EditorialTopic[];
  title: string;
  summary: string | null;
  reason: string;
  reviewedAt: string | null;
};

/** Content changes invalidate an earlier decision; missing reviews never count as approval. */
export function hasEditorialApproval(item: Pick<NewsItem, 'title' | 'summary' | 'editorialReview'>): boolean {
  const review = item.editorialReview;
  return Boolean(!isNewsRoundup(item.title) && review && review.version === EDITORIAL_REVIEW_VERSION && review.decision === 'approved'
    && review.title === item.title && review.summary === item.summary && typeof review.reason === 'string' && review.reason.trim()
    && typeof review.reviewedAt === 'string' && Number.isFinite(Date.parse(review.reviewedAt))
    && Array.isArray(review.topics) && review.topics.length > 0
    && review.topics.every(topic => EDITORIAL_TOPICS.includes(topic)));
}

/** Keep a negative decision too, so an unchanged rejected story is not reviewed on every pull. */
export function hasEditorialRejection(item: Pick<NewsItem, 'title' | 'summary' | 'editorialReview'>): boolean {
  const review = item.editorialReview;
  return Boolean(review && review.version === EDITORIAL_REVIEW_VERSION && review.decision === 'rejected'
    && review.title === item.title && review.summary === item.summary && typeof review.reason === 'string' && review.reason.trim()
    && typeof review.reviewedAt === 'string' && Number.isFinite(Date.parse(review.reviewedAt)));
}

/** Newspaper digests mix subjects and must not be promoted as individual topic stories. */
export function isNewsRoundup(title: string): boolean {
  return /^(?:(?:Scotland|Wales|England|Northern Ireland)['’]s papers|newspaper headlines?|the papers|paper review|press review|front pages?|news (?:roundup|round-up|digest))\b/i.test(title.trim());
}

export type NewsBasketKey = 'all' | 'climate' | 'energy' | 'environment' | 'business';

// Focused queries used by the legacy connector; display order follows publication time.
export const THE_NEWS_API_TOPIC_QUERIES: Record<Exclude<NewsBasketKey, 'all'>, string> = {
  climate: 'climate OR emissions OR "greenhouse gases" OR "net zero"',
  energy: '"renewable energy" OR solar OR electricity OR "energy storage" OR hydrogen',
  environment: 'biodiversity OR pollution OR "circular economy" OR deforestation',
  business: '"sustainable finance" OR "climate finance" OR "green bond" OR ESG',
};

/** Only secure public image URLs are suitable for a browser backdrop. */
export function newsImageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export type NewsBasket = {
  key: NewsBasketKey;
  /** Filter labels exactly as approved on p. 13. */
  label: string;
  /**
   * GDELT boolean syntax. Kept short and broad: GDELT rejects a long query
   * ("too short or too long", see gdelt.ts), and every page matches its own
   * baskets against the shared pool afterwards, so the query only has to
   * gather the site's subject matter, not pick stories.
   */
  gdeltQuery: string;
  /**
   * NewsData `q` value. The free plan caps a query at 100 characters (p. 210),
   * so these are deliberately short. They are broad for the same reason as the
   * GDELT queries: the narrow phrase-only versions returned 0-20 articles per
   * basket, too few for any page's own baskets to match (L443, L539). The
   * relevance gate below still decides what is shown. `all` is null because
   * we merge the four topic baskets instead of spending a fifth credit on it.
   */
  newsdataQuery: string | null;
  /** Lower-case terms used to score relevance after ingestion. */
  keywords: string[];
};

/** The four topic baskets. "All" is derived from them, just below. */
const TOPIC_BASKETS: NewsBasket[] = [
  {
    key: 'climate',
    label: 'Climate',
    gdeltQuery: '(climate OR emissions OR "carbon market")',
    newsdataQuery: 'climate OR emissions OR "net zero" OR decarbonisation OR "carbon market"',
    keywords: ['climate', 'carbon', 'emission', 'greenhouse', 'net zero', 'net-zero', 'adaptation', 'decarbon*'],
  },
  {
    key: 'energy',
    label: 'Energy',
    gdeltQuery: '(energy OR renewable OR electricity)',
    newsdataQuery: 'energy OR renewable OR electricity OR "power grid" OR hydrogen OR solar',
    // Covers fossil as well as renewables: a crude-oil production forecast is
    // energy news, and leaving 'oil' or 'lng' out silently dropped real stories.
    keywords: [
      'energy', 'renewab*', 'solar', 'wind', 'grid', 'power', 'electricity',
      'electric', 'hydrogen', 'fuel', 'nuclear', 'gas', 'lng', 'coal', 'oil',
      'petroleum', 'diesel', 'gasoline', 'petrol', 'battery', 'batteries',
      'turbine', 'pipeline', 'refinery', 'refineries', 'utility', 'utilities',
      'geothermal', 'biofuel', 'opec',
    ],
  },
  {
    key: 'environment',
    label: 'Environment and Nature',
    gdeltQuery: '(biodiversity OR pollution OR "circular economy")',
    newsdataQuery: 'biodiversity OR pollution OR "circular economy" OR recycling OR water OR nature',
    keywords: [
      'environment*', 'biodiversity', 'nature', 'ecosystem', 'pollution', 'pollutant',
      'circular', 'waste', 'water', 'forest', 'species', 'recycling',
      'habitat loss', 'habitat destruction', 'coral reef', 'turtle nest',
      'toxic chemical', 'chemical contamination',
    ],
  },
  {
    key: 'business',
    label: 'Business and Finance',
    gdeltQuery: '("sustainable finance" OR "climate finance" OR "green bond")',
    newsdataQuery: 'ESG OR "sustainable finance" OR "climate finance" OR "green bond" OR sustainability',
    // 'invest' is listed without a star on purpose: 'invest*' would also
    // match 'investigation', which is how an unrelated news story gets onto a
    // finance panel.
    keywords: [
      'finance', 'financial', 'invest', 'investment', 'investor', 'esg', 'bond',
      'fund', 'market', 'bank', 'econom*', 'disclosure', 'price', 'cost',
      'trade', 'tariff', 'subsidy', 'subsidies',
    ],
  },
];

/**
 * "All" inherits every topic keyword. An empty keyword list would mean "accept
 * anything", and that is not theoretical: with no keywords, a live NewsData
 * query put an Oracle data-centre debt story at the top of the homepage.
 */
const ALL_BASKET: NewsBasket = {
  key: 'all',
  label: 'All',
  gdeltQuery: '(climate OR energy OR biodiversity OR "sustainable finance")',
  // null because "All" merges the four cached topic baskets rather than
  // spending a fifth NewsData credit on its own query.
  newsdataQuery: null,
  keywords: [...new Set(TOPIC_BASKETS.flatMap((b) => b.keywords))],
};

/** Filter order on screen, matching the labels approved on p. 13. */
export const NEWS_BASKETS: NewsBasket[] = [ALL_BASKET, ...TOPIC_BASKETS];

export function getBasket(key: NewsBasketKey): NewsBasket {
  return NEWS_BASKETS.find((b) => b.key === key) ?? ALL_BASKET;
}

/**
 * Exact-source allowlist. pp. 210-211 both make the same point: a free API
 * does NOT mean the article behind the link is free to read. So the definitive
 * gate is ours, applied after ingestion, not a filter we ask the provider for.
 *
 * Adding a domain is an editorial decision. Open one of its articles in a
 * private window first: if it asks for payment, a subscription or a signup,
 * it does not belong here.
 */
export const SOURCE_ALLOWLIST = [
  'reuters.com',
  'theguardian.com',
  'iea.org',
  'irena.org',
  'unep.org',
  'unfccc.int',
  'worldbank.org',
  'eia.gov',
  'esa.int',
  'europa.eu',
  'un.org',
  'imf.org',
  'oecd.org',
  'nasa.gov',
  'noaa.gov',
  // Reviewed 19 Oct 2026 for the provider-only domain trial; destinations still
  // require an anonymous verified-open check before any article is displayed.
  'theconversation.com',
  'mg.co.za',
  'bbc.co.uk',
  // Stock-reporting destinations reviewed 20 Oct 2026; each URL still needs verified_open.
  'cnbc.com',
  // Reviewed in private browser contexts on 24 Oct 2026 for APITube sector coverage.
  // Each individual destination still needs the normal anonymous access check.
  'myjoyonline.com',
  'betakit.com',
  'transportandenergy.com',
  'agronigeria.ng',
  'news.mongabay.com',
  'logisticsnews.ph',
];

/** Hostname of a URL, lower-cased and without "www.". Empty string if unparseable. */
export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Suffix match so a subdomain inherits its parent's approval - `eea.europa.eu`
 * passes because `europa.eu` is approved. The leading-dot check stops
 * "notreuters.com" from sneaking past a plain `endsWith`.
 */
export function isAllowedDomain(domain: string): boolean {
  if (!domain) return false;
  return SOURCE_ALLOWLIST.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`));
}

/**
 * Campaign parameters that identify where a click came from, never which
 * article it points at. Safe to remove before comparing two URLs.
 */
const TRACKING_PARAMS = /^(utm_|mc_|pk_|ref$|referrer$|source$|fbclid$|gclid$|igshid$|cmpid$|ito$)/i;

/**
 * Normalise a URL so the same article arriving from two feeds dedupes to one.
 *
 * Only tracking parameters are removed. Dropping the whole query string looks
 * tidier but is wrong: EIA addresses an article as
 * `todayinenergy/detail.php?id=68164`, so blanking `search` would collapse
 * every EIA story onto a single key and we would publish one of them.
 */
export function normaliseUrl(url: string): string {
  try {
    const u = new URL(url);
    for (const key of [...u.searchParams.keys()]) {
      if (TRACKING_PARAMS.test(key)) u.searchParams.delete(key);
    }
    u.hash = '';
    u.protocol = 'https:';
    return u.toString().replace(/\/$/, '');
  } catch {
    return url;
  }
}

/**
 * Publication-date validation (p. 226). A missing, future or very old date is
 * a reason not to display an item, not a reason to invent one.
 */
const MAX_AGE_DAYS = 60;

export function isPlausibleDate(iso: string | null): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  const now = Date.now();
  // 6 hours of slack absorbs publisher clock skew and timezone sloppiness.
  if (t > now + 6 * 60 * 60 * 1000) return false;
  return now - t <= MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Discovery vocabulary for a broad shortlist, not permission to publish.
 * Saved editorial decisions determine the actual subject and display category.
 *
 * This exists because a basket keyword alone is not enough. "Oracle's $18
 * billion data center debt" contains "banks", so it passes the Business and
 * Finance keywords - but it has nothing to do with sustainable finance. The
 * anchor below is what separates the two.
 *
 * A trailing `*` means "this word stem and anything after it".
 */
const CORE_TOPIC_TERMS = [
  // Climate
  'climate', 'carbon', 'emission', 'greenhouse', 'net zero', 'net-zero', 'decarbon*',
  'sustainab*', 'methane', 'cop28', 'cop29', 'cop30', 'ipcc', 'unfccc', 'paris agreement',
  'drought', 'flood', 'wildfire', 'heatwave', 'glacier', 'sea level',
  // Energy
  'energy', 'renewab*', 'solar', 'wind', 'hydrogen', 'nuclear', 'electricity', 'electric',
  'grid', 'fuel', 'gas', 'lng', 'oil', 'coal', 'power', 'petroleum', 'diesel', 'gasoline',
  'petrol', 'battery', 'batteries', 'geothermal', 'biofuel', 'utility', 'utilities',
  'refinery', 'refineries', 'pipeline', 'turbine', 'photovoltaic', 'opec',
  // Environment and nature
  'environment*', 'biodiversity', 'ecosystem', 'pollution', 'pollutant', 'polluter',
  'circular economy', 'recycling', 'plastic', 'waste', 'wastewater', 'forest',
  'deforestation', 'wildlife', 'conservation', 'mining', 'pfas', 'air quality',
  // Ecological impacts can be explicit without the headline saying "environment".
  'habitat loss', 'habitat destruction', 'coral reef', 'turtle nest',
  // Industrial contamination is environmental news without saying "pollution".
  'toxic chemical', 'chemical contamination',
  // ESG and sustainable finance
  'esg', 'green bond', 'climate finance', 'sustainable finance', 'green energy',
];

/** Broad discovery is only a shortlist; it never grants permission to publish. */
export function isNewsCandidate(item: Pick<NewsItem, 'title' | 'summary'>): boolean {
  return !isNewsRoundup(item.title) && containsAny(`${item.title} ${item.summary ?? ''}`, CORE_TOPIC_TERMS);
}

// Agriculture headlines often name food or farming and explain sustainability
// in the publisher's description. Require both, rather than accepting all food news.
const AGRICULTURE_HEADLINE_TERMS = [
  'agricultur*', 'farming', 'farmer', 'food', 'aquacultur*', 'fisheries', 'livestock',
  'crop', 'irrigation',
];
const AGRICULTURE_SUSTAINABILITY_TERMS = [
  'climate', 'emission', 'greenhouse', 'sustainab*', 'biodiversity', 'deforestation',
  'soil carbon', 'food security', 'food systems', 'environmental resilience', 'environmental impact',
];

const termCache = new Map<string, RegExp>();

/**
 * Build a word-boundary matcher for one term.
 *
 * Plain substring matching is not safe here. `"powerless".includes("power")`
 * is true, so an actor's interview headlined "I understand what it's like to
 * be powerless" was matching the Energy basket. Matching whole words, plus
 * ordinary plural and verb endings, fixes that while still catching
 * "emissions" and "investing".
 */
function termMatcher(term: string): RegExp {
  const cached = termCache.get(term);
  if (cached) return cached;

  const isPrefix = term.endsWith('*');
  const base = (isPrefix ? term.slice(0, -1) : term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = isPrefix ? `\\b${base}` : `\\b${base}(s|es|ed|ing)?\\b`;

  const re = new RegExp(pattern, 'i');
  termCache.set(term, re);
  return re;
}

export function containsAny(haystack: string, terms: string[]): boolean {
  return terms.some((term) => termMatcher(term).test(haystack));
}

/** Prefer the reviewed subject; unreviewed inputs retain the legacy candidate matcher. */
export function isOnSiteTopic(item: Pick<NewsItem, 'title'> & Partial<Pick<NewsItem, 'summary' | 'editorialReview'>>): boolean {
  if (isNewsRoundup(item.title)) return false;
  if (item.editorialReview) return hasEditorialApproval({ ...item, summary: item.summary ?? null })
    && item.editorialReview.topics.some(topic => topic !== 'markets');
  // This inexpensive check gathers candidates only. Public storage requires semantic approval.
  return containsAny(item.title, CORE_TOPIC_TERMS) || (
    containsAny(item.title, AGRICULTURE_HEADLINE_TERMS) &&
    containsAny(item.summary ?? '', AGRICULTURE_SUSTAINABILITY_TERMS)
  );
}

/** Approved items use their reviewed topics; unreviewed input is only a candidate. */
export function matchesBasket(item: NewsItem, basket: NewsBasket): boolean {
  if (!isOnSiteTopic(item)) return false;
  if (hasEditorialApproval(item)) return basket.key === 'all' || item.editorialReview!.topics.includes(basket.key);
  if (basket.keywords.length === 0) return true;
  return containsAny(`${item.title} ${item.summary ?? ''}`, basket.keywords);
}

/**
 * Shared post-ingestion gate: allowlist, date validation, URL dedupe and a cap
 * per publisher so one outlet cannot fill a panel on its own.
 *
 * The cap defaults to 2 rather than 1 because both EEA feeds live on the same
 * hostname - a cap of 1 would silently discard half the EEA coverage.
 */
export function applyGate(items: NewsItem[], opts: { maxPerPublisher?: number } = {}): NewsItem[] {
  const { maxPerPublisher = 2 } = opts;
  const seenUrls = new Set<string>();
  const perPublisher = new Map<string, number>();
  const out: NewsItem[] = [];

  for (const item of items) {
    if (!item.title || !item.url) continue;
    if (!isAllowedDomain(item.domain)) continue;
    if (!isPlausibleDate(item.publishedAt)) continue;

    // Normalise here rather than trusting `item.id`. Every connector already
    // sets `id` to the normalised URL, but the gate is the last thing standing
    // between a provider and the page, so it should not depend on that.
    const key = normaliseUrl(item.url);
    if (seenUrls.has(key)) continue;

    const used = perPublisher.get(item.domain) ?? 0;
    if (used >= maxPerPublisher) continue;

    seenUrls.add(key);
    perPublisher.set(item.domain, used + 1);
    out.push(item);
  }

  return out;
}

/** Attribution shown under a feed. p. 229 keeps source labels legible. */
export const PROVIDER_META: Record<NewsProvider, { label: string; href: string }> = {
  apitube: { label: 'APITube', href: 'https://apitube.io/' },
  thenewsapi: { label: 'TheNewsAPI', href: 'https://www.thenewsapi.com/' },
  newsdata: { label: 'NewsData.io', href: 'https://newsdata.io/' },
  eia_rss: { label: 'U.S. EIA', href: 'https://www.eia.gov/todayinenergy/' },
  eea_rss: { label: 'European Environment Agency', href: 'https://www.eea.europa.eu/' },
  gdelt: { label: 'The GDELT Project', href: 'https://www.gdeltproject.org/' },
};

/** Newest first. Items are only here if they passed date validation. */
export function byNewest(a: NewsItem, b: NewsItem): number {
  return Date.parse(b.publishedAt ?? '') - Date.parse(a.publishedAt ?? '');
}
