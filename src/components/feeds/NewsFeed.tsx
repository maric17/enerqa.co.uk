import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { fetchNews, fetchNewsForKeywords, NEWS_DELAY_HOURS, PAGE_NEWS_PROVIDERS } from '@/lib/api/news';
import { SourceUnavailable } from '@/components/ui/SourceUnavailable';
import { FeedMeta, formatDate } from './feedParts';

/**
 * CN/EN/NN/BN "Latest News" and I{nn}N "Industry News".
 *
 * Reads the shared cached pool - the four topic baskets plus this page's own
 * "News query baskets" from the handoff, each cached for every visitor - and
 * keeps only items matching those baskets (p. 226). Placement (p. 37): three
 * cards with headline, source,
 * publication time and short permitted description. Only the two news
 * providers the page spec names (NewsData, GDELT) are used - EIA and EEA items
 * are official analysis and appear in the official-updates modules instead.
 *
 * Without `phrases` it previews the whole Global Intelligence news pool (the
 * four topic baskets), as the Knowledge Hub's K05 block does (p. 156).
 */
export async function NewsFeed({
  phrases,
  baskets,
  limit = 3,
  nearest,
}: {
  /** Omit to preview the whole Global Intelligence news pool. */
  phrases?: string[];
  /** The page's own "News query baskets", also sent to NewsData (every 12 h, shared by all visitors). */
  baskets?: string[][];
  limit?: number;
  nearest: { href: string; label: string };
}) {
  const result = phrases
    ? await fetchNewsForKeywords(phrases, limit, { baskets })
    : await fetchNews('all', limit, { providers: PAGE_NEWS_PROVIDERS });

  if (result.items.length === 0) {
    return <SourceUnavailable sourcesFailed={result.sourcesFailed} nearest={nearest} className="min-h-[220px]" />;
  }

  return (
    <div>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 list-none p-0 m-0">
        {result.items.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full min-h-[220px] flex-col gap-3 rounded-[var(--r-md)] border border-[var(--line)] bg-white p-6 no-underline transition-shadow hover:shadow-md"
            >
              <h3 className="m-0 text-lg font-bold leading-snug text-[var(--ink)] line-clamp-3 group-hover:text-[var(--color-secondary)] transition-colors">
                {item.title}
              </h3>
              {/* The publisher's own teaser, only where the provider licenses one
                  (p. 210). GDELT items have none, so they show a headline only. */}
              {item.summary && (
                <p className="m-0 text-sm text-[var(--ink-soft)] line-clamp-3">{item.summary}</p>
              )}
              <div className="mt-auto flex items-center gap-2 border-t border-[var(--line)] pt-3 text-xs text-[var(--ink-muted)]">
                <span className="font-semibold uppercase tracking-wide">{item.publisher}</span>
                {item.publishedAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
                  </>
                )}
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">(opens the original article in a new tab)</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <FeedMeta
        sources={result.sources.map((s) => s.label)}
        retrievedAt={result.retrievedAt}
        stale={result.stale}
        // p. 37: "Show source delays rather than calling the free feed live."
        extra={result.hasDelayedSource ? `NewsData.io free-plan items are delayed by up to ${NEWS_DELAY_HOURS} hours.` : undefined}
      />
    </div>
  );
}
