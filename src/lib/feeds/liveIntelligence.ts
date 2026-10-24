import 'server-only';
import { unstable_cache } from 'next/cache';
import { providerEnabled } from '@/lib/api/core/registry';
import type { ProviderId } from '@/lib/api/core/types';
import { fetchLiveNews, type NewsProvider } from '@/lib/api/news';
import { PAGE_NEWS_PROVIDERS } from '@/lib/api/news/policy';
import { fetchResearch, fetchIssuerFilings, verifyForDisplay, isFutureDate, type ResearchProvider } from '@/lib/api/research';
import { getIntelligenceIndex, newsIntelligence, uniqueIntelligence } from './intelligenceIndex';
import { researchIntelligence } from './savedIntelligence';
import { filterIntelligence, type IntelligenceFilters, type IntelligenceItem } from './intelligence';
import { intelligenceQueries, INTELLIGENCE_SOURCES } from './intelligenceQueries';

export type LiveIntelligenceResult = {
  items: IntelligenceItem[]; sourcesFailed: boolean; partialFailure: boolean;
  unavailableSources: string[]; searchedAt: string;
};

/** Search only sources belonging to requested types, one keyword request per provider. */
export function liveProviders(filters: IntelligenceFilters): ProviderId[] {
  const types = filters.type ?? [];
  const wants = (type: string) => !types.length || types.includes(type);
  const allowed: ProviderId[] = [
    ...(wants('news') ? PAGE_NEWS_PROVIDERS : []),
    ...(wants('research') ? ['openalex', 'doaj'] as ProviderId[] : []),
    ...(wants('official') ? ['eia_rss', 'eea_rss', 'osti', 'gbif-literature', 'reliefweb'] as ProviderId[] : []),
    ...(wants('disclosure') ? ['sec-edgar'] as ProviderId[] : []),
  ];
  return allowed.filter(id => providerEnabled(id) && (!filters.source?.length || filters.source.includes(id)));
}

async function searchProviders(filters: IntelligenceFilters) {
  const query = intelligenceQueries(filters);
  const dates: Record<string, number> = { '24h': 1, '7d': 7, '30d': 30 };
  const days = Math.max(0, ...(filters.dateRange ?? []).map(d => dates[d] ?? 0));
  const fromDate = days ? new Date(Date.now() - days * 86400000).toISOString().slice(0, 10) : undefined;
  const researchLanguages = filters.language?.includes('unspecified') ? undefined : filters.language;
  const providers = liveProviders(filters);
  const news = providers.filter(id => ['apitube', 'thenewsapi', 'newsdata', 'gdelt', 'eia_rss', 'eea_rss'].includes(id)) as NewsProvider[];
  const research = providers.filter(id => ['openalex', 'doaj', 'osti', 'gbif-literature', 'reliefweb'].includes(id)) as ResearchProvider[];
  const tasks: { ids: string[]; run: () => Promise<{ items: IntelligenceItem[]; failed: string[] }> }[] = [];
  if (news.length) tasks.push({ ids: news, run: async () => {
    const languages = filters.language?.filter(l => l !== 'unspecified').slice(0, 5);
    const result = await fetchLiveNews({ query: query.news, gdeltQuery: query.gdelt, providers: news,
      languages: languages?.length ? languages : undefined });
    return { items: result.items.map(newsIntelligence), failed: news.filter(id => result.providerStatus[id] !== 'ok') };
  } });
  // Verification per research provider prevents one source filling every slot.
  for (const id of research) tasks.push({ ids: [id], run: async () => {
    const result = await fetchResearch({ search: query.research, limit: 8, providers: [id], fresh: true, fromDate,
      languages: researchLanguages?.length ? researchLanguages : undefined });
    return { items: result.items.map(researchIntelligence), failed: result.skipped.map(s => s.id) };
  } });
  if (providers.includes('sec-edgar')) tasks.push({ ids: ['sec-edgar'], run: async () => {
    // SEC supplies submissions for the watchlist; it does not offer keyword search.
    const result = await fetchIssuerFilings({ perIssuer: 2, fresh: true });
    if (!result.ok) return { items: [], failed: result.reason === 'no_results' ? [] : ['sec-edgar'] };
    const verified = await verifyForDisplay(result.data.filter(item => !isFutureDate(item.publishedAt)), 8);
    return { items: verified.map(researchIntelligence), failed: [] };
  } });
  const results = await Promise.allSettled(tasks.map(t => t.run()));
  const items: IntelligenceItem[] = [];
  const failed: string[] = [];
  results.forEach((result, i) => {
    if (result.status === 'rejected') failed.push(...tasks[i].ids);
    else { items.push(...result.value.items); failed.push(...result.value.failed); }
  });
  const unavailableSources = [...new Set(failed)];
  return { items, unavailableSources, partialFailure: failed.length > 0,
    sourcesFailed: !providers.length || providers.every(id => failed.includes(id)), searchedAt: new Date().toISOString() };
}

// Identical searches share a short cache across visitors to save API credits.
// Different selections search providers with the existing shared quota guards.
const cachedSearch = unstable_cache(searchProviders, ['intelligence-live-apitube-v1'], { revalidate: 60, tags: ['intelligence-live'] });
const pending = new Map<string, Promise<Awaited<ReturnType<typeof cachedSearch>>>>();

export async function searchLiveIntelligence(filters: IntelligenceFilters): Promise<LiveIntelligenceResult> {
  const canonical = Object.fromEntries(Object.entries(filters).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, [...v].sort()]));
  const key = JSON.stringify(canonical);
  let request = pending.get(key);
  if (!request) {
    request = cachedSearch(canonical).finally(() => pending.delete(key));
    pending.set(key, request);
  }
  const [live, saved] = await Promise.all([request, getIntelligenceIndex()]);
  // Add fresh discoveries without discarding saved, verified reading when a
  // provider fails or its latest endpoint no longer includes an older article.
  return { ...live, items: filterIntelligence(uniqueIntelligence([...live.items, ...saved.items]).filter(item => item.type !== 'news' || PAGE_NEWS_PROVIDERS.includes(item.sourceId as NewsProvider)), filters) };
}

export function intelligenceSourceChoices() {
  return Object.entries(INTELLIGENCE_SOURCES).filter(([id]) =>
    (!['apitube', 'thenewsapi', 'newsdata', 'gdelt'].includes(id) || PAGE_NEWS_PROVIDERS.includes(id as NewsProvider))
    && providerEnabled(id as ProviderId)).map(([value, label]) => ({ value, label }));
}
