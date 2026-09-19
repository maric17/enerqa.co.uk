'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Filter, FileText, X } from 'lucide-react';
import { Container } from '@/components/ui/Container';

// K03 filter groups (handoff p. 155). Options are derived from the publications
// actually present, so a filter never offers a value that returns nothing.
type FacetKey = 'type' | 'year' | 'language' | 'author' | 'archiveCategory';

const FACET_LABELS: Record<FacetKey, string> = {
  type: 'Publication Type',
  year: 'Year',
  language: 'Language',
  author: 'Author',
  archiveCategory: 'Topic',
};

const LANGUAGE_LABELS: Record<string, string> = { en: 'English', ar: 'Arabic' };
const ARCHIVE_LABELS: Record<string, string> = {
  'climate-science-and-impacts': 'Climate Science and Impacts',
  'energy-technology-and-finance': 'Energy, Technology and Finance',
  'environment-and-society': 'Environment and Society',
  'frameworks-and-methodologies': 'Frameworks and Methodologies',
};

const valueOf = (pub: any, key: FacetKey): string | null => {
  if (key === 'year') return pub.date ? String(new Date(pub.date).getFullYear()) : null;
  return pub[key] || null;
};

const displayValue = (key: FacetKey, value: string) => {
  if (key === 'language') return LANGUAGE_LABELS[value] ?? value;
  if (key === 'archiveCategory') return ARCHIVE_LABELS[value] ?? value;
  return value;
};

export default function KnowledgeHubClient({ publications }: { publications: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  // One set of selected values per facet. Empty set = that facet is not filtering.
  const [selected, setSelected] = useState<Record<FacetKey, string[]>>({
    type: [], year: [], language: [], author: [], archiveCategory: [],
  });

  // Build the option lists from the real data rather than hard-coding them.
  const facets = useMemo(() => {
    const out = {} as Record<FacetKey, string[]>;
    (Object.keys(FACET_LABELS) as FacetKey[]).forEach((key) => {
      const values = new Set<string>();
      publications.forEach((pub) => {
        const v = valueOf(pub, key);
        if (v) values.add(v);
      });
      out[key] = [...values].sort((a, b) => (key === 'year' ? b.localeCompare(a) : a.localeCompare(b)));
    });
    return out;
  }, [publications]);

  const toggle = (key: FacetKey, value: string) =>
    setSelected((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));

  const clearAll = () =>
    setSelected({ type: [], year: [], language: [], author: [], archiveCategory: [] });

  // Flat list of active selections, for the removable chips above the results.
  const activeChips = (Object.keys(FACET_LABELS) as FacetKey[]).flatMap((key) =>
    selected[key].map((value) => ({ key, value })),
  );

  // K03: search across title, summary and approved article text.
  const filteredPublications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publications.filter((pub) => {
      const matchesSearch =
        !q ||
        pub.title?.toLowerCase().includes(q) ||
        pub.excerpt?.toLowerCase().includes(q) ||
        pub.author?.toLowerCase().includes(q);

      // Within a facet the selected values are OR'd; across facets they are AND'd.
      const matchesFacets = (Object.keys(FACET_LABELS) as FacetKey[]).every((key) => {
        if (selected[key].length === 0) return true;
        const v = valueOf(pub, key);
        return v !== null && selected[key].includes(v);
      });

      return matchesSearch && matchesFacets;
    });
  }, [searchQuery, publications, selected]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-paper)] pt-[70px]">
      
      {/* K01 Knowledge Hub Intro */}
      <section className="py-20 bg-[var(--color-dark)] text-white border-b border-gray-800">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">Knowledge Hub</h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              Explore original Enerqa analysis alongside open-access news, research and official updates from around the world. Choose Enerqa Publication for our own work, or Global Intelligence for external evidence relevant to climate, energy, environment, nature, circularity, ESG and finance.
            </p>
          </div>
        </Container>
      </section>

      {/* K02 Collection Switcher */}
      <section className="bg-white border-b border-gray-200 sticky top-[70px] z-30">
        <Container>
          <div className="flex space-x-8">
            <Link 
              href="/knowledge-hub" 
              className="py-4 border-b-2 border-[var(--color-primary)] text-[var(--color-dark)] font-bold whitespace-nowrap"
            >
              Enerqa Publication
            </Link>
            <Link 
              href="/knowledge-hub/global-intelligence" 
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-[var(--color-dark)] font-medium transition-colors whitespace-nowrap"
            >
              Global Intelligence
            </Link>
          </div>
        </Container>
      </section>

      {/* K03 Find a Publication & K04 Results */}
      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* K03 Find a Publication - filters (handoff p. 155).
                Topic, Publication Type, Year, Language and Author. Domain and
                Industry join this list once publications carry those tags. */}
            <div className="lg:col-span-1 space-y-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[var(--color-dark)] text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" /> Filters
                </h2>
                {activeChips.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-[var(--color-secondary)] hover:underline font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {(Object.keys(FACET_LABELS) as FacetKey[]).map((key) =>
                  facets[key].length === 0 ? null : (
                    <fieldset key={key} className="border-0 p-0 m-0">
                      <legend className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                        {FACET_LABELS[key]}
                      </legend>
                      <div className="space-y-2">
                        {facets[key].map((value) => (
                          <label key={value} className="flex items-center gap-2 cursor-pointer text-gray-700">
                            <input
                              type="checkbox"
                              className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                              checked={selected[key].includes(value)}
                              onChange={() => toggle(key, value)}
                            />
                            <span className="text-sm">{displayValue(key, value)}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ),
                )}
              </div>
            </div>

            {/* Search and Results */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <form className="relative max-w-2xl" onSubmit={(e) => e.preventDefault()}>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search Enerqa publications by keyword or topic" 
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                
                {/* K03: result count, removable active-filter chips and Clear All */}
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="text-sm text-gray-500 font-medium" aria-live="polite">
                    Showing {filteredPublications.length} of {publications.length} publications
                  </div>
                  {activeChips.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-sm text-[var(--color-secondary)] hover:underline font-medium whitespace-nowrap"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>

                {activeChips.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2 list-none p-0 m-0">
                    {activeChips.map(({ key, value }) => (
                      <li key={`${key}-${value}`}>
                        <button
                          onClick={() => toggle(key, value)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium bg-[var(--color-paper-alt)] text-[var(--color-dark)] border border-gray-300 rounded-full py-1.5 pl-3 pr-2 hover:border-[var(--color-dark)] transition-colors"
                          aria-label={`Remove filter ${FACET_LABELS[key]}: ${displayValue(key, value)}`}
                        >
                          <span className="text-gray-500">{FACET_LABELS[key]}:</span>
                          {displayValue(key, value)}
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* K04 Dynamic Results */}
              <div className="space-y-6">
                {filteredPublications.length > 0 ? (
                  filteredPublications.map((pub, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 hover:border-[var(--color-primary)] transition-all flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-4 text-xs font-bold uppercase tracking-wider">
                          <span className="text-[var(--color-secondary)]">{pub.type || 'Publication'}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600">{LANGUAGE_LABELS[pub.language] ?? 'English'}</span>
                          <span className="text-gray-400">|</span>
                          {/* p. 226: a date must not be presented as verified when it is not.
                              The 2024 import gave every record the same placeholder date. */}
                          <span className="text-gray-600">
                            {pub.date ? new Date(pub.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not confirmed'}
                            {pub.date && !pub.dateVerified && (
                              <span className="ml-1 normal-case font-normal text-gray-400" title="Publication date not yet verified against the original source">(date unverified)</span>
                            )}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-3">{pub.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{pub.excerpt}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {pub.author && <span className="text-gray-500 font-medium">By {pub.author}</span>}
                          
                          {pub.file?.url ? (
                            <a href={pub.file.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] font-bold hover:underline inline-flex items-center gap-1 ml-auto">
                              Download PDF <FileText className="w-4 h-4 ml-1" />
                            </a>
                          ) : (
                            <Link href={`/knowledge-hub/${pub.slug}`} className="text-[var(--color-primary)] font-bold hover:underline inline-flex items-center gap-1 ml-auto">
                              Read Article <ArrowRight className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-gray-500">
                    No relevant updates are available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* K06 Stay Informed / Contact */}
      <section className="py-20 bg-[var(--color-paper-alt)] border-t border-gray-200 mt-auto">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-3">Stay Informed</h3>
              <p className="text-gray-600 mb-6">Receive Enerqa publications and selected updates on climate, energy, environment and sustainable business.</p>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your email address" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--color-primary)] outline-none" required />
                <button type="submit" className="w-full bg-[var(--color-dark)] text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors">Subscribe</button>
              </form>
            </div>
            <div className="bg-[var(--color-dark)] p-8 rounded-2xl shadow-sm border border-gray-800 text-white flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-3">Discuss Your Project</h3>
              <p className="text-gray-300 mb-6 flex-grow">Share an idea, an investment opportunity or a challenge at any stage of development. An initial conversation can help define the evidence and support needed next.</p>
              <Link href="/contact?intent=project" className="bg-[var(--color-primary)] text-[var(--color-dark)] text-center font-bold py-3 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors">
                Discuss Your Project
              </Link>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
}
