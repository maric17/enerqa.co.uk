import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { SourceUnavailable } from '@/components/ui/SourceUnavailable';
import { formatDate } from './feedParts';

/**
 * CK/EK/NK/BK and the industry "Enerqa Publication" module.
 *
 * p. 29: "First-party CMS, not external API content. Use approved real
 * publications with original metadata." Publications appear here only when an
 * editor has tagged them with this domain or industry - nothing is inferred.
 */
export async function RelatedPublications({
  field,
  id,
  limit = 3,
}: {
  field: 'domains' | 'industries';
  id: number;
  limit?: number;
}) {
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'publications',
    where: {
      and: [
        // Category separators and biographies from the archive import never publish (p. 225).
        { recordKind: { equals: 'article' } },
        { [field]: { in: [id] } },
      ],
    },
    sort: '-date',
    limit,
    depth: 0,
  });

  if (docs.length === 0) {
    return <SourceUnavailable variant="empty" className="min-h-[200px]" />;
  }

  return (
    <ul className="flex flex-col gap-4 list-none p-0 m-0">
      {docs.map((pub) => (
        <li key={pub.id}>
          <Link
            href={`/knowledge-hub/${pub.slug}`}
            className="group block rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--paper-alt)] p-6 no-underline hover:border-[var(--green)] transition-colors"
          >
            {/* p. 229: owned publications and external items must not be confused. */}
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--green-deep)]">
              Enerqa Publication{pub.type ? ` · ${pub.type}` : ''}
            </span>
            <h3 className="mt-2 mb-2 text-lg font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--color-secondary)] transition-colors">
              {pub.title}
            </h3>
            <p className="m-0 flex items-center gap-2 text-xs text-[var(--ink-muted)]">
              {pub.author && <span>By {pub.author}</span>}
              {pub.date && (
                <span>
                  {formatDate(pub.date)}
                  {!pub.dateVerified && ' (date unverified)'}
                </span>
              )}
              <ArrowRight className="ml-auto h-4 w-4 text-[var(--color-secondary)]" aria-hidden="true" />
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
