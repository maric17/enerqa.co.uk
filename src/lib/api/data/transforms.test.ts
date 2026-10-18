import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchPowerMonthly } from './nasaPower';
import { fetchOccurrences } from './gbifOccurrence';
import { fetchIndicator } from './worldBankIndicators';

/**
 * The two transforms most likely to publish something wrong, plus the World
 * Bank null handling. All three are driven by stubbed provider responses built
 * from real payloads captured on 2026-09-19.
 */

function stubFetch(payload: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } })),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('NASA POWER fill value (p. 227)', () => {
  it('turns the -999 fill value into a missing value, not a reading', () => {
    // Left as-is this renders as "-999 degrees C" on a chart.
    stubFetch({
      header: { fill_value: -999, time_standard: 'LST', api: { version: 'v2.10.0' } },
      parameters: { T2M: { units: 'C', longname: 'Temperature at 2 Meters' } },
      properties: {
        parameter: { T2M: { '202201': 17.52, '202202': -999, '202203': 23.22 } },
      },
    });

    return fetchPowerMonthly({
      latitude: 25.2,
      longitude: 51.5,
      parameters: ['T2M'],
      startYear: 2022,
      endYear: 2022,
    }).then((result) => {
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const values = result.data[0].observations.map((o) => o.value);
      expect(values).toEqual([17.52, null, 23.22]);
      expect(values).not.toContain(-999);
    });
  });

  it('excludes the period-13 annual summary from a monthly series', () => {
    // POWER appends month "13" holding the annual figure. Charted as a month
    // it produces a phantom thirteenth point.
    stubFetch({
      header: { fill_value: -999 },
      parameters: { T2M: { units: 'C' } },
      properties: { parameter: { T2M: { '202201': 17.5, '202213': 27.9 } } },
    });

    return fetchPowerMonthly({
      latitude: 25.2,
      longitude: 51.5,
      parameters: ['T2M'],
      startYear: 2022,
      endYear: 2022,
    }).then((result) => {
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.data[0].observations.map((o) => o.period)).toEqual(['2022-01']);
    });
  });

  it('states the time standard and the modelled-grid limitation', () => {
    stubFetch({
      header: { fill_value: -999, time_standard: 'LST' },
      parameters: { T2M: { units: 'C' } },
      properties: { parameter: { T2M: { '202201': 17.5 } } },
    });

    return fetchPowerMonthly({
      latitude: 25.2,
      longitude: 51.5,
      parameters: ['T2M'],
      startYear: 2022,
      endYear: 2022,
    }).then((result) => {
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.data[0].measureNote).toContain('LST');
      expect(result.data[0].measureNote).toContain('not a site measurement');
    });
  });
});

describe('GBIF licence filtering (p. 223)', () => {
  it('drops CC BY-NC records even if the provider returns them', () => {
    // The query asks for CC0 and CC BY, but the licence position is ours to
    // defend, so the response is filtered again.
    stubFetch({
      count: 3,
      results: [
        { key: 1, scientificName: 'A', license: 'http://creativecommons.org/publicdomain/zero/1.0/legalcode', year: 2024 },
        { key: 2, scientificName: 'B', license: 'http://creativecommons.org/licenses/by-nc/4.0/legalcode', year: 2024 },
        { key: 3, scientificName: 'C', license: 'http://creativecommons.org/licenses/by/4.0/legalcode', year: 2024 },
      ],
    });

    return fetchOccurrences({ country: 'QA' }).then((result) => {
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.data.records.map((r) => r.scientificName)).toEqual(['A', 'C']);
      expect(result.data.records.some((r) => /by-nc/i.test(r.licence))).toBe(false);
    });
  });

  it('drops a record with no licence rather than assuming it is open', () => {
    stubFetch({ count: 1, results: [{ key: 9, scientificName: 'D', year: 2024 }] });
    return fetchOccurrences({ country: 'QA' }).then((result) => {
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toBe('no_results');
    });
  });
});

describe('World Bank missing values (p. 219)', () => {
  it('keeps a null year as null instead of dropping or zeroing it', () => {
    stubFetch([
      { page: 1, pages: 1, total: 3, lastupdated: '2026-07-13' },
      [
        { indicator: { id: 'X', value: 'Test' }, country: { id: 'QA', value: 'Qatar' }, countryiso3code: 'QAT', date: '2025', value: null, unit: '', obs_status: '' },
        { indicator: { id: 'X', value: 'Test' }, country: { id: 'QA', value: 'Qatar' }, countryiso3code: 'QAT', date: '2024', value: 47.3, unit: '', obs_status: '' },
      ],
    ]);

    return fetchIndicator({ countries: ['QAT'], indicator: 'co2PerCapita' }).then((result) => {
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const obs = result.data[0].observations;
      expect(obs.map((o) => o.value)).toEqual([47.3, null]);
      // The stated period stops at the last year that actually has a figure.
      expect(result.data[0].provenance.observationPeriod).toBe('2024');
    });
  });
});
