import nextEnv from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { NewsBasketKey, NewsItem } from '../src/lib/api/news/types';

// Load credentials privately. Planning never fetches news; --manual requests diagnostic metadata only.
nextEnv.loadEnvConfig(path.resolve(import.meta.dirname, '..'), true, { info() {}, error() {} });

async function main() {
  const startedAt = Date.now();
  const args = process.argv.slice(2);
  const selected = args.filter(arg => arg.startsWith('--only='));
  if (selected.length > 1 || args.some(arg => !['--manual', '--verified-account-budget', '--all-sources'].includes(arg) && !arg.startsWith('--only='))
    || (args.includes('--verified-account-budget') && !args.includes('--manual'))) {
    throw new Error('Use [--manual [--verified-account-budget]] [--all-sources] [--only=<request id>].');
  }
  const manual = args.includes('--manual');
  const { providerDatabase } = await import('../src/lib/api/core/storage');
  const { LIMITS, limitsFor } = await import('../src/lib/api/core/health');
  const { fetchFromProvider, providerKey } = await import('../src/lib/api/core/fetch');
  const { fetchApiTubeBasket, fetchApiTubeQuery, apiTubeQuery, mapApiTubeResults, rejectApiTubeBody,
    API_TUBE_CATEGORIES, API_TUBE_SOURCES } = await import('../src/lib/api/news/apitube');
  const { apiTubeTopics } = await import('../src/lib/api/news/apitubeScreening');
  const { STOCK_MARKET_QUERIES } = await import('../src/lib/api/news/markets');
  const { THE_NEWS_API_TOPIC_QUERIES, containsAny, isAllowedDomain } = await import('../src/lib/api/news/types');
  const { fetchNews, fetchNewsForKeywords, toTeaser, PAGE_NEWS_PROVIDERS } = await import('../src/lib/api/news');
  const { DOMAIN_FEEDS, INDUSTRY_FEEDS, newsPhrases, matchesNewsContext } = await import('../src/lib/feeds/contextual');
  const db = providerDatabase();
  if (!db || !providerKey('apitube') || PAGE_NEWS_PROVIDERS.join(',') !== 'apitube') {
    throw new Error('The APITube-only trial, database and local key are required.');
  }
  type Search = { id: string; kind: 'domain' | 'market' | 'industry'; slug: string; query: string;
    days: number; categories: string[]; basket?: Exclude<NewsBasketKey, 'all'> };
  const plan: Search[] = [
    ...Object.entries(DOMAIN_FEEDS).map(([slug, feed]): Search => ({ id: `domain:${feed.newsBasket}`,
      kind: 'domain', slug, basket: feed.newsBasket, query: THE_NEWS_API_TOPIC_QUERIES[feed.newsBasket],
      days: feed.newsBasket === 'business' ? 31 : 7, categories: API_TUBE_CATEGORIES[feed.newsBasket] })),
    ...STOCK_MARKET_QUERIES.map((query, index): Search => ({ id: `market:${['us-global', 'london', 'regional'][index]}`,
      kind: 'market', slug: ['us-global', 'london', 'regional'][index], query, days: 31, categories: ['medtop:04000000'] })),
    ...Object.entries(INDUSTRY_FEEDS).map(([slug, feed]): Search => ({ id: `industry:${slug}`,
      kind: 'industry', slug, query: feed.newsDiscoveryQuery, days: 31,
      categories: ['medtop:06000000', 'medtop:04000000', 'medtop:08000000'] })),
  ];
  const searches = selected.length ? plan.filter(search => search.id === selected[0].slice('--only='.length)) : plan;
  if (!searches.length || plan.length !== 20 || plan.some(search => search.categories.length > 3)) {
    throw new Error('Unknown request id, or the twenty-search plan needs review.');
  }
  const output = path.resolve('docs/feedback', `APITUBE-SITE-COVERAGE-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  mkdirSync(path.dirname(output), { recursive: true });
  const originalDailyLimit = limitsFor('apitube').daily;
  try {
    const usage = async () => (await db.query<{ provider: string; today: number; total: number }>(`
      SELECT provider, count(*) FILTER (WHERE requested_at >= date_trunc('day',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')::int AS today,
        count(*)::int AS total FROM enerqa_connectors.provider_requests
      WHERE provider IN ('apitube','thenewsapi','newsdata','gdelt','openai') GROUP BY provider ORDER BY provider`)).rows;
    const fingerprints = async () => (await db.query(`SELECT provider, count(*)::int AS count,
      md5(string_agg(md5(record::text), '' ORDER BY source_id)) AS fingerprint
      FROM enerqa_connectors.external_records WHERE provider IN ('apitube','thenewsapi','newsdata','gdelt','eia_rss','eea_rss','enerqa-news-sync')
      GROUP BY provider ORDER BY provider`)).rows;
    const before = await usage();
    const recordsBefore = await fingerprints();
    const usedToday = before.find(row => row.provider === 'apitube')?.today ?? 0;
    let account: { checkedAt: string; plan: string; points: number; mode: string } | null = null;
    if (args.includes('--verified-account-budget')) {
      // /balance costs zero points. Never retain its api_key field or raw errors.
      const response = await fetch('https://api.apitube.io/v1/balance', {
        headers: { 'X-API-Key': providerKey('apitube')! }, signal: AbortSignal.timeout(30000),
      });
      const body = await response.json();
      const mode = response.headers.get('x-apitube-mode');
      if (!response.ok || mode !== 'live' || !['free', 'starter', 'basic', 'professional', 'corporate'].includes(body.plan)
        || !Number.isInteger(body.points) || body.points < searches.length + 5) {
        throw new Error('The live account does not have a verified point allowance for this diagnostic batch.');
      }
      account = { checkedAt: new Date().toISOString(), plan: body.plan, points: body.points, mode };
      // A replacement account may have fresh points while the shared ledger retains old-key usage.
      // Grant only this batch's extra slots in this CLI process; preserve all ledger entries and pacing.
      LIMITS.apitube!.daily = Math.max(originalDailyLimit, usedToday + searches.length);
    }
    const remaining = Math.max(0, limitsFor('apitube').daily - usedToday);
    const savedFeeds: { id: string; count: number; sourcesFailed: boolean; articles: { title: string; url: string }[] }[] = [];
    const brief = (items: NewsItem[]) => items.map(item => ({ title: item.title, url: item.url }));
    const home = await fetchNews('all', 80, { maxPerPublisher: 10 });
    const markets = await fetchNews('all', 40, { stockMarkets: true, maxPerPublisher: 10 });
    savedFeeds.push({ id: 'home', count: home.items.length, sourcesFailed: home.sourcesFailed, articles: brief(home.items) },
      { id: 'markets:combined', count: markets.items.length, sourcesFailed: markets.sourcesFailed, articles: brief(markets.items) });
    for (const search of plan.filter(search => search.kind !== 'market')) {
      const feed = search.kind === 'domain' ? DOMAIN_FEEDS[search.slug] : INDUSTRY_FEEDS[search.slug];
      const result = await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets,
        contextRules: feed.newsContextRules, sectorRules: feed.newsSectorRules,
        ...(search.basket ? { basket: search.basket } : {}) });
      savedFeeds.push({ id: search.id, count: result.items.length, sourcesFailed: result.sourcesFailed, articles: brief(result.items) });
    }
    if (JSON.stringify(before) !== JSON.stringify(await usage())) throw new Error('Saved-feed reads unexpectedly changed API usage.');
    const results: Record<string, unknown>[] = [];
    const allSources = args.includes('--all-sources');
    const report = { checkedAt: new Date().toISOString(), diagnosticOnly: true, manualRequested: manual,
      finishedAt: null as string | null, elapsedSeconds: null as number | null,
      status: !manual ? 'plan_only' : remaining < searches.length ? 'blocked_by_daily_budget' : 'running',
      completed: false, selectedRequests: searches.length, dailyRemainingBefore: remaining,
      verifiedAccount: account, defaultDailyLimit: originalDailyLimit, auditProcessDailyLimit: limitsFor('apitube').daily,
      sourceDomains: allSources ? null : API_TUBE_SOURCES,
      sourcePolicy: allSources ? 'Unrestricted diagnostic discovery only; the publication allowlist is unchanged.' : 'Current three-publisher connector filter.',
      articlesPerRequest: 10, pagination: 'First page only; not an exhaustive archive search.',
      fullSitePlan: plan.map(search => ({ ...search, sentQuery: apiTubeQuery(search.query),
        sourceDomains: allSources ? null : INDUSTRY_FEEDS[search.slug]?.newsSources ?? API_TUBE_SOURCES })),
      savedFeeds, results, requestsBefore: before, requestsAfter: before, recordsUnchanged: false,
      relevanceNote: 'Rule matches are diagnostic evidence. Sector relevance needs review; returned candidates are never published by this script.' };
    const save = () => writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
    save();
    if (manual && remaining >= searches.length) {
      for (const search of searches) {
        // Exercise the real connector, with its existing source filters, shared accounting and pacing.
        let response = !allSources ? search.basket ? await fetchApiTubeBasket(search.basket, true)
          : await fetchApiTubeQuery(search.query, 3600, true, ['en'], { days: search.days }) : null;
        if (allSources) {
          // Change only source restriction to isolate its effect; keep dates, query and categories identical.
          const end = new Date();
          const params = new URLSearchParams({ query: apiTubeQuery(search.query), 'category.id': search.categories.join(','),
            'language.code': 'en', per_page: '10', 'sort.by': 'published_at', 'sort.order': 'desc',
            'published_at.start': new Date(end.getTime() - search.days * 86400000).toISOString(), 'published_at.end': end.toISOString(),
            fl: 'id,title,description,href,published_at,language,image,categories,source',
          });
          const result = await fetchFromProvider<{ results: unknown[] }>('apitube', `https://api.apitube.io/v1/news/everything?${params}`, {
            headers: { 'X-API-Key': providerKey('apitube')! }, fresh: true, timeoutMs: 30000, rejectBody: rejectApiTubeBody,
            errorCode: body => String((body as { errors?: { code?: unknown }[] })?.errors?.[0]?.code ?? ''),
          });
          response = result.ok ? { ...result, data: mapApiTubeResults(result.data.results, result.retrievedAt) } : result;
        }
        if (!response) throw new Error('Diagnostic search did not return an outcome.');
        const articles = response.ok ? response.data.map(item => {
          const teaserItem = { ...item, summary: toTeaser(item.summary) };
          const topics = apiTubeTopics(teaserItem);
          const feed = search.kind === 'industry' ? INDUSTRY_FEEDS[search.slug] : null;
          return { title: item.title, summary: teaserItem.summary, url: item.url, publisher: item.publisher,
            currentlyAllowedPublisher: isAllowedDomain(item.domain),
            publishedAt: item.publishedAt, ageDays: item.publishedAt ? Math.round((Date.now() - Date.parse(item.publishedAt)) / 8640000) / 10 : null,
            categories: item.providerCategories, topicsBeforeTeaser: apiTubeTopics(item), topicsAfterTeaser: topics,
            targetTopicRuleMatch: search.kind === 'market' ? topics.includes('markets') : search.basket ? topics.includes(search.basket) : null,
            existingIndustrySelectionMatch: feed ? containsAny(`${teaserItem.title} ${teaserItem.summary ?? ''}`, newsPhrases(feed))
              || matchesNewsContext(teaserItem, feed.newsContextRules) : null,
            sectorReview: search.kind === 'industry' ? 'pending' : null,
            accessCheck: 'not_run',
          };
        }) : [];
        results.push({ id: search.id, ok: response.ok, ...(!response.ok ? { reason: response.reason } : {}),
          received: articles.length, generalTopicRuleMatches: articles.filter(article => article.topicsAfterTeaser.length > 0).length,
          targetTopicRuleMatches: search.kind === 'industry' ? null : articles.filter(article => article.targetTopicRuleMatch).length,
          articles });
        report.requestsAfter = await usage();
        save();
        console.log(JSON.stringify({ id: search.id, ok: response.ok, received: articles.length }));
        // A quota failure is a failed check, not an empty news category; stop spending attempts.
        if (!response.ok && response.reason === 'rate_limited') break;
      }
      report.completed = results.length === searches.length && results.every(result => result.ok === true);
      report.status = report.completed ? 'fetched_pending_relevance_review' : 'incomplete';
    }
    report.requestsAfter = await usage();
    report.recordsUnchanged = JSON.stringify(recordsBefore) === JSON.stringify(await fingerprints());
    const nonApiTube = (rows: typeof before) => rows.filter(row => row.provider !== 'apitube');
    if (!report.recordsUnchanged || JSON.stringify(nonApiTube(before)) !== JSON.stringify(nonApiTube(report.requestsAfter))) {
      report.status = 'database_or_other_provider_changed_during_audit';
      report.completed = false;
    }
    report.finishedAt = new Date().toISOString();
    report.elapsedSeconds = Math.round((Date.now() - startedAt) / 100) / 10;
    save();
    console.log(JSON.stringify({ output, status: report.status, completed: report.completed, selectedRequests: searches.length,
      remaining, recordsUnchanged: report.recordsUnchanged, savedFeeds: savedFeeds.map(({ id, count }) => ({ id, count })) }));
    if (manual && !report.completed) process.exitCode = 2;
  } finally {
    // This never changes the running web server or the default limit in health.ts.
    LIMITS.apitube!.daily = originalDailyLimit;
    await db.end();
  }
}

main().catch(error => {
  // Raw driver/provider errors can contain credentials, so only intentional operator messages are printed.
  console.error(error instanceof Error && /^(Use \[|Unknown request id|The APITube-only|Saved-feed reads)/.test(error.message)
    ? error.message : 'APITube coverage audit did not complete. No news publication was requested.');
  process.exitCode = 1;
});
