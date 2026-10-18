// Local visual checks. Set PLAYWRIGHT_MODULE and CHROME_EXECUTABLE when using a managed runtime.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || undefined });
const origin = process.env.FEEDBACK_PREVIEW_URL ?? 'http://localhost:3000';
const output = 'docs/feedback/screenshots';
const reportPath = process.argv.includes('--article') ? 'docs/feedback/browser-image-resolution-verification.json' : 'docs/feedback/browser-verification.json';
await mkdir(output, { recursive: true });
const report = { checkedAt: new Date().toISOString(), viewports: [], pages: [], errors: [] };
try {
  for (const [width, height] of [[1366, 768], [1024, 768], [390, 844], [320, 740]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', hasTouch: width < 600 });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    const response = await page.goto(origin, { waitUntil: 'networkidle' });
    await page.locator('.home-hero-feed[aria-busy="false"]').waitFor();
    const geometry = await page.evaluate(() => {
      const box = selector => { const r = document.querySelector(selector)?.getBoundingClientRect(); return r ? { top: r.top, bottom: r.bottom, height: r.height, width: r.width } : null; };
      const image = document.querySelector('[data-news-slide-image]');
      return { overflow: document.documentElement.scrollWidth > innerWidth, hero: box('.home-hero'),
        search: box('.home-hero-search'), story: box('.home-hero-story'), footer: box('.home-hero-footer'),
        categoryCount: document.querySelectorAll('.home-hero-categories button').length,
        image: image ? { naturalWidth: image.naturalWidth, displayedWidth: image.clientWidth, src: image.currentSrc } : null };
    });
    await page.screenshot({ path: `${output}/home-${width}.png` });
    const next = page.getByRole('button', { name: 'Next headline', exact: true });
    let navigated = null;
    if (await next.count() && await next.isEnabled()) {
      const before = await page.locator('[data-news-card]').getAttribute('href');
      await next.click();
      navigated = before !== await page.locator('[data-news-card]').getAttribute('href');
    }
    report.viewports.push({ width, height, status: response.status(), ...geometry, carouselNavigation: navigated });
    if (width === 1366) {
      const trigger = page.getByRole('button', { name: 'Domains and Industries', exact: true });
      await trigger.click();
      await page.locator('#mega-menu-domains').screenshot({ path: `${output}/megamenu.png` });
      report.pages.push({ menuDomainLinks: await page.locator('#mega-menu-domains .mega-domains a').count(), menuIndustryLinks: await page.locator('#mega-menu-domains .mega-industries a').count() });
      await page.keyboard.press('Escape');
      await page.mouse.move(5, 740);
      await page.locator('#mega-menu-domains').waitFor({ state: 'hidden' });
      await page.locator('#transition-priorities').screenshot({ path: `${output}/domains-static.png`, animations: 'disabled' });
      await page.locator('#about-enerqa').screenshot({ path: `${output}/about-enerqa.png` });
    }
    await context.close();
  }
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => report.errors.push(error.message));
  for (const path of ['/domains-and-industries', '/knowledge-hub', '/knowledge-hub/global-intelligence']) {
    const response = await page.goto(origin + path, { waitUntil: 'networkidle' });
    report.pages.push({ path, status: response.status(), overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
    if (path === '/domains-and-industries') await page.locator('#domains').screenshot({ path: `${output}/domains-overview.png` });
    if (path === '/knowledge-hub') {
      await page.locator('#publications').screenshot({ path: `${output}/knowledge-hub.png` });
      report.pages.push({ publicationFilterLabels: await page.locator('#publication-filters legend').allTextContents() });
    }
    if (path.endsWith('/global-intelligence')) {
      await page.locator('[aria-labelledby="external-cards"]').screenshot({ path: `${output}/intelligence-results.png` });
      await page.locator('[aria-labelledby="source-context"]').screenshot({ path: `${output}/intelligence-sources.png` });
    }
  }
  const manifest = JSON.parse(await readFile('src/lib/content/publication-figures.json', 'utf8'));
  const requestedArticle = process.argv.indexOf('--article');
  const articleEntries = requestedArticle >= 0 ? Object.entries(manifest).filter(([slug]) => slug === process.argv[requestedArticle + 1]) : Object.entries(manifest);
  for (const [slug, entry] of process.argv.includes('--screenshots-only') ? [] : articleEntries) {
    const response = await page.goto(`${origin}/knowledge-hub/${slug}`, { waitUntil: 'networkidle' });
    // Wait for streamed content and hydration before inspecting or loading figures.
    if (entry.figures.length) await page.locator('[data-archive-figure]').first().waitFor();
    const count = await page.locator('[data-archive-figure]').count();
    const summaries = await page.getByRole('heading', { name: 'Executive Summary', exact: true }).count();
    // Exercise every local figure, including those normally loaded on scroll.
    await page.locator('[data-archive-figure] img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
    await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-archive-figure] img')).every(image => image.complete && image.naturalWidth > 0));
    const failedImages = await page.locator('[data-archive-figure] img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).length);
    if (entry.originalPdf) {
      const original = await page.request.get(origin + entry.originalPdf);
      if (!original.ok() || !original.headers()['content-type']?.includes('application/pdf')) throw new Error(`Original PDF unavailable: ${slug}`);
    }
    report.pages.push({ slug, status: response.status(), figures: count, expected: entry.figures.length, failedImages, executiveSummaries: summaries });
    if (requestedArticle >= 0) report.imageResolution = await page.locator('[data-archive-figure] img').evaluateAll(images => images.map(image => ({ naturalWidth: image.naturalWidth, displayedWidth: image.clientWidth, sizes: image.sizes })));
    console.log(`Checked ${slug}: ${count} figures, ${failedImages} broken images.`);
    if (slug === 'climate-forcers-the-hidden-drivers-of-global-warming' || slug === 'sudan-s-energy-balance-2020') {
      await page.locator('[data-archive-figure]').screenshot({ path: `${output}/${slug}.png` });
    }
  }
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ viewports: report.viewports, checkedPages: report.pages.length, errors: report.errors }, null, 2));
  const failures = report.viewports.filter(view => view.status !== 200 || view.overflow || view.carouselNavigation === false ||
    view.categoryCount !== 4 || view.hero.height !== view.height || view.story.top < view.search.bottom + 12 || view.footer.bottom > view.hero.bottom + 1);
  const pageFailures = report.pages.filter(page => page.status && page.status !== 200 || page.failedImages || page.executiveSummaries || page.figures !== undefined && page.figures !== page.expected);
  if (failures.length || pageFailures.length || report.errors.length) throw new Error('Local visual acceptance failed; inspect browser-verification.json.');
} finally {
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
