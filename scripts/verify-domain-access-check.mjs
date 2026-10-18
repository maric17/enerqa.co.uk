// Check the reported domain route after all streamed research content has resolved.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || undefined });
const origin = process.env.FEEDBACK_PREVIEW_URL ?? 'http://localhost:3000';
const path = '/domains/climate-action-carbon-management';
const report = { checkedAt: new Date().toISOString(), origin, path, consoleErrors: [], pageErrors: [], visits: [] };
await mkdir('docs/feedback', { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
  page.on('pageerror', error => report.pageErrors.push(error.message));
  for (let visit = 0; visit < 2; visit++) {
    const response = await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 90000 });
    const heading = page.getByRole('heading', { name: 'Research and Articles', exact: true });
    await heading.waitFor();
    const section = heading.locator('xpath=ancestor::section[1]');
    const cards = await section.locator('li a[target="_blank"]').evaluateAll(links => links.map(link => ({ title: link.querySelector('h3')?.textContent, href: link.href })));
    report.visits.push({ status: response.status(), cards, text: await section.innerText(), overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
    assert.equal(response.status(), 200);
    assert.equal(report.visits.at(-1).overflow, false);
    assert.equal(await page.locator('nextjs-portal').getByText('revalidating cache with key:', { exact: false }).count(), 0);
  }
  assert.deepEqual(report.consoleErrors, [], 'Console errors on domain page');
  assert.deepEqual(report.pageErrors, [], 'Browser errors on domain page');
  await page.close();
} finally {
  await writeFile('docs/feedback/domain-access-check-verification.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}
