import { describe, expect, it } from 'vitest';
import { matchIndicators } from './explorer';
import { aggregateTimePeriods, availableTimePeriod, effectiveTimePeriod, timeCoordinate, valueAxisBounds } from './timePeriods';

describe('Explorer time periods', () => {
  it('averages by country and calendar period, preserving zero and missing periods', () => {
    const data = matchIndicators([
      { geo: 'afg', time: '2024-01-01', value: 0 },
      { geo: 'afg', time: '2024-01-02', value: 100 },
      { geo: 'afg', time: '2024-01-08', value: 20 },
      { geo: 'afg', time: '2024-02-01', value: 80 },
      { geo: 'alb', time: '2024-01-01', value: -10 },
    ], null);
    expect(aggregateTimePeriods(data, 'daily')).toHaveLength(5);
    expect(aggregateTimePeriods(data, 'weekly').filter(o => o.geo === 'afg').map(o => [o.time, o.value])).toEqual([
      ['2024-01-01', 50], ['2024-01-08', 20], ['2024-01-29', 80],
    ]);
    expect(aggregateTimePeriods(data, 'monthly').map(o => [o.geo, o.time, o.value])).toEqual([
      ['afg', '2024-01', 40], ['alb', '2024-01', -10], ['afg', '2024-02', 80],
    ]);
    expect(aggregateTimePeriods(data, 'yearly').map(o => [o.geo, o.time, o.value])).toEqual([
      ['afg', '2024', 50], ['alb', '2024', -10],
    ]);
  });

  it('uses Monday weeks across year boundaries and accepts leap days', () => {
    const data = matchIndicators([
      { geo: 'afg', time: '2023-12-31', value: 10 },
      { geo: 'afg', time: '2024-01-01', value: 20 },
      { geo: 'afg', time: '2024-02-29', value: 30 },
    ], null);
    expect(aggregateTimePeriods(data, 'weekly').map(o => o.time)).toEqual(['2023-12-25', '2024-01-01', '2024-02-26']);
    expect(timeCoordinate('2023-02-29')).toBeNaN();
    expect(timeCoordinate('2024-13')).toBeNaN();
    expect(timeCoordinate('not a date')).toBeNaN();
  });

  it('groups timestamps in UTC instead of the browser time zone', () => {
    const data = matchIndicators([
      { geo: 'afg', time: '2024-03-01T00:30:00+02:00', value: 10 },
      { geo: 'afg', time: '2024-02-29T23:30:00Z', value: 30 },
    ], null);
    expect(aggregateTimePeriods(data, 'daily').map(o => [o.time, o.value])).toEqual([['2024-02-29', 20]]);
    expect(timeCoordinate('2024-02-29T23:30:00')).toBe(timeCoordinate('2024-02-29T23:30:00Z'));
  });

  it('keeps yearly and monthly sources at their available precision', () => {
    const yearly = [{ geo: 'afg', time: '2000', value: 60 }];
    const monthly = [{ geo: 'afg', time: '2024-01', value: 20 }];
    expect(availableTimePeriod(yearly)).toBe('yearly');
    expect(effectiveTimePeriod('daily', availableTimePeriod(yearly))).toBe('yearly');
    expect(aggregateTimePeriods(matchIndicators(yearly, null), 'yearly')[0]).toEqual({ ...yearly[0], x: 2000 });
    expect(effectiveTimePeriod('weekly', availableTimePeriod(monthly))).toBe('monthly');
    expect(effectiveTimePeriod('yearly', availableTimePeriod(monthly))).toBe('yearly');
  });

  it('pairs exact dates before averaging two indicators', () => {
    const paired = matchIndicators([
      { geo: 'afg', time: '2024-01-01', value: 0 },
      { geo: 'afg', time: '2024-01-02', value: 100 },
      { geo: 'afg', time: '2024-01-03', value: 999 },
    ], [
      { geo: 'AFG', time: '2024-01-01', value: 10 },
      { geo: 'AFG', time: '2024-01-02', value: 30 },
      { geo: 'AFG', time: '2024-01-04', value: 999 },
    ]);
    expect(aggregateTimePeriods(paired, 'monthly')).toEqual([{ geo: 'afg', time: '2024-01', value: 50, x: 20 }]);
  });

  it('rescales with aggregates and keeps constant, empty and signed bars visible', () => {
    const data = matchIndicators([
      { geo: 'afg', time: '2024-01-01', value: 0 },
      { geo: 'afg', time: '2024-01-02', value: 100 },
    ], null);
    expect(valueAxisBounds(data, false)).toEqual({ min: -10, max: 110 });
    expect(valueAxisBounds(aggregateTimePeriods(data, 'monthly'), false)).toEqual({ min: 45, max: 55 });
    expect(valueAxisBounds(data, true)).toEqual({ min: 0, max: 110 });
    expect(valueAxisBounds([{ geo: 'afg', time: '2024', value: -10 }], true)).toEqual({ min: -11, max: 0 });
    expect(valueAxisBounds([{ geo: 'afg', time: '2024', value: 0 }], true)).toEqual({ min: 0, max: 0.1 });
    expect(valueAxisBounds([], false)).toEqual({ min: 0, max: 1 });
  });
});
