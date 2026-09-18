'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Filter, ExternalLink, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default function GlobalIntelligencePage() {
  const [searchQuery, setSearchQuery] = useState('climate OR energy');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        // Fallback to a predefined query if empty
        const q = searchQuery.trim() || 'climate OR energy';
        const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&language=en&pageSize=6`, {
          headers: {
            'X-Api-Key': process.env.NEXT_PUBLIC_NEWS_API_KEY || 'fa78e2e520db4f52ab0f2b7597f8e188'
          }
        });
        const data = await res.json();
        if (data.articles) {
          setArticles(data.articles);
        }
      } catch (e) {
        console.error("Failed to fetch news", e);
      }
      setLoading(false);
    }
    
    // Debounce search slightly
    const timeoutId = setTimeout(() => {
      fetchNews();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
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
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-[var(--color-dark)] font-medium transition-colors whitespace-nowrap"
            >
              Enerqa Publication
            </Link>
            <Link 
              href="/knowledge-hub/global-intelligence" 
              className="py-4 border-b-2 border-[var(--color-primary)] text-[var(--color-dark)] font-bold whitespace-nowrap"
            >
              Global Intelligence
            </Link>
          </div>
        </Container>
      </section>

      {/* K05 Global Intelligence Search & Results */}
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
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Content Type</h3>
                  <div className="space-y-2">
                    {['News', 'Research and Articles', 'Policy & Official Updates', 'Corporate Disclosures'].map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer text-gray-700">
                        <input type="checkbox" className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                        <span className="text-sm">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Topic</h3>
                  <div className="space-y-2">
                    {['Climate Policy', 'Renewable Energy', 'Biodiversity', 'Green Finance'].map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer text-gray-700">
                        <input type="checkbox" className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                        <span className="text-sm">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Continent / Region</h3>
                  <div className="space-y-2">
                    {['Global', 'Europe', 'North America', 'MENA', 'Asia'].map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer text-gray-700">
                        <input type="checkbox" className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                        <span className="text-sm">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Date Range</h3>
                  <select className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[var(--color-primary)] outline-none">
                    <option>Past 24 hours</option>
                    <option>Past week</option>
                    <option>Past month</option>
                    <option>Past year</option>
                    <option>All time</option>
                  </select>
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
                    placeholder="Search global intelligence by keyword, topic or region" 
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500 font-medium">Showing 150+ external results</div>
                  {activeFilters.length > 0 && (
                    <button onClick={() => setActiveFilters([])} className="text-sm text-[var(--color-secondary)] hover:underline font-medium">
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>

              {/* External Content Cards (X03) */}
              <div className="space-y-6">
                {loading ? (
                  <div className="py-20 flex justify-center items-center">
                    <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
                  </div>
                ) : articles.length > 0 ? (
                  articles.map((article, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 hover:border-[var(--color-primary)] transition-all flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-4 text-xs font-bold uppercase tracking-wider">
                          <span className="text-[var(--color-primary)]">{article.source.name}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600">News</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600">{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--color-dark)] mb-3">{article.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{article.description}</p>
                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-secondary)] font-bold hover:underline inline-flex items-center gap-1">
                          Read Full Article <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-gray-500">
                    No articles found for "{searchQuery}".
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="mt-10 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button className="px-4 py-2 border border-gray-200 rounded-md text-gray-500 disabled:opacity-50" disabled>Previous</button>
                  <button className="w-10 h-10 bg-[var(--color-dark)] text-white rounded-md font-bold">1</button>
                  <button className="w-10 h-10 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md">2</button>
                  <button className="w-10 h-10 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md">3</button>
                  <span className="text-gray-400 px-2">...</span>
                  <button className="w-10 h-10 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md">42</button>
                  <button className="px-4 py-2 border border-gray-200 rounded-md text-[var(--color-dark)] font-medium hover:bg-gray-50">Next</button>
                </nav>
              </div>

            </div>
          </div>
        </Container>
      </section>

    </div>
  );
}
