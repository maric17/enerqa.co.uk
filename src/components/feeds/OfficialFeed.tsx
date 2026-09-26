import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { fetchOfficialUpdates, type OfficialUpdate } from '@/lib/feeds/official';
import type { DomainFeed } from '@/lib/feeds/contextual';
import { SourceUnavailable } from '@/components/ui/SourceUnavailable';
import { FeedMeta, formatDate } from './feedParts';

/**
 * "Coverage: Europe" - p. 214 asks for EIA's "visible U.S./international
 * coverage", p. 216 for EEA to be "transparently labelled Europe-focused".
 * The regions come from the item's own text (p. 179). "Multiple Regions" adds
 * nothing once the regions themselves are listed.
 */
export function coverageLabel(item: Pick<OfficialUpdate, 'coverage'>): string | null {
  const shown = item.coverage.filter((r) => r !== 'Multiple Regions');
  return shown.length > 0 ? shown.join(', ') : null;
}

/**
 * CP/EP/NP/BP official updates. p. 29: organisation, document type and
 * publication date are shown on every item, with a link to the original.
 */
export async function OfficialFeed({
  feed,
  limit = 3,
  nearest,
  emptyNote,
}: {
  feed: DomainFeed;
  limit?: number;
  nearest: { href: string; label: string };
  /** Why a feed may be empty by design, e.g. a provider awaiting registration. */
  emptyNote?: string;
}) {
  const result = await fetchOfficialUpdates(feed, limit);

  if (result.items.length === 0) {
    return <SourceUnavailable sourcesFailed={result.sourcesFailed} nearest={nearest} note={emptyNote} className="min-h-[200px]" />;
  }

  return (
    <div>
      <ul className="flex flex-col gap-4 list-none p-0 m-0">
        {result.items.map((item) => {
          const coverage = coverageLabel(item);
          const facts = [item.organisation, item.docType].filter(Boolean).join(' · ');
          return (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-4 rounded-[var(--r-md)] border border-[var(--line)] bg-white p-6 no-underline transition-shadow hover:shadow-md"
              >
                <div>
                  <h3 className="m-0 mb-2 text-lg font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--color-secondary)] transition-colors">
                    {item.title}
                  </h3>
                  <p className="m-0 text-xs text-[var(--ink-muted)]">
                    <span className="font-semibold text-[var(--ink-soft)]">{facts}</span>
                    {item.publishedAt && (
                      <>
                        {' · '}
                        <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
                      </>
                    )}
                    {coverage && <> · Coverage: {coverage}</>}
                    {/* p. 216: EEA is "transparently labelled Europe-focused". */}
                    {item.focus && <> · {item.focus}</>}
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--color-secondary)]" aria-hidden="true" />
                <span className="sr-only">(opens the original document in a new tab)</span>
              </a>
            </li>
          );
        })}
      </ul>
      <FeedMeta sources={result.sources} retrievedAt={result.retrievedAt} stale={result.stale} />
    </div>
  );
}
