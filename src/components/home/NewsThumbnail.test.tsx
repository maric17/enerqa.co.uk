import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NewsThumbnail } from './NewsThumbnail';

const imageUrl = 'https://images.example.com/article.jpg';

describe('news thumbnails', () => {
  it('falls back when a publisher image fails and retries a different article image', async () => {
    const { container, rerender } = render(<NewsThumbnail imageUrl={imageUrl} />);
    const article = () => container.querySelector('[data-article-thumbnail]')!;
    const fallback = container.querySelector('[data-news-thumbnail]')!;
    // The fallback is already mounted before the remote request succeeds or fails.
    expect(fallback.getAttribute('src')).toContain(encodeURIComponent('/images/banners/news-thumbnail-fallback.webp'));
    expect(fallback).toHaveAttribute('loading', 'eager');
    expect(article()).toHaveAttribute('src', imageUrl);
    expect(article()).toHaveStyle({ opacity: '0' });
    fireEvent.error(article());
    expect(article()).toBeNull();
    expect(container.querySelector('[data-news-thumbnail]')).toBe(fallback);

    // A failed image from one article must not suppress the next article's image.
    const nextImage = 'https://images.example.com/another-article.jpg';
    rerender(<NewsThumbnail imageUrl={nextImage} />);
    expect(article()).toHaveAttribute('src', nextImage);
    fireEvent.load(article());
    await waitFor(() => expect(article()).toHaveStyle({ opacity: '1' }));
  });

  it('provides a decorative fallback for a story with no image', () => {
    const { container } = render(<NewsThumbnail />);
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('alt', '');
    expect(img.getAttribute('src')).toContain(encodeURIComponent('/images/banners/news-thumbnail-fallback.webp'));
  });
});
