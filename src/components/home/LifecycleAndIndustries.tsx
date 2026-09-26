import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '../ui/Container';
import { Typography } from '../ui/Typography'

/**
 * H06 Project Development and Lifecycle Support + H07 Industries We Work In
 * (handoff p. 14). Both were missing from the homepage entirely.
 *
 * H06 also closes the last of the six inbound links p. 145 requires to the
 * canonical lifecycle page - the homepage was the only one still missing it.
 *
 * Copy is H06's and H07's own text from p. 14, verbatim. (Both used to carry
 * the Domains and Industries overview's O04 / O03 text from pp. 19-20.)
 *
 * Styling follows the existing page rhythm: a dark band using --ink for the
 * lifecycle module, then a light --paper band for the industry list, matching
 * the alternating bands already used further down the page.
 */

const INDUSTRIES = [
  ['Government, Regulators & Public Institutions', 'government-regulators-public-institutions'],
  ['Financial Institutions, Investors & Development Finance', 'financial-institutions-investors-development-finance'],
  ['Energy & Utilities', 'energy-utilities'],
  ['Oil, Gas & Petrochemicals', 'oil-gas-petrochemicals'],
  ['Industry, Manufacturing & Materials', 'industry-manufacturing-materials'],
  ['Infrastructure, Real Estate & Industrial Zones', 'infrastructure-real-estate-industrial-zones'],
  ['Transport, Logistics & Mobility', 'transport-logistics-mobility'],
  ['Water, Waste & Circular Economy', 'water-waste-circular-economy'],
  ['Agriculture, Food & Aquaculture', 'agriculture-food-aquaculture'],
  ['Mining & Natural Resources', 'mining-natural-resources'],
  ['Tourism, Hospitality & Destinations', 'tourism-hospitality-destinations'],
  ['Technology, Telecoms & Data Infrastructure', 'technology-telecoms-data-infrastructure'],
  ['Healthcare, Education & Institutional Estates', 'healthcare-education-institutional-estates'],
] as const;

export const LifecycleAndIndustries = () => (
  <>
    {/* ---------- H06 Project Development and Lifecycle Support ---------- */}
    <section className="bg-[var(--color-paper-alt)] py-16 text-[var(--color-ink)] lg:py-24">
      <Container>
        <div className="max-w-4xl border-l-4 border-[var(--color-primary)] pl-8 lg:pl-12">
          <Typography variant="h2" className="home-h2 mb-5 text-[var(--color-ink)]">
            Project Development and Lifecycle Support
          </Typography>
          <p className="mb-8 text-[17px] leading-relaxed text-[var(--color-ink-soft)]">
            Ideas become practical projects when the opportunity is clearly defined, tested and structured. Concept development, feasibility studies, business and financial modelling, finance preparation and implementation support connect each stage. Clients can engage Enerqa at any point in the lifecycle.
          </p>
          <Link
            href="/project-development"
            className="inline-flex items-center gap-2 font-semibold text-[var(--color-primary-deep)] no-underline transition-colors hover:text-[var(--color-secondary)]"
          >
            Explore Our Project Development Approach <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </Link>
        </div>
      </Container>
    </section>

    {/* ---------- H07 Industries We Work In ---------- */}
    <section className="bg-[var(--paper)] py-16 lg:py-20">
      <Container>
        <div className="mb-10 max-w-3xl">
          <Typography variant="h2" className="home-h2 mb-4 text-[var(--color-ink)]">
            Industries We Work In
          </Typography>
          <p className="m-0 text-[17px] font-light leading-relaxed text-[var(--ink-soft)]">
            Different industries face different operational, resource and investment challenges. Our domains can be applied to public institutions, financial organisations, productive sectors, infrastructure and essential services.
          </p>
          {/* p. 14 H07 action; p. 7 puts the main action below the narrative. */}
          <Link
            href="/domains-and-industries#industries"
            className="mt-5 inline-flex items-center gap-2 font-semibold text-[var(--color-secondary)] no-underline transition-colors hover:text-[var(--ink)]"
          >
            Explore All Industries <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </Link>
        </div>

        {/* p. 7: every one of the 13 industry pages stays directly reachable,
            and p. 20: use equal-status industry links. */}
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map(([name, slug]) => (
            <li key={slug}>
              <Link
                href={`/industries/${slug}`}
                className="group flex h-full items-center justify-between gap-3 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--paper-alt)] px-5 py-4 no-underline transition-colors hover:border-[var(--green)]"
              >
                <span className="text-[14px] font-semibold leading-snug text-[var(--ink)]">{name}</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--ink-muted)] transition-colors group-hover:text-[var(--green)]" />
              </Link>
            </li>
          ))}
        </ul>

      </Container>
    </section>
  </>
);
