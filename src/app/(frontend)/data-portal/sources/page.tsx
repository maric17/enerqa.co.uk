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
                Enerqa maintains a rigorous, transparent methodology for data collection, validation, and presentation. 
                Below you will find our directory of primary sources and the core principles guiding our data publication.
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
                <div className="grid gap-6">
                  {enabledProviders().map((provider) => (
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
                        {provider.accessReviewedOn && <div><strong className="text-gray-800 block mb-1">Access Reviewed:</strong> {provider.accessReviewedOn}</div>}
                      </div>
                    </div>
                  ))}
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
                  <p>All data published by Enerqa remains the intellectual property of the original provider. When reusing data obtained through this portal, you must provide appropriate attribution to the primary source as cited in the relevant dataset.</p>
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
                  <p>Our dashboards and datasets display raw provider values exactly as reported by the primary sources. We do not apply smoothed trends, moving averages, or imputation of missing values. Missing data points are left blank to preserve the integrity of the original source.</p>
                </div>
              )}
            </div>

          </div>
        </Container>
      </Section>
    </div>
  );
}
