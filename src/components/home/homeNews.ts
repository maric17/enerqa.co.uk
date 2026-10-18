import 'server-only';
import { cache } from 'react';
import { fetchNews, PAGE_NEWS_PROVIDERS } from '@/lib/api/news';

// Both homepage sections share one saved-news read during the server render.
export const getHomeNews = cache(() => fetchNews('all', 80, {
  maxPerPublisher: 10, providers: PAGE_NEWS_PROVIDERS,
}));
export const getMarketCommentary = cache(() => fetchNews('business', 2, {
  providers: ['eia_rss'], maxPerPublisher: 10,
}));
