'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { NewsBasketKey } from '@/lib/api/news/types';
import type { NewsDiagnostics } from '@/lib/api/news/diagnostics';
import { SourceUnavailable } from '../ui/SourceUnavailable';
import { NewsCard } from './NewsCard';
import { NEWS_AREA_HEIGHT, type NewsCardData, type NewsFilter } from './firstFoldNews';
import { HERO_ROTATION_MS, useHeroNews } from './HeroNewsBackground';

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
  backgroundControls,
  children,
  onMouseEnter,
  onMouseLeave,
  onFocusCapture,
  onBlurCapture,
}: {
  /** The H03 heading, rendered on the server. */
  head: React.ReactNode;
  /** The p. 13 narrative, rendered on the server. */
  narrative?: React.ReactNode;
  /** The filter group. */
  controls: React.ReactNode;
  /** Optional image controls belong in the heading row, keeping both panels aligned. */
  backgroundControls?: React.ReactNode;
  /** The card area. */
  children: React.ReactNode;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onFocusCapture?: React.FocusEventHandler<HTMLElement>;
  onBlurCapture?: React.FocusEventHandler<HTMLElement>;
}) {
  return (
    <section
      aria-labelledby="h03-global-news"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
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
        {backgroundControls}
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
  diagnostics,
}: {
  head: React.ReactNode;
  narrative?: React.ReactNode;
  filters: NewsFilter[];
  views: Record<NewsBasketKey, NewsCardData[]>;
  /** Every provider failed, as opposed to answering with nothing relevant (p. 226). */
  sourcesFailed: boolean;
  diagnostics?: NewsDiagnostics;
}) {
  const [active, setActive] = useState<NewsBasketKey>('all');
  useEffect(() => {
    // Opt in per browser visit; this summary contains no server credentials.
    if (new URLSearchParams(window.location.search).get('newsDebug') !== '1') return;
    console.info('[enerqa:news:homepage]', JSON.stringify({
      sourcesFailed,
      viewCounts: Object.fromEntries(Object.entries(views).map(([key, cards]) => [key, cards.length])),
      diagnostics,
    }));
  }, [diagnostics, sourcesFailed, views]);
  const items = useMemo(() => views[active] ?? [], [views, active]);
  // The lead is the first story that carries a licensed teaser, so the large
  // slot is filled; the rest keep their order. GDELT items carry none.
  const leadIndex = Math.max(0, items.findIndex((item) => Boolean(item.teaser)));
  const lead = items[leadIndex];
  const rest = items.filter((_, i) => i !== leadIndex);
  const activeLabel = filters.find((f) => f.key === active)?.label ?? '';
  const hero = useHeroNews();
  const setStory = hero?.setStory;
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hidden, setHidden] = useState(false);
  // Start with the same lead displayed in the panel; do not reorder headlines during rotation.
  const stories = useMemo(() => items.length ? [items[leadIndex], ...items.filter((_, i) => i !== leadIndex)] : [], [items, leadIndex]);
  const featuredIndex = Math.max(0, stories.findIndex((item) => item.id === featuredId));
  const featured = stories[featuredIndex] ?? null;

  useEffect(() => {
    if (!setStory) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(motion.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateMotion();
    updateVisibility();
    motion.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      motion.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, [setStory]);

  // A refreshed pool or a new theme starts again with its lead story.
  useEffect(() => { setFeaturedId(null); }, [items]);
  useEffect(() => {
    setStory?.(featured);
  }, [featured, setStory]);
  useEffect(() => () => setStory?.(null), [setStory]);

  useEffect(() => {
    if (!setStory || stories.length < 2 || paused || hovered || focused || reducedMotion || hidden) return;
    const timer = window.setInterval(() => {
      setFeaturedId(stories[(featuredIndex + 1) % stories.length].id);
    }, HERO_ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [setStory, stories, featuredIndex, paused, hovered, focused, reducedMotion, hidden]);

  const backgroundControls = hero && stories.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-white/80" role="group" aria-label="News background controls">
          <span>{hero.backgroundStoryId ? 'Background' : 'Default background'} {featuredIndex + 1} / {stories.length}</span>
          {stories.map((item, index) => (
            <button
              key={item.id} type="button"
              aria-label={`Show background for ${item.title}`}
              aria-pressed={featured?.id === item.id}
              onClick={() => { setFeaturedId(item.id); setPaused(true); }}
              className={`hero-news-selector ${featured?.id === item.id ? 'is-active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
          {stories.length > 1 && !reducedMotion && (
            <button type="button" className="hero-news-pause" onClick={() => setPaused(!paused)}
              aria-label={paused ? 'Resume news background rotation' : 'Pause news background rotation'}>
              {paused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>
  ) : null;

  return (
    <NewsColumn
      head={head}
      narrative={narrative}
      controls={<NewsFilterBar filters={filters} active={active} onSelect={setActive} disabled={sourcesFailed} />}
      backgroundControls={backgroundControls}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
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
          <NewsCard item={lead} lead showTeaser marker="news" className="" active={featured?.id === lead.id} />
          {rest.length > 0 && (
            <div className="flex flex-col divide-y divide-white/10 border-t border-white/10 pt-3 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
              {rest.map((item) => (
                <NewsCard key={item.id} item={item} marker="news" className="" active={featured?.id === item.id} />
              ))}
            </div>
          )}
        </div>
      )}
    </NewsColumn>
  );
}
