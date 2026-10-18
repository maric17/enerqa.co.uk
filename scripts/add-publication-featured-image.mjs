import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
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
  await client.query('LOCK TABLE publications, _publications_v IN SHARE ROW EXCLUSIVE MODE');
  const originalData = async () => ({
    publications: (await client.query("SELECT to_jsonb(p) - 'featured_image_id' AS row FROM publications p ORDER BY id")).rows,
    versions: (await client.query("SELECT to_jsonb(v) - 'version_featured_image_id' AS row FROM _publications_v v ORDER BY id")).rows,
  });
  const before = await originalData();
  if (apply) {
    const backupDir = path.join(scriptDir, 'part12-backups');
    fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
    fs.writeFileSync(path.join(backupDir, `publications-before-featured-image-${Date.now()}.json`), JSON.stringify(before), { mode: 0o600, flag: 'wx' });
  }
  // Add optional media references to both published documents and saved drafts.
  await client.query(`
    ALTER TABLE publications ADD COLUMN IF NOT EXISTS featured_image_id integer;
    ALTER TABLE _publications_v ADD COLUMN IF NOT EXISTS version_featured_image_id integer;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publications_featured_image_id_media_id_fk' AND conrelid = 'publications'::regclass) THEN
        ALTER TABLE publications ADD CONSTRAINT publications_featured_image_id_media_id_fk
          FOREIGN KEY (featured_image_id) REFERENCES media(id) ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_publications_v_version_featured_image_id_media_id_fk' AND conrelid = '_publications_v'::regclass) THEN
        ALTER TABLE _publications_v ADD CONSTRAINT _publications_v_version_featured_image_id_media_id_fk
          FOREIGN KEY (version_featured_image_id) REFERENCES media(id) ON DELETE SET NULL;
      END IF;
    END $$;
    CREATE INDEX IF NOT EXISTS publications_featured_image_idx ON publications(featured_image_id);
    CREATE INDEX IF NOT EXISTS _publications_v_version_version_featured_image_idx ON _publications_v(version_featured_image_id);
  `);
  // A failed preservation check rolls back the entire schema addition.
  if (JSON.stringify(await originalData()) !== JSON.stringify(before)) throw new Error('Publication data changed unexpectedly.');
  await client.query(apply ? 'COMMIT' : 'ROLLBACK');
  console.log(JSON.stringify({ mode: apply ? 'applied' : 'dry-run', publications: before.publications.length, versions: before.versions.length, originalDataUnchanged: true }));
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
