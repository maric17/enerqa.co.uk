import { timingSafeEqual } from 'node:crypto';
import { runNewsPilot } from '@/lib/api/news/pilot';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const token = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from('Bearer ' + secret);
  if (!secret || token.length !== expected.length || !timingSafeEqual(token, expected)) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  // Keep pilot results separate from the saved feed and its cache.
  try {
    return Response.json(await runNewsPilot(), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Headline pilot failed.' }, { status: 503 });
  }
}
