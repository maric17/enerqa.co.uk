import type { DataSeries } from './types';

/**
 * p. 227: "Do not silently mix annual and monthly observations, modelled
 * estimates and national inventories, nominal and constant currency, or
 * different CO2e global warming potential horizons."
 *
 * Returns a plain-English reason when the series cannot share one table or
 * chart, or null when they can. The measure note is where connectors record the
 * basis (GWP horizon, currency basis, estimate vs inventory), so a differing
 * note is treated as a different measure, not a cosmetic difference. Exported
 * so charts apply exactly the same rule.
 */
export function mixedMeasureReason(series: DataSeries[]): string | null {
  const distinct = <T,>(pick: (s: DataSeries) => T) => [...new Set(series.map(pick))];
  const frequencies = distinct((s) => s.frequency);
  if (frequencies.length > 1) return `they are reported at different frequencies (${frequencies.join(' and ')})`;
  const units = distinct((s) => s.unit);
  if (units.length > 1) return `they use different units (${units.join(' and ')})`;
  if (distinct((s) => s.measureNote ?? '').length > 1) {
    return 'they are measured on different bases, such as different warming horizons, currency bases or estimate methods';
  }
  return null;
}

