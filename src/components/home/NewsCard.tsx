import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { NewsCardData } from './firstFoldNews';

/**
 * One H03 / H04 card (p. 7, p. 13): headline and permitted teaser above a
 * source / date-time / original-link row.
 *
 * p. 15: "Longer headlines wrap within their cards; clamp only teaser
 * summaries, not essential source/time labels." So the headline is never
 * clamped and the meta row never truncates; only the teaser is.
 *
 * No 'use client': the server renders it for H04 and the client panel reuses
 * it for H03.
 */
export function NewsCard({
  item,
  lead = false,
  showTeaser = false,
  marker,
  className = 'h-full',
}: {
  item: NewsCardData;
  lead?: boolean;
  showTeaser?: boolean;
  /** data-* hook for the first-fold geometry check. */
  marker?: string;
  /** Sizing within the parent layout, e.g. flex-1 to share a stacked column. */
  className?: string;
}) {
  // No card box: a bordered, fixed-height box looked empty whenever a provider
  // licensed no teaser. The lead reads as a lead through its size; the rest
  // are rows divided by hairlines (the parent list draws the dividers).
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      data-news-card={marker === 'news' ? '' : undefined}
      data-market-card={marker === 'market' ? '' : undefined}
      className={`group flex ${className} flex-col gap-1.5 no-underline ${lead ? '' : 'py-3 first:pt-0 last:pb-0'}`}
    >
      <h3
        className={`m-0 font-semibold text-[var(--color-dark)] decoration-[var(--color-primary)] decoration-2 underline-offset-4 group-hover:underline ${
          lead ? 'text-[clamp(18px,1.35vw,21px)] leading-[1.3] tracking-[-0.01em]' : 'text-[15px] leading-snug'
        }`}
      >
        {item.title}
      </h3>

      {/* The publisher's own words, only where the provider licenses them.
          GDELT items carry none, so this simply does not render. */}
      {showTeaser && item.teaser && (
        <p className="m-0 line-clamp-2 text-[14px] leading-relaxed text-gray-600">{item.teaser}</p>
      )}

      <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] text-gray-600">
        <span className="font-semibold text-[var(--color-ink-soft)]">{item.publisher}</span>
        {item.publishedAt && item.dateLabel && (
          <time dateTime={item.publishedAt}>{item.dateLabel}</time>
        )}
        <span className="sr-only">(opens the original article in a new tab)</span>
        <ArrowUpRight
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 text-gray-500 transition-colors group-hover:text-[var(--color-primary-deep)]"
        />
      </p>
    </a>
  );
}
