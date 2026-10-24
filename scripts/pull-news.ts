import nextEnv from '@next/env';
import path from 'node:path';

async function main() {
  // Require an explicit operator choice because this writes to the shared news store.
  const args = process.argv.slice(2);
  const verifiedAccount = args.includes('--verified-account-budget');
  const scope = args.filter(arg => arg !== '--verified-account-budget');
  const singleIndustry = scope.length === 3 && scope[0] === '--manual' && scope[1] === '--industry' && !scope[2].startsWith('--');
  const industrySlugs = singleIndustry ? scope[2].split(',') : undefined;
  const fixedJob = scope.length === 3 && scope[0] === '--manual' && scope[1] === '--job' && !scope[2].startsWith('--');
  const normalPull = scope.includes('--manual') && scope.every(arg => ['--manual', '--industries', '--topics', '--markets'].includes(arg))
    && scope.filter(arg => ['--industries', '--topics', '--markets'].includes(arg)).length <= 1;
  if (new Set(args).size !== args.length || (!normalPull && !singleIndustry && !fixedJob) || (verifiedAccount && !singleIndustry)) {
    console.error('Usage: npx tsx scripts/pull-news.ts --manual [--job <general|stocks|industries-1|industries-2|industries-3> | --topics | --markets | --industries | --industry <slug[,slug...]> [--verified-account-budget]]');
    process.exitCode = 1;
    return;
  }
  // Load server-only credentials without printing them, before importing connectors.
  nextEnv.loadEnvConfig(path.resolve(import.meta.dirname, '..'), true, { info() {}, error() {} });
  const { refreshScheduledNews, PAGE_NEWS_PROVIDERS } = await import('../src/lib/api/news/index');
  const { providerDatabase } = await import('../src/lib/api/core/storage');
  const { providerKey } = await import('../src/lib/api/core/fetch');
  const { LIMITS } = await import('../src/lib/api/core/health');
  const { INDUSTRY_FEEDS } = await import('../src/lib/feeds/contextual');
  const { isNewsRefreshJob } = await import('../src/lib/api/news/schedule');
  const job = fixedJob && isNewsRefreshJob(scope[2]) ? scope[2] : undefined;
  const originalDaily = LIMITS.apitube!.daily;
  try {
    if (fixedJob && !job) throw new Error('Select a known news job.');
    if (industrySlugs && (new Set(industrySlugs).size !== industrySlugs.length || industrySlugs.some(slug => !Object.hasOwn(INDUSTRY_FEEDS, slug)))) {
      throw new Error('Select distinct known industries.');
    }
    if (verifiedAccount) {
      const key = providerKey('apitube');
      const db = providerDatabase();
      if (!key || !db || PAGE_NEWS_PROVIDERS.join(',') !== 'apitube') throw new Error('APITube-only configuration is required.');
      // Recheck fresh account points without spending any; discard the response's api_key field.
      const response = await fetch('https://api.apitube.io/v1/balance', {
        headers: { 'X-API-Key': key }, signal: AbortSignal.timeout(30000),
      });
      const balance = await response.json();
      const requests = industrySlugs!.length;
      if (!response.ok || response.headers.get('x-apitube-mode') !== 'live' || !Number.isInteger(balance.points) || balance.points < requests + 5) {
        throw new Error('Selected industry requests plus five points of headroom are required.');
      }
      const { rows: [usage] } = await db.query<{ today: number }>(`SELECT count(*)::int AS today
        FROM enerqa_connectors.provider_requests WHERE provider='apitube'
        AND requested_at >= date_trunc('day',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'`);
      // Only this bounded CLI batch receives its selected slots; retain the ledger, lease and pacing.
      LIMITS.apitube!.daily = Math.max(originalDaily, usage.today + requests);
      console.log(JSON.stringify({ verifiedAccountPoints: balance.points, extraRequestScope: requests, selectedIndustries: industrySlugs }));
    }
    const industriesOnly = singleIndustry || args.includes('--industries');
    console.log(`Starting one manual ${industriesOnly ? 'industry' : 'news'} pull with the shared lease and provider budgets.`);
    const result = await refreshScheduledNews(undefined, {
      manual: true,
      ...(job ? { job } : {}),
      ...(args.includes('--markets') ? { marketsOnly: true } : {}),
      ...(args.includes('--topics') ? { topicsOnly: true } : {}),
      ...(industriesOnly ? { industriesOnly: true } : {}),
      ...(singleIndustry ? { industrySlugs } : {}),
    });
    console.log(JSON.stringify(result));
    if (result.skipped || result.sourcesFailed) process.exitCode = 1;
  } catch {
    // Native provider/database errors can contain credentials; expose only a fixed message.
    console.error('Manual news pull failed. Previously saved articles are retained.');
    process.exitCode = 1;
  } finally {
    LIMITS.apitube!.daily = originalDaily;
    await providerDatabase()?.end();
  }
}

void main();
