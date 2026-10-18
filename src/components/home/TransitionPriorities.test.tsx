import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransitionPriorities } from './TransitionPriorities';

describe('static domain directory', () => {
  it('keeps all four destinations and discovers each domain without timers or background images', () => {
    const interval = vi.spyOn(globalThis, 'setInterval');
    try {
      const { container } = render(<TransitionPriorities />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Explore Our Domains');
      expect(screen.getAllByRole('link').map(link => link.getAttribute('href'))).toEqual([
        '/domains/climate-action-carbon-management', '/domains/energy-systems-transition',
        '/domains/environment-nature-circularity', '/domains/sustainable-business-esg-finance',
      ]);
      expect(screen.getAllByText('Discover')).toHaveLength(4);
      expect(container.querySelector('img, [style]')).toBeNull();
      expect(screen.queryByRole('button')).toBeNull();
      expect(interval).not.toHaveBeenCalled();
    } finally { interval.mockRestore(); }
  });
});
