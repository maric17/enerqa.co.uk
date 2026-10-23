import { EDITORIAL_REVIEW_VERSION, NEWS_BASKETS, isOnSiteTopic, matchesBasket, type EditorialTopic, type NewsItem } from '../src/lib/api/news/types';
import { isStockMarketNews } from '../src/lib/api/news/markets';

/** Existing connector tests treat editorial decisions as a separate, trusted boundary. */
export function approveNewsFixture(item: NewsItem): NewsItem {
  const candidate = { ...item, editorialReview: undefined };
  const topics: EditorialTopic[] = NEWS_BASKETS.filter(basket => basket.key !== 'all' && matchesBasket(candidate, basket))
    .map(basket => basket.key as EditorialTopic);
  if (isStockMarketNews(item)) topics.push('markets');
  return { ...item, editorialReview: { version: EDITORIAL_REVIEW_VERSION, decision: 'approved',
    topics: topics.length ? topics : ['climate'], title: item.title, summary: item.summary,
    reason: 'Approved fixture; semantic review has independent tests.', reviewedAt: new Date().toISOString() } };
}

/** Preserve existing connector fixtures' editorial decisions when discovery becomes broader. */
export function reviewNewsFixture(item: NewsItem): NewsItem {
  const result = approveNewsFixture(item);
  if (!isOnSiteTopic({ ...item, editorialReview: undefined }) && !isStockMarketNews(item)) {
    result.editorialReview!.decision = 'rejected';
    result.editorialReview!.topics = [];
  }
  return result;
}
