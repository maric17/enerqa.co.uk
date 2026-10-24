import { describe, expect, it } from 'vitest';
import { INDUSTRY_FEEDS, DOMAIN_FEEDS } from '../../feeds/contextual';
import { LIMITS } from '../core/health';
import { NEWS_BASKETS } from './types';
import { basketQuery } from './newsdata';
import { industryDiscoveryQueries, industryRefreshJob, industryRefreshSlugs } from './discovery';

describe('industry discovery coverage and provider budgets', () => {
  const slots = ['2026-10-11T06:00:00+08:00', '2026-10-11T14:00:00+08:00', '2026-10-11T22:00:00+08:00'];

  it('covers all thirteen industries once in every cycle with stable 5/5/3 jobs', () => {
    const batches = ([1, 2, 3] as const).map(industryRefreshSlugs);
    expect(batches.map(batch => batch.length)).toEqual([5, 5, 3]);
    expect(batches.flat()).toEqual(Object.keys(INDUSTRY_FEEDS));
    for (const batch of [1, 2, 3] as const) {
      for (const slug of batches[batch - 1]) expect(industryRefreshJob(slug)).toBe(`industries-${batch}`);
    }
    expect(industryRefreshJob('unknown')).toBeUndefined();
    // Four topic calls, three stock calls and thirteen industry calls per cycle.
    expect((4 + 3 + batches.flat().length) * 3).toBe(60);
    expect(60).toBeLessThan(LIMITS.apitube!.daily);
  });

  it('searches every sector exactly once per scheduled day within the existing limits', () => {
    const topics = NEWS_BASKETS.filter(basket => basket.newsdataQuery).length;
    const domains = new Set(Object.values(DOMAIN_FEEDS).flatMap(feed => feed.newsBaskets.map(basketQuery))).size;
    const batches = slots.map(slot => industryDiscoveryQueries(Date.parse(slot)));
    const all = Object.values(INDUSTRY_FEEDS).map(feed => feed.newsDiscoveryQuery);
    expect(all).toHaveLength(13);
    expect(batches.flat()).toEqual(all);
    expect(new Set(batches.flat()).size).toBe(all.length);
    const requests = batches.map(queries => topics + domains + queries.length);
    expect(requests).toEqual([21, 21, 19]);
    for (const count of requests) expect(count).toBeLessThanOrEqual(LIMITS.newsdata!.window!.max);
    expect(requests.reduce((sum, count) => sum + count, 0)).toBeLessThanOrEqual(LIMITS.newsdata!.daily);
  });

  it('keeps a delayed invocation in its original slot and wraps correctly at Manila midnight', () => {
    for (const slot of slots) {
      const now = Date.parse(slot);
      expect(industryDiscoveryQueries(now + 59 * 60_000)).toEqual(industryDiscoveryQueries(now));
    }
    expect(industryDiscoveryQueries(Date.parse('2026-10-12T01:00:00+08:00')))
      .toEqual(industryDiscoveryQueries(Date.parse(slots[2])));
    expect(industryDiscoveryQueries(Date.parse('2026-10-12T06:00:00+08:00')))
      .toEqual(industryDiscoveryQueries(Date.parse(slots[0])));
  });

  it('keeps all manual discovery queries under the free-plan query and rolling limits', () => {
    const all = industryDiscoveryQueries(Date.now(), true);
    expect(all).toHaveLength(13);
    expect(all.length).toBeLessThanOrEqual(LIMITS.newsdata!.window!.max);
    for (const query of all) {
      expect(query.length).toBeLessThanOrEqual(100);
      expect(query).toContain(' AND ');
    }
  });
});
