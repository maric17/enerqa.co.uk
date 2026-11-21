'use client';
import { useEffect, useRef, useState } from 'react';
import Link from '@/components/ui/SiteLink';
import { IntelligenceFilters } from './IntelligenceFilters';
import { CONTENT_TYPES, filterIntelligence, filterUrl, readingAction, type IntelligenceFilters as Filters, type IntelligenceItem } from '@/lib/feeds/intelligence';
import { changeGeography } from '@/lib/feeds/coverage';
import type { LiveIntelligenceResult } from '@/lib/feeds/liveIntelligence';
import { useSiteLanguage } from '@/components/LanguageProvider';
import { pilotHref } from '@/lib/i18n/pilot';
import { DATE_RANGES, FILTER_LABELS, intelligenceCountry, intelligenceLanguage, intelligenceText } from '@/lib/i18n/intelligence';

type Choice = { value: string; label: string };
const PATH = '/knowledge-hub/global-intelligence';
export function IntelligenceBrowser({ initialItems, initialFilters, initialPage, initialSourcesFailed, domains, industries, languages, labels }: {
  initialItems: IntelligenceItem[]; initialFilters: Filters; initialPage: number; initialSourcesFailed: boolean;
  domains: Choice[]; industries: Choice[]; languages: Choice[]; labels: Record<string, string>;
}) {
  const language = useSiteLanguage();
  const t = (text: string) => intelligenceText(language, text);
  const arabic = language === 'ar';
  const dateLocale = arabic ? 'ar-QA' : 'en-GB';
  function filterValue(key: string, value: string) {
    const label = labels[value] ?? value;
    if (!arabic) return label;
    if (key === 'q') return value;
    if (key === 'country') return intelligenceCountry(language, value, label);
    if (key === 'language') return intelligenceLanguage(language, value);
    if (key === 'dateRange') return t(DATE_RANGES.find(range => range.value === value)?.label ?? label);
    return t(label);
  }
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
    window.history.replaceState(null, '', pilotHref(language, filterUrl(filters, next)));
  }

  async function applyFilters(next: Filters) {
    // Only a submitted search replaces an in-flight search; edits stay pending.
    controller.current?.abort();
    const id = ++sequence.current;
    setFilters(next); setPage(1); setLoading(true); setNotice(''); setRefreshed(false);
    window.history.replaceState(null, '', pilotHref(language, filterUrl(next)));
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
          className="mb-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-start font-semibold lg:hidden">{t(mobileFiltersOpen ? 'Hide filters' : 'Show filters')}</button>
      <aside id="intelligence-filter-panel" aria-labelledby="intelligence-search" className={`${mobileFiltersOpen ? 'block' : 'hidden'} min-w-0 rounded-2xl border border-gray-200 bg-white p-5 lg:block`}><h2 id="intelligence-search" className="mb-5 text-xl font-bold">{t('Filter results')}</h2>
        <IntelligenceFilters filters={draftFilters} domains={domains} industries={industries} languages={availableLanguages} onFiltersChange={setDraftFilters} onSearch={() => { void applyFilters(draftFilters); }} onClear={() => setDraftFilters({})} />
        {filtersChanged && <p role="status" className="mt-4 text-sm text-gray-600">{t('Filters changed. Click Apply filters to update results.')}</p>}
      </aside>
      </div>
      <section aria-labelledby="external-cards" className="min-w-0 space-y-6" aria-busy={loading}>
        <h2 id="external-cards" className="text-2xl font-bold">{t('Results')}</h2>
        <p role="status" className="border-b border-gray-200 pb-4 text-sm text-gray-600">{loading ? t('Updating results…') : `${arabic ? `النتائج المتاحة للقراءة مجاناً: ${matching.length.toLocaleString('ar-QA')}` : `${matching.length} open-access results`} · ${t(refreshed ? 'Updated from sources' : 'Saved collection')}`}</p>
        {notice && <p role="status" className="text-sm text-gray-600">{t(notice)}</p>}
        <div className="flex flex-wrap gap-2">{Object.entries(filters).flatMap(([key, values]) => values.map(value => {
          const next = { ...draftFilters, [key]: (draftFilters[key] ?? []).filter(v => v !== value) };
          if (key === 'continent' || key === 'region' || key === 'country') Object.assign(next, changeGeography({ continent: draftFilters.continent ?? [], region: draftFilters.region ?? [], country: draftFilters.country ?? [] }, key, next[key]));
          const field = arabic ? t(FILTER_LABELS[key] ?? key) : key;
          const label = filterValue(key, value);
          return <Link key={`${key}-${value}`} href={filterUrl(next)} onClick={e => { e.preventDefault(); setDraftFilters(next); }} aria-label={`${arabic ? 'إزالة' : 'Remove'} ${field}: ${label}`} className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm">{field}: <bdi>{label}</bdi> ×</Link>;
        }))}</div>
        {shown.length === 0 && !loading && <p role="status" className="rounded border p-8">{t(sourcesFailed ? 'Sources are temporarily unavailable. Please try again later.' : 'No open-access results match these filters.')} <Link href={PATH} onClick={e => { e.preventDefault(); setDraftFilters({}); }} className="underline">{t('Clear All')}</Link></p>}
        <div className="grid gap-6 md:grid-cols-2">{shown.map(item => <article key={item.url} className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 space-y-3 transition-colors hover:border-[var(--color-primary-deep)]">
          <p className="text-xs font-semibold uppercase text-[var(--color-primary-deep)]">{t(CONTENT_TYPES[item.type])} · {t('Open access')}</p>
          <h3 className="text-xl font-bold leading-snug" dir="auto" lang={item.language ?? undefined}><a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">{item.title}</a></h3>
          {item.summary && <p dir="auto" lang={item.language ?? undefined} className="line-clamp-3 text-sm leading-relaxed text-gray-700">{item.summary}</p>}
          <p className="text-sm">{item.type === 'disclosure' && <>{t('Issuer')}: </>}<bdi>{item.publisher}</bdi>{item.documentType && <> · <bdi>{item.documentType}</bdi></>}</p>
          <p className="text-sm">{t(item.type === 'disclosure' ? 'Filed' : 'Published')}: {item.publishedAt ? <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString(dateLocale, { timeZone: 'UTC' })}</time> : t('Date not supplied')}</p>
          <p className="text-xs text-gray-600">{t('Source:')} <bdi>{item.source}</bdi> · {t('Retrieved')} {new Date(item.retrievedAt).toLocaleString(dateLocale, { timeZone: 'UTC' })} UTC</p>
          <details className="text-xs leading-relaxed text-gray-600">
            <summary className="cursor-pointer font-semibold">{t('Details and coverage')}</summary>
            <div className="mt-2 space-y-2">
              {item.authors.length > 0 && <p>{t('Authors:')} <bdi>{item.authors.join(', ')}</bdi></p>}
              {item.doi && <p className="break-words">DOI: <bdi>{item.doi}</bdi></p>}
              <p>{t('Coverage:')} {(item.coverage.region.length || item.coverage.scope.length ? [...item.coverage.region, ...item.coverage.scope] : item.coverage.continent).map(t).join(arabic ? '، ' : ', ')}</p>
            </div>
          </details>
          {item.stale && <p className="text-sm font-semibold">{t('Showing the latest cached release; the source could not be refreshed.')}</p>}
          <div className="mt-auto pt-3"><a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-[var(--color-primary-deep)] underline underline-offset-4">{t(readingAction(item.type))}</a></div>
        </article>)}</div>
        {pages > 1 && <nav aria-label={t('Results pages')} className="flex justify-center gap-6">
          {page > 1 && <Link href={filterUrl(filters, page - 1)} onClick={e => { e.preventDefault(); changePage(page - 1); }} className="underline">{t('Previous page')}</Link>}
          <span>{arabic ? `الصفحة ${page} من ${pages}` : `Page ${page} of ${pages}`}</span>{page < pages && <Link href={filterUrl(filters, page + 1)} onClick={e => { e.preventDefault(); changePage(page + 1); }} className="underline">{t('Next page')}</Link>}
        </nav>}
      </section>
  </div>;
}
