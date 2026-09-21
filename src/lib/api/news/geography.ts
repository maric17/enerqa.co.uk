/**
 * Geographic tagging dictionary and extraction (Part 12.2).
 * 
 * Determines geography from the text rather than trusting upstream provider metadata,
 * which often confusingly refers to the publisher's HQ.
 */

export type RegionKey = 
  | 'North America'
  | 'Europe'
  | 'Asia'
  | 'Middle East'
  | 'Africa'
  | 'Latin America'
  | 'Oceania'
  | 'Global';

export const REGIONS: { key: RegionKey; keywords: string[] }[] = [
  {
    key: 'North America',
    keywords: ['north america', 'us', 'usa', 'united states', 'canada', 'mexico', 'new york', 'washington', 'california', 'texas', 'toronto', 'chicago'],
  },
  {
    key: 'Europe',
    keywords: ['europe', 'eu', 'european union', 'uk', 'united kingdom', 'britain', 'england', 'france', 'germany', 'italy', 'spain', 'london', 'paris', 'berlin', 'rome', 'madrid', 'brussels', 'sweden', 'norway', 'poland', 'netherlands', 'amsterdam', 'switzerland', 'geneva', 'denmark'],
  },
  {
    key: 'Asia',
    keywords: ['asia', 'china', 'india', 'japan', 'south korea', 'korea', 'indonesia', 'vietnam', 'thailand', 'malaysia', 'singapore', 'beijing', 'tokyo', 'new delhi', 'mumbai', 'shanghai', 'seoul', 'jakarta'],
  },
  {
    key: 'Middle East',
    keywords: ['middle east', 'mena', 'uae', 'united arab emirates', 'dubai', 'abu dhabi', 'saudi arabia', 'qatar', 'doha', 'israel', 'egypt', 'iran', 'iraq', 'kuwait', 'oman', 'bahrain', 'riyadh'],
  },
  {
    key: 'Africa',
    keywords: ['africa', 'south africa', 'nigeria', 'kenya', 'egypt', 'ghana', 'ethiopia', 'morocco', 'nairobi', 'lagos', 'johannesburg', 'cape town', 'cairo', 'algeria', 'tanzania'],
  },
  {
    key: 'Latin America',
    keywords: ['latin america', 'south america', 'central america', 'brazil', 'argentina', 'colombia', 'chile', 'peru', 'mexico', 'sao paulo', 'buenos aires', 'bogota', 'santiago'],
  },
  {
    key: 'Oceania',
    keywords: ['oceania', 'australia', 'new zealand', 'sydney', 'melbourne', 'auckland', 'fiji', 'pacific'],
  },
  {
    key: 'Global',
    keywords: ['global', 'worldwide', 'international', 'world'],
  }
];

const termCache = new Map<string, RegExp>();

function termMatcher(term: string): RegExp {
  const cached = termCache.get(term);
  if (cached) return cached;

  // Use word boundaries. For 'us', we ensure it's matched exactly, 
  // not inside another word.
  const base = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = `\\b${base}\\b`;

  const re = new RegExp(pattern, 'i');
  termCache.set(term, re);
  return re;
}

export function extractRegions(title: string, summary: string | null): RegionKey[] {
  const text = `${title} ${summary ?? ''}`;
  const foundRegions: RegionKey[] = [];

  for (const region of REGIONS) {
    if (region.keywords.some((keyword) => termMatcher(keyword).test(text))) {
      foundRegions.push(region.key);
    }
  }

  // Fallback if no specific region matched
  if (foundRegions.length === 0) {
    foundRegions.push('Global');
  }

  return foundRegions;
}
