import nextEnv from '@next/env';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

/** Exercise the real guard SQL against transaction-local rows, never saved news. */
async function main() {
  nextEnv.loadEnvConfig(path.resolve(import.meta.dirname, '..'), true, { info() {}, error() {} });
  const { providerDatabase } = await import('../src/lib/api/core/storage');
  const { claimNewsRefresh, finishNewsRefresh } = await import('../src/lib/api/news/storage');
  const { NEWS_REFRESH_JOBS } = await import('../src/lib/api/news/schedule');
  const db = providerDatabase();
  if (!db) throw new Error('Guard verification requires the local database configuration.');
  const client = await db.connect();
  const originalQuery = db.query;
  const checks: string[] = [];
  try {
    await client.query('BEGIN');
    await client.query(`CREATE TEMP TABLE enerqa_news_job_guard (
      provider text, source_id text, destination text, access_status text,
      retrieved_at timestamptz, record jsonb, PRIMARY KEY (provider, source_id)
    ) ON COMMIT DROP`);
    // Redirect only the guard's exact table; all other statements fail closed.
    db.query = ((sql: string, values?: unknown[]) => {
      assert.equal(typeof sql, 'string');
      assert(sql.includes('enerqa_connectors.external_records'));
      return client.query(sql.replaceAll('enerqa_connectors.external_records', 'pg_temp.enerqa_news_job_guard'), values);
    }) as typeof db.query;

    // One temporary-table connection executes statements in order, as pg requires.
    const claims: Awaited<ReturnType<typeof claimNewsRefresh>>[] = [];
    for (const job of NEWS_REFRESH_JOBS) claims.push(await claimNewsRefresh({ job }));
    assert(claims.every(Boolean));
    const { rows } = await client.query('SELECT source_id FROM pg_temp.enerqa_news_job_guard');
    assert.equal(new Set(rows.map(row => row.source_id)).size, 5);
    assert(rows.every(row => row.source_id.startsWith('scheduled-news-apitube-v1/')));
    checks.push('All five APITube units claim independently in the same cycle.');

    assert.equal(await claimNewsRefresh({ job: 'stocks' }), null);
    assert.equal(await claimNewsRefresh({ job: 'stocks', manual: true }), null);
    checks.push('Concurrent scheduled and manual stock attempts respect the active lease.');

    const stock = claims[1]!;
    await finishNewsRefresh(stock, { status: 'failed' });
    assert.equal(await claimNewsRefresh({ job: 'stocks' }), null);
    checks.push('A failed stock job waits for the retry backoff.');
    await client.query(`UPDATE pg_temp.enerqa_news_job_guard SET record = record ||
      jsonb_build_object('retryAfter', clock_timestamp() - interval '1 minute')
      WHERE source_id LIKE '%/stocks'`);
    const retry = await claimNewsRefresh({ job: 'stocks' });
    assert(retry);
    assert.equal(retry.state.attempts, 2);
    checks.push('Only failed stocks can take their second attempt without rerunning other units.');

    await assert.rejects(finishNewsRefresh({ ...retry, token: 'wrong-token' }, { status: 'succeeded' }), /no longer owned/);
    checks.push('A stale lease cannot finish the current stock attempt.');
    await finishNewsRefresh(retry, { status: 'failed' });
    await client.query(`UPDATE pg_temp.enerqa_news_job_guard SET record = record ||
      jsonb_build_object('retryAfter', clock_timestamp() - interval '1 minute')
      WHERE source_id LIKE '%/stocks'`);
    assert.equal(await claimNewsRefresh({ job: 'stocks' }), null);
    checks.push('Scheduled attempts are capped at two per job per cycle.');

    for (const claim of claims.filter(claim => claim?.job !== 'stocks')) {
      await finishNewsRefresh(claim!, { status: 'succeeded' });
      assert.equal(await claimNewsRefresh({ job: claim!.job }), null);
    }
    checks.push('Successful general and industry jobs remain skipped during a stock failure.');

    await client.query(`UPDATE pg_temp.enerqa_news_job_guard SET record = record ||
      jsonb_build_object('slot', (record->>'slot')::timestamptz - interval '8 hours')
      WHERE source_id LIKE '%/stocks'`);
    const next = await claimNewsRefresh({ job: 'stocks' });
    assert(next);
    assert.equal(next.state.attempts, 1);
    await finishNewsRefresh(next, { status: 'succeeded' });
    assert.equal(await claimNewsRefresh({ job: 'stocks' }), null);
    checks.push('A new cycle resets the attempt count; a successful stock retry becomes idempotent.');

    await client.query('ROLLBACK');
    const report = { checkedAt: new Date().toISOString(), passed: true, checks,
      temporaryRecordsRolledBack: true, providerRequests: 0, sharedNewsWrites: 0 };
    const output = process.argv[2];
    if (output) await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify(report));
  } finally {
    db.query = originalQuery;
    await client.query('ROLLBACK').catch(() => {});
    client.release();
    await db.end();
  }
}

void main().catch(() => {
  // Driver errors can contain private connection details.
  console.error('News job guard verification failed. No shared news records were changed.');
  process.exitCode = 1;
});
