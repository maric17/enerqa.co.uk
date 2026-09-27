/**
 * Geographic tagging (Part 12.2, pp. 179 and 226).
 *
 * p. 179: "Geography describes the subject and locations covered by an item,
 * not the publisher's headquarters or a researcher's affiliation." So regions
 * come from the headline and permitted summary only - never from provider
 * metadata, a byline or an author's institution.
 *
 * p. 179 also asks for explicit values rather than a silent default:
 *   Global           the text says the item is global or worldwide
 *   Multiple Regions places in two or more regions are named
 *   Not Specified    no place is named at all (this used to fall back to
 *                    "Global", which claimed a coverage nobody had checked)
 */

export type PlaceRegion =
  | 'North America'
  | 'Europe'
  | 'Asia'
  | 'Middle East'
  | 'Africa'
  | 'Latin America'
  | 'Oceania';

export type RegionKey = PlaceRegion | 'Global' | 'Multiple Regions' | 'Not Specified';

/** Display order for filters. */
export const REGION_ORDER: RegionKey[] = [
  'North America',
  'Europe',
  'Asia',
  'Middle East',
  'Africa',
  'Latin America',
  'Oceania',
  'Global',
  'Multiple Regions',
  'Not Specified',
];

type Region = {
  key: PlaceRegion;
  /** Matched case-insensitively, as whole words. */
  names: string[];
  /**
   * Matched case-sensitively. This is what stops the pronoun "us" from
   * tagging a story North America: only the capitalised "US" counts.
   */
  acronyms?: string[];
};

/**
 * Deliberately left out because they are too often not places: Georgia (US
 * state or country), Jordan and Chad (first names), Amazon (the company),
 * "Gulf" on its own, "Pacific" on its own (Pacific Gas and Electric, Pacific
 * Northwest) and "American" (North or Latin).
 */
export const REGIONS: Region[] = [
  {
    key: 'North America',
    names: [
      'north america', 'north american', 'united states', 'canada', 'canadian',
      // Longer names that contain another region's place: "New England" is in
      // the US, not England; "New Mexico" is a US state, not Mexico.
      'new england', 'new mexico', 'gulf of mexico',
      'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
      'delaware', 'florida', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas',
      'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota',
      'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey',
      'new york', 'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania',
      'rhode island', 'south carolina', 'south dakota', 'tennessee', 'texas', 'utah', 'vermont',
      'virginia', 'west virginia', 'washington', 'wisconsin', 'wyoming',
      'ontario', 'quebec', 'alberta', 'british columbia', 'manitoba', 'saskatchewan', 'nova scotia',
      'chicago', 'houston', 'los angeles', 'san francisco', 'boston', 'seattle', 'toronto',
      'vancouver', 'montreal', 'henry hub',
    ],
    acronyms: ['US', 'U.S.', 'USA', 'U.S.A.', 'ERCOT', 'PJM', 'CAISO'],
  },
  {
    key: 'Europe',
    names: [
      'europe', 'european', 'europeans', 'european union', 'eurozone', 'united kingdom',
      'britain', 'british', 'england', 'scotland', 'scottish', 'wales', 'welsh',
      'northern ireland', 'ireland', 'irish', 'france', 'germany', 'german', 'italy', 'italian',
      'spain', 'spanish', 'portugal', 'netherlands', 'dutch', 'belgium', 'switzerland', 'swiss',
      'austria', 'sweden', 'swedish', 'norway', 'norwegian', 'denmark', 'danish', 'finland',
      'finnish', 'iceland', 'poland', 'czech', 'hungary', 'romania', 'bulgaria', 'greece', 'greek',
      'croatia', 'serbia', 'ukraine', 'ukrainian', 'russia', 'russian', 'moldova', 'baltic',
      'balkans', 'scandinavia', 'scandinavian', 'nordic', 'north sea', 'london', 'paris', 'berlin',
      'rome', 'madrid', 'brussels', 'amsterdam', 'geneva', 'vienna',
    ],
    acronyms: ['EU', 'UK', 'U.K.'],
  },
  {
    key: 'Asia',
    names: [
      'asia', 'asian', 'south asia', 'southeast asia', 'central asia', 'china', 'chinese',
      'hong kong', 'taiwan', 'india', 'indian', 'pakistan', 'bangladesh', 'sri lanka', 'nepal',
      'japan', 'japanese', 'south korea', 'north korea', 'korea', 'korean', 'indonesia',
      'indonesian', 'vietnam', 'viet nam', 'thailand', 'malaysia', 'singapore', 'philippines',
      'philippine', 'myanmar', 'cambodia', 'kazakhstan', 'uzbekistan', 'mongolia', 'beijing',
      'shanghai', 'tokyo', 'seoul', 'jakarta', 'new delhi', 'delhi', 'mumbai',
    ],
  },
  {
    key: 'Middle East',
    names: [
      'middle east', 'middle eastern', 'gulf states', 'persian gulf', 'arabian gulf',
      'saudi arabia', 'saudi', 'united arab emirates', 'emirati', 'dubai', 'abu dhabi', 'qatar',
      'qatari', 'doha', 'kuwait', 'oman', 'omani', 'muscat', 'bahrain', 'riyadh', 'israel',
      'israeli', 'iran', 'iranian', 'iraq', 'iraqi', 'syria', 'lebanon', 'yemen', 'gaza',
      'west bank', 'palestinian', 'turkey', 'türkiye', 'turkish',
      // Egypt is listed under both Middle East and Africa: it is usually
      // counted in both (MENA), and p. 179 lets a record match each region.
      'egypt', 'egyptian', 'cairo',
    ],
    acronyms: ['UAE', 'MENA', 'GCC'],
  },
  {
    key: 'Africa',
    names: [
      'africa', 'african', 'sub-saharan', 'sahel', 'south africa', 'nigeria', 'nigerian', 'kenya',
      'kenyan', 'egypt', 'egyptian', 'ghana', 'ethiopia', 'morocco', 'moroccan', 'algeria',
      'tunisia', 'libya', 'sudan', 'sudanese', 'south sudan', 'tanzania', 'uganda', 'rwanda',
      'senegal', 'zambia', 'zimbabwe', 'mozambique', 'angola', 'namibia', 'botswana', 'madagascar',
      'cameroon', 'ivory coast', "côte d'ivoire", 'congo', 'mali', 'somalia', 'malawi', 'guinea',
      'lake victoria', 'nairobi', 'lagos', 'johannesburg', 'cape town', 'cairo', 'addis ababa',
    ],
  },
  {
    key: 'Latin America',
    names: [
      'latin america', 'latin american', 'south america', 'south american', 'central america',
      'central american', 'caribbean', 'brazil', 'brazilian', 'argentina', 'argentine',
      'colombia', 'colombian', 'chile', 'chilean', 'peru', 'peruvian', 'mexico', 'mexican',
      'venezuela', 'ecuador', 'bolivia', 'uruguay', 'paraguay', 'cuba', 'guatemala', 'honduras',
      'costa rica', 'panama', 'jamaica', 'haiti', 'dominican republic', 'puerto rico',
      'sao paulo', 'são paulo', 'rio de janeiro', 'buenos aires', 'bogota', 'bogotá', 'santiago',
      'mexico city',
    ],
  },
  {
    key: 'Oceania',
    names: [
      'oceania', 'australia', 'australian', 'new zealand', 'queensland', 'new south wales',
      'tasmania', 'victoria', 'sydney', 'melbourne', 'brisbane', 'perth', 'auckland', 'fiji',
      'papua new guinea', 'samoa', 'tonga', 'vanuatu', 'solomon islands', 'pacific islands',
      'south pacific',
    ],
  },
];

/** Words that state a worldwide scope. "World" and "international" are not
 * here: they mostly appear in names like "World Bank" and "International
 * Energy Agency", which say nothing about what the story covers. */
const GLOBAL_TERMS = ['global', 'globally', 'worldwide'];

/**
 * Names that contain a place but are not about it. They win the overlap test
 * below and then count for nothing (or for Global), so "Paris Agreement" does
 * not tag a story Europe and "Indian Ocean" does not tag it Asia.
 */
const NEUTRAL_TERMS: { term: string; global: boolean }[] = [
  { term: 'paris agreement', global: true },
  { term: 'indian ocean', global: false },
];

type Matcher = { re: RegExp; region: PlaceRegion | null; global: boolean };

function escape(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Whole-word matching that also works for "U.S." - a plain `\b` fails after a
 * full stop. Letters and digits on either side mean "inside another word".
 */
function build(term: string, caseSensitive: boolean): RegExp {
  // Acronyms also refuse a following "$": "US$500m" is a currency, not a place.
  const after = caseSensitive ? '(?![\\p{L}\\p{N}$])' : '(?![\\p{L}\\p{N}])';
  return new RegExp(`(?<![\\p{L}\\p{N}])${escape(term)}${after}`, caseSensitive ? 'gu' : 'giu');
}

const MATCHERS: Matcher[] = [
  ...REGIONS.flatMap((r) => [
    ...r.names.map((n) => ({ re: build(n, false), region: r.key, global: false })),
    ...(r.acronyms ?? []).map((a) => ({ re: build(a, true), region: r.key, global: false })),
  ]),
  ...GLOBAL_TERMS.map((t) => ({ re: build(t, false), region: null, global: true })),
  ...NEUTRAL_TERMS.map((t) => ({ re: build(t.term, false), region: null, global: t.global })),
];

type Hit = { start: number; end: number; region: PlaceRegion | null; global: boolean };

export function extractRegions(title: string, summary: string | null): RegionKey[] {
  const text = `${title} ${summary ?? ''}`;

  const hits: Hit[] = [];
  for (const m of MATCHERS) {
    m.re.lastIndex = 0;
    for (const found of text.matchAll(m.re)) {
      const start = found.index ?? 0;
      hits.push({ start, end: start + found[0].length, region: m.region, global: m.global });
    }
  }

  // The longest name wins: a hit that sits inside a longer hit is ignored, so
  // "New England" never also counts as "England".
  const kept = hits.filter(
    (h) => !hits.some((o) => o !== h && o.start <= h.start && o.end >= h.end && o.end - o.start > h.end - h.start),
  );

  const placeHits = kept.filter((h): h is Hit & { region: PlaceRegion } => h.region !== null);
  const places = new Set(placeHits.map((h) => h.region));
  const global = kept.some((h) => h.global);

  const out: RegionKey[] = REGION_ORDER.filter((k): k is PlaceRegion => places.has(k as PlaceRegion));
  // "Multiple Regions" needs two different places, not one place listed under
  // two regions (Egypt alone is Middle East and Africa, but it is one country).
  const multiple = placeHits.some((a) => placeHits.some((b) => a.region !== b.region && a.start !== b.start));
  if (multiple) out.push('Multiple Regions');
  if (global) out.push('Global');
  if (out.length === 0) out.push('Not Specified');

  return REGION_ORDER.filter((k) => out.includes(k));
}
