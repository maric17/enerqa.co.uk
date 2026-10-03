import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/lib/api/news', () => ({ refreshScheduledNews: vi.fn() }));
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));
import { refreshScheduledNews } from '@/lib/api/news';
import { revalidateTag } from 'next/cache';
import { createNewsDiagnostics } from '@/lib/api/news/diagnostics';
import { GET } from './route';

beforeEach(() => { vi.resetAllMocks(); vi.stubEnv('CRON_SECRET', 'fixture-secret'); });
afterEach(() => vi.unstubAllEnvs());
const request = () => new Request('https://example.org/api/ingest/news', { headers: { authorization: 'Bearer fixture-secret' } });

it('rejects missing configuration and wrong credentials before spending provider credits', async () => {
  vi.stubEnv('CRON_SECRET', '');
  expect((await GET(request())).status).toBe(503);
  vi.stubEnv('CRON_SECRET', 'fixture-secret');
  expect((await GET(new Request('https://example.org/api/ingest/news'))).status).toBe(401);
  expect((await GET(new Request('https://example.org/api/ingest/news', { headers: { authorization: 'Bearer wrong' } }))).status).toBe(401);
  expect(refreshScheduledNews).not.toHaveBeenCalled();
});

it('invalidates the saved-news search index after an authenticated refresh', async () => {
  vi.mocked(refreshScheduledNews).mockResolvedValue({ skipped: false, storedItems: 3, sourcesFailed: false, diagnostics: createNewsDiagnostics('all') });
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(await response.json()).toMatchObject({ storedItems: 3 });
  expect(revalidateTag).toHaveBeenCalledWith('global-intelligence', 'max');
  expect(revalidateTag).toHaveBeenCalledWith('saved-news', 'max');
});

it('treats a duplicate slot as a successful skip without refreshing caches', async () => {
  vi.mocked(refreshScheduledNews).mockResolvedValue({ skipped: true, storedItems: 0, sourcesFailed: false });
  expect((await GET(request())).status).toBe(200);
  expect(revalidateTag).not.toHaveBeenCalled();
});

it('reports failed storage or providers without exposing native errors', async () => {
  vi.mocked(refreshScheduledNews).mockResolvedValue({ skipped: false, storedItems: 0, sourcesFailed: true, diagnostics: createNewsDiagnostics('all') });
  expect((await GET(request())).status).toBe(503);
  vi.mocked(refreshScheduledNews).mockRejectedValue(new Error('private-db-credentials'));
  const response = await GET(request());
  expect(response.status).toBe(503);
  expect(JSON.stringify(await response.json())).not.toContain('private-db-credentials');
});
