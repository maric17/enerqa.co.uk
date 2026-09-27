'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, FileText, Filter, Search, X } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { queryTerms } from '../search/searchIndex';
import {
  ARCHIVE_LABELS,
  EMPTY_SELECTION,
  FACET_KEYS,
  LANGUAGE_LABELS,
  PER_PAGE,
  facetCounts,
  facetValues,
  matchesFacets,
  matchPublication,
  paginate,
  type FacetKey,
  type PublicationCard,
  type Selection,
} from './publicationFinder';

/**
 * K03 "Find a Publication" and K04 "Enerqa Publication" (p. 155) - the only
 * part of /knowledge-hub that runs in the browser.
 */

const FACET_LABELS: Record<FacetKey, string> = {
  archiveCategory: 'Topic',
  domain: 'Domain',
  industry: 'Industry',
  type: 'Publication Type',
  year: 'Year',
  language: 'Language',
  author: 'Author',
};

// The visible label of a facet value (slugs and codes become names).
const labelFor = (key: FacetKey, value: string, related: Map<string, string>) => {
  if (key === 'language') return LANGUAGE_LABELS[value] ?? value;
  if (key === 'archiveCategory') return ARCHIVE_LABELS[value] ?? value;
  if (key === 'domain' || key === 'industry') return related.get(value) ?? value;
  return value;
};

// timeZone 'UTC' so the server and every browser print the same calendar day.
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function KnowledgeHubClient({ publications }: { publications: PublicationCard[] }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Selection>(EMPTY_SELECTION);
  const [page, setPage] = useState(1);
  // Small screens: the long filter list is folded away so results stay near the top.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsHeading = useRef<HTMLHeadingElement>(null);

  // Slug -> title for the Domain and Industry facets and card tags.
  const relatedTitles = useMemo(() => {
    const titles = new Map<string, string>();
    publications.forEach((pub) => [...pub.domains, ...pub.industries].forEach((r) => titles.set(r.slug, r.title)));
    return titles;
  }, [publications]);

  const displayValue = (key: FacetKey, value: string) => labelFor(key, value, relatedTitles);

  // Options come from the real data, so a filter never offers a value that returns nothing.
  // Years run newest first; everything else is alphabetical by its visible label.
  const facets = useMemo(() => {
    const out = {} as Record<FacetKey, string[]>;
    FACET_KEYS.forEach((key) => {
      const values = new Set<string>();
      publications.forEach((pub) => facetValues(pub, key).forEach((v) => values.add(v)));
      out[key] = [...values].sort((a, b) =>
        key === 'year' ? b.localeCompare(a) : labelFor(key, a, relatedTitles).localeCompare(labelFor(key, b, relatedTitles)),
      );
    });
    return out;
  }, [publications, relatedTitles]);

  // ?domain= and ?industry= come from the domain pages' "Explore Enerqa
  // Publication" link (p. 29) and the industry pages' "Explore Related
  // Publications" link. Read after load so the page itself stays static. A value
  // is applied only if some publication carries it, so a link from an untagged
  // domain never lands on an empty list.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const domain = params.get('domain');
    const industry = params.get('industry');
    setSelected((prev) => ({
      ...prev,
      domain: domain && facets.domain.includes(domain) ? [domain] : prev.domain,
      industry: industry && facets.industry.includes(industry) ? [industry] : prev.industry,
    }));
  }, [facets]);

  // A new search or filter always starts again from page 1.
  const search = (value: string) => {
    setQuery(value);
    setPage(1);
  };
  const toggle = (key: FacetKey, value: string) => {
    setSelected((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
    setPage(1);
  };
  const clearSearch = () => {
    setQuery('');
    setPage(1);
  };
  const clearFilters = () => {
    setSelected(EMPTY_SELECTION);
    setPage(1);
  };
  // p. 155: "Clear all filters restores the complete collection" - the search box included.
  const clearAll = () => {
    setSelected(EMPTY_SELECTION);
    setQuery('');
    setPage(1);
  };

  const activeChips = FACET_KEYS.flatMap((key) => selected[key].map((value) => ({ key, value })));
  const terms = useMemo(() => queryTerms(query), [query]);
  const isFiltered = terms.length > 0 || activeChips.length > 0;

  // Within a facet the selected values are OR'd; across facets they are AND'd.
  // With a query, the most relevant come first; otherwise the server's date order.
  const results = useMemo(() => {
    const scored = publications
      .map((pub, index) => ({ pub, index, score: matchPublication(pub, terms) }))
      .filter(({ pub, score }) => score > 0 && matchesFacets(pub, selected));
    if (terms.length > 0) scored.sort((a, b) => b.score - a.score || a.index - b.index);
    return scored.map((s) => s.pub);
  }, [publications, terms, selected]);

  // How many results each option would give right now. An option at 0 is
  // disabled, so combining a search with a filter can't walk into an empty list.
  const counts = useMemo(() => facetCounts(publications, terms, selected), [publications, terms, selected]);

  // K04 "Featured publication + searchable result cards" (p. 152). The newest
  // publication with a verified date leads the unfiltered view and is not
  // repeated in the list below it.
  const featured = isFiltered ? null : results.find((p) => p.dateVerified) ?? null;
  const listed = featured ? results.filter((p) => p !== featured) : results;
  const { items: pageItems, page: currentPage, pageCount } = paginate(listed, page, PER_PAGE);

  // Move keyboard and screen-reader users to the top of the new page of results.
  const goToPage = (n: number) => {
    setPage(n);
    resultsHeading.current?.scrollIntoView({ block: 'start' });
    resultsHeading.current?.focus({ preventScroll: true });
  };

  return (
    <section id="publications" aria-labelledby="k03-heading" className="scroll-mt-24 py-16">
      <Container>
        {/* K03 Find a Publication */}
        <div className="mb-10 max-w-3xl">
          <h2 id="k03-heading" className="m-0 mb-5 text-3xl font-bold text-[var(--color-dark)]">Find a Publication</h2>
          <form role="search" className="relative" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="publication-search" className="sr-only">Search Enerqa publications</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" aria-hidden="true" />
            <input
              id="publication-search"
              type="search"
              placeholder="Search Enerqa publications by keyword or topic."
              className="w-full rounded-xl border border-gray-300 py-4 pl-12 pr-4 outline-none focus:border-[var(--color-primary-deep)] focus:ring-1 focus:ring-[var(--color-primary-deep)]"
              value={query}
              onChange={(e) => search(e.target.value)}
            />
          </form>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* K03 filters. Each facet appears only once a publication carries a
              value for it, so Domain and Industry show up as editors tag. */}
          <div className="lg:col-span-1">
            <button
              type="button"
              className="mb-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-gray-300 px-4 font-bold text-[var(--color-dark)] lg:hidden"
              aria-expanded={filtersOpen}
              aria-controls="publication-filters"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <Filter className="h-5 w-5" aria-hidden="true" />
              Filters{activeChips.length > 0 && ` (${activeChips.length})`}
            </button>
            <div id="publication-filters" className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
              <div className="mb-6 flex items-center justify-between">
                {/* On small screens the toggle button above already says "Filters", so the heading is for screen readers only there. */}
                <h3 className="m-0 flex items-center gap-2 text-lg font-bold text-[var(--color-dark)] max-lg:sr-only">
                  <Filter className="hidden h-5 w-5 text-gray-500 lg:inline" aria-hidden="true" /> Filters
                </h3>
                {isFiltered && (
                  <button type="button" onClick={clearAll} className="text-sm font-medium text-[var(--color-secondary)] hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-8">
                {FACET_KEYS.map((key) =>
                  facets[key].length === 0 ? null : (
                    <fieldset key={key} className="m-0 border-0 p-0">
                      <legend className="mb-3 p-0 text-sm font-bold uppercase tracking-wider text-gray-600">{FACET_LABELS[key]}</legend>
                      <div className="flex flex-col gap-2">
                        {facets[key].map((value) => {
                          const n = counts[key].get(value) ?? 0;
                          const checked = selected[key].includes(value);
                          const off = n === 0 && !checked;
                          return (
                            <label
                              key={value}
                              className={`group flex items-start gap-2 ${off ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer text-gray-700'}`}
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5 cursor-pointer rounded text-[var(--color-primary)] focus:ring-[var(--color-primary-deep)] disabled:cursor-not-allowed disabled:opacity-50"
                                checked={checked}
                                disabled={off}
                                onChange={() => toggle(key, value)}
                              />
                              <span className={`text-sm transition-colors ${off ? '' : 'group-hover:text-[var(--color-dark)]'}`}>
                                {displayValue(key, value)}{' '}
                                {/* The count is read out with the label: "2022 (0)". */}
                                <span className="text-gray-500">({n})</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {/* K04 Enerqa Publication, copy p. 155 verbatim */}
            <h2
              id="k04-heading"
              ref={resultsHeading}
              tabIndex={-1}
              className="m-0 scroll-mt-24 text-3xl font-bold text-[var(--color-dark)] outline-none"
            >
              Enerqa Publication
            </h2>
            <p className="m-0 mt-3 max-w-3xl text-lg text-gray-600">
              Read original analysis and practical insights produced by Enerqa. Search by topic or keyword to find publications with clearly identified authors, publication dates and free reading or download formats.
            </p>

            {/* K03: result count, removable active-filter chips and Clear All */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="m-0 text-sm font-medium text-gray-600" aria-live="polite">
                Showing {results.length} of {publications.length} publications
              </p>
              {isFiltered && (
                <button type="button" onClick={clearAll} className="whitespace-nowrap text-sm font-medium text-[var(--color-secondary)] hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
            {activeChips.length > 0 && (
              <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
                {activeChips.map(({ key, value }) => (
                  <li key={`${key}-${value}`}>
                    <button
                      type="button"
                      onClick={() => toggle(key, value)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-[var(--color-paper-alt)] py-1.5 pl-3 pr-2 text-xs font-medium text-[var(--color-dark)] transition-colors hover:border-[var(--color-dark)]"
                      aria-label={`Remove filter ${FACET_LABELS[key]}: ${displayValue(key, value)}`}
                    >
                      <span className="text-gray-600">{FACET_LABELS[key]}:</span>
                      {displayValue(key, value)}
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 space-y-6">
              {featured && currentPage === 1 && (
                <PublicationCardView pub={featured} tagTitle={(slug) => relatedTitles.get(slug) ?? slug} featured />
              )}
              {results.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                  <p className="m-0 text-gray-600">No publications match your search or filters.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
                    {query && (
                      <button type="button" onClick={clearSearch} className="font-bold text-[var(--color-secondary)] hover:underline">
                        Clear search
                      </button>
                    )}
                    {activeChips.length > 0 && (
                      <button type="button" onClick={clearFilters} className="font-bold text-[var(--color-secondary)] hover:underline">
                        Remove filters
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <ul className="m-0 list-none space-y-6 p-0">
                  {pageItems.map((pub) => (
                    <li key={pub.id}>
                      <PublicationCardView pub={pub} tagTitle={(slug) => relatedTitles.get(slug) ?? slug} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* p. 155: "pagination below results" */}
            {pageCount > 1 && (
              <nav aria-label="Publication pages" className="mt-10 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-gray-300 px-4 font-medium text-[var(--color-dark)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
                </button>
                <ol className="m-0 flex list-none gap-1 p-0">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                    <li key={n}>
                      <button
                        type="button"
                        onClick={() => goToPage(n)}
                        aria-current={n === currentPage ? 'page' : undefined}
                        aria-label={`Page ${n} of ${pageCount}`}
                        className={`h-11 min-w-[44px] rounded-lg px-3 font-bold ${
                          n === currentPage ? 'bg-[var(--color-dark)] text-white' : 'text-[var(--color-dark)] hover:bg-[var(--color-paper-alt)]'
                        }`}
                      >
                        {n}
                      </button>
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === pageCount}
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-gray-300 px-4 font-medium text-[var(--color-dark)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * One K04 card. p. 155: "title, permitted teaser, author, actual date, content
 * type, language and domain/industry/topic tags. Read Article opens the openly
 * readable canonical detail page. Download Report appears only with an
 * approved file". p. 229: labelled as Enerqa's own, so it can't be mistaken
 * for an external item.
 */
function PublicationCardView({ pub, tagTitle, featured = false }: {
  pub: PublicationCard;
  tagTitle: (slug: string) => string;
  featured?: boolean;
}) {
  const tags = [
    ...(pub.archiveCategory ? [ARCHIVE_LABELS[pub.archiveCategory] ?? pub.archiveCategory] : []),
    ...pub.domains.map((d) => tagTitle(d.slug)),
    ...pub.industries.map((i) => tagTitle(i.slug)),
  ];
  return (
    <article
      className={`rounded-xl border bg-white p-6 transition-all hover:border-[var(--color-primary)] md:p-8 ${
        featured ? 'border-[var(--color-primary)] border-l-4' : 'border-gray-200'
      }`}
    >
      {featured && (
        <p className="m-0 mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-primary-deep)]">Latest publication</p>
      )}
      <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
        <span className="text-[var(--color-secondary)]">Enerqa Publication · {pub.type || 'Publication'}</span>
        <span className="text-gray-500" aria-hidden="true">|</span>
        <span className="text-gray-600">{LANGUAGE_LABELS[pub.language ?? 'en'] ?? 'English'}</span>
        <span className="text-gray-500" aria-hidden="true">|</span>
        {/* p. 226: a date must not be presented as verified when it is not. */}
        <span className="text-gray-600">
          {pub.date ? <time dateTime={pub.date}>{formatDate(pub.date)}</time> : 'Date not confirmed'}
          {pub.date && !pub.dateVerified && (
            <span className="ml-1 font-normal normal-case text-gray-500" title="Publication date not yet verified against the original source">
              (date unverified)
            </span>
          )}
        </span>
      </div>
      <h3 className={`m-0 mb-3 font-bold text-[var(--color-dark)] ${featured ? 'text-3xl' : 'text-2xl'}`}>{pub.title}</h3>
      {pub.excerpt && <p className="m-0 mb-4 line-clamp-3 text-gray-600">{pub.excerpt}</p>}
      {tags.length > 0 && (
        <ul className="m-0 mb-4 flex list-none flex-wrap gap-2 p-0" aria-label="Tags">
          {tags.map((tag) => (
            <li key={tag} className="rounded-full bg-[var(--color-paper-alt)] px-3 py-1 text-xs font-medium text-[var(--color-dark)]">
              {tag}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        {pub.author && <span className="font-medium text-gray-600">By {pub.author}</span>}
        <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* Read Article is always there; a file adds Download Report, it never replaces the article. */}
          <Link href={`/knowledge-hub/${pub.slug}`} className="inline-flex items-center gap-1 font-bold text-[var(--color-primary-deep)] hover:underline">
            Read Article<span className="sr-only">: {pub.title}</span> <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {pub.fileUrl && (
            <a href={pub.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-[var(--color-primary-deep)] hover:underline">
              Download Report<span className="sr-only">: {pub.title} (opens in a new tab)</span> <FileText className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
