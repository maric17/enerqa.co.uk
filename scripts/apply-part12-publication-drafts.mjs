// Apply only the reviewed publication schema. Never run the historical migrations on the shared DB.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
import pg from 'pg';
import { backfillPublicationVersions } from './backfill-publication-versions.mjs';
(async () => {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URI });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query('LOCK TABLE publications IN SHARE ROW EXCLUSIVE MODE');
    const exists = await client.query("SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'publications' AND column_name = '_status'");
    if (exists.rowCount) { await client.query('ROLLBACK'); console.log('Draft schema already exists; run node scripts/backfill-publication-versions.mjs to check dashboard version coverage.'); return; }
    const rows = (await client.query('SELECT * FROM publications ORDER BY id')).rows;
    const rels = (await client.query('SELECT * FROM publications_rels ORDER BY id')).rows;
    const backupDir = path.join(scriptDir, 'part12-backups');
    fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
    const backup = path.join(backupDir, `publications-before-drafts-${Date.now()}.json`);
    fs.writeFileSync(backup, JSON.stringify({ rows, rels }), { mode: 0o600, flag: 'wx' });
    const sql = fs.readFileSync(path.join(scriptDir, 'part12-publication-drafts.sql'), 'utf8');
    await client.query(sql);
    // Preserve the current public collection. New records retain Payload's draft default.
    const publicIds = rows.filter(r => r.record_kind === 'article').map(r => r.id);
    await client.query("UPDATE publications SET _status = 'published' WHERE id = ANY($1::int[])", [publicIds]);
    // The dashboard lists saved versions once drafts are enabled, not the main rows.
    await backfillPublicationVersions(client);
    const after = (await client.query('SELECT * FROM publications ORDER BY id')).rows.map(row => Object.fromEntries(Object.entries(row).filter(([key]) => key !== '_status')));
    if (JSON.stringify(after) !== JSON.stringify(rows)) throw new Error('Publication content changed unexpectedly; rolling back.');
    await client.query('COMMIT');
    console.log(JSON.stringify({ backup, preservedRows: rows.length, preservedRelationships: rels.length, existingPublishedArticles: publicIds.length }));
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { await client.end(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
