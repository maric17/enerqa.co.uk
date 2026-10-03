import { randomUUID } from 'node:crypto';
import { unstable_cache } from 'next/cache';
import { providerDatabase } from '../core/storage';
import { RECHECK_SECONDS } from '../core/accessCheck';
import { hostnameOf, normaliseUrl, type NewsItem, type NewsProvider } from './types';
import type { NewsDiagnostics } from './diagnostics';
import { newsScheduleSlot } from './schedule';

// A control record in the existing private table avoids a live schema migration.
const JOB_PROVIDER = 'enerqa-news-sync';
const JOB_ID = 'scheduled-news-v1';
export const NEWS_PROVIDERS: NewsProvider[] = ['newsdata', 'gdelt', 'eia_rss', 'eea_rss'];

export type NewsRefreshState = {
  lastAttemptAt?: string;
  lastCompletedAt?: string;
  lastSuccessAt?: Partial<Record<NewsProvider, string>>;
  diagnostics?: NewsDiagnostics;
};

type StoredNewsRow = {
  provider: string; source_id: string; destination: string; record: unknown;
  access_status: string; access_checked_at: Date | string | null;
  retrieved_at: Date | string;
  verdict: { status?: string; checkedAt?: string } | null;
};

/** Read saved metadata and evidence only; never fall back to a provider request. */
async function readNewsStoreUncached(includeExpiredAccess = false): Promise<{ items: NewsItem[]; state: NewsRefreshState; available: boolean }> {
  const db = providerDatabase();
  if (!db) return { items: [], state: {}, available: false };
  try {
    const { rows } = await db.query<StoredNewsRow>(`
      SELECT r.*, a.verdict FROM enerqa_connectors.external_records r
      LEFT JOIN enerqa_connectors.access_checks a ON a.url = r.destination
      WHERE r.provider = ANY($1::text[])
        AND (r.provider = $2 OR r.retrieved_at > clock_timestamp() - interval '60 days')
      ORDER BY r.retrieved_at DESC LIMIT 5000`, [[...NEWS_PROVIDERS, JOB_PROVIDER], JOB_PROVIDER]);
    const state = rows.find(r => r.provider === JOB_PROVIDER && r.source_id === JOB_ID)?.record as NewsRefreshState | undefined;
    const items = rows.flatMap(row => {
      if (!NEWS_PROVIDERS.includes(row.provider as NewsProvider) || row.access_status !== 'verified_open') return [];
      const item = row.record as NewsItem | null;
      // Other modules share this table; accept only complete news-shaped records.
      if (!item || typeof item.id !== 'string' || typeof item.title !== 'string' || !item.title ||
        typeof item.url !== 'string' || item.url !== row.destination || item.provider !== row.provider ||
        typeof item.publisher !== 'string' || typeof item.rights !== 'string' ||
        typeof item.publishedAt !== 'string' || Number.isNaN(Date.parse(item.publishedAt)) ||
        (item.summary !== null && typeof item.summary !== 'string') ||
        (item.language !== null && typeof item.language !== 'string') ||
        !Array.isArray(item.regions) || !item.regions.every(r => typeof r === 'string')) return [];
      const checkTime = row.access_checked_at ? new Date(row.access_checked_at).getTime() : NaN;
      const retrievalTime = new Date(row.retrieved_at).getTime();
      if (!Number.isFinite(checkTime) || !Number.isFinite(retrievalTime)) return [];
      const checkedAt = new Date(checkTime).toISOString();
      // A newer refusal invalidates the old open record immediately, even before expiry.
      if (row.verdict?.checkedAt && Date.parse(row.verdict.checkedAt) >= Date.parse(checkedAt) && row.verdict.status !== 'verified_open') return [];
      if (!includeExpiredAccess && Date.now() - Date.parse(checkedAt) > RECHECK_SECONDS * 1000) return [];
      return [{ ...item, id: normaliseUrl(item.url), domain: hostnameOf(item.url),
        retrievedAt: new Date(retrievalTime).toISOString(), accessStatus: 'verified_open' as const, accessCheckedAt: checkedAt }];
    });
    return { items, state: state ?? {}, available: true };
  } catch {
    console.warn('[enerqa:news] Saved news could not be read.');
    return { items: [], state: {}, available: false };
  }
}

// A short shared database cache limits queries and lets static pages refresh with news.
const cachedNewsStore = unstable_cache(async () => {
  const saved = await readNewsStoreUncached();
  // A failed read must not replace the last good cache entry with an empty result.
  if (!saved.available) throw new Error('Saved news storage is unavailable.');
  return saved;
}, ['saved-news-v1'], { revalidate: 60, tags: ['saved-news'] });

export async function readNewsStore(includeExpiredAccess = false) {
  if (includeExpiredAccess) return readNewsStoreUncached(true);
  try { return await cachedNewsStore(); }
  catch (error) {
    // Offline unit tests and scripts have no Next.js shared cache.
    if (error instanceof Error && error.message.includes('incrementalCache missing')) return readNewsStoreUncached();
    return { items: [], state: {} as NewsRefreshState, available: false };
  }
}

export type NewsRefreshClaim = { token: string; state: NewsRefreshState };

/** One atomic claim per eight-hour slot prevents duplicate or overlapping pulls. */
export async function claimNewsRefresh(): Promise<NewsRefreshClaim | null> {
  const db = providerDatabase();
  if (!db) throw new Error('Scheduled news storage is not configured.');
  const now = Date.now();
  const token = randomUUID();
  const record = { slot: newsScheduleSlot(now), token, lastAttemptAt: new Date(now).toISOString(), leaseUntil: new Date(now + 10 * 60_000).toISOString() };
  const { rows } = await db.query<{ record: NewsRefreshState }>(`
    INSERT INTO enerqa_connectors.external_records AS previous
      (provider, source_id, destination, access_status, retrieved_at, record)
    VALUES ($1, $2, 'https://enerqa.co.uk', 'unknown', clock_timestamp(), $3::jsonb)
    ON CONFLICT (provider, source_id) DO UPDATE
      SET record = previous.record || EXCLUDED.record, retrieved_at = clock_timestamp()
      WHERE previous.record->>'slot' IS DISTINCT FROM EXCLUDED.record->>'slot'
        AND COALESCE((previous.record->>'slot')::timestamptz, '-infinity'::timestamptz) < (EXCLUDED.record->>'slot')::timestamptz
        AND COALESCE((previous.record->>'leaseUntil')::timestamptz, '-infinity'::timestamptz) < clock_timestamp()
    RETURNING record`, [JOB_PROVIDER, JOB_ID, JSON.stringify(record)]);
  return rows.length ? { token, state: rows[0].record } : null;
}

/** Release the lease and retain the latest safe outcomes, including failed pulls. */
export async function finishNewsRefresh(claim: NewsRefreshClaim, state: NewsRefreshState): Promise<void> {
  const db = providerDatabase();
  if (!db) throw new Error('Scheduled news storage is not configured.');
  const result = await db.query(`UPDATE enerqa_connectors.external_records
    SET record = record || $3::jsonb, retrieved_at = clock_timestamp()
    WHERE provider = $1 AND source_id = $2 AND record->>'token' = $4`,
  [JOB_PROVIDER, JOB_ID, JSON.stringify({ ...state, leaseUntil: null }), claim.token]);
  if (result.rowCount !== 1) throw new Error('Scheduled news lease is no longer owned.');
}
