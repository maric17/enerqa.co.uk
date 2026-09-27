import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, ExternalLink } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import {
  searchNews,
  NEWS_BASKETS,
  NEWS_DELAY_HOURS,
  type NewsBasketKey,
} from '@/lib/api/news';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { DOMAIN_FEEDS, INDUSTRY_FEEDS, newsPhrases } from '@/lib/feeds/contextual';
import { ResearchFeed } from '@/components/feeds/ResearchFeed';
import { OfficialFeed } from '@/components/feeds/OfficialFeed';
import { FeedSkeleton } from '@/components/feeds/feedParts';
import { SourceUnavailable } from '@/components/ui/SourceUnavailable';
import { CollectionSwitch } from '../CollectionSwitch';

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
  // Context from the domain and industry pages' "View All News", "Explore
  // Research" and "View All Updates" links (pp. 29, 37, 48, 59, 66). Unknown
  // slugs are ignored rather than producing an empty page.
  const domainSlug = first(params.domain);
  const industrySlug = first(params.industry);
  const domainFeed = DOMAIN_FEEDS[domainSlug];
  const industryFeed = INDUSTRY_FEEDS[industrySlug];
  const contextFeed = domainFeed ?? industryFeed;
  const contextKind = domainFeed ? 'domains' : industryFeed ? 'industries' : null;
  const mode = first(params.type) === 'research' && contextFeed
    ? 'research'
    : first(params.type) === 'official' && domainFeed
      ? 'official'
      : 'news';

  const themeParam = first(params.theme);
  // A domain's news comes from its own topic basket unless the visitor picks another.
  const theme: NewsBasketKey = isBasketKey(themeParam) ? themeParam : domainFeed?.newsBasket ?? 'all';
  
  const region = first(params.region);
  const source = first(params.source);
  const language = first(params.language);
  const dateRange = first(params.dateRange);
  const pageParam = parseInt(first(params.page), 10);
  const page = isNaN(pageParam) ? 1 : Math.max(1, pageParam);

  const result = await searchNews(
    query,
    theme,
    { region, source, language, dateRange, page, phrases: contextFeed ? newsPhrases(contextFeed) : undefined },
    24,
  );

  const payload = await getPayload({ config: configPromise });
  const { docs: domains } = await payload.find({ collection: 'domains', limit: 100, depth: 0, select: { title: true, slug: true } });
  const { docs: industries } = await payload.find({ collection: 'industries', limit: 100, depth: 0, select: { title: true, slug: true } });

  // The page title of the domain or industry, for the context banner.
  let contextTitle: string | null = null;
  if (contextKind) {
    const { docs } = await payload.find({
      collection: contextKind,
      where: { slug: { equals: contextKind === 'domains' ? domainSlug : industrySlug } },
      limit: 1,
      depth: 0,
      select: { title: true },
    });
    contextTitle = docs[0]?.title ?? null;
  }
  const contextParam = domainFeed ? `domain=${domainSlug}` : industryFeed ? `industry=${industrySlug}` : '';

  const retrievedLabel = new Date(result.retrievedAt).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

  type ActiveFilter = { key: string; label: string; value: string };
  const activeFilters: ActiveFilter[] = [];
  if (query) activeFilters.push({ key: 'q', label: `Search: ${query}`, value: query });
  if (theme !== 'all') {
    activeFilters.push({ key: 'theme', label: `Topic: ${NEWS_BASKETS.find(b => b.key === theme)?.label ?? theme}`, value: theme });
  }
  if (domainSlug) {
    const d = domains.find(x => x.slug === domainSlug);
    activeFilters.push({ key: 'domain', label: `Domain: ${d?.title ?? domainSlug}`, value: domainSlug });
  }
  if (industrySlug) {
    const i = industries.find(x => x.slug === industrySlug);
    activeFilters.push({ key: 'industry', label: `Industry: ${i?.title ?? industrySlug}`, value: industrySlug });
  }
  if (region) activeFilters.push({ key: 'region', label: `Region: ${region}`, value: region });
  if (source) {
    const s = result.sources.find(x => x.id === source);
    activeFilters.push({ key: 'source', label: `Source: ${s?.label ?? source}`, value: source });
  }
  if (language) activeFilters.push({ key: 'language', label: `Language: ${language.toUpperCase()}`, value: language });
  if (dateRange) {
    const dates: Record<string, string> = { '24h': 'Past 24 Hours', '7d': 'Past 7 Days', '30d': 'Past 30 Days' };
    activeFilters.push({ key: 'dateRange', label: `Timeframe: ${dates[dateRange] || dateRange}`, value: dateRange });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper)] pt-0">
      <PageHero
        title="Global Intelligence"
        imageUrl="/images/knowledge_hub_banner_no_text.jpg"
        breadcrumbs={
          <>
            <Link href="/knowledge-hub" className="text-white/80 hover:text-white transition-colors no-underline">Knowledge Hub</Link> / <span className="en text-white" aria-current="page">Global Intelligence</span>
          </>
        }
      />

      <section className="bg-white py-12 border-b border-gray-200">
        <Container>
          <div className="max-w-4xl">
            <p className="text-xl leading-relaxed text-gray-700 m-0">
              Explore open-access news, research and official updates from around the world, specifically curated for relevance to climate, energy, environment, nature, circularity, ESG and finance. Every result links to complete reading on its publisher's site, distinct from Enerqa-authored publications.
            </p>
          </div>
        </Container>
      </section>

      {/* K02 Choose a Collection - the same switch as /knowledge-hub (p. 155) */}
      <CollectionSwitch active="global-intelligence" />

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
                  if (domainSlug) href.set('domain', domainSlug);
                  if (industrySlug) href.set('industry', industrySlug);
                  if (region) href.set('region', region);
                  if (source) href.set('source', source);
                  if (language) href.set('language', language);
                  if (dateRange) href.set('dateRange', dateRange);
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
              {contextTitle && (
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
                  <p className="m-0 text-sm text-gray-700">
                    Showing {mode === 'research' ? 'research' : mode === 'official' ? 'official updates' : 'news'} matched to{' '}
                    <strong>{contextTitle}</strong> using that page&rsquo;s topic configuration.{' '}
                    <Link href="/knowledge-hub/global-intelligence" className="font-semibold text-[var(--color-secondary)] hover:underline">
                      Show all Global Intelligence
                    </Link>
                  </p>
                  {/* Switch between this page's news, research and official feeds. */}
                  <nav aria-label="Content type" className="mt-3 flex flex-wrap gap-2 text-sm">
                    {([
                      ['news', 'News'],
                      ['research', 'Research'],
                      ...(domainFeed ? [['official', 'Official updates']] : []),
                    ] as [string, string][]).map(([key, label]) => (
                      <Link
                        key={key}
                        href={`/knowledge-hub/global-intelligence?${contextParam}${key === 'news' ? '' : `&type=${key}`}`}
                        aria-current={mode === key ? 'page' : undefined}
                        className={`rounded-full border px-3 py-1 no-underline ${mode === key ? 'border-[var(--color-dark)] bg-[var(--color-dark)] text-white' : 'border-gray-300 text-gray-700 hover:border-[var(--color-dark)]'}`}
                      >
                        {label}
                      </Link>
                    ))}
                  </nav>
                </div>
              )}

              {mode === 'research' && contextFeed && (
                <Suspense fallback={<FeedSkeleton cards={6} columns="md:grid-cols-2" cardHeight="h-[240px]" />}>
                  <ResearchFeed themes={contextFeed.researchThemes} limit={12} nearest={{ href: '/knowledge-hub', label: 'browse Enerqa Publication' }} />
                </Suspense>
              )}
              {mode === 'official' && domainFeed && (
                <Suspense fallback={<FeedSkeleton cards={6} columns="" cardHeight="h-[96px]" />}>
                  <OfficialFeed feed={domainFeed} limit={12} nearest={{ href: '/knowledge-hub', label: 'browse Enerqa Publication' }} />
                </Suspense>
              )}

              {mode === 'news' && (<>
              {/* A GET form: no JavaScript needed, and every result set is a
                  shareable URL. */}
              <form action="/knowledge-hub/global-intelligence" method="get" className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                <div className="mb-6">
                  <label htmlFor="gi-search" className="sr-only">
                    Search global intelligence by keyword
                  </label>
                  <div className="relative w-full">
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
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
                    <label htmlFor="domain-filter" className="mb-1 block text-sm font-medium text-gray-700">Domain</label>
                    <select
                      id="domain-filter"
                      name="domain"
                      defaultValue={domainSlug}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value="">All Domains</option>
                      {domains.map(d => (
                        <option key={d.id || d.slug} value={d.slug}>{d.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="industry-filter" className="mb-1 block text-sm font-medium text-gray-700">Industry</label>
                    <select
                      id="industry-filter"
                      name="industry"
                      defaultValue={industrySlug}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value="">All Industries</option>
                      {industries.map(i => (
                        <option key={i.id || i.slug} value={i.slug}>{i.title}</option>
                      ))}
                    </select>
                  </div>
                  
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

              <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <p className="m-0 font-medium text-gray-600">
                    {result.items.length === 0
                      ? 'No open-access results match these filters'
                      : `Showing ${result.items.length} result${result.items.length === 1 ? '' : 's'}`}
                  </p>
                  {activeFilters.length > 0 && (
                    <Link
                      href="/knowledge-hub/global-intelligence"
                      className="font-medium text-[var(--color-secondary)] hover:underline"
                    >
                      Clear All
                    </Link>
                  )}
                </div>
                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map(filter => {
                      const href = new URLSearchParams();
                      activeFilters.forEach(f => {
                        if (f.key !== filter.key) href.set(f.key, f.value);
                      });
                      const qs = href.toString();
                      return (
                        <Link
                          key={filter.key}
                          href={`/knowledge-hub/global-intelligence${qs ? `?${qs}` : ''}`}
                          className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          {filter.label}
                          <span aria-hidden="true">&times;</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* X03 external content cards */}
              <div className="space-y-6">
                {result.items.length === 0 ? (
                  <SourceUnavailable
                    variant={result.sourcesFailed ? 'unavailable' : 'empty'}
                    emptyText="No open-access results match these filters"
                    nearest={{ href: '/knowledge-hub', label: 'Knowledge Hub' }}
                    className="rounded-xl border border-dashed border-gray-300 bg-white py-20"
                  />
                ) : (
                  result.items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-[var(--color-primary)] md:p-8"
                    >


                      <h3 className="mb-3 text-xl font-bold text-[var(--color-dark)]">{item.title}</h3>

                      {/* Only shown where the provider licenses a description.
                          We never write one on a publisher's behalf. */}
                      {item.summary && <p className="mb-4 text-gray-600">{item.summary}</p>}

                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                          <span className="text-[var(--color-primary)]">{item.publisher}</span>
                          <span className="text-gray-500" aria-hidden="true">|</span>
                          <span className="text-gray-600">News</span>
                          {item.publishedAt && (
                            <>
                              <span className="text-gray-500" aria-hidden="true">|</span>
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
                              <span className="text-gray-500" aria-hidden="true">|</span>
                              <span className="text-gray-600 font-medium">
                                {item.regions.join(', ')}
                              </span>
                            </>
                          )}
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-[var(--color-secondary)] hover:underline shrink-0"
                        >
                          Read full article <ExternalLink className="ml-1 h-4 w-4" aria-hidden="true" />
                        </a>
                      </div>
                    </article>
                  ))
                )}
              </div>
              
              {/* Pagination */}
              {result.items.length > 0 && (result.page && result.page > 1 || result.hasNextPage) && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  {result.page && result.page > 1 ? (
                    <Link
                      href={`/knowledge-hub/global-intelligence?${(() => {
                        const href = new URLSearchParams();
                        activeFilters.forEach(f => { if (f.key !== 'page') href.set(f.key, f.value); });
                        href.set('page', String(result.page - 1));
                        return href.toString();
                      })()}`}
                      className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-[var(--color-dark)] border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      &larr; Previous Page
                    </Link>
                  ) : (
                    <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-400 border border-gray-200 cursor-not-allowed">
                      &larr; Previous Page
                    </span>
                  )}

                  <span className="text-sm font-medium text-gray-600">
                    Page {result.page || 1}
                  </span>

                  {result.hasNextPage ? (
                    <Link
                      href={`/knowledge-hub/global-intelligence?${(() => {
                        const href = new URLSearchParams();
                        activeFilters.forEach(f => { if (f.key !== 'page') href.set(f.key, f.value); });
                        href.set('page', String((result.page || 1) + 1));
                        return href.toString();
                      })()}`}
                      className="rounded-lg bg-[var(--color-dark)] px-4 py-2 text-sm font-bold text-white hover:bg-black transition-colors"
                    >
                      Next Page &rarr;
                    </Link>
                  ) : (
                    <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-400 border border-gray-200 cursor-not-allowed">
                      Next Page &rarr;
                    </span>
                  )}
                </div>
              )}
              
              </>)}

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
            <p className="mt-8 text-xs text-gray-500 space-y-2">
              <span className="block">
                Links open the original publisher; Enerqa does not host or endorse their content. Public reading does not grant permission to republish or redistribute. Geography tags are inferred from article subjects and may not represent the publisher's headquarters.
              </span>
              <span className="block">
                For Enerqa's own analysis and resources, explore our <Link href="/domains" className="underline hover:text-gray-800">Domains</Link>, <Link href="/knowledge-hub" className="underline hover:text-gray-800">Publications</Link>, <Link href="/data-portal" className="underline hover:text-gray-800">Datasets</Link>, and <Link href="/tools" className="underline hover:text-gray-800">Tools</Link>.
              </span>
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
