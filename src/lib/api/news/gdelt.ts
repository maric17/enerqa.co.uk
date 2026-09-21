import type { NewsItem, NewsBasketKey } from './types';
import { getBasket, hostnameOf, normaliseUrl, SOURCE_ALLOWLIST } from './types';
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
 * access. The allowlist below, and the shared gate in the aggregator, are
 * what make that inference unnecessary.
 */

const ENDPOINT = 'https://api.gdeltproject.org/api/v2/doc/doc';

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

export async function fetchGdeltNews(basketKey: NewsBasketKey = 'all', limit = 12): Promise<NewsItem[]> {
  const basket = getBasket(basketKey);
  // p. 211 requires exact-domain `domainis:` predicates rather than an open
  // web crawl. GDELT accepts the whole allowlist in one query.
  const domains = SOURCE_ALLOWLIST.map((d) => `domainis:${d}`).join(' OR ');
  const query = `${basket.gdeltQuery} (${domains})`;

  const url =
    `${ENDPOINT}?query=${encodeURIComponent(query)}` +
    `&mode=artlist&maxrecords=${Math.min(limit * 3, 250)}&format=json&sort=datedesc`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'enerqa.co.uk/1.0 (+https://enerqa.co.uk)' },
      // p. 211 suggests 1-2 hours. One cached fetch serves every visitor,
      // which is also what keeps us inside GDELT's request shedding.
      next: { revalidate: 5400, tags: ['news', 'gdelt'] },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn(`[gdelt] HTTP ${res.status} for basket "${basket.key}"`);
      return [];
    }

    const text = await res.text();
    // GDELT answers rate limits with plain text rather than JSON.
    if (!text.trim().startsWith('{')) {
      console.warn('[gdelt] non-JSON response (usually rate limiting)');
      return [];
    }

    const data = JSON.parse(text) as { articles?: unknown[] };
    const retrievedAt = new Date().toISOString();

    return (data.articles ?? []).flatMap((raw) => {
      const a = raw as Record<string, unknown>;
      const articleUrl = typeof a.url === 'string' ? a.url : '';
      const title = typeof a.title === 'string' ? a.title.trim() : '';
      if (!articleUrl || !title) return [];

      const domain = typeof a.domain === 'string' ? a.domain.toLowerCase().replace(/^www\./, '') : hostnameOf(articleUrl);

      return [
        {
          id: normaliseUrl(articleUrl),
          title,
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
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    const cause = error instanceof Error && (error.cause as Error)?.message ? ` - ${(error.cause as Error).message}` : '';
    console.warn(`[gdelt] fetch failed for basket "${basket.key}": ${msg}${cause}`);
    return [];
  }
}
