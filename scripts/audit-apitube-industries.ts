import nextEnv from '@next/env';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

// Audit the evaluation feed without publishing, deleting or reclassifying news.
nextEnv.loadEnvConfig(path.resolve(import.meta.dirname, '..'), true, { info() {}, error() {} });

const PROBE_QUERIES: Record<string, string> = {
  'government-regulators-public-institutions': '(government OR minister OR policy OR regulation OR "net zero" OR "climate target" OR "emissions target" OR "deforestation law")',
  'financial-institutions-investors-development-finance': '(bank* OR investor* OR "climate finance" OR "green bond" OR "sustainable finance" OR "development finance")',
  'energy-utilities': '(electric* OR solar OR "wind power" OR "wind farm" OR utilities OR "power grid" OR "battery storage")',
  'oil-gas-petrochemicals': '(oil OR gas OR gasfield OR methane OR LNG OR refinery OR petrochemical*)',
  'industry-manufacturing-materials': '(manufactur* OR steel* OR cement OR factory OR factories OR "industrial emissions")',
  'infrastructure-real-estate-industrial-zones': '(building* OR infrastructure OR retrofit* OR "heat pump" OR "green buildings" OR "industrial zones")',
  'transport-logistics-mobility': '(transport* OR shipping OR aviation OR "electric car" OR "electric cars" OR "electric vehicle" OR "electric vehicles" OR "vehicle emissions")',
  'water-waste-circular-economy': '(water OR sewage OR wastewater OR waste OR recycl* OR "circular economy" OR "plastic pollution")',
  'agriculture-food-aquaculture': '(agricultur* OR farming OR farmer* OR food OR aquacultur* OR fisheries OR irrigation)',
  'mining-natural-resources': '(mining OR minerals OR "rare earth" OR "coal mine" OR "copper mine" OR "mine rehabilitation")',
  'tourism-hospitality-destinations': '(tourism OR tourist* OR hotel* OR hospitality OR "sustainable travel" OR ecotourism)',
  'technology-telecoms-data-infrastructure': '("data centre" OR "data centres" OR "data center" OR "data centers" OR datacenter* OR telecom* OR "digital infrastructure")',
  'healthcare-education-institutional-estates': '(hospital* OR campus OR healthcare OR "health care" OR universit* OR school* OR college*)',
};

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--probe')) throw new Error('Use no arguments, or --probe for thirteen budgeted diagnostic requests.');
  const probe = args[0] === '--probe';
  const { providerDatabase } = await import('../src/lib/api/core/storage');
  const { fetchNewsForKeywords, toTeaser, PAGE_NEWS_PROVIDERS } = await import('../src/lib/api/news');
  const { readNewsStore } = await import('../src/lib/api/news/storage');
  const { fetchApiTubeQuery, API_TUBE_SOURCES } = await import('../src/lib/api/news/apitube');
  const { apiTubeTopics } = await import('../src/lib/api/news/apitubeScreening');
  const { containsAny } = await import('../src/lib/api/news/types');
  const { INDUSTRY_FEEDS, newsPhrases } = await import('../src/lib/feeds/contextual');
  const db = providerDatabase();
  if (!db || PAGE_NEWS_PROVIDERS.join(',') !== 'apitube') throw new Error('This audit requires the APITube evaluation branch and database.');
  const day = new Date().toISOString().slice(0, 10);
  const requests = async () => (await db.query("SELECT provider,count(*)::int AS requests FROM enerqa_connectors.provider_requests WHERE provider IN ('apitube','thenewsapi','newsdata','gdelt','openai') GROUP BY provider ORDER BY provider")).rows;
  const fingerprints = async () => (await db.query("SELECT provider,count(*)::int AS count,md5(string_agg(md5(record::text), '' ORDER BY source_id)) AS fingerprint FROM enerqa_connectors.external_records WHERE provider IN ('apitube','thenewsapi','newsdata','gdelt','eia_rss','eea_rss','enerqa-news-sync') GROUP BY provider ORDER BY provider")).rows;
  try {
    const before = await requests();
    const recordsBefore = await fingerprints();
    const { items } = await readNewsStore();
    const saved = items.filter(item => item.provider === 'apitube');
    const industries = (await db.query<{ slug: string; title: string }>('SELECT slug,title FROM public.industries ORDER BY id')).rows;
    const fields = (item: typeof saved[number]) => ({ id: item.id, title: item.title, summary: toTeaser(item.summary),
      url: item.url, publisher: item.publisher, provider: item.provider, publishedAt: item.publishedAt,
      ageDays: item.publishedAt ? Math.round((Date.now() - Date.parse(item.publishedAt)) / 8640000) / 10 : null,
      topics: apiTubeTopics(item), categories: item.providerCategories });
    if (!probe) {
      const placements: { slug: string; title: string; query: string; diagnosticQuery: string;
        count: number; sourcesFailed: boolean; articles: (ReturnType<typeof fields> & { matchedPhrases: string[] })[] }[] = [];
      for (const industry of industries) {
        const feed = INDUSTRY_FEEDS[industry.slug];
        if (!feed) throw new Error('An industry has no feed configuration.');
        const phrases = newsPhrases(feed);
        const result = await fetchNewsForKeywords(phrases, 3, { baskets: feed.newsBaskets,
          contextRules: feed.newsContextRules, sectorRules: feed.newsSectorRules });
        placements.push({ ...industry, query: feed.newsDiscoveryQuery, diagnosticQuery: PROBE_QUERIES[industry.slug],
          count: result.items.length, sourcesFailed: result.sourcesFailed,
          articles: result.items.map(item => ({ ...fields(item),
            matchedPhrases: phrases.filter(term => containsAny(`${item.title} ${item.summary ?? ''}`, [term])) })) });
      }
      const after = await requests();
      if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('News API usage changed during the saved-feed audit.');
      writeFileSync(`docs/feedback/APITUBE-INDUSTRIES-SAVED-${day}.json`, `${JSON.stringify({ checkedAt: new Date().toISOString(),
        providers: PAGE_NEWS_PROVIDERS, newsApiCalls: 0, recordsUnchanged: JSON.stringify(recordsBefore) === JSON.stringify(await fingerprints()),
        requestsBefore: before, requestsAfter: after, saved: saved.map(fields), placements }, null, 2)}\n`);
      console.log(JSON.stringify({ industries: placements.map(({ title, count }) => ({ title, count })), savedArticles: saved.length, newsApiCalls: 0 }));
      return;
    }
    const daily = (await db.query<{ requests: number }>("SELECT count(*)::int AS requests FROM enerqa_connectors.provider_requests WHERE provider='apitube' AND requested_at >= date_trunc('day',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'")).rows[0].requests;
    if (80 - daily < industries.length) throw new Error('Not enough of the existing daily request budget remains for a complete thirteen-industry probe.');
    const results: Record<string, unknown>[] = [];
    const started = Date.now();
    for (const industry of industries) {
      // Broader title discovery tests availability; the normal topic rules still assess each candidate.
      const query = PROBE_QUERIES[industry.slug];
      if (!query) throw new Error('An industry has no diagnostic query.');
      const result = await fetchApiTubeQuery(query, 3600, true, ['en'], { days: 31 });
      const candidates = result.ok ? result.data.map(item => ({ ...item, summary: toTeaser(item.summary) })) : [];
      results.push({ ...industry, query, ok: result.ok, ...(!result.ok ? { reason: result.reason } : {}),
        received: candidates.length, topical: candidates.filter(item => apiTubeTopics(item).length > 0).length,
        candidates: candidates.map(item => ({ ...fields(item), alreadySaved: saved.some(old => old.id === item.id),
          currentPlacementMatches: newsPhrases(INDUSTRY_FEEDS[industry.slug]).filter(term => containsAny(`${item.title} ${item.summary ?? ''}`, [term])) })) });
      writeFileSync(`docs/feedback/APITUBE-INDUSTRIES-PROBES-${day}.json`, `${JSON.stringify({ checkedAt: new Date().toISOString(),
        completed: results.length === industries.length, diagnosticOnly: true, sourceDomains: API_TUBE_SOURCES,
        dateWindowDays: 31, articlesPerRequest: 10, elapsedSeconds: Math.round((Date.now() - started) / 100) / 10, results }, null, 2)}\n`);
      console.log(JSON.stringify({ industry: industry.title, ok: result.ok, received: candidates.length,
        topical: candidates.filter(item => apiTubeTopics(item).length > 0).length }));
    }
    const after = await requests();
    const recordsUnchanged = JSON.stringify(recordsBefore) === JSON.stringify(await fingerprints());
    const reportPath = `docs/feedback/APITUBE-INDUSTRIES-PROBES-${day}.json`;
    const { readFileSync } = await import('node:fs');
    writeFileSync(reportPath, `${JSON.stringify({ ...JSON.parse(readFileSync(reportPath, 'utf8')), requestsBefore: before,
      requestsAfter: after, recordsUnchanged }, null, 2)}\n`);
    if (!recordsUnchanged) throw new Error('News records changed during the diagnostic probe.');
  } finally { await db.end(); }
}

main().catch(error => { console.error(error instanceof Error && /^(Use no arguments|Not enough of the existing)/.test(error.message)
  ? error.message : 'Industry audit did not complete; no news publication was requested.'); process.exitCode = 1; });
