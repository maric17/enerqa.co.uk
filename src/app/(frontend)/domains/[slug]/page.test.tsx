import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Keep this regression test off the shared CMS and external news providers.
const cms = vi.hoisted(() => ({ find: vi.fn(), connection: vi.fn() }));
vi.mock('payload', () => ({ getPayload: async () => ({ find: cms.find }) }));
vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('next/server', () => ({ connection: cms.connection }));
vi.mock('@/lib/api/core/registry', () => ({ providerEnabled: () => false }));
vi.mock('@/components/ui/PageHero', () => ({ PageHero: () => null }));
vi.mock('@/components/feeds/NewsFeed', () => ({ NewsFeed: () => null }));
vi.mock('@/components/feeds/ResearchFeed', () => ({ ResearchFeed: () => null }));
vi.mock('@/components/feeds/OfficialFeed', () => ({ OfficialFeed: () => null }));
vi.mock('@/components/feeds/RelatedDataset', () => ({ RelatedDataset: () => null }));
vi.mock('@/components/feeds/RelatedPublications', () => ({ RelatedPublications: () => null }));

import DomainPage from './page';

const industry = (id: number, slug: string, title: string) => ({ id, slug, title });
const energy = industry(3, 'energy-utilities', 'Energy & Utilities');
const transport = industry(7, 'transport-logistics-mobility', 'Transport, Logistics & Mobility');
const domainSlugs = [
  'climate-action-carbon-management', 'energy-systems-transition',
  'environment-nature-circularity', 'sustainable-business-esg-finance',
];

async function showIndustries(slug: string, selected: unknown[]) {
  cms.find.mockImplementation(async ({ collection }) => ({
    docs: collection === 'domains' ? [{ id: 1, slug, title: 'Domain', relevantIndustries: selected }] : [],
  }));
  render(await DomainPage({ params: Promise.resolve({ slug }) }));
  const section = screen.getByRole('heading', { name: 'Relevant Industries' }).closest('section')!;
  return within(section);
}

describe('CMS-managed domain industries', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it.each(domainSlugs)('honors the saved selection for %s', async (slug) => {
    const section = await showIndustries(slug, [energy]);

    expect(section.getByRole('link', { name: energy.title })).toHaveAttribute('href', '/industries/energy-utilities');
    expect(cms.find).toHaveBeenCalledTimes(1);
    expect(cms.find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'domains', depth: 1 }));
    // An actual request must read the CMS instead of freezing selections at build time.
    expect(cms.connection).toHaveBeenCalled();
  });

  it('keeps the editor-selected display order', async () => {
    const section = await showIndustries(domainSlugs[0], [transport, energy]);

    expect(section.getAllByRole('link').map(link => link.textContent)).toEqual([
      transport.title, energy.title, 'Explore All Industries ',
    ]);
  });

  it('honors an empty selection and keeps the directory link', async () => {
    const section = await showIndustries(domainSlugs[0], []);

    expect(section.queryByRole('list')).not.toBeInTheDocument();
    expect(section.getByRole('link', { name: 'Explore All Industries' })).toHaveAttribute('href', '/domains-and-industries#industries');
  });

  it('withholds unresolved relationships instead of creating broken links', async () => {
    const section = await showIndustries(domainSlugs[0], [3, null, transport]);

    expect(section.getAllByRole('link')).toHaveLength(2);
    expect(section.getByRole('link', { name: transport.title })).toHaveAttribute('href', '/industries/transport-logistics-mobility');
  });
});
