import nextEnv from '@next/env';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { EDITORIAL_REVIEW_VERSION, hasEditorialApproval, hasEditorialRejection, type EditorialReview, type NewsItem } from '../src/lib/api/news/types';

async function main() {
  const args = process.argv.slice(2);
  // A dry run is the default; publication decisions need an explicit operator action.
  if (!['--check', '--apply'].includes(args[0]) || !(args.length === 1 || (args.length === 3 && args[1] === '--manifest'))) throw new Error('Use --check or --apply, optionally followed by --manifest and a local path.');
  const manifestPath = args[2] ?? 'docs/feedback/NEWS-EDITORIAL-REVIEW-2026-10-23.json';
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.reviewVersion !== EDITORIAL_REVIEW_VERSION || !Array.isArray(manifest.items) || !manifest.items.length || manifest.items.length > 80) throw new Error('Invalid editorial manifest.');
  const reviewedAt = new Date().toISOString();
  const ids = new Set<string>();
  const reviews = manifest.items.map((item: { provider: string; sourceId: string; url: string; title: string; summary: string | null; decision: EditorialReview['decision']; topics: EditorialReview['topics']; reason: string }) => {
    if (item.provider !== 'thenewsapi' || typeof item.sourceId !== 'string' || ids.has(item.sourceId)
      || typeof item.title !== 'string' || typeof item.url !== 'string' || (item.summary !== null && typeof item.summary !== 'string')) throw new Error('Invalid article identity.');
    ids.add(item.sourceId);
    const editorialReview: EditorialReview = { version: EDITORIAL_REVIEW_VERSION, decision: item.decision, topics: item.topics,
      title: item.title, summary: item.summary, reason: item.reason, reviewedAt };
    if (!hasEditorialApproval({ ...item, editorialReview }) && !(hasEditorialRejection({ ...item, editorialReview }) && item.topics.length === 0)) throw new Error('Invalid editorial verdict.');
    return { ...item, editorialReview };
  });
  nextEnv.loadEnvConfig(path.resolve(import.meta.dirname, '..'), true, { info() {}, error() {} });
  const { providerDatabase } = await import('../src/lib/api/core/storage');
  const db = providerDatabase();
  if (!db) throw new Error('News storage is unavailable.');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL statement_timeout = '10s'");
    // Lock the reviewed rows so a concurrent provider refresh cannot change the evidence mid-review.
    const { rows } = await client.query<{ source_id: string; destination: string; record: NewsItem }>(
      "SELECT source_id, destination, record FROM enerqa_connectors.external_records WHERE provider = 'thenewsapi' AND source_id = ANY($1::text[]) FOR UPDATE", [[...ids]]);
    for (const review of reviews) {
      const saved = rows.find(row => row.source_id === review.sourceId);
      if (!saved || saved.destination !== review.url || saved.record.url !== review.url || saved.record.title !== review.title || saved.record.summary !== review.summary) throw new Error('An article changed; prepare a fresh review.');
      if (args[0] === '--apply') {
        // Change only the decision; original text, dates, rights and anonymous-access evidence stay intact.
        await client.query("UPDATE enerqa_connectors.external_records SET record = jsonb_set(record, '{editorialReview}', $2::jsonb) WHERE provider = 'thenewsapi' AND source_id = $1",
          [review.sourceId, JSON.stringify(review.editorialReview)]);
      }
    }
    await client.query(args[0] === '--apply' ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ applied: args[0] === '--apply', reviewed: reviews.length,
      approved: reviews.filter(review => review.decision === 'approved').length,
      rejected: reviews.filter(review => review.decision === 'rejected').length }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release(); await db.end();
  }
}

void main().catch(() => {
  // Native database errors can contain credentials, so expose a fixed message only.
  console.error('Editorial review was not applied. Recheck the manifest against the current saved articles.');
  process.exitCode = 1;
});
