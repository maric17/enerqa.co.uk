import { CONTENT_TYPES, type IntelligenceFilters } from './intelligence';
import { DOMAIN_FEEDS, INDUSTRY_FEEDS, newsPhrases } from './contextual';
import { COUNTRIES, CONTINENTS, REGIONS, SCOPES, changeGeography } from './coverage';
import { NEWS_BASKETS } from '@/lib/api/news/types';

export const INTELLIGENCE_SOURCES = {
  apitube: 'APITube',
  thenewsapi: 'TheNewsAPI', newsdata: 'NewsData.io', gdelt: 'GDELT', eia_rss: 'U.S. EIA Today in Energy',
  eea_rss: 'European Environment Agency', openalex: 'OpenAlex', doaj: 'DOAJ',
  osti: 'DOE OSTI.GOV', 'gbif-literature': 'GBIF literature', reliefweb: 'ReliefWeb', 'sec-edgar': 'SEC EDGAR',
};
export const INTELLIGENCE_KEYS = ['q', 'theme', 'domain', 'industry', 'continent', 'region', 'country', 'type', 'language', 'source', 'dateRange'];

/** Keep shared URLs and the API on the same bounded, known filter vocabulary. */
export function parseIntelligenceFilters(params: URLSearchParams): IntelligenceFilters {
  const allowed: Record<string, string[]> = {
    theme: NEWS_BASKETS.filter(b => b.key !== 'all').map(b => b.key),
    domain: Object.keys(DOMAIN_FEEDS), industry: Object.keys(INDUSTRY_FEEDS),
    continent: [...CONTINENTS, ...SCOPES], region: [...REGIONS, ...SCOPES], country: COUNTRIES.map(c => c.code),
    type: Object.keys(CONTENT_TYPES), source: Object.keys(INTELLIGENCE_SOURCES), dateRange: ['24h', '7d', '30d'],
  };
  const filters: IntelligenceFilters = {};
  for (const key of INTELLIGENCE_KEYS) {
    const values = params.getAll(key).slice(0, key === 'q' ? 1 : 12).map(v => v.trim().slice(0, 120));
    filters[key] = [...new Set(values.filter(v => v && (
      key === 'q' || (key === 'language' ? /^(?:[a-z]{2,3}|unspecified)$/.test(v) : allowed[key]?.includes(v))
    )))];
  }
  if (filters.country.length && !filters.region.length && !filters.continent.length) {
    Object.assign(filters, changeGeography({ country: [], region: [], continent: [] }, 'country', filters.country));
  }
  return filters;
}

// Treat user text as words, never as provider operators or publisher predicates.
const literal = (text: string) => text.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
const quoted = (text: string) => `"${literal(text)}"`;

function boundedOr(terms: string[], max: number): string {
  const picked: string[] = [];
  for (const term of [...new Set(terms.map(literal).filter(Boolean))]) {
    if ([...picked, quoted(term)].join(' OR ').length <= max) picked.push(quoted(term));
  }
  return picked.join(' OR ');
}

/** One targeted query per selected provider; local gates apply the complete selection. */
export function intelligenceQueries(filters: IntelligenceFilters) {
  const contextual = [...(filters.industry ?? []).map(s => INDUSTRY_FEEDS[s]), ...(filters.domain ?? []).map(s => DOMAIN_FEEDS[s])].filter(Boolean);
  const phrases = contextual.flatMap(f => newsPhrases(f).slice(0, 2));
  const topics = (filters.theme ?? []).flatMap(key => NEWS_BASKETS.find(b => b.key === key)?.keywords.slice(0, 2) ?? []);
  const defaults = ['climate', 'energy', 'biodiversity', 'sustainability'];
  const terms = filters.q?.[0] ? [filters.q[0]] : phrases.length ? phrases : topics.length ? topics : defaults;
  const places = (filters.country ?? []).map(code => COUNTRIES.find(c => c.code === code)?.name ?? '');
  if (!places.length) places.push(...(filters.region?.length ? filters.region : filters.continent ?? []).filter(p => !SCOPES.includes(p)));
  const geography = boundedOr(places, 38);
  const topic = boundedOr(terms, geography ? 100 - geography.length - 9 : 100);
  // Long keywords are shortened on word boundaries only for provider discovery.
  // The complete keyword and every selected facet are still checked before display.
  const fallback = quoted(literal(terms[0]).slice(0, 40).replace(/\s+\S*$/, ''));
  const news = geography ? `(${topic || fallback}) AND (${geography})` : topic || fallback;
  // GDELT's two approved domains leave room for a useful targeted query under 180 characters.
  const gdelt = `${news.replace(/ AND /g, ' ')} (domainis:theguardian.com OR domainis:reuters.com)`;
  const researchTerms = filters.q?.[0] ? [filters.q[0]] : contextual.length ? contextual.map(f => f.researchThemes[0].split(' ').slice(0, 2).join(' ')) : topics.length ? topics : defaults;
  const researchTopic = boundedOr(researchTerms, geography ? 180 : 240);
  // Geography is combined with the topic rather than becoming a substitute topic.
  const research = geography ? `(${researchTopic}) AND (${geography})` : researchTopic;
  // Reuse the reviewed broad discovery basket for a single industry. Exact
  // phrase queries alone miss relevant headlines, such as tourism and habitat loss.
  const industryQuery = filters.industry?.length === 1 && !filters.q?.length && !filters.domain?.length && !filters.theme?.length && !geography
    ? INDUSTRY_FEEDS[filters.industry[0]]?.newsDiscoveryQuery : undefined;
  if (industryQuery && industryQuery.length <= 100) return { news: industryQuery,
    gdelt: `${boundedOr(INDUSTRY_FEEDS[filters.industry[0]].relatedNewsTerms?.slice(0, 3) ?? terms, 80)} (domainis:theguardian.com OR domainis:reuters.com)`, research };
  return { news, gdelt, research };
}
