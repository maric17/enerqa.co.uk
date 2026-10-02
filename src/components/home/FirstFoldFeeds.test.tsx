import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchNews, PAGE_NEWS_PROVIDERS, type NewsItem, type NewsResult } from '@/lib/api/news';
import { FeedsBody } from './FirstFoldFeeds';

// Stub provider traffic so these checks cover homepage selection without spending credits.
vi.mock('@/lib/api/news', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/api/news')>(),
  fetchNews: vi.fn(),
}));

function item(id: string, title: string): NewsItem {
  const url = `https://www.theguardian.com/${id}`;
  return {
    id: url, url, title, summary: null, domain: 'theguardian.com',
    publisher: 'The Guardian', provider: 'newsdata', providerLabel: 'NewsData.io',
    publishedAt: new Date(Date.now() - 3_600_000).toISOString(),
    retrievedAt: new Date().toISOString(), language: 'en', rights: '', regions: [],
    accessStatus: 'verified_open',
  };
}

function result(items: NewsItem[], sourcesFailed = false, official = false): NewsResult {
  return {
    items, sources: [], availableRegions: [], availableLanguages: [],
    retrievedAt: new Date().toISOString(), unavailable: items.length === 0,
    sourcesFailed, newsSourcesFailed: sourcesFailed,
    providerStatus: official
      ? { eia_rss: sourcesFailed ? 'unavailable' : 'ok' }
      : sourcesFailed
        ? { newsdata: 'unavailable', gdelt: 'rate_limited' }
        : { newsdata: 'ok', gdelt: 'ok' },
    hasDelayedSource: items.length > 0, stale: false,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  // EIA is empty by default; each scenario supplies its own news-pool result first.
  vi.mocked(fetchNews).mockResolvedValue(result([], false, true));
});

function eiaItem(id: string, title: string): NewsItem {
  const url = `https://www.eia.gov/todayinenergy/detail.php?id=${id}`;
  return {
    ...item(id, title), id: url, url, domain: 'eia.gov',
    publisher: 'U.S. Energy Information Administration',
    provider: 'eia_rss', providerLabel: 'U.S. EIA',
  };
}

describe('homepage news and markets', () => {
  it('uses one news-only pool and shows market stories discovered in other topic feeds', async () => {
    // Two Guardian headlines fill its Global News cap; its energy-price story belongs in Markets.
    vi.mocked(fetchNews).mockResolvedValueOnce(result([
      item('climate', 'Climate adaptation plan agreed'),
      item('nature', 'Forest biodiversity loss slows'),
      item('energy', 'Energy prices climb'),
    ]));
    render(await FeedsBody());

    expect(fetchNews).toHaveBeenNthCalledWith(1, 'all', 80, {
      maxPerPublisher: 10, providers: PAGE_NEWS_PROVIDERS,
    });
    const markets = screen.getByRole('region', { name: 'Major Markets' });
    // Both panels keep thumbnails even when their provider supplies no image.
    expect(markets.querySelectorAll('[data-news-thumbnail]')).toHaveLength(1);
    expect(screen.getByRole('region', { name: 'Global News' }).querySelectorAll('[data-news-thumbnail]')).toHaveLength(2);
    expect(within(markets).getByText('Energy prices climb')).toBeInTheDocument();
    expect(within(markets).queryByText('Climate adaptation plan agreed')).not.toBeInTheDocument();
    expect(screen.queryByText('No relevant updates are available.')).not.toBeInTheDocument();
  });

  it('reports an outage when the requested news providers fail', async () => {
    vi.mocked(fetchNews)
      .mockResolvedValueOnce(result([], true))
      .mockResolvedValueOnce(result([], true, true));
    render(await FeedsBody());

    expect(screen.getAllByText('This source is temporarily unavailable.')).toHaveLength(2);
    expect(screen.getByText(/External news sources are unavailable right now/)).toBeInTheDocument();
    expect(screen.queryByText('No relevant updates are available.')).not.toBeInTheDocument();
  });

  it('does not call an answered but empty feed an outage', async () => {
    vi.mocked(fetchNews).mockResolvedValueOnce(result([]));
    render(await FeedsBody());

    expect(screen.getAllByText('No relevant updates are available.')).toHaveLength(2);
    expect(screen.queryByText(/External news sources are unavailable right now/)).not.toBeInTheDocument();
  });

  it('fills an empty market panel with verified EIA price commentary', async () => {
    const prices = eiaItem('1', 'Natural gas prices fall');
    const diesel = eiaItem('2', 'What goes into diesel prices?');
    vi.mocked(fetchNews)
      .mockResolvedValueOnce(result([]))
      .mockResolvedValueOnce(result([prices, diesel], false, true));
    render(await FeedsBody());

    const markets = screen.getByRole('region', { name: 'Major Markets' });
    expect(within(markets).getByRole('link', { name: /Natural gas prices fall/ })).toHaveAttribute('href', prices.url);
    expect(within(markets).getByText('What goes into diesel prices?')).toBeInTheDocument();
    expect(within(markets).getByText('EIA commentary focuses on U.S. energy markets.')).toBeInTheDocument();
    expect(within(markets).getAllByText('U.S. Energy Information Administration')).toHaveLength(2);
    expect(markets.querySelectorAll('[data-news-thumbnail]')).toHaveLength(2);
    expect(within(markets).queryByText('No relevant updates are available.')).not.toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Global News' })).queryByText(prices.title)).not.toBeInTheDocument();
    expect(fetchNews).toHaveBeenNthCalledWith(2, 'business', 2, {
      providers: ['eia_rss'], maxPerPublisher: 10,
    });
    expect(screen.getByRole('link', { name: 'U.S. EIA' })).toBeInTheDocument();
  });

  it('keeps Markets populated when the news providers fail but EIA answers', async () => {
    vi.mocked(fetchNews)
      .mockResolvedValueOnce(result([], true))
      .mockResolvedValueOnce(result([eiaItem('1', 'Natural gas prices fall')], false, true));
    render(await FeedsBody());

    expect(screen.getAllByText('This source is temporarily unavailable.')).toHaveLength(1);
    expect(within(screen.getByRole('region', { name: 'Major Markets' })).getByText('Natural gas prices fall')).toBeInTheDocument();
    expect(screen.queryByText(/External news sources are unavailable right now/)).not.toBeInTheDocument();
  });

  it('keeps news commentary first and uses EIA to fill the remaining slot', async () => {
    vi.mocked(fetchNews)
      .mockResolvedValueOnce(result([
        item('climate', 'Climate adaptation plan agreed'),
        item('nature', 'Forest biodiversity loss slows'),
        item('market', 'Green bond investment grows'),
      ]))
      .mockResolvedValueOnce(result([
        eiaItem('1', 'Natural gas prices fall'),
        eiaItem('2', 'What goes into diesel prices?'),
      ], false, true));
    render(await FeedsBody());

    const markets = screen.getByRole('region', { name: 'Major Markets' });
    expect(within(markets).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Green bond investment grows', 'Natural gas prices fall',
    ]);
  });

  it('skips the fallback feed when the news pool already fills Markets', async () => {
    vi.mocked(fetchNews).mockResolvedValueOnce(result([
      item('climate', 'Climate adaptation plan agreed'),
      item('nature', 'Forest biodiversity loss slows'),
      item('market', 'Green bond investment grows'),
      item('prices', 'Energy prices climb'),
    ]));
    render(await FeedsBody());

    expect(fetchNews).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('EIA commentary focuses on U.S. energy markets.')).not.toBeInTheDocument();
  });
});
