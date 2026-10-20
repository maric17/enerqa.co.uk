'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import type { NewsDiagnostics } from '@/lib/api/news/diagnostics';
import { Container } from '../ui/Container';
import type { HeroSlide, NewsCardData } from './firstFoldNews';

export const HERO_ROTATION_MS = 8000;
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const prefersReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;

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

/** One full-screen story per category, with keyboard controls and pausable motion. */
export function GlobalNewsPanel({ slides, loading = false, diagnostics }: {
  slides: HeroSlide[];
  loading?: boolean;
  diagnostics?: NewsDiagnostics;
}) {
  // Sparse feeds should open on a real story; empty domains remain selectable.
  const [active, setActive] = useState(() => Math.max(0, slides.findIndex(slide => slide.item)));
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const tabs = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => true);
  const slide = slides[active] ?? slides[0];
  const item = slide?.item;
  const playing = !paused && !reducedMotion && !loading;

  useEffect(() => {
    if (!playing || hovered || slides.length < 2) return;
    const timer = window.setInterval(() => {
      // Avoid moving a story while someone is reading or typing in the search.
      if (!document.hidden && !document.querySelector('.home-hero-search:focus-within')) {
        setActive(index => (index + 1) % slides.length);
      }
    }, HERO_ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [playing, hovered, slides.length, active]);

  useEffect(() => {
    // Keep the selected category visible in the horizontally scrollable mobile strip.
    const tab = tabs.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (tab && tabs.current) tabs.current.scrollLeft = tab.offsetLeft - tabs.current.offsetLeft;
  }, [active]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('newsDebug') !== '1') return;
    console.info('[enerqa:news:homepage]', JSON.stringify({
      viewCounts: Object.fromEntries(slides.map(entry => [entry.key, entry.item ? 1 : 0])), diagnostics,
    }));
  }, [diagnostics, slides]);

  const select = (index: number) => {
    setActive(index);
    setPaused(true);
    const selected = slides[index];
    setAnnouncement(`${selected.label}: ${selected.item?.title ?? (selected.sourcesFailed ? 'This source is temporarily unavailable.' : 'No relevant updates are available.')}`);
  };
  const step = (direction: number) => select((active + direction + slides.length) % slides.length);

  if (!slide) return null;
  return <div className="home-hero-feed" role="group" aria-roledescription="carousel" aria-label="Domain news"
    aria-busy={loading} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={event => {
      // Keep manual reading stable; the play button manages its own focus and state.
      if (!(event.target as HTMLElement).closest('[data-hero-playback]')) setPaused(true);
    }}>
    <SlideImage key={`${item?.id ?? 'empty'}:${item?.imageUrl ?? ''}`} item={item ?? null} />
    <div className="home-hero-shade" aria-hidden="true" />
    <Container className="home-hero-editorial">
      <div className="home-hero-story" role="group" aria-roledescription="slide" aria-label={`${active + 1} of ${slides.length}: ${slide.label}`}>
        <p className="home-hero-eyebrow">Global News</p>
        {loading ? <div className="home-hero-loading" role="status">Loading the latest headlines…</div> : item ? <>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="home-hero-story-link" data-news-card>
            <h2>{item.title}<ArrowUpRight aria-hidden="true" /></h2>
            {item.teaser && <p className="home-hero-teaser">{item.teaser}</p>}
            <span className="sr-only"> (opens the original article in a new tab)</span>
          </a>
          <p className="home-hero-source"><span>{item.publisher}</span>{item.publishedAt && item.dateLabel && <time dateTime={item.publishedAt}>{item.dateLabel}</time>}</p>
          <p className="home-hero-attribution" data-feed-attribution>
            {item.providerLabel && `Via ${item.providerLabel}. `}
            {slide.delayed && 'NewsData free feed delayed 12h+. '}
            {slide.retrievedAt && `Updated ${slide.retrievedAt}. `}
            {slide.stale && 'Cached headline; refresh unavailable. '}
            <Link href="/data-portal/sources">Sources and rights</Link>
          </p>
        </> : <div className="home-hero-empty">
          <h2>{slide.sourcesFailed ? 'This source is temporarily unavailable.' : 'No relevant updates are available.'}</h2>
          <p>{slide.label}</p>
          <Link href={`/knowledge-hub/global-intelligence?theme=${slide.key}`}>Browse Global Intelligence <ArrowUpRight aria-hidden="true" /></Link>
        </div>}
      </div>
      <div className="home-hero-footer">
        <div ref={tabs} className="home-hero-categories" role="group" aria-label="Choose a domain"
          onKeyDown={event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              const index = (active + (event.key === 'ArrowLeft' ? -1 : 1) + slides.length) % slides.length;
              select(index);
              tabs.current?.querySelectorAll('button')[index]?.focus();
            }
          }}>
          {slides.map((category, index) => <button key={category.key} type="button" aria-pressed={index === active}
            disabled={loading} onClick={() => select(index)}>{category.label}</button>)}
        </div>
        <div className="home-hero-controls">
          <Link href="/knowledge-hub/global-intelligence" className="home-hero-view-all">View All News <ArrowUpRight aria-hidden="true" /></Link>
          <span className="home-hero-count" aria-hidden="true">{active + 1} / {slides.length}</span>
          <button type="button" aria-label="Previous headline" disabled={loading} onClick={() => step(-1)}><ArrowLeft aria-hidden="true" /></button>
          <button type="button" aria-label="Next headline" disabled={loading} onClick={() => step(1)}><ArrowRight aria-hidden="true" /></button>
          <button type="button" data-hero-playback aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
            disabled={loading || reducedMotion} onClick={() => setPaused(value => !value)}>{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button>
        </div>
      </div>
    </Container>
    <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
  </div>;
}
