import { ok, type ConnectorResult, type ConnectorSuccess } from '../core/types';
import type { NewsItem, NewsBasketKey } from './types';
import { fetchRssFeed, type RssSource } from './rss';

/**
 * European Environment Agency RSS - handoff pp. 215-216 (Provider ID: eea_rss).
 *
 * Keyless. EEA-owned material is CC-BY: free to reuse commercially provided
 * the EEA is credited and the meaning is not changed. Third-party content and
 * the EEA logo are excluded, so we display text and link out.
 *
 * p. 216: "Feed URLs should be taken from current directory, not guessed" and
 * "Use current newsroom press-release, featured-article and publication feed
 * URLs". All three below are the ones the official directory
 * (https://www.eea.europa.eu/en/newsroom/rss-feeds) links on 25 Sep 2026, and
 * each returned an RSS 2.0 document with 25 items that day. The publications
 * feed the spec mentions at /en/publications/rss.xml 404s; the directory's
 * own publications feed is used instead (L1041).
 *
 * Coverage is Europe-focused and the UI labels it as such (p. 216).
 */

const RIGHTS = 'CC-BY, attribution required, meaning retained. Third-party content and logo excluded.';

const feed = (path: string, docType: string): RssSource => ({
  url: `https://www.eea.europa.eu/en/newsroom/rss-feeds/${path}/rss.xml`,
  provider: 'eea_rss',
  providerLabel: 'EEA',
  publisher: 'European Environment Agency',
  rights: RIGHTS,
  language: 'en',
  // p. 216 suggests every 6 hours.
  revalidate: 21600,
  docType,
});

/** Each channel's own name for what it carries (its <title>), as a document type. */
const EEA_FEEDS: RssSource[] = [
  feed('eeas-press-releases-rss', 'Press release'),
  feed('featured-articles-rss', 'Featured article'),
  feed('publications-rss', 'Publication'),
];

/** Baskets this source is a sensible contributor to. */
export const EEA_BASKETS: NewsBasketKey[] = ['all', 'environment', 'climate'];

export async function fetchEeaNews(): Promise<ConnectorResult<NewsItem[]>> {
  // The feeds are fetched together; one failing must not lose the others.
  const results = await Promise.all(EEA_FEEDS.map((feed) => fetchRssFeed(feed)));
  const answered = results.filter((r): r is ConnectorSuccess<NewsItem[]> => r.ok);
  if (answered.length === 0) return results[0];
  const retrievedAt = answered.map((r) => r.retrievedAt).sort()[0];
  return ok('eea_rss', answered.flatMap((r) => r.data), retrievedAt, answered.some((r) => r.stale));
}
