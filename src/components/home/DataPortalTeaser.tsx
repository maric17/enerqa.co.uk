import React from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { Container } from '../ui/Container';

/**
 * H09 Explore the Data Portal (handoff pp. 14-15).
 *
 * The spec is unusually specific here: "one compact chart or dataset card only;
 * use a cached source release, visible attribution and a canonical dataset link.
 * Do not duplicate a full dashboard on the homepage."
 *
 * This replaces the previous section, which fetched eight separate live APIs on
 * every homepage render - heavy, and a full dashboard rather than one card.
 *
 * No value is shown yet. p. 226/227 require any published figure to carry its
 * provider, unit, geography, observation period, release version and retrieval
 * time, served through the cached connector layer that Part 13 builds. Printing
 * a bare number before that exists would be exactly the "sample statistic" the
 * spec rules out, so this card links to the catalogue instead.
 */
export const DataPortalTeaser = () => (
  <section className="bg-[var(--paper-alt)] py-16 lg:py-20">
    <Container>
      <div className="mx-auto flex max-w-4xl flex-col gap-8 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--paper)] p-8 shadow-sm md:flex-row md:items-center md:p-10">
        <div className="flex-1">
          <span className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--green-deep)]">
            Data Portal
          </span>
          <h2 className="mb-4 text-[clamp(22px,2.6vw,30px)] font-bold leading-tight text-[var(--ink)]">
            Explore the Data Portal
          </h2>
          <p className="m-0 text-[16px] font-light leading-relaxed text-[var(--ink-soft)]">
            Open-access datasets presented through charts and accessible tables. Each view identifies its source, geography, observation period and units, and every dataset can be downloaded free of charge.
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-4 md:items-end">
          <div
            aria-hidden="true"
            className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--paper-alt)] text-[var(--green-deep)]"
          >
            <BarChart3 className="h-9 w-9" />
          </div>
          <Link
            href="/data-portal"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--green)] px-7 py-3 text-[15px] font-bold text-white no-underline shadow-sm transition-colors hover:bg-[var(--green-deep)]"
          >
            Explore the Data Portal <ArrowRight className="h-4 w-4" />
          </Link>
          {/* A "Sources and methodology" link belongs here (p. 14), but
              /data-portal/sources does not exist yet - Part 12.6 builds it.
              Handoff p. 4 forbids links that lead nowhere, so it is omitted
              until the route is real rather than shipped broken. */}
        </div>
      </div>
    </Container>
  </section>
);
