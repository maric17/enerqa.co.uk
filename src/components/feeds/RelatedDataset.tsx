import { DATASETS } from '@/lib/data-portal/connectors';
import { sourceLabel } from '@/lib/api/core/provenance';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { catalogueLinks } from '@/lib/feeds/curated';

/**
 * CD/ED/ND/BD and I{nn}D "Related Data".
 *
 * p. 29: "one compact chart or dataset card only; use a cached source release,
 * visible attribution and a canonical dataset link. Do not duplicate a full
 * dashboard here." p. 65: "If no geographically relevant licensed dataset is
 * available, replace the preview with relevant canonical catalogue links, not a
 * sample statistic." So this renders the one dataset card, or else the
 * catalogue links of the page's recommended numerical sources - never a
 * sentence about what has or has not been linked yet.
 */
export async function RelatedDataset({
  field,
  id,
  sources = [],
}: {
  field: 'domains' | 'industries';
  id: number;
  /** The page's "Recommended numerical sources" (provider ids, pp. 29, 38, 49, 59 and 65-138). */
  sources?: readonly string[];
}) {
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'datasets',
    // Local API calls bypass public access rules, so apply the publication gate here.
    where: { [field]: { in: [id] }, status: { equals: 'verified_open' }, accessStatus: { equals: 'verified_open' }, redistribution: { equals: true } },
    limit: 1,
    depth: 0,
  });
  const ds = docs[0];

  if (!ds && sources.includes('eia-open-data')) {
    // A real, labelled U.S. series can be previewed without inventing a CMS dataset.
    const result = await DATASETS['energy-generation'].handler(new URLSearchParams());
    const series = result.ok ? result.data[0] : null;
    const latest = series?.observations.at(-1);
    if (series && latest) return <div className="max-w-4xl rounded border bg-[var(--paper-alt)] p-6">
      <h3 className="mb-2 text-lg font-bold">United States electricity generation</h3>
      <p>{latest.period}: {latest.value === null ? 'No figure published' : `${latest.value.toLocaleString('en-GB')} ${series.unit}`} · annual observations.</p>
      <p className="my-3 text-xs">{sourceLabel(series.provenance)}. {series.provenance.licence}.</p>
      <Link className="underline" href="/data-portal/series/energy-generation">View dataset, methodology and free download</Link>
    </div>;
  }

  if (!ds) {
    const links = catalogueLinks(sources);
    if (links.length === 0) return null;
    return (
      <div className="max-w-4xl rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--paper-alt)] p-6">
        <h3 id={`catalogues-${field}-${id}`} className="m-0 mb-3 text-sm font-bold uppercase tracking-wider text-[var(--ink-muted)]">
          Source catalogues
        </h3>
        <ul aria-labelledby={`catalogues-${field}-${id}`} className="m-0 flex list-none flex-col gap-2 p-0">
          {links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[var(--color-secondary)] hover:underline"
              >
                {link.title}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">(opens the provider's catalogue in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Attribution line built only from recorded fields, so nothing is implied
  // that the dataset record does not state (p. 226).
  const facts = [ds.provider, ds.geographicLevel, ds.observationPeriod, ds.licence].filter(Boolean);

  return (
    <div className="max-w-4xl rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--paper-alt)] p-6">
      <h3 className="mb-2 text-lg font-bold text-[var(--ink)]">{ds.title}</h3>
      {ds.description && <p className="mb-3 text-sm text-[var(--ink-soft)] line-clamp-2">{ds.description}</p>}
      {facts.length > 0 && <p className="mb-4 text-xs text-[var(--ink-muted)]">{facts.join(' · ')}</p>}
      <Link
        href={`/data-portal/datasets/${ds.slug}`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-secondary)] hover:underline"
      >
        View dataset, methodology and free download <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
