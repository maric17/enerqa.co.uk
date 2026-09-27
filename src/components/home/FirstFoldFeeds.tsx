import React, { Suspense } from 'react';
import { fetchNews, isNewsItemStale, NEWS_DELAY_HOURS, PAGE_NEWS_PROVIDERS, PROVIDER_META } from '@/lib/api/news';
import type { NewsItem, NewsResult } from '@/lib/api/news';
import { FeedSkeleton } from '../feeds/feedParts';
import { SourceUnavailable } from '../ui/SourceUnavailable';
import { Container } from '../ui/Container';
import { GlobalNewsPanel, NewsColumn, NewsFilterBar } from './GlobalNewsPanel';
import { NewsCard } from './NewsCard';
import {
  buildNewsViews,
  formatDateTimeUtc,
  NEWS_AREA_HEIGHT,
  NEWS_FILTERS,
  NEWS_SKELETON_HEIGHT,
  toCard,
  withoutShown,
} from './firstFoldNews';

/**
 * H03 Global News + H04 Major Markets (p. 13), the compact band directly under
 * the hero.
 *
 * First fold (p. 15, p. 229): at 1366x768 this band has to sit inside the first
 * viewport together with the header, H01 and H02, ending around y 720. That is
 * why the type is compact, the lead story sits beside two shorter ones, and H04
 * is a small commentary panel.
 *
 * Sources (p. 13): "Use NewsData.io's delayed free feed and additional legacy
 * GDELT coverage", and H04 "uses eligible items from the same free news pool".
 * The shared pool also carries the EIA and EEA official feeds, which belong to
 * the official-updates modules, so both panels keep only PAGE_NEWS_PROVIDERS.
 *
 * Streaming (p. 226 "Loading reserves the card/chart dimensions"): the provider
 * calls run inside <Suspense>, so the page shell, hero and search are sent at
 * once, and the band's headings and a same-size skeleton hold the space until
 * the cached feeds arrive. Before this, the whole homepage waited on the feeds
 * (the first GET / took 22 s).
 *
 * Every provider call is cached server-side and shared by all visitors (p. 226).
 */

/** How many commentary items the compact H04 panel shows. */
const MARKET_ITEMS = 2;

const HEADING = 'm-0 text-[24px] font-bold leading-tight tracking-[-0.02em] text-white';
const NARRATIVE = 'm-0 mt-1 text-[14px] leading-snug text-white/70';

function NewsHeading() {
  return (
    <h2 id="h03-global-news" className={HEADING}>
      Global News
    </h2>
  );
}

function NewsNarrative() {
  // p. 13 H03 narrative, verbatim.
  return (
    <p className="m-0 text-[14px] leading-snug text-white/70">
      Follow developments in climate action, energy, environment, nature, circularity, sustainable business and finance.
    </p>
  );
}

/** The H04 column: a two-row subgrid, like the H03 column (see NewsColumn). */
function MarketsColumn({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-labelledby="h04-major-markets"
      className="flex flex-col gap-4 text-left lg:row-span-2 lg:grid lg:grid-rows-subgrid bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl"
    >
      <div>
        <h2 id="h04-major-markets" className={HEADING}>
          Major Markets
        </h2>
        {/* p. 13 H04 copy, verbatim. No numerical feed is enabled: none has
            been confirmed free for public corporate display of the exact
            instruments, so p. 13 says to show open-access commentary only. */}
        <p className={NARRATIVE}>
          Read commentary on major market developments, investment conditions and economic trends from openly accessible sources.
        </p>
      </div>
      <div>{children}</div>
    </section>
  );
}

/**
 * The frame both the skeleton and the loaded band use, so nothing moves
 * between them. On wide screens it is a 3-row grid (heads, cards, attribution)
 * and each column is a subgrid spanning the first two rows, so the H03 and H04
 * card rows always start on the same line.
 */
export function FeedsFrame({
  news,
  markets,
  attribution,
}: {
  news: React.ReactNode;
  markets: React.ReactNode;
  attribution: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-[1.9fr_1fr] lg:grid-rows-[auto_auto_auto] lg:gap-x-12 lg:gap-y-4">
      {news}
      {markets}
      {/* Source, delay and retrieval labelling (pp. 226, 229). The space is
          reserved so the fold does not move when the text arrives: one line on
          laptops, where it fits, two on narrower screens. */}
      <div data-feed-attribution className="min-h-[34px] border-t border-white/10 pt-4 text-[12px] leading-snug text-white/50 lg:col-span-2 lg:min-h-[26px]">
        {attribution}
      </div>
    </div>
  );
}

/** Suspense fallback: the same frame with skeleton cards of the loaded size. */
export function FeedsFallback() {
  return (
    <FeedsFrame
      news={
        <NewsColumn
          head={<NewsHeading />}
          narrative={<NewsNarrative />}
          controls={<NewsFilterBar filters={NEWS_FILTERS} active="all" disabled />}
        >
          <FeedSkeleton cards={2} columns="sm:grid-cols-[1.15fr_1fr]" cardHeight={NEWS_SKELETON_HEIGHT} />
        </NewsColumn>
      }
      markets={
        <MarketsColumn>
          <FeedSkeleton cards={1} columns="" cardHeight={NEWS_SKELETON_HEIGHT} />
        </MarketsColumn>
      }
      attribution={null}
    />
  );
}

function Attribution({ shown }: { shown: NewsItem[] }) {
  if (shown.length === 0) {
    return <>External news sources are unavailable right now. Nothing shown here is generated by Enerqa.</>;
  }
  const providers = [...new Set(shown.map((item) => item.provider))];
  // The oldest retrieval is the honest age of what is on screen (p. 226).
  const retrieved = formatDateTimeUtc(shown.map((item) => item.retrievedAt).sort()[0]);
  const delayed = shown.some((item) => item.provider === 'newsdata');
  const stale = shown.some((item) => isNewsItemStale(item));

  return (
    <p className="m-0">
      Headlines via{' '}
      {providers.map((id, i) => (
        <React.Fragment key={id}>
          {i > 0 && (i === providers.length - 1 ? ' and ' : ', ')}
          <a
            href={PROVIDER_META[id].href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 underline decoration-white/30 underline-offset-2 hover:text-white"
          >
            {PROVIDER_META[id].label}
          </a>
        </React.Fragment>
      ))}
      .{retrieved && ` Retrieved by Enerqa ${retrieved}`}
      {delayed && `${retrieved ? '; free-feed' : ' Free-feed'} items can arrive up to ${NEWS_DELAY_HOURS} hours after publication`}
      {(retrieved || delayed) && '.'}
      {/* p. 227: when the shared cache could not be refreshed, say so. */}
      {stale && ' Showing the latest cached headlines; the feeds could not be refreshed since.'}
      {' '}Links open the original publisher; Enerqa does not host or endorse them.
    </p>
  );
}

/** Keep only the providers p. 13 names for H03 (and so for H04's shared pool). */
function pageItems(result: NewsResult): NewsItem[] {
  return result.items.filter((item) => PAGE_NEWS_PROVIDERS.includes(item.provider));
}

async function FeedsBody() {
  // One cached "All" pool feeds all five H03 filters (see buildNewsViews), and
  // Business and Finance feeds H04. maxPerPublisher is raised on both pools so
  // the per-view cap, applied later, still has candidates to choose from.
  const [pool, marketsPool] = await Promise.all([
    fetchNews('all', 80, { maxPerPublisher: 10 }),
    fetchNews('business', 16, { maxPerPublisher: 3 }),
  ]);

  const views = buildNewsViews(pageItems(pool));
  const marketItems = withoutShown(pageItems(marketsPool), views.all, MARKET_ITEMS);

  // Everything that can appear in the band, for the attribution line.
  const shown = [...new Map([...Object.values(views).flat(), ...marketItems].map((i) => [i.id, i])).values()];

  return (
    <FeedsFrame
      news={
        <GlobalNewsPanel
          head={<NewsHeading />}
          narrative={<NewsNarrative />}
          filters={NEWS_FILTERS}
          views={{
            all: views.all.map(toCard),
            climate: views.climate.map(toCard),
            energy: views.energy.map(toCard),
            environment: views.environment.map(toCard),
            business: views.business.map(toCard),
          }}
          sourcesFailed={pool.sourcesFailed}
        />
      }
      markets={
        <MarketsColumn>
          {marketItems.length === 0 ? (
            // p. 226: "No relevant updates are available" when the sources
            // answered with nothing relevant; an honest unavailable state when
            // the sources themselves failed.
            <SourceUnavailable
              variant={marketsPool.sourcesFailed ? 'unavailable' : 'empty'}
              nearest={{ href: '/knowledge-hub/global-intelligence?theme=business', label: 'browse Global Intelligence' }}
              className={NEWS_AREA_HEIGHT}
            />
          ) : (
            <div className={`flex flex-col divide-y divide-white/10 ${NEWS_AREA_HEIGHT}`}>
              {marketItems.map((item) => (
                <NewsCard key={item.id} item={toCard(item)} marker="market" className="" />
              ))}
            </div>
          )}
        </MarketsColumn>
      }
      attribution={<Attribution shown={shown} />}
    />
  );
}

export const FirstFoldFeeds = () => (
  // Not a landmark itself: H03 and H04 are each their own labelled section.
  <div data-first-fold-band className="w-full relative z-20 pb-12 lg:pb-16 pt-8">
    <Container>
      <Suspense fallback={<FeedsFallback />}>
        <FeedsBody />
      </Suspense>
    </Container>
  </div>
);
