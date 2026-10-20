'use client';

import { useEffect, useRef, useState } from 'react';

type IndicatorOption = { id: string; name: string; topic?: string };
const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// Allow a single missing, extra or mistyped letter in longer search words.
function nearWord(query: string, word: string) {
  if (query.length < 4 || Math.abs(query.length - word.length) > 1) return false;
  let edits = 0;
  let left = 0;
  let right = 0;
  while (left < query.length && right < word.length) {
    if (query[left] === word[right]) { left++; right++; continue; }
    if (++edits > 1) return false;
    if (query.length <= word.length) right++;
    if (query.length >= word.length) left++;
  }
  return edits + (query.length - left) + (word.length - right) <= 1;
}

export function IndicatorSelector({ id, label, searchLabel, options, value, onChange, loading = false }: {
  id: string;
  label: string;
  searchLabel: string;
  options: IndicatorOption[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}) {
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const list = useRef<HTMLUListElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const search = normalize(query ?? '').trim();
  const matches = options.filter(option => {
    const text = normalize(`${option.name} ${option.topic ?? ''} ${option.id}`);
    if (text.includes(search)) return true;
    const words = text.split(/[^\p{L}\p{N}]+/u);
    return search.split(/\s+/).every(term => words.some(word => word.includes(term) || nearWord(term, word)));
  });
  // Bound the rendered list while preserving search across the complete catalogue.
  const visible = matches.slice(0, 80);
  const selected = options.find(option => option.id === value);
  const choose = (option: IndicatorOption) => {
    onChange(option.id);
    setQuery(null);
    setOpen(false);
    setActiveIndex(-1);
  };
  useEffect(() => {
    if (open && activeIndex >= 0) list.current?.children[activeIndex]?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex, open]);
  useEffect(() => {
    // Typing again replaces the committed label instead of appending to it.
    if (query === null && document.activeElement === input.current) input.current?.select();
  }, [value, query]);

  return <div className="min-w-0" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setQuery(null); setActiveIndex(-1); }
  }}>
    <label htmlFor={id} className="mb-2 block text-sm font-bold text-gray-700">{label}</label>
    <input ref={input} id={id} type="text" role="combobox" aria-autocomplete="list" aria-expanded={open}
      aria-controls={`${id}-options`} aria-describedby={`${id}-help`}
      aria-activedescendant={open && activeIndex >= 0 && visible[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
      autoComplete="off" placeholder={loading ? 'Loading catalogue…' : searchLabel} value={query ?? selected?.name ?? ''}
      disabled={loading || options.length === 0}
      className="w-full min-w-0 rounded-lg border border-gray-300 p-3 text-base md:text-sm focus:outline-2 focus:outline-[var(--color-primary)]"
      onFocus={event => { setOpen(true); event.currentTarget.select(); }} onClick={event => { setOpen(true); if (query === null) event.currentTarget.select(); }}
      onChange={event => { setQuery(event.target.value); setOpen(true); setActiveIndex(0); }}
      onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); setOpen(false); setQuery(null); setActiveIndex(-1); }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault(); setOpen(true);
          setActiveIndex(index => !visible.length ? -1 : index < 0 ? (event.key === 'ArrowDown' ? 0 : visible.length - 1)
            : (index + (event.key === 'ArrowDown' ? 1 : visible.length - 1)) % visible.length);
        }
        if (event.key === 'Enter' && open) { event.preventDefault(); if (visible[activeIndex]) choose(visible[activeIndex]); }
      }} />
    {open && <ul ref={list} id={`${id}-options`} role="listbox" aria-label={`${label} suggestions`} data-lenis-prevent
      className="m-0 mt-2 max-h-56 list-none overflow-y-auto overscroll-contain rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
      {visible.map((option, index) => <li key={option.id} role="presentation">
        <button id={`${id}-option-${index}`} type="button" role="option" aria-label={option.name} aria-describedby={option.topic ? `${id}-topic-${index}` : undefined} aria-selected={option.id === value} tabIndex={-1}
          className={`w-full rounded p-3 text-left text-sm ${index === activeIndex ? 'bg-blue-50 text-[var(--color-primary-deep)]' : 'hover:bg-gray-50'}`}
          onMouseDown={event => event.preventDefault()} onClick={() => choose(option)}>
          {option.name}{option.topic && <span id={`${id}-topic-${index}`} className="mt-1 block text-xs text-gray-500">{option.topic}</span>}
        </button>
      </li>)}
      {!matches.length && <li role="presentation" className="p-3 text-sm text-gray-600">Try another name, topic or indicator code.</li>}
    </ul>}
    <p id={`${id}-help`} role="status" className="mt-2 text-xs text-gray-500">
      {open ? (matches.length ? `${matches.length.toLocaleString()} indicators found${matches.length > visible.length ? '; refine your search to see more' : ''}. Use arrow keys and Enter to select.` : 'No indicators match your search.') : 'Type to search and choose an indicator.'}
    </p>
  </div>;
}
