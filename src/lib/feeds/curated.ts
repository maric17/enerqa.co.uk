import type { ProviderId } from '@/lib/api/core/types';

/**
 * Curated official source links for the CP / NP / BP modules.
 *
 * The handoff asks for these in so many words, alongside the live feed:
 *   p. 29 (CP)  "Curate verified open-access official UNFCCC NDC/BTR
 *               submissions, IPCC releases and climate-finance institutions."
 *   p. 30       "UNFCCC and official country submissions (curated source
 *               links; document API not yet selected); IPCC official
 *               news/reports (curated source links)"
 *   p. 48 (NP)  "Curate CBD, UNEP and national environment-authority links
 *               where relevant."
 *   p. 59 (BP)  "Curate verified open-access finance-regulator and taxonomy
 *               sources." p. 60: "Official finance regulators, central banks
 *               and standards bodies (curated/source-filtered)"
 *
 * Each entry is the organisation's own page, labelled with the organisation's
 * own title for it. Nothing here is a summary or a claim about content.
 *
 * `check` records the anonymous-access check (p. 209: "HTTP 200 ... alone is
 * insufficient" and "CAPTCHA-blocked or uncertain destinations remain
 * unpublished pending human review"). Only `open` entries are shown. An entry
 * marked `blocked` answered our checker with a bot challenge, so its content
 * could not be confirmed; a person must open it in a browser and flip it to
 * `open` before it publishes.
 *
 * Not included, deliberately: "national energy authorities and regulators"
 * (p. 37) and "national environment-authority links" (p. 48). Which nations are
 * "relevant" is an editorial decision the handoff does not make, so no country
 * list is guessed here.
 */
export type CuratedSource = {
  organisation: string;
  /** The page's own title. */
  title: string;
  /** What the page holds, stated plainly (p. 29: "document type"). */
  docType: string;
  url: string;
  pdfPage: number;
  check: { on: string; result: 'open' | 'blocked' };
};

export const CURATED_SOURCES: Record<string, CuratedSource[]> = {
  'climate-action-carbon-management': [
    {
      organisation: 'UNFCCC',
      title: 'NDC Registry',
      docType: 'Country submissions',
      url: 'https://unfccc.int/NDCREG',
      pdfPage: 29,
      // HTTP 200, but the body is an Incapsula bot challenge ("Request
      // unsuccessful"), so the page itself was not seen.
      check: { on: '2026-09-25', result: 'blocked' },
    },
    {
      organisation: 'UNFCCC',
      title: 'First Biennial Transparency Reports',
      docType: 'Country submissions',
      url: 'https://unfccc.int/first-biennial-transparency-reports',
      pdfPage: 29,
      check: { on: '2026-09-25', result: 'blocked' },
    },
    {
      organisation: 'IPCC',
      title: 'Reports',
      docType: 'Assessment and special reports',
      url: 'https://www.ipcc.ch/reports/',
      pdfPage: 29,
      check: { on: '2026-09-25', result: 'open' },
    },
    {
      organisation: 'Green Climate Fund',
      title: 'Portfolio Explorer',
      docType: 'Funded projects',
      url: 'https://www.greenclimate.fund/portfolio',
      pdfPage: 29,
      check: { on: '2026-09-25', result: 'open' },
    },
    {
      organisation: 'Global Environment Facility',
      title: 'Projects',
      docType: 'Funded projects',
      url: 'https://www.thegef.org/projects-operations/database',
      pdfPage: 29,
      check: { on: '2026-09-25', result: 'open' },
    },
    {
      organisation: 'Adaptation Fund',
      title: 'Funded Projects & Programmes',
      docType: 'Funded projects',
      url: 'https://www.adaptation-fund.org/projects-programmes/',
      pdfPage: 29,
      check: { on: '2026-09-25', result: 'open' },
    },
  ],
  'environment-nature-circularity': [
    {
      organisation: 'Convention on Biological Diversity',
      title: 'Kunming-Montreal Global Biodiversity Framework',
      docType: 'Framework',
      url: 'https://www.cbd.int/gbf',
      pdfPage: 48,
      check: { on: '2026-09-25', result: 'open' },
    },
    {
      organisation: 'Convention on Biological Diversity',
      title: 'National Biodiversity Strategies and Action Plans (NBSAPs)',
      docType: 'Country submissions',
      url: 'https://www.cbd.int/nbsap',
      pdfPage: 48,
      check: { on: '2026-09-25', result: 'open' },
    },
    {
      organisation: 'UN Environment Programme',
      title: 'UNEP - UN Environment Programme',
      docType: 'Organisation home page',
      url: 'https://www.unep.org/',
      pdfPage: 48,
      // The home page opens. unep.org/resources (the publications list) sits
      // behind a Cloudflare challenge, so it is not linked.
      check: { on: '2026-09-25', result: 'open' },
    },
  ],
  'sustainable-business-esg-finance': [
    {
      organisation: 'European Commission',
      title: 'EU taxonomy for sustainable activities',
      docType: 'Taxonomy',
      url: 'https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en',
      pdfPage: 59,
      check: { on: '2026-09-25', result: 'open' },
    },
    {
      organisation: 'IFRS Foundation',
      title: 'IFRS Sustainability Standards Navigator',
      docType: 'Disclosure standards',
      url: 'https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/',
      pdfPage: 60,
      check: { on: '2026-09-25', result: 'open' },
    },
    {
      organisation: 'Network for Greening the Financial System',
      title: 'NGFS website',
      docType: 'Central banks and supervisors',
      url: 'https://www.ngfs.net/en',
      pdfPage: 60,
      check: { on: '2026-09-25', result: 'open' },
    },
  ],
};

/** The entries that may be shown: checked open, never merely "returned 200". */
export function publishedCuratedSources(domainSlug: string): CuratedSource[] {
  return (CURATED_SOURCES[domainSlug] ?? []).filter((s) => s.check.result === 'open');
}

/**
 * I{nn}D / CD "canonical catalogue links" (p. 65: "If no geographically
 * relevant licensed dataset is available, replace the preview with relevant
 * canonical catalogue links, not a sample statistic").
 *
 * The provider's own public data catalogue for each "Recommended numerical
 * source", labelled with that page's own title and listed only once it has been
 * opened anonymously (p. 209). GBIF's site (www.gbif.org) answers automated
 * checks with a Cloudflare challenge (HTTP 403), so it waits for a person to
 * confirm it in a browser.
 */
export type CatalogueLink = { title: string; url: string; checkedOn: string };

export const CATALOGUE_LINKS: Partial<Record<ProviderId, CatalogueLink>> = {
  'climate-trace': { title: 'Climate TRACE', url: 'https://climatetrace.org/', checkedOn: '2026-09-25' },
  'world-bank-indicators': { title: 'World Bank Open Data', url: 'https://data.worldbank.org/', checkedOn: '2026-09-25' },
  'oecd-sdmx': { title: 'OECD Data Explorer', url: 'https://data-explorer.oecd.org/', checkedOn: '2026-09-25' },
  'eia-open-data': { title: 'U.S. Energy Information Administration Open Data', url: 'https://www.eia.gov/opendata/', checkedOn: '2026-09-25' },
  'nasa-power': { title: 'NASA POWER', url: 'https://power.larc.nasa.gov/', checkedOn: '2026-09-25' },
  'openaq-v3': { title: 'OpenAQ', url: 'https://openaq.org/', checkedOn: '2026-09-25' },
};

/** The checked catalogue links for a page's recommended sources, in the spec's order, without repeats. */
export function catalogueLinks(providers: readonly string[]): CatalogueLink[] {
  const seen = new Set<string>();
  return providers.flatMap((id) => {
    const link = CATALOGUE_LINKS[id as ProviderId];
    if (!link || seen.has(link.url)) return [];
    seen.add(link.url);
    return [link];
  });
}
