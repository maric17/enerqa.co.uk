import { retainSeries } from '@/lib/api/core/dataRecords';
import { fetchEiaSeries } from '@/lib/api/data/eiaOpenData';
import { fetchAirQualitySeries } from '@/lib/api/data/openaq';
import type { ConnectorResult, DataSeries } from '@/lib/api/core/types';
import { fetchCountryEmissions } from '@/lib/api/data/climateTrace';
import { fetchIndicator, WORLD_BANK_INDICATORS, type IndicatorKey } from '@/lib/api/data/worldBankIndicators';
import { fetchOecdSlice } from '@/lib/api/data/oecdSdmx';
import { fetchPowerMonthly, type PowerParameter } from '@/lib/api/data/nasaPower';

/**
 * Ungated CSV export (handoff p. 227).
 *
 * Every numerical view on the site must be downloadable, and the file must
 * carry its own attribution, units, methodology links and transformation
 * notes - which `seriesToCsv` writes into a comment block at the top.
 *
 * "Ungated" is the operative word. pp. 221 and 223 both say visitors must
 * receive the export itself, never an API-key registration screen. So there is
 * no auth here on purpose: the provider key protects our request upstream, not
 * the reader downstream.
 */



type Handler = (params: URLSearchParams) => Promise<ConnectorResult<DataSeries[]>>;

function countries(params: URLSearchParams, fallback: string[]): string[] {
  const raw = params.get('countries');
  if (!raw) return fallback;
  // ISO3 codes only, capped so a crafted URL cannot fan out into a huge job.
  return raw
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[A-Z]{3}$/.test(c))
    .slice(0, 8);
}

function year(params: URLSearchParams, key: string, fallback: number): number {
  const raw = Number.parseInt(params.get(key) ?? '', 10);
  return Number.isFinite(raw) && raw >= 1960 && raw <= 2100 ? raw : fallback;
}

/**
 * The datasets available for download. Adding one here is what makes it
 * downloadable; there is no generic passthrough, so a visitor cannot use this
 * route to proxy arbitrary provider calls with our keys.
 */
const CONNECTORS: Record<string, { title: string; handler: Handler }> = {
  'energy-generation': {
    title: 'United States electricity generation',
    // A fixed source slice keeps visitor parameters away from provider keys and routes.
    handler: p => fetchEiaSeries({ route: 'electricity/electric-power-operational-data', dataColumn: 'generation',
      frequency: 'annual', facets: { location: ['US'], sectorid: ['99'], fueltypeid: ['ALL'] },
      start: String(year(p, 'from', 2020)), end: String(year(p, 'to', 2024)), seriesLabel: 'United States electricity generation', area: 'United States', length: 150 }),
  },
  'air-quality': {
    title: 'Station air pollutant concentrations',
    handler: p => fetchAirQualitySeries({ locationId: Number(p.get('location')), sensorId: Number(p.get('sensor')),
      from: p.get('from') ?? '', to: p.get('to') ?? '' }),
  },
  'country-emissions': {
    title: 'Greenhouse gas emissions by country',
    handler: (p) =>
      fetchCountryEmissions({
        countries: countries(p, ['QAT', 'ARE', 'SAU']),
        since: year(p, 'from', 2021),
        to: year(p, 'to', 2023),
        sector: p.get('sector') ?? undefined,
        horizon: p.get('horizon') === '20yr' ? '20yr' : '100yr',
      }),
  },
  'world-bank-indicator': {
    title: 'World Bank indicator',
    handler: (p) => {
      const requested = p.get('indicator') ?? 'co2PerCapita';
      const indicator = (Object.hasOwn(WORLD_BANK_INDICATORS, requested) ? requested : 'co2PerCapita') as IndicatorKey;
      return fetchIndicator({
        countries: countries(p, ['QAT']),
        indicator,
        startYear: year(p, 'from', 2000),
        endYear: year(p, 'to', new Date().getUTCFullYear()),
      });
    },
  },
  'municipal-waste': {
    title: 'Municipal waste generation and treatment',
    handler: (p) =>
      fetchOecdSlice({
        dataflow: 'municipalWaste',
        // SDMX keys are positional; anything unexpected falls back to a safe one.
        key: /^[A-Z+]*\.{2,}$/.test(p.get('key') ?? '') ? p.get('key')! : 'FRA+DEU....',
        startPeriod: String(year(p, 'from', 2016)),
        endPeriod: String(year(p, 'to', 2022)),
      }),
  },
  'solar-resource': {
    title: 'Solar resource and meteorology',
    handler: (p) => {
      const lat = Number.parseFloat(p.get('lat') ?? '25.2');
      const lon = Number.parseFloat(p.get('lon') ?? '51.5');
      return fetchPowerMonthly({
        latitude: Number.isFinite(lat) ? lat : 25.2,
        longitude: Number.isFinite(lon) ? lon : 51.5,
        parameters: ['ALLSKY_SFC_SW_DWN', 'T2M'] as PowerParameter[],
        startYear: year(p, 'from', 2020),
        endYear: year(p, 'to', 2023),
        locationLabel: p.get('place') ?? undefined,
      });
    },
  },
};


// Every public dataset view and CSV uses the same retained source records.
export const DATASETS = Object.fromEntries(Object.entries(CONNECTORS).map(([key, entry]) => [key, { ...entry, handler: async (params: URLSearchParams) => retainSeries(await entry.handler(params)) }]));
