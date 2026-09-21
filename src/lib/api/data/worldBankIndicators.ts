import { fetchFromProvider } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type DataSeries } from '../core/types';

/**
 * World Bank Indicators API v2 - handoff p. 219 (Provider ID: world-bank-indicators).
 *
 * This replaces the old `worldBank.ts`, which despite its name called the
 * Climate Watch API and, when that returned nothing, **generated mock data**.
 * Invented figures on a corporate sustainability site are exactly what p. 226
 * prohibits, so that file is gone rather than patched.
 *
 * Two p. 219 rules encoded here:
 *  - Missing values are common. `null` stays `null`.
 *  - The most recent year returned is usually NOT the current year, so the
 *    observation period is taken from the data rather than from today's date.
 */

const BASE = 'https://api.worldbank.org/v2';

type WorldBankRow = {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
};

type WorldBankMeta = { page: number; pages: number; total: number; lastupdated: string };

/**
 * A few indicators that are relevant to Enerqa's domains, with the unit
 * spelled out. p. 227 singles out nominal vs constant currency, so anything
 * in current US$ says so in its own note.
 */
export const WORLD_BANK_INDICATORS = {
  co2PerCapita: {
    code: 'EN.GHG.CO2.PC.CE.AR5',
    label: 'CO2 emissions excluding LULUCF per capita',
    unit: 't CO2e per person',
    measureNote: 'AR5 global warming potentials. Excludes land use, land-use change and forestry.',
  },
  renewableShare: {
    code: 'EG.FEC.RNEW.ZS',
    label: 'Renewable energy consumption',
    unit: '% of total final energy consumption',
    measureNote: null,
  },
  electricityAccess: {
    code: 'EG.ELC.ACCS.ZS',
    label: 'Access to electricity',
    unit: '% of population',
    measureNote: null,
  },
  energyUsePerCapita: {
    code: 'EG.USE.PCAP.KG.OE',
    label: 'Energy use per capita',
    unit: 'kg of oil equivalent per person',
    measureNote: null,
  },
  gdpCurrentUsd: {
    code: 'NY.GDP.MKTP.CD',
    label: 'GDP',
    unit: 'current US$',
    // p. 219 calls this out by name.
    measureNote: 'Current US dollars, not inflation adjusted. This is not a real growth measure.',
  },
} as const;

export type IndicatorKey = keyof typeof WORLD_BANK_INDICATORS;

export async function fetchIndicator(options: {
  /** ISO3 codes, e.g. ["QAT", "ARE"]. */
  countries: string[];
  indicator: IndicatorKey;
  startYear?: number;
  endYear?: number;
}): Promise<ConnectorResult<DataSeries[]>> {
  const { countries, indicator, startYear = 2000, endYear = new Date().getUTCFullYear() } = options;
  if (countries.length === 0) return fail('world-bank-indicators', 'no_results', 'No countries requested.');

  const meta = WORLD_BANK_INDICATORS[indicator];
  const params = new URLSearchParams({
    format: 'json',
    date: `${startYear}:${endYear}`,
    // Default pagination is 50 (p. 219), which silently truncates a long
    // multi-country series, so the page size is set explicitly.
    per_page: '2000',
  });

  const url = `${BASE}/country/${countries.join(';')}/indicator/${meta.code}?${params.toString()}`;
  const res = await fetchFromProvider<[WorldBankMeta, WorldBankRow[] | null]>('world-bank-indicators', url);
  if (!res.ok) return res;

  const [head, rows] = Array.isArray(res.data) ? res.data : [null, null];
  if (!rows || rows.length === 0) {
    return fail('world-bank-indicators', 'no_results', 'The World Bank has no data for this selection.');
  }

  const byCountry = new Map<string, WorldBankRow[]>();
  for (const row of rows) {
    const key = row.countryiso3code || row.country.id;
    const bucket = byCountry.get(key);
    if (bucket) bucket.push(row);
    else byCountry.set(key, [row]);
  }

  const series: DataSeries[] = [...byCountry.entries()].map(([iso3, countryRows]) => {
    const sorted = [...countryRows].sort((a, b) => a.date.localeCompare(b.date));
    // The period label comes from years that actually carry a value, so we
    // never claim coverage up to a year the source left empty (p. 219).
    const withValues = sorted.filter((r) => typeof r.value === 'number');
    const first = withValues[0]?.date;
    const last = withValues[withValues.length - 1]?.date;

    return {
      id: `world-bank-${meta.code}-${iso3}`,
      label: `${countryRows[0].country.value} — ${meta.label}`,
      unit: meta.unit,
      frequency: 'annual' as const,
      measureNote: meta.measureNote,
      area: countryRows[0].country.value,
      observations: sorted.map((row) => ({
        period: row.date,
        // Null means the source published nothing for that year.
        value: typeof row.value === 'number' ? row.value : null,
        flag: row.obs_status || null,
      })),
      provenance: buildProvenance('world-bank-indicators', {
        sourceUrl: `https://data.worldbank.org/indicator/${meta.code}?locations=${iso3}`,
        sourceId: `${meta.code}:${iso3}`,
        observationPeriod: first && last ? (first === last ? first : `${first}–${last}`) : null,
        sourceReleasedAt: head?.lastupdated ?? null,
        accessStatus: 'verified_open',
        accessEvidence: 'World Bank Indicators API requires no authentication and data.worldbank.org pages open anonymously; checked 2026-09-19.',
        transformations: ['Grouped provider rows by country', 'Sorted observations by year'],
      }),
    };
  });

  return ok('world-bank-indicators', series);
}
