import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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
    domains={[]} industries={[]} languages={[{ value: 'en', label: 'EN' }]} labels={{}} />);
}
function choose(label: string, values: string[]) {
  if (['Content Type', 'Language', 'Date Range'].includes(label)) {
    const summary = screen.getByText(/Additional filters/);
    if (!summary.closest('details')?.open) fireEvent.click(summary);
  }
  const group = screen.getByRole('group', { name: `${label} options` });
  for (const checkbox of within(group).getAllByRole('checkbox') as HTMLInputElement[]) {
    if (checkbox.checked !== values.includes(checkbox.value)) fireEvent.click(checkbox);
  }
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

it('keeps selections pending until Apply filters submits one request with linked geography', async () => {
  request.mockResolvedValue(reply()); mount();
  choose('Content Type', ['news']); choose('Language', ['en']); choose('Country', ['DEU']);
  await act(() => vi.advanceTimersByTimeAsync(1000));
  expect(request).not.toHaveBeenCalled();
  expect(screen.queryByText('Updating results…')).not.toBeInTheDocument();
  expect(screen.getByText('Filters changed. Click Apply filters to update results.')).toBeInTheDocument();
  expect(window.location.search).toBe('');
  fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
  await act(() => vi.advanceTimersByTimeAsync(0));
  expect(request).toHaveBeenCalledTimes(1);
  const url = new URL(request.mock.calls[0][0], 'http://localhost');
  expect(url.pathname).toBe('/api/intelligence/search');
  expect(url.searchParams.get('country')).toBe('DEU');
  expect(url.searchParams.get('region')).toBe('Western Europe');
  expect(url.searchParams.get('type')).toBe('news');
  expect(url.searchParams.has('source')).toBe(false);
  expect(url.searchParams.get('language')).toBe('en');
  expect(screen.getByRole('heading', { name: fresh.title })).toBeInTheDocument();
  expect(window.location.search).toContain('country=DEU');
  expect(screen.queryByText('Filters changed. Click Apply filters to update results.')).not.toBeInTheDocument();
});

it('leaves cards, result counts and the URL unchanged while typing or changing selections', async () => {
  mount();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'unmatched keyword' } });
  choose('Country', ['QAT']);
  await act(() => vi.advanceTimersByTimeAsync(1000));
  expect(screen.getByRole('heading', { name: saved.title })).toBeInTheDocument();
  expect(screen.getByText('1 open-access results · Saved collection')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Remove country: QAT' })).not.toBeInTheDocument();
  expect(window.location.search).toBe('');
  expect(request).not.toHaveBeenCalled();
});

it('cancels and ignores an older response only after a later submission', async () => {
  let resolveOld!: (value: ReturnType<typeof reply>) => void;
  request.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; })).mockResolvedValueOnce(reply());
  mount(); choose('Content Type', ['news']);
  fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
  choose('Language', ['en']);
  await act(() => vi.advanceTimersByTimeAsync(1000));
  expect(request.mock.calls[0][1].signal.aborted).toBe(false);
  expect(request).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
  expect(request.mock.calls[0][1].signal.aborted).toBe(true);
  await act(() => vi.advanceTimersByTimeAsync(0));
  await act(async () => { resolveOld(reply([{ ...fresh, title: 'Old response should not appear', url: 'https://example.org/old' }])); });
  expect(screen.queryByText('Old response should not appear')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: fresh.title })).toBeInTheDocument();
});

it('retains matching saved records after an HTTP failure', async () => {
  request.mockResolvedValue({ ok: false }); mount(); choose('Content Type', ['news']);
  fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
  await act(() => vi.advanceTimersByTimeAsync(0));
  expect(screen.getByRole('heading', { name: saved.title })).toBeInTheDocument();
  expect(screen.getByText('Sources could not be refreshed. Showing saved results where available.')).toBeInTheDocument();
});

it('Search submits immediately and pagination uses applied filters while Clear All waits for Apply', async () => {
  request.mockResolvedValue(reply(Array.from({ length: 15 }, (_, n) => ({ ...fresh, id: `fresh-${n}`, url: `https://example.org/${n}` }))));
  mount(); fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'climate' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  await act(() => vi.advanceTimersByTimeAsync(0));
  fireEvent.click(screen.getByRole('link', { name: 'Next page' }));
  expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(1);
  const appliedUrl = window.location.search;
  fireEvent.click(screen.getByRole('link', { name: 'Clear All' }));
  expect(screen.getByRole('searchbox')).toHaveValue('');
  await act(() => vi.advanceTimersByTimeAsync(1000));
  expect(request).toHaveBeenCalledTimes(1);
  expect(window.location.search).toBe(appliedUrl);
  expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Remove q: climate' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Previous page' }));
  expect(window.location.search).toContain('q=climate');
  expect(request).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
  await act(() => vi.advanceTimersByTimeAsync(0));
  expect(request).toHaveBeenCalledTimes(2);
  expect(new URL(request.mock.calls[1][0], 'http://localhost').searchParams.has('q')).toBe(false);
  expect(screen.queryByRole('link', { name: 'Remove q: climate' })).not.toBeInTheDocument();
});

it('stages chip removal without discarding other unsubmitted edits', async () => {
  request.mockResolvedValue(reply()); mount();
  choose('Content Type', ['news']);
  fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
  await act(() => vi.advanceTimersByTimeAsync(0));
  choose('Country', ['DEU']);
  fireEvent.click(screen.getByRole('link', { name: 'Remove type: news' }));
  await act(() => vi.advanceTimersByTimeAsync(1000));
  expect(request).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('checkbox', { name: 'News' })).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Germany' })).toBeChecked();
  expect(window.location.search).toBe('?type=news');
  fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
  await act(() => vi.advanceTimersByTimeAsync(0));
  const query = new URL(request.mock.calls[1][0], 'http://localhost').searchParams;
  expect(query.has('type')).toBe(false);
  expect(query.get('country')).toBe('DEU');
});

it('retains unsubmitted edits when a submitted search finishes', async () => {
  let resolveSearch!: (value: ReturnType<typeof reply>) => void;
  request.mockImplementationOnce(() => new Promise(resolve => { resolveSearch = resolve; }));
  mount(); choose('Content Type', ['news']);
  fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'unmatched keyword' } });
  await act(async () => { resolveSearch(reply()); });
  expect(screen.getByRole('heading', { name: fresh.title })).toBeInTheDocument();
  expect(screen.getByRole('searchbox')).toHaveValue('unmatched keyword');
  expect(screen.getByText('Filters changed. Click Apply filters to update results.')).toBeInTheDocument();
  expect(window.location.search).toBe('?type=news');
  expect(request).toHaveBeenCalledTimes(1);
});

it('ignores old source selections instead of keeping an invisible restriction', () => {
  render(<IntelligenceBrowser initialItems={[saved]} initialFilters={{ source: ['thenewsapi'] }} initialPage={1} initialSourcesFailed={false}
    domains={[]} industries={[]} languages={[]} labels={{}} />);
  expect(screen.getByRole('heading', { name: saved.title })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Remove source/ })).not.toBeInTheDocument();
});
