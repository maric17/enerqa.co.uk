import assert from 'node:assert/strict';
import nextEnv from '@next/env';
import pg from 'pg';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

// Inspect the existing local server; this script never starts it or submits live searches.
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const origin = process.env.FEEDBACK_PREVIEW_URL ?? 'http://localhost:3000';
const day = new Date().toISOString().slice(0, 10);
const saved = JSON.parse(readFileSync(process.env.SAVED_NEWS_REPORT ?? `docs/feedback/APITUBE-INDUSTRIES-SAVED-${day}.json`, 'utf8'));
const placements = saved.placements.filter(placement => !placement.type || placement.type === 'industry');
const imageDirectory = process.env.NEWS_IMAGE_DIRECTORY ?? `docs/feedback/apitube-industries-${day}`;
const mobileDestinations = process.env.AUDIT_MOBILE_DESTINATIONS === '1';
mkdirSync(imageDirectory, { recursive: true });
const db = new pg.Pool({ connectionString: process.env.DATABASE_URI, max: 1, connectionTimeoutMillis: 5000 });
const requests = async () => (await db.query("SELECT provider,count(*)::int AS requests FROM enerqa_connectors.provider_requests WHERE provider IN ('apitube','thenewsapi','newsdata','gdelt','openai') GROUP BY provider ORDER BY provider")).rows;
const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || undefined, headless: true });
const report = { checkedAt: new Date().toISOString(), origin, results: [], destinations: [], errors: [], browserLiveSearchRequests: 0 };
const writeReport = () => writeFileSync(process.env.NEWS_BROWSER_REPORT ?? `docs/feedback/APITUBE-INDUSTRIES-BROWSER-${day}.json`, `${JSON.stringify(report, null, 2)}\n`);
try {
  report.requestsBefore = await requests();
  for (const width of [1366, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push({ width, kind: 'javascript', message: error.message }));
    page.on('request', request => {
      if (request.url().includes('/api/intelligence/search')) report.browserLiveSearchRequests++;
    });
    for (const placement of placements) {
      let stage = 'navigation';
      try {
        const route = `/industries/${placement.slug}`;
        const response = await page.goto(`${origin}${route}`, { waitUntil: 'commit', timeout: 60000 });
        stage = 'industry-news';
        await page.locator('.industry-hero h1').waitFor({ timeout: 60000 });
        await page.locator('.industry-hero .home-hero-feed[aria-busy="false"]').waitFor({ timeout: 60000 });
        const segments = page.locator('.industry-hero .home-hero-article-segment');
        const count = await segments.count();
        const stories = [];
        stage = 'headlines';
        for (let index = 0; index < count; index++) {
          await segments.nth(index).click();
          stories.push(await page.locator('.industry-hero .home-hero-story').evaluate(el => ({
            title: el.querySelector('h2')?.textContent?.trim(),
            teaser: el.querySelector('.home-hero-teaser')?.textContent?.trim() ?? null,
            url: el.querySelector('[data-news-card]')?.href ?? null,
            publisher: el.querySelector('.home-hero-source span')?.textContent ?? null,
            publishedAt: el.querySelector('time')?.getAttribute('datetime') ?? null,
            attribution: el.querySelector('[data-feed-attribution]')?.textContent ?? null,
          })));
        }
        if (count) await segments.first().click();
        const state = await page.locator('.industry-hero').evaluate(el => ({
          title: el.querySelector('h1')?.textContent,
          emptyMessage: el.querySelector('.home-hero-empty h2')?.textContent ?? null,
          viewAllHref: el.querySelector('.home-hero-view-all')?.getAttribute('href') ?? null,
          image: el.querySelector('[data-news-slide-image]')?.getAttribute('src') ?? null,
          totalLabel: el.querySelector('.home-hero-count')?.textContent,
          pageHeadings: [...document.querySelectorAll('h2')].map(h => h.textContent?.trim()),
          overflow: document.documentElement.scrollWidth > innerWidth,
        }));
        const record = { route, slug: placement.slug, width, status: response.status(), count, expectedSavedCount: placement.count, stories, ...state };
        report.results.push(record);
        assert.equal(record.status, 200);
        assert.equal(count, placement.count, 'Visible slideshow count must match the saved industry feed.');
        assert.equal(state.overflow, false);
        assert.ok(stories.every(story => placement.articles.some(article => article.url === story.url)
          && story.attribution?.includes('Via APITube')));
        assert.equal(new URL(state.viewAllHref, origin).searchParams.get('industry'), placement.slug);
        assert.equal(new URL(state.viewAllHref, origin).searchParams.get('type'), 'news');
        assert.ok(!process.env.API_TUBE_API_KEY || !(await page.content()).includes(process.env.API_TUBE_API_KEY));
        stage = 'screenshot';
        if (width === 1366 || placement.count > 0 || placement.slug.startsWith('government-')) {
          // Let the supplied image or existing local fallback settle before capturing evidence.
          await page.waitForFunction(() => {
            const image = document.querySelector('.industry-hero [data-news-slide-image]');
            return image?.complete && image.naturalWidth >= 600;
          }, null, { timeout: 15000 }).catch(() => {});
          await page.locator('.industry-hero').screenshot({ path: `${imageDirectory}/${placement.slug}-${width}.jpg`, type: 'jpeg', quality: 70, animations: 'disabled' });
        }
        console.log(JSON.stringify({ width, industry: placement.title ?? placement.slug, count, empty: Boolean(state.emptyMessage) }));
        if (width === 1366 || mobileDestinations) {
          stage = 'view-all-news';
          const destination = await page.goto(new URL(state.viewAllHref, origin).href, { waitUntil: 'commit', timeout: 60000 });
          const cards = page.locator('section[aria-labelledby="external-cards"]');
          await cards.waitFor({ timeout: 60000 });
          const destinationState = await cards.evaluate(el => ({
            statusText: el.querySelector('[role="status"]')?.textContent ?? null,
            cards: [...el.querySelectorAll('article')].map(card => ({
              type: card.querySelector('p')?.textContent ?? null, title: card.querySelector('h3')?.textContent ?? null,
              url: card.querySelector('a[target="_blank"]')?.href ?? null,
            })),
          }));
          report.destinations.push({ slug: placement.slug, width, status: destination.status(), href: state.viewAllHref,
            newsOnlyFilter: new URL(state.viewAllHref, origin).searchParams.get('type') === 'news', ...destinationState });
          assert.equal(destination.status(), 200);
          const allowed = new Set((placement.allArticles ?? placement.articles).map(article => article.url));
          assert.ok(destinationState.cards.every(card => card.type?.startsWith('News') && allowed.has(card.url)));
          assert.ok(stories.every(story => destinationState.cards.some(card => card.url === story.url)));
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        }
      } catch {
        report.errors.push({ width, slug: placement.slug, stage, kind: 'verification', message: 'Industry page audit did not pass this step.' });
        console.log(JSON.stringify({ width, slug: placement.slug, stage, failed: true }));
      }
      writeReport();
    }
    await context.close();
  }
  report.requestsAfter = await requests();
  report.noNewsApiCalls = JSON.stringify(report.requestsBefore) === JSON.stringify(report.requestsAfter);
  report.complete = report.results.length === placements.length * 2 && report.destinations.length === placements.length * (mobileDestinations ? 2 : 1);
  report.checkedAt = new Date().toISOString();
  writeReport();
  console.log(JSON.stringify({ checkedPages: report.results.length, viewAllDestinations: report.destinations.length,
    noNewsApiCalls: report.noNewsApiCalls, errors: report.errors }));
  if (!report.complete || !report.noNewsApiCalls || report.browserLiveSearchRequests || report.errors.length) process.exitCode = 1;
} finally { await browser.close(); await db.end(); }
