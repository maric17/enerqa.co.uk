import nextEnv from '@next/env';
import { Client } from 'pg';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';

// The owner approved these replacements on 11 October; preview is the default.
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const apply = process.argv.includes('--apply');
const titles = { privacy: 'Privacy Notice', terms: 'Terms of Use', 'cookie-choices': 'Cookie Choices', accessibility: 'Accessibility Statement' };
const version = '2';
const approvalDate = '2026-10-11T00:00:00.000Z'; // A date-only record, not an inferred approval time.
const approvedBy = 'Islam Abuhiss, Director';
const markdown = await readFile(new URL('../../docs/questionnaire/POLICIES-APPROVED.md', import.meta.url), 'utf8');
const text = value => ({ type: 'text', version: 1, text: value, format: 0, detail: 0, mode: 'normal', style: '' });
const container = (type, children, extra = {}) => ({ type, version: 1, children, direction: 'ltr', format: '', indent: 0, ...extra });

function inline(value) {
  const nodes = [];
  let offset = 0;
  // Only the simple labelled links in the approved source are interpreted.
  for (const match of value.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
    if (!/^(\/[^/]|https:\/\/|mailto:)/.test(match[2])) throw new Error('Invalid policy link.');
    if (match.index > offset) nodes.push(text(value.slice(offset, match.index)));
    nodes.push(container('link', [text(match[1])], { version: 3, fields: { linkType: 'custom', url: match[2], newTab: false } }));
    offset = match.index + match[0].length;
  }
  if (offset < value.length) nodes.push(text(value.slice(offset)));
  return nodes;
}

const policies = Object.entries(titles).map(([slug, title]) => {
  const section = markdown.split(`\n## ${title}\n`)[1]?.split('\n## ')[0]?.trim();
  if (!section) throw new Error('An approved policy section is missing.');
  const children = section.split(/\n\s*\n/).map(block => block.startsWith('### ')
    ? container('heading', [text(block.slice(4).trim())], { tag: 'h2' })
    : container('paragraph', inline(block.replace(/\n/g, ' ')), { textFormat: 0, textStyle: '' }));
  return { slug, title, content: { root: container('root', children) } };
});

const db = new Client({ connectionString: process.env.DATABASE_URI, connectionTimeoutMillis: 5000, query_timeout: 10000 });
try {
  if (!process.env.DATABASE_URI) throw new Error('Database not configured.');
  // Active services need different wording. Do not silently publish stale inactive-service text.
  for (const flag of ['SENDPULSE_ENABLED', 'ANALYTICS_RELEASE_READY', 'FORMS_RETENTION_ENABLED']) {
    if (process.env[flag] === 'true') throw new Error('Policy service state differs from the approved source.');
  }
  await db.connect();
  await db.query(apply ? 'BEGIN' : 'BEGIN READ ONLY');
  await db.query("SET LOCAL lock_timeout = '5s'");
  const { rows } = await db.query(`SELECT * FROM policies WHERE slug = ANY($1) ORDER BY slug${apply ? ' FOR UPDATE' : ''}`, [Object.keys(titles)]);
  if (rows.length !== 4) throw new Error('Expected four existing policy rows.');
  const changed = policies.filter(policy => {
    const row = rows.find(item => item.slug === policy.slug);
    if (!['1', version].includes(row.policy_version)) throw new Error('Unexpected policy version; review before overwriting.');
    // JSONB may reorder keys; compare values so a second preview is genuinely unchanged.
    return row.title !== policy.title || !isDeepStrictEqual(row.content, policy.content) || row.policy_version !== version || row.approved_by !== approvedBy || new Date(row.approved_on).toISOString() !== approvalDate || !row.approved;
  });
  console.log(`Policy ${apply ? 'apply' : 'preview'}: ${changed.length}/4 replacements; version ${version}, approval date 11 October 2026.`);
  if (apply && changed.length) {
    // Back up all four locked rows privately before the first write.
    await mkdir(new URL('./backups/', import.meta.url), { recursive: true });
    await writeFile(new URL(`./backups/policies-${Date.now()}.json`, import.meta.url), JSON.stringify(rows, null, 2), { mode: 0o600 });
    for (const policy of changed) {
      await db.query('UPDATE policies SET title=$1, content=$2::jsonb, approved=true, approved_by=$3, approved_on=$4, policy_version=$5, updated_at=now() WHERE slug=$6',
        [policy.title, JSON.stringify(policy.content), approvedBy, approvalDate, version, policy.slug]);
    }
    await db.query('COMMIT');
    console.log(`${changed.length} approved replacements published. Direct SQL does not invoke the CMS cache hook; rebuild/redeploy generated pages.`);
  } else await db.query('ROLLBACK');
} catch {
  await db.query('ROLLBACK').catch(() => {});
  console.error('Policy publication stopped; check connectivity, versions and inactive-service settings. No partial transaction was committed.');
  process.exitCode = 1;
} finally { await db.end().catch(() => {}); }
