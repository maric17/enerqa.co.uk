import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchNewsForKeywords, type NewsResult } from '@/lib/api/news';
import { INDUSTRY_FEEDS, newsPhrases } from '@/lib/feeds/contextual';
import { IndustryHeadlines } from './IndustryHero';

// Keep sector selection tests independent of database availability and provider credits.
vi.mock('@/lib/api/news', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/api/news')>(), fetchNewsForKeywords: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});

describe('industry hero saved-news integration', () => {
  it.each(Object.keys(INDUSTRY_FEEDS))('uses the configured sector phrases for %s', async slug => {
    vi.mocked(fetchNewsForKeywords).mockResolvedValue({ items: [], sourcesFailed: false } as unknown as NewsResult);
    render(await IndustryHeadlines({ industry: { title: slug, slug } }));
    expect(fetchNewsForKeywords).toHaveBeenCalledExactlyOnceWith(newsPhrases(INDUSTRY_FEEDS[slug]), 3, {
      baskets: INDUSTRY_FEEDS[slug].newsBaskets,
    });
    expect(screen.getByRole('heading', { name: 'No relevant updates are available.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View All Industry News/ })).toHaveAttribute('href', `/knowledge-hub/global-intelligence?industry=${slug}`);
  });

  it('shows an outage honestly instead of inserting unrelated stories', async () => {
    vi.mocked(fetchNewsForKeywords).mockResolvedValue({ items: [], sourcesFailed: true } as unknown as NewsResult);
    render(await IndustryHeadlines({ industry: { title: 'Energy & Utilities', slug: 'energy-utilities' } }));
    expect(screen.getByRole('heading', { name: 'This source is temporarily unavailable.' })).toBeInTheDocument();
  });

  it('retains the source, timestamp and cache notice for a saved headline', async () => {
    vi.mocked(fetchNewsForKeywords).mockResolvedValue({ sourcesFailed: false, items: [{
      id: 'solar', title: 'Solar energy investment grows', url: 'https://www.theguardian.com/solar',
      summary: 'A licensed teaser.', publisher: 'The Guardian', domain: 'theguardian.com',
      provider: 'thenewsapi', providerLabel: 'TheNewsAPI', imageUrl: null,
      publishedAt: '2026-10-20T05:00:00Z', retrievedAt: '2026-10-20T06:00:00Z',
      feedRefreshedAt: '2026-10-20T07:00:00Z', refreshFailed: true,
    }] } as unknown as NewsResult);
    render(await IndustryHeadlines({ industry: { title: 'Energy & Utilities', slug: 'energy-utilities' } }));
    expect(screen.getByRole('link', { name: /Solar energy investment grows/ })).toHaveAttribute('href', 'https://www.theguardian.com/solar');
    expect(screen.getByText('The Guardian')).toBeInTheDocument();
    expect(screen.getByText(/Via TheNewsAPI/)).toHaveTextContent('Updated 20 Oct 2026, 07:00 UTC.');
    expect(screen.getByText(/Via TheNewsAPI/)).toHaveTextContent('Cached headline; refresh unavailable.');
  });
});
