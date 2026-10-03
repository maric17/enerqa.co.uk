/** Three daily pulls, eight hours apart. Vercel expressions use UTC. */
export const NEWS_REFRESH_SECONDS = 8 * 3600;
export const NEWS_CRON_SCHEDULES = ['0 22 * * *', '0 6 * * *', '0 14 * * *'] as const;

/** The most recent scheduled slot, shared by cron and authenticated manual runs. */
export function newsScheduleSlot(now = Date.now()): string {
  const interval = NEWS_REFRESH_SECONDS * 1000;
  const anchor = 6 * 3600 * 1000;
  return new Date(Math.floor((now - anchor) / interval) * interval + anchor).toISOString();
}
