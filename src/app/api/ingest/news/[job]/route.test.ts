import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
vi.mock('@/lib/api/news', () => ({ refreshScheduledNews: vi.fn() }));
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));
import { refreshScheduledNews } from '@/lib/api/news';
import { revalidateTag } from 'next/cache';
import { GENERAL_NEWS_CRON_SCHEDULES, NEWS_REFRESH_JOBS, newsScheduleSlot } from '@/lib/api/news/schedule';
import { createNewsDiagnostics } from '@/lib/api/news/diagnostics';
import { GET } from './route';

beforeEach(() => { vi.resetAllMocks(); vi.stubEnv('CRON_SECRET', 'fixture-secret'); });
afterEach(() => vi.unstubAllEnvs());
const request = (path: string, authorized = true) => new Request(`https://example.org/api/ingest/news/${path}`, {
  headers: authorized ? { authorization: 'Bearer fixture-secret' } : {},
});
const context = (job: string) => ({ params: Promise.resolve({ job }) });

it.each(['stocks', 'industries-1', 'industries-2', 'industries-3'])('authenticates the %s endpoint before spending credits', async job => {
  expect((await GET(request(job, false), context(job))).status).toBe(401);
  expect(refreshScheduledNews).not.toHaveBeenCalled();
});

it.each(['stocks', 'industries-1', 'industries-2', 'industries-3'])('selects only fixed job %s and ignores manual query parameters', async job => {
  vi.mocked(refreshScheduledNews).mockResolvedValue({ skipped: false, storedItems: 2, sourcesFailed: false, diagnostics: createNewsDiagnostics('all') });
  const response = await GET(request(`${job}?manual=true&industry=unknown`), context(job));
  expect(response.status).toBe(200);
  expect(refreshScheduledNews).toHaveBeenCalledExactlyOnceWith(undefined, { job });
  expect(revalidateTag).toHaveBeenCalledWith('saved-news', { expire: 0 });
  expect(await response.json()).toMatchObject({ job, storedItems: 2 });
});

it('rejects unknown jobs without invoking ingestion', async () => {
  expect((await GET(request('industries-4'), context('industries-4'))).status).toBe(404);
  expect(refreshScheduledNews).not.toHaveBeenCalled();
});

it('does not refresh caches for a duplicate stock invocation', async () => {
  vi.mocked(refreshScheduledNews).mockResolvedValue({ skipped: true, storedItems: 0, sourcesFailed: false });
  expect((await GET(request('stocks'), context('stocks'))).status).toBe(200);
  expect(revalidateTag).not.toHaveBeenCalled();
});

it('returns a failed stock status without exposing native errors', async () => {
  vi.mocked(refreshScheduledNews).mockResolvedValue({ skipped: false, storedItems: 1, sourcesFailed: true, diagnostics: createNewsDiagnostics('all') });
  expect((await GET(request('stocks'), context('stocks'))).status).toBe(503);
  vi.mocked(refreshScheduledNews).mockRejectedValue(new Error('private-db-credentials'));
  const response = await GET(request('stocks'), context('stocks'));
  expect(response.status).toBe(503);
  expect(JSON.stringify(await response.json())).not.toContain('private-db-credentials');
});

it('schedules general news six times daily and keeps other jobs staggered every eight hours', () => {
  const { crons } = JSON.parse(readFileSync('vercel.json', 'utf8'));
  for (const [offset, job] of NEWS_REFRESH_JOBS.entries()) {
    const path = job === 'general' ? '/api/ingest/news' : `/api/ingest/news/${job}`;
    expect(crons.filter((entry: { path: string }) => entry.path === path).map((entry: { schedule: string }) => entry.schedule))
      .toEqual(job === 'general' ? [...GENERAL_NEWS_CRON_SCHEDULES]
        : [22, 6, 14].map(hour => `0 ${(hour + offset) % 24} * * *`));
  }
});

it('leaves time between APITube jobs instead of launching requests together', () => {
  const { crons } = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const times = crons.filter((entry: { path: string }) => entry.path.startsWith('/api/ingest/news'))
    .map((entry: { schedule: string }) => {
      const [minute, hour] = entry.schedule.split(' ').map(Number);
      return hour * 60 + minute;
    }).sort((a: number, b: number) => a - b);
  // Leave a full hour because the platform can delay scheduled invocations.
  for (let index = 0; index < times.length; index++) {
    const next = times[index + 1] ?? times[0] + 24 * 60;
    expect(next - times[index]).toBeGreaterThanOrEqual(60);
  }
});

it.each(['2026-10-24T22:00:00Z', '2026-10-25T06:00:00Z', '2026-10-25T14:00:00Z'])(
  'keeps all hourly jobs in the cycle starting %s, including midnight crossings', start => {
    const base = Date.parse(start);
    // UTC and Manila midnight crossings must not reset the shared eight-hour cycle.
    for (const offset of NEWS_REFRESH_JOBS.keys()) {
      expect(newsScheduleSlot(base + offset * 3600_000)).toBe(newsScheduleSlot(base));
    }
    expect(newsScheduleSlot(base + 8 * 3600_000)).not.toBe(newsScheduleSlot(base));
  },
);
