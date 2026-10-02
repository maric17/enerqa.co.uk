import type { ChartObservation, Observation } from './explorer';

export const TIME_PERIODS = [
  { value: 'daily', label: 'Daily', axis: 'Day' },
  { value: 'weekly', label: 'Weekly', axis: 'Week (starting Monday)' },
  { value: 'monthly', label: 'Monthly', axis: 'Month' },
  { value: 'yearly', label: 'Yearly', axis: 'Year' },
] as const;
export type TimePeriod = typeof TIME_PERIODS[number]['value'];

function parseTime(time: string): { date: Date; precision: TimePeriod } | null {
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?(T.*)?$/.exec(time);
  if (!match || (match[4] && !match[3])) return null;
  const day = `${match[1]}-${match[2] ?? '01'}-${match[3] ?? '01'}`;
  const date = new Date(`${day}T00:00:00Z`);
  // Reject invalid calendar dates instead of letting JavaScript roll them forward.
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== day) return null;
  if (match[4]) {
    // Treat unzoned source timestamps as UTC so browser time zones agree.
    const timestamp = new Date(/[Zz]|[+-]\d{2}:?\d{2}$/.test(time) ? time : `${time}Z`);
    if (!Number.isFinite(timestamp.getTime())) return null;
    return { date: timestamp, precision: 'daily' };
  }
  return { date, precision: match[3] ? 'daily' : match[2] ? 'monthly' : 'yearly' };
}

export function timeCoordinate(time: string): number {
  const parsed = parseTime(time);
  // Keep existing annual comparison coordinates while also accepting dated data.
  return parsed ? parsed.precision === 'yearly' ? Number(time) : parsed.date.getTime() : NaN;
}

export function availableTimePeriod(observations: Observation[]): TimePeriod {
  let period: TimePeriod = 'daily';
  for (const observation of observations) {
    const precision = parseTime(observation.time)?.precision;
    if (precision === 'yearly') return 'yearly';
    if (precision === 'monthly') period = 'monthly';
  }
  return period;
}

export function effectiveTimePeriod(requested: TimePeriod, available: TimePeriod): TimePeriod {
  const index = (period: TimePeriod) => TIME_PERIODS.findIndex(option => option.value === period);
  // A coarser source cannot supply real observations for a finer view.
  return index(available) > index(requested) ? available : requested;
}

export function aggregateTimePeriods(observations: ChartObservation[], period: TimePeriod): ChartObservation[] {
  const groups = new Map<string, { geo: string; time: string; value: number; x: number; count: number }>();
  for (const observation of observations) {
    const parsed = parseTime(observation.time);
    if (!parsed || !Number.isFinite(observation.value) || !Number.isFinite(observation.x)) continue;
    const date = parsed.date;
    // Use Monday boundaries in UTC, including weeks that cross a year boundary.
    if (period === 'weekly') date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
    const time = date.toISOString().slice(0, period === 'yearly' ? 4 : period === 'monthly' ? 7 : 10);
    const key = `${observation.geo.toLowerCase()}\t${time}`;
    const group = groups.get(key) ?? { geo: observation.geo, time, value: 0, x: 0, count: 0 };
    group.value += observation.value;
    group.x += observation.x;
    group.count++;
    groups.set(key, group);
  }
  // Average matched observations on both axes; missing periods stay missing.
  return Array.from(groups.values(), group => ({
    geo: group.geo, time: group.time, value: group.value / group.count, x: group.x / group.count,
  })).sort((a, b) => a.time.localeCompare(b.time) || a.geo.localeCompare(b.geo));
}

export function valueAxisBounds(observations: Observation[], includeZero: boolean): { min: number; max: number } {
  let min = includeZero ? 0 : Infinity;
  let max = includeZero ? 0 : -Infinity;
  for (const { value } of observations) {
    if (!Number.isFinite(value)) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1 };
  // Pad the current values; a constant or all-zero series still needs a visible range.
  const padding = (max - min || Math.abs(max) || 1) * 0.1;
  return { min: includeZero && min === 0 ? 0 : min - padding, max: includeZero && max === 0 && min < 0 ? 0 : max + padding };
}
