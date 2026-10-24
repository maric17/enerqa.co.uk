import { hasEditorialApproval, type NewsItem } from './types';

// Generic stock terms also find market reports that do not name an exchange.
// Separate London and regional searches retain dedicated coverage attempts.
export const STOCK_MARKET_QUERIES = [
  'stocks OR equities OR "share prices" OR "Wall Street" OR "S&P 500" OR Nasdaq OR "Dow Jones" OR NYSE',
  'FTSE OR "London Stock Exchange" OR "London stocks" OR "London shares"',
  '"Asian stocks" OR "Asian shares" OR "European stocks" OR "European shares" OR Nikkei OR "Hang Seng" OR Sensex OR "Gulf stocks" OR Tadawul OR "JSE shares"',
];

/** Use the reviewed stock category, or shortlist unreviewed input from stock-specific headlines. */
export function isStockMarketNews(item: Pick<NewsItem, 'title'> & Partial<Pick<NewsItem, 'summary' | 'editorialReview'>>): boolean {
  if (item.editorialReview) return hasEditorialApproval({ ...item, summary: item.summary ?? null })
    && item.editorialReview.topics.includes('markets');
  // Unreviewed provider results are candidates only; saved public records require approval.
  return /\b(stock markets?|stock exchanges?|stocks|equities|share prices?|Wall Street|S&P\s*500|Nasdaq|Dow Jones|NYSE|FTSE|Nikkei|Hang Seng|Sensex|Nifty|Tadawul|DAX|CAC\s*40|STOXX)\b/i.test(item.title)
    || /\bshares\b.{0,55}\b(rise|rises|rose|fall|falls|fell|gain|gains|surge|surges|slide|slides|rally|rallies|drop|drops|jump|jumps|trading)\b/i.test(item.title);
}
