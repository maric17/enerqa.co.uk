// Verify the actual free chart, consent boundary and responsive section layout.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || undefined });
const origin = process.env.FEEDBACK_PREVIEW_URL ?? 'http://localhost:3000';
const output = 'docs/feedback';
await mkdir(`${output}/screenshots`, { recursive: true });
const report = { checkedAt: new Date().toISOString(), origin, viewports: [], blockedProvider: null, errors: [] };
try {
  for (const [width, height] of [[1366, 768], [1024, 768], [390, 844], [320, 740]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce', hasTouch: width < 600 });
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && /contentWindow is not available|Cannot listen to the event/.test(message.text())) report.errors.push(message.text());
    });
    const requests = [];
    page.on('request', request => { if (/tradingview/i.test(request.url())) requests.push(request.url()); });
    const response = await page.goto(origin, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.home-hero-categories button').count(), 4);
    assert.equal(await page.locator('.home-hero').getByRole('button', { name: 'Major Markets', exact: true }).count(), 0);
    await page.locator('#major-markets').scrollIntoViewIfNeeded();
    assert.equal(requests.length, 0, 'No chart traffic before consent');
    const geometry = await page.evaluate(() => {
      const box = selector => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return { top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left, right: r.right, width: r.width, height: r.height };
      };
      return { overflow: document.documentElement.scrollWidth > innerWidth, hero: box('.home-hero'), markets: box('#major-markets'),
        quotes: box('.market-quotes-column'), commentary: box('.market-commentary-column') };
    });
    assert.equal(geometry.overflow, false);
    assert.ok(Math.abs(geometry.markets.top - geometry.hero.bottom) < 1, 'Markets immediately follows the hero');
    if (width >= 1024) {
      assert.ok(Math.abs(geometry.quotes.top - geometry.commentary.top) < 1, 'Desktop columns align');
      assert.ok(Math.abs(geometry.quotes.height - geometry.commentary.height) < 1, 'Desktop column heights match');
      assert.ok(Math.abs(geometry.markets.height - geometry.hero.height) < 1, 'Hero and Markets occupy equal screen heights');
    } else assert.ok(geometry.commentary.top > geometry.quotes.bottom, 'Columns stack on phones');
    await page.getByRole('button', { name: 'Load market chart' }).click();
    const iframe = page.locator('[data-market-widget] iframe');
    await iframe.waitFor({ timeout: 25000 });
    const documentFrame = await (await iframe.elementHandle()).contentFrame();
    const provider = documentFrame.locator('iframe');
    await provider.waitFor({ timeout: 25000 });
    const frame = await (await provider.elementHandle()).contentFrame();
    await frame.waitForFunction(() => /\d+\.\d{2}/.test(document.body?.innerText ?? ''), null, { timeout: 30000 });
    const text = await frame.locator('body').innerText();
    assert.ok(text.includes('NEE') && text.includes('NextEra Energy'), 'Company ticker and name are present');
    assert.ok(/[+−-]\d+\.\d+%/.test(text), 'Actual daily percentage changes are present');
    assert.ok(await frame.locator('canvas').count() > 0, 'Provider chart rendered');
    assert.equal(await page.locator('.market-chart-status').count(), 0, 'Chart has left its loading state');
    if (width === 1366 || width === 390) {
      // A fixed header otherwise repeats inside a stitched mobile section capture.
      const header = page.locator('header.site');
      await header.evaluate(element => element.style.setProperty('visibility', 'hidden', 'important'));
      await page.locator('#major-markets').screenshot({ path: `${output}/screenshots/major-markets-${width}.png` });
      await header.evaluate(element => element.style.removeProperty('visibility'));
    }
    const afterLoad = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(afterLoad, false, 'Widget must not widen the page');
    // Revoking an existing global preference must remove the chart and its browsing context.
    await page.reload({ waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('enerqa-consent', JSON.stringify({ embeds: true }));
      window.dispatchEvent(new Event('enerqa-consent-change'));
    });
    await page.locator('[data-market-widget] iframe').waitFor();
    await page.evaluate(() => {
      localStorage.setItem('enerqa-consent', JSON.stringify({ embeds: false }));
      window.dispatchEvent(new Event('enerqa-consent-change'));
    });
    await page.locator('[data-market-widget]').waitFor({ state: 'detached' });
    report.viewports.push({ width, height, status: response.status(), ...geometry, requestsBeforeConsent: 0,
      chartLoaded: true, chartText: text, noOverflowAfterLoad: !afterLoad, consentWithdrawal: true });
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => report.errors.push(error.message));
  await page.route('**/external-embedding/embed-widget-market-overview.js', route => route.abort());
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Load market chart' }).click();
  await page.getByText('The market chart could not be loaded.', { exact: false }).waitFor();
  assert.ok(await page.getByRole('link', { name: 'Open the source chart' }).isVisible());
  report.blockedProvider = { honestFailure: true, sourceLink: true };
  await page.close();
  assert.deepEqual(report.errors, [], 'Browser errors');
} catch (error) { report.errors.push(error.message); throw error; }
finally {
  await writeFile(`${output}/major-markets-verification.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ viewports: report.viewports.map(({ width, height, chartLoaded }) => ({ width, height, chartLoaded })), blockedProvider: report.blockedProvider, errors: report.errors }, null, 2));
  await browser.close();
}
