import nextEnv from '@next/env';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import type { Payload, PayloadRequest } from 'payload';
import type { Publication } from '../src/payload-types';

const fields = ['domains', 'industries', 'tools', 'datasets'] as const;
type Field = typeof fields[number];
type Assignment = Record<Field, string[]> & { slug: string; title: string; rationale: string };
const root = path.resolve(import.meta.dirname, '..');
const apply = process.argv.includes('--apply');

// Match local development settings, and never push schema changes to the shared DB.
nextEnv.loadEnvConfig(root, true, { info() {}, error() {} });
process.env.PAYLOAD_SCHEMA_PUSH = 'false';

function ids(value: unknown): number[] {
  return Array.isArray(value) ? value.map(item => typeof item === 'object' ? item.id : item).sort((a, b) => a - b) : [];
}

function contentOnly(publication: Publication) {
  // Compare the CMS view, which already applies the approved byline normalization.
  // Relationship updates and the save timestamp may differ; article content may not.
  const result = { ...publication } as Record<string, unknown>;
  for (const key of [...fields, 'updatedAt']) delete result[key];
  return result;
}

async function main() {
  const plan = JSON.parse(await readFile(path.join(root, 'docs/questionnaire/PUBLICATION-TAGS.json'), 'utf8')) as { articles: Assignment[] };
  const { getPayload } = await import('payload');
  const { default: config } = await import('../src/payload.config');
  const payload: Payload = await getPayload({ config });
  const transactionID = await payload.db.beginTransaction();
  if (!transactionID) throw new Error('A transaction is required.');
  const req: Partial<PayloadRequest> = { transactionID };

  try {
    const targets = new Map<Field, Map<string, number>>();
    for (const collection of fields) {
      const result = await payload.find({ collection, depth: 0, pagination: false, overrideAccess: true, req });
      targets.set(collection, new Map(result.docs.filter(record => {
        // Link only public tools and datasets; tagging never changes their access status.
        if (collection === 'tools') return 'validated' in record && record.validated === true;
        if (collection === 'datasets') return 'status' in record && record.status === 'verified_open' &&
          'accessStatus' in record && record.accessStatus === 'verified_open';
        return true;
      }).map(record => [record.slug, record.id])));
    }

    const query = { collection: 'publications' as const, depth: 0, pagination: false, overrideAccess: true, req };
    const originals = (await payload.find({ ...query, draft: false, where: { recordKind: { equals: 'article' } } })).docs;
    const latest = (await payload.find({ ...query, draft: true, where: { recordKind: { equals: 'article' } } })).docs;
    const bySlug = new Map(plan.articles.map(article => [article.slug, article]));
    if (bySlug.size !== plan.articles.length || originals.length !== bySlug.size ||
      originals.some(article => !bySlug.has(article.slug))) throw new Error('The plan must cover every current article exactly once.');

    const changes = originals.map(original => {
      const assignment = bySlug.get(original.slug)!;
      const version = latest.find(article => article.id === original.id);
      // An unrelated draft must not be published by a metadata update.
      if (original._status !== 'published' || !version || version._status !== 'published' ||
        !isDeepStrictEqual(contentOnly(original), contentOnly(version))) throw new Error('An article has a changed or unpublished draft; refresh the review before applying.');
      if (original.title !== assignment.title || !assignment.domains.length || !assignment.industries.length) {
        throw new Error('An article changed or is missing its domain/industry assignment.');
      }
      const data = Object.fromEntries(fields.map(field => {
        const slugs = assignment[field];
        if (new Set(slugs).size !== slugs.length) throw new Error('An assignment contains duplicate relationships.');
        return [field, slugs.map(slug => {
          const id = targets.get(field)!.get(slug);
          if (id === undefined) throw new Error(`A ${field} relationship is missing or unpublished.`);
          return id;
        })];
      })) as Record<Field, number[]>;
      return { original, data, changed: fields.some(field => !isDeepStrictEqual(ids(original[field]), ids(data[field]))) };
    });

    console.log(JSON.stringify({ mode: apply ? 'apply' : 'preview', articles: originals.length,
      changes: changes.filter(change => change.changed).length,
      relationships: Object.fromEntries(fields.map(field => [field, changes.reduce((total, change) => total + change.data[field].length, 0)])) }));

    if (!apply) {
      await payload.db.rollbackTransaction(transactionID);
      return;
    }

    const backupDir = path.join(root, 'scripts/questionnaire/backups');
    await mkdir(backupDir, { recursive: true, mode: 0o700 });
    const backup = path.join(backupDir, `publication-tags-${Date.now()}.json`);
    await writeFile(backup, JSON.stringify({ originals, latest, plan }, null, 2), { mode: 0o600, flag: 'wx' });

    for (const [index, change] of changes.entries()) {
      if (!change.changed) continue;
      // The CMS updates relationships and saves a version in the same transaction.
      const updated = await payload.update({ collection: 'publications', id: change.original.id,
        data: { ...change.data, _status: change.original._status }, draft: false, depth: 0, overrideAccess: true, req });
      if (!isDeepStrictEqual(contentOnly(change.original), contentOnly(updated))) {
        throw new Error('Publication content changed; all metadata changes will be rolled back.');
      }
      for (const field of fields) {
        if (!isDeepStrictEqual(ids(updated[field]), ids(change.data[field]))) throw new Error('A saved relationship differs from the plan.');
      }
      if ((index + 1) % 5 === 0) console.log(`Verified ${index + 1}/${changes.length} article assignments.`);
    }

    // Confirm both anonymous/public reads and the editor's latest versions agree.
    const publicDocs = (await payload.find({ ...query, overrideAccess: false, draft: false })).docs;
    const editorDocs = (await payload.find({ ...query, draft: true })).docs;
    for (const { original, data } of changes) {
      const pub = publicDocs.find(doc => doc.id === original.id);
      const editor = editorDocs.find(doc => doc.id === original.id);
      if (!pub || !editor) throw new Error('An article disappeared from the public or editor view.');
      for (const field of fields) {
        if (!isDeepStrictEqual(ids(pub[field]), ids(data[field])) || !isDeepStrictEqual(ids(editor[field]), ids(data[field]))) {
          throw new Error('The public article and latest editor version disagree.');
        }
      }
    }
    if (publicDocs.some(doc => doc._status !== 'published' || doc.recordKind !== 'article')) throw new Error('An unpublished record entered the public list.');
    await payload.db.commitTransaction(transactionID);
    console.log(JSON.stringify({ applied: changes.filter(change => change.changed).length,
      publicArticles: publicDocs.length, editorRelationshipsVerified: true, contentPreserved: true, backup: path.relative(root, backup) }));
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID);
    throw error;
  }
}

// Standalone Payload holds a listener connection; explicitly exit after cleanup.
main().then(() => process.exit(0)).catch(error => {
  console.error(error instanceof Error ? error.message : 'Publication tagging could not complete.');
  process.exit(1);
});
