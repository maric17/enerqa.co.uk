import { expect, it } from 'vitest';
import { intelligenceQueries, parseIntelligenceFilters } from './intelligenceQueries';
import { INDUSTRY_FEEDS } from './contextual';
import type { IntelligenceFilters } from './intelligence';

it('bounds repeated filters, drops unknown values and sets country parents', () => {
  const filters = parseIntelligenceFilters(new URLSearchParams('source=newsdata&source=untrusted&type=news&country=DEU&q=energy'));
  expect(filters.source).toEqual(['newsdata']); expect(filters.continent).toEqual(['Europe']);
  expect(filters.region).toEqual(['Western Europe']);
});
it('targets the selected industry using its reviewed discovery query', () => {
  expect(intelligenceQueries({ industry: ['tourism-hospitality-destinations'] }).news).toBe(INDUSTRY_FEEDS['tourism-hospitality-destinations'].newsDiscoveryQuery);
});
it('keeps every query inside provider length limits and protects publisher predicates', () => {
  const selections: IntelligenceFilters[] = [
    {}, { q: ['x'.repeat(120)], country: ['USA', 'GBR'] },
    { q: ['energy ) domainis:untrusted.example OR "'], continent: ['Europe'] },
    { industry: Object.keys(INDUSTRY_FEEDS) },
  ];
  for (const filters of selections) {
    const queries = intelligenceQueries(filters);
    expect(queries.news.length).toBeLessThanOrEqual(100);
    expect(queries.gdelt.length).toBeLessThanOrEqual(180);
    expect(queries.gdelt).not.toContain('domainis:untrusted');
    expect(queries.gdelt).toContain('domainis:reuters.com');
    expect(queries.news).not.toBe('');
  }
});
