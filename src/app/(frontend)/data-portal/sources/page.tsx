import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import Link from 'next/link';
import { RichText } from '@payloadcms/richtext-lexical/react';
import type { Metadata } from 'next';
import { enabledProviders } from '@/lib/api/core/registry';

export const metadata: Metadata = {
  title: 'Sources and Methodology',
  description: 'Directory of primary sources and core principles guiding Enerqa\'s data publication.',
  alternates: { canonical: '/data-portal/sources' },
};
export default async function DataPortalSourcesPage() {
  const payload = await getPayload({ config: configPromise });
  
  // Fetch the Global configuration for Sources and Methodology
  const config = await payload.findGlobal({
    slug: 'data-portal-sources-config',
  });

  const newsProviderIds = ['newsdata', 'gdelt', 'eia_rss', 'eea_rss', 'openalex', 'doaj', 'reliefweb', 'osti', 'gbif-literature', 'sec-edgar'];
  
  const providers = enabledProviders();
  const dataProviders = providers.filter(p => !newsProviderIds.includes(p.id) && !['gemini', 'openai'].includes(p.id));
  const newsProviders = providers.filter(p => newsProviderIds.includes(p.id));
  
  // Hardcode OWID and Ember for data providers since they don't have active API connectors
  const extraDataProviders = [
    {
      name: 'Our World in Data (OWID)',
      purpose: 'Research and data to make progress against the world’s largest problems.',
      homepage: 'https://ourworldindata.org/',
      docsUrl: 'https://ourworldindata.org/about',
      licence: 'CC BY 4.0',
      licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
      attribution: 'Our World in Data',
      coverage: 'Global',
      frequency: 'Annual',
      refreshSchedule: 'Annual updates based on primary sources'
    },
    {
      name: 'Ember',
      purpose: 'Global electricity data and climate analysis.',
      homepage: 'https://ember-climate.org/',
      docsUrl: 'https://ember-climate.org/data/',
      licence: 'CC BY 4.0',
      licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
      attribution: 'Ember',
      coverage: 'Global',
      frequency: 'Annual/Monthly depending on dataset',
      refreshSchedule: 'Monthly and Annual updates'
    }
  ];

  const datasetsRes = await payload.find({
    collection: 'datasets',
    limit: 100,
  });
  const datasets = datasetsRes.docs;

  return (
    <div className="bg-white min-h-screen">
      {/* S01: Sources and Methodology Intro */}
      <section className="bg-[var(--color-dark)] text-white pt-32 pb-24">
        <Container>
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
              <Link href="/" className="hover:text-white transition-colors no-underline">Home</Link> / 
              <Link href="/data-portal" className="hover:text-white transition-colors no-underline mx-1">Data Portal</Link> / 
              <span className="text-white ml-1">Sources and Methodology</span>
            </div>
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
                      {[...dataProviders, ...extraDataProviders].map((provider: any, idx: number) => {
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
