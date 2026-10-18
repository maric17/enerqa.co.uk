// Compare the public deployment with the local O01 changes without publishing anything.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || undefined });
const origin = process.env.FEEDBACK_PREVIEW_URL ?? 'http://localhost:3000';
const report = { checkedAt: new Date().toISOString(), origin, viewports: [], errors: [] };
await mkdir('docs/feedback/screenshots', { recursive: true });
try {
  for (const width of [1366, 1024, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: width < 600 ? 844 : 900 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => report.errors.push(error.message));
    const response = await page.goto(origin + '/domains-and-industries', { waitUntil: 'networkidle' });
    const result = await page.evaluate(() => {
      const heading = document.querySelector('#domains h2');
      const cards = [...document.querySelectorAll('#domains .group')];
      return { alignment: getComputedStyle(heading).textAlign,
        labels: cards.map(card => card.querySelector('p').textContent),
        domainLinks: [...document.querySelectorAll('#domains a')].map(link => link.getAttribute('href')),
        decorativeDomainImages: document.querySelectorAll('#domains img, #domains svg:not([data-icon="arrow-right"])').length,
        emojiIcons: /⚡|🌱/.test(document.querySelector('#domains').innerText),
        industryHeading: document.querySelector('#industries h2').textContent,
        industryLinks: document.querySelectorAll('#industries a[href^="/industries/"]').length,
        overflow: document.documentElement.scrollWidth > innerWidth };
    });
    assert.equal(response.status(), 200);
    assert.equal(result.alignment, 'center');
    assert.deepEqual(result.labels, ['01 / Climate', '02 / Energy', '03 / Environment', '04 / Business']);
    assert.equal(result.domainLinks.length, 4);
    assert.equal(result.decorativeDomainImages, 0);
    assert.equal(result.emojiIcons, false);
    assert.equal(result.industryHeading, 'Industries');
    assert.equal(result.industryLinks, 13);
    assert.equal(result.overflow, false);
    // Hide only the fixed navigation for readable captures of these tall sections.
    await page.locator('header.site').evaluate(element => element.style.setProperty('visibility', 'hidden', 'important'));
    if (width === 1366 || width === 390) {
      await page.locator('#domains').screenshot({ path: `docs/feedback/screenshots/domains-overview-${width}.png` });
      await page.locator('#industries').screenshot({ path: `docs/feedback/screenshots/industries-overview-${width}.png` });
    }
    report.viewports.push({ width, status: response.status(), ...result });
    await page.close();
  }
  assert.deepEqual(report.errors, []);
} finally {
  await writeFile('docs/feedback/domains-overview-verification.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}
