// One usage-tracked diagnostic request. No article, CMS or job-state writes.
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });

async function main() {
  const { fetchNewsdataQuery } = await import('../src/lib/api/news/newsdata');
  const { providerDatabase } = await import('../src/lib/api/core/storage');
  try {
    const result = await fetchNewsdataQuery('climate', 7200, true);
    console.log(JSON.stringify(result.ok ? { ok: true, articles: result.data.length, retrievedAt: result.retrievedAt }
      : { ok: false, reason: result.reason, message: result.message }));
  } finally { await providerDatabase()?.end(); }
}
main().catch(() => { console.error('Tracked NewsData diagnostic failed.'); process.exitCode = 1; });
