import type { NewsItem, NewsBasketKey } from './types';
import { fetchRssFeed, type RssSource } from './rss';

/**
 * U.S. EIA "Today in Energy" RSS - handoff p. 214 (Provider ID: eia_rss).
 *
 * Keyless. EIA's own publications are U.S. government work in the public
 * domain, so the headline, the supplied summary and the date can all be
 * displayed as long as EIA is credited and the publication date is shown.
 *
 * Two limits the spec is explicit about:
 *  - Do NOT reuse EIA photographs or the EIA logo. Third-party images inside
 *    an article are excluded from the public-domain status, so we show text
 *    only and link out.
 *  - Coverage is strongly U.S.-focused. It complements global coverage rather
 *    than replacing it, which is why the aggregator always pairs it with
 *    another source.
 */

const EIA_FEED: RssSource = {
  url: 'https://www.eia.gov/rss/todayinenergy.xml',
  provider: 'eia_rss',
  providerLabel: 'U.S. EIA',
  publisher: 'U.S. Energy Information Administration',
  rights: 'U.S. Government public domain (EIA-owned text). Images and logo excluded.',
  language: 'en',
  // p. 214 suggests every 6 hours, matching EIA's daily publishing pattern.
  revalidate: 21600,
};

/**
 * Baskets this source contributes to. "Business and Finance" is included
 * because Today in Energy is market analysis - fuel prices, demand, costs -
 * and the aggregator's keyword check decides article by article whether a
 * given piece actually belongs there.
 */
export const EIA_BASKETS: NewsBasketKey[] = ['all', 'energy', 'business'];

export async function fetchEiaNews(): Promise<NewsItem[]> {
  return fetchRssFeed(EIA_FEED);
}
