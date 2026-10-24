import React, { Suspense } from 'react';
import { isNewsItemStale } from '@/lib/api/news';
import { getHomeNews } from './homeNews';
import { GlobalNewsPanel } from './GlobalNewsPanel';
import { HERO_CATEGORIES, formatDateTimeUtc, selectHeroStoryGroups, toCard } from './firstFoldNews';

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
  const groups = selectHeroStoryGroups(pool.items);
  const slides = HERO_CATEGORIES.map((category, index) => {
    const stories = groups[index].map(item => ({
      item: toCard(item), retrievedAt: formatDateTimeUtc(item.feedRefreshedAt ?? item.retrievedAt),
      delayed: ['apitube', 'newsdata'].includes(item.provider), stale: isNewsItemStale(item),
    }));
    const lead = stories[0];
    return {
      ...category, stories,
      item: lead?.item ?? null,
      sourcesFailed: pool.sourcesFailed,
      retrievedAt: lead?.retrievedAt ?? null,
      delayed: lead?.delayed ?? false,
      stale: lead?.stale ?? false,
    };
  });
  return <GlobalNewsPanel slides={slides} diagnostics={pool.diagnostics} />;
}

export const FirstFoldFeeds = () => (
  <Suspense fallback={<FeedsFallback />}><FeedsBody /></Suspense>
);
