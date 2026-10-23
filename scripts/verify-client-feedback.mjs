import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

// Run against a local preview; this never starts provider jobs or changes CMS records.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || undefined });
const origin = process.env.FEEDBACK_PREVIEW_URL ?? 'http://localhost:3010';
const output = 'docs/feedback';
await mkdir(`${output}/screenshots`, { recursive: true });
const report = { origin, checkedAt: new Date().toISOString(), home: [], pages: [], explorer: {}, errors: [] };
const mapping = await readFile('src/lib/data-portal/relatedIndicators.ts', 'utf8');
const slugs = [...mapping.matchAll(/^ {4}'([^']+)':/gm)].map(match => match[1]);
assert.equal(slugs.length, 17);
const routes = slugs.map((slug, index) => `/${index < 4 ? 'domains' : 'industries'}/${slug}`);

try {
  for (const [width, height] of [[1366, 900], [1024, 768], [1024, 614], [390, 844], [320, 740]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    page.on('pageerror', error => report.errors.push(error.message));
    const response = await page.goto(origin, { waitUntil: 'networkidle', timeout: 60000 });
    await page.locator('.home-hero-feed[aria-busy="false"]').waitFor();
    const geometry = await page.evaluate(() => {
      const bounds = selector => document.querySelector(selector).getBoundingClientRect();
      const hero = bounds('.home-hero');
      return { overflow: document.documentElement.scrollWidth > innerWidth,
        titleGap: bounds('.home-hero-search h1').top - bounds('header.site').bottom,
        searchBottom: bounds('.home-hero-search').bottom, storyTop: bounds('.home-hero-story').top,
        footerBottom: bounds('.home-hero-footer').bottom, heroBottom: hero.bottom };
    });
    assert.equal(response.status(), 200);
    assert.equal(geometry.overflow, false);
    assert.ok(geometry.titleGap >= (width < 768 ? 24 : 40), `Insufficient title spacing at ${width}`);
    assert.ok(geometry.storyTop >= geometry.searchBottom + 12, `Story overlaps the search at ${width}`);
    assert.ok(geometry.footerBottom <= geometry.heroBottom + 1, `Hero footer is clipped at ${width}`);
    assert.equal(await page.getByRole('heading', { name: 'Publications', exact: true }).count(), 1);
    report.home.push({ width, height, status: response.status(), ...geometry });
    if (width === 1366 || width === 390) await page.screenshot({ path: `${output}/screenshots/client-feedback-home-${width}.png` });
    if (width === 1366) {
      const headlines = [];
      for (let domain = 0; domain < 4; domain++) {
        const category = page.locator('.home-hero-category').nth(domain);
        await category.locator('.home-hero-domain-button').click();
        const segments = category.locator('.home-hero-article-segment');
        for (let article = 0; article < await segments.count(); article++) {
          await segments.nth(article).click();
          const title = await page.locator('.home-hero-story h2').innerText();
          assert.ok(!/newspaper headlines|Harry wants to fix feud|Scotland['’]s papers/i.test(title));
          headlines.push({ domain, article, title });
        }
      }
      assert.ok(headlines.length > 0, 'Reviewed news should remain available');
      report.news = { checkedAt: new Date().toISOString(), headlines, rejectedDigestsAbsent: true };
    }
    await page.close();
  }
  for (const width of [1366, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => report.errors.push(error.message));
    for (const route of routes) {
      const response = await page.goto(origin + route, { waitUntil: 'networkidle', timeout: 60000 });
      const list = page.getByRole('list', { name: 'Recommended data indicators' });
      await list.waitFor();
      const links = await list.getByRole('link').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(response.status(), 200);
      assert.equal(overflow, false, `Overflow on ${route} at ${width}`);
      assert.ok(links.length >= 2 && links.length <= 5, `Invalid recommendation count on ${route}`);
      for (const href of links) {
        const url = new URL(href, origin);
        assert.equal(url.pathname, '/data-portal/explorer');
        assert.ok(url.searchParams.get('indicator'));
      }
      assert.equal(await page.getByRole('heading', { name: /^Relevant(?: Enerqa)? Tools$/ }).count(), 0);
      assert.equal(await page.getByRole('heading', { name: 'Publications', exact: true }).count(), 1);
      assert.equal(await page.getByRole('link', { name: 'Explore Related Data', exact: true }).getAttribute('href'), links[0]);
      report.pages.push({ route, width, status: response.status(), cards: links.length, overflow });
      if (route === '/domains/energy-systems-transition') await list.screenshot({ path: `${output}/screenshots/client-feedback-data-${width}.png`,
        style: 'header.site, nextjs-portal { visibility: hidden !important; }' });
      console.log(`Checked ${route} at ${width}: ${links.length} relevant indicators.`);
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1366, height: 1000 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => report.errors.push(error.message));
  // Follow the actual recommendation, not a hand-built substitute URL.
  await page.goto(origin + '/domains/energy-systems-transition', { waitUntil: 'networkidle' });
  await page.getByRole('list', { name: 'Recommended data indicators' }).getByRole('link').first().click();
  await page.waitForURL('**/data-portal/explorer?indicator=*');
  await assert.doesNotReject(async () => {
    await page.getByRole('combobox', { name: 'Y-axis indicator' }).waitFor();
    await page.waitForFunction(() => Array.from(document.querySelectorAll('input[role="combobox"]')).some(input => input.value === 'Renewable electricity output (% of total electricity output)'));
    await page.getByRole('button', { name: 'Data Table', exact: true }).click();
    await page.getByRole('columnheader', { name: 'Renewable electricity output (% of total electricity output)' }).waitFor({ timeout: 60000 });
  });
  report.explorer = { linkedUrl: page.url(), indicator: await page.getByRole('combobox', { name: 'Y-axis indicator' }).inputValue(),
    dataRows: await page.getByRole('table').getByRole('row').count(), overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) };
  assert.ok(report.explorer.dataRows > 1);
  await page.screenshot({ path: `${output}/screenshots/client-feedback-explorer.png` });
  assert.deepEqual(report.errors, []);
  console.log(JSON.stringify({ homeWidths: report.home.length, detailChecks: report.pages.length, newsSlides: report.news.headlines.length, explorer: report.explorer, errors: report.errors }));
} finally {
  await writeFile(`${output}/client-feedback-verification.json`, JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
