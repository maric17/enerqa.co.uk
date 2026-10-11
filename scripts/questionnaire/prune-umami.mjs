import nextEnv from '@next/env';
import { Client } from 'pg';

// Approved Q10 retention: dedicated Umami 3.4.0/Postgres, scoped to one website.
// Default mode only reports counts. --apply is the scheduled deletion mode.
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const uri = process.env.UMAMI_DATABASE_URI;
const website = process.env.UMAMI_WEBSITE_ID;
let db;
try {
  if (!uri || !website || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(website)) throw new Error('Missing dedicated analytics configuration.');
  if (uri === process.env.DATABASE_URI) throw new Error('Analytics cannot use the shared CMS database.');
  db = new Client({ connectionString: uri, connectionTimeoutMillis: 5000, query_timeout: 10000 });
  await db.connect();
  await db.query('BEGIN');
  await db.query("SET LOCAL lock_timeout='5s'");
  await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`enerqa-analytics-retention:${website}`]);
  const { rows: sites } = await db.query('SELECT recorder_enabled FROM website WHERE website_id=$1', [website]);
  if (sites.length !== 1 || sites[0].recorder_enabled) throw new Error('The analytics website must exist and recording must be disabled.');
  // A session's original age is a hard limit, even if a recent event references it.
  // Undated raw records cannot establish that they are inside the approved window.
  await db.query(`CREATE TEMP TABLE expired_umami_sessions ON COMMIT DROP AS
    SELECT session_id FROM session WHERE website_id=$1
      AND (created_at IS NULL OR created_at <= now()-interval '90 days')`, [website]);
  await db.query(`CREATE TEMP TABLE expired_umami_events ON COMMIT DROP AS
    SELECT event_id FROM website_event WHERE website_id=$1
      AND (created_at IS NULL OR created_at <= now()-interval '90 days'
        OR session_id IN (SELECT session_id FROM expired_umami_sessions))`, [website]);
  const { rows: [counts] } = await db.query('SELECT (SELECT count(*) FROM expired_umami_events) AS events, (SELECT count(*) FROM expired_umami_sessions) AS sessions');
  console.log(`Expired events: ${counts.events}; sessions: ${counts.sessions}. Retention: 90 days. Mode: ${process.argv.includes('--apply') ? 'apply' : 'preview'}.`);
  if (process.argv.includes('--apply')) {
    // Prisma relationMode=prisma does not promise database cascades. Remove children explicitly.
    await db.query(`DELETE FROM event_data WHERE website_id=$1 AND (created_at IS NULL
      OR created_at <= now()-interval '90 days' OR website_event_id IN (SELECT event_id FROM expired_umami_events))`, [website]);
    await db.query(`DELETE FROM revenue WHERE website_id=$1 AND (created_at IS NULL
      OR created_at <= now()-interval '90 days' OR event_id IN (SELECT event_id FROM expired_umami_events)
      OR session_id IN (SELECT session_id FROM expired_umami_sessions))`, [website]);
    await db.query('DELETE FROM website_event WHERE website_id=$1 AND event_id IN (SELECT event_id FROM expired_umami_events)', [website]);
    for (const table of ['session_data', 'session_link', 'session_replay', 'heatmap_event']) {
      // Names are fixed by the pinned schema, never supplied by the caller.
      await db.query(`DELETE FROM ${table} WHERE website_id=$1 AND (created_at IS NULL
        OR created_at <= now()-interval '90 days' OR session_id IN (SELECT session_id FROM expired_umami_sessions))`, [website]);
    }
    await db.query("DELETE FROM session_replay_saved WHERE website_id=$1 AND (created_at IS NULL OR created_at <= now()-interval '90 days')", [website]);
    await db.query('DELETE FROM session WHERE website_id=$1 AND session_id IN (SELECT session_id FROM expired_umami_sessions)', [website]);
    await db.query('COMMIT');
    console.log('Analytics retention applied. Backup expiry is managed separately by the hosting operator.');
  } else await db.query('ROLLBACK');
} catch {
  await db?.query('ROLLBACK').catch(() => {});
  console.error('Analytics retention stopped. Check the dedicated database, website ID, pinned schema and recording setting.');
  process.exitCode = 1;
} finally { await db?.end().catch(() => {}); }
