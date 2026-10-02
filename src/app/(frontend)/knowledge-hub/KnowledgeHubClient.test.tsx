import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import KnowledgeHubClient from './KnowledgeHubClient';
import type { PublicationCard } from './publicationFinder';

const publication: PublicationCard = {
  id: 1, title: 'Energy transition', slug: 'energy-transition', excerpt: 'Renewable energy research',
  author: 'Example Author', date: '2024-10-10', dateVerified: true, type: 'Article', language: 'en',
  archiveCategory: null, fileUrl: null, image: { src: '/solar.jpg', alt: 'Solar panels' },
  domains: [], industries: [], searchText: 'energy transition renewable research example author',
};

describe('publication listing images', () => {
  it('shows the article thumbnail alongside its byline and links to the article', () => {
    render(<KnowledgeHubClient publications={[publication]} />);
    const image = screen.getByRole('img', { name: 'Solar panels' });
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image.closest('a')).toHaveAttribute('href', '/knowledge-hub/energy-transition');
    expect(screen.getByText('By Example Author')).toBeInTheDocument();
    // Changing the search removes the featured layout but keeps the article image.
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'renewable' } });
    expect(screen.getByRole('img', { name: 'Solar panels' })).toHaveAttribute('sizes', '(min-width: 640px) 192px, 100vw');
    expect(screen.queryByRole('group', { name: 'Author' })).toBeNull();
  });
});
