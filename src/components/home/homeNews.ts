import 'server-only';
import { cache } from 'react';
import { fetchNews, PAGE_NEWS_PROVIDERS } from '@/lib/api/news';

// Keep enough saved stories for each category before limiting the visible cards.
export const getHomeNews = cache(() => fetchNews('all', 500, {
  maxPerPublisher: 500, providers: PAGE_NEWS_PROVIDERS,
}));
export const getMarketCommentary = cache(() => fetchNews('all', 40, {
  providers: PAGE_NEWS_PROVIDERS, maxPerPublisher: 10, stockMarkets: true,
}));
