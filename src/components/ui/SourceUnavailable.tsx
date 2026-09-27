import React from 'react';
import Link from 'next/link';

/**
 * The one shared empty / unavailable state for external feeds.
 *
 * p. 226 separates two cases, and so does this component:
 *  - "empty": the sources answered but nothing relevant came back. The exact
 *    wording is fixed by the spec: "No relevant updates are available."
 *  - "unavailable": the sources themselves failed. We say so honestly, and
 *    p. 4 asks source-unavailable states to "direct visitors to search and the
 *    nearest relevant section".
 *
 * Either way nothing is invented to fill the gap (p. 226: "A temporary failed
 * call does not become fabricated content").
 *
 * Reuse: pass the feed result's own `sourcesFailed` flag and the component
 * picks the case - every aggregator (news, research, official updates) returns
 * one. It has no server-only imports, so client components can use it too:
 *
 *   <SourceUnavailable sourcesFailed={result.sourcesFailed} nearest={...} className="min-h-[220px]" />
 */
export function SourceUnavailable({
  sourcesFailed,
  variant,
  nearest,
  note,
  emptyText,
  className = '',
}: {
  /** The feed's `sourcesFailed` flag. True shows the unavailable state. */
  sourcesFailed?: boolean;
  /** Explicit case, for callers that already decided. `sourcesFailed` wins when both are given. */
  variant?: 'empty' | 'unavailable';
  /** Where to send the visitor instead, e.g. the Global Intelligence listing. */
  nearest?: { href: string; label: string };
  /** Optional one-line context, e.g. which provider is pending registration. */
  note?: string;
  /** Custom empty text for when no results match filters. */
  emptyText?: string;
  /** Pass a min-height here so the empty box keeps the card space (no layout shift). */
  className?: string;
}) {
  const unavailable = sourcesFailed ?? variant === 'unavailable';
  return (
    <div
      // A polite live region: when a streamed feed resolves to this state, a
      // screen-reader user hears it instead of meeting silence.
      role="status"
      className={`flex flex-col items-center justify-center gap-2 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--paper-alt)] p-8 text-center ${className}`}
    >
      <p className="m-0 font-medium text-[var(--ink-soft)]">
        {unavailable ? 'This source is temporarily unavailable.' : emptyText || 'No relevant updates are available.'}
      </p>
      {note && <p className="m-0 text-sm text-[var(--ink-muted)]">{note}</p>}
      {unavailable && (
        <p className="m-0 text-sm text-[var(--ink-muted)]">
          <Link href="/search" className="font-semibold text-[var(--color-secondary)] hover:underline">
            Search the site
          </Link>
          {nearest && (
            <>
              {' '}or{' '}
              <Link href={nearest.href} className="font-semibold text-[var(--color-secondary)] hover:underline">
                {nearest.label}
              </Link>
            </>
          )}
          .
        </p>
      )}
    </div>
  );
}
