import { JSDOM } from 'jsdom';

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
  for (const slug of industries) {
    try {
      const res = await fetch('http://localhost:3000/industries/' + slug);
      const text = await res.text();
      const dom = new JSDOM(text);
      const doc = dom.window.document;
      
      // News cards are in the Industry News section
      // They are rendered as <article> elements, typically with a class that might identify them,
      // but let's find the heading "Industry News" and count articles in its container
      const headings = Array.from(doc.querySelectorAll('h2'));
      
      let newsCount = 0;
      let researchCount = 0;

      for (const h2 of headings) {
        if (h2.textContent === 'Industry News') {
          // The parent section or container contains the articles.
          // Let's just find the closest section and count articles.
          const section = h2.closest('section');
          if (section) {
            // Check for actual cards vs "No relevant updates"
            if (section.textContent.includes('No relevant updates are available')) {
              newsCount = 0;
            } else {
              newsCount = section.querySelectorAll('article').length;
              // Wait, if it's rendered via template (suspense), it might be inside a template tag.
              // Let's also check template tags.
              if (newsCount === 0) {
                 const templates = Array.from(doc.querySelectorAll('template'));
                 for (const t of templates) {
                    if (t.innerHTML.includes('article') && t.innerHTML.includes('Industry News')) {
                       // Complex to parse inside template...
                    }
                 }
              }
            }
          }
        }
        
        if (h2.textContent === 'Research and Official Updates') {
          const section = h2.closest('section');
          if (section) {
            // Assuming Research cards are links with specific classes or list items
            // They are rendered in CuratedSources / ResearchFeed / OfficialFeed
            // Let's count <a href> that look like cards (group flex flex-col)
            if (section.textContent.includes('No relevant updates')) {
              // wait, they might not say this
            }
            researchCount = section.querySelectorAll('a.group.flex.flex-col').length;
            // Also fallback to just counting articles or a tags if class is different
            if (researchCount === 0) {
               researchCount = section.querySelectorAll('a[href^="http"]').length;
            }
          }
        }
      }
      
      // If suspense makes this hard, just text match
      if (newsCount === 0) {
        newsCount = (text.match(/<article/g) || []).length; // this might count news + other things, but usually it's only news.
      }
      
      console.log(`- ${slug}: ${newsCount} News cards, ${researchCount} Research cards`);
    } catch (e) {
      console.error(slug, e.message);
    }
  }
}

run();
