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
  const threeStories = () => slides.map(slide => ({ ...slide, stories: Array.from({ length: 3 }, (_, index) => ({
    item: { ...slide.item!, id: `${slide.key}-${index}`, title: `${slide.key} article ${index + 1}`,
      url: `https://www.theguardian.com/${slide.key}/${index + 1}` },
    retrievedAt: `Article ${index + 1} refresh`, delayed: false, stale: index === 2,
  })) }));

  it('rotates a single industry group, keeps its title visible, and scopes all-news navigation', () => {
    vi.useFakeTimers();
    const industry = { title: 'Energy & Utilities', slug: 'energy-utilities' };
    const sectorSlides = [{ ...threeStories()[1], key: industry.slug, label: industry.title }];
    render(<section><h1>{industry.title}</h1><GlobalNewsPanel industry={industry} slides={sectorSlides} /></section>);
    expect(screen.queryByRole('group', { name: 'Choose a domain' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View All Industry News/ })).toHaveAttribute('href', '/knowledge-hub/global-intelligence?industry=energy-utilities&type=news');
    act(() => { vi.advanceTimersByTime(HERO_ROTATION_MS); });
    expect(screen.getByRole('heading', { level: 1, name: industry.title })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'energy article 2' })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(HERO_ROTATION_MS * 2); });
    expect(screen.getByRole('heading', { name: 'energy article 1' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    act(() => { vi.advanceTimersByTime(HERO_ROTATION_MS); });
    expect(screen.getByRole('heading', { name: 'energy article 1' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next headline' }));
    expect(screen.getByRole('heading', { name: 'energy article 2' })).toBeInTheDocument();
  });

  it('keeps empty industry navigation scoped and disables controls without another story', () => {
    const industry = { title: 'Energy & Utilities', slug: 'energy-utilities' };
    render(<GlobalNewsPanel industry={industry} slides={[{ ...slides[0], item: null }]} />);
    expect(screen.getByRole('link', { name: /Browse Global Intelligence/ })).toHaveAttribute('href', '/knowledge-hub/global-intelligence?industry=energy-utilities&type=news');
    expect(screen.getByRole('button', { name: 'Next headline' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeDisabled();
  });

  it('selects each article through its domain line segments and updates the link and freshness together', () => {
    render(<GlobalNewsPanel slides={threeStories()} />);
    const segment = screen.getByRole('button', { name: `Show ${HERO_CATEGORIES[0].label} article 3 of 3` });
    fireEvent.click(segment);
    expect(segment).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('link', { name: /climate article 3/ })).toHaveAttribute('href', 'https://www.theguardian.com/climate/3');
    expect(screen.getByText(/Article 3 refresh/)).toHaveTextContent('Cached headline; refresh unavailable.');
    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeInTheDocument();
  });

  it('steps through three stories before changing domains and supports arrow keys on the line segments', () => {
    render(<GlobalNewsPanel slides={threeStories()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next headline' }));
    expect(screen.getByRole('heading', { name: 'climate article 2' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next headline' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next headline' }));
    expect(screen.getByRole('heading', { name: 'energy article 1' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous headline' }));
    expect(screen.getByRole('heading', { name: 'climate article 3' })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('button', { name: `Show ${HERO_CATEGORIES[0].label} article 3 of 3` }), { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: `Show ${HERO_CATEGORIES[0].label} article 1 of 3` })).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'climate article 1' })).toBeInTheDocument();
  });

  it('automatically rotates through a domain before advancing to the next domain', () => {
    vi.useFakeTimers();
    render(<GlobalNewsPanel slides={threeStories()} />);
    act(() => { vi.advanceTimersByTime(HERO_ROTATION_MS); });
    expect(screen.getByRole('heading', { name: 'climate article 2' })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(HERO_ROTATION_MS); });
    expect(screen.getByRole('heading', { name: 'climate article 3' })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(HERO_ROTATION_MS); });
    expect(screen.getByRole('heading', { name: 'energy article 1' })).toBeInTheDocument();
  });

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
    // The initial view shows available reporting rather than an empty first domain.
    expect(screen.getByRole('heading', { name: 'Story for business' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: HERO_CATEGORIES[0].label }));
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
