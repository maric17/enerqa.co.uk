import React, { Suspense } from 'react';
import { isNewsItemStale } from '@/lib/api/news';
import { getHomeNews } from './homeNews';
import { GlobalNewsPanel } from './GlobalNewsPanel';
import { HERO_CATEGORIES, formatDateTimeUtc, selectHeroStories, toCard } from './firstFoldNews';

/** Keep the full-height frame and search stable while saved headlines load. */
export function FeedsFallback() {
  return <GlobalNewsPanel loading slides={HERO_CATEGORIES.map(category => ({
    ...category, item: null, sourcesFailed: false, retrievedAt: null,
    delayed: false, stale: false,
  }))} />;
}

export async function FeedsBody() {
  // These are saved database reads. Browsing categories never calls a news provider.
  const pool = await getHomeNews();
  const stories = selectHeroStories(pool.items);
  const slides = HERO_CATEGORIES.map((category, index) => {
    const item = stories[index];
    return {
      ...category,
      item: item ? toCard(item) : null,
      sourcesFailed: pool.sourcesFailed,
      retrievedAt: item ? formatDateTimeUtc(item.feedRefreshedAt ?? item.retrievedAt) : null,
      delayed: item?.provider === 'newsdata',
      stale: item ? isNewsItemStale(item) : false,
    };
  });
  return <GlobalNewsPanel slides={slides} diagnostics={pool.diagnostics} />;
}

export const FirstFoldFeeds = () => (
  <Suspense fallback={<FeedsFallback />}><FeedsBody /></Suspense>
);
