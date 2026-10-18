import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { refreshScheduledNews } from '@/lib/api/news';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/** Only the authenticated scheduler may spend news-provider allowances. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: 'Scheduled news is not configured.' }, { status: 503 });
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get('authorization') ?? '');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const result = await refreshScheduledNews();
    // The cached intelligence index must pick up the saved news on its next read.
    if (!result.skipped) {
      revalidateTag('saved-news', 'max');
      revalidateTag('global-intelligence', 'max');
    }
    return Response.json(result, { status: result.sourcesFailed ? 503 : 200, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'News refresh failed; saved articles are retained.' }, { status: 503 });
  }
}
