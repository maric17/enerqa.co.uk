import type { NewsBasketKey } from '@/lib/api/news';
import type { ProviderId } from '@/lib/api/core/types';
import { containsAny } from '@/lib/api/news/types';

/**
 * "Contextual API and link configuration" for every domain and industry page.
 *
 * Transcribed from the handoff PDF, one block per page (the page number is on
 * each entry so it can be checked against the source). Kept in code rather than
 * the CMS because these are API query definitions, not editorial copy.
 *
 *  - newsBaskets: each inner array is one OR'd provider query from the PDF.
 *    Related sector terms also select relevant headlines from the saved pool,
 *    without spending extra provider credits during browsing (p. 226).
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
  /** Reviewed sector vocabulary for saved headlines that omit the query's exact phrase. */
  relatedNewsTerms?: string[];
  /** Require a subject in the headline and supporting institutional/policy context. */
  newsContextRules?: NewsContextRule[];
  /** A primary sector subject and concrete context are both needed for these news feeds. */
  newsSectorRules?: NewsSectorRule[];
  researchThemes: string[];
  /**
   * I{nn}R (p. 65): "OpenAlex/DOAJ shared scholarly sources plus the
   * specialist sources identified in the industry mapping."
   */
  specialistFeeds?: SpecialistFeed[];
};

export type NewsContextRule = {
  headlineSubjects: string[];
  institutions: string[];
  policyActions: string[];
};

export type NewsSectorRule = { subjects: string[]; contexts: string[]; exclude?: string[] };
export const NEWS_INDUSTRY_VERSION = '2026-10-24-context-v1';

/** Publisher suffixes such as "| Energy Mining News" are not a story's main subject. */
export function matchesNewsSector(item: { title: string; summary: string | null }, rules?: NewsSectorRule[]): boolean {
  if (!rules?.length) return true;
  const headline = item.title.split(/\s+(?:\||–|-)\s+/)[0];
  const text = `${headline} ${item.summary ?? ''}`;
  return rules.some(rule => containsAny(headline, rule.subjects) && containsAny(text, rule.contexts)
    && !containsAny(headline, rule.exclude ?? []));
}

/** The saved approval and the news index use the same sector rules as the page hero. */
export function newsIndustries(item: { title: string; summary: string | null }, feeds = INDUSTRY_FEEDS): string[] {
  const text = `${item.title} ${item.summary ?? ''}`;
  return Object.entries(feeds).filter(([, feed]) => matchesNewsSector(item, feed.newsSectorRules)
    && (containsAny(text, newsPhrases(feed)) || matchesNewsContext(item, feed.newsContextRules))).map(([slug]) => slug);
}

/** Paired context expands exact phrases without treating every government mention as news. */
export function matchesNewsContext(item: { title: string; summary: string | null }, rules: NewsContextRule[] = []): boolean {
  const text = `${item.title} ${item.summary ?? ''}`;
  return rules.some(rule => containsAny(item.title, rule.headlineSubjects)
    && containsAny(text, rule.institutions) && containsAny(text, rule.policyActions));
}

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
    relatedNewsTerms: ['climate', 'emissions', 'greenhouse gas', 'net zero', 'carbon pricing', 'carbon capture'],
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
    // Solar, electricity and fuel coverage need not repeat "renewable energy" or "oil market".
    relatedNewsTerms: [
      'solar', 'wind power', 'wind farm', 'battery storage', 'batteries', 'hydrogen',
      'electricity', 'fuel', 'diesel', 'natural gas', 'crude oil', 'oil prices',
      'nuclear power', 'nuclear energy', 'energy transition', 'energy security',
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
    relatedNewsTerms: [
      'environment*', 'ecosystem', 'forest', 'wildlife', 'pollution', 'recycling',
      'waste', 'conservation', 'plastic', 'mangrove',
      'habitat loss', 'habitat destruction', 'coral reef', 'turtle nest',
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
    relatedNewsTerms: ['sustainability', 'green bond', 'responsible investment', 'climate disclosure', 'sustainable investment',
      // Adaptation funding is sustainable finance even without the exact phrase "sustainable finance".
      'climate finance', 'adaptation finance', 'climate-finance'],
    researchThemes: [
      'ESG materiality sustainability reporting climate risk',
      'sustainable finance green credit taxonomy project screening',
      'business models feasibility impact monitoring evaluation',
    ],
  },
};

export type IndustryFeed = ContextualFeed & {
  /** Scheduled discovery requires both the sector and a sustainability topic. */
  newsDiscoveryQuery: string;
  /** Reviewed publisher group; APITube accepts at most three source domains per request. */
  newsSources?: string[];
};

export const INDUSTRY_FEEDS: Record<string, IndustryFeed> = {
  'government-regulators-public-institutions': {
    pdfPage: 66,
    newsDiscoveryQuery: '(government OR regulation) AND (climate OR energy OR emissions)',
    // p. 66: "Specialist feeds for I01R: reliefweb."
    specialistFeeds: ['reliefweb'],
    newsContextRules: [{
      headlineSubjects: ['net zero', 'net-zero', 'climate target', 'emissions target', 'deforestation', 'air pollution'],
      institutions: ['government', 'parliament', 'minister', 'regulator', 'EU', 'United Nations', 'UN'],
      policyActions: ['target', 'legislation', 'law', 'regulation', 'inquiry', 'approv*'],
    }],
    newsBaskets: [
      ['climate policy', 'national climate plan', 'NDC'],
      ['public investment', 'environmental regulation', 'energy policy'],
    ],
    relatedNewsTerms: [
      'climate regulation', 'climate legislation', 'climate report', 'emissions rules',
      'pollution rules', 'clean car rules', 'energy bill', 'energy regulator', 'climate funding',
    ],
    researchThemes: [
      'national climate policy MRV public institutions',
      'public investment sustainable development institutional capacity',
    ],
  },
  'financial-institutions-investors-development-finance': {
    newsDiscoveryQuery: '(bank OR investor OR finance) AND (climate OR energy OR ESG)',
    newsSources: ['myjoyonline.com', 'theguardian.com', 'bbc.co.uk'],
    newsSectorRules: [{ subjects: ['bank', 'CBG', 'investor', 'finance', 'bond', 'financial', 'investment'],
      contexts: ['climate finance', 'green bond', 'sustainable finance', 'adaptation finance', 'green investment',
        'climate investment', 'transition finance', 'green credit', 'nature-based solutions', 'sustainable investment', 'ESG risk'] }],
    pdfPage: 72,
    // p. 72: "Specialist feeds for I02R: sec_edgar."
    specialistFeeds: ['sec_edgar'],
    newsBaskets: [
      ['green finance', 'climate finance', 'development finance'],
      ['green credit', 'sustainable investment', 'ESG risk'],
    ],
    relatedNewsTerms: [
      'green bond', 'bond market', 'bond sell', 'climate investment', 'investment fund',
      'sustainability funding', 'financial disclosure', 'development bank', 'impact investment',
    ],
    researchThemes: [
      'sustainable finance green credit taxonomy bankability',
      'climate finance environmental social investment risk',
    ],
  },
  'energy-utilities': {
    newsDiscoveryQuery: '(utilities OR electricity OR solar) AND (energy OR climate OR emissions)',
    pdfPage: 78,
    // p. 78: "Specialist feeds for I03R: eia_rss, osti."
    specialistFeeds: ['eia_rss', 'osti'],
    newsBaskets: [
      ['electricity generation', 'renewable energy', 'power grid'],
      ['battery storage', 'energy utilities', 'energy efficiency'],
    ],
    relatedNewsTerms: [
      'solar', 'electricity', 'wind power', 'wind energy', 'wind farm', 'grid upgrade',
      'energy bills', 'gas prices', 'coal plant', 'power plant', 'utilities',
    ],
    researchThemes: [
      'electricity systems renewable energy storage grids',
      'energy utilities demand modelling efficiency feasibility',
    ],
  },
  'oil-gas-petrochemicals': {
    newsDiscoveryQuery: '(oil OR gas OR petrochemical) AND (energy OR climate OR emissions)',
    pdfPage: 84,
    // p. 84: "Specialist feeds for I04R: eia_rss, osti, sec_edgar."
    specialistFeeds: ['eia_rss', 'osti', 'sec_edgar'],
    newsBaskets: [
      ['methane emissions', 'gas flaring', 'oil decarbonisation'],
      ['oil market', 'LNG', 'petrochemical energy efficiency'],
    ],
    relatedNewsTerms: ['oil', 'fuel', 'diesel', 'natural gas', 'refinery', 'refineries', 'pipeline', 'petroleum', 'petrochemical*', 'methane'],
    researchThemes: [
      'oil gas methane flaring industrial decarbonisation',
      'petrochemical energy efficiency environmental assessment transition',
    ],
  },
  'industry-manufacturing-materials': {
    // Cover manufacturing word forms, electricity costs and industrial contamination.
    newsDiscoveryQuery: '(manufactur* OR cement OR steel* OR factory) AND (ener* OR electric* OR emiss* OR toxic OR enviro*)',
    pdfPage: 90,
    // p. 90: "Specialist feeds for I05R: osti, eea_rss."
    specialistFeeds: ['osti', 'eea_rss'],
    newsBaskets: [
      ['industrial decarbonisation', 'manufacturing energy efficiency'],
      ['circular manufacturing', 'cement emissions', 'cleaner production'],
    ],
    relatedNewsTerms: [
      'manufactur*', 'cement', 'steel', 'steelmaker*', 'steelmaking', 'steelworks', 'steelworker*',
      'factory', 'factories', 'industrial emissions',
      'industrial energy', 'recycled materials', 'material recycling', 'alternative leather',
    ],
    researchThemes: [
      'manufacturing process emissions energy resource efficiency',
      'industrial circular economy cleaner production feasibility',
    ],
  },
  'infrastructure-real-estate-industrial-zones': {
    newsDiscoveryQuery: '(building OR infrastructure OR concrete) AND (energy OR climate OR emissions OR carbon)',
    newsSources: ['betakit.com', 'theguardian.com', 'bbc.co.uk'],
    newsSectorRules: [{ subjects: ['building', 'infrastructure', 'concrete', 'construction', 'retrofit', 'heat pump', 'housing', 'homes', 'district heating'],
      contexts: ['energy efficiency', 'retrofit', 'emission', 'carbon', 'recycl*', 'climate resilience', 'heat pump', 'district heating'],
      exclude: ['AI factory', 'film review', 'novel'] }],
    pdfPage: 96,
    // p. 96: "Specialist feeds for I06R: eea_rss, osti."
    specialistFeeds: ['eea_rss', 'osti'],
    newsBaskets: [
      ['sustainable infrastructure', 'green buildings', 'industrial zones'],
      ['climate resilient infrastructure', 'building energy efficiency'],
    ],
    relatedNewsTerms: [
      'rooftop solar', 'apartments', 'building emissions', 'building retrofit', 'heat pump',
      'district heating', 'energy infrastructure', 'grid upgrade', 'gas ban', 'new homes',
      'low-carbon concrete', 'low carbon concrete', 'embodied carbon', 'circular construction',
    ],
    researchThemes: [
      'green buildings infrastructure sustainability resilience lifecycle emissions',
      'industrial zones water energy environmental social assessment',
    ],
  },
  'transport-logistics-mobility': {
    newsDiscoveryQuery: '(transport OR vehicle OR shipping OR aviation) AND (energy OR emissions OR electric)',
    newsSources: ['transportandenergy.com', 'theguardian.com', 'bbc.co.uk'],
    newsSectorRules: [{ subjects: ['transport', 'vehicle', 'car', 'shipping', 'aviation', 'airline', 'fleet', 'mobility', 'bus', 'rail', 'ferry', 'TfL'],
      contexts: ['zero-emission', 'zero emission', 'electric vehicle', 'electric car', 'carbon', 'emission', 'shipping fuel', 'aviation fuel', 'clean transport', 'hydrogen'] }],
    pdfPage: 102,
    // p. 102: "Specialist feeds for I07R: eia_rss, osti."
    specialistFeeds: ['eia_rss', 'osti'],
    newsBaskets: [
      ['transport decarbonisation', 'low carbon mobility'],
      ['sustainable logistics', 'shipping emissions', 'electric fleets'],
    ],
    relatedNewsTerms: [
      'fuel prices', 'diesel prices', 'petrol prices', 'motorist*', 'electric car',
      'electric vehicle', 'clean car', 'vehicle emissions', 'shipping fuel', 'aviation emissions',
      'zero-emission', 'zero emission', 'fleet electrification',
    ],
    researchThemes: [
      'transport emissions activity data MRV low carbon mobility',
      'logistics maritime aviation fuels fleet climate resilience',
    ],
  },
  'water-waste-circular-economy': {
    newsDiscoveryQuery: '(water OR waste OR recycling) AND (climate OR environment OR circular)',
    pdfPage: 108,
    // p. 108: "Specialist feeds for I08R: eea_rss, reliefweb."
    specialistFeeds: ['eea_rss', 'reliefweb'],
    newsBaskets: [
      ['water reuse', 'wastewater treatment', 'water scarcity'],
      ['circular economy', 'waste recycling', 'resource recovery'],
    ],
    relatedNewsTerms: ['water', 'wastewater', 'water supply', 'water shortage', 'recycling', 'plastic waste', 'waste recovery', 'waterway*'],
    researchThemes: [
      'water wastewater reuse circular economy resource recovery',
      'waste treatment recovery business models environmental compliance',
    ],
  },
  'agriculture-food-aquaculture': {
    // Include farmers/farming and word stems used in real sector headlines.
    newsDiscoveryQuery: '(agri* OR farming OR farmer* OR food OR aquacultur*) AND (climate OR environment* OR sustainab*)',
    newsSources: ['agronigeria.ng', 'theguardian.com', 'bbc.co.uk'],
    newsSectorRules: [{ subjects: ['agricultur*', 'farming', 'farmer', 'food', 'aquacultur*', 'crop', 'fishery', 'fisheries', 'irrigation', 'soil'],
      contexts: ['climate finance', 'agricultural adaptation', 'climate-smart', 'climate-resilient', 'soil', 'food systems',
        'food production', 'biodiversity', 'irrigation', 'sustainable farming', 'food waste', 'sustainable crop', 'local food'],
      exclude: ['alumni', 'applications open', 'food delivery', 'film review'] }],
    pdfPage: 114,
    // p. 114: "Specialist feeds for I09R: reliefweb, gbif_literature."
    specialistFeeds: ['reliefweb', 'gbif_literature'],
    newsBaskets: [
      ['climate smart agriculture', 'sustainable food systems'],
      ['solar irrigation', 'sustainable aquaculture', 'food carbon footprint'],
    ],
    // "Farm" alone would incorrectly classify solar farms as agriculture.
    relatedNewsTerms: [
      'agricultur*', 'farming', 'farmer', 'food production', 'food systems', 'local food',
      'food security', 'aquaculture', 'irrigation', 'crop yield', 'soil carbon', 'fisheries',
    ],
    researchThemes: [
      'agriculture aquaculture climate resilience water energy biodiversity',
      'solar irrigation food carbon footprint lifecycle assessment',
    ],
  },
  'mining-natural-resources': {
    newsDiscoveryQuery: '(mining OR minerals) AND (climate OR energy OR environment OR water OR deforestation)',
    newsSources: ['news.mongabay.com', 'theguardian.com', 'bbc.co.uk'],
    newsSectorRules: [{ subjects: ['mining', 'mine', 'minerals', 'mineral extraction', 'rare earth', 'copper', 'coal mine'],
      contexts: ['environment*', 'biodiversity', 'water', 'deforest*', 'pollut*', 'rehabilitation', 'emission', 'carbon', 'energy transition', 'energy security', 'sustainability'] }],
    pdfPage: 120,
    // p. 120: "Specialist feeds for I10R: gbif_literature, eea_rss."
    specialistFeeds: ['gbif_literature', 'eea_rss'],
    newsBaskets: [
      ['sustainable mining', 'mine rehabilitation', 'mining biodiversity'],
      ['mining emissions', 'responsible minerals', 'mine water'],
    ],
    relatedNewsTerms: ['mining', 'copper mine', 'coal mine', 'coal project', 'mineral extraction', 'rare earth', 'mine closure'],
    researchThemes: [
      'mining environmental social impacts biodiversity rehabilitation closure',
      'mine water pollution energy emissions responsible sourcing',
    ],
  },
  'tourism-hospitality-destinations': {
    newsDiscoveryQuery: '(tourism OR hotel OR hospitality) AND (climate OR energy OR sustainability OR environment OR turtle)',
    pdfPage: 126,
    // p. 126: "Specialist feeds for I11R: eea_rss, gbif_literature."
    specialistFeeds: ['eea_rss', 'gbif_literature'],
    newsBaskets: [
      ['sustainable tourism', 'green hotels', 'responsible destinations'],
      ['tourism climate resilience', 'hotel energy efficiency'],
    ],
    relatedNewsTerms: ['tourism', 'hotel', 'hospitality', 'tourist', 'ecotourism', 'eco-tourism', 'sustainable travel'],
    researchThemes: [
      'tourism hospitality sustainability energy water waste carbon',
      'destination climate resilience biodiversity community impacts',
    ],
  },
  'technology-telecoms-data-infrastructure': {
    newsDiscoveryQuery: '("data centre" OR datacenter OR telecom) AND (energy OR water OR emissions OR carbon)',
    newsSources: ['betakit.com', 'theguardian.com', 'bbc.co.uk'],
    newsSectorRules: [{ subjects: ['data centre', 'data center', 'datacenter', 'telecom*', 'digital infrastructure', 'AI infrastructure'],
      contexts: ['energy', 'water', 'emission', 'carbon', 'power', 'cooling', 'renewab*', 'environment*'] }],
    pdfPage: 132,
    // p. 132: "Specialist feeds for I12R: osti, eia_rss, sec_edgar."
    specialistFeeds: ['osti', 'eia_rss', 'sec_edgar'],
    newsBaskets: [
      ['data centre energy', 'sustainable telecoms', 'green data centres'],
      ['data centre water', 'digital infrastructure climate risk'],
    ],
    relatedNewsTerms: [
      'data centre', 'data center', 'datacenter', 'telecom*', 'digital infrastructure',
      'tech companies', 'climate technology', 'climate tool', 'energy technology',
    ],
    researchThemes: [
      'data centres energy efficiency cooling water renewable storage',
      'telecommunications ESG supply chain emissions digital MRV',
    ],
  },
  'healthcare-education-institutional-estates': {
    newsDiscoveryQuery: '(hospital OR campus OR healthcare OR university) AND (climate OR energy OR environment)',
    newsSources: ['logisticsnews.ph', 'theguardian.com', 'bbc.co.uk'],
    newsSectorRules: [{ subjects: ['hospital', 'campus', 'university', 'universities', 'school', 'college', 'healthcare', 'medical center', 'medical centre'],
      contexts: ['renewable energy', 'solar power', 'solar energy', 'energy efficiency', 'power purchase', 'power supply',
        'decarbon*', 'wastewater treatment', 'water reuse', 'building retrofit', 'heat pump', 'net zero campus'],
      exclude: ['research', 'study', 'professor', 'appointment', 'lecture', 'curriculum', 'master’s', 'AI campus', 'essay'] }],
    pdfPage: 138,
    // p. 138: "Specialist feeds for I13R: osti, eea_rss."
    specialistFeeds: ['osti', 'eea_rss'],
    newsBaskets: [
      ['sustainable hospitals', 'green campuses', 'institutional energy efficiency'],
      ['healthcare decarbonisation', 'campus climate resilience'],
    ],
    relatedNewsTerms: ['hospital', 'campus', 'university', 'universities', 'school', 'college', 'healthcare', 'health care', 'medical centre', 'medical center'],
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
  for (const phrase of [...feed.newsBaskets.flat(), ...(feed.relatedNewsTerms ?? [])]) {
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
