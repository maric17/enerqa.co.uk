import nextEnv from '@next/env';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

// Compare precise sector queries with/without provider industry tags. Never publish the sample.
nextEnv.loadEnvConfig(path.resolve(import.meta.dirname, '..'), true, { info() {}, error() {} });

async function main() {
  if (process.argv.slice(2).join(' ') !== '--manual') throw new Error('Run with --manual for six diagnostic requests.');
  const { fetchFromProvider, providerKey } = await import('../src/lib/api/core/fetch');
  const { providerDatabase } = await import('../src/lib/api/core/storage');
  const { LIMITS } = await import('../src/lib/api/core/health');
  const { apiTubeQuery, mapApiTubeResults, rejectApiTubeBody } = await import('../src/lib/api/news/apitube');
  const { apiTubeTopics } = await import('../src/lib/api/news/apitubeScreening');
  const { toTeaser, PAGE_NEWS_PROVIDERS } = await import('../src/lib/api/news');
  const { isAllowedDomain } = await import('../src/lib/api/news/types');
  const db = providerDatabase();
  const key = providerKey('apitube');
  if (!db || !key || PAGE_NEWS_PROVIDERS.join(',') !== 'apitube') throw new Error('APITube-only local configuration is required.');
  const originalDaily = LIMITS.apitube!.daily;
  const cases = [
    { sector: 'finance', ids: ['399', '423', '440'], query: '"climate finance" OR "green bond" OR "sustainable finance" OR "transition finance" OR "climate risk"' },
    { sector: 'water-waste', ids: ['398', '397', '395'], query: '"water management" OR "water supply" OR wastewater OR sewage OR recycling OR "circular economy" OR "waste management" OR desalination OR "water treatment"' },
    { sector: 'health-education-estates', ids: ['549', '556', '322'], query: '(hospital OR campus OR university OR school) AND ("net zero" OR solar OR decarbonization OR decarbonisation OR "energy efficiency" OR "water efficiency" OR "waste management")' },
  ].flatMap(trial => [false, true].map(structured => ({ ...trial, structured })));
  const started = Date.now();
  const output = `docs/feedback/APITUBE-TARGETED-COVERAGE-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  try {
    // Balance is a free account check. Discard the response's api_key field immediately.
    const balanceReply = await fetch('https://api.apitube.io/v1/balance', { headers: { 'X-API-Key': key }, signal: AbortSignal.timeout(30000) });
    const balance = await balanceReply.json();
    if (!balanceReply.ok || balanceReply.headers.get('x-apitube-mode') !== 'live' || !Number.isInteger(balance.points) || balance.points < cases.length + 5) {
      throw new Error('Insufficient verified account allowance for six requests.');
    }
    const usage = async () => (await db.query<{ provider: string; today: number; total: number }>(`SELECT provider,
      count(*) FILTER (WHERE requested_at >= date_trunc('day',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')::int AS today,
      count(*)::int AS total FROM enerqa_connectors.provider_requests
      WHERE provider IN ('apitube','thenewsapi','newsdata','gdelt','openai') GROUP BY provider ORDER BY provider`)).rows;
    const fingerprints = async () => (await db.query(`SELECT provider,count(*)::int AS count,
      md5(string_agg(md5(record::text),'' ORDER BY source_id)) AS fingerprint FROM enerqa_connectors.external_records
      WHERE provider IN ('apitube','thenewsapi','newsdata','gdelt','eia_rss','eea_rss','enerqa-news-sync') GROUP BY provider ORDER BY provider`)).rows;
    const before = await usage();
    const recordsBefore = await fingerprints();
    // Only this process receives these six slots; retain shared accounting, pacing and defaults.
    LIMITS.apitube!.daily = Math.max(originalDaily, (before.find(row => row.provider === 'apitube')?.today ?? 0) + cases.length);
    const results: Record<string, unknown>[] = [];
    const report = { checkedAt: new Date().toISOString(), diagnosticOnly: true, completed: false,
      sourceDomains: null, categoryFilter: null, perPage: 10, dateWindowDays: 31,
      account: { plan: String(balance.plan), points: balance.points }, defaultDailyLimit: originalDaily,
      auditProcessDailyLimit: LIMITS.apitube!.daily, results, requestsBefore: before, requestsAfter: before,
      recordsUnchanged: false, elapsedSeconds: 0 };
    const save = () => writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
    for (const trial of cases) {
      const end = new Date();
      const params = new URLSearchParams({ query: apiTubeQuery(trial.query), 'language.code': 'en', per_page: '10',
        'published_at.start': new Date(end.getTime() - 31 * 86400000).toISOString(), 'published_at.end': end.toISOString(),
        'sort.by': 'published_at', 'sort.order': 'desc',
        fl: 'id,title,description,href,published_at,language,categories,industries,source',
        ...(trial.structured ? { 'industry.id': trial.ids.join(',') } : {}),
      });
      const response = await fetchFromProvider<{ results: unknown[] }>('apitube', `https://api.apitube.io/v1/news/everything?${params}`, {
        headers: { 'X-API-Key': key }, fresh: true, timeoutMs: 30000, rejectBody: rejectApiTubeBody,
        errorCode: body => String((body as { errors?: { code?: unknown }[] })?.errors?.[0]?.code ?? ''),
      });
      const raw = response.ok ? response.data.results : [];
      const items = response.ok ? mapApiTubeResults(raw, response.retrievedAt) : [];
      const industryEvidence = new Map(raw.flatMap(article => {
        if (!article || typeof article !== 'object') return [];
        const value = article as { href?: string; industries?: { id?: unknown; name?: unknown }[] };
        return value.href ? [[value.href, (Array.isArray(value.industries) ? value.industries : []).map(industry => ({
          id: String(industry.id ?? ''), name: typeof industry.name === 'string' ? industry.name : '',
        }))] as const] : [];
      }));
      results.push({ sector: trial.sector, query: trial.query, industryFilter: trial.structured ? trial.ids : null,
        ok: response.ok, ...(!response.ok ? { reason: response.reason } : {}), received: items.length,
        articles: items.map(item => { const teaserItem = { ...item, summary: toTeaser(item.summary) }; return {
          title: item.title, summary: teaserItem.summary, url: item.url, publisher: item.publisher,
          currentlyAllowedPublisher: isAllowedDomain(item.domain), publishedAt: item.publishedAt,
          topics: apiTubeTopics(teaserItem), categories: item.providerCategories, industries: industryEvidence.get(item.url) ?? [],
          sectorReview: 'pending', accessCheck: 'not_run',
        }; }),
      });
      report.requestsAfter = await usage();
      save();
      console.log(JSON.stringify({ sector: trial.sector, structured: trial.structured, ok: response.ok, received: items.length }));
      if (!response.ok && response.reason === 'rate_limited') break;
    }
    report.completed = results.length === cases.length && results.every(result => result.ok === true);
    report.recordsUnchanged = JSON.stringify(recordsBefore) === JSON.stringify(await fingerprints());
    const others = (rows: typeof before) => rows.filter(row => row.provider !== 'apitube');
    if (!report.recordsUnchanged || JSON.stringify(others(before)) !== JSON.stringify(others(report.requestsAfter))) report.completed = false;
    report.elapsedSeconds = Math.round((Date.now() - started) / 100) / 10;
    save();
    console.log(JSON.stringify({ output, completed: report.completed, recordsUnchanged: report.recordsUnchanged }));
    if (!report.completed) process.exitCode = 2;
  } finally { LIMITS.apitube!.daily = originalDaily; await db.end(); }
}

main().catch(() => { console.error('Targeted coverage check did not complete; no news publication was requested.'); process.exitCode = 1; });
