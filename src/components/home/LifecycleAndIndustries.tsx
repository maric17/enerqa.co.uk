import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Banknote,
  Building2,
  Factory,
  Fuel,
  Hospital,
  Landmark,
  Pickaxe,
  RadioTower,
  Recycle,
  TreePalm,
  Truck,
  Wheat,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Container } from '../ui/Container';
import { Typography } from '../ui/Typography'
import { ProjectLifecycle } from '../shared/ProjectLifecycle';

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
 * H06 draws the ten-stage lifecycle as a ring, because the copy's point is
 * that clients can join at any stage. The stage names and anchors are the
 * lifecycle page's own (project-development/page.tsx). Below lg the ring has
 * no room for its labels, so the same stages show as a numbered vertical list.
 *
 * H07 keeps all 13 industries the same size and weight (p. 20: equal-status
 * industry links); the icon only helps people find their sector at a glance.
 */

const INDUSTRIES: { name: string; slug: string; Icon: LucideIcon }[] = [
  { name: 'Government, Regulators & Public Institutions', slug: 'government-regulators-public-institutions', Icon: Landmark },
  { name: 'Financial Institutions, Investors & Development Finance', slug: 'financial-institutions-investors-development-finance', Icon: Banknote },
  { name: 'Energy & Utilities', slug: 'energy-utilities', Icon: Zap },
  { name: 'Oil, Gas & Petrochemicals', slug: 'oil-gas-petrochemicals', Icon: Fuel },
  { name: 'Industry, Manufacturing & Materials', slug: 'industry-manufacturing-materials', Icon: Factory },
  { name: 'Infrastructure, Real Estate & Industrial Zones', slug: 'infrastructure-real-estate-industrial-zones', Icon: Building2 },
  { name: 'Transport, Logistics & Mobility', slug: 'transport-logistics-mobility', Icon: Truck },
  { name: 'Water, Waste & Circular Economy', slug: 'water-waste-circular-economy', Icon: Recycle },
  { name: 'Agriculture, Food & Aquaculture', slug: 'agriculture-food-aquaculture', Icon: Wheat },
  { name: 'Mining & Natural Resources', slug: 'mining-natural-resources', Icon: Pickaxe },
  { name: 'Tourism, Hospitality & Destinations', slug: 'tourism-hospitality-destinations', Icon: TreePalm },
  { name: 'Technology, Telecoms & Data Infrastructure', slug: 'technology-telecoms-data-infrastructure', Icon: RadioTower },
  { name: 'Healthcare, Education & Institutional Estates', slug: 'healthcare-education-institutional-estates', Icon: Hospital },
];

export const LifecycleAndIndustries = () => (
  <>
    {/* ---------- H06 Project Development and Lifecycle Support ---------- */}
    <section className="bg-[var(--color-paper-alt)] py-16 text-[var(--color-ink)] lg:py-24">
      <Container>
        {/* lg: text above the ring. xl: side by side (the ring needs 720px). */}
        <div className="grid items-center gap-10 xl:grid-cols-[440px_1fr]">
          <div className="max-w-2xl">
            <Typography variant="h2" className="home-h2 mb-5 text-[var(--color-ink)]">
              Project Development and Lifecycle Support
            </Typography>
            <p className="mb-6 text-[17px] font-light leading-relaxed text-[var(--color-ink-soft)]">
              Ideas become practical projects when the opportunity is clearly defined, tested and structured. Concept development, feasibility studies, business and financial modelling, finance preparation and implementation support connect each stage. Clients can engage Enerqa at any point in the lifecycle.
            </p>
            {/* Inline, not flex, with the last word and the arrow held
                together: on phones the label wraps as "... Development /
                Approach ->" instead of stranding the arrow. */}
            <Link
              href="/project-development"
              className="font-semibold text-[var(--color-primary-deep)] no-underline transition-colors hover:text-[var(--color-ink)]"
            >
              Explore Our Project Development{' '}
              <span className="whitespace-nowrap">
                Approach <ArrowRight aria-hidden="true" className="inline h-5 w-5 align-[-4px]" />
              </span>
            </Link>
          </div>
          <ProjectLifecycle />
        </div>
      </Container>
    </section>

    {/* ---------- H07 Industries We Work In ---------- */}
    <section className="bg-[var(--paper)] py-16 lg:py-24">
      <Container>
        <div className="mb-10 grid items-start gap-x-16 gap-y-4 lg:grid-cols-2">
          <Typography variant="h2" className="home-h2 text-[var(--color-ink)]">
            Industries
          </Typography>
          <div>
            <p className="m-0 text-[17px] font-light leading-relaxed text-[var(--ink-soft)]">
              Different industries face different operational, resource and investment challenges. Our domains can be applied to public institutions, financial organisations, productive sectors, infrastructure and essential services.
            </p>
            {/* p. 14 H07 action; p. 7 puts the main action below the narrative.
                Deep teal to match H06's link (it was secondary blue). */}
            <Link
              href="/domains-and-industries#industries"
              className="mt-4 inline-flex items-center gap-2 font-semibold text-[var(--color-primary-deep)] no-underline transition-colors hover:text-[var(--color-ink)]"
            >
              Explore All Industries <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* p. 7: every one of the 13 industry pages stays directly reachable.
            CSS columns fill top to bottom (5/4/4 at lg), so the reading order
            is unchanged and no item sits alone on a last row. */}
        <ul className="m-0 list-none gap-x-10 p-0 md:columns-2 lg:columns-3">
          {INDUSTRIES.map(({ name, slug, Icon }) => (
            <li key={slug} className="break-inside-avoid">
              <Link
                href={`/industries/${slug}`}
                className="flex items-center gap-4 border-t border-[var(--line)] py-3.5 text-[16px] font-semibold leading-snug text-[var(--ink)] no-underline transition-colors hover:text-[var(--color-primary-deep)]"
              >
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--paper-alt)] text-[var(--color-primary-deep)]">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} />
                </span>
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  </>
);
