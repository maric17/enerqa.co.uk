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
import { intelligenceSourceChoices } from '@/lib/feeds/liveIntelligence';
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
  const filters = parseIntelligenceFilters(queryParams);
  const payload = await getPayload({ config: configPromise });
  const [index, domains, industries] = await Promise.all([
    getIntelligenceIndex(),
    payload.find({ collection: 'domains', limit: 100, depth: 0, select: { title: true, slug: true } }),
    payload.find({ collection: 'industries', limit: 100, depth: 0, select: { title: true, slug: true } }),
  ]);
  const sources = intelligenceSourceChoices();
  const languages = [...new Set(['en', 'fr', 'es', 'de', 'ar', 'zh', 'unspecified', ...index.items.map(i => i.language ?? 'unspecified')])].map(value => ({ value, label: value === 'unspecified' ? 'Not specified' : value.toUpperCase() }));
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
      <IntelligenceBrowser key={JSON.stringify(filters)} initialItems={index.items} initialFilters={filters}
        initialPage={Math.max(1, Number.parseInt(String(params.page ?? '1'), 10) || 1)} initialSourcesFailed={index.sourcesFailed}
        domains={domains.docs.map(d => ({ value: d.slug, label: d.title }))}
        industries={industries.docs.map(d => ({ value: d.slug, label: d.title }))}
        sources={sources} languages={languages} labels={labels} />
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
