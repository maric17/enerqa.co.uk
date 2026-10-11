import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DataPortalSourcesConfig, Dataset } from '@/payload-types';

// Exercise the page without connecting tests to the shared live database.
const cms = vi.hoisted(() => ({ getPayload: vi.fn(), findGlobal: vi.fn(), find: vi.fn() }));
vi.mock('payload', () => ({ getPayload: cms.getPayload }));
vi.mock('@payload-config', () => ({ default: {} }));

import DataPortalSourcesPage from './page';

const databaseError = new Error('private-database-details');
const dataset: Dataset = {
  id: 1,
  slug: 'verified-emissions',
  title: 'Verified emissions dataset',
  description: 'Published observations',
  provider: 'Climate TRACE',
  date: '2026-10-11',
  status: 'verified_open',
  accessStatus: 'verified_open',
  redistribution: true,
  createdAt: '2026-10-11',
  updatedAt: '2026-10-11',
};

function richText(text: string): NonNullable<DataPortalSourcesConfig['s01_intro']> {
  // Use a real rich-text document so saved content goes through the production renderer.
  return {
    root: {
      type: 'root', direction: 'ltr', format: '', indent: 0, version: 1,
      children: [{
        type: 'paragraph', direction: 'ltr', format: '', indent: 0, version: 1,
        children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
      }],
    },
  };
}

describe('Sources and Methodology database resilience', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    cms.getPayload.mockResolvedValue({ findGlobal: cms.findGlobal, find: cms.find });
    cms.findGlobal.mockResolvedValue({});
    cms.find.mockResolvedValue({ docs: [dataset] });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders saved notes and verified dataset links when both reads succeed', async () => {
    cms.findGlobal.mockResolvedValue({ s01_intro: richText('Published source introduction') });

    render(await DataPortalSourcesPage());

    expect(screen.getByText('Published source introduction')).toBeInTheDocument();
    expect(screen.getByText(dataset.title)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Dataset' })).toHaveAttribute('href', '/data-portal/datasets/verified-emissions');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    // Outage handling must keep the publication and redistribution checks in the query.
    expect(cms.find).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: { equals: 'verified_open' }, accessStatus: { equals: 'verified_open' }, redistribution: { equals: true } },
    }));
  });

  it('keeps verified datasets and default methodology when the source notes read fails', async () => {
    cms.findGlobal.mockRejectedValue(databaseError);

    render(await DataPortalSourcesPage());

    expect(screen.getByRole('status')).toHaveTextContent('temporarily unavailable');
    expect(screen.getByText(dataset.title)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Attribution and Reuse' })).toBeInTheDocument();
    expect(screen.getByText(/Each dataset and external item links to its applicable licence/)).toBeInTheDocument();
  });

  it('keeps saved notes when the dataset listing read fails', async () => {
    cms.findGlobal.mockResolvedValue({ s01_intro: richText('Published source introduction') });
    cms.find.mockRejectedValue(databaseError);

    render(await DataPortalSourcesPage());

    expect(screen.getByText('Published source introduction')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'View Dataset' })).not.toBeInTheDocument();
  });

  it('renders the provider directory when both database reads fail without exposing errors', async () => {
    cms.findGlobal.mockRejectedValue(databaseError);
    cms.find.mockRejectedValue(databaseError);

    const { container } = render(await DataPortalSourcesPage());

    expect(screen.getByRole('heading', { name: 'Numerical Data Sources' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'News and Research Sources' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Climate TRACE' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(container.textContent).not.toContain(databaseError.message);
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain(databaseError.message);
  });

  it('renders default source information if the content service cannot initialize', async () => {
    cms.getPayload.mockRejectedValue(databaseError);

    render(await DataPortalSourcesPage());

    expect(screen.getByRole('heading', { level: 1, name: 'Sources and Methodology' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Climate TRACE' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(cms.findGlobal).not.toHaveBeenCalled();
    expect(cms.find).not.toHaveBeenCalled();
  });
});
