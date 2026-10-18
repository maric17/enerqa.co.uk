import React from 'react';
import Link from 'next/link';
import { ArrowRight, Database } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { Container } from '../ui/Container';
import { Typography } from '../ui/Typography'

/**
 * H09 Explore the Data Portal (handoff pp. 14-15).
 *
 * The spec is unusually specific here: "one compact chart or dataset card only;
 * use a cached source release, visible attribution and a canonical dataset link.
 * Do not duplicate a full dashboard here."
 *
 * So this shows ONE dataset card, built only from the dataset record's stored
 * source metadata (provider, unit, geography, period, release, retrieval time,
 * licence, attribution - the fields p. 226 requires) and linking to that
 * dataset's canonical page. No value is printed: a bare number here would need
 * its own chart and table, which is the dashboard p. 15 rules out.
 *
 * Which dataset: p. 15 recommends three numerical sources for this card. Only
 * a dataset whose provider is one of them is eligible, so the Our World in Data
 * and Ember records never appear here, whatever their date.
 */

// p. 15 "Recommended numerical sources: world-bank-indicators, climate-trace,
// oecd-sdmx", as their provider names are recorded on dataset records.
const APPROVED_PROVIDERS = ['World Bank', 'Climate TRACE', 'OECD'];

function formatDay(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export const DataPortalTeaser = async () => {
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'datasets',
    where: {
      and: [
        { provider: { in: APPROVED_PROVIDERS } },
        // p. 226: every published dataset supports a free anonymous download.
        { accessStatus: { equals: 'free' } },
      ],
    },
    sort: ['-retrievalTime', 'id'],
    limit: 1,
    depth: 0,
  });
  const dataset = docs[0];
  const retrieved = formatDay(dataset?.retrievalTime);

  return (
    <section className="bg-[var(--paper-alt)] py-16 lg:py-20" aria-labelledby="h09-data-portal">
      <Container>
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 md:grid-cols-[1fr_1.1fr]">
          <div>
            <Typography variant="h2" id="h09-data-portal" className="home-h2 mb-4 text-[var(--color-ink)]">
              Explore the Data Portal
            </Typography>
            {/* p. 14 H09 narrative, verbatim */}
            <p className="m-0 mb-6 text-[16px] font-light leading-relaxed text-[var(--ink-soft)]">
              Explore open-access datasets through charts and accessible tables. Each view identifies its source, geography, observation period, units and update date. Open a dataset to review the methodology and download data free of charge.
            </p>
            <Link
              href="/data-portal"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-7 py-3 text-[15px] font-bold text-white no-underline shadow-sm transition-colors hover:bg-[var(--ink-soft)]"
            >
              Explore Related Data <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          {dataset && (
            <article
              aria-labelledby="h09-dataset-title"
              className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-sm md:p-7"
            >
              <p className="m-0 mb-2 flex items-center gap-2 text-[13px] font-semibold text-[var(--color-primary-deep)]">
                <Database aria-hidden="true" className="h-4 w-4" /> Dataset · {dataset.provider}
              </p>
              <h3 id="h09-dataset-title" className="m-0 mb-4 text-[19px] font-bold leading-snug text-[var(--ink)]">
                <Link
                  href={`/data-portal/datasets/${dataset.slug}`}
                  className="text-[var(--ink)] no-underline hover:text-[var(--color-secondary)] hover:underline"
                >
                  {dataset.title}
                </Link>
              </h3>

              {/* The source metadata p. 226 requires, as stored on the record. */}
              <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px] leading-snug">
                {dataset.originalUnit && (
                  <>
                    <dt className="font-semibold text-[var(--ink)]">Unit</dt>
                    <dd className="m-0 text-[var(--ink-soft)]">{dataset.originalUnit}</dd>
                  </>
                )}
                {dataset.geographicLevel && (
                  <>
                    <dt className="font-semibold text-[var(--ink)]">Geography</dt>
                    <dd className="m-0 text-[var(--ink-soft)]">{dataset.geographicLevel}</dd>
                  </>
                )}
                {dataset.observationPeriod && (
                  <>
                    <dt className="font-semibold text-[var(--ink)]">Observation period</dt>
                    <dd className="m-0 text-[var(--ink-soft)]">{dataset.observationPeriod}</dd>
                  </>
                )}
                {dataset.version && (
                  <>
                    <dt className="font-semibold text-[var(--ink)]">Source release</dt>
                    <dd className="m-0 text-[var(--ink-soft)]">{dataset.version}</dd>
                  </>
                )}
                {retrieved && (
                  <>
                    <dt className="font-semibold text-[var(--ink)]">Retrieved by Enerqa</dt>
                    <dd className="m-0 text-[var(--ink-soft)]">{retrieved}</dd>
                  </>
                )}
              </dl>

              {/* Visible attribution (p. 15), with the licence linked where recorded. */}
              {dataset.attribution && (
                <p className="m-0 mt-4 border-t border-[var(--line)] pt-3 text-[12px] leading-relaxed text-[var(--ink-muted)]">
                  Source: {dataset.attribution}
                  {dataset.licenceUrl && (
                    <>
                      {' '}
                      <a
                        href={dataset.licenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-secondary)] underline underline-offset-2"
                      >
                        Licence terms<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </>
                  )}
                </p>
              )}

              <Link
                href={`/data-portal/datasets/${dataset.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--color-secondary)] no-underline hover:underline"
              >
                View dataset<span className="sr-only">: {dataset.title}</span> <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </article>
          )}
        </div>
      </Container>
    </section>
  );
};
