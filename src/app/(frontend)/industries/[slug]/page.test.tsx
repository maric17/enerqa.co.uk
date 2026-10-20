import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// The page test verifies placement without depending on the CMS or async feeds.
const cms = vi.hoisted(() => ({ find: vi.fn() }));
vi.mock('payload', () => ({ getPayload: async () => ({ find: cms.find }) }));
vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('@/components/feeds/IndustryHero', () => ({
  IndustryHero: ({ title, slug }: { title: string; slug: string }) => <section data-testid="industry-hero" data-slug={slug}><h1>{title}</h1></section>,
}));
vi.mock('@/components/feeds/ResearchFeed', () => ({ ResearchFeed: () => null }));
vi.mock('@/components/feeds/RelatedDataset', () => ({ RelatedDataset: () => null }));
vi.mock('@/components/feeds/RelatedPublications', () => ({ RelatedPublications: () => null }));

import IndustryPage from './page';

describe('industry page sections', () => {
  it('opens with the sector news hero and removes the lower news and tools sections', async () => {
    cms.find.mockResolvedValue({ docs: [{ id: 3, title: 'Energy & Utilities', slug: 'energy-utilities',
      heroNarrative: 'Industry introduction.', relevantTools: [{ href: '/tools/example', label: 'Previous tool' }],
    }] });
    const { container } = render(await IndustryPage({ params: Promise.resolve({ slug: 'energy-utilities' }) }));
    expect(container.firstElementChild?.firstElementChild).toBe(screen.getByTestId('industry-hero'));
    expect(screen.getByRole('heading', { level: 1, name: 'Energy & Utilities' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Industry News' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Relevant Enerqa Tools' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Previous tool' })).not.toBeInTheDocument();
    for (const name of ['Research and Official Updates', 'Related Data', 'Enerqa Publication']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
  });
});
