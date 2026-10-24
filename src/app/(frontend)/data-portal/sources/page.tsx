import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import Link from 'next/link';
import { connection } from 'next/server';
import { RichText } from '@payloadcms/richtext-lexical/react';
import type { Metadata } from 'next';
import { enabledProviders } from '@/lib/api/core/registry';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import type { DataPortalSourcesConfig, Dataset } from '@/payload-types';

export const metadata: Metadata = {
  title: 'Sources and Methodology',
  description: 'Directory of primary sources and core principles guiding Enerqa\'s data publication.',
  alternates: { canonical: '/data-portal/sources' },
};
export default async function DataPortalSourcesPage() {
  // Retry CMS reads on each visit so an outage fallback cannot stay cached after recovery.
  await connection();
  let config: Partial<DataPortalSourcesConfig> = {};
  let datasets: Dataset[] = [];
  let contentUnavailable = false;

  // Keep the provider directory and default methodology readable during a CMS outage.
  try {
    const payload = await getPayload({ config: configPromise });
    // Independent reads preserve whichever content is available if the other read fails.
    const [sourcesResult, datasetsResult] = await Promise.allSettled([
      payload.findGlobal({ slug: 'data-portal-sources-config' }),
      payload.find({
        collection: 'datasets',
        where: { status: { equals: 'verified_open' }, accessStatus: { equals: 'verified_open' }, redistribution: { equals: true } },
        limit: 100,
      }),
    ]);

    if (sourcesResult.status === 'fulfilled') config = sourcesResult.value;
    if (datasetsResult.status === 'fulfilled') datasets = datasetsResult.value.docs;
    contentUnavailable = sourcesResult.status === 'rejected' || datasetsResult.status === 'rejected';

    if (contentUnavailable) {
      // Log safe status flags instead of driver errors that may contain private details.
      console.warn('[data-portal/sources] Some saved content is unavailable.', {
        sourceNotesLoaded: sourcesResult.status === 'fulfilled',
        datasetListingsLoaded: datasetsResult.status === 'fulfilled',
      });
    }
  } catch {
    contentUnavailable = true;
    console.warn('[data-portal/sources] Content service unavailable; displaying default source information.');
  }

  const newsProviderIds = ['apitube', 'thenewsapi', 'newsdata', 'gdelt', 'eia_rss', 'eea_rss', 'openalex', 'doaj', 'reliefweb', 'osti', 'gbif-literature', 'sec-edgar'];
  
  const providers = enabledProviders();
  const views: Record<string, { href: string; label: string }> = {
    'climate-trace': { href: '/data-portal/series/country-emissions', label: 'Explore modelled emissions' },
    'world-bank-indicators': { href: '/data-portal/series/world-bank-indicator', label: 'Explore country indicators' },
    'oecd-sdmx': { href: '/data-portal/series/municipal-waste', label: 'Explore municipal waste' },
    'eia-open-data': { href: '/data-portal/series/energy-generation', label: 'Explore electricity generation' },
    'nasa-power': { href: '/data-portal/series/solar-resource', label: 'Explore solar resource and temperature' },
    'gbif-occurrence': { href: '/data-portal/occurrences', label: 'Explore occurrence records' },
    'openaq-v3': { href: '/data-portal/series/air-quality', label: 'Explore a selected air-quality sensor' },
  };
  const dataProviders = providers.filter(p => !newsProviderIds.includes(p.id) && !['gemini', 'openai'].includes(p.id));
  const newsProviders = providers.filter(p => newsProviderIds.includes(p.id));
  
  return (
    <div className="bg-white min-h-screen">
      {/* S01: Sources and Methodology Intro */}
      <section className="bg-[var(--color-dark)] text-white pt-32 pb-24">
        <Container>
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <Breadcrumbs
              parents={[{ label: 'Home', href: '/' }, { label: 'Data Portal', href: '/data-portal' }]}
              current="Sources and Methodology"
              className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/80 mb-2"
            />
            <Typography variant="h1" className="text-white m-0">
              Sources and Methodology
            </Typography>
            
            {config.s01_intro ? (
              <div className="prose prose-lg prose-invert max-w-3xl mt-4">
                <RichText data={config.s01_intro as any} />
              </div>
            ) : (
              <Typography variant="body" className="text-gray-300 text-lg leading-relaxed max-w-3xl mt-4">
                Our data views identify the original provider, what the measure represents and how it has been prepared for display. Review these notes before comparing, downloading or reusing a dataset.
              </Typography>
            )}
          </div>
        </Container>
      </section>

      <Section theme="light" className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto flex flex-col gap-20">
            {contentUnavailable && (
              <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                Some source notes and dataset listings are temporarily unavailable. Available source information is shown below. Please try again later.
              </p>
            )}
            
            <section id="market-data" aria-labelledby="market-data-heading" className="scroll-mt-28">
              <h2 id="market-data-heading" className="mb-4 text-2xl font-bold text-[var(--ink)]">Market prices and commentary</h2>
              <p className="text-[var(--ink-soft)] leading-relaxed">The homepage uses TradingView’s free market widget to display selected U.S.-listed company share prices, daily currency and percentage changes, and price history. U.S. stock quotes are delayed; the widget identifies the available trading session and data status. Prices for the selected shares are in USD.</p>
              <p className="text-[var(--ink-soft)] leading-relaxed">TradingView hosts the chart. It loads after you allow embedded content or choose to load this chart. Its branding and attribution remain visible. This is a display-only view: its prices are not copied into our datasets or offered as Data Portal downloads.</p>
              <p className="text-[var(--ink-soft)] leading-relaxed">Market commentary comes from the site’s separately sourced news feed and U.S. Energy Information Administration reporting. Each story carries its own publisher, publication time and retrieval or cache status. Commentary may cover the wider economy rather than the company selected in the chart.</p>
              <p className="flex flex-wrap gap-x-6 gap-y-2 text-sm"><a href="https://www.tradingview.com/widget-docs/faq/data/" target="_blank" rel="noopener noreferrer" className="text-[var(--green-deep)] underline">TradingView data and delays</a><a href="https://www.tradingview.com/widget-docs/markets/north-america/" target="_blank" rel="noopener noreferrer" className="text-[var(--green-deep)] underline">Available U.S. market data</a><Link href="/cookie-choices" className="text-[var(--green-deep)] underline">Manage embedded content</Link></p>
            </section>

            {/* S02: Source Directory */}
            <div id="directory" className="flex flex-col gap-8">
              <div className="border-b border-gray-200 pb-4">
                <Typography variant="h2" className="text-[var(--color-dark)] m-0">
                  Source Directory
                </Typography>
              </div>
              
              {config.s02_directory ? (
                <div className="prose prose-lg max-w-none text-gray-700">
                  <RichText data={config.s02_directory as any} />
                </div>
              ) : (
                <div className="grid gap-12">
                  <div>
                    <Typography variant="h3" className="text-[var(--color-primary)] mb-6">
                      Numerical Data Sources
                    </Typography>
                    <div className="grid gap-6">
                      {dataProviders.map((provider: any, idx: number) => {
                        const providerDatasets = datasets.filter(d => 
                          d.provider === provider.name || 
                          (d.provider as string)?.includes(provider.name) ||
                          provider.name.includes(d.provider as string)
                        );
                        
                        return (
                        <div key={`data-${idx}`} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:border-[var(--color-primary)] transition-colors">
                          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                            <h3 className="text-xl font-bold text-[var(--color-dark)] m-0">{provider.name}</h3>
                            <a href={provider.homepage} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline text-sm font-medium">
                              Visit Provider Website
                            </a>
                          </div>
                          <p className="text-gray-700 mb-4">{provider.purpose}</p>
                          {views[provider.id] && <Link className="underline block mb-4" href={views[provider.id].href}>{views[provider.id].label} and download CSV</Link>}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                            <div><strong className="text-gray-800 block mb-1">Licence:</strong> {provider.licenceUrl ? <a href={provider.licenceUrl} target="_blank" className="hover:underline">{provider.licence}</a> : provider.licence}</div>
                            <div><strong className="text-gray-800 block mb-1">Attribution:</strong> {provider.attribution}</div>
                            {provider.docsUrl && <div><strong className="text-gray-800 block mb-1">Official Documentation:</strong> <a href={provider.docsUrl} target="_blank" className="hover:underline">Docs</a></div>}
                          </div>
                          
                          {providerDatasets.length > 0 && (
                            <div className="mt-6 border-t border-gray-200 pt-6">
                              <h4 className="text-sm font-bold text-[var(--color-dark)] uppercase tracking-wider mb-4">Available Datasets</h4>
                              <div className="flex flex-col gap-4">
                                {providerDatasets.map(ds => (
                                  <div key={ds.id} className="bg-blue-50/50 border border-blue-100 p-4 rounded text-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="font-bold text-blue-900 mb-2">{ds.title}</div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-gray-700">
                                        {ds.identifier && <div><strong>Dataset ID:</strong> {ds.identifier as string}</div>}
                                        {ds.geographicLevel && <div><strong>Coverage:</strong> {ds.geographicLevel as string}</div>}
                                        {(ds.frequency || provider.frequency) && <div><strong>Frequency:</strong> {ds.frequency as string || provider.frequency}</div>}
                                        {/* Fallback to observationPeriod or provider schedule if refreshSchedule is missing */}
                                        {((ds as any).refreshSchedule || ds.observationPeriod || provider.refreshSchedule) && <div><strong>Refresh Schedule:</strong> {(ds as any).refreshSchedule as string || ds.observationPeriod as string || provider.refreshSchedule}</div>}
                                      </div>
                                    </div>
                                    <Link href={`/data-portal/datasets/${ds.slug}`} className="whitespace-nowrap text-[var(--color-primary)] font-medium hover:underline text-xs bg-white px-3 py-1.5 rounded border border-blue-200">
                                      View Dataset
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )})}
                    </div>
                  </div>
                  
                  <div>
                    <Typography variant="h3" className="text-[var(--color-primary)] mb-6">
                      News and Research Sources
                    </Typography>
                    <div className="grid gap-6">
                      {newsProviders.map((provider) => (
                        <div key={provider.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:border-[var(--color-primary)] transition-colors">
                          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                            <h3 className="text-xl font-bold text-[var(--color-dark)] m-0">{provider.name}</h3>
                            <a href={provider.homepage} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline text-sm font-medium">
                              Visit Provider Website
                            </a>
                          </div>
                          <p className="text-gray-700 mb-4">{provider.purpose}</p>
                          {provider.id === 'eia-open-data' && <Link className="underline block mb-4" href="/data-portal/series/energy-generation">Explore electricity generation and download CSV</Link>}
                          {provider.id === 'gbif-occurrence' && <Link className="underline block mb-4" href="/data-portal/occurrences">Explore occurrence records and download CSV</Link>}
                          {provider.id === 'openaq-v3' && <Link className="underline block mb-4" href="/data-portal/series/air-quality">Explore a selected air-quality sensor</Link>}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                            <div><strong className="text-gray-800 block mb-1">Licence:</strong> {provider.licenceUrl ? <a href={provider.licenceUrl} target="_blank" className="hover:underline">{provider.licence}</a> : provider.licence}</div>
                            <div><strong className="text-gray-800 block mb-1">Attribution:</strong> {provider.attribution}</div>
                            {provider.docsUrl && <div><strong className="text-gray-800 block mb-1">Official Documentation:</strong> <a href={provider.docsUrl} target="_blank" className="hover:underline">Docs</a></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* S03: Attribution and Reuse */}
            <div id="attribution" className="flex flex-col gap-8">
              <div className="border-b border-gray-200 pb-4">
                <Typography variant="h2" className="text-[var(--color-dark)] m-0">
                  Attribution and Reuse
                </Typography>
              </div>
              
              {config.s03_attribution ? (
                <div className="prose prose-lg max-w-none text-gray-700">
                  <RichText data={config.s03_attribution as any} />
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl text-gray-600 prose max-w-none">
                  <p>Each dataset and external item links to its applicable licence and original source. Public API access does not automatically permit republication of an article, image or dataset. Where rights are unclear, do not automate display or download until cleared.</p>
                </div>
              )}
            </div>

            {/* S04: Understanding the Data */}
            <div id="understanding" className="flex flex-col gap-8">
              <div className="border-b border-gray-200 pb-4">
                <Typography variant="h2" className="text-[var(--color-dark)] m-0">
                  Understanding the Data
                </Typography>
              </div>
              
              {config.s04_understanding ? (
                <div className="prose prose-lg max-w-none text-gray-700">
                  <RichText data={config.s04_understanding as any} />
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl text-gray-600 prose max-w-none">
                  <p>Distinguish measured observations, modelled estimates, forecasts and Enerqa-derived calculations. Show units, missing values, revisions and transformations. Label OECD development finance as periodic reporting rather than live global finance; label Climate TRACE as independent estimates rather than official country inventories.</p>
                </div>
              )}
            </div>

          </div>
        </Container>
      </Section>
    </div>
  );
}
