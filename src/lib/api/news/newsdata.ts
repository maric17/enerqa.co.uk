import { fetchFromProvider, providerKey, type BodyRejection } from '../core/fetch';
import { fail, ok, type ConnectorResult } from '../core/types';
import type { NewsItem, NewsBasketKey } from './types';
import { getBasket, hostnameOf, normaliseUrl, newsImageUrl } from './types';
import { extractRegions } from './geography';

/**
 * NewsData.io - handoff p. 210 (Provider ID: newsdata). The primary news
 * source: it is the only approved provider that licenses a short description
 * alongside the headline for general global coverage.
 *
 * Free-plan limits this file is built around:
 *   200 credits/day · 10 articles per credit · 30 credits per 15 minutes
 *   100-character search query · 12-hour delay · no full article text
 *
 * Credit arithmetic (the spec does this sum on p. 210 and lands on 48):
 *   4 topic baskets x 1 credit, refreshed every 2 hours = 4 x 12 = 48/day
 *   38 page baskets (pp. 30, 38, 49, 60 and 66-138: 3 per domain, 2 per
 *   industry) x 1 credit, refreshed every 12 hours   = 38 x 2 = 76/day
 *   total 124/day, under the internal budget of 150 in core/health.ts and the
 *   provider's 200. The page baskets are the spec's own "News query baskets";
 *   the 12-hour refresh matches the free plan's 12-hour delay, so a faster one
 *   would buy nothing. Their results join the one shared pool (p. 210 "Reuse
 *   one cached pool across all pages").
 *
 * The budget, backoff and cache live in core/fetch.ts like every other
 * provider. The old in-file budget counted a credit on every render, cache
 * hits included, and switched NewsData off after ~30 page views (L379).
 *
 * The "All" filter is a merge of the four cached baskets, not a fifth query,
 * so it costs nothing extra.
 */

const ENDPOINT = 'https://newsdata.io/api/1/latest';

/** p. 210: free plan, 12-hour delay. Both facts are shown to the reader. */
export const NEWSDATA_DELAY_HOURS = 12;

/** p. 210 suggests a shared refresh every 2 hours. */
const REVALIDATE_SECONDS = 7200;

/** Page baskets: every 12 hours, the free plan's own delay (see above). */
export const PAGE_BASKET_SECONDS = 12 * 3600;

/**
 * Sent as `domainurl` purely to stop us spending credits on articles the
 * allowlist would throw away anyway.
 *
 * This is NOT the access gate. p. 210 is explicit that the post-ingestion
 * allowlist is "the definitive gate", and that is applied in the aggregator.
 * Two practical notes:
 *  - The free plan rejects more than five domains per query with
 *    "Number of domain cannot exceeded 5 in a single query."
 *  - These five are the allowlisted domains NewsData actually indexes as news
 *    publishers. Institutional sites (unfccc.int, esa.int) are covered by the
 *    RSS and GDELT connectors instead.
 */
const PREFILTER_DOMAINS = ['reuters.com', 'theguardian.com', 'iea.org', 'worldbank.org', 'un.org'];

const RIGHTS =
  'Metadata discovery under the NewsData.io free commercial plan. Headline, supplied description and link only; publisher retains article and image rights.';

/** NewsData sends "2026-09-18 22:30:52" plus a separate timezone field. */
function toIso(pubDate: unknown, tz: unknown): string | null {
  if (typeof pubDate !== 'string' || !pubDate) return null;
  const zone = typeof tz === 'string' ? tz.toUpperCase() : 'UTC';
  const base = pubDate.trim().replace(' ', 'T');
  const stamp = zone === 'UTC' || !zone ? `${base}Z` : base;
  const t = Date.parse(stamp);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

function firstString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const found = value.find((v) => typeof v === 'string' && v.trim());
    return typeof found === 'string' ? found.trim() : null;
  }
  return null;
}

type NewsdataPage = { status?: string; results?: unknown; nextPage?: string | null };

/**
 * NewsData answers errors with HTTP 200 and status:"error". Such a body is
 * rejected before it can be cached, and a rate-limit code trips the backoff.
 */
export function rejectNewsdataBody(body: unknown): BodyRejection | null {
  const page = body as NewsdataPage & { results?: { code?: string; message?: string } };
  if (page?.status === 'success' && Array.isArray(page.results)) return null;
  const code = !Array.isArray(page?.results) ? page?.results?.code : undefined;
  const message = !Array.isArray(page?.results) ? page?.results?.message : undefined;
  return {
    reason: code && /rate|limit/i.test(code) ? 'rate_limited' : 'unavailable',
    message: `non-success payload${code ? ` (${code}${message ? `: ${message}` : ''})` : ''}`,
  };
}

export function mapNewsdataResults(results: unknown[], retrievedAt: string): NewsItem[] {
  return results.flatMap((raw) => {
    const a = raw as Record<string, unknown>;
    const url = typeof a.link === 'string' ? a.link : '';
    const title = typeof a.title === 'string' ? a.title.trim() : '';
    if (!url || !title) return [];

    // The free plan returns no full article text; `description` is the
    // provider-supplied teaser we are permitted to show. `content` and the
    // ai_* fields are paid-plan features and are deliberately ignored.
    const description = typeof a.description === 'string' ? a.description.trim() : '';

    return [
      {
        id: normaliseUrl(url),
        sourceId: typeof a.article_id === 'string' ? a.article_id : null,
        title,
        imageUrl: newsImageUrl(a.image_url),
        summary: description || null,
        url,
        // Gate on the hostname of the ARTICLE link, not `source_url`. p. 210
        // asks us to validate the actual reading destination, and a feed can
        // list a publisher's homepage while linking somewhere else entirely.
        domain: hostnameOf(url),
        publisher: (typeof a.source_name === 'string' && a.source_name) || hostnameOf(url),
        publishedAt: toIso(a.pubDate, a.pubDateTZ),
        language: firstString(a.language) ?? 'en',
        provider: 'newsdata',
        providerLabel: 'NewsData.io',
        retrievedAt,
        rights: RIGHTS,
        regions: extractRegions(title, description || null),
      } satisfies NewsItem,
    ];
  });
}

/**
 * One OR'd basket of the spec's phrases as a NewsData query: phrases in
 * quotes, joined with OR. All 38 page baskets come to 80 characters or less,
 * inside the 100-character cap (p. 210).
 */
export function basketQuery(phrases: string[]): string {
  return phrases.map((p) => (/\s/.test(p) ? `"${p}"` : p)).join(' OR ');
}

/** One cached NewsData query: 10 articles, one credit, one shared copy for every visitor. */
export async function fetchNewsdataQuery(
  query: string,
  revalidate = REVALIDATE_SECONDS,
): Promise<ConnectorResult<NewsItem[]>> {
  // Read at call time, not module load, so a missing key is a quiet skip
  // rather than a crash at import.
  const apiKey = providerKey('newsdata');
  if (!apiKey) return fail('newsdata', 'not_configured', 'NEWSDATA_API_KEY is not set.');

  // p. 210 caps the free-plan query at 100 characters. Failing loudly in
  // development is better than a silent 422 in production.
  if (query.length > 100) {
    console.warn(`[newsdata] query "${query.slice(0, 40)}..." exceeds the 100-character free-plan cap`);
    return fail('newsdata', 'unavailable', 'Query exceeds the free-plan length cap.');
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    q: query,
    language: 'en',
    domainurl: PREFILTER_DOMAINS.join(','),
    // 10 articles is exactly one credit. Asking for more costs more credits.
    size: '10',
  });

  const res = await fetchFromProvider<NewsdataPage>('newsdata', `${ENDPOINT}?${params.toString()}`, {
    revalidate,
    tags: ['news'],
    // A broad basket took 11 s to answer on 25 Sep 2026. The call runs
    // behind a Suspense boundary, so waiting does not block the page.
    timeoutMs: 25000,
    rejectBody: rejectNewsdataBody,
  });
  if (!res.ok) return res;

  const results = Array.isArray(res.data.results) ? res.data.results : [];
  const items = mapNewsdataResults(results, res.retrievedAt).map((item) => ({
    ...item,
    refreshSeconds: revalidate,
    matchedQueries: [query],
  }));
  return ok('newsdata', items, res.retrievedAt, res.stale);
}

/**
 * Fetch one topic basket. `all` returns an empty success because it is
 * assembled from the other four in the aggregator rather than costing its own
 * credit.
 */
export async function fetchNewsdataBasket(basketKey: NewsBasketKey): Promise<ConnectorResult<NewsItem[]>> {
  const basket = getBasket(basketKey);
  if (!basket.newsdataQuery) return ok('newsdata', []);
  return fetchNewsdataQuery(basket.newsdataQuery, REVALIDATE_SECONDS);
}
