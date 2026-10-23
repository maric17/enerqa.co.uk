import { describe, expect, it } from 'vitest';
import { DOMAIN_FEEDS, INDUSTRY_FEEDS } from '../feeds/contextual';
import { RELATED_INDICATORS, relatedIndicators } from './relatedIndicators';

describe('page-specific data recommendations', () => {
  it.each([['domains', DOMAIN_FEEDS], ['industries', INDUSTRY_FEEDS]] as const)('covers every %s page with real, distinct Explorer indicators', (field, pages) => {
    expect(Object.keys(RELATED_INDICATORS[field]).sort()).toEqual(Object.keys(pages).sort());
    for (const slug of Object.keys(pages)) {
      const chosen = relatedIndicators(field, slug);
      expect(chosen.length, slug).toBeGreaterThan(1);
      expect(chosen.length, slug).toBeLessThanOrEqual(5);
      expect(chosen.length, slug).toBe(RELATED_INDICATORS[field][slug].length);
      expect(new Set(chosen.map(record => record.id)).size).toBe(chosen.length);
      for (const record of chosen) {
        expect(record.why).not.toBe('');
        expect(record.data_urls.length).toBeGreaterThan(0);
        expect(new URL(record.href, 'https://enerqa.co.uk').searchParams.get('indicator')).toBe(record.id);
      }
    }
  });

  it('keeps transport and manufacturing measures distinct instead of reusing electricity generation', () => {
    expect(relatedIndicators('industries', 'transport-logistics-mobility').every(record => record.name.includes('Transport'))).toBe(true);
    expect(relatedIndicators('industries', 'industry-manufacturing-materials')[0].name).toContain('Industrial Combustion');
    expect(relatedIndicators('domains', 'unknown')).toEqual([]);
  });
});
