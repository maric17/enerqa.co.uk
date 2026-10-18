import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNewsDiagnostics } from '@/lib/api/news/diagnostics';
import { GlobalNewsPanel, HERO_ROTATION_MS } from './GlobalNewsPanel';
import { HERO_CATEGORIES, type HeroSlide } from './firstFoldNews';

const slides: HeroSlide[] = HERO_CATEGORIES.map(category => ({
  ...category,
  item: { id: category.key, title: `Story for ${category.key}`, teaser: 'A licensed short teaser.',
    url: `https://www.theguardian.com/${category.key}`, publisher: 'The Guardian',
    publishedAt: '2026-10-17T12:00:00Z', dateLabel: '17 Oct 2026, 12:00 UTC' },
  sourcesFailed: false, retrievedAt: null, delayed: false, stale: false,
}));

beforeEach(() => {
  // Drive the real motion preference explicitly because jsdom has no media queries.
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('full-screen domain news carousel', () => {
  it('offers only four domains, with one headline and no All category', () => {
    render(<GlobalNewsPanel slides={slides} />);
    expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Major Markets' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Story for climate' })).toBeInTheDocument();
    for (const category of HERO_CATEGORIES) expect(screen.getByRole('button', { name: category.label })).toBeInTheDocument();
    expect(screen.getByText('17 Oct 2026, 12:00 UTC')).toHaveAttribute('datetime', '2026-10-17T12:00:00Z');
    expect(screen.getByRole('link', { name: /View All News/ })).toHaveAttribute('href', '/knowledge-hub/global-intelligence');
  });

  it('switches headline, original link and active category together, including the final domain', () => {
    render(<GlobalNewsPanel slides={slides} />);
    fireEvent.click(screen.getByRole('button', { name: HERO_CATEGORIES[3].label }));
    expect(screen.getByRole('button', { name: HERO_CATEGORIES[3].label })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('link', { name: /Story for business/ })).toHaveAttribute('href', slides[3].item!.url);
    fireEvent.click(screen.getByRole('button', { name: 'Next headline' }));
    expect(screen.getByRole('heading', { name: 'Story for climate' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous headline' }));
    expect(screen.getByRole('heading', { name: 'Story for business' })).toBeInTheDocument();
  });

  it('supports arrow keys and moves focus with the selected category', () => {
    render(<GlobalNewsPanel slides={slides} />);
    fireEvent.keyDown(screen.getByRole('button', { name: HERO_CATEGORIES[0].label }), { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: HERO_CATEGORIES[1].label })).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Story for energy' })).toBeInTheDocument();
  });

  it('rotates, pauses after manual selection and can resume', () => {
    vi.useFakeTimers();
    render(<GlobalNewsPanel slides={slides} />);
    act(() => { vi.advanceTimersByTime(HERO_ROTATION_MS); });
    expect(screen.getByRole('heading', { name: 'Story for energy' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next headline' }));
    act(() => { vi.advanceTimersByTime(HERO_ROTATION_MS * 2); });
    expect(screen.getByRole('heading', { name: 'Story for environment' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Play slideshow' }));
    act(() => { vi.advanceTimersByTime(HERO_ROTATION_MS); });
    expect(screen.getByRole('heading', { name: 'Story for business' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    act(() => { vi.advanceTimersByTime(HERO_ROTATION_MS); });
    expect(screen.getByRole('heading', { name: 'Story for business' })).toBeInTheDocument();
  });

  it('stops motion for reduced-motion users', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    render(<GlobalNewsPanel slides={slides} />);
    act(() => { vi.advanceTimersByTime(HERO_ROTATION_MS * 3); });
    expect(screen.getByRole('heading', { name: 'Story for climate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeDisabled();
    // Manual category selection remains available even when automatic motion is off.
    fireEvent.click(screen.getByRole('button', { name: HERO_CATEGORIES[3].label }));
    expect(screen.getByRole('heading', { name: 'Story for business' })).toBeInTheDocument();
  });

  it('distinguishes unavailable and empty domains without disabling navigation', () => {
    const mixed = slides.map((slide, index) => index === 3 ? slide : { ...slide, item: null, sourcesFailed: index === 0 });
    render(<GlobalNewsPanel slides={mixed} />);
    expect(screen.getByRole('heading', { name: 'This source is temporarily unavailable.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: HERO_CATEGORIES[1].label }));
    expect(screen.getByRole('heading', { name: 'No relevant updates are available.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: HERO_CATEGORIES[3].label }));
    expect(screen.getByRole('heading', { name: 'Story for business' })).toBeInTheDocument();
  });

  it('uses the local image if a publisher image fails', () => {
    const { container } = render(<GlobalNewsPanel slides={slides.map(slide => ({ ...slide, item: { ...slide.item!, imageUrl: 'https://example.com/photo.jpg' } }))} />);
    const image = container.querySelector('[data-news-slide-image]')!;
    fireEvent.error(image);
    expect(image.getAttribute('src')).toContain('news-thumbnail-fallback.webp');
  });

  it('prints safe diagnostics only with the explicit debug query', () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const diagnostics = createNewsDiagnostics('all');
    try {
      const normal = render(<GlobalNewsPanel slides={slides} diagnostics={diagnostics} />);
      expect(log).not.toHaveBeenCalled();
      normal.unmount();
      window.history.replaceState(null, '', '/?newsDebug=1');
      render(<GlobalNewsPanel slides={slides} diagnostics={diagnostics} />);
      expect(JSON.parse(log.mock.calls[0][1])).toMatchObject({ viewCounts: { climate: 1, business: 1 }, diagnostics });
    } finally { window.history.replaceState(null, '', '/'); log.mockRestore(); }
  });
});
