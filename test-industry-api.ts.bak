import { fetchNewsForKeywords } from './src/lib/api/news/index.ts';
import { fetchResearchCards } from './src/lib/feeds/research.ts';
import { INDUSTRY_FEEDS } from './src/lib/feeds/contextual.ts';
import { INDUSTRIES } from './src/components/Header.tsx';

const STOPWORDS = new Set(['and', 'or', 'the', 'in', 'of', 'for', 'to']);

async function run() {
  for (const industry of INDUSTRIES) {
    try {
      const feed = INDUSTRY_FEEDS[industry.slug];
      
      const keywords = industry.title
        .replace(/[,&]/g, ' ')
        .split(/\s+/)
        .map((word) => word.trim())
        .filter((word) => word.length > 2 && !STOPWORDS.has(word.toLowerCase()))
        .map((word) => {
          if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) {
            return word.slice(0, -1) + '*';
          }
          return word;
        });

      const news = await fetchNewsForKeywords(keywords, 4);
      
      const research = await fetchResearchCards({
        themes: feed.researchThemes,
        limit: 4,
        specialistFeeds: feed.specialistFeeds
      });
      
      console.log(`${industry.slug}: ${news.items.length} News, ${research.cards.length} Research`);
    } catch (e) {
      console.error(industry.slug, e.message);
    }
  }
}

run();
