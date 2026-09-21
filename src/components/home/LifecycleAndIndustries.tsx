import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '../ui/Container';

/**
 * H06 Project Development and Lifecycle Support + H07 Industries We Work In
 * (handoff p. 14). Both were missing from the homepage entirely.
 *
 * H06 also closes the last of the six inbound links p. 145 requires to the
 * canonical lifecycle page - the homepage was the only one still missing it.
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
    <section className="bg-[var(--ink)] py-16 text-white lg:py-20">
      <Container>
        <div className="max-w-4xl border-l-4 border-[var(--green)] pl-8 lg:pl-12">
          <h2 className="mb-5 text-[clamp(24px,3vw,34px)] font-bold leading-tight">
            Project Development and Lifecycle Support
          </h2>
          <p className="mb-8 text-[17px] font-light leading-relaxed text-white/80">
            A project can begin with a need, an idea, an existing study or an operating asset. Concept development, feasibility, financing, delivery and performance measurement connect technical analysis with the decisions required at each stage.
          </p>
          <Link
            href="/project-development"
            className="inline-flex items-center gap-2 font-semibold text-[var(--green)] no-underline transition-colors hover:text-white"
          >
            Explore Our Project Development Approach <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </Container>
    </section>

    {/* ---------- H07 Industries We Work In ---------- */}
    <section className="bg-[var(--paper)] py-16 lg:py-20">
      <Container>
        <div className="mb-10 max-w-3xl">
          <h2 className="mb-4 text-[clamp(24px,3vw,34px)] font-bold leading-tight text-[var(--ink)]">
            Industries We Work In
          </h2>
          <p className="m-0 text-[17px] font-light leading-relaxed text-[var(--ink-soft)]">
            The same development discipline can be applied across different sectors, with the evidence, risks and delivery requirements adapted to the industry.
          </p>
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
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--ink-muted)] transition-colors group-hover:text-[var(--green)]" />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  </>
);
