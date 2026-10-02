import { describe, expect, it } from 'vitest';
import { countryName, matchIndicators } from './explorer';

describe('Gapminder country names and indicator pairing', () => {
  it('resolves country codes, aliases, territories and the global series', () => {
    expect(countryName('AFG')).toBe('Afghanistan');
    expect(countryName('ALB')).toBe('Albania');
    expect(countryName('GB')).toBe('United Kingdom');
    expect(countryName('world')).toBe('World');
    expect(countryName('unknown-geography')).toBe('unknown-geography');
  });

  it('preserves zero and excludes unmatched or non-finite values', () => {
    const y = [{ geo: 'afg', time: '2000', value: 0 }, { geo: 'afg', time: '2001', value: 60 }, { geo: 'alb', time: '2000', value: Infinity }];
    const x = [{ geo: 'AFG', time: '2000', value: 0 }, { geo: 'alb', time: '2000', value: 100 }];
    expect(matchIndicators(y, x)).toEqual([{ geo: 'afg', time: '2000', value: 0, x: 0 }]);
    expect(matchIndicators(y, null)).toEqual([{ ...y[0], x: 2000 }, { ...y[1], x: 2001 }]);
  });
});
