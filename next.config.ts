import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload';

/**
 * Redirect register - handoff p. 228.
 *
 * These cover the URLs in the current live site's sitemap
 * (https://www.enerqa.co.uk/sitemap.xml, 29 URLs) plus the /services and
 * /insights trees named on p. 228, so that inbound links and search results
 * land on the closest equivalent in the new structure instead of a 404.
 *
 * `permanent: true` sends HTTP 308, not 301. Next.js uses 307/308 rather than
 * 302/301 because they preserve the request method - a 301 lets browsers turn a
 * POST into a GET. For search engines 308 carries the same "permanent" meaning.
 *
 * Two rules from p. 228 that shaped this list:
 *   - Do not redirect every retired URL to the homepage.
 *   - Do not leave redirect chains: every destination below is a real page, not
 *     itself a redirect source.
 */

// The live site's ten blog articles, mapped article by article (p. 228:
// "Deduplicate and map each article individually"). The same slugs were used
// under the retired /insights library, so each entry produces two rules: the
// live root path (e.g. /smoking-and-climate-change, from the live
// sitemap.xml) and /insights/{slug}. Every value is a real publication slug in
// the CMS - `i-recs-...` keeps its hyphen, which the earlier `irecs-...` entry
// dropped, so that redirect ended on a 404.
const LIVE_ARTICLE_MAP: Record<string, string> = {
  'weathering-the-storm-climate-resilience-in-supply-chains':
    'weathering-the-storm-climate-resilience-in-supply-chains',
  'climate-forcers-the-hidden-drivers-of-global-warming':
    'climate-forcers-the-hidden-drivers-of-global-warming',
  'climate-change-and-war-a-complex-interplay':
    'climate-change-and-war-a-complex-interplay',
  'breathing-vs-burning-the-carbon-footprint-contrast':
    'breathing-vs-burning-the-carbon-footprint-contrast',
  'ghg-emissions-the-burden-on-our-planet':
    'ghg-emissions-the-burden-on-our-planet',
  'driving-climate-action-through-renewable-energy-finance':
    'driving-climate-action-through-renewable-energy-finance-insights-from-an-expert',
  'i-recs-a-catalyst-for-renewable-energy-investment-in-qatar':
    'i-recs-a-catalyst-for-renewable-energy-investment-in-qatar',
  'smoking-and-climate-change':
    'the-hidden-link-between-cigarette-smoking-and-climate-change',
  // The live 2019 post is an earlier text on the same subject; the archive's
  // 2024 article is its closest page on the new site.
  'artisanal-gold-mining-environmental-impacts-of-mercury-use':
    'environmental-impacts-of-mercury-use-in-artisanal-gold-mining-in-africa-sudan-case-the-amplifying-effect-of-torrential-rains-and-floods',
  // Not in the 2024 archive. The live post is re-created as a publication by
  // scripts/add-sudan-energy-balance.ts (idempotent); until that has run, this
  // destination is a 404.
  'sudan-s-energy-balance-2020': 'sudan-s-energy-balance-2020',
};

// The live site's service pages (their URLs carry a platform hash suffix) ->
// the capability section on the new domain page that covers the same work.
// Anchors are the capability slugs rendered as section ids on /domains/{slug}.
const LIVE_SERVICE_MAP: Record<string, string> = {
  // "Climate Action (Mitigation and Adaptation)"
  '/climate-action':
    '/domains/climate-action-carbon-management#climate-strategy-mitigation-adaptation',
  // "Carbon Credits and Climate Finance" - leads with carbon-credit projects
  '/climate-finance00addb8a':
    '/domains/climate-action-carbon-management#carbon-markets-carbon-credit-projects',
  // "Transparency and Reporting" - carbon footprints and MRV systems
  '/transparency-and-reporting3e3b6802':
    '/domains/climate-action-carbon-management#mrv-transparency-ndc-tracking',
  '/esg-reporting3a6ba322':
    '/domains/sustainable-business-esg-finance#esg-strategy-readiness-reporting',
  '/environmental-assessmentsfdf0fdc5':
    '/domains/environment-nature-circularity#esia-strategic-assessment-safeguards',
  // "Energy Management and Projects Development" - audits, EnMS / ISO 50001
  '/energy-managementb2a794ed':
    '/domains/energy-systems-transition#energy-management-iso-50001',
  '/renewable-energy-projects-developmentd0ee06c4':
    '/domains/energy-systems-transition#renewable-energy-project-development',
  '/green-credit-linesbfa2801d':
    '/domains/sustainable-business-esg-finance#sustainable-finance-green-credit-lines',
  // "Supporting Studies and M&E Frameworks" - its first section is business
  // models and feasibility; M&E is the next capability on the same page.
  '/supporting-studies-and-m-e-frameworks-development':
    '/domains/sustainable-business-esg-finance#feasibility-studies-business-models',
};

// The live site's per-domain contact pages -> the contact form with that
// domain preselected (the form reads ?domain=, p. 198 F02).
const LIVE_CONTACT_MAP: Record<string, string> = {
  '/contact---climate-change': '/contact?domain=climate-action-carbon-management',
  '/contact---energy': '/contact?domain=energy-systems-transition',
  '/copy-of-contact---environment': '/contact?domain=environment-nature-circularity',
  '/contact---business-solutions': '/contact?domain=sustainable-business-esg-finance',
};

const nextConfig: NextConfig = {
  experimental: {
    // Serves app/global-not-found.tsx (site header, footer and search) for a
    // URL that matches no route. The app has two root layouts ((frontend) and
    // (payload)), so without this Next shows its bare default 404.
    globalNotFound: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },

  async redirects() {
    return [
      // --- Retired /services tree -> domains (p. 228) ---
      {
        source: '/services/climate-change',
        destination: '/domains/climate-action-carbon-management',
        permanent: true,
      },
      {
        source: '/services/energy',
        destination: '/domains/energy-systems-transition',
        permanent: true,
      },
      {
        // p. 228 leaves this one open: "Review environment vs ESG destination -
        // choose closest equivalent after content split". The retired page's own
        // content decides it: its sections are ESG readiness, GRI/SASB
        // frameworks, materiality assessment and ESG reporting - no environmental
        // or nature content. So it maps to the ESG domain, not Environment.
        source: '/services/environment-esg',
        destination: '/domains/sustainable-business-esg-finance',
        permanent: true,
      },
      {
        source: '/services/business-solutions',
        destination: '/domains/sustainable-business-esg-finance',
        permanent: true,
      },
      {
        // Listed last of the /services rules so the specific children above win.
        source: '/services',
        destination: '/domains-and-industries',
        permanent: true,
      },

      // --- Retired first-party article library -> Knowledge Hub (p. 225, 228) ---
      // Article-level rules first; the catch-all below only handles what is left.
      ...Object.entries(LIVE_ARTICLE_MAP).flatMap(([from, to]) => [
        { source: `/${from}`, destination: `/knowledge-hub/${to}`, permanent: true },
        { source: `/insights/${from}`, destination: `/knowledge-hub/${to}`, permanent: true },
      ]),
      {
        // Any other /insights/{slug} keeps its slug: the orphan insights were
        // migrated into Publications under their original slugs.
        source: '/insights/:slug',
        destination: '/knowledge-hub/:slug',
        permanent: true,
      },
      {
        source: '/insights',
        destination: '/knowledge-hub',
        permanent: true,
      },
      {
        // The live site's article index.
        source: '/blog',
        destination: '/knowledge-hub',
        permanent: true,
      },

      // --- The live site's service, contact and newsletter pages (p. 228:
      // "Review the current live site's full URL inventory") ---
      ...Object.entries(LIVE_SERVICE_MAP).map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      ...Object.entries(LIVE_CONTACT_MAP).map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      {
        // The live page is a sign-up form ("Stay up to date"). Its closest
        // equivalent is the K06 Stay Informed form (p. 156), which carries this
        // id; /newsletter/unsubscribe does the opposite job.
        source: '/newsletter-subscription',
        destination: '/knowledge-hub#stay-informed',
        permanent: true,
      },
      {
        // Careers is conditional (p. 171) and currently switched off, so the
        // closest live page is About, not a 404.
        source: '/careers',
        destination: '/about',
        permanent: true,
      },

      // --- Removed surfaces (p. 225: no project / experience / case-study
      // sections anywhere; p. 4: team information lives inside About) ---
      {
        source: '/projects',
        destination: '/domains-and-industries',
        permanent: true,
      },
      {
        source: '/team',
        destination: '/about',
        permanent: true,
      },
    ];
  },
};

export default withPayload(nextConfig);
