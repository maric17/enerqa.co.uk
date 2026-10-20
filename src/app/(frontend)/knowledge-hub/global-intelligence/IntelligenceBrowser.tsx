'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { IntelligenceFilters } from './IntelligenceFilters';
import { CONTENT_TYPES, filterIntelligence, filterUrl, readingAction, type IntelligenceFilters as Filters, type IntelligenceItem } from '@/lib/feeds/intelligence';
import { changeGeography } from '@/lib/feeds/coverage';
import type { LiveIntelligenceResult } from '@/lib/feeds/liveIntelligence';

type Choice = { value: string; label: string };
const PATH = '/knowledge-hub/global-intelligence';
export function IntelligenceBrowser({ initialItems, initialFilters, initialPage, initialSourcesFailed, domains, industries, languages, labels }: {
  initialItems: IntelligenceItem[]; initialFilters: Filters; initialPage: number; initialSourcesFailed: boolean;
  domains: Choice[]; industries: Choice[]; languages: Choice[]; labels: Record<string, string>;
}) {
  const [filters, setFilters] = useState<Filters>(() => ({ ...initialFilters, source: [] }));
  // Controls can change without affecting the applied results or spending a request.
  const [draftFilters, setDraftFilters] = useState<Filters>(() => ({ ...initialFilters, source: [] }));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [currentPage, setPage] = useState(initialPage);
  const [sourcesFailed, setSourcesFailed] = useState(initialSourcesFailed);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [refreshed, setRefreshed] = useState(false);
  const controller = useRef<AbortController | undefined>(undefined);
  const sequence = useRef(0);
  const filtersChanged = filterUrl(draftFilters) !== filterUrl(filters);
  const matching = filterIntelligence(items, filters);
  const pages = Math.max(1, Math.ceil(matching.length / 12));
  const page = Math.min(pages, currentPage);
  const shown = matching.slice((page - 1) * 12, page * 12);
  // Newly discovered language metadata becomes selectable without a page reload.
  const availableLanguages = [...new Map([...languages, ...items.map(item => ({
    value: item.language ?? 'unspecified', label: item.language?.toUpperCase() ?? 'Not specified',
  }))].map(choice => [choice.value, choice])).values()];

  // No mount-time request: the server already supplied the saved database collection.
  useEffect(() => () => { controller.current?.abort(); sequence.current++; }, []);

  function changePage(next: number) {
    setPage(next);
    // Pagination reuses these results instead of spending another provider request.
    window.history.replaceState(null, '', filterUrl(filters, next));
  }

  async function applyFilters(next: Filters) {
    // Only a submitted search replaces an in-flight search; edits stay pending.
    controller.current?.abort();
    const id = ++sequence.current;
    setFilters(next); setPage(1); setLoading(true); setNotice(''); setRefreshed(false);
    window.history.replaceState(null, '', filterUrl(next));
    const abort = new AbortController();
    controller.current = abort;
    try {
      const query = filterUrl(next).split('?')[1] ?? '';
      const response = await fetch(`/api/intelligence/search?${query}`, { signal: abort.signal, cache: 'no-store' });
      if (!response.ok) throw new Error('Source search failed.');
      const result: LiveIntelligenceResult = await response.json();
      if (id !== sequence.current) return;
      setItems(previous => {
        const merged = new Map(previous.map(item => [item.url, item]));
        for (const item of result.items) merged.set(item.url, item);
        return [...merged.values()].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
      });
      setSourcesFailed(result.sourcesFailed); setRefreshed(!result.sourcesFailed);
      setNotice(result.sourcesFailed ? 'Sources could not be refreshed. Showing saved results where available.' :
        result.partialFailure ? 'Some sources could not be refreshed. Saved results remain available.' : '');
    } catch {
      if (id !== sequence.current || abort.signal.aborted) return;
      setNotice('Sources could not be refreshed. Showing saved results where available.');
    } finally {
      if (id === sequence.current) setLoading(false);
    }
  }
  return <div className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="min-w-0">
        <button type="button" aria-expanded={mobileFiltersOpen} aria-controls="intelligence-filter-panel" onClick={() => setMobileFiltersOpen(open => !open)}
          className="mb-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-left font-semibold lg:hidden">{mobileFiltersOpen ? 'Hide filters' : 'Show filters'}</button>
      <aside id="intelligence-filter-panel" aria-labelledby="intelligence-search" className={`${mobileFiltersOpen ? 'block' : 'hidden'} min-w-0 rounded-2xl border border-gray-200 bg-white p-5 lg:block`}><h2 id="intelligence-search" className="mb-5 text-xl font-bold">Filter results</h2>
        <IntelligenceFilters filters={draftFilters} domains={domains} industries={industries} languages={availableLanguages} onFiltersChange={setDraftFilters} onSearch={() => { void applyFilters(draftFilters); }} onClear={() => setDraftFilters({})} />
        {filtersChanged && <p role="status" className="mt-4 text-sm text-gray-600">Filters changed. Click Apply filters to update results.</p>}
      </aside>
      </div>
      <section aria-labelledby="external-cards" className="min-w-0 space-y-6" aria-busy={loading}>
        <h2 id="external-cards" className="text-2xl font-bold">Results</h2>
        <p role="status" className="border-b border-gray-200 pb-4 text-sm text-gray-600">{loading ? 'Updating results…' : `${matching.length} open-access results${refreshed ? ' · Updated from sources' : ' · Saved collection'}`}</p>
        {notice && <p role="status" className="text-sm text-gray-600">{notice}</p>}
        <div className="flex flex-wrap gap-2">{Object.entries(filters).flatMap(([key, values]) => values.map(value => {
          const next = { ...draftFilters, [key]: (draftFilters[key] ?? []).filter(v => v !== value) };
          if (key === 'continent' || key === 'region' || key === 'country') Object.assign(next, changeGeography({ continent: draftFilters.continent ?? [], region: draftFilters.region ?? [], country: draftFilters.country ?? [] }, key, next[key]));
          return <Link key={`${key}-${value}`} href={filterUrl(next)} onClick={e => { e.preventDefault(); setDraftFilters(next); }} aria-label={`Remove ${key}: ${labels[value] ?? value}`} className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm">{key}: {labels[value] ?? value} ×</Link>;
        }))}</div>
        {shown.length === 0 && !loading && <p role="status" className="rounded border p-8">{sourcesFailed ? 'Sources are temporarily unavailable. Please try again later.' : 'No open-access results match these filters'}. <Link href={PATH} onClick={e => { e.preventDefault(); setDraftFilters({}); }} className="underline">Clear All</Link></p>}
        <div className="grid gap-6 md:grid-cols-2">{shown.map(item => <article key={item.url} className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 space-y-3 transition-colors hover:border-[var(--color-primary-deep)]">
          <p className="text-xs font-semibold uppercase text-[var(--color-primary-deep)]">{CONTENT_TYPES[item.type]} · Open access</p>
          <h3 className="text-xl font-bold leading-snug" dir="auto"><a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">{item.title}</a></h3>
          {item.summary && <p dir="auto" className="line-clamp-3 text-sm leading-relaxed text-gray-700">{item.summary}</p>}
          <p className="text-sm">{item.type === 'disclosure' ? 'Issuer: ' : ''}{item.publisher}{item.documentType && ` · ${item.documentType}`}</p>
          <p className="text-sm">{item.type === 'disclosure' ? 'Filed' : 'Published'}: {item.publishedAt ? <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</time> : 'Date not supplied'}</p>
          <p className="text-xs text-gray-600">Source: {item.source} · Retrieved {new Date(item.retrievedAt).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC</p>
          <details className="text-xs leading-relaxed text-gray-600">
            <summary className="cursor-pointer font-semibold">Details and coverage</summary>
            <div className="mt-2 space-y-2">
              {item.authors.length > 0 && <p>Authors: {item.authors.join(', ')}</p>}
              {item.doi && <p className="break-words">DOI: {item.doi}</p>}
              <p>Coverage: {[...item.coverage.region, ...item.coverage.scope].join(', ') || item.coverage.continent.join(', ')}</p>
            </div>
          </details>
          {item.stale && <p className="text-sm font-semibold">Showing the latest cached release; the source could not be refreshed.</p>}
          <div className="mt-auto pt-3"><a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-[var(--color-primary-deep)] underline underline-offset-4">{readingAction(item.type)}</a></div>
        </article>)}</div>
        {pages > 1 && <nav aria-label="Results pages" className="flex justify-center gap-6">
          {page > 1 && <Link href={filterUrl(filters, page - 1)} onClick={e => { e.preventDefault(); changePage(page - 1); }} className="underline">Previous page</Link>}
          <span>Page {page} of {pages}</span>{page < pages && <Link href={filterUrl(filters, page + 1)} onClick={e => { e.preventDefault(); changePage(page + 1); }} className="underline">Next page</Link>}
        </nav>}
      </section>
  </div>;
}
