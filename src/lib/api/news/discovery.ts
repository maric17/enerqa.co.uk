import { INDUSTRY_FEEDS } from '../../feeds/contextual';
import { NEWS_CRON_SCHEDULES, newsScheduleSlot } from './schedule';

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
