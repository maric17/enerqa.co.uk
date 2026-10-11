import nextEnv from '@next/env';
import { Client } from 'pg';
import { readFile } from 'node:fs/promises';

// Only this reviewed additive SQL is allowed; historical CMS migrations are not run.
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const db = new Client({ connectionString: process.env.DATABASE_URI, connectionTimeoutMillis: 5000, query_timeout: 10000 });
try {
  if (!process.env.DATABASE_URI) throw new Error('Database not configured.');
  await db.connect();
  if (!process.argv.includes('--apply')) {
    const result = await db.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('enquiries','policies') AND column_name IN ('last_substantive_contact_at','retention_hold_reason','retention_hold_until','notification_sent_at','newsletter_synced_at','policy_version')");
    console.log(`Read-only check: ${result.rows.length}/6 questionnaire columns present. Use --apply to install the reviewed additive fields.`);
  } else {
    await db.query('BEGIN');
    await db.query("SET LOCAL lock_timeout = '5s'");
    await db.query(await readFile(new URL('./additive-fields.sql', import.meta.url), 'utf8'));
    await db.query('COMMIT');
    console.log('Six additive questionnaire fields installed; no content or historical migrations changed.');
  }
} catch {
  await db.query('ROLLBACK').catch(() => {});
  console.error('Questionnaire schema check/update failed; verify database connectivity and the existing CMS tables.');
  process.exitCode = 1;
} finally { await db.end().catch(() => {}); }
