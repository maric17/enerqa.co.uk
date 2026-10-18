// Hold the real loader response until the widget is removed, reproducing the reported race.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || undefined });
const origin = process.env.FEEDBACK_PREVIEW_URL ?? 'http://localhost:3000';
const report = { checkedAt: new Date().toISOString(), origin, scenarios: [] };
try {
  for (const scenario of ['withdraw-consent', 'navigate-away']) {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const consoleErrors = [], pageErrors = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', error => pageErrors.push(error.message));
    let release, requested, delivered;
    const gate = new Promise(resolve => { release = resolve; });
    const started = new Promise(resolve => { requested = resolve; });
    const completed = new Promise(resolve => { delivered = resolve; });
    await page.route('**/external-embedding/embed-widget-market-overview.js', async route => {
      const response = await route.fetch();
      requested();
      await gate;
      await route.fulfill({ response });
      delivered();
    });
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('enerqa-consent', JSON.stringify({ embeds: true }));
      window.dispatchEvent(new Event('enerqa-consent-change'));
    });
    await started;
    if (scenario === 'withdraw-consent') {
      await page.evaluate(() => {
        localStorage.setItem('enerqa-consent', JSON.stringify({ embeds: false }));
        window.dispatchEvent(new Event('enerqa-consent-change'));
      });
    } else {
      await page.locator('header.site a[href="/knowledge-hub"]:visible').click();
      await page.waitForURL('**/knowledge-hub');
    }
    await page.locator('[data-market-widget]').waitFor({ state: 'detached' });
    release();
    await completed;
    // Give a late loader a chance to execute: the old implementation logged the error here.
    await page.waitForTimeout(1000);
    const iframeErrors = consoleErrors.filter(message => /contentWindow is not available|Cannot listen to the event|reading 'querySelector'/.test(message));
    report.scenarios.push({ scenario, delayedLoaderReleasedAfterRemoval: true, iframeErrors, pageErrors, consoleErrors });
    assert.deepEqual(iframeErrors, [], `Late loader error after ${scenario}`);
    assert.deepEqual(pageErrors, [], `Browser error after ${scenario}`);
    await page.close();
  }
} finally {
  await writeFile('docs/feedback/market-widget-lifecycle-verification.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}
