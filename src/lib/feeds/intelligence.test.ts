import { describe, it, expect } from 'vitest';
import { COUNTRIES, coverageFromText, changeGeography } from './coverage';
import { filterIntelligence, filterUrl, tagIntelligence, readingAction, type IntelligenceItem } from './intelligence';

const item = (title: string, type: IntelligenceItem['type'] = 'news') => tagIntelligence({
  id: title, title, type, summary: null, url: 'https://example.org/article', publisher: 'Publisher', source: 'Source', sourceId: 'source',
  publishedAt: '2026-10-01', retrievedAt: '2026-10-01', language: 'en', authors: [], doi: null, documentType: null, verifiedOpen: true, stale: false,
});

describe('subject geography', () => {
  it('uses the UN hierarchy and stable country codes', () => {
    expect(COUNTRIES.find(c => c.code === 'QAT')).toMatchObject({ continent: 'Asia', region: 'Western Asia' });
    expect(new Set(COUNTRIES.map(c => c.code)).size).toBe(COUNTRIES.length);
    expect(COUNTRIES.length).toBeGreaterThan(240);
  });
  it.each(['New England gas demand', 'Solar in eastern New Mexico'])('does not misread nested place names: %s', title => {
    expect(coverageFromText(title).country).toEqual(['USA']);
  });
  it('does not turn the pronoun us or a currency into a country', () => {
    expect(coverageFromText('What energy tells us about a US$500m fund').scope).toEqual(['Not Specified']);
    expect(coverageFromText('US solar output rises').country).toEqual(['USA']);
  });
  it('matches each country and marks multi-region coverage', () => {
    const c = coverageFromText('Solar investment in Qatar and Germany');
    expect(c.country).toEqual(expect.arrayContaining(['QAT', 'DEU']));
    expect(c.scope).toContain('Multiple Regions');
  });
  it('does not infer coverage from institution names', () => {
    expect(coverageFromText('World Bank energy report').scope).toEqual(['Not Specified']);
    expect(coverageFromText('Global energy report').scope).toEqual(['Global']);
  });
  it('country selects parents and changing continent clears conflicting children', () => {
    const selected = changeGeography({ continent: [], region: [], country: [] }, 'country', ['QAT']);
    expect(selected).toEqual({ continent: ['Asia'], region: ['Western Asia'], country: ['QAT'] });
    expect(changeGeography(selected, 'continent', ['Europe'])).toEqual({ continent: ['Europe'], region: [], country: [] });
  });
});

describe('one Global Intelligence collection', () => {
  it('offers every type without requiring a domain query', () => {
    const all = ['news', 'research', 'official', 'disclosure'].map(t => item('Qatar solar energy', t as IntelligenceItem['type']));
    expect(filterIntelligence(all, {})).toHaveLength(4);
    expect(filterIntelligence(all, { type: ['research', 'disclosure'] })).toHaveLength(2);
    expect(readingAction('disclosure')).toBe('Read Filing');
  });
  it('uses OR within and AND between fields on all types', () => {
    const all = [item('Qatar solar'), item('Germany solar', 'research'), item('Canada solar', 'official')];
    expect(filterIntelligence(all, { country: ['QAT', 'DEU'], type: ['research'] })).toEqual([all[1]]);
    expect(filterIntelligence(all, { country: ['QAT'], continent: ['Europe'] })).toEqual([]);
  });
  it('suppresses unverified items and applies query, language, source and date together', () => {
    const good = item('Qatar solar');
    const all = [good, { ...good, verifiedOpen: false }, { ...good, title: 'Wind' }];
    expect(filterIntelligence(all, { q: ['solar'], language: ['en'], source: ['source'], dateRange: ['7d'] }, Date.parse('2026-10-02'))).toEqual([good]);
  });
  it('retains every selection on pagination', () => {
    const url = new URL(filterUrl({ type: ['official', 'disclosure'], country: ['QAT', 'DEU'], q: ['solar & wind'] }, 2), 'https://enerqa.co.uk');
    expect(url.searchParams.getAll('type')).toEqual(['official', 'disclosure']);
    expect(url.searchParams.getAll('country')).toEqual(['QAT', 'DEU']);
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('q')).toBe('solar & wind');
  });
});
