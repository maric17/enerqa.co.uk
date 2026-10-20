'use client';
import { useState } from 'react';
import { COUNTRIES, CONTINENTS, REGIONS, SCOPES, changeGeography, type GeographySelection } from '@/lib/feeds/coverage';
import { CONTENT_TYPES, type IntelligenceFilters as Filters } from '@/lib/feeds/intelligence';
import { NEWS_BASKETS } from '@/lib/api/news/types';

type Choice = { value: string; label: string };
export function IntelligenceFilters({ filters, domains, industries, languages, onFiltersChange, onSearch, onClear }: {
  filters: Filters; domains: Choice[]; industries: Choice[]; languages: Choice[];
  onFiltersChange?: (filters: Filters) => void; onSearch?: () => void; onClear?: () => void;
}) {
  const [localFilters, setLocalFilters] = useState(filters);
  const current = onFiltersChange ? filters : localFilters;
  const geo = { continent: current.continent ?? [], region: current.region ?? [], country: current.country ?? [] };
  const [feedback, setFeedback] = useState('');
  const choices = (values: string[]): Choice[] => values.map(value => ({ value, label: value }));
  const update = (next: Filters) => { setLocalFilters(next); onFiltersChange?.(next); };
  function field(name: string, label: string, options: Choice[], geographic = false) {
    const selected = current[name] ?? [];
    return <fieldset className="min-w-0" key={name}>
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      {/* Each list scrolls independently and supports keyboard scrolling. */}
      <div role="group" aria-label={`${label} options`} tabIndex={0} data-lenis-prevent
        className="max-h-44 overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-gray-50 p-2 focus-visible:outline-2 focus-visible:outline-[var(--color-primary-deep)]">
        {options.map(option => <label key={option.value} className="flex cursor-pointer items-start gap-2 rounded p-2 text-sm leading-snug hover:bg-white">
          <input type="checkbox" name={name} value={option.value} checked={selected.includes(option.value)} className="mt-0.5 shrink-0 accent-[var(--color-primary-deep)]"
            onChange={event => {
              const values = event.currentTarget.checked ? [...selected, option.value] : selected.filter(value => value !== option.value);
              if (!geographic) { update({ ...current, [name]: values }); return; }
              const next = changeGeography(geo, name as keyof GeographySelection, values);
              const removed = [...geo.country.filter(country => !next.country.includes(country)), ...geo.region.filter(region => !next.region.includes(region))];
              update({ ...current, ...next });
              setFeedback(removed.length ? 'Conflicting country or region selections were cleared.' : 'Geography updated. Country selections also set their parent region and continent.');
            }} />
          <span>{option.label}</span>
        </label>)}
        {!options.length && <p className="p-2 text-xs text-gray-500">No options available.</p>}
      </div>
    </fieldset>;
  }
  const additionalCount = ['type', 'language', 'dateRange'].reduce((count, key) => count + (current[key]?.length ?? 0), 0);
  return <form method="GET" action="/knowledge-hub/global-intelligence" role="search" className="space-y-5"
    onSubmit={onSearch ? event => { event.preventDefault(); onSearch(); } : undefined}>
    <div className="space-y-2">
      <label htmlFor="intelligence-query" className="sr-only">Search Global Intelligence</label>
      <input id="intelligence-query" name="q" type="search" dir="auto" value={current.q?.[0] ?? ''}
        onChange={event => update({ ...current, q: event.currentTarget.value ? [event.currentTarget.value] : [] })} maxLength={120}
        placeholder="Search a keyword or topic" className="w-full min-w-0 rounded-lg border border-gray-300 bg-white p-3 text-sm" />
      <button className="w-full rounded-lg bg-[var(--color-dark)] px-6 py-3 font-semibold text-white">Search</button>
    </div>
    <p className="text-xs leading-relaxed text-gray-600">Select any options, then apply filters. Options in the same group match any selection. Different groups must all match.</p>
    {field('theme', 'Topic', NEWS_BASKETS.filter(basket => basket.key !== 'all').map(basket => ({ value: basket.key, label: basket.label })))}
    {field('domain', 'Domain', domains)}
    {field('industry', 'Industry', industries)}
    {field('continent', 'Continent', choices([...CONTINENTS, ...SCOPES]), true)}
    {field('region', 'Region', choices([...REGIONS, ...SCOPES]), true)}
    {field('country', 'Country', COUNTRIES.map(country => ({ value: country.code, label: country.name })), true)}
    <p role="status" className="text-xs text-gray-600">{feedback}</p>
    {/* Advanced choices stay collapsed initially, including on a bookmarked search. */}
    <details>
      <summary className="cursor-pointer text-sm font-semibold">Additional filters{additionalCount > 0 && ` (${additionalCount} selected)`}</summary>
      <div className="mt-4 space-y-5">
        {field('type', 'Content Type', Object.entries(CONTENT_TYPES).map(([value, label]) => ({ value, label })))}
        {field('language', 'Language', languages)}
        {field('dateRange', 'Date Range', [{ value: '24h', label: 'Past 24 hours' }, { value: '7d', label: 'Past 7 days' }, { value: '30d', label: 'Past 30 days' }])}
      </div>
    </details>
    <div className="flex flex-wrap items-center gap-4"><button className="rounded-lg bg-[var(--color-dark)] px-5 py-3 text-sm font-semibold text-white">Apply filters</button><a href="/knowledge-hub/global-intelligence" onClick={onClear ? event => { event.preventDefault(); onClear(); } : undefined} className="text-sm underline">Clear All</a></div>
  </form>;
}
