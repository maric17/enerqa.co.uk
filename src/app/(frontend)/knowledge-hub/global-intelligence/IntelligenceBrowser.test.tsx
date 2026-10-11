import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { IntelligenceBrowser } from './IntelligenceBrowser';
import { tagIntelligence } from '@/lib/feeds/intelligence';

const saved = tagIntelligence({
  id: 'saved', title: 'Saved climate policy in Germany', summary: null, url: 'https://example.org/saved',
  type: 'news', publisher: 'Publisher', source: 'NewsData.io', sourceId: 'newsdata',
  publishedAt: '2026-10-10', retrievedAt: '2026-10-11', language: 'en', authors: [], doi: null,
  documentType: null, verifiedOpen: true, stale: false,
});
const fresh = { ...saved, id: 'fresh', title: 'Fresh climate policy in Germany', url: 'https://example.org/fresh' };
function mount() {
  render(<IntelligenceBrowser initialItems={[saved]} initialFilters={{}} initialPage={1} initialSourcesFailed={false}
    domains={[]} industries={[]} sources={[{ value: 'newsdata', label: 'NewsData.io' }]} languages={[{ value: 'en', label: 'EN' }]} labels={{}} />);
}
function choose(label: string, values: string[]) {
  const select = screen.getByRole('listbox', { name: label }) as HTMLSelectElement;
  for (const option of select.options) option.selected = values.includes(option.value);
  fireEvent.change(select);
}
function reply(items = [fresh], sourcesFailed = false) {
  return { ok: true, json: async () => ({ items, sourcesFailed, partialFailure: sourcesFailed, unavailableSources: [], searchedAt: '2026-10-11' }) };
}
const request = vi.fn();
beforeEach(() => { vi.useFakeTimers(); request.mockReset(); vi.stubGlobal('fetch', request); window.history.replaceState(null, '', '/knowledge-hub/global-intelligence'); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

it('renders saved records first without requesting any API on mount', async () => {
  mount();
  await act(() => vi.advanceTimersByTimeAsync(1000));
  expect(screen.getByRole('heading', { name: saved.title })).toBeInTheDocument();
  expect(request).not.toHaveBeenCalled();
});

it('combines rapid filter changes into one API request, including linked geography', async () => {
  request.mockResolvedValue(reply()); mount();
  choose('Content Type', ['news']); choose('Source', ['newsdata']); choose('Country', ['DEU']);
  expect(screen.getByText('Updating results…')).toBeInTheDocument();
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(request).toHaveBeenCalledTimes(1);
  const url = new URL(request.mock.calls[0][0], 'http://localhost');
  expect(url.pathname).toBe('/api/intelligence/search');
  expect(url.searchParams.get('country')).toBe('DEU');
  expect(url.searchParams.get('region')).toBe('Western Europe');
  expect(url.searchParams.get('type')).toBe('news');
  expect(url.searchParams.get('source')).toBe('newsdata');
  expect(screen.getByRole('heading', { name: fresh.title })).toBeInTheDocument();
  expect(window.location.search).toContain('country=DEU');
});

it('ignores an older response after a later filter change', async () => {
  let resolveOld!: (value: ReturnType<typeof reply>) => void;
  request.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; })).mockResolvedValueOnce(reply());
  mount(); choose('Content Type', ['news']);
  await act(() => vi.advanceTimersByTimeAsync(500));
  choose('Source', ['newsdata']);
  expect(request.mock.calls[0][1].signal.aborted).toBe(true);
  await act(() => vi.advanceTimersByTimeAsync(500));
  await act(async () => { resolveOld(reply([{ ...fresh, title: 'Old response should not appear', url: 'https://example.org/old' }])); });
  expect(screen.queryByText('Old response should not appear')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: fresh.title })).toBeInTheDocument();
});

it('retains matching saved records after an HTTP failure', async () => {
  request.mockResolvedValue({ ok: false }); mount(); choose('Content Type', ['news']);
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(screen.getByRole('heading', { name: saved.title })).toBeInTheDocument();
  expect(screen.getByText('Sources could not be refreshed. Showing saved results where available.')).toBeInTheDocument();
});

it('search submission runs immediately, pagination reuses results, and Clear All resets controls', async () => {
  request.mockResolvedValue(reply(Array.from({ length: 15 }, (_, n) => ({ ...fresh, id: `fresh-${n}`, url: `https://example.org/${n}` }))));
  mount(); fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'climate' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  await act(() => vi.advanceTimersByTimeAsync(0));
  fireEvent.click(screen.getByRole('link', { name: 'Next page' }));
  expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('link', { name: 'Clear All' }));
  expect(screen.getByRole('searchbox')).toHaveValue('');
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(request).toHaveBeenCalledTimes(2);
});
