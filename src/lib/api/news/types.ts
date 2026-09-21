/**
 * Shared vocabulary for every news connector (handoff pp. 209-216, 226).
 *
 * Each provider file turns its own response shape into the one `NewsItem`
 * below, so the rest of the site never has to know which API a headline came
 * from. Everything the spec asks us to record about provenance lives on the
 * item itself.
 */

export type NewsProvider = 'newsdata' | 'eia_rss' | 'eea_rss' | 'gdelt';

export type NewsItem = {
  /** Normalised URL - the deduplication key required by p. 226. */
  id: string;
  title: string;
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
  /** Attribution label shown to the reader, e.g. "U.S. EIA". */
  providerLabel: string;
  /** When Enerqa retrieved it. p. 226 keeps this separate from publishedAt. */
  retrievedAt: string;
  /** Short rights note kept with the record for the provenance trail. */
  rights: string;
  /** Extracted geographic regions (e.g. 'North America', 'Europe'). */
  regions: string[];
};

export type NewsBasketKey = 'all' | 'climate' | 'energy' | 'environment' | 'business';

export type NewsBasket = {
  key: NewsBasketKey;
  /** Filter labels exactly as approved on p. 13. */
  label: string;
  /** GDELT boolean syntax. */
  gdeltQuery: string;
  /**
   * NewsData `q` value. The free plan caps a query at 100 characters (p. 210),
   * so these are deliberately short. `all` is null because we merge the four
   * topic baskets instead of spending a fifth credit on it.
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
    gdeltQuery: '("climate change" OR "climate policy" OR "NDC" OR "carbon markets")',
    newsdataQuery: '"climate policy" OR "carbon market" OR "climate adaptation"',
    keywords: ['climate', 'carbon', 'emission', 'greenhouse', 'net zero', 'net-zero', 'adaptation', 'decarbon*'],
  },
  {
    key: 'energy',
    label: 'Energy',
    gdeltQuery: '("energy transition" OR "renewable energy" OR "power grid" OR "energy efficiency")',
    newsdataQuery: '"energy transition" OR "renewable energy" OR "power grid"',
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
    gdeltQuery: '("biodiversity" OR "circular economy" OR "pollution" OR "nature restoration")',
    newsdataQuery: '"biodiversity" OR "circular economy" OR "pollution" OR "water"',
    keywords: ['environment*', 'biodiversity', 'nature', 'ecosystem', 'pollution', 'pollutant', 'circular', 'waste', 'water', 'forest', 'species', 'recycling'],
  },
  {
    key: 'business',
    label: 'Business and Finance',
    gdeltQuery: '("sustainable finance" OR "ESG" OR "green bonds" OR "climate finance")',
    newsdataQuery: '"sustainable finance" OR "climate finance" OR "green bond" OR "ESG"',
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
  gdeltQuery: '("climate policy" OR "energy transition" OR "sustainable finance")',
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
 * The site's subject matter. An item must mention at least one of these to be
 * shown anywhere, whatever basket it arrived in.
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
  // ESG and sustainable finance
  'esg', 'green bond', 'climate finance', 'sustainable finance', 'green energy',
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

/**
 * Relevance filtering (p. 226). Two tests, both of which must pass:
 *   1. the HEADLINE is about our subject matter, and
 *   2. the headline or summary fits the basket the reader asked for.
 *
 * Test 1 deliberately ignores the summary. Checking both let through "17 cats
 * found dead in extreme heat" - an animal-cruelty story whose description
 * happened to mention water. A passing mention inside a description is not
 * what an article is about; a headline usually is.
 *
 * The trade-off is accepted knowingly: this errs towards showing too little
 * rather than too much, because a corporate sustainability site can survive a
 * thin news panel far better than an obviously irrelevant headline. Four
 * providers feed the pool, so there is usually something else to show.
 *
 * Every provider goes through this, official feeds included - a feed is
 * curated for its own subject, not for whichever basket we borrow it for.
 */
export function matchesBasket(item: NewsItem, basket: NewsBasket): boolean {
  if (!containsAny(item.title, CORE_TOPIC_TERMS)) return false;
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
  newsdata: { label: 'NewsData.io', href: 'https://newsdata.io/' },
  eia_rss: { label: 'U.S. EIA', href: 'https://www.eia.gov/todayinenergy/' },
  eea_rss: { label: 'European Environment Agency', href: 'https://www.eea.europa.eu/' },
  gdelt: { label: 'The GDELT Project', href: 'https://www.gdeltproject.org/' },
};

/** Newest first. Items are only here if they passed date validation. */
export function byNewest(a: NewsItem, b: NewsItem): number {
  return Date.parse(b.publishedAt ?? '') - Date.parse(a.publishedAt ?? '');
}
