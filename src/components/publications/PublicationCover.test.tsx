import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PublicationCover } from './PublicationCover';

describe('publication cover', () => {
  it('shows the decorative branded cover when no image is available', () => {
    const { container } = render(<PublicationCover image={null} />);
    expect(container.querySelector('[data-publication-cover]')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Enerqa Publication')).toBeInTheDocument();
  });

  it('falls back after an image failure and can display a different article image', () => {
    const { container, rerender } = render(<PublicationCover image={{ src: '/cover.jpg', alt: 'Solar panels' }} />);
    const fallback = container.querySelector('[data-publication-cover]');
    expect(screen.getByRole('img', { name: 'Solar panels' })).toHaveAttribute('sizes', '100vw');
    // Broken uploads should leave the designed cover, rather than a broken image.
    fireEvent.error(screen.getByRole('img', { name: 'Solar panels' }));
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('[data-publication-cover]')).toBe(fallback);
    rerender(<PublicationCover image={{ src: '/next-cover.jpg', alt: 'Wind turbines' }} />);
    expect(screen.getByRole('img', { name: 'Wind turbines' })).toBeInTheDocument();
  });

  it('loads listing thumbnails lazily and requests their smaller display size', () => {
    render(<PublicationCover image={{ src: '/cover.jpg', alt: 'Solar panels' }} thumbnail />);
    const image = screen.getByRole('img', { name: 'Solar panels' });
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('sizes', '(min-width: 640px) 192px, 100vw');
  });
});
