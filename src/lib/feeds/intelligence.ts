import { coverageFromText, type Coverage } from './coverage';
import { DOMAIN_FEEDS, INDUSTRY_FEEDS, newsPhrases } from './contextual';
import { containsAny, NEWS_BASKETS } from '@/lib/api/news/types';

export const CONTENT_TYPES = { news: 'News', research: 'Research and Articles', official: 'Policy and Official Updates', disclosure: 'Corporate Disclosures' };
export type IntelligenceItem = {
  id: string; title: string; summary: string | null; url: string;
  type: keyof typeof CONTENT_TYPES; publisher: string; source: string; sourceId: string;
  publishedAt: string | null; retrievedAt: string; language: string | null;
  authors: string[]; doi: string | null; documentType: string | null;
  verifiedOpen: boolean; stale: boolean; coverage: Coverage;
  topics: string[]; domains: string[]; industries: string[];
};
export type IntelligenceFilters = Record<string, string[]>;

export function tagIntelligence(item: Omit<IntelligenceItem, 'coverage' | 'topics' | 'domains' | 'industries'>): IntelligenceItem {
  const text = `${item.title} ${item.summary ?? ''}`;
  return { ...item, coverage: coverageFromText(item.title, item.summary),
    topics: NEWS_BASKETS.filter(b => b.key !== 'all' && containsAny(text, b.keywords)).map(b => b.key),
    domains: Object.entries(DOMAIN_FEEDS).filter(([, f]) => containsAny(text, newsPhrases(f))).map(([slug]) => slug),
    industries: Object.entries(INDUSTRY_FEEDS).filter(([, f]) => containsAny(text, newsPhrases(f))).map(([slug]) => slug),
  };
}

/** OR within a field, AND across fields, applied to every content type. */
export function filterIntelligence(items: IntelligenceItem[], filters: IntelligenceFilters, now = Date.now()) {
  return items.filter(item => {
    if (!item.verifiedOpen) return false;
    const fields: Record<string, string[]> = { theme: item.topics, domain: item.domains, industry: item.industries,
      type: [item.type], source: [item.sourceId], language: [item.language ?? 'unspecified'],
      continent: [...item.coverage.continent, ...item.coverage.scope], region: [...item.coverage.region, ...item.coverage.scope], country: item.coverage.country };
    for (const [key, values] of Object.entries(fields)) {
      const wanted = (filters[key] ?? []).filter(v => v !== 'all');
      if (wanted.length && !wanted.some(v => values.includes(v))) return false;
    }
    const text = `${item.title} ${item.summary ?? ''} ${item.topics.join(' ')}`.toLocaleLowerCase();
    if (!(filters.q ?? []).every(q => q.toLocaleLowerCase().split(/\s+/).every(term => text.includes(term)))) return false;
    if (filters.dateRange?.length) {
      const age = now - Date.parse(item.publishedAt ?? '');
      const durations: Record<string, number> = { '24h': 1, '7d': 7, '30d': 30 };
      if (!filters.dateRange.some(d => age >= 0 && age <= (durations[d] ?? 0) * 86400000)) return false;
    }
    return true;
  });
}

export const readingAction = (type: IntelligenceItem['type']) => ({ news: 'Read Full Article', research: 'Read Full Paper', official: 'Read Full Report', disclosure: 'Read Filing' })[type];

export function filterUrl(filters: IntelligenceFilters, page = 1) {
  const params = new URLSearchParams();
  for (const [key, values] of Object.entries(filters)) for (const value of values) if (value && key !== 'page') params.append(key, value);
  if (page > 1) params.set('page', String(page));
  return `/knowledge-hub/global-intelligence?${params}`;
}
