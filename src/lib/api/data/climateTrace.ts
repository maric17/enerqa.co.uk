import { fetchFromProvider, } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type DataSeries } from '../core/types';

/**
 * Climate TRACE Public API (Beta) - handoff p. 218 (Provider ID: climate-trace).
 *
 * p. 218 says to confirm the current v7 specification rather than assume it.
 * Checked on 2026-09-19: v7 answers /definitions/* but every emissions route
 * returns 404, while the same routes answer on v6. So the sector list comes
 * from v7 and the data from v6, and this comment is here so the next person
 * does not "fix" it back.
 *
 * Interpretation limits this file encodes rather than leaves to the UI:
 *  - These are MODELLED estimates, not national inventories or UNFCCC
 *    submissions, and prior months can be revised.
 *  - CO2e means nothing without its GWP horizon, so the horizon is part of the
 *    series label and unit, never implied.
 */

const BASE = 'https://api.climatetrace.org';

/** p. 218: state the gas, the unit and the CO2e horizon explicitly. */
export type GwpHorizon = '100yr' | '20yr';

type CountryEmissions = {
  country: string;
  rank: number | null;
  emissions: Record<string, number | null> | null;
};

const INTERPRETATION =
  'Modelled estimates from Climate TRACE. Not an official UNFCCC submission, not a verified organisational GHG inventory, and not Scope 1/2/3 or carbon-credit verification. Recent months may be revised.';

/**
 * p. 218: "Keep the free public API candidate, beta/reliability warning".
 * The provider's own words are "Public API (Beta)" and that production
 * availability is not guaranteed.
 */
export const BETA_WARNING = 'Climate TRACE Public API (Beta): the provider does not guarantee production availability.';

/**
 * p. 218: "API version v7 is not the inventory release version", and the
 * inventory release has to be recorded. Neither API answers with a release:
 * the v6 emissions responses carry no version field or header, and the v7
 * OpenAPI document declares only its own API version (7.2.0). So no release is
 * recorded (provenance `version` stays null) rather than one guessed from the
 * spec's 5.10.0 of August 2026; what IS known goes into the transformation
 * notes.
 */
const VERSION_NOTE = 'Values from the Climate TRACE v6 API emissions routes; the API does not state the inventory release version';

/**
 * Each year is one upstream call (the API returns one total per call), so a
 * wide range fans out: 1960-2100 was 141 calls from one download (L1050).
 */
export const MAX_YEARS = 10;

/**
 * Annual emissions for one or more countries in a sector.
 *
 * Returns one series per country so a chart can compare them without the
 * caller having to regroup anything.
 */
export async function fetchCountryEmissions(options: {
  countries: string[];
  since: number;
  to: number;
  /** Omit for all sectors combined. */
  sector?: string;
  horizon?: GwpHorizon;
}): Promise<ConnectorResult<DataSeries[]>> {
  const { countries, since, to, sector, horizon = '100yr' } = options;
  if (countries.length === 0) return fail('climate-trace', 'no_results', 'No countries requested.');
  if (to < since || to - since + 1 > MAX_YEARS) {
    return fail('climate-trace', 'no_results', `Climate TRACE requests are limited to ${MAX_YEARS} years at a time.`);
  }

  // The API returns one total per country per call, so one call per year keeps
  // the annual shape. Ranges here are small and cached for a week.
  const years = Array.from({ length: to - since + 1 }, (_, i) => since + i);
  const measure = `co2e_${horizon}`;

  const perYear = await Promise.all(
    years.map(async (year) => {
      const params = new URLSearchParams({
        since: String(year),
        to: String(year),
        countries: countries.join(','),
      });
      if (sector) params.set('sector', sector);

      const res = await fetchFromProvider<CountryEmissions[]>(
        'climate-trace',
        `${BASE}/v6/country/emissions?${params.toString()}`,
      );
      return { year, res };
    }),
  );

  // If every year failed, report the failure rather than an empty chart.
  const firstFailure = perYear.find((p) => !p.res.ok);
  if (perYear.every((p) => !p.res.ok) && firstFailure && !firstFailure.res.ok) {
    return firstFailure.res;
  }

  const byCountry = new Map<string, { period: string; value: number | null }[]>();
  for (const country of countries) byCountry.set(country, []);

  for (const { year, res } of perYear) {
    if (!res.ok || !Array.isArray(res.data)) continue;
    for (const row of res.data) {
      const bucket = byCountry.get(row.country);
      if (!bucket) continue;
      const raw = row.emissions?.[measure];
      // A missing figure stays missing. p. 227 forbids filling it with zero.
      bucket.push({ period: String(year), value: typeof raw === 'number' ? raw : null });
    }
  }

  const sourceUrl = sector
    ? `https://climatetrace.org/explore?sector=${encodeURIComponent(sector)}`
    : 'https://climatetrace.org/explore';

  // Several yearly responses feed one series; the oldest is the honest age.
  const retrievedAt = perYear
    .flatMap((p) => (p.res.ok ? [p.res.retrievedAt] : []))
    .sort()[0];

  const series: DataSeries[] = [...byCountry.entries()]
    .filter(([, observations]) => observations.length > 0)
    .map(([country, observations]) => ({
      id: `climate-trace-${country}-${sector ?? 'all'}-${horizon}`,
      label: sector ? `${country} — ${sector.replace(/-/g, ' ')}` : country,
      unit: 'tonnes CO2e',
      frequency: 'annual' as const,
      // The horizon is part of the measure note, never left implicit (p. 218).
      measureNote: `CO2e, ${horizon === '100yr' ? '100-year' : '20-year'} global warming potential. ${INTERPRETATION} ${BETA_WARNING}`,
      area: country,
      observations: observations.sort((a, b) => a.period.localeCompare(b.period)),
      provenance: buildProvenance('climate-trace', {
        retrievedAt,
        sourceUrl,
        sourceId: `${country}:${sector ?? 'all'}`,
        observationPeriod: since === to ? String(since) : `${since}–${to}`,
        accessStatus: 'verified_open',
        accessCheckedAt: retrievedAt,
        accessEvidence: 'Climate TRACE explorer and API are open without registration; checked 2026-09-19.',
        version: null,
        transformations: [
          `Selected the ${measure} field from the provider response`,
          'Combined single-year API responses into one annual series',
          VERSION_NOTE,
        ],
      }),
    }));

  if (series.length === 0) {
    return fail('climate-trace', 'no_results', 'Climate TRACE returned no emissions for this selection.');
  }
  return ok('climate-trace', series);
}

/** The sector vocabulary, so filters are never hardcoded from memory. */
export async function fetchSectors(): Promise<ConnectorResult<string[]>> {
  const res = await fetchFromProvider<string[]>('climate-trace', `${BASE}/v7/definitions/sectors`);
  if (!res.ok) return res;
  return ok('climate-trace', Array.isArray(res.data) ? res.data : []);
}
