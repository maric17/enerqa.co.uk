const http = require('http');

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

async function fetchPage(slug) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000/industries/' + slug, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  for (const slug of industries) {
    try {
      const html = await fetchPage(slug);
      
      // Extract the Industry News section
      const newsMatch = html.match(/<h2[^>]*>Industry News<\/h2>.*?<\/section>/s);
      let newsCount = 0;
      if (newsMatch) {
        // Count article items in the news feed
        newsCount = (newsMatch[0].match(/<article/g) || []).length;
      }
      
      // Extract the Research and Official Updates section
      const researchMatch = html.match(/<h2[^>]*>Research and Official Updates<\/h2>.*?<\/section>/s);
      let researchCount = 0;
      if (researchMatch) {
        // Count li items inside the grid (which correspond to cards)
        researchCount = (researchMatch[0].match(/<a[^>]*class="[^"]*group flex[^"]*"[^>]*>/g) || []).length;
      }

      console.log(`${slug}: ${newsCount} News, ${researchCount} Research`);
    } catch (e) {
      console.error(slug, e.message);
    }
  }
}

run();
