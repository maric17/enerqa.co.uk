import { fetchFromProvider } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type DataSeries } from '../core/types';

/**
 * NASA POWER Temporal API - handoff pp. 221-222 (Provider ID: nasa-power).
 *
 * The rewrite of the old `nasaPower.ts`, which hardcoded Qatar, ignored the
 * fill value and threw on failure.
 *
 * The fill value is the important one. POWER marks a missing observation as
 * **-999.0**, and its header says so. Parsed naively, a gap in the record
 * becomes "-999 degrees C" on a chart. p. 227 forbids filling missing values,
 * so -999 becomes null here.
 */

const BASE = 'https://power.larc.nasa.gov/api/temporal';

type PowerResponse = {
  header?: { fill_value?: number; time_standard?: string; api?: { version?: string } };
  properties?: { parameter?: Record<string, Record<string, number>> };
  parameters?: Record<string, { units?: string; longname?: string }>;
  messages?: string[];
};

/** The parameters this site actually uses, so callers do not guess codes. */
export const POWER_PARAMETERS = {
  ALLSKY_SFC_SW_DWN: 'All-sky surface shortwave downward irradiance',
  CLRSKY_SFC_SW_DWN: 'Clear-sky surface shortwave downward irradiance',
  T2M: 'Temperature at 2 metres',
  WS10M: 'Wind speed at 10 metres',
  PRECTOTCORR: 'Precipitation, bias corrected',
} as const;

export type PowerParameter = keyof typeof POWER_PARAMETERS;

/** "202201" -> "2022-01"; a bare year is left alone. */
function formatPeriod(raw: string): string {
  if (/^\d{6}$/.test(raw)) return `${raw.slice(0, 4)}-${raw.slice(4)}`;
  if (/^\d{8}$/.test(raw)) return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6)}`;
  return raw;
}

export async function fetchPowerMonthly(options: {
  latitude: number;
  longitude: number;
  parameters: PowerParameter[];
  startYear: number;
  endYear: number;
  /** RE (renewable energy), AG (agriculture) or SB (buildings). Changes the units. */
  community?: 'RE' | 'AG' | 'SB';
  locationLabel?: string;
}): Promise<ConnectorResult<DataSeries[]>> {
  const {
    latitude,
    longitude,
    parameters,
    startYear,
    endYear,
    community = 'RE',
    locationLabel,
  } = options;

  if (parameters.length === 0) return fail('nasa-power', 'no_results', 'No parameters requested.');
  // p. 221: hourly requests allow a maximum of 15 parameters. Monthly is more
  // generous, but keeping the same ceiling avoids a surprise later.
  if (parameters.length > 15) {
    return fail('nasa-power', 'no_results', 'NASA POWER allows at most 15 parameters per request.');
  }

  const params = new URLSearchParams({
    parameters: parameters.join(','),
    community,
    longitude: String(longitude),
    latitude: String(latitude),
    start: String(startYear),
    end: String(endYear),
    format: 'JSON',
  });

  const res = await fetchFromProvider<PowerResponse>('nasa-power', `${BASE}/monthly/point?${params.toString()}`, {
    timeoutMs: 25000,
  });
  if (!res.ok) return res;

  const payload = res.data;
  // Read the fill value from the response rather than hardcoding -999: if
  // POWER ever changes it, this keeps working.
  const fillValue = payload.header?.fill_value ?? -999;
  const timeStandard = payload.header?.time_standard ?? 'LST';
  const byParameter = payload.properties?.parameter ?? {};
  const area = locationLabel ?? `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

  const series: DataSeries[] = Object.entries(byParameter)
    .map(([code, values]) => {
      const meta = payload.parameters?.[code];
      const observations = Object.entries(values)
        // POWER appends a month "13" holding the annual value. It is a
        // different measure from a monthly one, so it is not charted as a month.
        .filter(([period]) => !/^\d{4}13$/.test(period))
        .map(([period, value]) => ({
          period: formatPeriod(period),
          value: value === fillValue ? null : value,
        }))
        .sort((a, b) => a.period.localeCompare(b.period));

      return {
        id: `nasa-power-${code}-${latitude}-${longitude}`,
        label: `${meta?.longname ?? POWER_PARAMETERS[code as PowerParameter] ?? code} — ${area}`,
        unit: meta?.units ?? 'Not stated',
        frequency: 'monthly' as const,
        // p. 222: modelled grid values, and the time standard must be shown.
        measureNote: `Modelled satellite-derived values for a source grid cell (roughly 0.5x0.625 degrees for meteorology, 1x1 for solar), not a site measurement. Times are ${timeStandard}. Historical resource data are not forecasts or climate projections.`,
        area,
        observations,
        provenance: buildProvenance('nasa-power', {
          sourceUrl: `https://power.larc.nasa.gov/data-access-viewer/?lat=${latitude}&lon=${longitude}`,
          sourceId: code,
          observationPeriod: `${startYear}–${endYear}`,
          version: payload.header?.api?.version ?? null,
          accessStatus: 'verified_open',
          accessEvidence: 'POWER Temporal API and the Data Access Viewer are keyless and open; checked 2026-09-19.',
          transformations: [
            `Replaced the provider fill value (${fillValue}) with a missing value rather than charting it`,
            'Excluded the period-13 annual summary from the monthly series',
          ],
        }),
      };
    })
    .filter((s) => s.observations.length > 0);

  if (series.length === 0) {
    return fail('nasa-power', 'no_results', 'NASA POWER returned no observations for this location.');
  }
  return ok('nasa-power', series);
}
