import React, { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { RichText } from '@payloadcms/richtext-lexical/react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ExternalEmbed } from '@/components/ExternalEmbed';
import { DatasetExplorer } from '@/components/data/DatasetExplorer';
import { CopyCitation } from '@/components/data/CopyCitation';
import { loadDatasetSeries } from '@/lib/data-portal/dataset';
import { readSelection, selectSeries } from '@/lib/data-portal/selection';
import { failureMessage } from '@/lib/api/core/types';
import { resolveMediaUrl } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const getDataset = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({ collection: 'datasets', where: { slug: { equals: slug }, status: { equals: 'verified_open' } }, limit: 1, depth: 1 });
  return result.docs[0];
});
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dataset = await getDataset((await params).slug);
  return dataset ? { title: dataset.title, description: dataset.description, alternates: { canonical: `/data-portal/datasets/${dataset.slug}` } } : { title: 'Page Not Found' };
}
const dateLabel = (date?: string | null) => date ? new Date(date).toLocaleString('en-GB', { timeZone: 'UTC' }) + ' UTC' : 'Not supplied';

export default async function DatasetDetailPage({ params, searchParams }: Props) {
  const dataset = await getDataset((await params).slug);
  if (!dataset) notFound();
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) if (typeof value === 'string') query.set(key, value);
  const selection = readSelection(query);
  const loaded = await loadDatasetSeries(dataset);
  const data = loaded?.ok ? loaded.data : [];
  const selected = selectSeries(data, selection);
  const downloadParams = new URLSearchParams({ slug: dataset.slug, ...selection });
  const canDownload = dataset.accessStatus === 'verified_open' && dataset.redistribution;
  const file = typeof dataset.file === 'object' ? dataset.file : null;
  const sourceFile = dataset.datasetDownloadUrl || (file?.url ? resolveMediaUrl(file.url) : '');
  const provenance = data[0]?.provenance;
  const details: [string, string | null | undefined][] = [
    ['Provider', provenance?.providerName || dataset.provider], ['Series / dataset ID', dataset.identifier],
    ['Coverage', [...new Set(data.flatMap(s => s.area ? [s.area] : []))].join(', ') || dataset.geographicLevel],
    ['Frequency', [...new Set(data.map(s => s.frequency))].join(', ') || dataset.frequency],
    ['Units', [...new Set(data.map(s => s.unit))].join(', ') || dataset.originalUnit],
    ['Observation period', provenance?.observationPeriod || dataset.observationPeriod],
    ['Provider release date', dateLabel(provenance?.sourceReleasedAt || dataset.sourceReleaseDate)],
    ['Provider version', provenance?.version || dataset.version],
    ['Enerqa retrieval time', dateLabel(provenance?.retrievedAt || dataset.retrievalTime)],
  ];
  const canonical = `https://www.enerqa.co.uk/data-portal/datasets/${dataset.slug}`;
  const structuredData = [
    { '@context': 'https://schema.org', '@type': 'Dataset', name: dataset.title, description: dataset.description, url: canonical, license: dataset.licenceUrl },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.enerqa.co.uk/' },
      { '@type': 'ListItem', position: 2, name: 'Data Portal', item: 'https://www.enerqa.co.uk/data-portal' },
      { '@type': 'ListItem', position: 3, name: dataset.title, item: canonical },
    ] },
  ];
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    <section className="bg-[var(--color-dark)] text-white pt-40 pb-16">
      <Container className="space-y-6">
        <nav aria-label="Breadcrumb" className="text-sm"><Link href="/">Home</Link> / <Link href="/data-portal">Data Portal</Link> / <span aria-current="page">{dataset.title}</span></nav>
        <h1 className="text-4xl md:text-5xl font-bold max-w-4xl">{dataset.title}</h1>
        <h2 className="text-2xl font-bold">Dataset Summary</h2>
        <p className="text-lg leading-relaxed max-w-4xl">{dataset.description}</p>
        <p className="text-sm">{dataset.provider} · {dataset.geographicLevel} · {provenance?.observationPeriod || dataset.observationPeriod}</p>
      </Container>
    </section>
    <Container className="py-16 space-y-12">
      <DatasetExplorer data={data} selection={selection} slug={dataset.slug} stale={loaded?.ok ? loaded.stale : false} />
      {!loaded?.ok && <p role="status" className="rounded border p-6">{loaded ? failureMessage(loaded) : 'Interactive data is not available for this dataset. Use the verified source download below.'}</p>}
      {dataset.embedUrl && <section aria-labelledby="provider-view"><h3 id="provider-view" className="text-xl font-bold">Provider View</h3>
        <ExternalEmbed src={dataset.embedUrl} title={`Provider view for ${dataset.title}`} className="w-full h-[500px] border-0" />
      </section>}
      <section aria-labelledby="download-cite" className="rounded-xl border border-gray-200 bg-gray-50 p-6 space-y-5">
        <h2 id="download-cite" className="text-2xl font-bold">Download and Cite</h2>
        <div className="flex flex-wrap gap-4">
          {canDownload && selected.length > 0 && <Button href={`/api/data-portal/dataset?${downloadParams}`} variant="primary">Download CSV</Button>}
          {canDownload && sourceFile && <Button href={sourceFile} variant="outline" target="_blank" rel="noopener noreferrer">Download Source File</Button>}
          {dataset.accessStatus === 'verified_open' && provenance?.sourceUrl && <Button href={provenance.sourceUrl} variant="outline" target="_blank" rel="noopener noreferrer">View Original Source</Button>}
        </div>
        <p className="text-sm">CSV contains the selected observations, units, geography and source metadata. The source file contains the provider’s configured dataset before these page filters.</p>
        {(dataset.citation || dataset.attribution) && <CopyCitation citation={dataset.citation || dataset.attribution || ''} />}
      </section>
      <section aria-labelledby="dataset-method" className="space-y-5">
        <h2 id="dataset-method" className="text-2xl font-bold">Sources and Methodology</h2>
        <dl className="grid gap-4 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="border-b border-gray-200 pb-3"><dt className="font-semibold">{label}</dt><dd className="m-0 break-words">{value || 'Not supplied'}</dd></div>)}</dl>
        <p><strong>Licence: </strong>{dataset.licenceUrl ? <a href={dataset.licenceUrl} className="underline" target="_blank" rel="noopener noreferrer">{dataset.licence}</a> : dataset.licence || 'Not supplied'}</p>
        {dataset.attribution && <p className="whitespace-pre-wrap">{dataset.attribution}</p>}
        <p>Missing figures remain empty in exports and appear as an em dash in the table. They are never replaced with zero. Series with different units or measurement methods are shown separately.</p>
        {data.map(s => <div key={s.id} className="space-y-1 text-sm"><p className="font-semibold">{s.label}</p>{s.measureNote && <p>{s.measureNote}</p>}{s.provenance.transformations.length > 0 && <p>Transformations: {s.provenance.transformations.join('; ')}</p>}</div>)}
        {dataset.methodology && <div className="prose max-w-none"><RichText data={dataset.methodology} /></div>}
        <Link href="/data-portal/sources" className="underline">Sources and Methodology directory</Link>
      </section>
      <section aria-labelledby="related-data" className="space-y-4">
        <h2 id="related-data" className="text-2xl font-bold">Related Data and Domains</h2>
        <nav aria-label="Related data and domains" className="flex flex-wrap gap-4">
          {dataset.domains?.map(d => typeof d === 'object' && d.slug && <Link key={`domain-${d.id}`} href={`/domains/${d.slug}`} className="underline">{d.title}</Link>)}
          {dataset.industries?.map(i => typeof i === 'object' && i.slug && <Link key={`industry-${i.id}`} href={`/industries/${i.slug}`} className="underline">{i.title}</Link>)}
          {dataset.relatedDatasets?.map(d => typeof d === 'object' && d.status === 'verified_open' && <Link key={`data-${d.id}`} href={`/data-portal/datasets/${d.slug}`} className="underline">{d.title}</Link>)}
          <Link href="/data-portal" className="underline">Explore the Data Portal</Link>
        </nav>
      </section>
    </Container>
  </>;
}
