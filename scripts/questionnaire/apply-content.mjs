import nextEnv from '@next/env';
import { Client } from 'pg';
import { mkdir, writeFile } from 'node:fs/promises';
import { APPROVED_DOMAIN_INDUSTRIES, approvedByline } from '../../src/lib/content/questionnaire.ts';

// Q14/Q16 only. Policy, careers, tags and Arabic drafts need separate approval.
// The default is a read-only preview; --apply backs up the rows and writes one transaction.
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const apply = process.argv.includes('--apply');
const db = new Client({ connectionString: process.env.DATABASE_URI, connectionTimeoutMillis: 5000, query_timeout: 10000 });
try {
  if (!process.env.DATABASE_URI) throw new Error('Database not configured.');
  await db.connect();
  await db.query('BEGIN');
  await db.query("SET LOCAL lock_timeout = '5s'");
  // Apply mode locks the affected content so a concurrent editor save cannot be overwritten.
  const { rows: domains } = await db.query(`SELECT id, slug FROM domains${apply ? ' FOR UPDATE' : ''}`);
  const { rows: industries } = await db.query('SELECT id, slug FROM industries');
  const { rows: publications } = await db.query(`SELECT id, slug, author FROM publications ORDER BY id${apply ? ' FOR UPDATE' : ''}`);
  const { rows: rels } = await db.query("SELECT * FROM domains_rels WHERE path='relevantIndustries'");
  // Resolve every expected relationship before the first mutation.
  for (const [slug, slugs] of Object.entries(APPROVED_DOMAIN_INDUSTRIES)) {
    if (!domains.some(d => d.slug === slug) || slugs.some(s => !industries.some(i => i.slug === s))) throw new Error('Approved taxonomy records are missing.');
  }
  const changed = publications.filter(p => p.author && approvedByline(p.author) !== p.author);
  console.log(`Approved mapping: 4 domains / 34 relationships. Bylines needing normalization: ${changed.length}. Mode: ${apply ? 'apply' : 'preview'}.`);
  if (apply) {
    await mkdir('scripts/questionnaire/backups', { recursive: true });
    // Backups may contain unpublished content. Keep them private and out of git.
    await writeFile(`scripts/questionnaire/backups/content-${Date.now()}.json`, JSON.stringify({ domains, industries, publications, rels }, null, 2), { mode: 0o600 });
    for (const [slug, slugs] of Object.entries(APPROVED_DOMAIN_INDUSTRIES)) {
      const id = domains.find(d => d.slug === slug).id;
      await db.query("DELETE FROM domains_rels WHERE parent_id=$1 AND path='relevantIndustries'", [id]);
      for (const [order, s] of slugs.entries()) {
        await db.query('INSERT INTO domains_rels("order", parent_id, path, industries_id) VALUES ($1,$2,$3,$4)', [order + 1, id, 'relevantIndustries', industries.find(i => i.slug === s).id]);
      }
    }
    for (const row of changed) await db.query('UPDATE publications SET author=$1, updated_at=now() WHERE id=$2', [approvedByline(row.author), row.id]);
    await db.query('COMMIT');
    console.log('Approved content applied. Redeploy to refresh generated pages.');
  } else await db.query('ROLLBACK');
} catch {
  await db.query('ROLLBACK').catch(() => {});
  console.error('Content update stopped. Check database connectivity and the existing schema; no partial transaction was committed.');
  process.exitCode = 1;
} finally { await db.end().catch(() => {}); }
