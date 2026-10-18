// Exercise the local hero with the saved feeds; no external provider jobs are run.
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || undefined });
const origin = process.env.FEEDBACK_PREVIEW_URL ?? 'http://localhost:3000';
const output = 'docs/feedback';
await mkdir(`${output}/screenshots`, { recursive: true });
const report = { checkedAt: new Date().toISOString(), viewports: [], errors: [], interactions: {} };
try {
  for (const [width, height] of [[1920, 1080], [1366, 768], [1024, 768], [1024, 614], [768, 1024], [390, 844], [320, 740]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce', hasTouch: width < 600 });
    page.on('pageerror', error => report.errors.push(error.message));
    const response = await page.goto(origin, { waitUntil: 'networkidle' });
    await page.locator('.home-hero-feed[aria-busy="false"]').waitFor();
    const categories = page.locator('.home-hero-categories button');
    assert.equal(await categories.count(), 4, 'Four domain categories');
    assert.equal(await page.getByRole('button', { name: 'All', exact: true }).count(), 0);
    assert.equal(await page.locator('.home-hero').getByRole('button', { name: 'Major Markets', exact: true }).count(), 0);
    const slides = [];
    for (let index = 0; index < 4; index++) {
      await categories.nth(index).click();
      await page.locator('.home-hero-search h1').scrollIntoViewIfNeeded();
      const geometry = await page.evaluate(() => {
        const box = selector => {
          const rect = document.querySelector(selector).getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom, height: rect.height, width: rect.width };
        };
        const image = document.querySelector('[data-news-slide-image]');
        const selected = document.querySelector('.home-hero-categories [aria-pressed="true"]');
        const strip = document.querySelector('.home-hero-categories').getBoundingClientRect();
        const tab = selected.getBoundingClientRect();
        return { category: selected.textContent, title: document.querySelector('.home-hero-story h2')?.textContent,
          overflow: document.documentElement.scrollWidth > innerWidth,
          hero: box('.home-hero'), search: box('.home-hero-search'), story: box('.home-hero-story'), footer: box('.home-hero-footer'),
          selectedCategoryVisible: tab.left >= strip.left - 1 && tab.right <= strip.right + 1,
          image: { naturalWidth: image.naturalWidth, displayedWidth: image.clientWidth },
          storyCount: document.querySelectorAll('[data-news-card]').length };
      });
      assert.equal(geometry.overflow, false, `Horizontal page overflow at ${width}`);
      assert.ok(geometry.story.top >= geometry.search.bottom + 12, `Search/story overlap at ${width}: ${geometry.category}`);
      assert.ok(geometry.footer.bottom <= geometry.hero.bottom + 1, `Footer clipped at ${width}`);
      assert.ok(geometry.selectedCategoryVisible, `Selected category hidden at ${width}`);
      assert.ok(geometry.storyCount <= 1, 'Only one article per category');
      if (height > 640) assert.equal(geometry.hero.height, height, `Hero should fill one screen at ${width}`);
      slides.push(geometry);
      if ((width === 1366 || width === 390) && (index === 0 || index === 3)) {
        await page.screenshot({ path: `${output}/screenshots/hero-${width}-${index === 0 ? 'climate' : 'finance'}.png` });
      }
    }
    report.viewports.push({ width, height, status: response.status(), slides });
    if (width === 1366) {
      await categories.first().click();
      await page.getByRole('button', { name: 'Next headline' }).click();
      report.interactions.next = await categories.nth(1).getAttribute('aria-pressed') === 'true';
      await page.getByRole('button', { name: 'Previous headline' }).click();
      report.interactions.previous = await categories.first().getAttribute('aria-pressed') === 'true';
      await categories.first().focus();
      await page.keyboard.press('ArrowLeft');
      report.interactions.keyboardWrap = await categories.last().getAttribute('aria-pressed') === 'true';
      report.interactions.reducedMotion = await page.getByRole('button', { name: 'Play slideshow' }).isDisabled();
      await page.getByRole('textbox', { name: 'Ask a question or explore a topic' }).fill('climate finance');
      await page.getByRole('button', { name: 'Ask', exact: true }).click();
      await page.waitForURL('**/search?q=climate%20finance');
      report.interactions.search = new URL(page.url()).searchParams.get('q') === 'climate finance';
    }
    await page.close();
  }
  assert.ok(Object.values(report.interactions).every(Boolean), 'Hero interaction failed');
  assert.deepEqual(report.errors, [], 'Browser errors');
} catch (error) {
  report.errors.push(error.message);
  throw error;
} finally {
  await writeFile(`${output}/hero-verification.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ viewports: report.viewports.map(({ width, height, slides }) => ({ width, height, slides: slides.length })), interactions: report.interactions, errors: report.errors }, null, 2));
  await browser.close();
}
