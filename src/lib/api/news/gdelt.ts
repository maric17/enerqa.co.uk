import { fetchFromProvider, type BodyRejection } from '../core/fetch';
import { fail, ok, type ConnectorResult } from '../core/types';
import type { NewsItem, NewsBasketKey } from './types';
import { getBasket, hostnameOf, isAllowedDomain, normaliseUrl, newsImageUrl } from './types';
import { extractRegions } from './geography';

/**
 * GDELT Doc 2.0 (legacy endpoint) - handoff p. 211 (Provider ID: gdelt).
 *
 * Role in the mix: breadth. It is keyless, free for commercial use, and
 * indexes far more publishers and languages than the other two sources.
 *
 * What it cannot do: GDELT licenses no teaser text, so every item here has
 * `summary: null` and renders as a headline plus a source. That is exactly
 * why it is supplementary rather than primary - NewsData.io and the RSS
 * feeds supply the "permitted short description" p. 13 asks for.
 *
 * p. 211 also warns: do not infer that a GDELT-indexed article is open
 * access. The allowlist below, and the shared gate and access check in the
 * aggregator, are what make that inference unnecessary.
 *
 * Two live findings (25 Sep 2026) shape this file:
 *  - Every cached GDELT reply was "Your query was too short or too long." The
 *    query put all 15 allowlisted domains in one `domainis:` group (290-410
 *    characters). A 180-character query with five domains answered normally,
 *    so queries are now held to GDELT_MAX_QUERY and a query that would exceed
 *    it is not sent.
 *  - Faster polling is answered with HTTP 429 "Please limit requests to one
 *    every 5 seconds". core/health.ts spaces GDELT requests by 5.5 s, one at a
 *    time, and backs off after a refusal. Neither reply is ever cached as data
 *    (L1030): both arrive as plain text, which `rejectGdeltBody` refuses.
 */

const ENDPOINT = 'https://api.gdeltproject.org/api/v2/doc/doc';

/** The longest query observed to work (180 characters, 25 Sep 2026). */
export const GDELT_MAX_QUERY = 180;

/**
 * The approved source basket for GDELT (p. 211: "domainis: predicates for an
 * approved source basket"): the allowlisted publishers GDELT indexes as news.
 * Institutional sites reach the pool through NewsData and the RSS feeds.
 */
export const GDELT_DOMAINS = ['theguardian.com', 'reuters.com', 'un.org', 'europa.eu', 'worldbank.org'];

/** p. 211: article-list maximum 250. One cached call fills the shared pool. */
const MAX_RECORDS = 250;

const RIGHTS =
  'GDELT Project released dataset, free for commercial use with citation. Underlying publishers retain article and image rights.';

/** GDELT seendate looks like 20260919T143000Z. */
function parseSeenDate(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  const iso = `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

export function gdeltQuery(basketKey: NewsBasketKey): string {
  const domains = GDELT_DOMAINS.map((d) => `domainis:${d}`).join(' OR ');
  return `${getBasket(basketKey).gdeltQuery} (${domains})`;
}

/**
 * GDELT answers both rate limiting and query errors with plain text, on HTTP
 * 200 as well as 429. Neither may be cached or parsed as articles.
 */
export function rejectGdeltBody(body: unknown): BodyRejection | null {
  const text = typeof body === 'string' ? body.trim() : '';
  if (text.startsWith('{')) {
    try {
      JSON.parse(text);
      return null;
    } catch {
      // Checked here so an unreadable reply is never cached either.
      return { reason: 'unavailable', message: 'JSON that could not be read' };
    }
  }
  if (/limit requests|too many/i.test(text)) return { reason: 'rate_limited', message: 'rate-limit reply' };
  return { reason: 'unavailable', message: `non-JSON reply: ${text.slice(0, 60) || '(empty)'}` };
}

export function mapGdeltArticles(articles: unknown[], retrievedAt: string): NewsItem[] {
  return articles.flatMap((raw) => {
    const a = raw as Record<string, unknown>;
    const articleUrl = typeof a.url === 'string' ? a.url : '';
    const title = typeof a.title === 'string' ? a.title.trim() : '';
    if (!articleUrl || !title) return [];

    // Gate on the article link's own host, like NewsData (p. 211: "validate
    // the actual returned destination").
    const domain = hostnameOf(articleUrl) || (typeof a.domain === 'string' ? a.domain.toLowerCase().replace(/^www\./, '') : '');
    if (!isAllowedDomain(domain)) return [];

    return [
      {
        id: normaliseUrl(articleUrl),
        title,
        imageUrl: newsImageUrl(a.socialimage),
        // GDELT licenses no teaser text - see the file header.
        summary: null,
        url: articleUrl,
        domain,
        publisher: domain,
        publishedAt: parseSeenDate(a.seendate),
        language: typeof a.language === 'string' ? a.language : null,
        provider: 'gdelt',
        providerLabel: 'GDELT',
        retrievedAt,
        rights: RIGHTS,
        regions: extractRegions(title, null),
      } satisfies NewsItem,
    ];
  });
}

export async function fetchGdeltNews(basketKey: NewsBasketKey = 'all'): Promise<ConnectorResult<NewsItem[]>> {
  const query = gdeltQuery(basketKey);
  if (query.length > GDELT_MAX_QUERY) {
    console.warn(`[gdelt] basket "${basketKey}" query is ${query.length} characters; GDELT rejects long queries, so it is not sent`);
    return fail('gdelt', 'unavailable', 'Query too long for GDELT.');
  }

  const url = `${ENDPOINT}?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=${MAX_RECORDS}&format=json&sort=datedesc`;

  const res = await fetchFromProvider<string>('gdelt', url, {
    // p. 211 suggests 1-2 hours. One cached fetch serves every visitor, which
    // is also what keeps us inside GDELT's request shedding.
    revalidate: 5400,
    tags: ['news'],
    // GDELT regularly takes over 10 s (every successful reply on 26 Sep 2026
    // took ~17 s), so 20 s cut good answers off. The call is behind a
    // Suspense boundary, and a cache hit never waits for it.
    timeoutMs: 30000,
    asText: true,
    rejectBody: rejectGdeltBody,
  });
  if (!res.ok) return res;

  let articles: unknown[] = [];
  try {
    // "{}" is GDELT's answer when nothing matched.
    const data = JSON.parse(res.data) as { articles?: unknown[] };
    articles = Array.isArray(data.articles) ? data.articles : [];
  } catch {
    return fail('gdelt', 'unavailable', 'GDELT sent JSON that could not be read.');
  }

  return ok('gdelt', mapGdeltArticles(articles, res.retrievedAt), res.retrievedAt, res.stale);
}
