import { unstable_cache } from 'next/cache';
import { fetchNews, isNewsItemStale, type NewsItem } from '@/lib/api/news';
import { DOMAIN_FEEDS, INDUSTRY_FEEDS } from './contextual';
import { tagIntelligence, type IntelligenceItem } from './intelligence';
import { readSavedResearch } from './savedIntelligence';

export function newsIntelligence(item: NewsItem): IntelligenceItem {
  return tagIntelligence({
    id: item.id, title: item.title, summary: item.summary, url: item.url,
    type: ['eia_rss', 'eea_rss'].includes(item.provider) ? 'official' : 'news',
    publisher: item.publisher, source: item.providerLabel, sourceId: item.provider,
    publishedAt: item.publishedAt, retrievedAt: item.retrievedAt, language: item.language,
    authors: [], doi: null, documentType: item.docType ?? null,
    verifiedOpen: item.accessStatus === 'verified_open', stale: isNewsItemStale(item),
  });
}

export function uniqueIntelligence(items: IntelligenceItem[]) {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.url.split('#')[0];
    if (!item.verifiedOpen || seen.has(key)) return false;
    seen.add(key); return true;
  }).sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

/** First load and ordinary site searches read saved records only, never provider APIs. */
export async function buildIntelligenceIndex() {
  const results = await Promise.allSettled([
    fetchNews('all', 1000, { maxPerPublisher: 500 }),
    readSavedResearch(),
  ]);
  const [news, research] = results;
  return {
    items: uniqueIntelligence([
      ...(news.status === 'fulfilled' ? news.value.items.map(newsIntelligence) : []),
      ...(research.status === 'fulfilled' ? research.value.items : []),
    ]),
    sourcesFailed: (news.status === 'rejected' || news.value.sourcesFailed) &&
      (research.status === 'rejected' || !research.value.available),
  };
}

// Changes in sector vocabulary also invalidate saved-result tags across deployments.
const contextKey = JSON.stringify([DOMAIN_FEEDS, INDUSTRY_FEEDS]);
const cachedIntelligenceIndex = unstable_cache(buildIntelligenceIndex, ['global-intelligence-saved-thenewsapi-v3', contextKey], { revalidate: 60, tags: ['global-intelligence', 'saved-news'] });
let inFlight: ReturnType<typeof cachedIntelligenceIndex> | undefined;
export function getIntelligenceIndex() {
  if (!inFlight) inFlight = cachedIntelligenceIndex().finally(() => { inFlight = undefined; });
  return inFlight;
}
