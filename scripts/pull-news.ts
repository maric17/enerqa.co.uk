import nextEnv from '@next/env';
import path from 'node:path';

async function main() {
  // Require an explicit operator choice because this writes to the shared news store.
  const args = process.argv.slice(2);
  if (!args.includes('--manual') || new Set(args).size !== args.length || args.some(arg => !['--manual', '--industries'].includes(arg))) {
    console.error('Usage: npx tsx scripts/pull-news.ts --manual [--industries]');
    process.exitCode = 1;
    return;
  }
  // Load server-only credentials without printing them, before importing connectors.
  nextEnv.loadEnvConfig(path.resolve(import.meta.dirname, '..'), true, { info() {}, error() {} });
  const { refreshScheduledNews } = await import('../src/lib/api/news/index');
  const { providerDatabase } = await import('../src/lib/api/core/storage');
  try {
    const industriesOnly = args.includes('--industries');
    console.log(`Starting one manual ${industriesOnly ? 'industry' : 'news'} pull with the shared lease and provider budgets.`);
    const result = await refreshScheduledNews(undefined, { manual: true, ...(industriesOnly ? { industriesOnly: true } : {}) });
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
