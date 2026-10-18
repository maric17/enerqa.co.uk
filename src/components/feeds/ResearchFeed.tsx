import React from 'react';
import { fetchResearchCards } from '@/lib/feeds/research';
import type { SpecialistFeed } from '@/lib/feeds/contextual';
import { SourceUnavailable } from '@/components/ui/SourceUnavailable';
import { FeedMeta, formatDate } from './feedParts';

/**
 * CR/ER/NR/BR "Research and Articles" and I{nn}R "Research and Official Updates".
 *
 * Each of the page's handoff research themes is one cached query (p. 212
 * onward), ranked OpenAlex first and DOAJ second (p. 28). Industry pages also
 * pass their specialist feeds (p. 65), which follow the scholarly records and
 * keep their own labels ("Corporate disclosure", "Official energy analysis").
 * The label on each card comes from the connector's own fields, never guessed
 * from the title (p. 37: "Separate journal research, reports and unreviewed
 * preprints").
 */
export async function ResearchFeed({
  themes,
  limit = 4,
  nearest,
  specialistFeeds,
}: {
  themes: string[];
  limit?: number;
  nearest: { href: string; label: string };
  specialistFeeds?: SpecialistFeed[];
}) {
  const result = await fetchResearchCards({ themes, limit, specialistFeeds });

  if (result.cards.length === 0) {
    return <SourceUnavailable sourcesFailed={result.sourcesFailed} nearest={nearest} className="min-h-[240px]" />;
  }

  return (
    <div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0 m-0">
        {result.cards.map((card) => {
          const authors = card.authors.slice(0, 2).join(', ') + (card.authors.length > 2 ? ' et al.' : '');
          const doi = card.doi?.replace(/^https?:\/\/(dx\.)?doi\.org\//, '');
          return (
            <li key={card.id}>
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full min-h-[240px] flex-col rounded-[var(--r-md)] border border-[var(--line)] bg-white p-6 no-underline transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-secondary)] line-clamp-2">
                    {card.label}
                    {card.source && <> · {card.source}</>}
                  </span>
                  {/* Only for records that passed the verified_open check (p. 227). */}
                  {card.openAccess && (
                    <span className="shrink-0 rounded-sm bg-[var(--green)]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--green-deep)]">
                      Open access
                    </span>
                  )}
                </div>
                <h3 className="mb-3 text-lg font-bold leading-snug text-[var(--ink)] line-clamp-3 group-hover:text-[var(--color-secondary)] transition-colors">
                  {card.title}
                </h3>
                {authors && <p className="mb-4 text-sm italic text-[var(--ink-soft)] line-clamp-2">{authors}</p>}
                <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--line)] pt-3 text-xs text-[var(--ink-muted)]">
                  {card.publishedAt ? (
                    <time dateTime={card.publishedAt}>{formatDate(card.publishedAt)}</time>
                  ) : (
                    <span>Date not stated</span>
                  )}
                  {doi && <span className="break-all">DOI {doi}</span>}
                  {/* p. 212: "Keep copyright/licence/version and preprint labels". */}
                  {card.licence && <span>Licence: {card.licence}</span>}
                  {card.version && <span>{card.version}</span>}
                  {/* Only when the provider states it - never inferred (p. 212). */}
                  {card.peerReviewed === true && <span className="uppercase tracking-wide">Peer reviewed</span>}
                  <span className="sr-only">(opens the original in a new tab)</span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
      <FeedMeta sources={result.sources} retrievedAt={result.retrievedAt} stale={result.stale} />
    </div>
  );
}
