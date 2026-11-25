import { siteText, type SiteLanguage } from '@/lib/i18n/site';
import React, { Suspense } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { isNewsItemStale, NEWS_DELAY_HOURS, PAGE_NEWS_PROVIDERS, sourcesFailedFor } from '@/lib/api/news';
import { getHomeNews, getMarketCommentary } from './homeNews';
import { buildMarketView, formatDateTimeUtc, selectHeroStoryGroups, toCard } from './firstFoldNews';
import { Container } from '../ui/Container';
import { NewsThumbnail } from './NewsThumbnail';
import { getMarketArticleImages } from './marketArticleImages';
import { normaliseUrl } from '@/lib/api/news/types';
import { SourceUnavailable } from '../ui/SourceUnavailable';

export async function MarketsCommentary() {
  const [pool, commentary] = await Promise.all([getHomeNews(), getMarketCommentary()]);
  const heroStories = selectHeroStoryGroups(pool.items).flat();
  const candidates = [...pool.items, ...commentary.items];
  // Prefer commentary that is different from the hero, without forcing an empty column.
  const unique = buildMarketView(candidates, heroStories, 2);
  const items = unique.length ? unique : buildMarketView(candidates, [], 2);
  const failed = sourcesFailedFor({ providerStatus: { ...pool.providerStatus, ...commentary.providerStatus } }, PAGE_NEWS_PROVIDERS);
  if (!items.length) return <SourceUnavailable variant={failed ? 'unavailable' : 'empty'}
    nearest={{ href: 'https://www.tradingview.com/markets/stocks-global-market/news/', label: 'browse market reporting' }} className="market-commentary-empty" />;
  const images = await getMarketArticleImages(items.map(item => item.url));
  return <div className="market-commentary-stories">
    {items.map(item => {
      const card = toCard(item);
      const editorial = images.get(normaliseUrl(card.url));
      const imageUrl = editorial?.url ?? card.imageUrl;
      return <article key={card.id} className="market-commentary-story">
        {imageUrl && <NewsThumbnail imageUrl={imageUrl} alt={editorial?.alt} variant="market" />}
        <div className="market-commentary-copy">
          <p className="market-commentary-meta"><span>{card.publisher}</span>{card.publishedAt && card.dateLabel && <time dateTime={card.publishedAt}>{card.dateLabel}</time>}</p>
          <h3><a href={card.url} target="_blank" rel="noopener noreferrer" data-market-card>{card.title}<ArrowUpRight aria-hidden="true" /><span className="sr-only"> (opens the original article in a new tab)</span></a></h3>
          {card.teaser && <p className="market-commentary-teaser">{card.teaser}</p>}
          <p className="market-commentary-retrieved">
            Via {item.providerLabel}.{' '}
            {item.provider === 'newsdata' && `${item.providerLabel} delayed ${NEWS_DELAY_HOURS}h+. `}
            Feed checked {formatDateTimeUtc(item.feedRefreshedAt ?? item.retrievedAt)}.
            {card.older && ' Published more than 48 hours ago.'}
            {isNewsItemStale(item) && ' Cached commentary; refresh unavailable.'}
            {item.provider === 'eia_rss' && ' U.S. energy-market commentary.'}
          </p>
        </div>
      </article>;
    })}
  </div>;
}

export function MajorMarkets({ language = 'en' }: { language?: SiteLanguage } = {}) {
  const t = (text: string) => siteText(language, text);
  return <section id="major-markets" className="home-markets" aria-labelledby="h04-major-markets">
    <Container>
      <header className="home-markets-heading">
        <p className="home-markets-eyebrow">{t("Markets & perspective")}</p>
        <h2 id="h04-major-markets">{t("Major Markets")}</h2>
        <p>{t("Stock-market reporting from New York, London and regional exchanges.")}</p>
      </header>
      <Suspense fallback={<div className="market-commentary-empty" role="status">{t("Loading market commentary…")}</div>}><MarketsCommentary /></Suspense>
      <p className="home-markets-panel-footer"><a href="https://www.tradingview.com/markets/stocks-global-market/news/" target="_blank" rel="noopener noreferrer">{t('View more')} <ArrowUpRight aria-hidden="true" /><span className="sr-only"> stock-market news (opens in a new tab)</span></a></p>
    </Container>
  </section>;
}
