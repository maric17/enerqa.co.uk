import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload';

/**
 * Redirect register - handoff p. 228.
 *
 * These cover URLs that exist on the CURRENT LIVE enerqa.co.uk site, so that
 * inbound links and search-engine results land on the closest equivalent in the
 * new structure instead of a 404.
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

// /insights/{slug} -> /knowledge-hub/{matching-slug}, mapped article by article
// (p. 228 requires individual mapping, not a blanket rule). Verified against the
// CMS: these five insights have a matching publication record.
const INSIGHT_SLUG_MAP: Record<string, string> = {
  'ghg-emissions-the-burden-on-our-planet':
    'ghg-emissions-the-burden-on-our-planet',
  'driving-climate-action-through-renewable-energy-finance':
    'driving-climate-action-through-renewable-energy-finance-insights-from-an-expert',
  'i-recs-a-catalyst-for-renewable-energy-investment-in-qatar':
    'irecs-a-catalyst-for-renewable-energy-investment-in-qatar',
  'smoking-and-climate-change':
    'the-hidden-link-between-cigarette-smoking-and-climate-change',
  'artisanal-gold-mining-environmental-impacts-of-mercury-use':
    'environmental-impacts-of-mercury-use-in-artisanal-gold-mining-in-africa-sudan-case-the-amplifying-effect-of-torrential-rains-and-floods',
};

const nextConfig: NextConfig = {
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
      ...Object.entries(INSIGHT_SLUG_MAP).map(([from, to]) => ({
        source: `/insights/${from}`,
        destination: `/knowledge-hub/${to}`,
        permanent: true,
      })),
      {
        // The other five insights had no publication equivalent, so they were
        // migrated into Publications keeping their original slug. That means
        // /insights/{slug} maps straight to /knowledge-hub/{same-slug} - every
        // retired article now lands on its own page, not on a list page.
        source: '/insights/:slug',
        destination: '/knowledge-hub/:slug',
        permanent: true,
      },
      {
        source: '/insights',
        destination: '/knowledge-hub',
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
