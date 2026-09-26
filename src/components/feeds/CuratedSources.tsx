import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { publishedCuratedSources } from '@/lib/feeds/curated';

/**
 * The curated official source links beside the CP / NP / BP live feed
 * (pp. 29-30, 48-49, 59-60). Static, so it sits outside the feed's Suspense
 * boundary and never waits for a provider. Each link names its organisation and
 * what the page holds; only entries checked open anonymously are listed.
 */
export function CuratedSources({ domainSlug }: { domainSlug: string }) {
  const sources = publishedCuratedSources(domainSlug);
  if (sources.length === 0) return null;

  const headingId = `curated-${domainSlug}`;
  return (
    <div className="mt-8">
      <h3 id={headingId} className="m-0 mb-4 text-lg font-bold text-[var(--ink)]">
        Official source links
      </h3>
      <ul aria-labelledby={headingId} className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full items-start justify-between gap-4 rounded-[var(--r-md)] border border-[var(--line)] bg-white p-5 no-underline transition-shadow hover:shadow-md"
            >
              <span>
                <span className="block text-base font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--color-secondary)] transition-colors">
                  {source.title}
                </span>
                <span className="mt-1 block text-xs text-[var(--ink-muted)]">
                  <span className="font-semibold text-[var(--ink-soft)]">{source.organisation}</span> · {source.docType}
                </span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--color-secondary)]" aria-hidden="true" />
              <span className="sr-only">(opens the organisation&rsquo;s page in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
