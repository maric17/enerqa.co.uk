import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { NewsCardData } from './firstFoldNews';
import { NewsThumbnail } from './NewsThumbnail';

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
  active = false,
}: {
  item: NewsCardData;
  lead?: boolean;
  showTeaser?: boolean;
  /** data-* hook for the first-fold geometry check. */
  marker?: string;
  /** Sizing within the parent layout, e.g. flex-1 to share a stacked column. */
  className?: string;
  /** Marks the selected story even when its image uses the fallback background. */
  active?: boolean;
}) {
  const stacked = marker === 'news';
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
      data-background-active={active ? 'true' : undefined}
      className={`group flex ${className} items-start gap-3 no-underline ${stacked ? 'flex-col hero-news-card' : ''} ${lead ? '' : 'py-3 first:pt-0 last:pb-0'} ${active ? 'hero-news-card-active' : ''}`}
    >
      <NewsThumbnail imageUrl={item.imageUrl} lead={lead} stacked={stacked} />
      <div className="flex w-full min-w-0 flex-1 flex-col gap-1.5">
      <h3
        className={`m-0 font-semibold text-white decoration-[var(--color-primary)] decoration-2 underline-offset-4 group-hover:underline ${
          lead ? 'text-[16px] leading-[1.3] tracking-[-0.01em]' : stacked ? 'text-[13px] leading-snug' : 'text-[14px] leading-snug'
        }`}
      >
        {item.title}
      </h3>

      {/* The publisher's own words, only where the provider licenses them.
          GDELT items carry none, so this simply does not render. */}
      {showTeaser && item.teaser && (
        <p className="m-0 line-clamp-2 text-[14px] leading-relaxed text-white/70">{item.teaser}</p>
      )}

      <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] text-white/70">
        <span className="font-semibold text-teal-300">{item.publisher}</span>
        {item.publishedAt && item.dateLabel && (
          <time dateTime={item.publishedAt}>{item.dateLabel}</time>
        )}
        <span className="sr-only">(opens the original article in a new tab)</span>
        <ArrowUpRight
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 text-white/50 transition-colors group-hover:text-teal-200"
        />
      </p>
      {/* Reserve the badge space so changing the active image cannot move the headlines. */}
      {marker === 'news' && <span className="hero-news-active-label" aria-hidden={!active} style={{ visibility: active ? 'visible' : 'hidden' }}>Featured story</span>}
      </div>
    </a>
  );
}
