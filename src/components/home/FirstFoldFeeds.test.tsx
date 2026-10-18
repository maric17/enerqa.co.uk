import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchNews, PAGE_NEWS_PROVIDERS, type NewsItem, type NewsResult } from '@/lib/api/news';
import { FeedsBody, FeedsFallback } from './FirstFoldFeeds';
import { HERO_CATEGORIES, selectHeroStories } from './firstFoldNews';

// Provider calls are stubbed so these checks exercise selection without spending credits.
vi.mock('@/lib/api/news', async importOriginal => ({ ...await importOriginal<typeof import('@/lib/api/news')>(), fetchNews: vi.fn() }));
const item = (id: string, title: string): NewsItem => ({
  id, url: `https://www.theguardian.com/${id}`, title, summary: null, domain: 'theguardian.com',
  publisher: 'The Guardian', provider: 'newsdata', providerLabel: 'NewsData.io',
  publishedAt: new Date(Date.now() - 3_600_000).toISOString(), retrievedAt: new Date().toISOString(),
  language: 'en', rights: '', regions: [], accessStatus: 'verified_open',
});
const result = (items: NewsItem[], failed = false, official = false): NewsResult => ({
  items, sources: [], availableRegions: [], availableLanguages: [], retrievedAt: new Date().toISOString(),
  unavailable: !items.length, sourcesFailed: failed, newsSourcesFailed: failed,
  providerStatus: official ? { eia_rss: failed ? 'unavailable' : 'ok' } : { newsdata: failed ? 'unavailable' : 'ok', gdelt: failed ? 'rate_limited' : 'ok' },
  hasDelayedSource: !!items.length, stale: false,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  vi.mocked(fetchNews).mockResolvedValue(result([], false, true));
});

describe('hero saved-feed integration', () => {
  it('selects one relevant story per domain without adding Markets to the hero', async () => {
    const stories = [item('c', 'Climate adaptation plan agreed'), item('e', 'Solar energy output record'),
      item('n', 'Forest biodiversity loss slows'), item('b', 'Green bond investment grows'), item('m', 'Energy prices climb')];
    vi.mocked(fetchNews).mockResolvedValueOnce(result(stories));
    render(await FeedsBody());
    expect(fetchNews).toHaveBeenNthCalledWith(1, 'all', 80, { maxPerPublisher: 10, providers: PAGE_NEWS_PROVIDERS });
    for (let index = 0; index < HERO_CATEGORIES.length; index++) {
      fireEvent.click(screen.getByRole('button', { name: HERO_CATEGORIES[index].label }));
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
      expect(screen.getByRole('heading', { name: stories[index].title })).toBeInTheDocument();
    }
    expect(fetchNews).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Major Markets' })).not.toBeInTheDocument();
  });

  it('does not let one publisher cap leave the later domains empty', () => {
    const stories = [item('c', 'Climate adaptation plan agreed'), item('e', 'Solar energy output record'),
      item('n', 'Forest biodiversity loss slows'), item('b', 'Green bond investment grows')];
    expect(selectHeroStories(stories).slice(0, 4).map(story => story?.id)).toEqual(['c', 'e', 'n', 'b']);
  });

  it('distinguishes an empty answered feed from an outage', async () => {
    vi.mocked(fetchNews).mockResolvedValueOnce(result([]));
    render(await FeedsBody());
    expect(screen.getByRole('heading', { name: 'No relevant updates are available.' })).toBeInTheDocument();
    expect(screen.queryByText('This source is temporarily unavailable.')).not.toBeInTheDocument();
  });

  it('rejects disallowed publishers and irrelevant stories before selecting hero images', () => {
    const unsafe = { ...item('blocked', 'Climate adaptation plan agreed'), domain: 'unknown.example' };
    expect(selectHeroStories([unsafe, item('sport', 'Team wins football final')])).toEqual([null, null, null, null]);
  });

  it('keeps category positions and a loading message before the database answers', () => {
    render(<FeedsFallback />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading the latest headlines');
    for (const category of HERO_CATEGORIES) expect(screen.getByRole('button', { name: category.label })).toBeDisabled();
  });
});
