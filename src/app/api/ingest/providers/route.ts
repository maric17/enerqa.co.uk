import { timingSafeEqual } from 'node:crypto';
import { pruneRequestHistory } from '@/lib/api/core/storage';
import { buildIntelligenceIndex } from '@/lib/feeds/intelligenceIndex';

export const maxDuration = 300;

/** A protected scheduler target; public searches continue to use the shared index. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: 'Scheduled ingestion is not configured.' }, { status: 503 });
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get('authorization') ?? '');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    await pruneRequestHistory();
    const index = await buildIntelligenceIndex();
    return Response.json({ storedItems: index.items.length, sourcesFailed: index.sourcesFailed }, { status: index.sourcesFailed ? 503 : 200 });
  } catch { return Response.json({ error: 'Provider ingestion temporarily unavailable.' }, { status: 503 }); }
}
