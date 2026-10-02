import { notFound } from 'next/navigation';
import { DATASETS } from '@/lib/data-portal/connectors';
import { DatasetExplorer } from '@/components/data/DatasetExplorer';
import { Container } from '@/components/ui/Container';
import { failureMessage } from '@/lib/api/core/types';
import { readSelection, selectSeries } from '@/lib/data-portal/selection';

export async function generateMetadata({ params }: { params: Promise<{ dataset: string }> }) {
  const { dataset } = await params;
  if (!Object.hasOwn(DATASETS, dataset)) return {};
  return { title: DATASETS[dataset].title, description: 'Explore source observations, units, methodology and an ungated CSV export.', alternates: { canonical: `/data-portal/series/${dataset}` } };
}

export default async function ConnectorDatasetPage({ params, searchParams }: {
  params: Promise<{ dataset: string }>; searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { dataset } = await params;
  if (!Object.hasOwn(DATASETS, dataset)) notFound();
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) if (typeof value === 'string') query.set(key, value);
  // Observation filters run after the fixed source selection, exactly as in the CSV route.
  const selection = readSelection(query);
  const result = await DATASETS[dataset].handler(query);
  return <Container className="pt-36 pb-20 space-y-8">
    <nav aria-label="Breadcrumb"><a href="/data-portal">Data Portal</a> / <a href="/data-portal/sources">Sources and Methodology</a> / {DATASETS[dataset].title}</nav>
    <h1 className="text-3xl font-bold">{DATASETS[dataset].title}</h1>
    {dataset === 'air-quality' && <form method="GET" className="flex flex-wrap gap-4">
      {/* Station selection is explicit; an arbitrary location is never presented as approved. */}
      <label>Location ID <input type="number" name="location" min="1" required defaultValue={query.get('location') ?? ''} className="border p-2" /></label>
      <label>Sensor ID <input type="number" name="sensor" min="1" required defaultValue={query.get('sensor') ?? ''} className="border p-2" /></label>
      <label>From date <input type="date" name="from" required defaultValue={query.get('from') ?? ''} className="border p-2" /></label>
      <label>To date <input type="date" name="to" required defaultValue={query.get('to') ?? ''} className="border p-2" /></label>
      <button className="border p-2">Load daily concentrations</button>
      <p>Choose a sensor from the OpenAQ location catalogue. Only sources with confirmed reuse permissions are shown. Select at most 31 days.</p>
    </form>}
    {result.ok ? <>
      <DatasetExplorer data={result.data} selection={selection} slug={dataset} stale={result.stale} actionHref={`/data-portal/series/${dataset}`} query={query.toString()} />
      {selectSeries(result.data, selection).length > 0 && <a className="underline" href={`/api/data/${dataset}?${query}`}>Download selected data (CSV)</a>}
    </> : <p role="status">{failureMessage(result)} {result.message}</p>}
  </Container>;
}
