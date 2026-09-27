const { chromium } = require('playwright');

const industries = [
  'government-regulators-public-institutions',
  'financial-institutions-investors-development-finance',
  'energy-utilities',
  'oil-gas-petrochemicals',
  'industry-manufacturing-materials',
  'infrastructure-real-estate-industrial-zones',
  'transport-logistics-mobility',
  'water-waste-circular-economy',
  'agriculture-food-aquaculture',
  'mining-natural-resources',
  'tourism-hospitality-destinations',
  'technology-telecoms-data-infrastructure',
  'healthcare-education-institutional-estates'
];

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  for (const slug of industries) {
    try {
      await page.goto('http://localhost:3000/industries/' + slug, { waitUntil: 'networkidle' });
      
      const counts = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h2'));
        let newsCount = 0;
        let researchCount = 0;
        
        for (const h2 of headings) {
          if (h2.textContent.includes('Industry News')) {
            const section = h2.closest('section');
            if (section) {
              newsCount = section.querySelectorAll('article').length;
              if (newsCount === 0) newsCount = section.querySelectorAll('a[href^="http"]').length;
            }
          }
          if (h2.textContent.includes('Research and Official Updates')) {
            const section = h2.closest('section');
            if (section) {
              researchCount = section.querySelectorAll('a.group').length;
            }
          }
        }
        return { newsCount, researchCount };
      });
      
      console.log(`- ${slug}: ${counts.newsCount} News, ${counts.researchCount} Research`);
    } catch (e) {
      console.error(slug, e.message);
    }
  }
  
  await browser.close();
}

run();
