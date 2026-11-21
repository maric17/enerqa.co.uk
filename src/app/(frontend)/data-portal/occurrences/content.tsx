import copy from '@/lib/i18n/data-portal-copy.json';
import { publicCopy, type SiteLanguage } from '@/lib/i18n/publicCopy';
import { Container } from '@/components/ui/Container';
import { loadOccurrenceExtract } from '@/lib/api/data/occurrenceExport';
import { OCCURRENCE_INTERPRETATION } from '@/lib/api/data/gbifOccurrence';
import { sourceLabel } from '@/lib/api/core/provenance';
import { failureMessage } from '@/lib/api/core/types';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata = { title: 'Published biodiversity occurrence records', description: 'A licensed GBIF occurrence extract with dataset citations and sampling limitations.', alternates: { canonical: '/data-portal/occurrences' } };

export async function OccurrencesContent({ language = 'en', searchParams }: { searchParams: Promise<{ country?: string }> } & { language?: SiteLanguage }) {
  const t = (text: string) => publicCopy(language, copy, text);
  const country = (await searchParams).country ?? 'QA';
  const query = new URLSearchParams({ country });
  const result = await loadOccurrenceExtract(query);
  return <Container className="pt-36 pb-20 space-y-6">
    <Breadcrumbs parents={[{ label: 'Home', href: '/' }, { label: 'Data Portal', href: '/data-portal' }]} current={t("Published biodiversity occurrence records")} />
    <h1 className="text-3xl font-bold">{t("Published biodiversity occurrence records")}</h1>
    <p>{OCCURRENCE_INTERPRETATION}</p>
    <form method="GET"><label>{t("Country code")} <input name="country" defaultValue={country} pattern="[A-Z]{2}" maxLength={2} required className="border p-2" /></label><button className="border p-2">{t("Apply filter")}</button></form>
    {result.ok ? <>
      <p>{sourceLabel(result.data.provenance)}{t(". Showing")} {result.data.records.length} {t("returned records, at most 100. This is not a complete inventory.")}</p>
      <a className="underline" href={`/api/data/gbif-occurrences?${query}`}>{t("Download this extract (CSV)")}</a>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption>{t("Returned records; coordinates have the uncertainty supplied by the publisher.")}</caption>
        <thead><tr>{['Scientific name', 'Observation date', 'Latitude', 'Longitude', 'Uncertainty (m)', 'Sensitivity notes', 'Dataset citation', 'Licence'].map(h => <th key={h} scope="col" className="p-2">{h}</th>)}</tr></thead>
        <tbody>{result.data.records.map(r => <tr key={r.key}>
          <th scope="row" className="p-2">{r.scientificName ?? 'Not stated'}</th><td>{r.eventDate ?? '—'}</td><td>{r.latitude ?? '—'}</td><td>{r.longitude ?? '—'}</td><td>{r.coordinateUncertaintyMetres ?? 'Not stated'}</td><td>{[r.informationWithheld, r.dataGeneralizations].filter(Boolean).join('; ') || 'None stated'}</td>
          <td>{r.datasetName ?? 'Dataset name not stated'}{r.datasetDoi && <> {t("· DOI:")} {r.datasetDoi}</>}</td><td>{r.licence}</td>
        </tr>)}</tbody></table></div>
    </> : <p role="status">{t(failureMessage(result))}</p>}
  </Container>;
}
