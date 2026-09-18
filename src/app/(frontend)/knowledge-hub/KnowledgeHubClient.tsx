'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Filter, ExternalLink, FileText } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default function KnowledgeHubClient({ publications }: { publications: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Filter logic
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            pub.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, publications, activeFilters]);

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
            
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              <h2 className="font-bold text-[var(--color-dark)] text-lg mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" /> Filters
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Topic</h3>
                  <div className="space-y-2">
                    {['Climate Strategy', 'Energy Modelling', 'Biodiversity', 'Sustainable Finance'].map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer text-gray-700">
                        <input type="checkbox" className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                        <span className="text-sm">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Publication Type</h3>
                  <div className="space-y-2">
                    {['Analysis', 'Briefing', 'Report', 'Case Study'].map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer text-gray-700">
                        <input type="checkbox" className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                        <span className="text-sm">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
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
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500 font-medium">Showing {filteredPublications.length} results</div>
                  {activeFilters.length > 0 && (
                    <button onClick={() => setActiveFilters([])} className="text-sm text-[var(--color-secondary)] hover:underline font-medium">
                      Clear all filters
                    </button>
                  )}
                </div>
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
                          <span className="text-gray-600">English</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600">{new Date(pub.date).toLocaleDateString()}</span>
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
                    No publications found.
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
