'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { NewsBasketKey } from '@/lib/api/news/types';
import { SourceUnavailable } from '../ui/SourceUnavailable';
import { NewsCard } from './NewsCard';
import { NEWS_AREA_HEIGHT, type NewsCardData, type NewsFilter } from './firstFoldNews';

/**
 * H03 filters + cards (p. 13). The five filters now filter THIS panel in place,
 * with a visible and announced active state, instead of linking away to Global
 * Intelligence. Every view arrives pre-built from the server's cached pool, so
 * switching costs no request and cannot fail.
 */

export function NewsFilterBar({
  filters,
  active,
  onSelect,
  disabled = false,
}: {
  filters: NewsFilter[];
  active: NewsBasketKey;
  onSelect?: (key: NewsBasketKey) => void;
  disabled?: boolean;
}) {
  return (
    // Toggle buttons rather than tabs: they narrow one list, they do not
    // switch between separate panels. aria-pressed carries the active state.
    <div role="group" aria-label="Filter global news by theme" className="flex flex-wrap gap-1.5">
      {filters.map((filter) => {
        const isActive = filter.key === active;
        return (
          <button
            key={filter.key}
            type="button"
            aria-pressed={isActive}
            disabled={disabled}
            onClick={() => onSelect?.(filter.key)}
            className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors duration-200 disabled:cursor-default ${
              isActive
                ? 'border-white bg-white/20 text-white shadow-inner'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

/** p. 13 H03 action. p. 7: the main action sits below the narrative. */
function ViewAllNews() {
  return (
    <Link
      href="/knowledge-hub/global-intelligence"
      className="shrink-0 text-[13px] font-semibold text-teal-400 no-underline transition-colors hover:text-teal-300"
    >
      View All News &rarr;
    </Link>
  );
}

/**
 * The H03 column. On wide screens it is a two-row subgrid of the band (see
 * FirstFoldFeeds), so its card row starts on exactly the same line as H04's,
 * however the two narratives wrap. Shared by the loaded panel and the skeleton.
 *
 * Heading and narrative, then the filters with the action beside them. That
 * is the same height as H04's heading and three-line narrative, so neither
 * column pushes the shared row taller (p. 15: the band ends near y 720).
 */
export function NewsColumn({
  head,
  narrative,
  controls,
  children,
}: {
  /** The H03 heading, rendered on the server. */
  head: React.ReactNode;
  /** The p. 13 narrative, rendered on the server. */
  narrative?: React.ReactNode;
  /** The filter group. */
  controls: React.ReactNode;
  /** The card area. */
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby="h03-global-news"
      className="flex flex-col gap-4 text-left lg:row-span-2 lg:grid lg:grid-rows-subgrid bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          {head}
          {narrative}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {controls}
          <ViewAllNews />
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}

export function GlobalNewsPanel({
  head,
  narrative,
  filters,
  views,
  sourcesFailed,
}: {
  head: React.ReactNode;
  narrative?: React.ReactNode;
  filters: NewsFilter[];
  views: Record<NewsBasketKey, NewsCardData[]>;
  /** Every provider failed, as opposed to answering with nothing relevant (p. 226). */
  sourcesFailed: boolean;
}) {
  const [active, setActive] = useState<NewsBasketKey>('all');
  const items = views[active] ?? [];
  // The lead is the first story that carries a licensed teaser, so the large
  // slot is filled; the rest keep their order. GDELT items carry none.
  const leadIndex = Math.max(0, items.findIndex((item) => Boolean(item.teaser)));
  const lead = items[leadIndex];
  const rest = items.filter((_, i) => i !== leadIndex);
  const activeLabel = filters.find((f) => f.key === active)?.label ?? '';

  return (
    <NewsColumn
      head={head}
      narrative={narrative}
      controls={<NewsFilterBar filters={filters} active={active} onSelect={setActive} disabled={sourcesFailed} />}
    >
      {/* Announces the result of a filter change to screen-reader users. */}
      <p aria-live="polite" className="sr-only">
        {active === 'all' ? '' : `${activeLabel}: ${items.length} ${items.length === 1 ? 'story' : 'stories'} shown.`}
      </p>

      {items.length === 0 ? (
        <SourceUnavailable
          variant={sourcesFailed ? 'unavailable' : 'empty'}
          nearest={{ href: '/knowledge-hub/global-intelligence', label: 'browse Global Intelligence' }}
          className={NEWS_AREA_HEIGHT}
        />
      ) : (
        // Lead story on the left, two shorter ones stacked on the right: the
        // "lead story plus two shorter stories" p. 13 fits inside the fold.
        <div className={`grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-[1.15fr_1fr] ${NEWS_AREA_HEIGHT}`}>
          <NewsCard item={lead} lead showTeaser marker="news" className="" />
          {rest.length > 0 && (
            <div className="flex flex-col divide-y divide-white/10 border-t border-white/10 pt-3 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
              {rest.map((item) => (
                <NewsCard key={item.id} item={item} marker="news" className="" />
              ))}
            </div>
          )}
        </div>
      )}
    </NewsColumn>
  );
}
