import React, { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { ExternalSearchResults } from './ExternalSearchResults';
import { AIResponse } from './AIResponse';
import { getSearchIndex } from './loadIndex';
import {
  SEARCH_COPY,
  excerptFor,
  formatSourceDate,
  readQuery,
  runSearch,
  type SearchHit,
} from './searchIndex';

// p. 227: "Noindex search results". The layout appends " | Enerqa".
export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Enerqa’s domains, industries, publications, data and tools.',
  robots: { index: false, follow: false },
};

// p. 13 H02 suggested chips.
const SUGGESTIONS = [
  'How can a climate project attract finance?',
  'Explore renewable-energy feasibility',
  'What does ESG readiness involve?',
];

// The AI04 empty state, with its last words linked to the domains overview.
const EMPTY_LINK_TEXT = 'explore our domains';
const EMPTY_BEFORE_LINK = SEARCH_COPY.empty.slice(0, SEARCH_COPY.empty.indexOf(EMPTY_LINK_TEXT));

function StatusBox({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="text-gray-600 bg-gray-50 p-8 rounded-xl border border-gray-200 m-0">
      {children}
    </p>
  );
}

function ResultCard({ hit, terms }: { hit: SearchHit; terms: string[] }) {
  const excerpt = excerptFor(hit.excerpt ?? hit.body, terms);
  const date = formatSourceDate(hit.date, hit.dateVerified);
  return (
    <li>
      <Link
        href={hit.url}
        className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all group"
      >
        <span className="flex items-start justify-between gap-4 mb-2">
          <span dir="auto" className="text-lg font-bold text-[var(--color-dark)] group-hover:text-[var(--color-primary)] transition-colors">
            {hit.title}
          </span>
          <span className="shrink-0 text-[11px] uppercase tracking-wider font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {hit.category}
          </span>
        </span>
        {excerpt && <span dir="auto" className="block text-gray-600 text-sm mb-3">{excerpt}</span>}
        {/* p. 202: "Show a short relevant excerpt and the canonical destination." */}
        <span className="block text-xs text-gray-600">
          <span className="text-[var(--color-secondary)] font-semibold">{hit.url}</span>
          {date && <> · <time dateTime={hit.date ?? undefined}>{date}</time></>}
        </span>
      </Link>
    </li>
  );
}

/** AI02 + AI03 for one query. Streams in behind the AI04 loading state. */
async function SearchResults({ query }: { query: string }) {
  const outcome = await runSearch(query, getSearchIndex);

  // p. 202: "Do not invent an answer when source retrieval fails" - so no AI
  // answer either, only the failure state.
  if (outcome.status === 'failed') return <StatusBox>{SEARCH_COPY.failure}</StatusBox>;

  const { groups, terms } = outcome;

  return (
    <>
      {/* AI02 Answer and Sources */}
      <section aria-labelledby="answer-heading" className="flex flex-col gap-4">
        <Typography variant="h2" id="answer-heading" className="text-[var(--color-dark)] m-0">
          Answer and Sources
        </Typography>
        <Suspense fallback={<StatusBox>{SEARCH_COPY.loading}</StatusBox>}>
          <AIResponse query={query} />
        </Suspense>
      </section>

      {/* AI03 Relevant Enerqa Content, grouped as p. 202 lists */}
      <section aria-labelledby="results-heading" className="flex flex-col gap-6">
        <Typography variant="h2" id="results-heading" className="text-[var(--color-dark)] m-0">
          Relevant Enerqa Content
        </Typography>

        {groups.length === 0 ? (
          <StatusBox>
            {EMPTY_BEFORE_LINK}
            <Link href="/domains-and-industries" className="underline font-semibold">{EMPTY_LINK_TEXT}</Link>.
          </StatusBox>
        ) : (
          groups.map((g) => (
            <div key={g.group} className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-[var(--color-dark)] m-0">{g.heading}</h3>
              <ul className="list-none p-0 m-0 flex flex-col gap-4">
                {g.hits.map((hit) => <ResultCard key={hit.url} hit={hit} terms={terms} />)}
              </ul>
            </div>
          ))
        )}
      </section>
    </>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = readQuery((await searchParams).q);

  return (
    <div className="bg-[var(--color-paper)] min-h-screen pt-[70px]">
      <section className="bg-[var(--color-dark)] text-white py-20 border-b border-gray-800">
        <Container>
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <Typography variant="h1" className="text-white m-0">
              Ask and Explore
            </Typography>

            {/* AI01 Ask and Explore: the query stays editable and in the URL (p. 202). */}
            <form action="/search" method="GET" role="search" className="relative w-full max-w-2xl mt-4">
              <label htmlFor="search-q" className="sr-only">Search Enerqa</label>
              <input
                id="search-q"
                type="search"
                name="q"
                defaultValue={q}
                placeholder={SEARCH_COPY.placeholder}
                maxLength={300}
                // Arabic queries render right-to-left (p. 227 Arabic tests).
                dir="auto"
                className="w-full px-6 py-4 rounded-full text-[var(--color-dark)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-deep)] text-lg pe-14"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute end-3 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-primary)] text-[var(--color-dark)] rounded-full hover:bg-[var(--color-primary-dark)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Search className="w-5 h-5" aria-hidden="true" />
              </button>
            </form>

            <div className="flex flex-wrap gap-2 mt-2">
              {SUGGESTIONS.map((suggestion) => (
                <Link key={suggestion} href={`/search?q=${encodeURIComponent(suggestion)}`} className="text-xs bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors">
                  {suggestion}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {q !== '' && (
        <Section theme="light">
          <Container>
            <div className="max-w-4xl mx-auto py-12 flex flex-col gap-12">
              {/* Keyed on the query so a new search shows the loading state again. */}
              <Suspense key={q} fallback={<StatusBox>{SEARCH_COPY.loading}</StatusBox>}>
                <SearchResults query={q} />
              </Suspense>
              <Suspense fallback={<StatusBox>{SEARCH_COPY.loading}</StatusBox>}>
                <ExternalSearchResults query={q} />
              </Suspense>
            </div>
          </Container>
        </Section>
      )}
    </div>
  );
}
