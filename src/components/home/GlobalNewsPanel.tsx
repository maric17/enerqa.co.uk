'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import type { NewsDiagnostics } from '@/lib/api/news/diagnostics';
import { Container } from '../ui/Container';
import type { HeroSlide, NewsCardData } from './firstFoldNews';

export const HERO_ROTATION_MS = 5000;
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const prefersReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;

type Position = { domain: number; article: number };
const storyCount = (slide: HeroSlide) => slide.stories?.length ?? (slide.item ? 1 : 0);

/** Finish a domain's articles before moving to the next domain. */
function advance(slides: HeroSlide[], position: Position, direction: number): Position {
  const article = position.article + direction;
  if (article >= 0 && article < storyCount(slides[position.domain])) return { ...position, article };
  const domain = (position.domain + direction + slides.length) % slides.length;
  return { domain, article: direction > 0 ? 0 : Math.max(0, storyCount(slides[domain]) - 1) };
}

function SlideImage({ item }: { item: NewsCardData | null }) {
  const [failed, setFailed] = useState(false);
  const remote = Boolean(item?.imageUrl && !failed);
  return <Image src={remote ? item!.imageUrl! : '/images/banners/news-thumbnail-fallback.webp'} alt="" fill sizes="100vw"
    unoptimized={remote} loading="eager" referrerPolicy="no-referrer" className="home-hero-image" data-news-slide-image
    onError={() => setFailed(true)} onLoad={event => {
      // Small provider thumbnails cannot fill a screen sharply; use the local image.
      if (remote && event.currentTarget.naturalWidth < Math.min(640, event.currentTarget.clientWidth)) setFailed(true);
    }} />;
}

/** Shared domain/industry stories, with keyboard controls and pausable motion. */
export function GlobalNewsPanel({ slides, loading = false, diagnostics, industry }: {
  slides: HeroSlide[];
  loading?: boolean;
  diagnostics?: NewsDiagnostics;
  /** A sector hero uses one story group and keeps navigation within that industry. */
  industry?: { title: string; slug: string };
}) {
  // Sparse feeds should open on a real story; empty domains remain selectable.
  const [position, setPosition] = useState<Position>(() => ({
    domain: Math.max(0, slides.findIndex(slide => slide.item)), article: 0,
  }));
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const tabs = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => true);
  const active = position.domain;
  const slide = slides[active] ?? slides[0];
  const article = Math.min(position.article, Math.max(0, slide ? storyCount(slide) - 1 : 0));
  const story = slide?.stories?.[article] ?? slide;
  const item = story?.item;
  const canRotate = slides.reduce((total, entry) => total + storyCount(entry), 0) > 1;
  const playing = !paused && !reducedMotion && !loading && canRotate;
  const newsHref = industry
    ? `/knowledge-hub/global-intelligence?industry=${industry.slug}`
    : '/knowledge-hub/global-intelligence';

  useEffect(() => {
    if (!playing || hovered) return;
    const timer = window.setInterval(() => {
      // Avoid moving a story while someone is reading or typing in the search.
      if (!document.hidden && !document.querySelector('.home-hero-search:focus-within')) {
        setPosition(current => advance(slides, current, 1));
      }
    }, HERO_ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [playing, hovered, slides, position]);

  useEffect(() => {
    // Keep the selected category visible in the horizontally scrollable mobile strip.
    const tab = tabs.current?.querySelector<HTMLElement>('[data-domain-tab][aria-pressed="true"]');
    if (tab && tabs.current) tabs.current.scrollLeft = tab.offsetLeft - tabs.current.offsetLeft;
  }, [active]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('newsDebug') !== '1') return;
    console.info('[enerqa:news:homepage]', JSON.stringify({
      viewCounts: Object.fromEntries(slides.map(entry => [entry.key, storyCount(entry)])), diagnostics,
    }));
  }, [diagnostics, slides]);

  const select = (index: number, articleIndex = 0) => {
    setPosition({ domain: index, article: articleIndex });
    setPaused(true);
    const selected = slides[index];
    const selectedItem = selected.stories?.[articleIndex]?.item ?? selected.item;
    setAnnouncement(`${selected.label}: ${selectedItem?.title ?? (selected.sourcesFailed ? 'This source is temporarily unavailable.' : 'No relevant updates are available.')}`);
  };
  const step = (direction: number) => {
    const next = advance(slides, { domain: active, article }, direction);
    select(next.domain, next.article);
  };

  if (!slide) return null;
  return <div className="home-hero-feed" role="group" aria-roledescription="carousel" aria-label={industry ? `${industry.title} news` : 'Domain news'}
    aria-busy={loading} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={event => {
      // Keep manual reading stable; the play button manages its own focus and state.
      if (!(event.target as HTMLElement).closest('[data-hero-playback]')) setPaused(true);
    }}>
    <SlideImage key={`${item?.id ?? 'empty'}:${item?.imageUrl ?? ''}`} item={item ?? null} />
    <div className="home-hero-shade" aria-hidden="true" />
    <Container className="home-hero-editorial">
      <div className="home-hero-story" role="group" aria-roledescription="slide" aria-label={`${slide.label}: article ${article + 1} of ${Math.max(1, storyCount(slide))}`}>
        <p className="home-hero-eyebrow">{industry ? 'Latest industry news' : 'Global News'}</p>
        {loading ? <div className="home-hero-loading" role="status">Loading the latest headlines…</div> : item ? <>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="home-hero-story-link" data-news-card>
            <h2>{item.title}<ArrowUpRight aria-hidden="true" /></h2>
            {item.teaser && <p className="home-hero-teaser">{item.teaser}</p>}
            <span className="sr-only"> (opens the original article in a new tab)</span>
          </a>
          <p className="home-hero-source"><span>{item.publisher}</span>{item.publishedAt && item.dateLabel && <time dateTime={item.publishedAt}>{item.dateLabel}</time>}</p>
          <p className="home-hero-attribution" data-feed-attribution>
            {item.providerLabel && `Via ${item.providerLabel}. `}
            {story.delayed && 'NewsData free feed delayed 12h+. '}
            {story.retrievedAt && `Updated ${story.retrievedAt}. `}
            {story.stale && 'Cached headline; refresh unavailable. '}
            <Link href="/data-portal/sources">Sources and rights</Link>
          </p>
        </> : <div className="home-hero-empty">
          <h2>{slide.sourcesFailed ? 'This source is temporarily unavailable.' : 'No relevant updates are available.'}</h2>
          <p>{slide.label}</p>
          <Link href={industry ? newsHref : `${newsHref}?theme=${slide.key}`}>Browse Global Intelligence <ArrowUpRight aria-hidden="true" /></Link>
        </div>}
      </div>
      <div className="home-hero-footer">
        <div ref={tabs} className="home-hero-categories" role="group" aria-label={industry ? 'Choose a headline' : 'Choose a domain'}
          onKeyDown={event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              const index = (active + (event.key === 'ArrowLeft' ? -1 : 1) + slides.length) % slides.length;
              select(index);
              tabs.current?.querySelectorAll<HTMLButtonElement>('[data-domain-tab]')[index]?.focus();
            }
          }}>
          {slides.map((category, index) => <div key={category.key} className="home-hero-category" data-active={index === active}>
            {/* Equal line segments show the active article and remain keyboard selectable. */}
            <div className="home-hero-article-track" role="group" aria-label={`${category.label} articles`}
              onKeyDown={event => {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                event.preventDefault();
                event.stopPropagation();
                const buttons = [...event.currentTarget.querySelectorAll('button')];
                const current = buttons.indexOf(event.target as HTMLButtonElement);
                const next = (current + (event.key === 'ArrowLeft' ? -1 : 1) + buttons.length) % buttons.length;
                select(index, next);
                buttons[next]?.focus();
              }}>
              {Array.from({ length: storyCount(category) }, (_, articleIndex) => <button
                key={articleIndex} type="button" className="home-hero-article-segment"
                aria-label={`Show ${category.label} article ${articleIndex + 1} of ${storyCount(category)}`}
                aria-pressed={index === active && articleIndex === article} disabled={loading}
                onClick={() => select(index, articleIndex)} />)}
            </div>
            {!industry && <button type="button" className="home-hero-domain-button" data-domain-tab aria-pressed={index === active}
              disabled={loading} onClick={() => select(index)}>{category.label}</button>}
          </div>)}
        </div>
        <div className="home-hero-controls">
          <Link href={newsHref} className="home-hero-view-all">{industry ? 'View All Industry News' : 'View All News'} <ArrowUpRight aria-hidden="true" /></Link>
          <span className="home-hero-count" aria-hidden="true">{item ? article + 1 : 0} / {storyCount(slide)}</span>
          <button type="button" aria-label="Previous headline" disabled={loading || !canRotate} onClick={() => step(-1)}><ArrowLeft aria-hidden="true" /></button>
          <button type="button" aria-label="Next headline" disabled={loading || !canRotate} onClick={() => step(1)}><ArrowRight aria-hidden="true" /></button>
          <button type="button" data-hero-playback aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
            disabled={loading || reducedMotion || !canRotate} onClick={() => setPaused(value => !value)}>{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button>
        </div>
      </div>
    </Container>
    <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
  </div>;
}
