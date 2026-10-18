import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAirQualitySeries } from './openaq';
import { resetHealth } from '../core/health';

const location = { id: 1, name: 'Station', country: { name: 'Qatar' }, licenses: [{ id: 7 }],
  sensors: [{ id: 2, parameter: { name: 'pm25', units: 'µg/m³' } }], datetimeLast: { utc: '2020-01-01T00:00:00Z' } };
const licence = { id: 7, name: 'CC BY-SA', sourceUrl: 'https://licence.example', commercialUseAllowed: true,
  redistributionAllowed: true, modificationAllowed: true, shareAlikeRequired: true };
const options = { locationId: 1, sensorId: 2, from: '2024-01-01', to: '2024-01-02' };
beforeEach(() => { vi.stubEnv('OPENAQ_API_KEY', 'fixture'); resetHealth(); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function mockSource(allowed = true) {
  const fetch = vi.fn(async (url: string) => new Response(JSON.stringify({ results: url.includes('/licenses') ? [{ ...licence, modificationAllowed: allowed }] :
    url.includes('/locations') ? [location] : [
      { value: 0, parameter: { name: 'pm25', units: 'µg/m³' }, period: { datetimeFrom: { utc: '2024-01-01T00:00:00Z' } } },
      { value: null, period: { datetimeFrom: { utc: '2024-01-02T00:00:00Z' } }, flagInfo: { hasFlags: true } },
    ] }), { headers: { Date: 'Fri, 02 Oct 2026 00:00:00 GMT' } }));
  vi.stubGlobal('fetch', fetch); return fetch;
}
describe('OpenAQ measurements and rights', () => {
  it('preserves zero, missing values, dates, flags, source licence and stale station wording', async () => {
    mockSource(); const result = await fetchAirQualitySeries(options);
    expect(result.ok).toBe(true); if (!result.ok) return;
    expect(result.data[0].observations.map(o => o.value)).toEqual([0, null]);
    expect(result.data[0].observations[1].flag).toMatch(/flags/);
    expect(result.data[0].measureNote).toMatch(/historical readings/);
    expect(result.data[0].provenance.licence).toMatch(/share-alike/);
    expect(result.data[0].provenance.accessCheckedAt).toBe('2026-10-02T00:00:00.000Z');
  });
  it('never fetches readings when the station lacks permission to modify data', async () => {
    const fetch = mockSource(false); expect((await fetchAirQualitySeries(options)).ok).toBe(false);
    expect(fetch.mock.calls.some(([url]) => url.includes('/days'))).toBe(false);
  });
  it('never fetches a sensor that belongs to a different station', async () => {
    const fetch = mockSource(); expect((await fetchAirQualitySeries({ ...options, sensorId: 99 })).ok).toBe(false);
    expect(fetch.mock.calls.some(([url]) => url.includes('/days'))).toBe(false);
  });
  it('refuses wide or reversed date ranges before contacting any provider', async () => {
    const fetch = mockSource(); expect((await fetchAirQualitySeries({ ...options, to: '2025-01-01' })).ok).toBe(false);
    expect((await fetchAirQualitySeries({ ...options, to: '2023-01-01' })).ok).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
