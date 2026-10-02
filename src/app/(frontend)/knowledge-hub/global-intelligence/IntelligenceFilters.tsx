'use client';
import { useState } from 'react';
import { COUNTRIES, CONTINENTS, REGIONS, SCOPES, changeGeography, type GeographySelection } from '@/lib/feeds/coverage';
import { CONTENT_TYPES, type IntelligenceFilters as Filters } from '@/lib/feeds/intelligence';
import { NEWS_BASKETS } from '@/lib/api/news/types';

type Choice = { value: string; label: string };
export function IntelligenceFilters({ filters, domains, industries, sources, languages }: {
  filters: Filters; domains: Choice[]; industries: Choice[]; sources: Choice[]; languages: Choice[];
}) {
  const [geo, setGeo] = useState<GeographySelection>({ continent: filters.continent ?? [], region: filters.region ?? [], country: filters.country ?? [] });
  const [feedback, setFeedback] = useState('');
  const choices = (values: string[]): Choice[] => values.map(value => ({ value, label: value }));
  function field(name: string, label: string, options: Choice[], geographic = false) {
    const selected = geographic ? geo[name as keyof GeographySelection] : filters[name] ?? [];
    return <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold" key={name}>
      {label}
      <select name={name} multiple size={4} defaultValue={geographic ? undefined : selected} value={geographic ? selected : undefined}
        className="w-full rounded border border-gray-300 bg-white p-2 font-normal focus:ring-2 focus:ring-[var(--color-primary-deep)]"
        onChange={geographic ? e => {
          const values = Array.from(e.currentTarget.selectedOptions, o => o.value);
          const next = changeGeography(geo, name as keyof GeographySelection, values);
          const removed = [...geo.country.filter(c => !next.country.includes(c)), ...geo.region.filter(r => !next.region.includes(r))];
          setGeo(next);
          setFeedback(removed.length ? 'Conflicting country or region selections were cleared.' : 'Geography updated. Country selections also set their parent region and continent.');
        } : undefined}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>;
  }
  // Keep other regions selectable: choosing Qatar must not prevent adding Germany.
  // Parent edits still clear conflicting children through changeGeography.
  const regions = REGIONS;
  const countries = COUNTRIES;
  return <form method="GET" action="/knowledge-hub/global-intelligence" role="search" className="space-y-6">
    <div className="flex flex-wrap gap-3">
      <label htmlFor="intelligence-query" className="sr-only">Search Global Intelligence</label>
      <input id="intelligence-query" name="q" type="search" dir="auto" defaultValue={filters.q?.[0] ?? ''} maxLength={120}
        placeholder="Search global intelligence by keyword or topic." className="min-w-0 flex-1 rounded border border-gray-300 bg-white p-3" />
      <button className="rounded bg-[var(--color-dark)] px-6 py-3 text-white font-semibold">Search</button>
    </div>
    <p className="text-sm text-gray-600">Choose multiple options with Ctrl (Windows) or Command (Mac). Options within a filter match any selection; different filters must all match. Selecting countries also selects their parent regions and continents.</p>
    <div className="grid gap-4 md:grid-cols-3">
      {field('theme', 'Topic', NEWS_BASKETS.filter(b => b.key !== 'all').map(b => ({ value: b.key, label: b.label })))}
      {field('domain', 'Domain', domains)}{field('industry', 'Industry', industries)}
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {field('continent', 'Continent', choices([...CONTINENTS, ...SCOPES]), true)}
      {field('region', 'Region', choices([...regions, ...SCOPES]), true)}
      {field('country', 'Country', countries.map(c => ({ value: c.code, label: c.name })), true)}
    </div>
    <p role="status" className="text-sm">{feedback}</p>
    <details open={['type', 'source', 'language', 'dateRange'].some(key => filters[key]?.length)}>
      <summary className="cursor-pointer font-semibold">Additional Filters</summary>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {field('type', 'Content Type', Object.entries(CONTENT_TYPES).map(([value, label]) => ({ value, label })))}
        {field('language', 'Language', languages)}{field('source', 'Source', sources)}
        {field('dateRange', 'Date Range', [{ value: '24h', label: 'Past 24 hours' }, { value: '7d', label: 'Past 7 days' }, { value: '30d', label: 'Past 30 days' }])}
      </div>
    </details>
    <div className="flex gap-4 items-center"><button className="rounded bg-[var(--color-dark)] text-white px-5 py-2">Apply filters</button><a href="/knowledge-hub/global-intelligence" className="underline">Clear All</a></div>
  </form>;
}
