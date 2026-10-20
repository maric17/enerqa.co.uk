import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransitionPriorities } from './TransitionPriorities';

describe('domain directory with a shared background', () => {
  it('keeps all four destinations and dedicated local photos without timers', () => {
    const interval = vi.spyOn(globalThis, 'setInterval');
    try {
      const { container } = render(<TransitionPriorities />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Explore Our Domains');
      expect(screen.getAllByRole('link').map(link => link.getAttribute('href'))).toEqual([
        '/domains/climate-action-carbon-management', '/domains/energy-systems-transition',
        '/domains/environment-nature-circularity', '/domains/sustainable-business-esg-finance',
      ]);
      expect(screen.getAllByText('Discover')).toHaveLength(4);
      const images = container.querySelectorAll('img');
      expect(images).toHaveLength(4);
      for (const [index, image] of [...images].entries()) {
        // Decorative photos leave the domain title as the link's accessible name.
        expect(image).toHaveAttribute('alt', '');
        expect(image).toHaveAttribute('data-nimg', 'fill');
        expect(image.getAttribute('src')).toContain(encodeURIComponent([
          '/images/domains/climate-glacier.webp', '/images/domains/energy-solar.webp',
          '/images/domains/nature-river.webp', '/images/domains/business-building.webp',
        ][index]));
      }
      expect(screen.queryByRole('button')).toBeNull();
      expect(interval).not.toHaveBeenCalled();
    } finally { interval.mockRestore(); }
  });

  it('switches the shared background with pointer hover and keyboard focus', () => {
    const { container } = render(<TransitionPriorities />);
    const links = screen.getAllByRole('link');
    const backgrounds = container.querySelectorAll('[data-domain-background]');
    // The photo and expanded domain must always change together.
    expect(backgrounds[0]).toHaveAttribute('data-active', 'true');
    for (const [index, link] of links.entries()) {
      fireEvent.mouseEnter(link);
      expect(backgrounds[index]).toHaveAttribute('data-active', 'true');
      expect(link).toHaveAttribute('data-active', 'true');
      expect(container.querySelectorAll('[data-domain-background][data-active="true"]')).toHaveLength(1);
    }
    fireEvent.focus(links[1]);
    expect(backgrounds[1]).toHaveAttribute('data-active', 'true');
    expect(links[1]).toHaveAttribute('data-active', 'true');
    expect(backgrounds[3]).toHaveAttribute('data-active', 'false');
  });
});
