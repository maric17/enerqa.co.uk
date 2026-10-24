import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { refreshScheduledNews } from './index';
import { isNewsRefreshJob } from './schedule';

/** All scheduled endpoints share authentication and publication-cache handling. */
export async function handleNewsCron(request: Request, job: string) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: 'Scheduled news is not configured.' }, { status: 503 });
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get('authorization') ?? '');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (!isNewsRefreshJob(job)) return Response.json({ error: 'Unknown news job.' }, { status: 404 });
  try {
    // Fixed paths choose the scope; query parameters cannot enable manual bypasses.
    const result = await refreshScheduledNews(undefined, { job });
    if (!result.skipped) {
      revalidateTag('saved-news', 'max');
      revalidateTag('global-intelligence', 'max');
    }
    return Response.json({ ...result, job }, {
      status: result.sourcesFailed ? 503 : 200, headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json({ error: 'News refresh failed; saved articles are retained.', job }, { status: 503 });
  }
}
