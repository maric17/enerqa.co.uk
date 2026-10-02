import { describe, it, expect } from 'vitest';
import type { NewsItem } from '@/lib/api/news/types';
import {
  buildNewsViews,
  buildMarketView,
  formatDateTimeUtc,
  NEWS_FILTERS,
  shortTeaser,
  STORIES_PER_VIEW,
  toCard,
  withoutShown,
} from './firstFoldNews';

// A recent timestamp so the shared date gate (max 60 days old) accepts it.
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

function item(id: string, title: string, overrides: Partial<NewsItem> = {}): NewsItem {
  return {
    id: `https://www.reuters.com/${id}`,
    title,
    summary: null,
    url: `https://www.reuters.com/${id}`,
    domain: 'reuters.com',
    publisher: 'Reuters',
    publishedAt: hoursAgo(1),
    language: 'en',
    provider: 'gdelt',
    providerLabel: 'The GDELT Project',
    retrievedAt: hoursAgo(0.5),
    rights: '',
    regions: [],
    ...overrides,
  };
}

describe('H03 filters (p. 13)', () => {
  it('are the five approved labels, in order', () => {
    expect(NEWS_FILTERS.map((f) => f.label)).toEqual([
      'All',
      'Climate',
      'Energy',
      'Environment and Nature',
      'Business and Finance',
    ]);
  });
});

describe('formatDateTimeUtc (p. 13: publication date/time)', () => {
  it('shows day, month, year and time, in UTC', () => {
    expect(formatDateTimeUtc('2026-09-24T21:05:00Z')).toBe('24 Sept 2026, 21:05 UTC');
  });

  it('returns null rather than inventing a date', () => {
    expect(formatDateTimeUtc(null)).toBeNull();
    expect(formatDateTimeUtc('not a date')).toBeNull();
  });
});

describe('shortTeaser (p. 13: short teaser only)', () => {
  it('keeps a short licensed description unchanged', () => {
    expect(shortTeaser('Grid investment is shifting to integration.')).toBe('Grid investment is shifting to integration.');
  });

  it('cuts a long description on a word boundary, never mid-word', () => {
    const long = 'word '.repeat(80).trim();
    const out = shortTeaser(long, 50)!;
    expect(out.length).toBeLessThanOrEqual(51);
    expect(out.endsWith('word…')).toBe(true);
  });

  it('returns null for a missing or blank description', () => {
    expect(shortTeaser(null)).toBeNull();
    expect(shortTeaser('   ')).toBeNull();
  });
});

describe('toCard', () => {
  it('names the publisher, not its web address (p. 13)', () => {
    const card = toCard(item('a', 'Carbon market reform agreed', { publisher: 'Reuters', domain: 'reuters.com' }));
    expect(card.publisher).toBe('Reuters');
    expect(card.dateLabel).toMatch(/\d{4}, \d{2}:\d{2} UTC$/);
  });

  it('falls back to the domain only when no publisher name exists', () => {
    expect(toCard(item('b', 'Solar output record', { publisher: '' })).publisher).toBe('reuters.com');
  });
});

describe('buildNewsViews', () => {
  const guardian = (id: string) => ({ url: `https://www.theguardian.com/${id}`, domain: 'theguardian.com', publisher: 'The Guardian' });
  const pool = [
    item('climate-1', 'Climate adaptation plan agreed', { publishedAt: hoursAgo(1), ...guardian('climate-1') }),
    item('energy-1', 'Solar power output hits record', { publishedAt: hoursAgo(2) }),
    item('finance-1', 'Green bond investment in energy grows', { publishedAt: hoursAgo(3) }),
    item('nature-1', 'Forest biodiversity loss slows as emissions fall', { publishedAt: hoursAgo(4) }),
    item('energy-2', 'Wind turbine orders rise', { publishedAt: hoursAgo(5) }),
  ];

  it('builds one view per filter from the same pool, newest first, capped at the lead plus two', () => {
    const views = buildNewsViews(pool);
    expect(Object.keys(views)).toEqual(['all', 'climate', 'energy', 'environment', 'business']);
    expect(views.all.map((i) => i.id)).toHaveLength(STORIES_PER_VIEW);
    expect(views.all[0].title).toBe('Climate adaptation plan agreed');
  });

  it('only puts matching stories in a topic view', () => {
    const views = buildNewsViews(pool);
    expect(views.energy.map((i) => i.title)).toContain('Solar power output hits record');
    expect(views.energy.map((i) => i.title)).not.toContain('Climate adaptation plan agreed');
    expect(views.business.map((i) => i.title)).toEqual(['Green bond investment in energy grows']);
  });

  it('caps each publisher at two stories per view, so one outlet cannot fill the panel', () => {
    const views = buildNewsViews([
      item('r1', 'Energy prices climb'),
      item('r2', 'Solar output rises'),
      item('r3', 'Wind orders rise'),
    ]);
    expect(views.all).toHaveLength(2);
  });

  it('applies the shared gate: no paywalled/unknown domains, no duplicates', () => {
    const views = buildNewsViews([
      item('x', 'Energy prices climb', { domain: 'paywalled.example', url: 'https://paywalled.example/x' }),
      item('y', 'Energy prices climb'),
      item('y', 'Energy prices climb'),
    ]);
    expect(views.all).toHaveLength(1);
    expect(views.all[0].domain).toBe('reuters.com');
  });
});

describe('withoutShown', () => {
  it('keeps Major Markets from repeating a story Global News already shows', () => {
    const a = item('a', 'Energy investment rises');
    const b = item('b', 'Climate finance pledges grow');
    const c = item('c', 'Green bond market expands');
    expect(withoutShown([a, b, c], [a], 2).map((i) => i.id)).toEqual([b.id, c.id]);
  });
});

describe('buildMarketView', () => {
  it('finds market stories in the shared pool without repeating Global News', () => {
    const lead = item('lead', 'Climate adaptation plan agreed');
    const prices = item('prices', 'Energy prices climb');
    const bonds = item('bonds', 'Green bond investment grows');
    const nature = item('nature', 'Forest biodiversity loss slows');
    expect(buildMarketView([lead, prices, bonds, nature], [lead])).toEqual([prices, bonds]);
  });

  it('removes shown articles before applying the publisher cap', () => {
    const shown = [item('a', 'Energy investment rises'), item('b', 'Carbon markets expand')];
    const remaining = [item('c', 'Green bond investment grows'), item('d', 'Solar energy prices fall')];
    expect(buildMarketView([...shown, ...remaining], shown)).toEqual(remaining);
  });

  it('keeps unrelated business stories and non-financial nature stories out', () => {
    expect(buildMarketView([item('debt', 'Data centre debt rises'), item('nature', 'Forest biodiversity loss slows')], [])).toEqual([]);
  });
});
