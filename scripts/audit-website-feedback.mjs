// Read-only evidence for the feedback review. Never initializes Payload or a provider.
import nextEnv from '@next/env';
import pg from 'pg';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const client = new pg.Client({ connectionString: process.env.DATABASE_URI, connectionTimeoutMillis: 10000, query_timeout: 10000 });
const text = node => {
  if (!node || typeof node !== 'object') return '';
  return typeof node.text === 'string' ? node.text : (node.children ?? []).map(text).join(' ');
};
const uploads = node => {
  if (!node || typeof node !== 'object') return 0;
  return Number(node.type === 'upload') + (node.children ?? []).reduce((sum, child) => sum + uploads(child), 0);
};
try {
  await client.connect();
  await client.query('BEGIN READ ONLY');
  const { rows: pubs } = await client.query("SELECT slug, title, content FROM publications WHERE record_kind = 'article' AND _status = 'published' ORDER BY slug");
  const publications = [];
  for (const pub of pubs) {
    let rebuilt;
    try { rebuilt = JSON.parse(await readFile(`scripts/publication-rebuild/out/${pub.slug}.json`, 'utf8')); } catch { /* A later article may not be in the archive rebuild. */ }
    publications.push({ slug: pub.slug, title: pub.title, bodyCharacters: text(pub.content?.root).length,
      bodyImages: uploads(pub.content?.root), rebuiltCharacters: rebuilt ? text(rebuilt.root).length : null,
      matchesRebuiltText: rebuilt ? text(rebuilt.root) === text(pub.content?.root) : null });
  }
  const { rows: jobs } = await client.query("SELECT record FROM enerqa_connectors.external_records WHERE provider = 'enerqa-news-sync' AND source_id = 'scheduled-news-v1'");
  const { rows: feeds } = await client.query(`SELECT provider, count(*)::int AS saved_records,
    max(retrieved_at) AS latest_retrieval, max(record->>'publishedAt') AS latest_publication,
    count(*) FILTER (WHERE record->>'imageUrl' IS NOT NULL)::int AS with_images
    FROM enerqa_connectors.external_records WHERE provider = ANY($1::text[]) GROUP BY provider`, [['newsdata', 'gdelt', 'eia_rss', 'eea_rss']]);
  const state = jobs[0]?.record ?? {};
  const result = { checkedAt: new Date().toISOString(), publications, feeds,
    newsJob: { lastAttemptAt: state.lastAttemptAt ?? null, lastCompletedAt: state.lastCompletedAt ?? null,
      lastSuccessAt: state.lastSuccessAt ?? {}, providers: state.diagnostics?.providers ?? [] } };
  await client.query('ROLLBACK');
  await mkdir('docs/feedback', { recursive: true });
  await writeFile('docs/feedback/current-content-audit.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ publications: publications.length, withoutBodyImages: publications.filter(pub => !pub.bodyImages).length,
    textDifferences: publications.filter(pub => pub.matchesRebuiltText === false).map(pub => pub.slug), feeds, newsJob: result.newsJob }, null, 2));
} catch (error) {
  console.error(`Read-only feedback audit failed (${error.code ?? 'configuration or connection error'}).`);
  process.exitCode = 1;
} finally { await client.end().catch(() => {}); }
