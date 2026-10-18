import type { DataSeries } from '@/lib/api/core/types';

export type Selection = { series?: string; area?: string; from?: string; to?: string };

/** Filters only observations actually returned by the configured connector. */
export function selectSeries(data: DataSeries[], selection: Selection): DataSeries[] {
  return data.filter(s => (!selection.series || s.id === selection.series) && (!selection.area || s.area === selection.area))
    .map(s => ({ ...s, observations: s.observations.filter(o => (!selection.from || periodFor(o.period, selection.from) >= selection.from) && (!selection.to || periodFor(o.period, selection.to) <= selection.to)) }))
    .filter(s => s.observations.length > 0);
}

export function readSelection(params: URLSearchParams): Selection {
  return Object.fromEntries(['series', 'area', 'from', 'to'].map(key => [key, (params.get(key) ?? '').slice(0, 200)]));
}

// A selected year/day includes all months/hours within that period.
function periodFor(period: string, boundary: string) {
  return /^\d{4}(?:-\d{2}){0,2}$/.test(boundary) ? period.slice(0, boundary.length) : period;
}
