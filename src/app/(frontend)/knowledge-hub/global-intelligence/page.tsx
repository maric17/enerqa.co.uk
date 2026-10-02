import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { CollectionSwitch } from '../CollectionSwitch';
import { IntelligenceFilters } from './IntelligenceFilters';
import { getIntelligenceIndex } from '@/lib/feeds/intelligenceIndex';
import { CONTENT_TYPES, filterIntelligence, filterUrl, readingAction, type IntelligenceFilters as Filters } from '@/lib/feeds/intelligence';
import { COUNTRIES, changeGeography } from '@/lib/feeds/coverage';
import { getSearchIndex } from '../../search/loadIndex';
import { runSearch } from '../../search/searchIndex';

export const metadata: Metadata = {
  title: 'Global Intelligence',
  description: 'Open-access news, research, official updates and corporate disclosures on climate, energy, environment and sustainable business.',
  alternates: { canonical: '/knowledge-hub/global-intelligence' },
  robots: { index: false, follow: true },
};
const PATH = '/knowledge-hub/global-intelligence';
const KEYS = ['q', 'theme', 'domain', 'industry', 'continent', 'region', 'country', 'type', 'language', 'source', 'dateRange'];

export default async function GlobalIntelligencePage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters: Filters = {};
  for (const key of KEYS) {
    const value = params[key];
    const values = Array.isArray(value) ? value : value ? [value] : [];
    filters[key] = [...new Set(values.map(v => v.slice(0, 120)))];
  }

  // Also support country-only shared URLs: set the same parents as the linked controls.
  if (filters.country.length && !filters.region.length && !filters.continent.length) {
    Object.assign(filters, changeGeography({ country: [], region: [], continent: [] }, 'country', filters.country));
  }
  const payload = await getPayload({ config: configPromise });
  const [index, domains, industries] = await Promise.all([
    getIntelligenceIndex(),
    payload.find({ collection: 'domains', limit: 100, depth: 0, select: { title: true, slug: true } }),
    payload.find({ collection: 'industries', limit: 100, depth: 0, select: { title: true, slug: true } }),
  ]);
  const matching = filterIntelligence(index.items, filters);
  const pages = Math.max(1, Math.ceil(matching.length / 12));
  const page = Math.min(pages, Math.max(1, Number.parseInt(String(params.page ?? '1'), 10) || 1));
  const shown = matching.slice((page - 1) * 12, page * 12);
  const sources = [...new Map(index.items.map(i => [i.sourceId, { value: i.sourceId, label: i.source }])).values()];
  const languages = [...new Set(index.items.map(i => i.language ?? 'unspecified'))].map(value => ({ value, label: value === 'unspecified' ? 'Not specified' : value.toUpperCase() }));
  const contextQuery = filters.q?.[0] || [...filters.domain, ...filters.industry, ...filters.theme].map(slug => [...domains.docs, ...industries.docs].find(d => d.slug === slug)?.title ?? '').join(' ');
  const related = contextQuery ? await runSearch(contextQuery, getSearchIndex) : null;
  const labels: Record<string, string> = Object.fromEntries([
    ...sources.map(s => [s.value, s.label]), ...COUNTRIES.map(c => [c.code, c.name]),
    ...domains.docs.map(d => [d.slug, d.title]), ...industries.docs.map(d => [d.slug, d.title]), ...Object.entries(CONTENT_TYPES),
  ]);
  return <div className="min-h-screen bg-[var(--color-paper)]">
    <PageHero title="Global Intelligence" imageUrl="/images/knowledge_hub_banner_no_text.jpg" breadcrumbs={<><Link href="/knowledge-hub">Knowledge Hub</Link> / <span aria-current="page">Global Intelligence</span></>} />
    <section className="bg-white py-12"><Container><p className="max-w-4xl text-xl leading-relaxed">
      Explore open-access news, research and official updates from around the world. Every result links to complete reading available free of charge without a subscription or sign-in. These external records are distinct from Enerqa-authored publications.
    </p></Container></section>
    <CollectionSwitch active="global-intelligence" />
    <Container className="py-12 space-y-12">
      <section aria-labelledby="intelligence-search"><h2 id="intelligence-search" className="mb-6 text-2xl font-bold">Search Global Intelligence</h2>
        <IntelligenceFilters key={JSON.stringify(filters)} filters={filters} domains={domains.docs.map(d => ({ value: d.slug, label: d.title }))} industries={industries.docs.map(d => ({ value: d.slug, label: d.title }))} sources={sources} languages={languages} />
      </section>
      <section aria-labelledby="external-cards" className="space-y-6">
        <h2 id="external-cards" className="text-2xl font-bold">External Content Cards</h2>
        <p role="status">{matching.length} open-access results in the cached collection</p>
        <div className="flex flex-wrap gap-2">{Object.entries(filters).flatMap(([key, values]) => values.map(value => {
          const next = { ...filters, [key]: values.filter(v => v !== value) };
          if (key === 'continent' || key === 'region') Object.assign(next, changeGeography({ continent: filters.continent, region: filters.region, country: filters.country }, key, next[key]));
          return <Link key={`${key}-${value}`} href={filterUrl(next)} aria-label={`Remove ${key}: ${labels[value] ?? value}`} className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm">{key}: {labels[value] ?? value} ×</Link>;
        }))}</div>
        {shown.length === 0 && <p role="status" className="rounded border p-8">{index.sourcesFailed ? 'Sources are temporarily unavailable. Please try again later.' : 'No open-access results match these filters'}. <Link href={PATH} className="underline">Clear All</Link></p>}
        <div className="grid gap-6 md:grid-cols-2">{shown.map(item => <article key={item.url} className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
          <p className="text-xs font-semibold uppercase text-[var(--color-primary-deep)]">{CONTENT_TYPES[item.type]} · Open access</p>
          <h3 className="text-xl font-bold" dir="auto">{item.title}</h3>
          {item.summary && <p dir="auto" className="text-gray-700">{item.summary}</p>}
          <p className="text-sm">{item.type === 'disclosure' ? 'Issuer: ' : ''}{item.publisher}{item.documentType && ` · ${item.documentType}`}</p>
          {item.authors.length > 0 && <p className="text-sm">Authors: {item.authors.join(', ')}</p>}
          {item.doi && <p className="text-sm break-words">DOI: {item.doi}</p>}
          <p className="text-sm">{item.type === 'disclosure' ? 'Filed' : 'Published'}: {item.publishedAt ? <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</time> : 'Date not supplied'}</p>
          <p className="text-xs text-gray-600">Source: {item.source} · Retrieved {new Date(item.retrievedAt).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC</p>
          <p className="text-xs">Coverage: {[...item.coverage.region, ...item.coverage.scope].join(', ') || item.coverage.continent.join(', ')}</p>
          {item.stale && <p className="text-sm font-semibold">Showing the latest cached release; the source could not be refreshed.</p>}
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-block font-semibold underline">{readingAction(item.type)}</a>
        </article>)}</div>
        {pages > 1 && <nav aria-label="Results pages" className="flex justify-center gap-6">
          {page > 1 && <Link href={filterUrl(filters, page - 1)} className="underline">Previous page</Link>}
          <span>Page {page} of {pages}</span>{page < pages && <Link href={filterUrl(filters, page + 1)} className="underline">Next page</Link>}
        </nav>}
      </section>
      <section aria-labelledby="source-context" className="rounded-xl bg-white border p-6 space-y-4">
        <h2 id="source-context" className="text-2xl font-bold">Sources and Context</h2>
        <p>NewsData.io results are delayed by at least 12 hours. Other sources follow their own publication schedules. Retrieval time is separate from publication time. Public reading does not grant permission to republish complete articles or images.</p>
        <p>Coverage comes from the subject text, never a publisher’s address or an author’s affiliation. Geographic groupings follow <a href="https://unstats.un.org/unsd/methodology/m49/" className="underline">UN M49</a>. A place that cannot be identified is labelled Not Specified.</p>
        <Link href="/data-portal/sources" className="underline">Sources and Methodology</Link>
        {related?.status === 'ok' && related.hits.length > 0 && <nav aria-label="Related Enerqa content" className="flex flex-wrap gap-4">{related.groups.flatMap(group => group.hits.slice(0, 2)).map(hit => <Link key={hit.url} href={hit.url} className="underline">{hit.category}: {hit.title}</Link>)}</nav>}
      </section>
    </Container>
  </div>;
}
