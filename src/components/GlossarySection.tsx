'use client';

import React, { useState, useMemo } from 'react';
import { Typography } from '@/components/ui/Typography';

type GlossaryTerm = {
  id: string;
  term: string;
  termAr?: string;
  definition: string;
  category?: string;
};

export default function GlossarySection({ terms }: { terms: GlossaryTerm[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const filteredTerms = useMemo(() => {
    let result = terms;
    
    if (activeLetter) {
      result = result.filter(t => t.term.toUpperCase().startsWith(activeLetter));
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.term.toLowerCase().includes(q) || 
        t.definition.toLowerCase().includes(q) ||
        (t.termAr && t.termAr.toLowerCase().includes(q))
      );
    }
    
    return result.sort((a, b) => a.term.localeCompare(b.term));
  }, [terms, activeLetter, searchQuery]);

  return (
    <div className="flex flex-col gap-10">
      <div className="bg-[#FAFBFB] p-6 md:p-8 rounded-[16px] border border-ink/10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div className="w-full md:max-w-md relative">
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => { setSearchQuery(e.target.value); setActiveLetter(null); }} 
            placeholder="Search glossary terms…" 
            className="w-full bg-white border border-ink/10 rounded-full px-6 py-3.5 text-[15px] text-ink outline-none focus:border-ink/30 transition-colors shadow-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-1.5 justify-center md:justify-end flex-1">
          <button
            onClick={() => setActiveLetter(null)}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-bold transition-colors ${!activeLetter ? 'bg-ink text-white' : 'bg-transparent text-ink hover:bg-ink/5'}`}
          >
            ALL
          </button>
          {alphabet.map(letter => {
            const hasTerms = terms.some(t => t.term.toUpperCase().startsWith(letter));
            return (
              <button
                key={letter}
                onClick={() => { setActiveLetter(letter); setSearchQuery(''); }}
                disabled={!hasTerms}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-bold transition-colors 
                  ${activeLetter === letter ? 'bg-ink text-white' : ''} 
                  ${!hasTerms ? 'text-ink/20 cursor-not-allowed' : 'text-ink hover:bg-ink/5'}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {filteredTerms.length === 0 ? (
          <div className="col-span-full py-10 text-center text-ink-soft">
            No terms found matching your criteria.
          </div>
        ) : (
          filteredTerms.map(t => (
            <div key={t.id} className="break-inside-avoid bg-white p-6 rounded-[12px] border border-ink/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <Typography variant="h3" className="text-ink m-0">
                  <span className="en block">{t.term}</span>
                  {t.termAr && <span className="ar block text-[0.9em] mt-1 text-ink/70">{t.termAr}</span>}
                </Typography>
                {t.category && (
                  <span className="text-[10px] uppercase tracking-wider bg-ink/5 text-ink-soft px-2 py-1 rounded">
                    {t.category}
                  </span>
                )}
              </div>
              <p className="text-[14px] leading-relaxed text-ink/80 m-0">
                {t.definition}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
