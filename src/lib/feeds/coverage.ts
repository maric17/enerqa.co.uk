import registry from './geography-registry.json';

// UN M49 geographic hierarchy, retrieved 1 October 2026.
// https://unstats.un.org/unsd/methodology/m49/ — statistical groupings, not political claims.
export const COUNTRIES = registry;
export const CONTINENTS = [...new Set(registry.map(c => c.continent))].sort();
export const REGIONS = [...new Set(registry.map(c => c.region))].sort();
export const SCOPES = ['Global', 'Multiple Regions', 'Not Specified'];
export type Coverage = { continent: string[]; region: string[]; country: string[]; scope: string[] };
export type GeographySelection = Pick<Coverage, 'continent' | 'region' | 'country'>;

// Ambiguous personal names need editorial coverage rather than a text guess.
const AMBIGUOUS = new Set(['Georgia', 'Jordan', 'Chad', 'Jersey']);
const ALIASES: Record<string, string[]> = {
  USA: ['United States', 'New England', 'New Mexico', 'California', 'Texas', 'New York'],
  GBR: ['United Kingdom', 'Britain', 'England', 'Scotland', 'Wales'],
  ARE: ['UAE', 'Dubai', 'Abu Dhabi'], QAT: ['Qatari', 'Doha'], SAU: ['Saudi Arabia', 'Saudi'],
  CHN: ['China', 'Chinese'], RUS: ['Russia', 'Russian'], KOR: ['South Korea'], PRK: ['North Korea'],
  IRN: ['Iran'], SYR: ['Syria'], VNM: ['Vietnam'], TUR: ['Turkey'], PSE: ['Palestine', 'Gaza', 'West Bank'],
  BOL: ['Bolivia'], VEN: ['Venezuela'], TZA: ['Tanzania'], LAO: ['Laos'], MDA: ['Moldova'],
  NLD: ['Netherlands'], CIV: ['Ivory Coast'], HKG: ['Hong Kong'], MAC: ['Macao', 'Macau'],
};
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const boundary = (s: string, flags = 'giu') => new RegExp(`(?<![\\p{L}\\p{N}])${escape(s)}(?![\\p{L}\\p{N}])`, flags);
const matchers = COUNTRIES.flatMap(c => [c.name, ...(ALIASES[c.code] ?? [])]
  .filter(n => !AMBIGUOUS.has(n)).map(name => ({ code: c.code, re: boundary(name) })));

/** Only pass subject text. Never pass author affiliations or publisher addresses. */
export function coverageFromText(title: string, summary: string | null = null): Coverage {
  // These names identify institutions or agreements rather than the item's location.
  const text = `${title} ${summary ?? ''}`.replace(/World Bank|Bank of England|Paris Agreement|US\$/gi, '');
  const hits: { code: string; start: number; end: number }[] = [];
  for (const { code, re } of matchers) {
    for (const m of text.matchAll(re)) hits.push({ code, start: m.index, end: m.index + m[0].length });
  }
  for (const [code, re] of [['USA', /\b(?:US|USA|U\.S\.)\b/g], ['GBR', /\bUK\b/g]] as const) {
    for (const m of text.matchAll(re)) hits.push({ code, start: m.index, end: m.index + m[0].length });
  }
  // New Mexico must not also match Mexico; South Sudan must not also match Sudan.
  const kept = hits.filter(h => !hits.some(o => o.start <= h.start && o.end >= h.end && o.end - o.start > h.end - h.start));
  const country = [...new Set(kept.map(h => h.code))];
  const places = COUNTRIES.filter(c => country.includes(c.code));
  const region = [...new Set([...places.map(c => c.region), ...REGIONS.filter(r => boundary(r).test(text))])];
  const continent = [...new Set([...places.map(c => c.continent), ...COUNTRIES.filter(c => region.includes(c.region)).map(c => c.continent), ...CONTINENTS.filter(c => boundary(c).test(text))])];
  const scope: string[] = [];
  if (/\b(global|worldwide|world-wide|Paris Agreement)\b/i.test(`${title} ${summary ?? ''}`)) scope.push('Global');
  if (region.length > 1 || continent.length > 1) scope.push('Multiple Regions');
  if (!continent.length && !scope.length) scope.push('Not Specified');
  return { continent, region, country, scope };
}

/** A child selection sets its parents. A parent edit clears conflicting children. */
export function changeGeography(current: GeographySelection, field: keyof GeographySelection, values: string[]): GeographySelection {
  if (field === 'country') {
    const countries = COUNTRIES.filter(c => values.includes(c.code));
    return { country: countries.map(c => c.code), region: [...new Set(countries.map(c => c.region))], continent: [...new Set(countries.map(c => c.continent))] };
  }
  if (field === 'region') {
    return { region: values, continent: [...new Set(COUNTRIES.filter(c => values.includes(c.region)).map(c => c.continent))], country: current.country.filter(code => COUNTRIES.some(c => c.code === code && values.includes(c.region))) };
  }
  return { continent: values, region: current.region.filter(r => COUNTRIES.some(c => c.region === r && values.includes(c.continent))), country: current.country.filter(code => COUNTRIES.some(c => c.code === code && values.includes(c.continent))) };
}
