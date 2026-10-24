import nextEnv from '@next/env';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// This audit reads saved records only; it never pulls news or prints credentials.
nextEnv.loadEnvConfig(path.resolve(import.meta.dirname, '..'), true, { info() {}, error() {} });

async function main() {
  const { providerDatabase } = await import('../src/lib/api/core/storage');
  const { fetchNews, fetchNewsForKeywords, searchNews, PAGE_NEWS_PROVIDERS } = await import('../src/lib/api/news');
  const { DOMAIN_FEEDS, INDUSTRY_FEEDS, newsIndustries, newsPhrases } = await import('../src/lib/feeds/contextual');
  const { hasApiTubeApproval } = await import('../src/lib/api/news/apitubeScreening');
  const db = providerDatabase();
  if (!db || PAGE_NEWS_PROVIDERS.join(',') !== 'apitube') throw new Error('APITube trial configuration is required.');
  try {
    const usage = async () => (await db.query("SELECT provider, count(*)::int AS requests FROM enerqa_connectors.provider_requests WHERE provider IN ('apitube','thenewsapi','newsdata','gdelt','openai') GROUP BY provider ORDER BY provider")).rows;
    const before = await usage();
    const home = await fetchNews('all', 80, { maxPerPublisher: 10 });
    const markets = await fetchNews('all', 40, { stockMarkets: true, maxPerPublisher: 10 });
    const search = await searchNews('', 'all', {}, 100);
    const inventory = await fetchNews('all', 1000, { maxPerPublisher: 500 });
    const placements: { type: 'domain' | 'industry'; slug: string; count: number; sourcesFailed: boolean;
      articles: { title: string; provider: string; url: string }[];
      allArticles?: { title: string; provider: string; url: string }[] }[] = [];
    for (const [type, feeds] of [['domain', DOMAIN_FEEDS], ['industry', INDUSTRY_FEEDS]] as const) {
      for (const [slug, feed] of Object.entries(feeds)) {
        const result = await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets,
          contextRules: feed.newsContextRules,
          sectorRules: feed.newsSectorRules,
          ...('newsBasket' in feed ? { basket: feed.newsBasket } : {}) });
        placements.push({ type, slug, count: result.items.length, sourcesFailed: result.sourcesFailed,
          articles: result.items.map(item => ({ title: item.title, provider: item.provider, url: item.url })),
          ...(type === 'industry' ? { allArticles: inventory.items.filter(item => newsIndustries(item).includes(slug))
            .map(item => ({ title: item.title, provider: item.provider, url: item.url })) } : {}) });
        if (result.items.some(item => item.provider !== 'apitube' || item.accessStatus !== 'verified_open' || !hasApiTubeApproval(item))) {
          throw new Error('A page exposed news outside the verified APITube trial.');
        }
      }
    }
    const after = await usage();
    const safe = [home, markets, search].every(feed => feed.items.every(item => item.provider === 'apitube'
      && item.accessStatus === 'verified_open' && hasApiTubeApproval(item)));
    if (!safe || JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Saved-page isolation or API usage check failed.');
    const stored = (await db.query("SELECT access_status, record->'editorialReview'->>'method' AS method, count(*)::int AS count FROM enerqa_connectors.external_records WHERE provider='apitube' GROUP BY access_status, method")).rows;
    const oldRows = (await db.query("SELECT provider, count(*)::int AS count, md5(string_agg(md5(record::text), '' ORDER BY source_id)) AS fingerprint FROM enerqa_connectors.external_records WHERE provider IN ('thenewsapi','newsdata','gdelt','eia_rss','eea_rss') OR (provider='enerqa-news-sync' AND source_id='scheduled-news-v1') GROUP BY provider ORDER BY provider")).rows;
    let legacyRecordsUnchanged: boolean | null = null;
    // A local baseline is optional; it contains counts and fingerprints, not record contents.
    const baselinePath = '/tmp/enerqa-apitube-baseline.json';
    try { legacyRecordsUnchanged = JSON.stringify(JSON.parse(readFileSync(baselinePath, 'utf8')).filter((r: { provider: string }) => r.provider !== 'apitube')) === JSON.stringify(oldRows); }
    catch { /* Another developer can run the read-only audit without our local baseline. */ }
    const report = { checkedAt: new Date().toISOString(), branch: 'trial/apitube-news-2026-10-24', providers: PAGE_NEWS_PROVIDERS,
      savedPageReadsMadeNoApiCalls: true, legacyRecordsUnchanged, stored, requests: after,
      home: { count: home.items.length, articles: home.items.map(item => ({ title: item.title, provider: item.provider, url: item.url, topics: item.editorialReview?.topics })) },
      markets: { count: markets.items.length, articles: markets.items.map(item => ({ title: item.title, provider: item.provider, url: item.url })) },
      search: { count: search.items.length }, placements };
    const output = process.argv[2];
    if (output) writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify({ ...report, home: { count: home.items.length }, markets: { count: markets.items.length },
      placements: placements.map(({ type, slug, count, sourcesFailed }) => ({ type, slug, count, sourcesFailed })) }));
  } finally { await db.end(); }
}

main().catch(() => { console.error('APITube saved-feed verification failed. No news records were changed.'); process.exitCode = 1; });
