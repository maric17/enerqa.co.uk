import { Pool, type PoolClient } from 'pg';
import { limitsFor } from './health';
import type { ProviderId } from './types';

// A small pool shares the site's existing database without changing CMS collections.
const key = '__enerqaProviderStorage';
const queueKey = '__enerqaProviderAccounting';
const CONNECTIONS = 2;
type AccountingQueue = { active: number; waiting: Array<() => void> };
const globalStore = globalThis as unknown as { [key]?: Pool; [queueKey]?: AccountingQueue };
function pool(): Pool | null {
  if (!process.env.DATABASE_URI) return null;
  if (!globalStore[key]) {
    const db = new Pool({ connectionString: process.env.DATABASE_URI, max: CONNECTIONS, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000 });
    // Idle connections can fail outside a query; handle that event without logging credentials.
    db.on('error', () => console.warn('[provider-storage] An idle database connection was lost.'));
    globalStore[key] = db;
  }
  return globalStore[key];
}

/** Scheduled news shares this pool and the existing operational tables. */
export function providerDatabase(): Pool | null {
  return pool();
}

/** Queue bursts before pg's five-second connection timeout starts counting. */
async function accountingSlot(): Promise<() => void> {
  const queue = globalStore[queueKey] ??= { active: 0, waiting: [] };
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    const next = queue.waiting.shift();
    if (next) next();
    else queue.active--;
  };
  if (queue.active < CONNECTIONS) {
    queue.active++;
    return release;
  }
  await new Promise<void>((resolve, reject) => {
    const next = () => { clearTimeout(timer); resolve(); };
    // A real outage still ends the wait instead of growing an indefinite queue.
    const timer = setTimeout(() => {
      queue.waiting.splice(queue.waiting.indexOf(next), 1);
      reject(new Error('Request accounting queue timed out.'));
    }, 30_000);
    queue.waiting.push(next);
  });
  return release;
}

/** Reserve one actual upstream attempt atomically across all server instances. */
export async function reserveRequest(provider: ProviderId): Promise<string | null> {
  const db = pool();
  // Offline unit tests exercise the local ledger. Real servers fail closed.
  if (!db) return process.env.NODE_ENV === 'test' ? null : 'shared request accounting is not configured';
  const limits = limitsFor(provider);
  const releaseSlot = await accountingSlot();
  let client: PoolClient | undefined;
  let stage = 'connection';
  const started = Date.now();
  try {
    client = await db.connect();
    stage = 'transaction';
    await client.query('BEGIN');
    await client.query("SET LOCAL statement_timeout = '5s'");
    // Every instance locks this provider before checking and spending its allowance.
    stage = 'lock';
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`enerqa-budget:${provider}`]);
    stage = 'count';
    const { rows: [count] } = await client.query<{ daily: string; recent: string; last: Date | null }>(`
      SELECT count(*) FILTER (WHERE requested_at >= date_trunc('day', clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') AS daily,
        count(*) FILTER (WHERE requested_at > clock_timestamp() - $2 * interval '1 second') AS recent,
        max(requested_at) AS last
      FROM enerqa_connectors.provider_requests WHERE provider = $1 AND requested_at > clock_timestamp() - interval '1 day'`,
    [provider, limits.window?.seconds ?? 0]);
    let reason: string | null = null;
    if (Number(count.daily) >= limits.daily) reason = 'shared daily request budget reached';
    else if (limits.window && Number(count.recent) >= limits.window.max) reason = 'shared rolling request budget reached';
    else if (limits.minIntervalMs && count.last && Date.now() - count.last.getTime() < limits.minIntervalMs) reason = 'shared request spacing limit reached';
    stage = 'reserve';
    if (!reason) await client.query('INSERT INTO enerqa_connectors.provider_requests(provider) VALUES ($1)', [provider]);
    stage = 'commit';
    await client.query('COMMIT');
    return reason;
  } catch (error) {
    // Stage and pool counts reveal contention without exposing driver messages or credentials.
    console.warn('[provider-storage] Request accounting failed.', {
      provider, stage, elapsedMs: Date.now() - started,
      connections: db.totalCount, idle: db.idleCount, waiting: db.waitingCount,
    });
    if (client) await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client?.release();
    releaseSlot();
  }
}

export type StoredRecord = {
  provider: ProviderId; sourceId: string; destination: string; accessStatus: string;
  accessCheckedAt: string | null; retrievedAt: string; record: unknown;
};

/** Keep original record fields and the real verdict, not a render-time timestamp. */
export async function storeRecords(records: StoredRecord[]): Promise<boolean> {
  if (!records.length) return true;
  const db = pool();
  if (!db) {
    return process.env.NODE_ENV === 'test';
  }
  // One parameterized statement stores the whole batch; no secrets or arbitrary SQL.
  try {
    await db.query(`INSERT INTO enerqa_connectors.external_records(provider, source_id, destination, access_status, access_checked_at, retrieved_at, record)
    SELECT provider, "sourceId", destination, "accessStatus", "accessCheckedAt"::timestamptz, "retrievedAt"::timestamptz, record
    FROM jsonb_to_recordset($1::jsonb) AS r(provider text, "sourceId" text, destination text, "accessStatus" text, "accessCheckedAt" text, "retrievedAt" text, record jsonb)
    ON CONFLICT (provider, source_id) DO UPDATE SET destination=EXCLUDED.destination, access_status=EXCLUDED.access_status,
      access_checked_at=EXCLUDED.access_checked_at, retrieved_at=EXCLUDED.retrieved_at, record=EXCLUDED.record
    WHERE external_records.record IS DISTINCT FROM EXCLUDED.record`, [JSON.stringify(records)]);
    return true;
  } catch {
    // A storage outage suppresses unrecorded items without leaking connection details.
    console.warn('[provider-storage] Source evidence could not be stored.');
    return false;
  }
}

/** Access-check evidence survives process restarts and server-instance changes. */
export async function savedAccessCheck(url: string): Promise<import('./accessCheck').AccessVerdict | null> {
  const db = pool();
  if (!db) return null;
  try {
    const { rows } = await db.query('SELECT verdict FROM enerqa_connectors.access_checks WHERE url=$1 AND expires_at > clock_timestamp()', [url]);
    return rows[0]?.verdict ?? null;
  } catch {
    // An outage is not a cache miss. Keep the item unpublished and native pg errors out of rendering.
    return { status: 'unknown', checkedAt: new Date().toISOString(), evidence: 'Access-check storage is unavailable; access could not be confirmed.', finalUrl: null };
  }
}

export async function saveAccessCheck(url: string, verdict: import('./accessCheck').AccessVerdict, seconds: number): Promise<void> {
  const db = pool();
  if (!db) return;
  // Expiry follows the actual check time, including when Next returns a cached verdict.
  try {
    await db.query(`INSERT INTO enerqa_connectors.access_checks(url, verdict, expires_at) VALUES ($1, $2::jsonb, $3::timestamptz + $4 * interval '1 second')
      ON CONFLICT(url) DO UPDATE SET verdict=EXCLUDED.verdict, expires_at=EXCLUDED.expires_at`, [url, JSON.stringify(verdict), verdict.checkedAt, seconds]);
  } catch {
    // checkAccess treats a failed evidence write as unknown; never forward pg's AggregateError to Next.
    throw new Error('Access-check storage is unavailable.');
  }
}

/** Old request timestamps no longer affect any daily/hourly allowance. */
export async function pruneRequestHistory(): Promise<void> {
  const db = pool();
  if (db) await db.query("DELETE FROM enerqa_connectors.provider_requests WHERE requested_at < clock_timestamp() - interval '2 days'");
}
