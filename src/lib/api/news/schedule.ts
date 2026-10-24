/** Three daily pulls, eight hours apart. Vercel expressions use UTC. */
export const NEWS_REFRESH_SECONDS = 8 * 3600;
export const NEWS_CRON_SCHEDULES = ['0 22 * * *', '0 6 * * *', '0 14 * * *'] as const;

// Each unit has its own completion record; all five belong to the same daily cycles.
export const NEWS_REFRESH_JOBS = ['general', 'stocks', 'industries-1', 'industries-2', 'industries-3'] as const;
export type NewsRefreshJob = typeof NEWS_REFRESH_JOBS[number];

export function isNewsRefreshJob(value: string): value is NewsRefreshJob {
  return NEWS_REFRESH_JOBS.some(job => job === value);
}

/** The most recent scheduled slot, shared by cron and authenticated manual runs. */
export function newsScheduleSlot(now = Date.now()): string {
  const interval = NEWS_REFRESH_SECONDS * 1000;
  const anchor = 6 * 3600 * 1000;
  return new Date(Math.floor((now - anchor) / interval) * interval + anchor).toISOString();
}
