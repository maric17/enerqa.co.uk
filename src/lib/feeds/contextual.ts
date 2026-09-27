import type { NewsBasketKey } from '@/lib/api/news';
import type { ProviderId } from '@/lib/api/core/types';

/**
 * "Contextual API and link configuration" for every domain and industry page.
 *
 * Transcribed from the handoff PDF, one block per page (the page number is on
 * each entry so it can be checked against the source). Kept in code rather than
 * the CMS because these are API query definitions, not editorial copy.
 *
 *  - newsBaskets: each inner array is one OR'd basket from the PDF. An item
 *    must match a whole phrase in its headline or summary. The items come from
 *    the shared, already-cached news pool - no extra provider calls (p. 226).
 *  - researchThemes: each theme is one query through the research connectors.
 *  - specialistFeeds: the "Specialist feeds for ..." line of the same page.
 */

/**
 * The specialist provider IDs exactly as the handoff spells them in its
 * "Specialist feeds for CP / EP / NP / BP / I{nn}R" lines.
 */
export type SpecialistFeed = 'reliefweb' | 'eia_rss' | 'osti' | 'eea_rss' | 'gbif_literature' | 'sec_edgar';

/** The registry id behind each specialist-feed spelling (core/registry.ts). */
export const SPECIALIST_PROVIDER: Record<SpecialistFeed, ProviderId> = {
  reliefweb: 'reliefweb',
  eia_rss: 'eia_rss',
  osti: 'osti',
  eea_rss: 'eea_rss',
  gbif_literature: 'gbif-literature',
  sec_edgar: 'sec-edgar',
};

export type ContextualFeed = {
  pdfPage: number;
  newsBaskets: string[][];
  researchThemes: string[];
  /**
   * I{nn}R (p. 65): "OpenAlex/DOAJ shared scholarly sources plus the
   * specialist sources identified in the industry mapping."
   */
  specialistFeeds?: SpecialistFeed[];
};

export type DomainFeed = ContextualFeed & {
  /**
   * The cached topic basket that stands for this domain where one basket is
   * needed: the Global Intelligence default theme, and the relevance check for
   * the EIA and EEA official feeds.
   */
  newsBasket: Exclude<NewsBasketKey, 'all'>;
  /** CP/EP/NP/BP specialist feeds (pp. 30, 38, 49, 60). Not interchangeable. */
  specialistFeeds: SpecialistFeed[];
  /** "Recommended numerical sources" for CD/ED/ND/BD (pp. 29, 38, 49, 59). */
  dataSources: ProviderId[];
};

export const DOMAIN_FEEDS: Record<string, DomainFeed> = {
  'climate-action-carbon-management': {
    pdfPage: 30,
    newsBasket: 'climate',
    // p. 30: "Specialist feeds for CP: reliefweb."
    specialistFeeds: ['reliefweb'],
    // p. 29: "Recommended numerical sources: climate-trace, oecd-sdmx."
    dataSources: ['climate-trace', 'oecd-sdmx'],
    newsBaskets: [
      ['climate change', 'climate policy', 'NDC'],
      ['carbon markets', 'carbon credits', 'decarbonisation'],
      ['climate finance', 'adaptation finance', 'loss and damage'],
    ],
    researchThemes: [
      'GHG inventories measurement reporting verification',
      'climate adaptation resilience vulnerability',
      'carbon markets climate finance decarbonisation',
    ],
  },
  'energy-systems-transition': {
    pdfPage: 38,
    newsBasket: 'energy',
    // p. 38: "Specialist feeds for EP: eia_rss, osti."
    specialistFeeds: ['eia_rss', 'osti'],
    // p. 38: "Recommended numerical sources: eia-open-data, nasa-power, world-bank-indicators."
    dataSources: ['eia-open-data', 'nasa-power', 'world-bank-indicators'],
    newsBaskets: [
      ['renewable energy', 'energy storage', 'power grid'],
      ['energy efficiency', 'clean technology', 'industrial decarbonisation'],
      ['energy markets', 'oil market', 'electricity prices'],
    ],
    researchThemes: [
      'renewable energy storage grids feasibility',
      'energy efficiency energy management industrial decarbonisation',
      'energy modelling electricity markets transition',
    ],
  },
  'environment-nature-circularity': {
    pdfPage: 49,
    newsBasket: 'environment',
    // p. 49: "Specialist feeds for NP: eea_rss, gbif_literature, reliefweb."
    specialistFeeds: ['eea_rss', 'gbif_literature', 'reliefweb'],
    // p. 49: "Recommended numerical sources: gbif-occurrence, openaq-v3, oecd-sdmx."
    dataSources: ['gbif-occurrence', 'openaq-v3', 'oecd-sdmx'],
    newsBaskets: [
      ['biodiversity', 'ecosystem restoration', 'nature-based solutions'],
      ['circular economy', 'resource recovery', 'waste recycling'],
      ['environmental pollution', 'water management', 'marine environment'],
    ],
    researchThemes: [
      'biodiversity ecosystems restoration natural capital',
      'circular economy waste recovery material flows',
      'environmental impact assessment pollution water coastal marine',
    ],
  },
  'sustainable-business-esg-finance': {
    pdfPage: 60,
    newsBasket: 'business',
    // p. 60: "Specialist feeds for BP: sec_edgar."
    specialistFeeds: ['sec_edgar'],
    // p. 59: "Recommended numerical sources: oecd-sdmx, world-bank-indicators."
    dataSources: ['oecd-sdmx', 'world-bank-indicators'],
    newsBaskets: [
      ['ESG', 'sustainability reporting', 'sustainable business'],
      ['sustainable finance', 'green credit', 'green taxonomy'],
      ['climate risk', 'responsible supply chains', 'impact investing'],
    ],
    researchThemes: [
      'ESG materiality sustainability reporting climate risk',
      'sustainable finance green credit taxonomy project screening',
      'business models feasibility impact monitoring evaluation',
    ],
  },
};

export const INDUSTRY_FEEDS: Record<string, ContextualFeed> = {
  'government-regulators-public-institutions': {
    pdfPage: 66,
    // p. 66: "Specialist feeds for I01R: reliefweb."
    specialistFeeds: ['reliefweb'],
    newsBaskets: [
      ['climate policy', 'national climate plan', 'NDC'],
      ['public investment', 'environmental regulation', 'energy policy'],
    ],
    researchThemes: [
      'national climate policy MRV public institutions',
      'public investment sustainable development institutional capacity',
    ],
  },
  'financial-institutions-investors-development-finance': {
    pdfPage: 72,
    // p. 72: "Specialist feeds for I02R: sec_edgar."
    specialistFeeds: ['sec_edgar'],
    newsBaskets: [
      ['green finance', 'climate finance', 'development finance'],
      ['green credit', 'sustainable investment', 'ESG risk'],
    ],
    researchThemes: [
      'sustainable finance green credit taxonomy bankability',
      'climate finance environmental social investment risk',
    ],
  },
  'energy-utilities': {
    pdfPage: 78,
    // p. 78: "Specialist feeds for I03R: eia_rss, osti."
    specialistFeeds: ['eia_rss', 'osti'],
    newsBaskets: [
      ['electricity generation', 'renewable energy', 'power grid'],
      ['battery storage', 'energy utilities', 'energy efficiency'],
    ],
    researchThemes: [
      'electricity systems renewable energy storage grids',
      'energy utilities demand modelling efficiency feasibility',
    ],
  },
  'oil-gas-petrochemicals': {
    pdfPage: 84,
    // p. 84: "Specialist feeds for I04R: eia_rss, osti, sec_edgar."
    specialistFeeds: ['eia_rss', 'osti', 'sec_edgar'],
    newsBaskets: [
      ['methane emissions', 'gas flaring', 'oil decarbonisation'],
      ['oil market', 'LNG', 'petrochemical energy efficiency'],
    ],
    researchThemes: [
      'oil gas methane flaring industrial decarbonisation',
      'petrochemical energy efficiency environmental assessment transition',
    ],
  },
  'industry-manufacturing-materials': {
    pdfPage: 90,
    // p. 90: "Specialist feeds for I05R: osti, eea_rss."
    specialistFeeds: ['osti', 'eea_rss'],
    newsBaskets: [
      ['industrial decarbonisation', 'manufacturing energy efficiency'],
      ['circular manufacturing', 'cement emissions', 'cleaner production'],
    ],
    researchThemes: [
      'manufacturing process emissions energy resource efficiency',
      'industrial circular economy cleaner production feasibility',
    ],
  },
  'infrastructure-real-estate-industrial-zones': {
    pdfPage: 96,
    // p. 96: "Specialist feeds for I06R: eea_rss, osti."
    specialistFeeds: ['eea_rss', 'osti'],
    newsBaskets: [
      ['sustainable infrastructure', 'green buildings', 'industrial zones'],
      ['climate resilient infrastructure', 'building energy efficiency'],
    ],
    researchThemes: [
      'green buildings infrastructure sustainability resilience lifecycle emissions',
      'industrial zones water energy environmental social assessment',
    ],
  },
  'transport-logistics-mobility': {
    pdfPage: 102,
    // p. 102: "Specialist feeds for I07R: eia_rss, osti."
    specialistFeeds: ['eia_rss', 'osti'],
    newsBaskets: [
      ['transport decarbonisation', 'low carbon mobility'],
      ['sustainable logistics', 'shipping emissions', 'electric fleets'],
    ],
    researchThemes: [
      'transport emissions activity data MRV low carbon mobility',
      'logistics maritime aviation fuels fleet climate resilience',
    ],
  },
  'water-waste-circular-economy': {
    pdfPage: 108,
    // p. 108: "Specialist feeds for I08R: eea_rss, reliefweb."
    specialistFeeds: ['eea_rss', 'reliefweb'],
    newsBaskets: [
      ['water reuse', 'wastewater treatment', 'water scarcity'],
      ['circular economy', 'waste recycling', 'resource recovery'],
    ],
    researchThemes: [
      'water wastewater reuse circular economy resource recovery',
      'waste treatment recovery business models environmental compliance',
    ],
  },
  'agriculture-food-aquaculture': {
    pdfPage: 114,
    // p. 114: "Specialist feeds for I09R: reliefweb, gbif_literature."
    specialistFeeds: ['reliefweb', 'gbif_literature'],
    newsBaskets: [
      ['climate smart agriculture', 'sustainable food systems'],
      ['solar irrigation', 'sustainable aquaculture', 'food carbon footprint'],
    ],
    researchThemes: [
      'agriculture aquaculture climate resilience water energy biodiversity',
      'solar irrigation food carbon footprint lifecycle assessment',
    ],
  },
  'mining-natural-resources': {
    pdfPage: 120,
    // p. 120: "Specialist feeds for I10R: gbif_literature, eea_rss."
    specialistFeeds: ['gbif_literature', 'eea_rss'],
    newsBaskets: [
      ['sustainable mining', 'mine rehabilitation', 'mining biodiversity'],
      ['mining emissions', 'responsible minerals', 'mine water'],
    ],
    researchThemes: [
      'mining environmental social impacts biodiversity rehabilitation closure',
      'mine water pollution energy emissions responsible sourcing',
    ],
  },
  'tourism-hospitality-destinations': {
    pdfPage: 126,
    // p. 126: "Specialist feeds for I11R: eea_rss, gbif_literature."
    specialistFeeds: ['eea_rss', 'gbif_literature'],
    newsBaskets: [
      ['sustainable tourism', 'green hotels', 'responsible destinations'],
      ['tourism climate resilience', 'hotel energy efficiency'],
    ],
    researchThemes: [
      'tourism hospitality sustainability energy water waste carbon',
      'destination climate resilience biodiversity community impacts',
    ],
  },
  'technology-telecoms-data-infrastructure': {
    pdfPage: 132,
    // p. 132: "Specialist feeds for I12R: osti, eia_rss, sec_edgar."
    specialistFeeds: ['osti', 'eia_rss', 'sec_edgar'],
    newsBaskets: [
      ['data centre energy', 'sustainable telecoms', 'green data centres'],
      ['data centre water', 'digital infrastructure climate risk'],
    ],
    researchThemes: [
      'data centres energy efficiency cooling water renewable storage',
      'telecommunications ESG supply chain emissions digital MRV',
    ],
  },
  'healthcare-education-institutional-estates': {
    pdfPage: 138,
    // p. 138: "Specialist feeds for I13R: osti, eea_rss."
    specialistFeeds: ['osti', 'eea_rss'],
    newsBaskets: [
      ['sustainable hospitals', 'green campuses', 'institutional energy efficiency'],
      ['healthcare decarbonisation', 'campus climate resilience'],
    ],
    researchThemes: [
      'hospital campus estate energy water waste decarbonisation',
      'healthcare education institutional climate resilience ESG reporting',
    ],
  },
};

/**
 * Every phrase from every basket, plus matching variants, for filtering the
 * cached pool. Only the matching is widened - no headline text is changed.
 *
 *  - Singular form of a plural last word. The matcher already accepts plural
 *    endings, so "carbon market" catches both "carbon market" and "carbon
 *    markets"; the PDF's plural alone missed "EU backs carbon market changes".
 *  - "-y" plurals, which the matcher's "s/es" endings cannot reach: "climate
 *    policy" must also catch "repeal swathe of climate policies".
 *  - US spellings. The PDF writes "decarbonisation" and "data centre", but much
 *    wire copy writes "decarbonization" and "data center".
 *  - Hyphen or space: "nature-based solutions" and "nature based solutions"
 *    are the same phrase.
 */
export function newsPhrases(feed: ContextualFeed): string[] {
  const variants = new Set<string>();
  for (const phrase of feed.newsBaskets.flat()) {
    const words = phrase.split(' ');
    const last = words[words.length - 1];
    const head = words.slice(0, -1);
    const forms = [phrase];
    // Multi-word phrases only: a lone "ESG" or "biodiversity" is left alone.
    if (words.length > 1 && /[^s]s$/i.test(last)) forms.push([...head, last.slice(0, -1)].join(' '));
    if (words.length > 1 && /[^aeiou]y$/i.test(last)) forms.push([...head, `${last.slice(0, -1)}ies`].join(' '));
    for (const form of forms) {
      const us = form.replace(/isation/g, 'ization').replace(/centre/g, 'center');
      for (const p of [form, us]) {
        variants.add(p);
        if (p.includes('-')) variants.add(p.replace(/-/g, ' '));
      }
    }
  }
  return [...variants];
}
