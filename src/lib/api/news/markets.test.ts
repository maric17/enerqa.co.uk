import { describe, expect, it } from 'vitest';
import { isStockMarketNews } from './markets';

// Test stock headlines across regions and the false matches seen in the old feed.
describe('stock-market relevance', () => {
  it.each(['Wall Street rallies on earnings', 'FTSE 100 climbs in London', 'Asian stocks fall',
    'Nikkei gains after Japan election', 'Tadawul trading higher', 'Company shares surge after results',
    'European equities advance', 'S&P 500 reaches a record'])('accepts %s', title => {
    expect(isStockMarketNews({ title })).toBe(true);
  });
  it.each(['Africa climate finance falls short', 'Pacific leaders call for climate action',
    'Natural gas prices fall', 'Green bond investment grows', 'Company shares its climate plan'])('rejects %s', title => {
    expect(isStockMarketNews({ title })).toBe(false);
  });
});
