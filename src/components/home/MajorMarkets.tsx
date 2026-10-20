import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { isNewsItemStale, NEWS_DELAY_HOURS, PAGE_NEWS_PROVIDERS, sourcesFailedFor } from '@/lib/api/news';
import { getHomeNews, getMarketCommentary } from './homeNews';
import { buildMarketView, formatDateTimeUtc, selectHeroStoryGroups, toCard } from './firstFoldNews';
import { Container } from '../ui/Container';
import { MarketChart } from './MarketChart';
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
  return <div className="market-commentary-stories">
    {items.map(item => {
      const card = toCard(item);
      return <article key={card.id} className="market-commentary-story">
        <p className="market-commentary-meta"><span>{card.publisher}</span>{card.publishedAt && card.dateLabel && <time dateTime={card.publishedAt}>{card.dateLabel}</time>}</p>
        <h4><a href={card.url} target="_blank" rel="noopener noreferrer" data-market-card>{card.title}<ArrowUpRight aria-hidden="true" /><span className="sr-only"> (opens the original article in a new tab)</span></a></h4>
        {card.teaser && <p className="market-commentary-teaser">{card.teaser}</p>}
        <p className="market-commentary-retrieved">
          Via {item.providerLabel}.{' '}
          {item.provider === 'newsdata' && `NewsData delayed ${NEWS_DELAY_HOURS}h+. `}
          Updated {formatDateTimeUtc(item.feedRefreshedAt ?? item.retrievedAt)}.
          {isNewsItemStale(item) && ' Cached commentary; refresh unavailable.'}
          {item.provider === 'eia_rss' && ' U.S. energy-market commentary.'}
        </p>
      </article>;
    })}
  </div>;
}

export function MajorMarkets() {
  return <section id="major-markets" className="home-markets" aria-labelledby="h04-major-markets">
    <Container>
      <header className="home-markets-heading">
        <p className="home-markets-eyebrow">Markets & perspective</p>
        <h2 id="h04-major-markets">Major Markets</h2>
        <p>Track company share prices and market movements alongside stock-market reporting from New York, London and regional exchanges.</p>
      </header>
      <div className="home-markets-grid">
        <section className="market-quotes-column" aria-labelledby="market-quotes-heading">
          <div className="home-markets-column-heading"><h3 id="market-quotes-heading">Stocks & market chart</h3><span>Delayed quotes · USD</span></div>
          <MarketChart />
        </section>
        <section className="market-commentary-column" aria-labelledby="market-commentary-heading">
          <div className="home-markets-column-heading"><h3 id="market-commentary-heading">Market commentary</h3><a href="https://www.tradingview.com/markets/stocks-global-market/news/" target="_blank" rel="noopener noreferrer">View more <ArrowUpRight aria-hidden="true" /><span className="sr-only"> stock-market news (opens in a new tab)</span></a></div>
          <Suspense fallback={<div className="market-commentary-empty" role="status">Loading market commentary…</div>}><MarketsCommentary /></Suspense>
        </section>
      </div>
      <p className="home-markets-note">Share prices are supplied by TradingView and may be delayed. The chart shows the available trading session; stock-market commentary has its own publication time. <Link href="/data-portal/sources#market-data">Sources and rights</Link>.</p>
    </Container>
  </section>;
}
