import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createNewsDiagnostics } from '@/lib/api/news/diagnostics';
import { GlobalNewsPanel } from './GlobalNewsPanel';
import { NEWS_FILTERS, type NewsCardData } from './firstFoldNews';

const card = (id: string, title: string, teaser: string | null = null): NewsCardData => ({
  id,
  title,
  teaser,
  url: `https://www.reuters.com/${id}`,
  publisher: 'Reuters',
  publishedAt: '2026-09-24T21:05:00Z',
  dateLabel: '24 Sept 2026, 21:05 UTC',
});

const views = {
  all: [card('a', 'Climate adaptation plan agreed', 'A short licensed teaser.'), card('b', 'Solar output record'), card('c', 'Green bond market grows')],
  climate: [card('a', 'Climate adaptation plan agreed')],
  energy: [card('b', 'Solar output record')],
  environment: [],
  business: [card('c', 'Green bond market grows')],
};

const head = <h2 id="h03-global-news">Global News</h2>;

describe('GlobalNewsPanel (H03, p. 13)', () => {
  it('prints safe feed diagnostics only when the browser opts in', () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const diagnostics = createNewsDiagnostics('all');
    const originalUrl = window.location.href;
    try {
      window.history.replaceState(null, '', '/');
      const normal = render(<GlobalNewsPanel head={head} filters={NEWS_FILTERS} views={views} sourcesFailed={false} diagnostics={diagnostics} />);
      expect(log).not.toHaveBeenCalled();
      normal.unmount();
      window.history.replaceState(null, '', '/?newsDebug=1');
      render(<GlobalNewsPanel head={head} filters={NEWS_FILTERS} views={views} sourcesFailed={false} diagnostics={diagnostics} />);
      expect(log).toHaveBeenCalledWith('[enerqa:news:homepage]', expect.any(String));
      expect(JSON.parse(log.mock.calls[0][1])).toMatchObject({ viewCounts: { all: 3, environment: 0 }, diagnostics });
    } finally {
      window.history.replaceState(null, '', originalUrl);
      log.mockRestore();
    }
  });

  it('shows the lead story plus two shorter ones, with publisher and date/time', () => {
    render(<GlobalNewsPanel head={head} filters={NEWS_FILTERS} views={views} sourcesFailed={false} />);
    const region = screen.getByRole('region', { name: 'Global News' });
    expect(within(region).getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(within(region).getAllByText('Reuters')).toHaveLength(3);
    expect(within(region).getAllByText('24 Sept 2026, 21:05 UTC')[0]).toHaveAttribute('datetime', '2026-09-24T21:05:00Z');
    // Only the lead card carries a teaser.
    expect(screen.getByText('A short licensed teaser.')).toBeInTheDocument();
  });

  it('filters the panel in place, with an active state, instead of linking away', () => {
    render(<GlobalNewsPanel head={head} filters={NEWS_FILTERS} views={views} sourcesFailed={false} />);
    const all = screen.getByRole('button', { name: 'All' });
    const energy = screen.getByRole('button', { name: 'Energy' });
    expect(all).toHaveAttribute('aria-pressed', 'true');
    expect(energy).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(energy);

    expect(energy).toHaveAttribute('aria-pressed', 'true');
    expect(all).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { name: 'Solar output record' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Climate adaptation plan agreed' })).not.toBeInTheDocument();
    expect(screen.getByText('Energy: 1 story shown.')).toBeInTheDocument();
  });

  it('says "No relevant updates are available." for an empty view (p. 226)', () => {
    render(<GlobalNewsPanel head={head} filters={NEWS_FILTERS} views={views} sourcesFailed={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Environment and Nature' }));
    expect(screen.getByText('No relevant updates are available.')).toBeInTheDocument();
  });

  it('shows the honest unavailable state when every source failed, and disables the filters', () => {
    const empty = { all: [], climate: [], energy: [], environment: [], business: [] };
    render(<GlobalNewsPanel head={head} filters={NEWS_FILTERS} views={empty} sourcesFailed />);
    expect(screen.getByText('This source is temporarily unavailable.')).toBeInTheDocument();
    expect(screen.queryByText('No relevant updates are available.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Climate' })).toBeDisabled();
  });

  it('keeps the p. 13 action: View All News -> Global Intelligence', () => {
    render(<GlobalNewsPanel head={head} filters={NEWS_FILTERS} views={views} sourcesFailed={false} />);
    expect(screen.getByRole('link', { name: /View All News/ })).toHaveAttribute('href', '/knowledge-hub/global-intelligence');
  });
});
