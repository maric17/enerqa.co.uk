import { INDUSTRY_FEEDS } from '../../feeds/contextual';
import { NEWS_CRON_SCHEDULES, newsScheduleSlot, type NewsRefreshJob } from './schedule';

/** Stable batches cover all thirteen industries during every refresh cycle. */
export function industryRefreshSlugs(batch: 1 | 2 | 3): string[] {
  const slugs = Object.keys(INDUSTRY_FEEDS);
  const size = Math.ceil(slugs.length / 3);
  return slugs.slice((batch - 1) * size, batch * size);
}

export function industryRefreshJob(slug: string): NewsRefreshJob | undefined {
  const batch = ([1, 2, 3] as const).find(batch => industryRefreshSlugs(batch).includes(slug));
  return batch ? `industries-${batch}` : undefined;
}

/** Spread sector discovery across the three daily slots without changing page reads. */
export function industryDiscoveryQueries(now = Date.now(), all = false, slugs?: string[]): string[] {
  const feeds = slugs ? slugs.map(slug => INDUSTRY_FEEDS[slug]) : Object.values(INDUSTRY_FEEDS);
  const queries = [...new Set(feeds.map(feed => feed.newsDiscoveryQuery))];
  if (all) return queries;
  // Manila's 6 AM, 2 PM and 10 PM slots map to UTC hours 22, 6 and 14.
  const slot = Math.floor(((new Date(newsScheduleSlot(now)).getUTCHours() + 2) % 24) / 8);
  const batchSize = Math.ceil(queries.length / NEWS_CRON_SCHEDULES.length);
  return queries.slice(slot * batchSize, (slot + 1) * batchSize);
}
