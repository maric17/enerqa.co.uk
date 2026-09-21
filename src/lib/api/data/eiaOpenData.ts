import { fetchFromProvider, providerKey } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type DataSeries, type Frequency } from '../core/types';

/**
 * U.S. EIA Open Data API v2 - handoff p. 221 (Provider ID: eia-open-data).
 *
 * The key is free but it is a key, so the rule from p. 221 applies: "EIA key
 * is free and protected backend only" and "visitors receive ungated
 * chart/table/CSV access ... rather than an API-key registration screen."
 *
 * Without a key this connector reports `not_configured` and the section shows
 * nothing. It never falls back to sample numbers - that was the failure mode
 * of the old connectors this replaces.
 *
 * Register at https://www.eia.gov/opendata/register.php and set EIA_API_KEY.
 */

const BASE = 'https://api.eia.gov/v2';

type EiaResponse = {
  response?: {
    data?: Record<string, unknown>[];
    total?: number | string;
    dateFormat?: string;
    frequency?: string;
  };
};

function toFrequency(raw: string | undefined): Frequency {
  switch (raw) {
    case 'annual':
      return 'annual';
    case 'monthly':
      return 'monthly';
    case 'weekly':
      return 'weekly';
    case 'daily':
      return 'daily';
    case 'hourly':
      return 'hourly';
    default:
      return 'other';
  }
}

/**
 * Fetch one EIA route.
 *
 * `route` is the v2 path, e.g. "electricity/rto/daily-fuel-type-data" or
 * "total-energy/data". `facets` narrow the selection; p. 221 caps a response
 * at 5,000 rows, so `length` stays well below that.
 */
export async function fetchEiaSeries(options: {
  route: string;
  dataColumn: string;
  frequency: 'annual' | 'monthly' | 'weekly' | 'daily' | 'hourly';
  facets?: Record<string, string[]>;
  start?: string;
  end?: string;
  length?: number;
  seriesLabel: string;
  /** Column holding the series name when a route returns several. */
  groupBy?: string;
}): Promise<ConnectorResult<DataSeries[]>> {
  const key = providerKey('eia-open-data');
  if (!key) {
    return fail(
      'eia-open-data',
      'not_configured',
      'EIA_API_KEY is not set. Register free at https://www.eia.gov/opendata/register.php and add it to .env (server-side, no NEXT_PUBLIC_ prefix).',
    );
  }

  const { route, dataColumn, frequency, facets = {}, start, end, length = 500, seriesLabel, groupBy } = options;

  const params = new URLSearchParams({ api_key: key, frequency, 'data[0]': dataColumn, length: String(length) });
  if (start) params.set('start', start);
  if (end) params.set('end', end);
  for (const [facet, values] of Object.entries(facets)) {
    for (const value of values) params.append(`facets[${facet}][]`, value);
  }

  const res = await fetchFromProvider<EiaResponse>('eia-open-data', `${BASE}/${route}/data/?${params.toString()}`, {
    timeoutMs: 25000,
  });
  if (!res.ok) return res;

  const rows = res.data.response?.data ?? [];
  if (rows.length === 0) return fail('eia-open-data', 'no_results', 'EIA returned no rows for this selection.');

  const grouped = new Map<string, { period: string; value: number | null }[]>();
  const units = new Map<string, string>();

  for (const row of rows) {
    const period = String(row.period ?? '');
    if (!period) continue;
    const groupKey = groupBy ? String(row[groupBy] ?? seriesLabel) : seriesLabel;

    const raw = row[dataColumn];
    const value = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : null;

    const bucket = grouped.get(groupKey) ?? [];
    bucket.push({ period, value: value !== null && Number.isFinite(value) ? value : null });
    grouped.set(groupKey, bucket);

    const unit = row[`${dataColumn}-units`] ?? row.units;
    if (typeof unit === 'string' && unit) units.set(groupKey, unit);
  }

  const series: DataSeries[] = [...grouped.entries()].map(([label, points]) => {
    const sorted = points.sort((a, b) => a.period.localeCompare(b.period));
    return {
      id: `eia-${route.replace(/\//g, '-')}-${label}`,
      label,
      unit: units.get(label) ?? 'Not stated',
      frequency: toFrequency(res.data.response?.frequency ?? frequency),
      measureNote:
        'Official EIA series. Coverage is substantially U.S. with selected international series. API access does not make a series real-time; each series updates on its own release schedule.',
      area: null,
      observations: sorted,
      provenance: buildProvenance('eia-open-data', {
        sourceUrl: `https://www.eia.gov/opendata/browser/${route}`,
        sourceId: `${route}:${dataColumn}:${label}`,
        observationPeriod: sorted.length ? `${sorted[0].period}–${sorted[sorted.length - 1].period}` : null,
        accessStatus: 'verified_open',
        accessEvidence: 'EIA data browser pages are public and ungated; the API key protects the request, not the reader.',
        transformations: ['Grouped provider rows into series', 'Sorted observations by period'],
      }),
    };
  });

  return ok('eia-open-data', series);
}
