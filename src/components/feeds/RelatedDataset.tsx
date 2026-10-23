import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { relatedIndicators } from '@/lib/data-portal/relatedIndicators';

/** Ranked recommendations share the Explorer's real indicator catalogue. */
export function RelatedDataset({ field, slug }: { field: 'domains' | 'industries'; slug: string }) {
  const indicators = relatedIndicators(field, slug);
  if (!indicators.length) return null;
  return (
    <ol className="m-0 grid max-w-5xl list-none gap-4 p-0 md:grid-cols-2" aria-label="Recommended data indicators">
      {indicators.map((indicator, index) => (
        <li key={indicator.id}>
          <Link href={indicator.href} className="flex h-full flex-col rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--paper-alt)] p-6 hover:border-[var(--green)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-secondary)]">
            <span className="mb-2 text-xs font-bold text-[var(--ink-muted)]">{String(index + 1).padStart(2, '0')} · {indicator.collection}</span>
            <h3 className="mb-2 text-lg font-bold text-[var(--ink)]">{indicator.name}</h3>
            <p className="mb-3 text-sm text-[var(--ink-soft)]">{indicator.why}</p>
            <p className="mb-2 text-xs text-[var(--ink-muted)]">Available observations: {indicator.period.from}–{indicator.period.to} · Country comparisons</p>
            <p className="mb-4 text-xs text-[var(--ink-muted)]">Source: {indicator.source.split(/, (?:uri|publisher|date accessed|date published):/)[0]} · {indicator.licence} · via Gapminder</p>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-secondary)]">Explore this indicator <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
