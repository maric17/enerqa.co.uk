import type { NewsItem } from './types';

// Separate searches reserve provider results for US, London and regional stocks.
export const STOCK_MARKET_QUERIES = [
  '"Wall Street" OR "S&P 500" OR Nasdaq OR "Dow Jones" OR NYSE',
  'FTSE OR "London Stock Exchange" OR "London stocks" OR "London shares"',
  '"Asian stocks" OR "Asian shares" OR "European stocks" OR "European shares" OR Nikkei OR "Hang Seng" OR Sensex OR "Gulf stocks" OR Tadawul OR "JSE shares"',
];

/** Require stock-specific headline evidence; general finance and fuel prices do not qualify. */
export function isStockMarketNews(item: Pick<NewsItem, 'title'>): boolean {
  return /\b(stock markets?|stock exchanges?|stocks|equities|share prices?|Wall Street|S&P\s*500|Nasdaq|Dow Jones|NYSE|FTSE|Nikkei|Hang Seng|Sensex|Nifty|Tadawul|DAX|CAC\s*40|STOXX)\b/i.test(item.title)
    || /\bshares\b.{0,55}\b(rise|rises|rose|fall|falls|fell|gain|gains|surge|surges|slide|slides|rally|rallies|drop|drops|jump|jumps|trading)\b/i.test(item.title);
}
