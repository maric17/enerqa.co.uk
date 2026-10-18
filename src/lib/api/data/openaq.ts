import { fetchFromProvider, providerKey } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type Provenance } from '../core/types';

/**
 * OpenAQ API v3 - handoff pp. 223-224 (Provider ID: openaq-v3).
 *
 * Rewrite of the old `openaq.ts`, which fell back to `generateMockOpenAQData()`
 * whenever the key was missing. Invented air-quality readings are about the
 * worst possible thing to publish, and p. 226 bans fabricated content outright.
 *
 * The licence handling is the substance here. p. 223: "Per-source licences
 * differ ... include only compatible providers" and "resolve licence-field
 * inconsistencies conservatively". OpenAQ returns `licenses: null` on many
 * locations, which means unknown - so those are excluded, not assumed open.
 */

const BASE = 'https://api.openaq.org/v3';

type LicenceRecord = {
  id: number;
  name: string;
  commercialUseAllowed?: boolean;
  redistributionAllowed?: boolean;
  modificationAllowed?: boolean;
  attributionRequired?: boolean;
  shareAlikeRequired?: boolean;
  sourceUrl?: string;
};

type LocationRecord = {
  id: number;
  name?: string;
  locality?: string | null;
  timezone?: string;
  country?: { code?: string; name?: string };
  owner?: { name?: string };
  provider?: { name?: string };
  licenses?: { id: number; name?: string }[] | null;
  sensors?: { id: number; name?: string; parameter?: { name?: string; units?: string; displayName?: string } }[];
  coordinates?: { latitude?: number; longitude?: number };
  datetimeLast?: { utc?: string } | null;
};

export type AirQualityStation = {
  id: number;
  name: string;
  locality: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  parameters: { sensorId: number; name: string; units: string; displayName: string }[];
  /** UTC timestamp of the most recent measurement, or null if not reported. */
  lastMeasuredAt: string | null;
  /** True when the station has not reported for more than 24 hours. */
  stale: boolean;
  licence: string;
  attribution: string;
  provenance: Provenance;
};

/** Cached licence catalogue. p. 223 requires the flags, not the licence name. */
async function fetchLicenceCatalogue(apiKey: string): Promise<Map<number, LicenceRecord>> {
  const res = await fetchFromProvider<{ results?: LicenceRecord[] }>(
    'openaq-v3',
    `${BASE}/licenses?limit=200`,
    { headers: { 'X-API-Key': apiKey }, revalidate: 7 * 86400 },
  );
  const map = new Map<number, LicenceRecord>();
  if (res.ok) for (const licence of res.data.results ?? []) map.set(licence.id, licence);
  return map;
}

/**
 * p. 223: "Require commercialUseAllowed=true and redistributionAllowed=true,
 * plus modificationAllowed=true for derived/transformed exports". Everything
 * this site publishes from OpenAQ is transformed - fields are selected and
 * reshaped for a table and a CSV - so all three flags must be explicitly true
 * (L1062). Anything undefined is treated as "no" ("resolve licence-field
 * inconsistencies conservatively"). Exported for tests.
 */
export function isUsable(licence: LicenceRecord | undefined): boolean {
  if (!licence) return false;
  return (
    licence.commercialUseAllowed === true &&
    licence.redistributionAllowed === true &&
    licence.modificationAllowed === true
  );
}

/**
 * p. 223: "satisfy attribution/share-alike where applicable". A share-alike
 * source is still usable, but the obligation has to travel with the data, so
 * it is written into the licence line every card and CSV prints.
 */
export function licenceLine(licences: LicenceRecord[]): string {
  const names = licences.map((l) => l.name).join(', ');
  const shareAlike = licences.some((l) => l.shareAlikeRequired === true);
  return shareAlike ? `${names} (share-alike: derived data must carry the same licence)` : names;
}

export async function fetchStations(options: {
  /** OpenAQ numeric country id. */
  countryId?: number;
  locationId?: number;
  limit?: number;
}): Promise<ConnectorResult<AirQualityStation[]>> {
  const apiKey = providerKey('openaq-v3');
  if (!apiKey) {
    return fail(
      'openaq-v3',
      'not_configured',
      'OPENAQ_API_KEY is not set. Register free at https://explore.openaq.org/register and add it to .env.',
    );
  }

  const { countryId, locationId, limit = 25 } = options;
  const params = new URLSearchParams({ limit: String(Math.min(limit, 100)) });
  if (countryId) params.set('countries_id', String(countryId));

  const [catalogue, res] = await Promise.all([
    fetchLicenceCatalogue(apiKey),
    fetchFromProvider<{ results?: LocationRecord[] }>('openaq-v3', locationId ? `${BASE}/locations/${locationId}` : `${BASE}/locations?${params.toString()}`, {
      headers: { 'X-API-Key': apiKey },
    }),
  ]);
  if (!res.ok) return res;

  const now = Date.now();
  const stations: AirQualityStation[] = [];

  for (const location of res.data.results ?? []) {
    // No licence block means unknown, and unknown is excluded (p. 223).
    const licences = location.licenses ?? [];
    if (licences.length === 0) continue;

    const usable = licences.map((l) => catalogue.get(l.id)).filter(isUsable);
    // Every licence on the record must clear, not just one of them.
    if (usable.length !== licences.length || usable.length === 0) continue;

    const lastUtc = location.datetimeLast?.utc ?? null;
    const attributionParts = [location.provider?.name, location.owner?.name].filter(Boolean) as string[];
    const licenceName = licenceLine(usable as LicenceRecord[]);

    stations.push({
      id: location.id,
      name: location.name ?? `Station ${location.id}`,
      locality: location.locality ?? null,
      country: location.country?.name ?? null,
      latitude: location.coordinates?.latitude ?? null,
      longitude: location.coordinates?.longitude ?? null,
      parameters: (location.sensors ?? []).map((sensor) => ({
        sensorId: sensor.id,
        name: sensor.parameter?.name ?? 'unknown',
        // p. 224: always show the unit and averaging period, never an AQI.
        units: sensor.parameter?.units ?? 'not stated',
        displayName: sensor.parameter?.displayName ?? sensor.parameter?.name ?? 'unknown',
      })),
      lastMeasuredAt: lastUtc,
      // p. 224: "Do not display old measurements as live."
      stale: !lastUtc || now - Date.parse(lastUtc) > 24 * 60 * 60 * 1000,
      licence: licenceName,
      attribution: ['OpenAQ', ...attributionParts].join(' / '),
      provenance: buildProvenance('openaq-v3', {
        retrievedAt: res.retrievedAt,
        sourceUrl: `https://explore.openaq.org/locations/${location.id}`,
        sourceId: String(location.id),
        observationPeriod: lastUtc,
        licence: licenceName,
        licenceUrl: usable[0]?.sourceUrl ?? null,
        attribution: ['OpenAQ', ...attributionParts].join(' / '),
        accessStatus: 'verified_open',
        accessCheckedAt: res.retrievedAt,
        accessEvidence: `Source licence "${licenceName}" is flagged commercialUseAllowed, redistributionAllowed and modificationAllowed by OpenAQ.`,
        transformations: ['Excluded sources whose licence flags do not permit commercial use, redistribution and modification'],
      }),
    });
  }

  if (stations.length === 0) {
    return fail(
      'openaq-v3',
      'no_results',
      'No monitoring stations with a licence permitting commercial display were found for this selection.',
    );
  }
  return ok('openaq-v3', stations);
}

/** p. 224, kept beside the data so a caller cannot omit it. */
export const AIR_QUALITY_INTERPRETATION =
  'Measured concentrations from monitoring networks of uneven geography and sensor quality. Check pollutant, unit and averaging period before comparing stations. Not complete global coverage, not official public-health advice, and not compliance evidence.';

/** Daily means for a selected sensor, after its location clears every licence flag. */
export async function fetchAirQualitySeries(options: {
  locationId: number; sensorId: number; from: string; to: string;
}): Promise<ConnectorResult<import('../core/types').DataSeries[]>> {
  const { locationId, sensorId, from, to } = options;
  const start = Date.parse(from), end = Date.parse(to);
  if (!Number.isInteger(locationId) || locationId <= 0 || !Number.isInteger(sensorId) || sensorId <= 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) ||
    !Number.isFinite(start) || !Number.isFinite(end) || end < start || end - start > 31 * 86400000) {
    return fail('openaq-v3', 'no_results', 'Select a location, sensor and at most 31 days.');
  }
  const stations = await fetchStations({ locationId });
  if (!stations.ok) return stations;
  const station = stations.data.find(s => s.id === locationId);
  const sensor = station?.parameters.find(p => p.sensorId === sensorId);
  if (!station || !sensor) return fail('openaq-v3', 'no_results', 'This sensor is not part of a licence-cleared location.');
  const apiKey = providerKey('openaq-v3')!;
  type Measurement = { value?: number | null; parameter?: { name?: string; units?: string }; period?: { datetimeFrom?: { utc?: string; local?: string }; datetimeTo?: { utc?: string; local?: string } }; flagInfo?: { hasFlags?: boolean } };
  const params = new URLSearchParams({ date_from: from, date_to: to, limit: '1000' });
  const res = await fetchFromProvider<{ results?: Measurement[] }>('openaq-v3', `${BASE}/sensors/${sensorId}/days?${params}`, { headers: { 'X-API-Key': apiKey }, revalidate: 86400 });
  if (!res.ok) return res;
  const rows = res.data.results ?? [];
  if (rows.some(r => (r.parameter?.units && r.parameter.units !== sensor.units) || (r.parameter?.name && r.parameter.name !== sensor.name))) {
    return fail('openaq-v3', 'unavailable', 'The source returned inconsistent pollutant names or units.');
  }
  const observations = rows.flatMap(r => {
    const at = r.period?.datetimeFrom?.utc;
    if (!at || !Number.isFinite(Date.parse(at))) return [];
    // Daily means follow the station's calendar; UTC intervals remain in the export.
    const local = r.period?.datetimeFrom?.local;
    const period = local && Number.isFinite(Date.parse(local)) ? local.slice(0, 10) : at;
    return [{ period, value: typeof r.value === 'number' && Number.isFinite(r.value) ? r.value : null,
      flag: [`Averaging interval (UTC): ${at} to ${r.period?.datetimeTo?.utc ?? 'not stated'}`, ...(r.flagInfo?.hasFlags ? ['Provider flags present; review source quality flags'] : [])].join('; ') }];
  }).sort((a, b) => a.period.localeCompare(b.period));
  if (!observations.length) return fail('openaq-v3', 'no_results', 'No measurements for this period.');
  return ok('openaq-v3', [{
    id: `openaq-${sensorId}`, label: `${station.name} — ${sensor.displayName}`, unit: sensor.units, frequency: 'daily',
    area: [station.locality, station.country].filter(Boolean).join(', ') || null,
    measureNote: `Daily mean concentrations; daily aggregation follows station local time; source local dates label observations where supplied, and UTC averaging intervals travel in the flag column. ${AIR_QUALITY_INTERPRETATION}${station.stale ? ' This station has not reported within the last 24 hours; these are historical readings.' : ''}`,
    observations,
    provenance: { ...station.provenance, sourceId: String(sensorId), retrievedAt: res.retrievedAt,
      observationPeriod: `${observations[0].period}–${observations[observations.length - 1].period}`,
      accessCheckedAt: res.retrievedAt,
      transformations: [...station.provenance.transformations, 'Selected provider daily means; no conversion to AQI', 'Preserved UTC period starts and provider quality warnings'] },
  }], res.retrievedAt, res.stale);
}
