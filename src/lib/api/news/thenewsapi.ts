import { fetchFromProvider, providerKey, type BodyRejection } from '../core/fetch';
import { fail, ok, type ConnectorResult } from '../core/types';
import { extractRegions } from './geography';
import { NEWS_REFRESH_SECONDS } from './schedule';
import { STOCK_MARKET_QUERIES } from './markets';
import { hostnameOf, newsImageUrl, normaliseUrl, SOURCE_ALLOWLIST, THE_NEWS_API_TOPIC_QUERIES, type NewsBasketKey, type NewsItem } from './types';

type NewsPage = { data?: unknown; error?: { code?: unknown } };
const ENDPOINT = 'https://api.thenewsapi.com/v1/news/all';

/** Translate our internal query operators outside quoted phrases only. */
export function theNewsApiQuery(query: string): string {
  return query.split(/("[^\"]*")/g).map((part, index) => index % 2 ? part
    : part.replace(/\bOR\b/g, '|').replace(/\bAND\b/g, '+')).join('');
}

export function rejectTheNewsApiBody(body: unknown): BodyRejection | null {
  const page = body as NewsPage | null;
  if (page && !page.error && Array.isArray(page.data)) return null;
  const code = page?.error?.code;
  return { reason: typeof code === 'string' && /limit/.test(code) ? 'rate_limited' : 'unavailable',
    // Never echo a provider message: it could contain the credential-bearing URL.
    message: 'TheNewsAPI returned an error or an invalid article list.' };
}

export function mapTheNewsApiResults(results: unknown[], retrievedAt: string): NewsItem[] {
  return results.flatMap(raw => {
    if (!raw || typeof raw !== 'object') return [];
    const article = raw as Record<string, unknown>;
    const url = typeof article.url === 'string' ? article.url.trim() : '';
    const title = typeof article.title === 'string' ? article.title.trim() : '';
    if (!url || !title) return [];
    const description = typeof article.description === 'string' ? article.description.trim() : '';
    const published = typeof article.published_at === 'string' ? Date.parse(article.published_at) : NaN;
    return [{
      id: normaliseUrl(url), sourceId: typeof article.uuid === 'string' ? article.uuid : null,
      title, url, domain: hostnameOf(url), publisher: hostnameOf(url),
      // Only the supplied description is a teaser; never copy snippet/main_text.
      summary: description || null, imageUrl: newsImageUrl(article.image_url),
      publishedAt: Number.isFinite(published) ? new Date(published).toISOString() : null,
      language: typeof article.language === 'string' ? article.language : null,
      provider: 'thenewsapi', providerLabel: 'TheNewsAPI', retrievedAt,
      rights: 'Metadata supplied by TheNewsAPI. Publishers retain article and image rights; link to the original article.',
      regions: extractRegions(title, description || null),
    } satisfies NewsItem];
  });
}

/** Omit limit so the same request uses the account maximum: Free 3, Basic 25. */
export async function fetchTheNewsApiQuery(query: string, revalidate = NEWS_REFRESH_SECONDS,
  fresh = false, languages: string[] = ['en'], options: { days?: number } = {}): Promise<ConnectorResult<NewsItem[]>> {
  const token = providerKey('thenewsapi');
  if (!token) return fail('thenewsapi', 'not_configured', 'THE_NEWS_API_TOKEN is not set.');
  const params = new URLSearchParams({
    api_token: token, search: theNewsApiQuery(query), language: languages.join(','),
    // Stock slots require matching headlines; domain feeds also search descriptions.
    search_fields: STOCK_MARKET_QUERIES.includes(query) ? 'title' : 'title,description',
    domains: SOURCE_ALLOWLIST.join(','), sort: 'published_at',
    // Exclude old indexed stories before they consume the small free-plan response.
    published_after: new Date(Date.now() - (options.days ?? 7) * 86400000).toISOString().slice(0, 10),
  });
  const result = await fetchFromProvider<NewsPage>('thenewsapi', `${ENDPOINT}?${params}`, {
    revalidate, fresh, tags: ['news'], timeoutMs: 25000, rejectBody: rejectTheNewsApiBody,
    errorCode: body => {
      const code = (body as NewsPage | null)?.error?.code;
      return typeof code === 'string' ? code : null;
    },
  });
  if (!result.ok) return result;
  const items = mapTheNewsApiResults(result.data.data as unknown[], result.retrievedAt)
    .map(item => ({ ...item, refreshSeconds: revalidate, matchedQueries: [query] }));
  return ok('thenewsapi', items, result.retrievedAt, result.stale);
}

export async function fetchTheNewsApiBasket(key: NewsBasketKey, fresh = false): Promise<ConnectorResult<NewsItem[]>> {
  const query = key === 'all' ? null : THE_NEWS_API_TOPIC_QUERIES[key];
  // Sustainable-finance coverage is less frequent. Keep its latest available
  // dated articles inside the existing 60-day publication gate.
  return query ? fetchTheNewsApiQuery(query, NEWS_REFRESH_SECONDS, fresh, ['en'], { days: key === 'business' ? 60 : 7 })
    : ok('thenewsapi', []);
}
