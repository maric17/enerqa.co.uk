import { randomUUID } from 'node:crypto';
import { unstable_cache } from 'next/cache';
import { providerDatabase } from '../core/storage';
import { RECHECK_SECONDS } from '../core/accessCheck';
import { hasEditorialApproval, hasEditorialRejection, hostnameOf, normaliseUrl, newsImageUrl, type NewsItem, type NewsProvider } from './types';
import type { NewsDiagnostics } from './diagnostics';
import { NEWS_REFRESH_JOBS, newsScheduleSlot, type NewsRefreshJob } from './schedule';
import { createNewsDiagnostics } from './diagnostics';
import { PAGE_NEWS_PROVIDERS } from './policy';
import { hasApiTubeApproval } from './apitubeScreening';

// A control record in the existing private table avoids a live schema migration.
const JOB_PROVIDER = 'enerqa-news-sync';
// The branch has its own refresh state and lease in the shared database.
const JOB_ID = PAGE_NEWS_PROVIDERS.includes('apitube') ? 'scheduled-news-apitube-v1' : 'scheduled-news-v1';
export const NEWS_PROVIDERS: NewsProvider[] = ['apitube', 'thenewsapi', 'newsdata', 'gdelt', 'eia_rss', 'eea_rss'];

export type NewsRefreshState = {
  trigger?: 'scheduled' | 'manual';
  lastAttemptAt?: string;
  lastCompletedAt?: string;
  lastSuccessAt?: Partial<Record<NewsProvider, string>>;
  diagnostics?: NewsDiagnostics;
  status?: 'running' | 'succeeded' | 'failed';
  attempts?: number;
  retryAfter?: string | null;
  jobs?: Partial<Record<NewsRefreshJob, Omit<NewsRefreshState, 'jobs'>>>;
};

function jobSourceId(job?: NewsRefreshJob): string {
  return job ? `${JOB_ID}/${job}` : JOB_ID;
}

type StoredNewsRow = {
  provider: string; source_id: string; destination: string; record: unknown;
  access_status: string; access_checked_at: Date | string | null;
  retrieved_at: Date | string;
  verdict: { status?: string; checkedAt?: string; imageUrl?: string } | null;
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
    const legacyState = rows.find(r => r.provider === JOB_PROVIDER && r.source_id === JOB_ID)?.record as NewsRefreshState | undefined;
    const jobs: NewsRefreshState['jobs'] = {};
    for (const job of NEWS_REFRESH_JOBS) {
      const row = rows.find(r => r.provider === JOB_PROVIDER && r.source_id === jobSourceId(job));
      if (row) jobs[job] = row.record as NewsRefreshState;
    }
    // General news is the default; stock and industry readers select their own job below.
    const state = { ...(jobs.general ?? legacyState), jobs };
    let pendingEditorialReviews = 0;
    let rejectedEditorialReviews = 0;
    const items = rows.flatMap(row => {
      if (!NEWS_PROVIDERS.includes(row.provider as NewsProvider) || (!includeExpiredAccess && row.access_status !== 'verified_open')) return [];
      const item = row.record as NewsItem | null;
      // Other modules share this table; accept only complete news-shaped records.
      if (!item || typeof item.id !== 'string' || typeof item.title !== 'string' || !item.title ||
        typeof item.url !== 'string' || item.url !== row.destination || item.provider !== row.provider ||
        typeof item.publisher !== 'string' || typeof item.rights !== 'string' ||
        typeof item.publishedAt !== 'string' || Number.isNaN(Date.parse(item.publishedAt)) ||
        (item.summary !== null && typeof item.summary !== 'string') ||
        (item.language !== null && typeof item.language !== 'string') ||
        !Array.isArray(item.regions) || !item.regions.every(r => typeof r === 'string')) return [];
      // Old keyword-only records and pending reviews cannot bypass editorial screening.
      if (!includeExpiredAccess && !(item.provider === 'apitube' ? hasApiTubeApproval(item) : hasEditorialApproval(item))) {
        // Inactive providers must not make the isolated trial look unavailable.
        if (PAGE_NEWS_PROVIDERS.includes(item.provider)) {
          if (hasEditorialRejection(item)) rejectedEditorialReviews++;
          else pendingEditorialReviews++;
        }
        return [];
      }
      const checkTime = row.access_checked_at ? new Date(row.access_checked_at).getTime() : NaN;
      const retrievalTime = new Date(row.retrieved_at).getTime();
      if ((!includeExpiredAccess && !Number.isFinite(checkTime)) || !Number.isFinite(retrievalTime)) return [];
      const checkedAt = Number.isFinite(checkTime) ? new Date(checkTime).toISOString() : null;
      // A newer refusal invalidates the old open record immediately, even before expiry.
      if (row.verdict?.checkedAt && checkedAt && Date.parse(row.verdict.checkedAt) >= Date.parse(checkedAt) && row.verdict.status !== 'verified_open') return [];
      if (!includeExpiredAccess && checkedAt && Date.now() - Date.parse(checkedAt) > RECHECK_SECONDS * 1000) return [];
      return [{ ...item, id: normaliseUrl(item.url), domain: hostnameOf(item.url),
        imageUrl: newsImageUrl(row.verdict?.imageUrl) ?? item.imageUrl,
        retrievedAt: new Date(retrievalTime).toISOString(), accessStatus: row.access_status === 'verified_open' ? 'verified_open' as const : 'unknown' as const, accessCheckedAt: checkedAt }];
    });
    const readState = { ...state };
    if (pendingEditorialReviews || rejectedEditorialReviews) {
      // A provider's successful HTTP reply does not mean its old stories passed editorial review.
      readState.diagnostics = { ...createNewsDiagnostics('all'), ...readState.diagnostics,
        editorial: { approved: items.length, pending: pendingEditorialReviews, rejected: rejectedEditorialReviews,
          issue: pendingEditorialReviews ? readState.diagnostics?.editorial?.issue ?? 'editorial_review_required' : null } };
    }
    return { items, state: readState, available: true };
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
}, ['saved-news-apitube-2026-10-24-jobs-v3'], { revalidate: 60, tags: ['saved-news'] });

export async function readNewsStore(includeExpiredAccess = false) {
  if (includeExpiredAccess) return readNewsStoreUncached(true);
  try { return await cachedNewsStore(); }
  catch (error) {
    // Offline unit tests and scripts have no Next.js shared cache.
    if (error instanceof Error && error.message.includes('incrementalCache missing')) return readNewsStoreUncached();
    return { items: [], state: {} as NewsRefreshState, available: false };
  }
}

export type NewsRefreshClaim = { token: string; state: NewsRefreshState; job?: NewsRefreshJob };
export type NewsRefreshOptions = {
  manual?: boolean;
  /** A fixed scheduled unit; never combined with the older manual scope flags. */
  job?: NewsRefreshJob;
  /** Manual four-domain preview; avoids spending credits on sector discovery. */
  topicsOnly?: boolean;
  /** Manual stock-market preview using only the three regional searches. */
  marketsOnly?: boolean;
  /** Trusted operator maintenance; the HTTP route never enables this option. */
  industriesOnly?: boolean;
  /** Restrict a manual industry repair to these known sectors instead of all thirteen. */
  industrySlugs?: string[];
};

/** Job-specific leases prevent duplicates without blocking unrelated news work. */
export async function claimNewsRefresh(options: NewsRefreshOptions = {}): Promise<NewsRefreshClaim | null> {
  const db = providerDatabase();
  if (!db) throw new Error('Scheduled news storage is not configured.');
  const now = Date.now();
  const token = randomUUID();
  const record = { slot: newsScheduleSlot(now), token, trigger: options.manual ? 'manual' : 'scheduled',
    status: 'running', attempts: 1, retryAfter: null,
    lastAttemptAt: new Date(now).toISOString(), leaseUntil: new Date(now + 10 * 60_000).toISOString() };
  const { rows } = await db.query<{ record: NewsRefreshState }>(`
    INSERT INTO enerqa_connectors.external_records AS previous
      (provider, source_id, destination, access_status, retrieved_at, record)
    VALUES ($1, $2, 'https://enerqa.co.uk', 'unknown', clock_timestamp(), $3::jsonb)
    ON CONFLICT (provider, source_id) DO UPDATE
      SET record = previous.record || EXCLUDED.record || jsonb_build_object('attempts',
        CASE WHEN previous.record->>'slot' = EXCLUDED.record->>'slot'
          THEN COALESCE((previous.record->>'attempts')::int, 0) + 1 ELSE 1 END),
        retrieved_at = clock_timestamp()
      WHERE ($4::boolean OR (
        previous.record->>'slot' IS DISTINCT FROM EXCLUDED.record->>'slot'
        AND COALESCE((previous.record->>'slot')::timestamptz, '-infinity'::timestamptz) < (EXCLUDED.record->>'slot')::timestamptz)
        OR ($5::boolean AND previous.record->>'slot' = EXCLUDED.record->>'slot'
          AND previous.record->>'status' IS DISTINCT FROM 'succeeded'
          AND COALESCE((previous.record->>'attempts')::int, 0) < 2
          AND COALESCE((previous.record->>'retryAfter')::timestamptz, '-infinity'::timestamptz) < clock_timestamp()))
        AND COALESCE((previous.record->>'leaseUntil')::timestamptz, '-infinity'::timestamptz) < clock_timestamp()
    RETURNING record`, [JOB_PROVIDER, jobSourceId(options.job), JSON.stringify(record), options.manual === true, Boolean(options.job)]);
  return rows.length ? { token, state: rows[0].record, ...(options.job ? { job: options.job } : {}) } : null;
}

/** Release the lease and retain the latest safe outcomes, including failed pulls. */
export async function finishNewsRefresh(claim: NewsRefreshClaim, state: NewsRefreshState): Promise<void> {
  const db = providerDatabase();
  if (!db) throw new Error('Scheduled news storage is not configured.');
  const result = await db.query(`UPDATE enerqa_connectors.external_records
    SET record = record || $3::jsonb, retrieved_at = clock_timestamp()
    WHERE provider = $1 AND source_id = $2 AND record->>'token' = $4`,
  [JOB_PROVIDER, jobSourceId(claim.job), JSON.stringify({ ...state, leaseUntil: null,
    retryAfter: state.status === 'failed' ? new Date(Date.now() + 60_000).toISOString() : null }), claim.token]);
  if (result.rowCount !== 1) throw new Error('Scheduled news lease is no longer owned.');
}
