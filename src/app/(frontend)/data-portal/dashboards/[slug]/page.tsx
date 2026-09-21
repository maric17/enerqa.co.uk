import React from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import Link from 'next/link';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { Info, Database } from 'lucide-react';

export default async function DashboardDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'dashboards',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  const dashboard = result.docs[0];

  if (!dashboard) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* DB01: Dashboard Overview */}
      <section className="bg-white border-b border-gray-200 pt-32 pb-16">
        <Container>
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-gray-500 mb-2">
              <Link href="/" className="hover:text-[var(--color-primary)] transition-colors no-underline">Home</Link> / 
              <Link href="/data-portal" className="hover:text-[var(--color-primary)] transition-colors no-underline mx-1">Data Portal</Link> / 
              <span className="text-[var(--color-dark)] ml-1">{dashboard.title}</span>
            </div>
            <Typography variant="h1" className="text-[var(--color-dark)] m-0">
              {dashboard.title}
            </Typography>
            <Typography variant="body" className="text-gray-600 text-lg leading-relaxed">
              {dashboard.description as string}
            </Typography>
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <Section theme="light" className="py-12">
        <Container className="max-w-7xl">
          <div className="flex flex-col gap-12">
            
            {/* DB02 & DB03: Dashboard Controls & Primary Views (Iframe embed) */}
            <div className="flex flex-col gap-4">
              {dashboard.controlsInfo && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm mb-4">
                  <div className="bg-blue-100 p-2 rounded-full flex-shrink-0 text-blue-600">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="prose prose-sm max-w-none text-blue-900">
                    <h3 className="text-blue-900 text-base font-bold m-0 mb-2">How to use this dashboard</h3>
                    <RichText data={dashboard.controlsInfo as any} />
                  </div>
                </div>
              )}

              {/* Embed Container */}
              <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md min-h-[600px] lg:h-[800px]">
                {dashboard.embedUrl ? (
                  <iframe 
                    src={dashboard.embedUrl as string} 
                    className="w-full h-full border-none"
                    title={dashboard.title}
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                    <p>Dashboard visualization is currently unavailable.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Grid for Context */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8 border-t border-gray-200 pt-16">
              
              {/* DB04: Interpretation */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <Typography variant="h2" className="text-[var(--color-dark)]">
                  Analysis & Interpretation
                </Typography>
                {dashboard.interpretation ? (
                  <div className="prose prose-lg max-w-none text-gray-700 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <RichText data={dashboard.interpretation as any} />
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No detailed analysis has been published for this dashboard yet.</p>
                )}
              </div>

              {/* DB05: Underlying Sources */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <Typography variant="h2" className="text-[var(--color-dark)]">
                  Underlying Data
                </Typography>
                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col gap-8">
                  
                  {/* Internal Datasets */}
                  {dashboard.underlyingDatasets && dashboard.underlyingDatasets.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Database className="w-4 h-4" /> Enerqa Datasets
                      </h3>
                      <ul className="flex flex-col gap-3 m-0 p-0 list-none">
                        {dashboard.underlyingDatasets.map((rel: any) => {
                          const relData = typeof rel === 'object' ? rel : null;
                          if (!relData || !relData.slug) return null;
                          return (
                            <li key={relData.id}>
                              <Link 
                                href={`/data-portal/datasets/${relData.slug}`}
                                className="text-[var(--color-primary)] font-medium hover:underline block bg-gray-50 p-3 rounded border border-gray-100 transition-colors hover:border-[var(--color-primary)] hover:bg-blue-50"
                              >
                                {relData.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* External Sources Rich Text */}
                  {dashboard.externalSources && (
                    <div className={dashboard.underlyingDatasets && dashboard.underlyingDatasets.length > 0 ? "pt-6 border-t border-gray-100" : ""}>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                        External Sources
                      </h3>
                      <div className="prose prose-sm text-gray-600 max-w-none">
                        <RichText data={dashboard.externalSources as any} />
                      </div>
                    </div>
                  )}

                  {(!dashboard.underlyingDatasets || dashboard.underlyingDatasets.length === 0) && !dashboard.externalSources && (
                    <p className="text-gray-500 text-sm italic m-0">
                      Sources not explicitly listed.
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </Container>
      </Section>
    </div>
  );
}
