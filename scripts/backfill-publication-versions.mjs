import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const quote = (name) => `"${name.replaceAll('"', '""')}"`;

export async function backfillPublicationVersions(client) {
  // Only seed records without any history. Existing drafts and versions stay intact.
  const missing = (await client.query(`SELECT p.* FROM publications p
    WHERE NOT EXISTS (SELECT 1 FROM _publications_v v WHERE v.parent_id = p.id) ORDER BY p.id`)).rows;
  if (!missing.length) return { seededVersions: 0, copiedRelationships: 0 };

  const columns = (await client.query(`SELECT column_name, udt_name, data_type
    FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '_publications_v'
    AND column_name LIKE 'version\\_%' ESCAPE '\\' ORDER BY ordinal_position`)).rows;
  const names = columns.map((column) => quote(column.column_name));
  const values = columns.map((column) => {
    const source = column.column_name.slice('version_'.length);
    if (!Object.hasOwn(missing[0], source)) throw new Error(`Missing publication field: ${source}`);
    // PostgreSQL uses separate enum types for documents and their saved versions.
    return `p.${quote(source)}${column.data_type === 'USER-DEFINED' ? `::text::${quote(column.udt_name)}` : ''}`;
  });
  const inserted = (await client.query(`INSERT INTO _publications_v
    (parent_id, ${names.join(', ')}, created_at, updated_at, latest)
    SELECT p.id, ${values.join(', ')}, p.created_at, p.updated_at, true
    FROM publications p WHERE p.id = ANY($1::int[]) RETURNING *`, [missing.map((row) => row.id)])).rows;

  // Relationships live in a separate table; version paths need the "version." prefix.
  const relationships = await client.query(`INSERT INTO _publications_v_rels
    ("order", parent_id, path, categories_id, domains_id, industries_id, datasets_id, tools_id)
    SELECT r."order", v.id, 'version.' || r.path, r.categories_id, r.domains_id,
      r.industries_id, r.datasets_id, r.tools_id
    FROM publications_rels r JOIN _publications_v v ON v.parent_id = r.parent_id
    WHERE v.id = ANY($1::int[])`, [inserted.map((row) => row.id)]);

  // Verify every copied field before the caller can commit the transaction.
  for (const version of inserted) {
    const original = missing.find((row) => row.id === version.parent_id);
    for (const { column_name: field } of columns) {
      if (JSON.stringify(version[field]) !== JSON.stringify(original[field.slice('version_'.length)])) {
        throw new Error(`Version differs from publication ${original.id}: ${field}`);
      }
    }
  }
  const expectedRelationships = await client.query('SELECT count(*)::int AS count FROM publications_rels WHERE parent_id = ANY($1::int[])', [missing.map((row) => row.id)]);
  if (relationships.rowCount !== expectedRelationships.rows[0].count) throw new Error('Relationship count changed while copying versions.');
  return { seededVersions: inserted.length, copiedRelationships: relationships.rowCount };
}

async function main() {
  // Match Next's environment precedence without printing connection credentials.
  for (const name of ['.env.local', '.env']) {
    const file = path.join(scriptDir, '..', name);
    if (fs.existsSync(file)) process.loadEnvFile(file);
  }
  if (!process.env.DATABASE_URI) throw new Error('DATABASE_URI is required.');
  const apply = process.argv.includes('--apply');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URI });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '30s'");
    await client.query('LOCK TABLE publications, publications_rels, _publications_v, _publications_v_rels IN SHARE ROW EXCLUSIVE MODE');
    const readOriginals = async () => ({
      publications: (await client.query('SELECT * FROM publications ORDER BY id')).rows,
      relationships: (await client.query('SELECT * FROM publications_rels ORDER BY id')).rows,
    });
    const before = await readOriginals();
    if (apply) {
      const backupDir = path.join(scriptDir, 'part12-backups');
      fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
      fs.writeFileSync(path.join(backupDir, `publications-before-version-backfill-${Date.now()}.json`), JSON.stringify({
        ...before,
        versions: (await client.query('SELECT * FROM _publications_v ORDER BY id')).rows,
        versionRelationships: (await client.query('SELECT * FROM _publications_v_rels ORDER BY id')).rows,
      }), { mode: 0o600, flag: 'wx' });
    }
    const result = await backfillPublicationVersions(client);
    if (JSON.stringify(await readOriginals()) !== JSON.stringify(before)) throw new Error('Original publication data changed; rolling back.');
    await client.query(apply ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ mode: apply ? 'applied' : 'dry-run', ...result, originalPublicationsUnchanged: true }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

// Preview by default; --apply commits only after the preservation checks pass.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
