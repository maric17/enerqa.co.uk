import { fetchFromProvider } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult } from '../core/types';
import type { Provenance } from '../core/types';

/**
 * GBIF Occurrence API - handoff pp. 222-223 (Provider ID: gbif-occurrence).
 *
 * The licence rule is the reason this connector is not three lines long.
 * p. 223: "Restrict occurrences to CC0/CC BY (no BY-NC corporate reuse without
 * permission)." That is not hypothetical - the first unfiltered result for
 * Qatar on 2026-09-19 was an iNaturalist record under CC BY-NC.
 *
 * So the licence filter is applied twice: once in the query, so GBIF does the
 * work, and once on the way out, because a server-side filter we did not write
 * is not something to stake a licence position on.
 *
 * p. 223 also governs how the numbers may be described: these are
 * presence-only observations with sampling bias. Absence of records is not
 * absence of a species, and counts are RECORD counts, never abundance.
 */

const BASE = 'https://api.gbif.org/v1/occurrence/search';

/** GBIF's own enum values for the only two licences cleared for corporate reuse. */
const ALLOWED_LICENCE_PARAMS = ['CC0_1_0', 'CC_BY_4_0'];

/** Matches both the enum form and the URL form GBIF returns in records. */
const ALLOWED_LICENCE_PATTERN = /(publicdomain\/zero|licenses\/by\/4\.0|^CC0_1_0$|^CC_BY_4_0$)/i;

export type OccurrenceRecord = {
  key: string;
  scientificName: string | null;
  eventDate: string | null;
  year: number | null;
  latitude: number | null;
  longitude: number | null;
  /** Metres, where the publisher supplied it. Respect it - do not plot a point as exact. */
  coordinateUncertaintyMetres: number | null;
  country: string | null;
  datasetName: string | null;
  datasetKey: string | null;
  basisOfRecord: string | null;
  licence: string;
};

export type OccurrenceResult = {
  records: OccurrenceRecord[];
  /** GBIF's total for the filtered query. A count of RECORDS, not of organisms. */
  recordCount: number;
  provenance: Provenance;
};

type GbifResponse = {
  count?: number;
  results?: Record<string, unknown>[];
};

function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}
function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export async function fetchOccurrences(options: {
  /** ISO2 country code, e.g. "QA". */
  country?: string;
  taxonKey?: number;
  /** Only records carrying coordinates, for a map. */
  hasCoordinate?: boolean;
  yearFrom?: number;
  yearTo?: number;
  limit?: number;
}): Promise<ConnectorResult<OccurrenceResult>> {
  const { country, taxonKey, hasCoordinate = true, yearFrom, yearTo, limit = 50 } = options;

  const params = new URLSearchParams({ limit: String(Math.min(limit, 300)) });
  if (country) params.set('country', country);
  if (taxonKey) params.set('taxonKey', String(taxonKey));
  if (hasCoordinate) params.set('hasCoordinate', 'true');
  if (yearFrom && yearTo) params.set('year', `${yearFrom},${yearTo}`);
  // Ask GBIF to filter first so we do not pay for records we must discard.
  for (const licence of ALLOWED_LICENCE_PARAMS) params.append('license', licence);

  const res = await fetchFromProvider<GbifResponse>('gbif-occurrence', `${BASE}?${params.toString()}`, {
    timeoutMs: 20000,
  });
  if (!res.ok) return res;

  const raw = res.data.results ?? [];

  const records: OccurrenceRecord[] = raw
    .map((row) => ({
      key: String(row.key ?? ''),
      scientificName: str(row.scientificName),
      eventDate: str(row.eventDate),
      year: num(row.year),
      latitude: num(row.decimalLatitude),
      longitude: num(row.decimalLongitude),
      coordinateUncertaintyMetres: num(row.coordinateUncertaintyInMeters),
      country: str(row.country),
      datasetName: str(row.datasetName),
      datasetKey: str(row.datasetKey),
      basisOfRecord: str(row.basisOfRecord),
      licence: str(row.license) ?? '',
    }))
    // The second pass. Anything whose licence we cannot positively read as
    // CC0 or CC BY is dropped, including records with no licence at all.
    .filter((record) => record.key && ALLOWED_LICENCE_PATTERN.test(record.licence));

  if (records.length === 0) {
    return fail('gbif-occurrence', 'no_results', 'No openly licensed occurrence records for this selection.');
  }

  const sourceUrl = `https://www.gbif.org/occurrence/search?${params.toString()}`;

  return ok('gbif-occurrence', {
    records,
    recordCount: res.data.count ?? records.length,
    provenance: buildProvenance('gbif-occurrence', {
      sourceUrl,
      sourceId: country ? `country:${country}` : 'occurrence-search',
      observationPeriod: yearFrom && yearTo ? `${yearFrom}–${yearTo}` : null,
      accessStatus: 'verified_open',
      accessEvidence: 'GBIF occurrence search is public and unauthenticated; only CC0 and CC BY records are retained.',
      transformations: [
        'Restricted to CC0 and CC BY licensed records, in the query and again on the response',
        'Kept the provider coordinate uncertainty rather than presenting points as exact',
      ],
    }),
  });
}

/**
 * The sentence that must accompany any occurrence count (p. 223). Kept next to
 * the data so a caller cannot forget it.
 */
export const OCCURRENCE_INTERPRETATION =
  'Presence-only records with uneven sampling. Counts are numbers of published records, not species abundance, and an absence of records is not evidence that a species is absent. Not a biodiversity impact assessment or a substitute for field survey.';
