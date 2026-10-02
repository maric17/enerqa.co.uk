import { fetchOccurrences, OCCURRENCE_INTERPRETATION, type OccurrenceResult } from './gbifOccurrence';
import { commentLine, escapeCell } from '../core/csv';
import { storeRecords } from '../core/storage';
import { fail } from '../core/types';

/** A bounded extract, not a claim to have downloaded every GBIF occurrence. */
export async function loadOccurrenceExtract(params: URLSearchParams) {
  const country = params.get('country') ?? 'QA';
  if (!/^[A-Z]{2}$/.test(country)) return fail('gbif-occurrence', 'no_results', 'Select a two-letter country code.');
  const result = await fetchOccurrences({ country, limit: 100 });
  if (!result.ok) return result;
  try {
    const p = result.data.provenance;
    const stored = await storeRecords([{ provider: 'gbif-occurrence', sourceId: `extract:${country}`, destination: p.sourceUrl, accessStatus: p.accessStatus,
      accessCheckedAt: p.accessCheckedAt, retrievedAt: p.retrievedAt, record: result.data }]);
    return stored ? result : fail('gbif-occurrence', 'unavailable', 'Source evidence could not be stored.');
  } catch { return fail('gbif-occurrence', 'unavailable', 'Source evidence could not be stored.'); }
}

export function occurrencesToCsv(data: OccurrenceResult): string {
  const p = data.provenance;
  const notes = ['Enerqa GBIF occurrence extract — at most 100 returned records, not a complete inventory', OCCURRENCE_INTERPRETATION,
    `Attribution: ${p.attribution}; credit each named publishing dataset`, `Retrieved by Enerqa: ${p.retrievedAt}`,
    'Licence: per record, CC0 or CC BY only', 'Methodology: https://www.gbif.org/occurrence-data',
    ...p.transformations];
  const headers = ['key', 'scientific_name', 'event_date', 'country', 'latitude', 'longitude', 'coordinate_uncertainty_metres', 'dataset', 'dataset_doi', 'licence', 'information_withheld', 'data_generalizations'];
  return [...notes.map(commentLine), headers.join(','), ...data.records.map(r => [r.key, r.scientificName, r.eventDate, r.country,
    r.latitude, r.longitude, r.coordinateUncertaintyMetres, r.datasetName, r.datasetDoi, r.licence, r.informationWithheld, r.dataGeneralizations].map(escapeCell).join(','))].join('\n') + '\n';
}
