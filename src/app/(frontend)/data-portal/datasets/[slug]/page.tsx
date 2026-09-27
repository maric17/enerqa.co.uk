import { resolveMediaUrl } from "@/lib/utils";
import React from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { ExternalEmbed } from '@/components/ExternalEmbed';
import Link from 'next/link';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { Download, ExternalLink, CheckCircle2, ShieldAlert, Copy } from 'lucide-react';

import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'datasets',
    where: { 
      slug: { equals: slug },
      status: { equals: 'verified_open' }
    },
    limit: 1,
  });

  const dataset = result.docs[0];
  if (!dataset) return { title: 'Not Found' };

  return {
    title: String(dataset.title),
    description: dataset.description ? String(dataset.description) : undefined,
  };
}

export default async function DatasetDetailPage({ params }: Props) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'datasets',
    where: {
      slug: {
        equals: slug,
      },
      status: {
        equals: 'verified_open',
      }
    },
    limit: 1,
  });

  const dataset = result.docs[0];

  if (!dataset) {
    notFound();
  }

  return (
    <>
      {/* DS01: Dataset Summary */}
      <section className="relative w-full py-32 bg-[var(--color-dark)] text-white overflow-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Dataset',
                name: dataset.title,
                description: dataset.description,
                url: `https://enerqa.co.uk/data-portal/datasets/${dataset.slug}`,
                license: dataset.licenceUrl,
                provider: {
                  '@type': 'Organization',
                  name: dataset.provider,
                }
              },
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://enerqa.co.uk/' },
                  { '@type': 'ListItem', position: 2, name: 'Data Portal', item: 'https://enerqa.co.uk/data-portal' },
                  { '@type': 'ListItem', position: 3, name: dataset.title }
                ]
              }
            ])
          }}
        />
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-24">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> / 
            <Link href="/data-portal" className="text-white/60 hover:text-white transition-colors no-underline mx-1">Data Portal</Link> / 
            <span className="text-white ml-1">{dataset.title}</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            {dataset.title}
          </Typography>
          <div className="flex flex-wrap gap-4 text-sm text-white/80 mt-2">
            {dataset.provider && (
              <div className="bg-white/10 px-3 py-1.5 rounded font-medium">
                <strong className="text-white">Provider:</strong> {dataset.provider as string}
              </div>
            )}
            {dataset.identifier && (
              <div className="bg-white/10 px-3 py-1.5 rounded font-medium">
                <strong className="text-white">ID:</strong> {dataset.identifier as string}
              </div>
            )}
            {dataset.version && (
              <div className="bg-white/10 px-3 py-1.5 rounded font-medium">
                <strong className="text-white">Version:</strong> {dataset.version as string}
              </div>
            )}
            {dataset.geographicLevel && (
              <div className="bg-white/10 px-3 py-1.5 rounded font-medium">
                <strong className="text-white">Geography:</strong> {dataset.geographicLevel as string}
              </div>
            )}
            {dataset.observationPeriod && (
              <div className="bg-white/10 px-3 py-1.5 rounded font-medium">
                <strong className="text-white">Period:</strong> {dataset.observationPeriod as string}
              </div>
            )}
            {dataset.originalUnit && (
              <div className="bg-white/10 px-3 py-1.5 rounded font-medium">
                <strong className="text-white">Unit:</strong> {dataset.originalUnit as string}
              </div>
            )}
            {dataset.licence && (
              <div className="bg-white/10 px-3 py-1.5 rounded font-medium">
                <strong className="text-white">Licence:</strong> {dataset.licenceUrl ? <a href={dataset.licenceUrl as string} target="_blank" className="underline hover:text-[var(--color-primary)]">{dataset.licence as string}</a> : dataset.licence as string}
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2 mt-8">Dataset Summary</h2>
          <Typography variant="body" className="text-gray-300 text-lg leading-relaxed max-w-3xl mt-2">
            {dataset.description as string}
          </Typography>
        </Container>
      </section>

      <Section theme="light" className="py-16">
        <div className="max-w-5xl mx-auto flex flex-col gap-16 w-full">
          
          {/* DS02 & DS03: Explore the Data & Chart, Table, Map */}
          {dataset.embedUrl && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-4 gap-2">
                <Typography variant="h2" className="text-[var(--color-dark)] m-0">
                  Explore the Data
                </Typography>
                <Link href="/data-portal/sources" className="text-sm font-medium text-[var(--color-primary)] hover:underline flex items-center gap-1">
                  Sources & Methodology
                </Link>
              </div>
              <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9]">
                {/* The provider's chart may set its own cookies: it loads only with consent (p. 208 U03). */}
                <ExternalEmbed
                  src={dataset.embedUrl as string}
                  title={`Interactive chart for ${dataset.title}`}
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="md:col-span-2 flex flex-col gap-12">
              {/* DS05: Sources and Methodology */}
              {(dataset.methodology || dataset.attribution) && (
                <div className="flex flex-col gap-6">
                  <Typography variant="h2" className="text-[var(--color-dark)] border-b border-gray-200 pb-4">
                    Sources and Methodology
                  </Typography>
                  
                  {dataset.attribution && (
                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl text-blue-900 mb-4">
                      <h3 className="font-bold mb-2">Attribution & Usage Notes</h3>
                      <div className="whitespace-pre-wrap text-sm">{dataset.attribution as string}</div>
                    </div>
                  )}

                  {dataset.methodology && (
                    <div className="prose prose-lg max-w-none text-gray-700">
                      <RichText data={dataset.methodology as any} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-1 flex flex-col gap-8">
              {/* DS04: Download and Cite */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 flex flex-col gap-6 shadow-sm">
                <h2 className="text-xl font-bold text-[var(--color-dark)]">Download Data</h2>
                
                {/* DS04 Download and Cite buttons */}
                <div className="flex flex-col gap-3">
                  <Button href={`/api/data-portal/download?id=${dataset.identifier || dataset.slug}`} variant="primary" target="_blank" rel="noopener noreferrer" className="w-full flex justify-center items-center gap-2">
                    <Download className="w-4 h-4" /> Download CSV
                  </Button>
                  
                  {(dataset.datasetDownloadUrl || (dataset.file && typeof dataset.file === 'object' && 'url' in dataset.file)) && (
                    <Button 
                      href={(dataset.datasetDownloadUrl as string) || resolveMediaUrl((dataset.file as any).url)} 
                      variant="outline" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full flex justify-center items-center gap-2 bg-white"
                    >
                      <ExternalLink className="w-4 h-4" /> Download Source file
                    </Button>
                  )}
                  
                  {dataset.attribution && (
                    <Button 
                      href="#"
                      variant="outline"
                      className="w-full flex justify-center items-center gap-2 bg-white"
                      // onClick="navigator.clipboard.writeText(this.dataset.citation); alert('Citation copied to clipboard!'); return false;"
                      // data-citation={dataset.attribution as string}
                    >
                      <Copy className="w-4 h-4" /> Copy Citation
                    </Button>
                  )}
                </div>
                
                {/* Access Status & Compliance Metadata */}
                <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-gray-200 text-sm">
                  {dataset.accessStatus && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-bold">Access:</span>
                      <span className="capitalize">{dataset.accessStatus as string}</span>
                    </div>
                  )}
                  {dataset.corporateReuse && (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Corporate reuse permitted</span>
                    </div>
                  )}
                  {dataset.redistribution && (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Redistribution permitted</span>
                    </div>
                  )}
                  {dataset.accessCheckedAt && (
                    <div className="text-xs text-gray-500 mt-2">
                      Access verified: {new Date(dataset.accessCheckedAt as string).toLocaleDateString('en-GB')}
                    </div>
                  )}
                  {dataset.retrievalTime && (
                    <div className="text-xs text-gray-500">
                      Retrieved: {new Date(dataset.retrievalTime as string).toLocaleDateString('en-GB')}
                    </div>
                  )}
                </div>

                {dataset.citation && (
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Cite this dataset</h4>
                    <div className="bg-white border border-gray-200 rounded text-sm p-3 text-gray-600 font-mono overflow-x-auto whitespace-pre-wrap">
                      {dataset.citation as string}
                    </div>
                  </div>
                )}
                </div>
              </div>

              {/* DS05: Sources and Methodology */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col gap-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Sources & Methodology</h3>
                <dl className="flex flex-col gap-4 text-sm m-0">
                  {dataset.identifier && (
                    <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                      <dt className="text-gray-500 font-medium">Series ID</dt>
                      <dd className="col-span-2 text-gray-800 m-0 font-mono text-xs break-all">{dataset.identifier as string}</dd>
                    </div>
                  )}
                  {dataset.licence && (
                    <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                      <dt className="text-gray-500 font-medium">Licence</dt>
                      <dd className="col-span-2 text-gray-800 m-0">
                        {dataset.licenceUrl ? (
                          <a href={dataset.licenceUrl as string} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">
                            {dataset.licence as string}
                          </a>
                        ) : dataset.licence as string}
                      </dd>
                    </div>
                  )}
                  {dataset.geographicLevel && (
                    <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                      <dt className="text-gray-500 font-medium">Coverage</dt>
                      <dd className="col-span-2 text-gray-800 m-0">{dataset.geographicLevel as string}</dd>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                    <dt className="text-gray-500 font-medium">Frequency</dt>
                    <dd className="col-span-2 text-gray-800 m-0">Annual</dd>
                  </div>
                  {dataset.originalUnit && (
                    <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                      <dt className="text-gray-500 font-medium">Units</dt>
                      <dd className="col-span-2 text-gray-800 m-0">{dataset.originalUnit as string}</dd>
                    </div>
                  )}
                  {dataset.version && (
                    <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                      <dt className="text-gray-500 font-medium">Release</dt>
                      <dd className="col-span-2 text-gray-800 m-0">{dataset.version as string}</dd>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="text-gray-500 font-medium">Missing Values</dt>
                    <dd className="col-span-2 text-gray-800 m-0">Excluded from aggregation</dd>
                  </div>
                </dl>
                <Link href="/data-portal/sources" className="text-[var(--color-primary)] text-sm font-bold hover:underline">
                  Read full methodology →
                </Link>
              </div>

              {/* DS06: Related Data and Domains */}
              {((dataset.relatedDatasets && dataset.relatedDatasets.length > 0) || (dataset.topic && dataset.topic.length > 0) || (dataset.domains && dataset.domains.length > 0) || (dataset.industries && dataset.industries.length > 0)) && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col gap-6">
                  {((dataset.topic && dataset.topic.length > 0) || (dataset.domains && dataset.domains.length > 0) || (dataset.industries && dataset.industries.length > 0)) && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Related Domains</h3>
                      <div className="flex flex-wrap gap-2">
                        {dataset.topic?.map((t: any) => (
                          <span key={t.id || t} className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">
                            {t.title || 'Topic'}
                          </span>
                        ))}
                        {dataset.domains?.map((d: any) => (
                          <Link href={`/domains/${d.slug}`} key={d.id || d} className="bg-gray-100 text-[var(--color-primary)] hover:underline text-xs font-bold px-2 py-1 rounded">
                            {d.title || 'Domain'}
                          </Link>
                        ))}
                        {dataset.industries?.map((i: any) => (
                          <Link href={`/industries/${i.slug}`} key={i.id || i} className="bg-gray-100 text-[var(--color-primary)] hover:underline text-xs font-bold px-2 py-1 rounded">
                            {i.title || 'Industry'}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {dataset.relatedDatasets && dataset.relatedDatasets.length > 0 && (
                    <div className={((dataset.topic && dataset.topic.length > 0) || (dataset.domains && dataset.domains.length > 0) || (dataset.industries && dataset.industries.length > 0)) ? "pt-6 border-t border-gray-100" : ""}>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Related Datasets</h3>
                      <ul className="flex flex-col gap-3 m-0 p-0 list-none">
                        {dataset.relatedDatasets.map((rel: any) => {
                          const relData = typeof rel === 'object' ? rel : null;
                          if (!relData || !relData.slug) return null;
                          return (
                            <li key={relData.id}>
                              <Link 
                                href={`/data-portal/datasets/${relData.slug}`}
                                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                              >
                                {relData.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </Section>
    </>
  );
}

