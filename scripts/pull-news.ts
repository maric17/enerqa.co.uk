import nextEnv from '@next/env';
import path from 'node:path';

async function main() {
  // Require an explicit operator choice because this writes to the shared news store.
  const args = process.argv.slice(2);
  const singleIndustry = args.length === 3 && args[0] === '--manual' && args[1] === '--industry' && !args[2].startsWith('--');
  const normalPull = args.includes('--manual') && new Set(args).size === args.length && args.every(arg => ['--manual', '--industries', '--topics'].includes(arg))
    && !(args.includes('--industries') && args.includes('--topics'));
  if (!normalPull && !singleIndustry) {
    console.error('Usage: npx tsx scripts/pull-news.ts --manual [--topics | --industries | --industry <slug>]');
    process.exitCode = 1;
    return;
  }
  // Load server-only credentials without printing them, before importing connectors.
  nextEnv.loadEnvConfig(path.resolve(import.meta.dirname, '..'), true, { info() {}, error() {} });
  const { refreshScheduledNews } = await import('../src/lib/api/news/index');
  const { providerDatabase } = await import('../src/lib/api/core/storage');
  try {
    const industriesOnly = singleIndustry || args.includes('--industries');
    console.log(`Starting one manual ${industriesOnly ? 'industry' : 'news'} pull with the shared lease and provider budgets.`);
    const result = await refreshScheduledNews(undefined, {
      manual: true,
      ...(args.includes('--topics') ? { topicsOnly: true } : {}),
      ...(industriesOnly ? { industriesOnly: true } : {}),
      ...(singleIndustry ? { industrySlugs: [args[2]] } : {}),
    });
    console.log(JSON.stringify(result));
    if (result.skipped || (result.storedItems === 0 && result.sourcesFailed)) process.exitCode = 1;
  } catch {
    // Native provider/database errors can contain credentials; expose only a fixed message.
    console.error('Manual news pull failed. Previously saved articles are retained.');
    process.exitCode = 1;
  } finally {
    await providerDatabase()?.end();
  }
}

void main();
