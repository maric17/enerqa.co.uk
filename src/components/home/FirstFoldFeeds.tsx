import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { fetchNews, NEWS_BASKETS, NEWS_DELAY_HOURS, type NewsItem } from '@/lib/api/news';
import { Container } from '../ui/Container';

/**
 * H03 Global News + H04 Major Markets (p. 13).
 *
 * Placement: its own light band directly BELOW the hero, not inside it. The
 * hero was carrying H01, H02, the chips and both feeds at once, which left the
 * first viewport crowded. Splitting them gives the search room to breathe and
 * gives the feeds enough width to show a real headline.
 *
 * Note this trades away "news inside the reference 768px fold" (p. 13, 225).
 * That was a deliberate call: a legible panel below the fold beats a cramped
 * one inside it, and the news is still the first thing after the hero.
 *
 * Design intent: light surface to sit between the dark hero above and the dark
 * Explore Our Domains band below, so the page alternates instead of running one
 * long dark stretch. Cards are white on paper with hairline borders.
 *
 * Server Component: every provider call is cached server-side and shared by
 * all visitors, as p. 226 requires.
 */

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function NewsCard({
  item,
  lead = false,
  showSummary = false,
}: {
  item: NewsItem;
  lead?: boolean;
  showSummary?: boolean;
}) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col gap-2 rounded-[var(--r-md)] border border-gray-200 bg-white p-4 no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-md"
    >
      <h3
        className={`m-0 font-semibold text-[var(--color-dark)] transition-colors group-hover:text-[var(--color-primary)] ${
          lead ? 'text-[17px] leading-snug line-clamp-3' : 'text-[14px] leading-snug line-clamp-3'
        }`}
      >
        {item.title}
      </h3>

      {/* The publisher's own words, only where the provider licenses them.
          GDELT items carry no summary, so this simply does not render. */}
      {showSummary && item.summary && (
        <p className="m-0 line-clamp-3 text-[13px] font-light leading-relaxed text-gray-600">
          {item.summary}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-2 text-[11px] text-gray-500">
        <span className="font-semibold uppercase tracking-wide text-gray-700">{item.domain}</span>
        {item.publishedAt && (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
          </>
        )}
        <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-gray-400 transition-colors group-hover:text-[var(--color-primary)]" />
      </div>
    </a>
  );
}

/** Honest unavailable state - the exact wording required by p. 226. */
function Unavailable({ note }: { note?: string }) {
  return (
    <div className="flex min-h-[92px] flex-col items-center justify-center gap-1 rounded-[var(--r-md)] border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
      <p className="m-0 text-[13px] font-medium text-gray-600">No relevant updates are available.</p>
      {note && <p className="m-0 text-[11px] text-gray-400">{note}</p>}
    </div>
  );
}

export const FirstFoldFeeds = async () => {
  // One lead story plus three shorter ones. The old count was 3 because the
  // panel had to fit inside the 768px fold; out of the hero it has room, and 4
  // balances this column against Major Markets instead of leaving a gap.
  // Markets is over-fetched so the two panels can be de-overlapped below.
  // maxPerPublisher is raised for the markets pool so that removing an overlap
  // below still leaves a candidate: this basket is served mainly by EIA.
  const [news, marketsPool] = await Promise.all([
    fetchNews('all', 4),
    fetchNews('business', 6, { maxPerPublisher: 3 }),
  ]);

  const [lead, ...rest] = news.items;

  // The two panels are separate queries, so the same story can win a place in
  // both - "What goes into diesel prices?" legitimately matches All and
  // Business and Finance. Showing it twice on one screen looks like a bug, so
  // Global News keeps it and Major Markets moves on to its next item.
  const shownInNews = new Set(news.items.map((item) => item.id));
  const marketItems = marketsPool.items.filter((item) => !shownInNews.has(item.id)).slice(0, 2);
  const marketProviders = new Set(marketItems.map((item) => item.provider));
  const markets = {
    ...marketsPool,
    items: marketItems,
    sources: marketsPool.sources.filter((source) => marketProviders.has(source.id)),
    unavailable: marketItems.length === 0,
    hasDelayedSource: marketItems.some((item) => item.provider === 'newsdata'),
  };

  // p. 226 and p. 229: name the sources actually used, and keep the delay and
  // retrieval labels separate from the articles' own publication dates.
  const contributing = [...new Set([...news.sources, ...markets.sources].map((s) => s.id))]
    .map((id) => [...news.sources, ...markets.sources].find((s) => s.id === id)!)
    .filter(Boolean);

  const retrievedLabel = new Date(news.retrievedAt).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

  return (
    <section
      aria-labelledby="h03-global-news"
      className="w-full border-b border-gray-200 bg-[var(--color-paper)] py-14 md:py-16"
    >
      <Container>
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
        {/* ---------- H03 Global News ---------- */}
        <div className="flex flex-col gap-4 text-left">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2
              id="h03-global-news"
              className="m-0 text-[26px] font-bold leading-tight tracking-tight text-[var(--color-dark)] md:text-[30px]"
            >
              Global News
            </h2>
            <Link
              href="/knowledge-hub/global-intelligence"
              className="text-[13px] font-semibold text-[var(--color-secondary)] no-underline transition-colors hover:text-[var(--color-primary)]"
            >
              View All News &rarr;
            </Link>
          </div>

          {/* H03 filters. They deep-link into Global Intelligence rather than
              re-querying here, which keeps the first fold to cached reads. */}
          <nav aria-label="Filter global news by theme" className="flex flex-wrap gap-1.5">
            {NEWS_BASKETS.map((basket) => (
              <Link
                key={basket.key}
                href={
                  basket.key === 'all'
                    ? '/knowledge-hub/global-intelligence'
                    : `/knowledge-hub/global-intelligence?theme=${basket.key}`
                }
                className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-medium text-gray-700 no-underline transition-all duration-200 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {basket.label}
              </Link>
            ))}
          </nav>

          {/* Even 2x2. The lead keeps its larger headline for hierarchy, but no
              longer spans two rows: that left a hole in the bottom-right cell.
              Summaries now render on every card - they were suppressed before
              only to keep the panel inside the 768px fold, and that constraint
              went away when this moved out of the hero. */}
          {news.unavailable ? (
            <Unavailable note="External news sources are unavailable right now." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {lead && <NewsCard item={lead} lead showSummary />}
              {rest.map((item) => (
                <NewsCard key={item.id} item={item} showSummary />
              ))}
            </div>
          )}
        </div>

        {/* ---------- H04 Major Markets ---------- */}
        <div aria-labelledby="h04-major-markets" className="flex flex-col gap-4 text-left lg:border-l lg:border-gray-200 lg:pl-12">
          <div className="flex items-baseline">
            <h2
              id="h04-major-markets"
              className="m-0 text-[26px] font-bold leading-tight tracking-tight text-[var(--color-dark)] md:text-[30px]"
            >
              Major Markets
            </h2>
          </div>

          {/* p. 13: a numerical instrument feed may only appear if it is free for
              public corporate display of those exact instruments. No such feed is
              enabled, so this panel carries sourced commentary only - which is
              what the approved H04 copy describes. */}
          <p className="m-0 text-[14px] leading-relaxed text-gray-600">
            Commentary on market developments, investment conditions and economic trends from openly accessible sources.
          </p>

          {markets.unavailable ? (
            <Unavailable />
          ) : (
            <div className="flex flex-col gap-4">
              {markets.items.map((item) => (
                <NewsCard key={item.id} item={item} showSummary />
              ))}
            </div>
          )}
        </div>

        {/* Source, delay and retrieval labelling (pp. 226, 229). */}
        <p className="m-0 border-t border-gray-200 pt-6 text-[11px] leading-relaxed text-gray-500 lg:col-span-2">
          {contributing.length > 0 ? (
            <>
              Headlines via{' '}
              {contributing.map((source, i) => (
                <React.Fragment key={source.id}>
                  {i > 0 && (i === contributing.length - 1 ? ' and ' : ', ')}
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 underline decoration-gray-300 underline-offset-2 hover:text-[var(--color-primary)]"
                  >
                    {source.label}
                  </a>
                </React.Fragment>
              ))}
              . Retrieved {retrievedLabel} UTC
              {news.hasDelayedSource || markets.hasDelayedSource
                ? `; some items reach the free feed up to ${NEWS_DELAY_HOURS} hours after publication`
                : ''}
              . Links open the original publisher; Enerqa does not host or endorse their content.
            </>
          ) : (
            <>External news sources are unavailable right now. Nothing shown here is generated by Enerqa.</>
          )}
        </p>
        </div>
      </Container>
    </section>
  );
};
