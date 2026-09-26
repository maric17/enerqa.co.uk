import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TransitionPriorities } from './TransitionPriorities';

// jsdom has no matchMedia; this stub lets each test choose reduced motion.
function stubMatchMedia(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

// The highlighted card is the one carrying the wider flex class.
const activeTitle = () =>
  [...document.querySelectorAll('#h05-domain-cards > a')]
    .find((a) => a.className.includes('md:flex-[1.2]'))
    ?.querySelector('h3 .en')?.textContent;

describe('TransitionPriorities (H05, p. 14; WCAG 2.2.2)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('uses the p. 14 heading and narrative, and links all four domains', () => {
    stubMatchMedia(false);
    render(<TransitionPriorities />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Explore Our Domains');
    expect(
      screen.getByText(
        'Four interconnected domains combine technical analysis, project development and investment thinking. Explore the work relevant to your priorities.',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual([
      '/domains/climate-action-carbon-management',
      '/domains/energy-systems-transition',
      '/domains/environment-nature-circularity',
      '/domains/sustainable-business-esg-finance',
    ]);
  });

  it('rotates, and the visible pause control stops it', () => {
    stubMatchMedia(false);
    render(<TransitionPriorities />);
    expect(activeTitle()).toBe('Climate Action & Carbon Management');
    act(() => vi.advanceTimersByTime(4000));
    expect(activeTitle()).toBe('Energy Systems & Transition');

    // jsdom's click does not move focus, so this tests the pause choice alone.
    fireEvent.click(screen.getByRole('button', { name: 'Pause rotation' }));
    act(() => vi.advanceTimersByTime(12000));
    expect(activeTitle()).toBe('Energy Systems & Transition');
    expect(screen.getByRole('button', { name: 'Resume rotation' })).toBeInTheDocument();
  });

  it('pauses while keyboard focus is inside, and highlights the focused card', () => {
    stubMatchMedia(false);
    render(<TransitionPriorities />);
    const business = screen.getByRole('link', { name: /Sustainable Business, ESG & Finance/ });
    fireEvent.focus(business);
    expect(activeTitle()).toBe('Sustainable Business, ESG & Finance');
    act(() => vi.advanceTimersByTime(12000));
    expect(activeTitle()).toBe('Sustainable Business, ESG & Finance');
  });

  it('pauses on hover', () => {
    stubMatchMedia(false);
    render(<TransitionPriorities />);
    fireEvent.mouseEnter(document.querySelector('#h05-domain-cards')!.parentElement!);
    act(() => vi.advanceTimersByTime(12000));
    expect(activeTitle()).toBe('Climate Action & Carbon Management');
  });

  it('never rotates with prefers-reduced-motion, and then needs no pause button', () => {
    stubMatchMedia(true);
    render(<TransitionPriorities />);
    act(() => vi.advanceTimersByTime(12000));
    expect(activeTitle()).toBe('Climate Action & Carbon Management');
    expect(screen.queryByRole('button', { name: /rotation/ })).not.toBeInTheDocument();
  });
});
