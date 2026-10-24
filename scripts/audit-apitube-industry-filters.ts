import nextEnv from '@next/env';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

// These five diagnostic requests test documented filters without publishing their results.
nextEnv.loadEnvConfig(path.resolve(import.meta.dirname, '..'), true, { info() {}, error() {} });

async function main() {
  if (process.argv.slice(2).join(' ') !== '--manual') throw new Error('Run with --manual to spend five budgeted diagnostic requests.');
  const { providerDatabase } = await import('../src/lib/api/core/storage');
  const { fetchFromProvider, providerKey } = await import('../src/lib/api/core/fetch');
  const { apiTubeQuery, mapApiTubeResults, rejectApiTubeBody, API_TUBE_SOURCES } = await import('../src/lib/api/news/apitube');
  const { apiTubeTopics } = await import('../src/lib/api/news/apitubeScreening');
  const { toTeaser, PAGE_NEWS_PROVIDERS } = await import('../src/lib/api/news');
  const apiKey = providerKey('apitube');
  const db = providerDatabase();
  if (!db || !apiKey || PAGE_NEWS_PROVIDERS.join(',') !== 'apitube') throw new Error('APITube evaluation configuration is required.');
  const cases = [
    { label: 'finance-industries', industries: '399,423,440', query: 'climate OR sustainab* OR ESG OR "green bond" OR "energy transition"', sources: API_TUBE_SOURCES.join(',') },
    { label: 'health-education-industries', industries: '549,556,322', query: 'climate OR energy OR water OR emissions OR sustainab* OR "heat pump" OR "net zero"', sources: API_TUBE_SOURCES.join(',') },
    { label: 'water-industries', industries: '398,397,395', query: '', sources: API_TUBE_SOURCES.join(',') },
    { label: 'bbc-source-availability', industries: '', query: '', sources: 'bbc.co.uk' },
    { label: 'reuters-source-availability', industries: '', query: '', sources: 'reuters.com' },
  ];
  const fingerprints = async () => (await db.query("SELECT provider,count(*)::int AS count,md5(string_agg(md5(record::text), '' ORDER BY source_id)) AS fingerprint FROM enerqa_connectors.external_records WHERE provider IN ('apitube','thenewsapi','newsdata','gdelt','eia_rss','eea_rss','enerqa-news-sync') GROUP BY provider ORDER BY provider")).rows;
  const usage = async () => (await db.query("SELECT count(*)::int AS requests FROM enerqa_connectors.provider_requests WHERE provider='apitube' AND requested_at >= date_trunc('day',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'")).rows[0].requests as number;
  try {
    const before = await fingerprints();
    const dailyBefore = await usage();
    if (80 - dailyBefore < cases.length) throw new Error('Insufficient remaining daily budget for the five-filter comparison.');
    const report: { checkedAt: string; diagnosticOnly: boolean; dailyBefore: number; dailyAfter?: number;
      recordsUnchanged?: boolean; dateWindowDays: number; results: Record<string, unknown>[] } = {
      checkedAt: new Date().toISOString(), diagnosticOnly: true, dailyBefore, dateWindowDays: 31, results: [],
    };
    for (const trial of cases) {
      const end = new Date();
      const params = new URLSearchParams({ 'source.domain': trial.sources, 'language.code': 'en', per_page: '10',
        'published_at.start': new Date(end.getTime() - 31 * 86400000).toISOString(), 'published_at.end': end.toISOString(),
        'sort.by': 'published_at', 'sort.order': 'desc', fl: 'id,title,description,href,published_at,language,categories,industries,source',
        ...(trial.query ? { query: apiTubeQuery(trial.query) } : {}), ...(trial.industries ? { 'industry.id': trial.industries } : {}),
      });
      const result = await fetchFromProvider<{ results: unknown[] }>('apitube', `https://api.apitube.io/v1/news/everything?${params}`, {
        headers: { 'X-API-Key': apiKey }, fresh: true, timeoutMs: 30000, rejectBody: rejectApiTubeBody,
        errorCode: body => String((body as { errors?: { code: string }[] } | null)?.errors?.[0]?.code ?? ''),
      });
      const raw = result.ok ? result.data.results : [];
      const items = result.ok ? mapApiTubeResults(raw, result.retrievedAt).map(item => ({ ...item, summary: toTeaser(item.summary) })) : [];
      report.results.push({ ...trial, ok: result.ok, ...(!result.ok ? { reason: result.reason } : {}), received: items.length,
        articles: items.map(item => ({ title: item.title, summary: item.summary, url: item.url, publisher: item.publisher,
          publishedAt: item.publishedAt, topics: apiTubeTopics(item), categories: item.providerCategories })),
        returnedIndustryEvidence: raw.map(article => {
          const industries = (article as { industries?: { id?: unknown; name?: unknown }[] }).industries;
          return (Array.isArray(industries) ? industries : []).map(industry => ({
            id: typeof industry.id === 'number' || typeof industry.id === 'string' ? String(industry.id) : null,
            name: typeof industry.name === 'string' ? industry.name : null,
          }));
        }),
      });
      console.log(JSON.stringify({ label: trial.label, ok: result.ok, received: items.length }));
    }
    report.dailyAfter = await usage();
    report.recordsUnchanged = JSON.stringify(before) === JSON.stringify(await fingerprints());
    writeFileSync(`docs/feedback/APITUBE-INDUSTRY-FILTERS-${new Date().toISOString().slice(0, 10)}.json`, `${JSON.stringify(report, null, 2)}\n`);
    if (!report.recordsUnchanged) throw new Error('News records changed during the read-only filter comparison.');
  } finally { await db.end(); }
}

main().catch(error => { console.error(error instanceof Error && /^(Run with|Insufficient remaining)/.test(error.message)
  ? error.message : 'Industry-filter comparison did not complete; no news publication was requested.'); process.exitCode = 1; });
