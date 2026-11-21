import copy from '@/lib/i18n/data-portal-copy.json';
import { publicCopy, type SiteLanguage } from '@/lib/i18n/publicCopy';
import { notFound } from 'next/navigation';
import { DATASETS } from '@/lib/data-portal/connectors';
import { DatasetExplorer } from '@/components/data/DatasetExplorer';
import { Container } from '@/components/ui/Container';
import { failureMessage } from '@/lib/api/core/types';
import { readSelection, selectSeries } from '@/lib/data-portal/selection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export async function generateMetadata({ params }: { params: Promise<{ dataset: string }> }) {
  const { dataset } = await params;
  if (!Object.hasOwn(DATASETS, dataset)) return {};
  return { title: DATASETS[dataset].title, description: 'Explore source observations, units, methodology and an ungated CSV export.', alternates: { canonical: `/data-portal/series/${dataset}` } };
}

export async function ConnectorDatasetContent({ language = 'en', params, searchParams }: {
  params: Promise<{ dataset: string }>; searchParams: Promise<Record<string, string | string[] | undefined>>;
} & { language?: SiteLanguage }) {
  const t = (text: string) => publicCopy(language, copy, text);
  const { dataset } = await params;
  if (!Object.hasOwn(DATASETS, dataset)) notFound();
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) if (typeof value === 'string') query.set(key, value);
  // Observation filters run after the fixed source selection, exactly as in the CSV route.
  const selection = readSelection(query);
  const result = await DATASETS[dataset].handler(query);
  return <Container className="pt-36 pb-20 space-y-8">
    <Breadcrumbs parents={[{ label: 'Home', href: '/' }, { label: 'Data Portal', href: '/data-portal' }, { label: 'Sources and Methodology', href: '/data-portal/sources' }]} current={t(DATASETS[dataset].title)} />
    <h1 className="text-3xl font-bold">{t(DATASETS[dataset].title)}</h1>
    {dataset === 'air-quality' && <form method="GET" className="flex flex-wrap gap-4">
      {/* Station selection is explicit; an arbitrary location is never presented as approved. */}
      <label>{t("Location ID")} <input type="number" name="location" min="1" required defaultValue={query.get('location') ?? ''} className="border p-2" /></label>
      <label>{t("Sensor ID")} <input type="number" name="sensor" min="1" required defaultValue={query.get('sensor') ?? ''} className="border p-2" /></label>
      <label>{t("From date")} <input type="date" name="from" required defaultValue={query.get('from') ?? ''} className="border p-2" /></label>
      <label>{t("To date")} <input type="date" name="to" required defaultValue={query.get('to') ?? ''} className="border p-2" /></label>
      <button className="border p-2">{t("Load daily concentrations")}</button>
      <p>{t("Choose a sensor from the OpenAQ location catalogue. Only sources with confirmed reuse permissions are shown. Select at most 31 days.")}</p>
    </form>}
    {result.ok ? <>
      <DatasetExplorer language={language} data={result.data} selection={selection} slug={dataset} stale={result.stale} actionHref={`/data-portal/series/${dataset}`} query={query.toString()} />
      {selectSeries(result.data, selection).length > 0 && <a className="underline" href={`/api/data/${dataset}?${query}`}>{t("Download selected data (CSV)")}</a>}
    </> : <p role="status">{t(failureMessage(result))} {result.message}</p>}
  </Container>;
}
