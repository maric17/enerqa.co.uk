import { readFile } from 'node:fs/promises';
import { Client } from 'pg';

// Apply only the additive operational tables; never run Payload's old migrations.
const client = new Client({ connectionString: process.env.DATABASE_URI });
if (!process.env.DATABASE_URI) throw new Error('DATABASE_URI is required.');
await client.connect();
try {
  await client.query('BEGIN');
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query(await readFile(new URL('./storage.sql', import.meta.url), 'utf8'));
  await client.query('COMMIT');
  console.log('Part 13 storage ready. Existing CMS tables and records unchanged.');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
