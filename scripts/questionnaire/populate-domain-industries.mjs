import nextEnv from '@next/env';
import { Client } from 'pg';
import { mkdir, writeFile } from 'node:fs/promises';
import { APPROVED_DOMAIN_INDUSTRIES } from '../../src/lib/content/questionnaire.ts';

// Preview by default. --apply populates empty fields only and preserves editor selections.
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
if (process.argv.slice(2).some(arg => arg !== '--apply')) {
  throw new Error('Usage: node scripts/questionnaire/populate-domain-industries.mjs [--apply]');
}
const apply = process.argv.includes('--apply');
const db = new Client({ connectionString: process.env.DATABASE_URI, connectionTimeoutMillis: 5000, query_timeout: 10000 });
try {
  if (!process.env.DATABASE_URI) throw new Error('Database not configured.');
  await db.connect();
  await db.query(apply ? 'BEGIN' : 'BEGIN READ ONLY');
  await db.query("SET LOCAL lock_timeout = '5s'");
  // Lock the parent documents during application, matching normal CMS update locking.
  const { rows: domains } = await db.query(`SELECT id, slug, updated_at FROM domains WHERE slug=ANY($1::text[]) ORDER BY id${apply ? ' FOR UPDATE' : ''}`, [Object.keys(APPROVED_DOMAIN_INDUSTRIES)]);
  const { rows: industries } = await db.query('SELECT id, slug FROM industries');
  const { rows: relationships } = await db.query("SELECT * FROM domains_rels WHERE parent_id=ANY($1::int[]) AND path='relevantIndustries' ORDER BY parent_id, \"order\"", [domains.map(domain => domain.id)]);
  // Resolve the entire initial mapping before writing anything, so missing records fail safely.
  const plan = Object.entries(APPROVED_DOMAIN_INDUSTRIES).map(([slug, slugs]) => {
    const domain = domains.find(row => row.slug === slug);
    const selected = slugs.map(slug => industries.find(row => row.slug === slug)?.id);
    if (!domain || selected.some(id => id === undefined)) throw new Error('An initial domain or industry record is missing.');
    const existing = relationships.filter(row => row.parent_id === domain.id);
    return { domain, selected, existing, populate: existing.length === 0 };
  });
  console.table(plan.map(({ domain, selected, existing, populate }) => ({
    domain: domain.slug, saved: existing.length, initial: selected.length,
    action: populate ? (apply ? 'populate' : 'would populate') : 'preserve saved selection',
  })));
  const pending = plan.filter(row => row.populate);
  if (apply && pending.length > 0) {
    // Preserve the previous relationship state privately before the atomic content update.
    await mkdir('scripts/questionnaire/backups', { recursive: true, mode: 0o700 });
    await writeFile(`scripts/questionnaire/backups/domain-industries-${Date.now()}.json`, JSON.stringify({ domains, relationships }, null, 2), { mode: 0o600 });
    for (const { domain, selected } of pending) {
      for (const [index, id] of selected.entries()) {
        await db.query('INSERT INTO domains_rels("order", parent_id, path, industries_id) VALUES ($1,$2,$3,$4)', [index + 1, domain.id, 'relevantIndustries', id]);
      }
      await db.query('UPDATE domains SET updated_at=clock_timestamp() WHERE id=$1', [domain.id]);
    }
  }
  await db.query(apply ? 'COMMIT' : 'ROLLBACK');
  console.log(apply ? `Populated ${pending.length} domains; existing selections were preserved.` : 'Preview only; no content changed.');
} catch {
  await db.query('ROLLBACK').catch(() => {});
  // Driver errors can include connection details. Never print credentials or raw errors.
  console.error('Industry population stopped. Check database connectivity and taxonomy records; no partial transaction was committed.');
  process.exitCode = 1;
} finally {
  await db.end().catch(() => {});
}
