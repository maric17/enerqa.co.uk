import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { CollectionSwitch } from '../CollectionSwitch';
import { IntelligenceBrowser } from './IntelligenceBrowser';
import { getIntelligenceIndex } from '@/lib/feeds/intelligenceIndex';
import { CONTENT_TYPES } from '@/lib/feeds/intelligence';
import { parseIntelligenceFilters } from '@/lib/feeds/intelligenceQueries';
import { COUNTRIES } from '@/lib/feeds/coverage';
import { getSearchIndex } from '../../search/loadIndex';
import { runSearch } from '../../search/searchIndex';

export const metadata: Metadata = {
  title: 'Global Intelligence',
  description: 'Open-access news, research, official updates and corporate disclosures on climate, energy, environment and sustainable business.',
  alternates: { canonical: '/knowledge-hub/global-intelligence' },
  robots: { index: false, follow: true },
};
export default async function GlobalIntelligencePage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const v of Array.isArray(value) ? value : value ? [value] : []) queryParams.append(key, v);
  }
  // Removed source controls must not remain as invisible restrictions in old links.
  queryParams.delete('source');
  const filters = parseIntelligenceFilters(queryParams);
  const payload = await getPayload({ config: configPromise });
  const [index, domains, industries] = await Promise.all([
    getIntelligenceIndex(),
    payload.find({ collection: 'domains', limit: 100, depth: 0, select: { title: true, slug: true } }),
    payload.find({ collection: 'industries', limit: 100, depth: 0, select: { title: true, slug: true } }),
  ]);
  const languages = [...new Set(['en', 'fr', 'es', 'de', 'ar', 'zh', 'unspecified', ...index.items.map(i => i.language ?? 'unspecified')])].map(value => ({ value, label: value === 'unspecified' ? 'Not specified' : value.toUpperCase() }));
  const contextQuery = filters.q?.[0] || [...filters.domain, ...filters.industry, ...filters.theme].map(slug => [...domains.docs, ...industries.docs].find(d => d.slug === slug)?.title ?? '').join(' ');
  const related = contextQuery ? await runSearch(contextQuery, getSearchIndex) : null;
  const labels: Record<string, string> = Object.fromEntries([
    ...COUNTRIES.map(c => [c.code, c.name]),
    ...domains.docs.map(d => [d.slug, d.title]), ...industries.docs.map(d => [d.slug, d.title]), ...Object.entries(CONTENT_TYPES),
  ]);
  return <div className="min-h-screen bg-[var(--color-paper)]">
    <PageHero title="Global Intelligence" imageUrl="/images/knowledge_hub_banner_no_text.jpg" breadcrumbs={<><Link href="/knowledge-hub">Knowledge Hub</Link> / <span aria-current="page">Global Intelligence</span></>} />
    <section className="bg-white py-12"><Container><p className="max-w-4xl text-xl leading-relaxed">
      Explore open-access news, research and official updates from around the world. Every result links to complete reading available free of charge without a subscription or sign-in. These external records are distinct from Enerqa-authored publications.
    </p></Container></section>
    <CollectionSwitch active="global-intelligence" />
    <Container className="py-12 space-y-12">
      <IntelligenceBrowser key={JSON.stringify(filters)} initialItems={index.items} initialFilters={filters}
        initialPage={Math.max(1, Number.parseInt(String(params.page ?? '1'), 10) || 1)} initialSourcesFailed={index.sourcesFailed}
        domains={domains.docs.map(d => ({ value: d.slug, label: d.title }))}
        industries={industries.docs.map(d => ({ value: d.slug, label: d.title }))}
        languages={languages} labels={labels} />
      <section aria-labelledby="source-context" className="border-t border-gray-200 pt-5 text-xs leading-relaxed text-gray-600 space-y-2">
        <h2 id="source-context" className="text-sm font-semibold text-[var(--color-dark)]">Sources</h2>
        <p>Content belongs to its original publishers. Free reading does not grant republication rights for articles or images. NewsData.io's free feed is delayed by at least 12 hours.</p>
        <Link href="/data-portal/sources" className="underline">Sources, attribution and methodology</Link>
      </section>
      {related?.status === 'ok' && related.hits.length > 0 && <nav aria-label="Related Enerqa content" className="flex flex-wrap gap-4 text-sm">{related.groups.flatMap(group => group.hits.slice(0, 2)).map(hit => <Link key={hit.url} href={hit.url} className="underline">{hit.category}: {hit.title}</Link>)}</nav>}
    </Container>
  </div>;
}
