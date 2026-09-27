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

const STAGES = [
  { title: 'Needs and Opportunity Assessment', anchor: 'needs-opportunity' },
  { title: 'Idea and Concept Development', anchor: 'idea-concept' },
  { title: 'Pre-Feasibility and Feasibility Studies', anchor: 'feasibility' },
  { title: 'Business and Financial Modelling', anchor: 'business-financial' },
  { title: 'Finance and Partnership Structuring', anchor: 'finance-partnership' },
  { title: 'Design, Tendering and Procurement Support', anchor: 'design-tendering' },
  { title: 'Implementation and Project-Management Support', anchor: 'implementation-management' },
  { title: 'MRV, Monitoring and Evaluation', anchor: 'mrv-monitoring' },
  { title: 'Operational Improvement', anchor: 'operational-improvement' },
  { title: 'Evaluation, Valuation, Transition and Exit', anchor: 'evaluation-transition' },
] as const;

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

// Ring geometry in px, inside a fixed 720x600 box (the xl right column).
const RING = { width: 720, height: 600, cx: 360, cy: 300, r: 180 };

const stageNumber = (index: number) => String(index + 1).padStart(2, '0');
const stageHref = (anchor: string) => `/project-development#${anchor}`;

// Stage 01 sits at the top and the rest follow clockwise, 36 degrees apart.
// Rounded so the server and browser render identical style strings.
const RING_POINTS = STAGES.map((_, index) => {
  const angle = ((-90 + 36 * index) * Math.PI) / 180;
  return {
    x: Math.round((RING.cx + RING.r * Math.cos(angle)) * 10) / 10,
    y: Math.round((RING.cy + RING.r * Math.sin(angle)) * 10) / 10,
  };
});

// Where each label sits: above the top node, below the bottom one, and to the
// outer side of the rest, 30px clear of the node (radius 20).
function ringLabelStyle(index: number): React.CSSProperties {
  const { x, y } = RING_POINTS[index];
  if (index === 0) return { left: x - 80, top: y - 32, width: 160, transform: 'translateY(-100%)', textAlign: 'center' };
  if (index === 5) return { left: x - 90, top: y + 32, width: 180, textAlign: 'center' };
  // The four labels nearest the sides have the least room to the box edge.
  const width = [2, 3, 7, 8].includes(index) ? 150 : 160;
  return index < 5
    ? { left: x + 30, top: y, width, transform: 'translateY(-50%)' }
    : { left: x - 30 - width, top: y, width, transform: 'translateY(-50%)', textAlign: 'right' };
}

const LifecycleRing = () => (
  <div className="relative mx-auto hidden lg:block" style={{ width: RING.width, height: RING.height }}>
    <svg
      className="absolute inset-0"
      width={RING.width}
      height={RING.height}
      viewBox={`0 0 ${RING.width} ${RING.height}`}
      aria-hidden="true"
    >
      <circle cx={RING.cx} cy={RING.cy} r={RING.r} fill="none" className="stroke-primary-deep" strokeOpacity={0.35} strokeWidth={2} />
      <circle cx={RING.cx} cy={RING.cy} r={118} className="fill-white stroke-ink" strokeOpacity={0.06} />
      {/* Chevrons between the nodes show the clockwise direction. */}
      {STAGES.map((stage, index) => (
        <path
          key={stage.anchor}
          d={`M${RING.cx - 3} ${RING.cy - RING.r - 5}l5 5-5 5`}
          fill="none"
          className="stroke-primary-deep"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`rotate(${36 * index + 18} ${RING.cx} ${RING.cy})`}
        />
      ))}
      {RING_POINTS.map(({ x, y }, index) => (
        <g key={STAGES[index].anchor}>
          <circle cx={x} cy={y} r={20} className="fill-ink" />
          <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="fill-white text-[12px] font-bold">
            {stageNumber(index)}
          </text>
        </g>
      ))}
    </svg>
    <p className="absolute left-[260px] top-1/2 m-0 w-[200px] -translate-y-1/2 text-center text-[22px] font-bold leading-tight tracking-[-0.01em]">
      Start at any stage
    </p>
    {/* The <ol> keeps the reading order 01-10 for screen readers; the numbers
        drawn in the SVG are decorative. */}
    <ol className="m-0 list-none p-0">
      {STAGES.map((stage, index) => (
        <li key={stage.anchor}>
          <Link
            href={stageHref(stage.anchor)}
            style={ringLabelStyle(index)}
            className="absolute text-[14px] font-medium leading-[1.35] text-[var(--color-ink)] no-underline transition-colors hover:text-[var(--color-primary-deep)]"
          >
            {stage.title}
          </Link>
        </li>
      ))}
    </ol>
  </div>
);

// Phones and tablets: the same stages down a vertical line.
const LifecycleList = () => (
  <div className="relative lg:hidden">
    <span aria-hidden="true" className="absolute bottom-6 left-5 top-6 w-0.5 -translate-x-1/2 bg-primary-deep/35" />
    <ol className="relative m-0 list-none p-0">
      {STAGES.map((stage, index) => (
        <li key={stage.anchor}>
          {/* min-h-12: a 48px row, above the 44px touch-target minimum. */}
          <Link
            href={stageHref(stage.anchor)}
            className="flex min-h-12 items-center gap-4 py-1.5 text-[15px] font-medium leading-snug text-[var(--color-ink)] no-underline transition-colors hover:text-[var(--color-primary-deep)]"
          >
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-xs font-bold text-white">
              {stageNumber(index)}
            </span>
            {stage.title}
          </Link>
        </li>
      ))}
    </ol>
  </div>
);

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
          <LifecycleRing />
          <LifecycleList />
        </div>
      </Container>
    </section>

    {/* ---------- H07 Industries We Work In ---------- */}
    <section className="bg-[var(--paper)] py-16 lg:py-24">
      <Container>
        <div className="mb-10 grid items-start gap-x-16 gap-y-4 lg:grid-cols-2">
          <Typography variant="h2" className="home-h2 text-[var(--color-ink)]">
            Industries We Work In
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
