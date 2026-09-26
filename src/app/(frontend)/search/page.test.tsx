import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// The index loader and the AI answer talk to the CMS and the provider; the
// search box itself needs neither.
vi.mock('./loadIndex', () => ({ getSearchIndex: vi.fn(async () => []) }));
vi.mock('./AIResponse', () => ({ AIResponse: () => null }));

import SearchPage from './page';

describe('/search AI01 Ask and Explore (p. 202; L896)', () => {
  it('has a labelled, editable query box with the spec placeholder and a named submit button', async () => {
    render(await SearchPage({ searchParams: Promise.resolve({ q: 'الطاقة الشمسية' }) }));

    const input = screen.getByRole('searchbox', { name: 'Search Enerqa' });
    expect(input).toHaveAttribute('name', 'q');
    expect(input).toHaveValue('الطاقة الشمسية'); // the current query stays editable
    expect(input).toHaveAttribute('placeholder', 'Ask a question or explore a topic.');
    expect(input).toHaveAttribute('dir', 'auto'); // Arabic renders right-to-left
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('type', 'submit');
    expect(screen.getByRole('heading', { level: 1, name: 'Ask and Explore' })).toBeInTheDocument();
  });

  it('keeps the query in the URL by submitting with GET to /search', async () => {
    const { container } = render(await SearchPage({ searchParams: Promise.resolve({}) }));
    const form = container.querySelector('form')!;
    expect(form).toHaveAttribute('action', '/search');
    expect(form).toHaveAttribute('method', 'GET');
  });
});
