import type { NewsItem, NewsBasketKey } from './types';
import { fetchRssFeed, type RssSource } from './rss';

/**
 * European Environment Agency RSS - handoff pp. 215-216 (Provider ID: eea_rss).
 *
 * Keyless. EEA-owned material is CC-BY: free to reuse commercially provided
 * the EEA is credited and the meaning is not changed. Third-party content and
 * the EEA logo are excluded, so we display text and link out.
 *
 * p. 216: "Feed URLs should be taken from current directory, not guessed."
 * Both URLs below were requested on 19 September 2026 and returned a valid
 * RSS 2.0 document. The publications feed the spec also mentions
 * (/en/publications/rss.xml) returned 404 on that date, so it is deliberately
 * absent rather than guessed at.
 *
 * Coverage is Europe-focused and the UI labels it as such.
 */

const EEA_FEEDS: RssSource[] = [
  {
    // Channel title: "Press releases".
    url: 'https://www.eea.europa.eu/en/newsroom/news/rss.xml',
    provider: 'eea_rss',
    providerLabel: 'EEA',
    publisher: 'European Environment Agency',
    rights: 'CC-BY, attribution required, meaning retained. Third-party content and logo excluded.',
    language: 'en',
    // p. 216 suggests every 6 hours.
    revalidate: 21600,
  },
  {
    // Channel title: "Topics" - the featured-article stream (editorials, interviews).
    url: 'https://www.eea.europa.eu/en/topics/rss.xml',
    provider: 'eea_rss',
    providerLabel: 'EEA',
    publisher: 'European Environment Agency',
    rights: 'CC-BY, attribution required, meaning retained. Third-party content and logo excluded.',
    language: 'en',
    revalidate: 21600,
  },
];

/** Baskets this source is a sensible contributor to. */
export const EEA_BASKETS: NewsBasketKey[] = ['all', 'environment', 'climate'];

export async function fetchEeaNews(): Promise<NewsItem[]> {
  // Both feeds are fetched together; one failing must not lose the other.
  const results = await Promise.all(EEA_FEEDS.map((feed) => fetchRssFeed(feed)));
  return results.flat();
}
