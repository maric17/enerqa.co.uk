import React, { Suspense } from 'react';
import { fetchNews, isNewsItemStale, NEWS_DELAY_HOURS, PAGE_NEWS_PROVIDERS, PROVIDER_META, sourcesFailedFor } from '@/lib/api/news';
import type { NewsItem } from '@/lib/api/news';
import { FeedSkeleton } from '../feeds/feedParts';
import { SourceUnavailable } from '../ui/SourceUnavailable';
import { Container } from '../ui/Container';
import { GlobalNewsPanel, NewsColumn, NewsFilterBar } from './GlobalNewsPanel';
import { NewsCard } from './NewsCard';
import {
  buildNewsViews,
  buildMarketView,
  formatDateTimeUtc,
  NEWS_AREA_HEIGHT,
  NEWS_FILTERS,
  NEWS_SKELETON_HEIGHT,
  toCard,
} from './firstFoldNews';

/**
 * H03 Global News + H04 Major Markets (p. 13), the compact band directly under
 * the hero.
 *
 * First fold (p. 15, p. 229): at 1366x768 this band has to sit inside the first
 * viewport together with the header, H01 and H02, ending around y 720. That is
 * why the type and spacing are compact. October feedback stacks equal-height
 * news and market panels, with imagery confined to the news slideshow.
 *
 * Sources (p. 13): "Use NewsData.io's delayed free feed and additional legacy
 * GDELT coverage", and H04 "uses eligible items from the same free news pool".
 * Global News reads saved PAGE_NEWS_PROVIDERS articles. Major Markets compares
 * their publication dates with verified U.S. EIA market commentary.
 * EIA cannot consume Global News slots or mask a news-provider outage.
 *
 * Streaming (p. 226 "Loading reserves the card/chart dimensions"): the provider
 * database reads run inside <Suspense>, so the page shell, hero and search are sent at
 * once, and the band's headings and a same-size skeleton hold the space until
 * the cached feeds arrive. Before this, the whole homepage waited on the feeds
 * (the first GET / took 22 s).
 *
 * Providers are pulled on three daily jobs; visitors share saved database records.
 */

/** How many commentary items the compact H04 panel shows. */
const MARKET_ITEMS = 2;

const HEADING = 'm-0 text-[24px] font-bold leading-tight tracking-[-0.02em] text-white';

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
    <p className="sr-only">
      Follow developments in climate action, energy, environment, nature, circularity, sustainable business and finance.
    </p>
  );
}

/** H04 retains sourced commentary until a public-display quote feed is selected. */
function MarketsColumn({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-labelledby="h04-major-markets"
      className="first-fold-panel markets-panel flex flex-col gap-2 p-3 text-left"
    >
      <div>
        <h2 id="h04-major-markets" className={HEADING}>
          Major Markets
        </h2>
        {/* p. 13 H04 copy, verbatim. No numerical feed is enabled: none has
            been confirmed free for public corporate display of the exact
            instruments, so p. 13 says to show open-access commentary only. */}
        <p className="m-0 mt-1 text-xs leading-relaxed text-white/80">
          Read commentary on major market developments, investment conditions and economic trends from openly accessible sources.
        </p>
      </div>
      <div>{children}</div>
    </section>
  );
}

/**
 * Skeleton and loaded feeds share a frame. Desktop rows have equal heights;
 * mobile content expands naturally rather than clipping long headlines.
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
    <div>
      <div className="first-fold-grid">
        {news}
        {markets}
      </div>
      {/* Source, delay and retrieval labelling (pp. 226, 229). The space is
          reserved so the fold does not move when the text arrives: one line on
          laptops, where it fits, two on narrower screens. */}
      <div data-feed-attribution className="mt-3 text-[11px] leading-relaxed text-white/75">
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
          <FeedSkeleton cards={1} columns="" cardHeight={NEWS_SKELETON_HEIGHT} />
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

function Attribution({ shown, sourcesFailed }: { shown: NewsItem[]; sourcesFailed: boolean }) {
  if (shown.length === 0) {
    // An answered feed with no matching articles is different from a source outage.
    return <>{sourcesFailed ? 'External news sources are unavailable right now.' : 'No relevant updates are available from the external news feeds right now.'} Nothing shown here is generated by Enerqa.</>;
  }
  const providers = [...new Set(shown.map((item) => item.provider))];
  // The oldest retrieval is the honest age of what is on screen (p. 226).
  const retrieved = formatDateTimeUtc(shown.map((item) => item.retrievedAt).sort()[0]);
  const refreshed = formatDateTimeUtc(shown.map(item => item.feedRefreshedAt).filter((t): t is string => Boolean(t)).sort()[0] ?? null);
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
      .{delayed && ` NewsData free feed delayed ${NEWS_DELAY_HOURS}h+.`}
      {(refreshed || retrieved) && ` Updated ${refreshed ?? retrieved}.`}
      {/* p. 227: when the shared cache could not be refreshed, say so. */}
      {stale && ' Cached headlines; refresh unavailable.'}
      {' '}<a href="/data-portal/sources" className="underline underline-offset-2">Sources and rights</a>.
    </p>
  );
}

export async function FeedsBody() {
  // Reuse all four topic feeds: energy prices and carbon-market articles can
  // arrive outside the narrow finance query. One pool also avoids a second GDELT call.
  // Both reads use the same saved database cache; neither contacts a provider.
  // Always compare commentary so a full set of old news cannot hide newer reports.
  const [pool, commentary] = await Promise.all([
    fetchNews('all', 80, { maxPerPublisher: 10, providers: PAGE_NEWS_PROVIDERS }),
    fetchNews('business', MARKET_ITEMS, {
      providers: ['eia_rss'],
      maxPerPublisher: 10,
    }),
  ]);

  const views = buildNewsViews(pool.items);
  const marketItems = buildMarketView([...pool.items, ...commentary.items], views.all, MARKET_ITEMS);
  const marketSourcesFailed = sourcesFailedFor(
    { providerStatus: { ...pool.providerStatus, ...commentary.providerStatus } },
    [...PAGE_NEWS_PROVIDERS, 'eia_rss'],
  );

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
          diagnostics={pool.diagnostics}
        />
      }
      markets={
        <MarketsColumn>
          {marketItems.length === 0 ? (
            // p. 226: "No relevant updates are available" when the sources
            // answered with nothing relevant; an honest unavailable state when
            // the sources themselves failed.
            <SourceUnavailable
              variant={marketSourcesFailed ? 'unavailable' : 'empty'}
              nearest={{ href: '/knowledge-hub/global-intelligence?theme=business', label: 'browse Global Intelligence' }}
              className={NEWS_AREA_HEIGHT}
            />
          ) : (
            <div className={NEWS_AREA_HEIGHT}>
              <div className="grid gap-5 md:grid-cols-2">
                {marketItems.map((item) => (
                  <NewsCard key={item.id} item={toCard(item)} marker="market" className="" />
                ))}
              </div>
              {marketItems.some((item) => item.provider === 'eia_rss') && (
                // Tell visitors the geographic scope of this supplemental source.
                <p className="m-0 mt-3 text-[12px] leading-snug text-white/70">
                  EIA commentary focuses on U.S. energy markets.
                </p>
              )}
            </div>
          )}
        </MarketsColumn>
      }
      attribution={<Attribution shown={shown} sourcesFailed={marketSourcesFailed} />}
    />
  );
}

export const FirstFoldFeeds = () => (
  // Not a landmark itself: H03 and H04 are each their own labelled section.
  <div data-first-fold-band className="relative z-20 w-full pt-5">
    <Container>
      <Suspense fallback={<FeedsFallback />}>
        <FeedsBody />
      </Suspense>
    </Container>
  </div>
);
