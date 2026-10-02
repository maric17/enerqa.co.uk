'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { NewsCardData } from './firstFoldNews';

// Share only the featured story with the streamed news panel, without fetching twice.
type HeroNewsState = {
  story: NewsCardData | null;
  setStory: React.Dispatch<React.SetStateAction<NewsCardData | null>>;
  backgroundStoryId: string | null;
  setBackgroundStoryId: React.Dispatch<React.SetStateAction<string | null>>;
};
const HeroNewsContext = createContext<HeroNewsState | null>(null);
export const useHeroNews = () => useContext(HeroNewsContext);
export const HERO_ROTATION_MS = 3 * 60 * 1000;

export function HeroNewsProvider({ children }: { children: React.ReactNode }) {
  const [story, setStory] = useState<NewsCardData | null>(null);
  const [backgroundStoryId, setBackgroundStoryId] = useState<string | null>(null);
  return (
    <HeroNewsContext.Provider value={{ story, setStory, backgroundStoryId, setBackgroundStoryId }}>
      {children}
    </HeroNewsContext.Provider>
  );
}

export function HeroNewsBackground() {
  const hero = useHeroNews();
  const story = hero?.story;
  const imageUrl = story?.imageUrl || null;
  const setBackgroundStoryId = hero?.setBackgroundStoryId;
  const [frames, setFrames] = useState<{ loaded: string | null; previous: string | null }>({ loaded: null, previous: null });
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const failed = Boolean(imageUrl && failedUrl === imageUrl);
  const hasImage = Boolean(imageUrl && !failed);

  // The existing video stays a fallback. Defer it so it does not block the page.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hasImage) {
      video.pause();
      return;
    }
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!window.matchMedia('(min-width: 769px)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches || saveData) return;
    const start = () => { video.play().catch(() => {}); };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      video.pause();
    };
  }, [hasImage]);

  // Report the fallback honestly when the selected story has no usable image.
  useEffect(() => {
    if (!hasImage) setBackgroundStoryId?.(null);
    else if (frames.loaded === imageUrl) setBackgroundStoryId?.(story?.id ?? null);
  }, [hasImage, frames.loaded, imageUrl, story?.id, setBackgroundStoryId]);

  const underneath = frames.loaded === imageUrl ? frames.previous : frames.loaded;
  return (
    <div className="hero-news-backdrop" aria-hidden="true">
      <div className="hero-insights-bg" />
      <video
        ref={videoRef} loop muted playsInline preload="none"
        poster="/images/hero-bg.jpg" tabIndex={-1}
        className="hero-insights-video"
      >
        <source src="/videos/video-banner.mp4" type="video/mp4" />
      </video>
      {/* Keep the last loaded frame underneath while the next one loads and fades in. */}
      {hasImage && underneath && (
        <Image key="previous" src={underneath} alt="" fill unoptimized sizes="100vw"
          referrerPolicy="no-referrer" className="hero-news-image" />
      )}
      {hasImage && imageUrl && (
        <Image
          key={imageUrl} src={imageUrl} alt="" fill unoptimized sizes="100vw"
          loading="eager" referrerPolicy="no-referrer"
          className="hero-news-image hero-news-image-incoming"
          style={{ opacity: frames.loaded === imageUrl ? 1 : 0 }}
          onLoad={() => {
            setFrames((old) => old.loaded === imageUrl ? old : { loaded: imageUrl, previous: old.loaded });
            setFailedUrl(null);
            setBackgroundStoryId?.(story?.id ?? null);
          }}
          onError={() => {
            setFailedUrl(imageUrl);
            setBackgroundStoryId?.(null);
          }}
        />
      )}
    </div>
  );
}
