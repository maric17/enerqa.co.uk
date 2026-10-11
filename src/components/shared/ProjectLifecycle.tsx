import React from 'react';
import Link from 'next/link';

// Both pages use the same stage names, links and responsive diagram.
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

// Ring geometry in px, inside a fixed 720x600 box for desktop layouts.
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

export function ProjectLifecycle() {
  return (
    <>
      <LifecycleRing />
      <LifecycleList />
    </>
  );
}
