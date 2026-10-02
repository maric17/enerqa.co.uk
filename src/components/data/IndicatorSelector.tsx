'use client';

import { useState } from 'react';

type IndicatorOption = { id: string; name: string; topic?: string };

export function IndicatorSelector({ id, label, searchLabel, options, value, onChange, loading = false }: {
  id: string;
  label: string;
  searchLabel: string;
  options: IndicatorOption[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}) {
  const [query, setQuery] = useState('');
  const search = query.trim().toLowerCase();
  const matches = options.filter(option => `${option.name} ${option.topic ?? ''} ${option.id}`.toLowerCase().includes(search));
  const selected = options.find(option => option.id === value);
  const inputClass = 'w-full min-w-0 border border-gray-300 rounded-lg p-3 text-sm focus:outline-2 focus:outline-[var(--color-primary)]';

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <input type="search" aria-label={searchLabel} aria-controls={id} placeholder={searchLabel} value={query} onChange={e => setQuery(e.target.value)} className={`${inputClass} mb-2`} />
      <select id={id} value={value} onChange={e => onChange(e.target.value)} disabled={loading || options.length === 0} className={inputClass}>
        {loading && <option value="">Loading catalogue...</option>}
        {/* Searching narrows choices without silently changing the selected indicator. */}
        {selected && !matches.includes(selected) && <option value={selected.id} hidden>{selected.name}</option>}
        {matches.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
      {!loading && <p role="status" className="mt-1 text-xs text-gray-500">{matches.length ? `${matches.length.toLocaleString()} indicators available` : 'No indicators match your search.'}</p>}
    </div>
  );
}
