import { parseIntelligenceFilters, INTELLIGENCE_KEYS } from '@/lib/feeds/intelligenceQueries';
import { searchLiveIntelligence } from '@/lib/feeds/liveIntelligence';
import { createRateLimiter } from '@/lib/forms/rateLimit';
import { getClientKey } from '@/lib/forms/clientKey';

export const runtime = 'nodejs';
export const maxDuration = 300;
const limiter = createRateLimiter({ limit: 20, windowMs: 60_000 });

/** Credentials, provider budgets and access verification stay on the server. */
export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' };
  const url = new URL(request.url);
  if (url.search.length > 6000) return Response.json({ error: 'Too many filter values.' }, { status: 400, headers });
  const filters = parseIntelligenceFilters(url.searchParams);
  // Reject unknown values rather than turning a bad source/domain into a broad paid search.
  for (const [key, value] of url.searchParams) {
    if (!INTELLIGENCE_KEYS.includes(key) || (key !== 'q' && value && !filters[key]?.includes(value))) {
      return Response.json({ error: 'Unsupported filter value.' }, { status: 400, headers });
    }
  }
  if (!limiter.consume(await getClientKey()).allowed) {
    return Response.json({ error: 'Please wait before searching again.' }, { status: 429, headers: { ...headers, 'Retry-After': '60' } });
  }
  try {
    return Response.json(await searchLiveIntelligence(filters), { headers });
  } catch {
    return Response.json({ error: 'Sources could not be refreshed. Showing saved results.' }, { status: 503, headers });
  }
}
