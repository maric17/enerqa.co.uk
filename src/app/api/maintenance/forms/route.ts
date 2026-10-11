import { timingSafeEqual } from 'node:crypto';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { maintainForms } from '@/lib/forms/lifecycle';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || process.env.FORMS_RETENTION_ENABLED !== 'true') return Response.json({ error: 'Forms maintenance is not configured.' }, { status: 503 });
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get('authorization') || '');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const result = await maintainForms(await getPayload({ config: configPromise }));
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Forms maintenance failed; review database and delivery configuration.' }, { status: 503 });
  }
}
