import { fetchFromProvider, providerKey } from '../core/fetch';
import { checkAccess } from '../core/accessCheck';
import { API_TUBE_CATEGORIES, mapApiTubeResults, rejectApiTubeBody } from './apitube';
import { apiTubeTopics } from './apitubeScreening';
import { isAllowedDomain, normaliseUrl } from './types';

// Rotate publisher countries instead of using the publisher's address as the event location.
const REGIONS = [
  { name: 'Africa', groups: ['za,ke,ng', 'gh,et,eg', 'ma,ug,tz'] },
  { name: 'Asia-Pacific', groups: ['in,jp,au', 'ph,id,nz', 'kr,sg,vn'] },
  { name: 'Europe', groups: ['gb,fr,de', 'es,it,nl', 'se,pl,gr'] },
  { name: 'Latin America and Caribbean', groups: ['br,mx,co', 'ar,cl,pe', 'jm,do,cr'] },
  { name: 'Middle East', groups: ['ae,sa,qa', 'jo,om,bh', 'kw,tr,iq'] },
  { name: 'North America', groups: ['us,ca'] },
];

export async function runNewsPilot(now = Date.now()) {
  const key = providerKey('apitube');
  if (!key) throw new Error('APITube is not configured.');
  const hour = Math.floor(now / 3600000);
  const region = REGIONS[hour % REGIONS.length];
  const countries = region.groups[Math.floor(hour / REGIONS.length) % region.groups.length];
  const topic = Object.values(API_TUBE_CATEGORIES)[hour % 4];
  const searches = [
    { name: 'global-top', endpoint: 'top-headlines', filter: { 'sort.by': 'relevance', 'category.id': topic[0] } },
    { name: 'global-topic', endpoint: 'everything', filter: { 'sort.by': 'published_at', 'category.id': topic.join(',') } },
    { name: region.name, endpoint: 'everything', filter: { 'sort.by': 'published_at', 'source.country.code': countries, 'category.id': 'medtop:06000000,medtop:04000000,medtop:08000000' } },
  ];
  const queries: { name: string; outcome: string; fetched: number }[] = [];
  const candidates = new Map<string, ReturnType<typeof mapApiTubeResults>[number]>();
  for (const search of searches) {
    const params = new URLSearchParams({
      'published_at.start': new Date(now - (search.endpoint === 'top-headlines' ? 6 : 24) * 3600000).toISOString(),
      'published_at.end': new Date(now).toISOString(),
      'sort.order': 'desc',
      per_page: '30',
      fl: 'id,title,description,href,published_at,language,categories,source',
    });
    for (const [name, value] of Object.entries(search.filter)) if (value) params.set(name, value);
    const request = (endpoint: string) => fetchFromProvider<{ results: unknown[] }>('apitube', 'https://api.apitube.io/v1/news/' + endpoint + '?' + params, {
      headers: { 'X-API-Key': key }, fresh: true, timeoutMs: 20000, rejectBody: rejectApiTubeBody,
    });
    let result = await request(search.endpoint);
    if (!result.ok && result.reason === 'unavailable' && search.endpoint === 'top-headlines') {
      // Standard search keeps the pilot useful when the ranked endpoint times out.
      queries.push({ name: search.name, outcome: result.reason, fetched: 0 });
      params.set('sort.by', 'published_at');
      result = await request('everything');
      search.name = 'global-top-fallback';
    }
    queries.push({ name: search.name, outcome: result.ok ? 'ok' : result.reason, fetched: result.ok ? result.data.results.length : 0 });
    if (!result.ok) continue;
    for (const item of mapApiTubeResults(result.data.results, result.retrievedAt)) {
      if (item.publishedAt && Date.parse(item.publishedAt) >= now - 86400000 && Date.parse(item.publishedAt) <= now) {
        candidates.set(normaliseUrl(item.url), item);
      }
    }
  }
  const relevant = [...candidates.values()].map(item => ({ item, topics: apiTubeTopics(item) }))
    .filter(({ topics }) => topics.length > 0);
  const approvedSources = relevant.filter(({ item }) => isAllowedDomain(item.domain));
  // Keep access checks bounded on the production server and capture a review sample.
  const sample = await Promise.all(approvedSources.slice(0, 12).map(async ({ item, topics }) => {
    const access = await checkAccess(item.url);
    const headlineTopics = apiTubeTopics({ ...item, summary: null });
    return { title: item.title, url: item.url, publishedAt: item.publishedAt, language: item.language,
      regions: item.regions, primaryCategory: headlineTopics[0] ?? topics[0], categories: topics, access: access.status };
  }));
  return { hour: new Date(hour * 3600000).toISOString(), queries, candidates: candidates.size,
    relevant: relevant.length, approvedSources: approvedSources.length,
    regionalSourceCandidates: [...new Set(relevant.filter(({ item }) => !isAllowedDomain(item.domain)).map(({ item }) => item.domain))].slice(0, 30), sample };
}
