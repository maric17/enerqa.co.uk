import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, ExternalLink } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import {
  searchNews,
  NEWS_BASKETS,
  NEWS_DELAY_HOURS,
  type NewsBasketKey,
} from '@/lib/api/news';

export const metadata: Metadata = {
  title: 'Global Intelligence',
  description:
    'Open-access news, research and official updates on climate, energy, environment, nature, circularity, ESG and finance, from sources that can be read without payment or registration.',
  alternates: { canonical: '/knowledge-hub/global-intelligence' },
};

/**
 * K05 Global Intelligence (handoff p. 155 and pp. 209-211).
 *
 * This was a Client Component that called newsapi.org on every keystroke with
 * an API key hardcoded into the bundle. Three things changed:
 *
 *  1. It is now a Server Component. No credential can reach the browser
 *     (p. 226, p. 228), and one cached fetch serves every visitor instead of
 *     one request per visitor per keystroke.
 *  2. newsapi.org is gone. Its free tier is development-only, which fails the
 *     "free access must permit public corporate use" test on p. 209.
 *  3. Search filters what is already in the shared cache. p. 210 is explicit:
 *     "Use a shared feed cache rather than upstream per-user keyword search."
 *     A visitor's keystrokes must never spend provider credits.
 *
 * The filter form is a plain GET form, so it works without JavaScript and each
 * result set has its own shareable URL.
 */

function isBasketKey(value: unknown): value is NewsBasketKey {
  return typeof value === 'string' && NEWS_BASKETS.some((b) => b.key === value);
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export default async function GlobalIntelligencePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = first(params.q).slice(0, 120);
  const themeParam = first(params.theme);
  const theme: NewsBasketKey = isBasketKey(themeParam) ? themeParam : 'all';
  
  const region = first(params.region);
  const source = first(params.source);
  const language = first(params.language);
  const dateRange = first(params.dateRange);

  const result = await searchNews(query, theme, { region, source, language, dateRange }, 24);

  const retrievedLabel = new Date(result.retrievedAt).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper)] pt-[70px]">
      {/* K01 Knowledge Hub intro */}
      <section className="border-b border-gray-800 bg-[var(--color-dark)] py-20 text-white">
        <Container>
          <div className="max-w-4xl">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl">Global Intelligence</h1>
            <p className="mb-6 text-xl leading-relaxed text-gray-300">
              Explore open-access news, research and official updates from around the world, specifically curated for relevance to climate, energy, environment, nature, circularity, ESG and finance.
            </p>
          </div>
        </Container>
      </section>

      {/* K02 Collection switcher */}
      <section className="sticky top-[70px] z-30 border-b border-gray-200 bg-white">
        <Container>
          <div className="flex space-x-8">
            <Link
              href="/knowledge-hub"
              className="whitespace-nowrap border-b-2 border-transparent py-4 font-medium text-gray-500 transition-colors hover:text-[var(--color-dark)]"
            >
              Enerqa Publication
            </Link>
            <Link
              href="/knowledge-hub/global-intelligence"
              className="whitespace-nowrap border-b-2 border-[var(--color-primary)] py-4 font-bold text-[var(--color-dark)]"
            >
              Global Intelligence
            </Link>
          </div>
        </Container>
      </section>

      {/* K05 search and results */}
      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
            {/* Filters. Only filters backed by real data are offered - the
                previous version showed Content Type, Region and Date Range
                checkboxes that were wired to nothing. */}
            <aside className="lg:col-span-1">
              <h2 className="mb-4 text-lg font-bold text-[var(--color-dark)]">Topic</h2>
              <nav aria-label="Filter by topic" className="flex flex-col gap-1">
                {NEWS_BASKETS.map((basket) => {
                  const active = basket.key === theme;
                  const href = new URLSearchParams();
                  if (basket.key !== 'all') href.set('theme', basket.key);
                  if (query) href.set('q', query);
                  const qs = href.toString();

                  return (
                    <Link
                      key={basket.key}
                      href={`/knowledge-hub/global-intelligence${qs ? `?${qs}` : ''}`}
                      aria-current={active ? 'true' : undefined}
                      className={`rounded-lg px-3 py-2 text-sm no-underline transition-colors ${
                        active
                          ? 'bg-[var(--color-dark)] font-bold text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {basket.label}
                    </Link>
                  );
                })}
              </nav>

              {/* X04: The Sources overview is moved to the bottom */}
            </aside>

            <div className="lg:col-span-3">
              {/* A GET form: no JavaScript needed, and every result set is a
                  shareable URL. */}
              <form action="/knowledge-hub/global-intelligence" method="get" className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                <div className="mb-6">
                  <label htmlFor="gi-search" className="sr-only">
                    Search global intelligence by keyword
                  </label>
                  <div className="relative w-full">
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      id="gi-search"
                      name="q"
                      type="search"
                      defaultValue={query}
                      placeholder="Search global intelligence by keyword..."
                      className="w-full rounded-xl border border-gray-300 py-4 pl-12 pr-4 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                </div>

                {/* X02 Extended Filters */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {theme !== 'all' && <input type="hidden" name="theme" value={theme} />}
                  
                  <div>
                    <label htmlFor="region-filter" className="mb-1 block text-sm font-medium text-gray-700">Geography</label>
                    <select
                      id="region-filter"
                      name="region"
                      defaultValue={region}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value="">All Regions</option>
                      {result.availableRegions.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="source-filter" className="mb-1 block text-sm font-medium text-gray-700">Source</label>
                    <select
                      id="source-filter"
                      name="source"
                      defaultValue={source}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value="">All Sources</option>
                      {result.sources.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="language-filter" className="mb-1 block text-sm font-medium text-gray-700">Language</label>
                    <select
                      id="language-filter"
                      name="language"
                      defaultValue={language}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value="">All Languages</option>
                      {result.availableLanguages.map(l => (
                        <option key={l} value={l}>{l.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="date-filter" className="mb-1 block text-sm font-medium text-gray-700">Timeframe</label>
                    <select
                      id="date-filter"
                      name="dateRange"
                      defaultValue={dateRange}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value="">Any Time</option>
                      <option value="24h">Past 24 Hours</option>
                      <option value="7d">Past 7 Days</option>
                      <option value="30d">Past 30 Days</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-lg bg-[var(--color-dark)] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>

              {/* A real count of what is on screen, not a fabricated "150+". */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
                <p className="m-0 font-medium text-gray-600">
                  {result.items.length === 0
                    ? 'No results'
                    : `Showing ${result.items.length} result${result.items.length === 1 ? '' : 's'}`}
                  {query && <> for &ldquo;{query}&rdquo;</>}
                </p>
                {(query || theme !== 'all') && (
                  <Link
                    href="/knowledge-hub/global-intelligence"
                    className="font-medium text-[var(--color-secondary)] hover:underline"
                  >
                    Clear filters
                  </Link>
                )}
              </div>

              {/* X03 external content cards */}
              <div className="space-y-6">
                {result.items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
                    <p className="m-0 font-medium text-gray-600">No relevant updates are available.</p>
                    <p className="m-0 mt-2 text-sm text-gray-500">
                      {query
                        ? 'Try a broader keyword, or clear the filters.'
                        : 'External sources returned nothing for this topic. Nothing on this page is generated by Enerqa.'}
                    </p>
                  </div>
                ) : (
                  result.items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-[var(--color-primary)] md:p-8"
                    >
                      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <span className="text-[var(--color-primary)]">{item.publisher}</span>
                        <span className="text-gray-400" aria-hidden="true">|</span>
                        <span className="text-gray-600">News</span>
                        {item.publishedAt && (
                          <>
                            <span className="text-gray-400" aria-hidden="true">|</span>
                            <time dateTime={item.publishedAt} className="text-gray-600">
                              {new Date(item.publishedAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </time>
                          </>
                        )}
                        {item.regions && item.regions.length > 0 && item.regions[0] !== 'Global' && (
                          <>
                            <span className="text-gray-400" aria-hidden="true">|</span>
                            <span className="text-gray-600 font-medium">
                              {item.regions.join(', ')}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="mb-3 text-xl font-bold text-[var(--color-dark)]">{item.title}</h3>

                      {/* Only shown where the provider licenses a description.
                          We never write one on a publisher's behalf. */}
                      {item.summary && <p className="mb-4 text-gray-600">{item.summary}</p>}

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-[var(--color-secondary)] hover:underline"
                      >
                        Read full article <ExternalLink className="ml-1 h-4 w-4" aria-hidden="true" />
                      </a>
                    </article>
                  ))
                )}
              </div>

            </div>
          </div>
        </Container>
      </section>

      {/* X04 Sources and Context */}
      <section className="border-t border-gray-200 bg-white py-16">
        <Container>
          <div className="max-w-4xl">
            <h2 className="mb-6 text-2xl font-bold text-[var(--color-dark)]">Sources and Context</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">Provenance and Delays</h3>
                <p className="text-sm leading-relaxed text-gray-600 mb-4">
                  Retrieved {retrievedLabel} UTC.
                  {result.hasDelayedSource &&
                    ` Some items reach the free feed up to ${NEWS_DELAY_HOURS} hours after publication.`}
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  Enerqa utilizes open-access data to monitor global intelligence. 
                  Sources are limited to publishers whose articles can be opened without payment, 
                  subscription, or registration.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">Included Sources</h3>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {result.sources.length === 0 ? (
                    <li className="text-sm text-gray-500">No sources contributed to these results.</li>
                  ) : (
                    result.sources.map((source) => (
                      <li key={source.id}>
                        <a
                          href={source.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[var(--color-secondary)] hover:underline"
                        >
                          {source.label}
                        </a>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
            <p className="mt-8 text-xs text-gray-500">
              Links open the original publisher; Enerqa does not host or endorse their content. 
              Geography tags are inferred from article subjects and may not represent the publisher's headquarters.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
