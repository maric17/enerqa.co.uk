import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchNews, type NewsItem, type NewsResult } from '@/lib/api/news';
import { MarketsCommentary } from './MajorMarkets';

// Keep tests on the saved-feed selection path; no live upstream requests.
vi.mock('@/lib/api/news', async original => ({ ...await original<typeof import('@/lib/api/news')>(), fetchNews: vi.fn() }));
const item = (id: string, title: string, provider: 'thenewsapi' | 'eia_rss' = 'thenewsapi'): NewsItem => ({
  id, title, summary: 'A short licensed market report.', url: `https://${provider === 'eia_rss' ? 'www.eia.gov' : 'www.theguardian.com'}/${id}`,
  domain: provider === 'eia_rss' ? 'eia.gov' : 'theguardian.com', publisher: provider === 'eia_rss' ? 'U.S. EIA' : 'The Guardian',
  provider, providerLabel: provider, publishedAt: new Date(Date.now() - 3600000).toISOString(), retrievedAt: new Date().toISOString(),
  language: 'en', rights: '', regions: [], accessStatus: 'verified_open',
});
const result = (items: NewsItem[], failed = false): NewsResult => ({
  items, sources: [], availableRegions: [], availableLanguages: [], retrievedAt: new Date().toISOString(),
  unavailable: !items.length, sourcesFailed: failed, newsSourcesFailed: failed,
  providerStatus: { thenewsapi: failed ? 'unavailable' : 'ok' },
  hasDelayedSource: false, stale: false,
});
beforeEach(() => vi.clearAllMocks());

describe('separate Major Markets commentary', () => {
  it('shows TheNewsAPI market commentary when the wider news pool is empty', async () => {
    vi.mocked(fetchNews).mockResolvedValueOnce(result([], true)).mockResolvedValueOnce(result([item('prices', 'Natural gas prices fall')], false));
    render(await MarketsCommentary());
    expect(screen.getByRole('link', { name: /Natural gas prices fall/ })).toHaveAttribute('href', 'https://www.theguardian.com/prices');
    expect(fetchNews).toHaveBeenLastCalledWith('business', 2, { providers: ['thenewsapi'], maxPerPublisher: 10 });
    expect(screen.queryByText('This source is temporarily unavailable.')).not.toBeInTheDocument();
  });

  it('prefers the newest available market reporting, with honest timestamps', async () => {
    vi.mocked(fetchNews).mockResolvedValueOnce(result([])).mockResolvedValueOnce(result([
      { ...item('old', 'Natural gas prices fall'), publishedAt: new Date(Date.now() - 86400000).toISOString() },
      item('new', 'Diesel prices rise'),
    ], false));
    render(await MarketsCommentary());
    expect(screen.getAllByRole('heading', { level: 4 }).map(heading => heading.textContent)).toEqual([
      expect.stringContaining('Diesel prices rise'), expect.stringContaining('Natural gas prices fall'),
    ]);
    expect(screen.getAllByText(/Updated/)).toHaveLength(2);
  });

  it('keeps the commentary when it also happens to be the only finance-domain story', async () => {
    vi.mocked(fetchNews).mockResolvedValueOnce(result([item('bond', 'Green bond investment grows')])).mockResolvedValueOnce(result([], false));
    render(await MarketsCommentary());
    expect(screen.getByRole('link', { name: /Green bond investment grows/ })).toBeInTheDocument();
    expect(screen.queryByText(/NewsData delayed/)).not.toBeInTheDocument();
  });

  it('reports an outage only when every relevant provider fails', async () => {
    vi.mocked(fetchNews).mockResolvedValueOnce(result([], true)).mockResolvedValueOnce(result([], true));
    render(await MarketsCommentary());
    expect(screen.getByText('This source is temporarily unavailable.')).toBeInTheDocument();
  });

  it('distinguishes an answered empty feed from an outage', async () => {
    vi.mocked(fetchNews).mockResolvedValueOnce(result([])).mockResolvedValueOnce(result([], false));
    render(await MarketsCommentary());
    expect(screen.getByText('No relevant updates are available.')).toBeInTheDocument();
  });
});
