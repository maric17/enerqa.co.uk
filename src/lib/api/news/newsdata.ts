import type { NewsItem, NewsBasketKey } from './types';
import { getBasket, hostnameOf, normaliseUrl } from './types';
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
 *   4 topic baskets x 1 credit, refreshed every 2 hours = 4 x 12 = 48 credits
 *   per day, leaving the rest of the 200 for retries and other pages.
 *
 * The "All" filter is a merge of the four cached baskets, not a fifth query,
 * so it costs nothing extra.
 */

const ENDPOINT = 'https://newsdata.io/api/1/latest';

/** p. 210: free plan, 12-hour delay. Both facts are shown to the reader. */
export const NEWSDATA_DELAY_HOURS = 12;

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

/**
 * Per-provider request budget (p. 226). This is a per-server-instance
 * safeguard, not a global ledger - it resets on restart and each instance
 * counts separately. It exists to make a runaway loop cheap to notice, not to
 * be the only thing standing between us and the daily cap; the shared fetch
 * cache does that job.
 */
const DAILY_CREDIT_BUDGET = 120;
let creditsUsed = 0;
let budgetDay = '';

function withinBudget(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== budgetDay) {
    budgetDay = today;
    creditsUsed = 0;
  }
  if (creditsUsed >= DAILY_CREDIT_BUDGET) return false;
  creditsUsed += 1;
  return true;
}

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

/**
 * Fetch one topic basket. `all` returns [] because it is assembled from the
 * other four in the aggregator rather than costing its own credit.
 */
export async function fetchNewsdataBasket(basketKey: NewsBasketKey): Promise<NewsItem[]> {
  const basket = getBasket(basketKey);
  if (!basket.newsdataQuery) return [];

  // Read at call time, not module load, so a missing key is a quiet skip
  // rather than a crash at import.
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    console.warn('[newsdata] NEWSDATA_API_KEY is not set - skipping this provider');
    return [];
  }

  // p. 210 caps the free-plan query at 100 characters. Failing loudly in
  // development is better than a silent 422 in production.
  if (basket.newsdataQuery.length > 100) {
    console.warn(`[newsdata] basket "${basket.key}" query exceeds the 100-character free-plan cap`);
    return [];
  }

  if (!withinBudget()) {
    console.warn('[newsdata] daily request budget reached - skipping this provider');
    return [];
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    q: basket.newsdataQuery,
    language: 'en',
    domainurl: PREFILTER_DOMAINS.join(','),
    // 10 articles is exactly one credit. Asking for more costs more credits.
    size: '10',
  });

  try {
    const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
      headers: { 'User-Agent': 'enerqa.co.uk/1.0 (+https://enerqa.co.uk)' },
      // p. 210 suggests a shared server-side fetch every 2 hours. One cached
      // response serves every visitor - we never request per visitor.
      next: { revalidate: 7200, tags: ['news', 'newsdata'] },
    });

    if (!res.ok) {
      // 429 means we are over the 30-credits-per-15-minutes window. Returning
      // nothing lets the RSS and GDELT sources carry the panel instead.
      console.warn(`[newsdata] HTTP ${res.status} for basket "${basket.key}"`);
      return [];
    }

    const data = (await res.json()) as { status?: string; results?: unknown };

    // NewsData answers errors with HTTP 200 and status:"error", so the body
    // has to be checked as well as the status code.
    if (data.status !== 'success' || !Array.isArray(data.results)) {
      console.warn(`[newsdata] non-success payload for basket "${basket.key}"`);
      return [];
    }

    const retrievedAt = new Date().toISOString();

    return data.results.flatMap((raw) => {
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
          title,
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
  } catch (error) {
    console.warn(`[newsdata] fetch failed for basket "${basket.key}":`, error);
    return [];
  }
}
