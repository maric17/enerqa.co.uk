import nextEnv from '@next/env';
import path from 'node:path';

async function main() {
  // Require an explicit operator choice because this writes to the shared news store.
  if (process.argv.slice(2).join(' ') !== '--manual') {
    console.error('Usage: npx tsx scripts/pull-news.ts --manual');
    process.exitCode = 1;
    return;
  }
  // Load server-only credentials without printing them, before importing connectors.
  nextEnv.loadEnvConfig(path.resolve(import.meta.dirname, '..'), true, { info() {}, error() {} });
  const { refreshScheduledNews } = await import('../src/lib/api/news/index');
  const { providerDatabase } = await import('../src/lib/api/core/storage');
  try {
    console.log('Starting one manual news pull with the shared lease and provider budgets.');
    const result = await refreshScheduledNews(undefined, { manual: true });
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
