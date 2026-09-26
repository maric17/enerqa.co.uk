import React from 'react';

/**
 * Suspense fallback for an external feed.
 *
 * p. 226: "Loading reserves the card/chart dimensions." The skeleton uses the
 * same grid and card height as the loaded state, so the page does not jump when
 * the feed streams in. The pulse is motion-safe only (p. 228 reduced motion).
 *
 * `mobileCards`: on one column the skeleton should be the height of what
 * usually arrives, not of the maximum. A news panel that reserved three stacked
 * cards (~710px) and then received one card or the empty state (220px) jumped
 * by about 490px on a phone (L516). On wider screens the cards sit in one row,
 * so the row height is the same whether one or three arrive.
 */
const SHOW_FROM = { sm: 'hidden sm:block', md: 'hidden md:block', lg: 'hidden lg:block', xl: 'hidden xl:block' } as const;

export function FeedSkeleton({ cards = 3, mobileCards = cards, columns = 'md:grid-cols-3', cardHeight = 'h-[220px]' }: {
  cards?: number;
  mobileCards?: number;
  columns?: string;
  cardHeight?: string;
}) {
  // The breakpoint at which the grid gains columns, e.g. "md" from "md:grid-cols-3".
  // Whole class names only, so Tailwind's source scan can see them.
  const breakpoint = columns.match(/^(sm|md|lg|xl):/)?.[1] as keyof typeof SHOW_FROM | undefined;
  return (
    <div className={`grid grid-cols-1 ${columns} gap-6`} aria-busy="true">
      <span className="sr-only">Loading updates…</span>
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`${cardHeight} rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--paper-alt)] motion-safe:animate-pulse ${
            i >= mobileCards ? (breakpoint ? SHOW_FROM[breakpoint] : 'hidden') : ''
          }`}
        />
      ))}
    </div>
  );
}

/** "Retrieved 24 Sep 2026, 14:05 UTC" - the Enerqa retrieval time, labelled as such (p. 226). */
export function formatRetrieved(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }) + ' UTC';
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Attribution and age under a feed. p. 226 and p. 229 ask for the sources
 * actually used, and for retrieval time to be labelled separately from each
 * item's own publication date.
 *
 * `stale`: p. 226 "service failures show latest cached items with their age",
 * p. 227 "with a stale-data notice". The connectors work the flag out from the
 * provider's own refresh interval; this is where a reader finally sees it.
 */
export function FeedMeta({ sources, retrievedAt, extra, stale = false }: {
  sources: string[];
  retrievedAt: string | null;
  extra?: string;
  stale?: boolean;
}) {
  if (sources.length === 0) return null;
  const retrieved = formatRetrieved(retrievedAt);
  return (
    <p className="mt-4 text-xs text-[var(--ink-muted)]">
      {stale && (
        <strong className="font-semibold text-[var(--ink-soft)]">
          These are cached items: the source could not be refreshed.{' '}
        </strong>
      )}
      Sources: {sources.join(', ')}.
      {retrieved && <> Retrieved by Enerqa {retrieved}.</>}
      {extra && <> {extra}</>}
    </p>
  );
}
