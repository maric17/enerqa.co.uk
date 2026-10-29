import { fetchFromProvider, providerKey, type BodyRejection } from '../core/fetch';
import { fail, ok, type ConnectorResult } from '../core/types';
import { extractRegions } from './geography';
import { STOCK_MARKET_QUERIES } from './markets';
import { GENERAL_NEWS_REFRESH_SECONDS, NEWS_REFRESH_SECONDS } from './schedule';
import { INDUSTRY_FEEDS } from '../../feeds/contextual';
import { hostnameOf, isAllowedDomain, newsImageUrl, normaliseUrl, type NewsBasketKey, type NewsItem } from './types';

type ApiTubePage = { status?: unknown; results?: unknown; errors?: { code?: unknown }[] };
const ENDPOINT = 'https://api.apitube.io/v1/news/everything';
// APITube silently drops values after the third; these are already approved publishers.
export const API_TUBE_SOURCES = ['theguardian.com', 'bbc.co.uk', 'reuters.com'];
export const API_TUBE_CATEGORIES = {
  climate: ['medtop:20000418', 'medtop:20000419'],
  energy: ['medtop:20000257', 'medtop:20000431', 'medtop:20000260'],
  environment: ['medtop:06000000', 'medtop:20000420', 'medtop:20000424'],
  business: ['medtop:20001374', 'medtop:04000000'],
} satisfies Record<Exclude<NewsBasketKey, 'all'>, string[]>;

// Use reviewed specialist publishers as well as general reporting within the three-source cap.
export const API_TUBE_TOPIC_SOURCES = {
  climate: ['theguardian.com', 'bbc.co.uk', 'theconversation.com'],
  energy: ['theguardian.com', 'transportandenergy.com', 'iea.org'],
  environment: ['theguardian.com', 'news.mongabay.com', 'unep.org'],
  business: ['theguardian.com', 'bbc.co.uk', 'betakit.com'],
} satisfies Record<Exclude<NewsBasketKey, 'all'>, string[]>;
export const API_TUBE_TOPIC_QUERIES = {
  climate: 'climate OR emissions OR "greenhouse gases" OR "net zero" OR carbon OR decarbonisation',
  energy: 'solar OR electricity OR hydrogen OR renewable OR battery OR wind OR nuclear OR grid',
  environment: 'biodiversity OR pollution OR deforestation OR conservation OR wildlife OR recycling OR "circular economy"',
  business: '"sustainable finance" OR "climate finance" OR "green bond" OR ESG OR "carbon credit" OR "corporate sustainability"',
} satisfies Record<Exclude<NewsBasketKey, 'all'>, string>;

/** APITube rejects wildcards; its explicit title substring predicate supports our sector stems. */
export function apiTubeQuery(query: string): string {
  return query.split(/("[^\"]*")/g).map((part, index) => index % 2 ? part
    : part.replace(/\b([a-z][a-z0-9-]*)\*/gi, 'title.pattern:"$1"')).join('');
}

export function rejectApiTubeBody(body: unknown): BodyRejection | null {
  const page = body as ApiTubePage | null;
  if (page?.status === 'ok' && Array.isArray(page.results)) return null;
  return { reason: Array.isArray(page?.errors) && page.errors.some(error => ['ER0176', 'ER0177', 'ER0203'].includes(String(error?.code))) ? 'rate_limited' : 'unavailable',
    message: 'APITube returned an error or an invalid article list.' };
}

export function mapApiTubeResults(results: unknown[], retrievedAt: string): NewsItem[] {
  return results.flatMap(raw => {
    if (!raw || typeof raw !== 'object') return [];
    const article = raw as Record<string, unknown>;
    const title = typeof article.title === 'string' ? article.title.trim() : '';
    const url = typeof article.href === 'string' ? article.href.trim() : '';
    if (!title || !/^https?:\/\//i.test(url)) return [];
    const description = typeof article.description === 'string' ? article.description.trim() : '';
    const date = typeof article.published_at === 'string' ? Date.parse(article.published_at) : NaN;
    const categories = Array.isArray(article.categories) ? article.categories : [];
    return [{ id: normaliseUrl(url), sourceId: ['string', 'number'].includes(typeof article.id) ? String(article.id) : null,
      title, url, domain: hostnameOf(url), publisher: hostnameOf(url), summary: description || null,
      imageUrl: newsImageUrl(article.image), publishedAt: Number.isFinite(date) ? new Date(date).toISOString() : null,
      language: typeof article.language === 'string' ? article.language : null,
      provider: 'apitube', providerLabel: 'APITube', retrievedAt,
      // Keep only the provider's metadata, never its full body or generated summary.
      rights: 'Metadata supplied by APITube for evaluation. Publishers retain article and image rights; link to the original article.',
      regions: extractRegions(title, description || null),
      providerCategories: categories.flatMap(category => {
        if (!category || typeof category !== 'object') return [];
        // Live responses use numeric internal IDs; the link carries the stable IPTC code.
        const id = typeof category.id === 'string' && /^medtop:\d+$/.test(category.id) ? category.id
          : typeof category.links?.self === 'string' ? category.links.self.match(/\/(medtop:\d+)(?:[/?#]|$)/)?.[1] : null;
        return id && typeof category.name === 'string' ? [{ id, name: category.name,
          score: typeof category.score === 'number' && Number.isFinite(category.score) ? category.score : null }] : [];
      }),
    } satisfies NewsItem];
  });
}

export async function fetchApiTubeQuery(query: string, revalidate = NEWS_REFRESH_SECONDS, fresh = false,
  languages: string[] = ['en'], options: { days?: number; basket?: Exclude<NewsBasketKey, 'all'> } = {}): Promise<ConnectorResult<NewsItem[]>> {
  const key = providerKey('apitube');
  if (!key) return fail('apitube', 'not_configured', 'API_TUBE_API_KEY is not set.');
  const categories = options.basket ? API_TUBE_CATEGORIES[options.basket]
    : STOCK_MARKET_QUERIES.includes(query) ? ['medtop:04000000'] : ['medtop:06000000', 'medtop:04000000', 'medtop:08000000'];
  const sources = options.basket ? API_TUBE_TOPIC_SOURCES[options.basket]
    : Object.values(INDUSTRY_FEEDS).find(feed => feed.newsDiscoveryQuery === query)?.newsSources ?? API_TUBE_SOURCES;
  if (!sources.length || sources.length > 3 || !sources.every(isAllowedDomain)) {
    return fail('apitube', 'unavailable', 'The sector publisher group needs review.');
  }
  const end = new Date();
  const params = new URLSearchParams({ query: apiTubeQuery(query), 'source.domain': sources.join(','),
    'language.code': languages.slice(0, 3).join(','), per_page: '10', 'sort.by': 'published_at', 'sort.order': 'desc',
    // Boolean title search has a 31-day maximum, even on paid plans.
    // Pin both ends: waiting for a rate-limit slot must not widen a 31-day query.
    'published_at.start': new Date(end.getTime() - Math.min(options.days ?? 7, 31) * 86400000).toISOString(),
    'published_at.end': end.toISOString(),
    fl: 'id,title,description,href,published_at,language,image,categories,source',
  });
  // Search broadly by topic; returned category evidence is still required by screening.
  // Combining both filters loses relevant stories assigned to a neighbouring category.
  if (!options.basket) params.set('category.id', categories.join(','));
  const result = await fetchFromProvider<ApiTubePage>('apitube', `${ENDPOINT}?${params}`, {
    headers: { 'X-API-Key': key }, revalidate, fresh, tags: ['news'], timeoutMs: 30000,
    rejectBody: rejectApiTubeBody, errorCode: body => String((body as ApiTubePage | null)?.errors?.[0]?.code ?? ''),
  });
  if (!result.ok) return result;
  return ok('apitube', mapApiTubeResults(result.data.results as unknown[], result.retrievedAt)
    .map(item => ({ ...item, refreshSeconds: revalidate, matchedQueries: [query] })), result.retrievedAt, result.stale);
}

export async function fetchApiTubeBasket(key: NewsBasketKey, fresh = false): Promise<ConnectorResult<NewsItem[]>> {
  return key === 'all' ? ok('apitube', []) : fetchApiTubeQuery(API_TUBE_TOPIC_QUERIES[key], GENERAL_NEWS_REFRESH_SECONDS, fresh,
    ['en'], { basket: key, days: 7 });
}
