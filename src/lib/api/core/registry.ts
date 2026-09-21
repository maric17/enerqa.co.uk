import type { ProviderId } from './types';

/**
 * One row per approved connector (handoff pp. 209-224).
 *
 * This is the switchboard p. 227 asks for: "A provider going chargeable
 * disables the connector pending review." Flipping `enabled` to false takes a
 * provider off every page at once, without hunting through components.
 *
 * `accessReviewedOn` is the date the free tier, licence and published limits
 * were last checked against the provider's own documentation. p. 209 requires
 * this to be re-checked during implementation and again before launch.
 */

export type ProviderRecord = {
  id: ProviderId;
  name: string;
  /** Short description of what it is, for source notes and method pages. */
  purpose: string;
  homepage: string;
  docsUrl: string;
  licence: string;
  licenceUrl: string | null;
  /** The exact attribution string to display with any record. */
  attribution: string;
  /** Environment variable holding the key, or null when the provider is keyless. */
  keyEnvVar: string | null;
  /** Suggested cache lifetime in seconds, taken from the provider's own guidance. */
  revalidate: number;
  /** Published limits, quoted so nobody has to re-read the spec to check one. */
  publishedLimits: string;
  /** Set to false to take the provider off the site pending review (p. 227). */
  enabled: boolean;
  accessReviewedOn: string;
  /** Anything that would otherwise be rediscovered painfully. */
  note?: string;
};

const DAY = 86400;
const HOUR = 3600;

export const PROVIDERS: Record<ProviderId, ProviderRecord> = {
  'climate-trace': {
    id: 'climate-trace',
    name: 'Climate TRACE',
    purpose: 'Independently estimated greenhouse gas emissions by country, sector and source.',
    homepage: 'https://climatetrace.org/',
    docsUrl: 'https://api.climatetrace.org/',
    licence: 'CC BY 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attribution: 'Climate TRACE, CC BY 4.0',
    keyEnvVar: null,
    revalidate: 7 * DAY,
    publishedLimits: 'No published numeric quota. Provider asks for low volume and does not guarantee production availability.',
    enabled: true,
    accessReviewedOn: '2026-09-19',
    note: 'Public beta. p. 218 says to confirm the current v7 specification: checked on 2026-09-19, v7 serves /definitions/* but the emissions routes answer on v6, so the data calls use v6 and the sector list uses v7.',
  },
  'world-bank-indicators': {
    id: 'world-bank-indicators',
    name: 'World Bank Indicators API v2',
    purpose: 'Country-level development, energy, environmental and economic indicators.',
    homepage: 'https://data.worldbank.org/',
    docsUrl: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392',
    licence: 'CC BY 4.0 with additional World Bank terms; dataset terms prevail',
    licenceUrl: 'https://datacatalog.worldbank.org/public-licenses',
    attribution: 'World Bank Indicators API v2, CC BY 4.0',
    keyEnvVar: null,
    revalidate: DAY,
    publishedLimits: 'No published quota; reasonable volume. Default page size 50; up to 60 indicators per request.',
    enabled: true,
    accessReviewedOn: '2026-09-19',
    note: 'p. 219: missing values are common and the latest available year is usually not the current year. Never present GDP in current US$ as real growth.',
  },
  'oecd-sdmx': {
    id: 'oecd-sdmx',
    name: 'OECD Data Explorer (SDMX)',
    purpose: 'Climate-related development finance and municipal waste statistics.',
    homepage: 'https://data-explorer.oecd.org/',
    docsUrl: 'https://gitlab.com/sdmx-twg/sdmx-rest',
    licence: 'OECD terms: extract, adapt, share and embed commercially with attribution',
    licenceUrl: 'https://www.oecd.org/termsandconditions/',
    attribution: 'OECD Data Explorer',
    keyEnvVar: null,
    revalidate: 7 * DAY,
    publishedLimits: 'Maximum 60 data downloads per hour. VPN/anonymised-origin traffic is not allowed.',
    enabled: true,
    accessReviewedOn: '2026-09-19',
    note: 'Dataflow IDs and versions confirmed live on 2026-09-19 rather than guessed: OECD.ENV.EPI,DSD_MUNW@DF_MUNW,1.0 and OECD.DCD.FSD,DSD_RIOMRKR@DF_RIOMARKERS,1.6.',
  },
  'eia-open-data': {
    id: 'eia-open-data',
    name: 'U.S. EIA Open Data API v2',
    purpose: 'Energy production, consumption, electricity generation and energy price series.',
    homepage: 'https://www.eia.gov/opendata/',
    docsUrl: 'https://www.eia.gov/opendata/documentation.php',
    licence: 'U.S. Government public domain; EIA terms permit search, display, analysis and retrieval',
    licenceUrl: 'https://www.eia.gov/about/copyrights_reuse.php',
    attribution: 'U.S. Energy Information Administration',
    keyEnvVar: 'EIA_API_KEY',
    revalidate: DAY,
    publishedLimits: 'Maximum 5,000 rows per response. Sustained under ~9,000 requests/hour, bursts under 5/second.',
    enabled: true,
    accessReviewedOn: '2026-09-19',
    note: 'Key is free from https://www.eia.gov/opendata/register.php and must stay server-side. Without it this connector reports not_configured and shows nothing - it never falls back to invented figures.',
  },
  'nasa-power': {
    id: 'nasa-power',
    name: 'NASA POWER',
    purpose: 'Solar resource and meteorological time series for a location.',
    homepage: 'https://power.larc.nasa.gov/',
    docsUrl: 'https://power.larc.nasa.gov/docs/services/api/temporal/',
    licence: 'NASA Earth science data, free and open',
    licenceUrl: 'https://science.nasa.gov/earth-science/earth-science-data/data-information-policy/',
    attribution: 'NASA POWER Project',
    keyEnvVar: null,
    revalidate: DAY,
    publishedLimits: 'No set rate limit, but usage is monitored and limited for equitable access; HTTP 429 is documented. Hourly requests allow a maximum of 15 parameters.',
    enabled: true,
    accessReviewedOn: '2026-09-19',
    note: 'p. 222: grid-cell modelled values, roughly 0.5x0.625 degrees for meteorology and 1x1 for solar. Not site measurements, and historical resource data are not forecasts.',
  },
  'gbif-occurrence': {
    id: 'gbif-occurrence',
    name: 'GBIF Occurrence API',
    purpose: 'Published biodiversity occurrence records by geography and taxon.',
    homepage: 'https://www.gbif.org/',
    docsUrl: 'https://techdocs.gbif.org/en/openapi/',
    licence: 'Per-dataset: CC0, CC BY or CC BY-NC. Only CC0 and CC BY are used here.',
    licenceUrl: 'https://www.gbif.org/terms',
    attribution: 'GBIF.org',
    keyEnvVar: null,
    revalidate: 7 * DAY,
    publishedLimits: 'No guaranteed fixed query rate; throttling varies with load and returns HTTP 429.',
    enabled: true,
    accessReviewedOn: '2026-09-19',
    note: 'p. 223: CC BY-NC records are excluded from corporate reuse. Presence-only data - absence of records is not absence of a species.',
  },
  'openaq-v3': {
    id: 'openaq-v3',
    name: 'OpenAQ API v3',
    purpose: 'Measured air pollutant concentrations from monitoring networks.',
    homepage: 'https://openaq.org/',
    docsUrl: 'https://docs.openaq.org/',
    licence: 'Per-source. Only sources flagged commercial-use and redistribution allowed are published.',
    licenceUrl: 'https://docs.openaq.org/about/about',
    attribution: 'OpenAQ and the original monitoring network',
    keyEnvVar: 'OPENAQ_API_KEY',
    revalidate: HOUR,
    publishedLimits: '60 requests/minute and 2,000/hour per key on the free general-use plan.',
    enabled: true,
    accessReviewedOn: '2026-09-19',
    note: 'p. 223: per-source licence flags must be checked individually. Never present an old measurement as live.',
  },

  openalex: {
    id: 'openalex',
    name: 'OpenAlex',
    purpose: 'Scholarly research metadata across climate, energy, nature, ESG and finance.',
    homepage: 'https://openalex.org/',
    docsUrl: 'https://docs.openalex.org/',
    licence: 'CC0 public-domain metadata; article rights remain separate',
    licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    attribution: 'OpenAlex',
    keyEnvVar: 'OPENALEX_API_KEY',
    revalidate: DAY,
    publishedLimits: 'Free key $1 usage/day, no-key $0.10/day. Search costs $0.001/call, list/filter $0.0001/call. 100 req/sec max, per_page max 100.',
    enabled: true,
    accessReviewedOn: '2026-09-19',
    note: 'The key is optional - the no-key tier works but has a smaller daily allowance. p. 212: enforce filter=is_oa:true and do not repeat the obsolete "100,000 calls/day free" claim.',
  },
  doaj: {
    id: 'doaj',
    name: 'DOAJ',
    purpose: 'Articles indexed in the Directory of Open Access Journals.',
    homepage: 'https://doaj.org/',
    docsUrl: 'https://doaj.org/api/v4/docs',
    licence: 'Journal and article metadata CC0; each article licence is separate',
    licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    attribution: 'DOAJ',
    keyEnvVar: null,
    revalidate: DAY,
    publishedLimits: 'Not reverified - p. 213 says the current docs were blocked during review. A conservative 2 requests/second is assumed and the quota must be confirmed before launch.',
    enabled: true,
    accessReviewedOn: '2026-09-19',
    note: 'LAUNCH GATE (p. 213): the numeric quota is unconfirmed. Do not advertise it as unlimited.',
  },
  reliefweb: {
    id: 'reliefweb',
    name: 'ReliefWeb API v2',
    purpose: 'Curated humanitarian reports on climate impacts, resilience and food and water security.',
    homepage: 'https://reliefweb.int/',
    docsUrl: 'https://apidoc.reliefweb.int/',
    licence: 'Free to use; partner reports may be copyrighted',
    licenceUrl: 'https://reliefweb.int/terms-conditions',
    attribution: 'ReliefWeb and the original publishing organisation',
    keyEnvVar: 'RELIEFWEB_APPNAME',
    revalidate: 6 * HOUR,
    publishedLimits: '1,000 calls/day and 1,000 entries/call.',
    // p. 213: a pre-approved appname has been required since 1 November 2025.
    // Verified 2026-09-19: an unregistered appname returns HTTP 403, so this
    // stays off until Enerqa registers one. It is not a secret key.
    enabled: false,
    accessReviewedOn: '2026-09-19',
    note: 'BLOCKED: register an appname at https://reliefweb.int/help/api, set RELIEFWEB_APPNAME, then set enabled to true.',
  },
  osti: {
    id: 'osti',
    name: 'DOE OSTI.GOV API v1',
    purpose: 'DOE-funded energy research reports, datasets and technical outputs.',
    homepage: 'https://www.osti.gov/',
    docsUrl: 'https://www.osti.gov/api/v1/docs',
    licence: 'Public repository access; linked publications have individual rights',
    licenceUrl: 'https://www.osti.gov/disclaim',
    attribution: 'DOE OSTI.GOV',
    keyEnvVar: null,
    revalidate: DAY,
    publishedLimits: 'No fixed published quota. Use a descriptive User-Agent and restrained batching.',
    enabled: true,
    accessReviewedOn: '2026-09-19',
    note: 'NOT VERIFIED LIVE: osti.gov resolves but the TCP connection timed out from the development network on 2026-09-19 (p. 215 records the same during the spec review). The query form is the one documented on p. 215. Confirm before launch.',
  },
  'gbif-literature': {
    id: 'gbif-literature',
    name: 'GBIF Literature API',
    purpose: 'Peer-reviewed literature citing GBIF-mediated biodiversity data.',
    homepage: 'https://www.gbif.org/literature-search',
    docsUrl: 'https://techdocs.gbif.org/en/openapi/v1/literature',
    licence: 'Public access; paper full-text rights are independent',
    licenceUrl: 'https://www.gbif.org/terms',
    attribution: 'GBIF.org literature index',
    keyEnvVar: null,
    revalidate: DAY,
    publishedLimits: 'Dynamic throttling depending on server load; HTTP 429 with no guaranteed fixed rate.',
    enabled: true,
    accessReviewedOn: '2026-09-19',
    note: 'p. 216: require openAccess=true and resolve a real full-text location rather than linking the DOI blindly.',
  },
  'sec-edgar': {
    id: 'sec-edgar',
    name: 'SEC EDGAR',
    purpose: 'Corporate annual, interim and event disclosures for a selected issuer watchlist.',
    homepage: 'https://www.sec.gov/edgar',
    docsUrl: 'https://www.sec.gov/search-filings/edgar-application-programming-interfaces',
    licence: 'U.S. Government content, free to access and reuse; stock art and trademarks excepted',
    licenceUrl: 'https://www.sec.gov/privacy#dissemination',
    attribution: 'U.S. Securities and Exchange Commission (EDGAR)',
    keyEnvVar: null,
    revalidate: 6 * HOUR,
    publishedLimits: 'Maximum 10 requests/second. A declared company and contact User-Agent is required.',
    enabled: true,
    accessReviewedOn: '2026-09-19',
    note: 'p. 217: this is a watchlist, not keyword ESG search. Label results "Corporate disclosure", never news or a market quote.',
  },
};

export function getProvider(id: ProviderId): ProviderRecord {
  return PROVIDERS[id];
}

/** Providers currently switched on. Used by the UI to list live sources. */
export function enabledProviders(): ProviderRecord[] {
  return Object.values(PROVIDERS).filter((p) => p.enabled);
}
