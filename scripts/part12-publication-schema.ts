/** Produce an additive-only draft schema plan. Does not change the database. */
import { writeFile } from 'node:fs/promises';
import { getPayload } from 'payload';
import config from '../src/payload.config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const payload = await getPayload({ config, disableDBConnect: true });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URI, options: '-c default_transaction_read_only=on' });
try {
  const db = payload.db as typeof payload.db & { schema: Record<string, unknown>; requireDrizzleKit: () => { pushSchema: (...args: any[]) => Promise<{ statementsToExecute: string[]; warnings: string[]; hasDataLoss: boolean }> } };
  const plan = await db.requireDrizzleKit().pushSchema(db.schema, drizzle(pool), ['public']) as unknown as { statementsToExecute: string[]; warnings: string[]; hasDataLoss: boolean };
  await writeFile('/tmp/enerqa-part12-schema-plan.json', JSON.stringify(plan, (_key, value) => typeof value === 'function' ? undefined : value, 2));
  console.log(JSON.stringify({ statements: plan.statementsToExecute?.length, warnings: plan.warnings, hasDataLoss: plan.hasDataLoss }));
} finally { await pool.end(); await payload.destroy(); }
