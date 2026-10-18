'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import type { NewsBasketKey } from '@/lib/api/news/types';
import type { NewsDiagnostics } from '@/lib/api/news/diagnostics';
import { SourceUnavailable } from '../ui/SourceUnavailable';
import { Button } from '../ui/Button';
import { NEWS_AREA_HEIGHT, type NewsCardData, type NewsFilter } from './firstFoldNews';

export function NewsFilterBar({ filters, active, onSelect, disabled = false }: {
  filters: NewsFilter[];
  active: NewsBasketKey;
  onSelect?: (key: NewsBasketKey) => void;
  disabled?: boolean;
}) {
  return <div role="group" aria-label="Filter global news by theme" className="flex flex-wrap gap-1">
    {filters.map(filter => <Button key={filter.key} type="button" variant="plain" aria-pressed={filter.key === active}
      disabled={disabled} onClick={() => onSelect?.(filter.key)}
      className={`min-h-8 rounded-full border px-2.5 py-1 text-xs disabled:cursor-default ${filter.key === active ? 'border-teal-300/60 bg-teal-300/10 text-teal-200' : 'border-white/20 text-white/80 hover:border-white/50'}`}>
      {filter.label}
    </Button>)}
  </div>;
}

// The same frame is used while the saved feed streams in to avoid layout jumps.
export function NewsColumn({ head, narrative, controls, children }: {
  head: React.ReactNode;
  narrative?: React.ReactNode;
  controls: React.ReactNode;
  children: React.ReactNode;
}) {
  return <section aria-labelledby="h03-global-news" className="first-fold-panel news-panel">
    <div className="news-panel-heading">
      <div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {head}
          <Link href="/knowledge-hub/global-intelligence" className="text-xs font-semibold text-teal-200 hover:underline">View All News &rarr;</Link>
        </div>
        {narrative && <div className="mt-1 hidden xl:block">{narrative}</div>}
      </div>
      <div>{controls}</div>
    </div>
    {children}
  </section>;
}

function SlideImage({ item }: { item: NewsCardData }) {
  const [failed, setFailed] = useState(false);
  return <Image src={!failed && item.imageUrl ? item.imageUrl : '/images/banners/news-thumbnail-fallback.webp'} alt="" fill
    sizes="(min-width: 1280px) 1200px, (min-width: 768px) calc(100vw - 80px), calc(100vw - 48px)"
    unoptimized={Boolean(!failed && item.imageUrl)} loading="eager" referrerPolicy="no-referrer"
    className="object-cover" data-news-slide-image onError={() => setFailed(true)}
    onLoad={event => {
      // A provider can return a signed 140px thumbnail for a 1200px slide.
      // Keep its URL intact and use the sharp local fallback rather than upscale it.
      if (item.imageUrl && !failed && event.currentTarget.naturalWidth < Math.min(640, event.currentTarget.clientWidth)) setFailed(true);
    }} />;
}

export function GlobalNewsPanel({ head, narrative, filters, views, sourcesFailed, diagnostics }: {
  head: React.ReactNode;
  narrative?: React.ReactNode;
  filters: NewsFilter[];
  views: Record<NewsBasketKey, NewsCardData[]>;
  sourcesFailed: boolean;
  diagnostics?: NewsDiagnostics;
}) {
  const [active, setActive] = useState<NewsBasketKey>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const items = views[active] ?? [];
  // An ID survives feed refreshes; if removed, selection returns to the first story.
  const selectedIndex = Math.max(0, items.findIndex(item => item.id === selectedId));
  const featured = items[selectedIndex];
  const activeLabel = filters.find(filter => filter.key === active)?.label ?? '';
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('newsDebug') !== '1') return;
    console.info('[enerqa:news:homepage]', JSON.stringify({ sourcesFailed,
      viewCounts: Object.fromEntries(Object.entries(views).map(([key, cards]) => [key, cards.length])), diagnostics }));
  }, [diagnostics, sourcesFailed, views]);

  const step = (direction: number) => {
    if (items.length > 1) setSelectedId(items[(selectedIndex + direction + items.length) % items.length].id);
  };
  return <NewsColumn head={head} narrative={narrative}
    controls={<NewsFilterBar filters={filters} active={active} disabled={sourcesFailed}
      onSelect={key => { setActive(key); setSelectedId(null); }} />}>
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {active !== 'all' && `${activeLabel}: ${items.length} ${items.length === 1 ? 'story' : 'stories'} shown.`}
      {featured && ` Story ${selectedIndex + 1} of ${items.length}: ${featured.title}`}
    </div>
    {!featured ? <SourceUnavailable variant={sourcesFailed ? 'unavailable' : 'empty'}
      nearest={{ href: '/knowledge-hub/global-intelligence', label: 'browse Global Intelligence' }} className={NEWS_AREA_HEIGHT} /> :
      <div className="news-slideshow" role="group" aria-roledescription="carousel" aria-label="News headlines"
        onKeyDown={event => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1);
          }
        }}>
        <SlideImage key={`${featured.id}:${featured.imageUrl}`} item={featured} />
        <div className="news-slideshow-shade" aria-hidden="true" />
        <a href={featured.url} target="_blank" rel="noopener noreferrer" className="news-slideshow-story" data-news-card>
          <p className="m-0 mb-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-white/90">
            <span className="text-teal-200">{featured.publisher}</span>
            {featured.publishedAt && featured.dateLabel && <time dateTime={featured.publishedAt}>{featured.dateLabel}</time>}
          </p>
          <h3 className="m-0 text-lg font-semibold leading-snug tracking-tight text-white md:text-xl">{featured.title}</h3>
          {featured.teaser && <p className="m-0 mt-2 hidden max-w-3xl text-sm leading-relaxed text-white/90 2xl:line-clamp-1">{featured.teaser}</p>}
          <span className="sr-only"> (opens the original article in a new tab)</span>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="absolute right-4 top-4 h-3 w-3 text-white/80" aria-hidden="true" />
        </a>
        <div className="news-slideshow-controls">
          <span className="mr-1 text-xs tabular-nums text-white/90" aria-hidden="true">{selectedIndex + 1} / {items.length}</span>
          <Button type="button" variant="plain" className="news-slideshow-arrow" aria-label="Previous headline" disabled={items.length < 2} onClick={() => step(-1)}>
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button type="button" variant="plain" className="news-slideshow-arrow" aria-label="Next headline" disabled={items.length < 2} onClick={() => step(1)}>
            <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>}
  </NewsColumn>;
}
