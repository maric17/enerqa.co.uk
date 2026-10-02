import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HeroNewsBackground, HeroNewsProvider, HERO_ROTATION_MS } from './HeroNewsBackground';
import { GlobalNewsPanel } from './GlobalNewsPanel';
import { NEWS_FILTERS, type NewsCardData } from './firstFoldNews';

// Use ordinary images so load/error events can be driven without a network.
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean }) => {
    const imageProps = { ...props };
    delete imageProps.fill;
    delete imageProps.unoptimized;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imageProps} alt="" />;
  },
}));

const card = (id: string, imageUrl: string | null = `https://images.example.com/${id}.jpg`): NewsCardData => ({
  id, title: `Story ${id}`, imageUrl, teaser: null, url: `https://www.reuters.com/${id}`,
  publisher: 'Reuters', publishedAt: null, dateLabel: null,
});
const a = card('a');
const b = card('b');
const views = { all: [a, b], climate: [a], energy: [b], environment: [], business: [] };
let reducedMotion = false;

function Composition({ newsViews = views }: { newsViews?: typeof views }) {
  return (
    <HeroNewsProvider>
      <HeroNewsBackground />
      <GlobalNewsPanel head={<h2 id="h03-global-news">Global News</h2>} filters={NEWS_FILTERS} views={newsViews} sourcesFailed={false} />
    </HeroNewsProvider>
  );
}
const incoming = () => document.querySelector('.hero-news-image-incoming') as HTMLImageElement;
const advance = (ms = HERO_ROTATION_MS) => act(() => { vi.advanceTimersByTime(ms); });

beforeEach(() => {
  vi.useFakeTimers();
  reducedMotion = false;
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('reduced-motion') && reducedMotion,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('featured news hero', () => {
  it('always marks the selected story active, including while images load, and rotates after three minutes', () => {
    render(<Composition />);
    expect(incoming()).toHaveAttribute('src', a.imageUrl);
    expect(screen.getByRole('link', { name: /Story a/ })).toHaveAttribute('data-background-active', 'true');
    expect(document.querySelectorAll('[data-background-active]')).toHaveLength(1);
    fireEvent.load(incoming());
    expect(screen.getByRole('link', { name: /Story a/ })).toHaveAttribute('data-background-active', 'true');
    advance(HERO_ROTATION_MS - 1);
    expect(incoming()).toHaveAttribute('src', a.imageUrl);
    advance(1);
    expect(incoming()).toHaveAttribute('src', b.imageUrl);
    expect(screen.getByRole('link', { name: /Story b/ })).toHaveAttribute('data-background-active', 'true');
    expect(screen.getByRole('link', { name: /Story a/ })).not.toHaveAttribute('data-background-active');
    // The old image stays underneath until the incoming image is ready.
    expect(document.querySelectorAll('.hero-news-image')).toHaveLength(2);
    fireEvent.load(incoming());
    expect(screen.getByRole('link', { name: /Story b/ })).toHaveAttribute('data-background-active', 'true');
    advance();
    expect(incoming()).toHaveAttribute('src', a.imageUrl);
  });

  it('supports pause, resume, and manual selection that stays in place', () => {
    render(<Composition />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause news background rotation' }));
    advance(HERO_ROTATION_MS * 2);
    expect(incoming()).toHaveAttribute('src', a.imageUrl);
    fireEvent.click(screen.getByRole('button', { name: 'Resume news background rotation' }));
    advance();
    expect(incoming()).toHaveAttribute('src', b.imageUrl);
    fireEvent.click(screen.getByRole('button', { name: 'Show background for Story a' }));
    advance();
    expect(incoming()).toHaveAttribute('src', a.imageUrl);
  });

  it('pauses while hovered or focused and when the tab is hidden', () => {
    render(<Composition />);
    const panel = screen.getByRole('region', { name: 'Global News' });
    fireEvent.mouseEnter(panel);
    advance();
    expect(incoming()).toHaveAttribute('src', a.imageUrl);
    fireEvent.mouseLeave(panel);
    fireEvent.focus(screen.getByRole('button', { name: 'All' }));
    advance();
    expect(incoming()).toHaveAttribute('src', a.imageUrl);
    fireEvent.blur(screen.getByRole('button', { name: 'All' }));
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    advance();
    expect(incoming()).toHaveAttribute('src', a.imageUrl);
    hidden.mockReturnValue(false);
    fireEvent(document, new Event('visibilitychange'));
    advance();
    expect(incoming()).toHaveAttribute('src', b.imageUrl);
  });

  it('does not auto-rotate for reduced motion, but still allows manual selection', () => {
    reducedMotion = true;
    render(<Composition />);
    advance(HERO_ROTATION_MS * 3);
    expect(incoming()).toHaveAttribute('src', a.imageUrl);
    expect(screen.queryByRole('button', { name: 'Pause news background rotation' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show background for Story b' }));
    expect(incoming()).toHaveAttribute('src', b.imageUrl);
  });

  it('uses the existing backdrop for failed, missing, and empty story images', () => {
    render(<Composition />);
    fireEvent.load(incoming());
    fireEvent.click(screen.getByRole('button', { name: 'Show background for Story b' }));
    fireEvent.error(incoming());
    expect(incoming()).toBeNull();
    expect(screen.getByRole('link', { name: /Story b/ })).toHaveAttribute('data-background-active', 'true');
    expect(document.querySelector('.hero-insights-bg')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Environment and Nature' }));
    expect(incoming()).toBeNull();
    expect(document.querySelector('[data-background-active]')).toBeNull();
    expect(screen.queryByRole('group', { name: 'News background controls' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByRole('link', { name: /Story a/ })).toHaveAttribute('data-background-active', 'true');
  });

  it('keeps the lead as the featured story when its image is missing', () => {
    render(<Composition newsViews={{ ...views, all: [card('a', null), b] }} />);
    expect(incoming()).toBeNull();
    expect(screen.getByRole('link', { name: /Story a/ })).toHaveAttribute('data-background-active', 'true');
    expect(screen.getByRole('button', { name: 'Show background for Story a' })).toHaveAttribute('aria-pressed', 'true');
    advance();
    expect(incoming()).toHaveAttribute('src', b.imageUrl);
  });

  it('follows filters and a refreshed feed, including a changed image for the same article', () => {
    const { rerender } = render(<Composition />);
    advance();
    fireEvent.click(screen.getByRole('button', { name: 'Climate' }));
    expect(incoming()).toHaveAttribute('src', a.imageUrl);
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    const refreshed = card('a', 'https://images.example.com/new-a.jpg');
    rerender(<Composition newsViews={{ ...views, all: [refreshed, b] }} />);
    expect(incoming()).toHaveAttribute('src', refreshed.imageUrl);
  });

  it('clears timers when unmounted', () => {
    const { unmount } = render(<Composition />);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
