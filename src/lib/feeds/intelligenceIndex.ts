import { unstable_cache } from 'next/cache';
import { fetchNews, isNewsItemStale } from '@/lib/api/news';
import { fetchResearchForThemes } from '@/lib/api/research';
import { fetchSpecialistUpdates } from './official';
import { DOMAIN_FEEDS, type SpecialistFeed } from './contextual';
import { isStale } from '@/lib/api/core/provenance';
import { tagIntelligence, type IntelligenceItem } from './intelligence';

/** Fixed baskets shared by all visitors. User queries never become upstream API requests. */
export async function buildIntelligenceIndex() {
  const themes = Object.values(DOMAIN_FEEDS).map(f => f.researchThemes[0]);
  const feeds = [...new Set(Object.values(DOMAIN_FEEDS).flatMap(f => f.specialistFeeds))] as SpecialistFeed[];
  const results = await Promise.allSettled([
    fetchNews('all', 24, { maxPerPublisher: 10 }),
    fetchResearchForThemes(themes, 16),
    fetchSpecialistUpdates({ feeds, themes, limit: 16 }),
  ]);
  const [news, research, official] = results;
  const items: IntelligenceItem[] = [];
  if (official.status === 'fulfilled') for (const i of official.value.items) items.push(tagIntelligence({
    id: i.id, title: i.title, summary: null, url: i.url,
    type: i.feed === 'sec_edgar' ? 'disclosure' : 'official', publisher: i.organisation ?? i.sourceLabel,
    source: i.sourceLabel, sourceId: i.feed, publishedAt: i.publishedAt, retrievedAt: i.retrievedAt,
    language: null, authors: i.authors, doi: i.doi, documentType: i.docType,
    verifiedOpen: i.verifiedOpen, stale: i.stale,
  }));
  if (research.status === 'fulfilled') for (const i of research.value.items) items.push(tagIntelligence({
    id: i.id, title: i.title, summary: null, url: i.readUrl, type: 'research',
    publisher: i.source ?? i.provenance.providerName, source: i.provenance.providerName, sourceId: i.provenance.providerId,
    publishedAt: i.publishedAt, retrievedAt: i.provenance.retrievedAt, language: i.language ?? null,
    authors: i.authors, doi: i.doi, documentType: i.preprint ? 'Preprint (not peer reviewed)' : i.kind,
    verifiedOpen: i.provenance.accessStatus === 'verified_open', stale: isStale(i.provenance),
  }));
  if (news.status === 'fulfilled') for (const i of news.value.items) items.push(tagIntelligence({
    id: i.id, title: i.title, summary: i.summary, url: i.url,
    type: ['eia_rss', 'eea_rss'].includes(i.provider) ? 'official' : 'news',
    publisher: i.publisher, source: i.providerLabel, sourceId: i.provider,
    publishedAt: i.publishedAt, retrievedAt: i.retrievedAt, language: i.language,
    authors: [], doi: null, documentType: i.docType ?? null,
    // fetchNews only returns items that passed the per-destination anonymous check.
    verifiedOpen: true, stale: isNewsItemStale(i),
  }));
  const seen = new Set<string>();
  const unique = items.filter(i => {
    const key = i.url.split('#')[0];
    if (!i.verifiedOpen || seen.has(key)) return false;
    seen.add(key); return true;
  }).sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
  const sourcesFailed = results.every(r => r.status === 'rejected' || r.value.sourcesFailed);
  return { items: unique, sourcesFailed };
}

const cachedIntelligenceIndex = unstable_cache(buildIntelligenceIndex, ['global-intelligence-v1'], { revalidate: 3600, tags: ['global-intelligence'] });

// Coalesce simultaneous /search and Global Intelligence requests on a cold cache.
let inFlight: ReturnType<typeof cachedIntelligenceIndex> | undefined;
export function getIntelligenceIndex() {
  if (!inFlight) inFlight = cachedIntelligenceIndex().finally(() => { inFlight = undefined; });
  return inFlight;
}
