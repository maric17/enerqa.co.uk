import { describe, it, expect } from 'vitest';
import type { DataSeries } from '@/lib/api/core/types';
import { selectSeries, readSelection } from './selection';
import { seriesToCsv } from '@/lib/api/core/csv';
import { datasetConnector } from './dataset';

const series: DataSeries = { id: 'qatar', label: 'Solar resource', unit: 'kWh/m²/day', frequency: 'annual', area: 'Qatar', measureNote: null,
  observations: [{ period: '2020', value: 4 }, { period: '2021', value: null }, { period: '2022', value: -2 }],
  provenance: { providerId: 'nasa-power', providerName: 'NASA POWER', sourceId: 'solar', sourceUrl: 'https://power.larc.nasa.gov/',
    sourceReleasedAt: null, observationPeriod: '2020–2022', retrievedAt: '2026-10-01', version: null, licence: 'Public domain', licenceUrl: null,
    attribution: 'NASA POWER', accessStatus: 'verified_open', accessCheckedAt: '2026-10-01', accessEvidence: 'Public API', transformations: [] },
};
describe('dataset selection shared by chart, table and export', () => {
  it('keeps precisely the selected geography, series and period, including missing values', () => {
    const selected = selectSeries([series, { ...series, id: 'germany', area: 'Germany' }], readSelection(new URLSearchParams('area=Qatar&from=2021&to=2022')));
    expect(selected).toHaveLength(1);
    expect(selected[0].observations).toEqual([{ period: '2021', value: null }, { period: '2022', value: -2 }]);
    const csv = seriesToCsv(selected);
    expect(csv).toContain('Solar resource,Qatar,2021,,kWh/m²/day');
    expect(csv).toContain('Solar resource,Qatar,2022,-2,kWh/m²/day');
    expect(csv).not.toContain('Solar resource,Qatar,2020,');
    expect(csv).toContain('# Attribution: NASA POWER');
  });
  it('returns no data rather than silently substituting a different selection', () => {
    expect(selectSeries([series], { series: 'invented' })).toEqual([]);
    expect(selectSeries([series], { from: '2022', to: '2020' })).toEqual([]);
  });
  it('allows only registered local connector paths, preserving the CMS indicator', () => {
    expect(datasetConnector({ apiEndpoint: null, datasetDownloadUrl: '/api/data/world-bank-indicator?indicator=adjustedNetSavings' })?.params.get('indicator')).toBe('adjustedNetSavings');
    expect(datasetConnector({ apiEndpoint: 'https://attacker.invalid/data', datasetDownloadUrl: null })).toBeNull();
    expect(datasetConnector({ apiEndpoint: '/api/data/__proto__', datasetDownloadUrl: null })).toBeNull();
  });
});

it('includes all observations within a selected year or day', () => {
  // Boundaries describe whole periods rather than stopping at their first instant.
  const monthly = { ...series, observations: [{ period: '2024-01', value: 1 }, { period: '2024-12', value: 2 }, { period: '2025-01', value: 3 }] };
  expect(selectSeries([monthly], { from: '2024', to: '2024' })[0].observations).toHaveLength(2);
  const daily = { ...series, observations: [{ period: '2024-01-01T09:00:00Z', value: 1 }] };
  expect(selectSeries([daily], { from: '2024-01-01', to: '2024-01-01' })[0].observations).toHaveLength(1);
});
