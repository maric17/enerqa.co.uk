'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, Download, ArrowRight, Table, BarChart2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import DataPortalD03 from '@/components/data/DataPortalD03';

export default function DataPortalClient({ datasets, dashboards = [], categories = [] }: { datasets: any[], dashboards?: any[], categories?: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopics, setActiveTopics] = useState<string[]>([]);
  const [activeDomains, setActiveDomains] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');
  const [selectedGeography, setSelectedGeography] = useState<string>('All');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  
  // Dynamic facets
  const geographies = useMemo(() => Array.from(new Set(datasets.map(d => d.geographicLevel).filter(Boolean))), [datasets]);
  const periods = useMemo(() => Array.from(new Set(datasets.map(d => d.observationPeriod).filter(Boolean))), [datasets]);
  const sources = useMemo(() => Array.from(new Set(datasets.map(d => d.provider).filter(Boolean))), [datasets]);
  const frequencies = useMemo(() => Array.from(new Set(datasets.map(d => d.frequency).filter(Boolean))), [datasets]);
  const formats = useMemo(() => Array.from(new Set(datasets.map(d => d.format).filter(Boolean))), [datasets]);

  // Filter logic
  const filteredDatasets = useMemo(() => {
    return datasets.filter(ds => {
      const matchesSearch = ds.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            ds.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDomain = activeDomains.length === 0 || activeDomains.some(d => ds.topic?.some((t: any) => t.title === d));
      const matchesTopic = selectedTopic === 'All Topics' || ds.topic?.some((t: any) => t.title === selectedTopic);
      const matchesGeography = selectedGeography === 'All' || ds.geographicLevel === selectedGeography;
      const matchesPeriod = selectedPeriod === 'All' || ds.observationPeriod === selectedPeriod;
      const matchesSource = selectedSource === 'All' || ds.provider === selectedSource;
      const matchesFrequency = selectedFrequency === 'All' || ds.frequency === selectedFrequency;
      const matchesFormat = selectedFormat === 'All' || ds.format === selectedFormat;

      return matchesSearch && matchesDomain && matchesTopic && matchesGeography && matchesPeriod && matchesSource && matchesFrequency && matchesFormat;
    });
  }, [searchQuery, datasets, activeDomains, selectedTopic, selectedGeography, selectedPeriod, selectedSource, selectedFrequency, selectedFormat]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-paper)] pt-[70px]">
      
      {/* D01 Data Portal Intro */}
      <section className="py-20 bg-[var(--color-dark)] text-white border-b border-gray-800">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">Data Portal</h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              Explore open-access data across all four domains: Climate Action, Energy Systems, Environment, and Sustainable Business. Search datasets supplied through free APIs, compare trends through charts and tables, and download the available data free of charge.
            </p>
          </div>
        </Container>
      </section>

      {/* D03 Explore a Dataset */}
      <DataPortalD03 />

      {/* D05 Dashboards and Data Stories */}
      {dashboards && dashboards.length > 0 && (
        <section className="py-16 bg-gray-50 border-b border-gray-200">
          <Container>
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-8">Dashboards and Data Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dashboards.map((db, idx) => (
                <Link key={idx} href={`/data-portal/dashboards/${db.slug}`} className="block group">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full transition-all group-hover:border-[var(--color-primary)] group-hover:shadow-md">
                    <h3 className="text-xl font-bold text-[var(--color-dark)] mb-3 group-hover:text-[var(--color-primary)] transition-colors">{db.title}</h3>
                    <p className="text-gray-600 line-clamp-3 mb-4">{db.description}</p>
                    <span className="text-[var(--color-secondary)] font-bold inline-flex items-center gap-1">
                      View Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* D02 & D04 Find Data & Catalogue */}
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
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Domain</h3>
                  <div className="space-y-2">
                    {['Climate Action', 'Energy Systems', 'Environment', 'Sustainable Business'].map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer text-gray-700">
                        <input 
                          type="checkbox" 
                          checked={activeDomains.includes(t)}
                          onChange={(e) => {
                            if (e.target.checked) setActiveDomains([...activeDomains, t]);
                            else setActiveDomains(activeDomains.filter(d => d !== t));
                          }}
                          className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
                        />
                        <span className="text-sm">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Topic</h3>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[var(--color-primary)] outline-none"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                  >
                    <option value="All Topics">All Topics</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.title}>{cat.title}</option>
                    ))}
                  </select>
                </div>

                {geographies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Geography</h3>
                    <select 
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[var(--color-primary)] outline-none"
                      value={selectedGeography}
                      onChange={(e) => setSelectedGeography(e.target.value)}
                    >
                      <option value="All">All</option>
                      {geographies.map((val: any) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                )}

                {periods.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Observation Period</h3>
                    <select 
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[var(--color-primary)] outline-none"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                      <option value="All">All</option>
                      {periods.map((val: any) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                )}

                {sources.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Source</h3>
                    <select 
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[var(--color-primary)] outline-none"
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value)}
                    >
                      <option value="All">All</option>
                      {sources.map((val: any) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                )}

                {frequencies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Frequency</h3>
                    <select 
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[var(--color-primary)] outline-none"
                      value={selectedFrequency}
                      onChange={(e) => setSelectedFrequency(e.target.value)}
                    >
                      <option value="All">All</option>
                      {frequencies.map((val: any) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formats.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Format</h3>
                    <select 
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-[var(--color-primary)] outline-none"
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                    >
                      <option value="All">All</option>
                      {formats.map((val: any) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
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
                    placeholder="Search datasets or indicators" 
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500 font-medium">Showing {filteredDatasets.length} datasets</div>
                  {(activeDomains.length > 0 || selectedTopic !== 'All Topics' || selectedGeography !== 'All' || selectedPeriod !== 'All' || selectedSource !== 'All' || selectedFrequency !== 'All' || selectedFormat !== 'All') && (
                    <button onClick={() => { setActiveDomains([]); setSelectedTopic('All Topics'); setSelectedGeography('All'); setSelectedPeriod('All'); setSelectedSource('All'); setSelectedFrequency('All'); setSelectedFormat('All'); }} className="text-sm text-[var(--color-secondary)] hover:underline font-medium">
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>

              {/* D04 Dynamic Dataset Catalogue */}
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[var(--color-dark)]">Dataset Catalogue</h2>
                  <p className="text-gray-600">Browse and download our curated collection of datasets.</p>
                </div>
                {filteredDatasets.length > 0 ? (
                  filteredDatasets.map((ds, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 hover:border-[var(--color-primary)] transition-all flex flex-col md:flex-row gap-8 items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3 text-xs font-bold uppercase tracking-wider">
                          <span className="text-[var(--color-primary)]">{ds.apiEndpoint ? 'API Source' : 'Dataset'}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600">Updated: {new Date(ds.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {ds.version && (
                            <>
                              <span className="text-gray-400">|</span>
                              <span className="text-gray-600">
                                {ds.version.match(/^v?\d/) ? (ds.version.startsWith('v') ? ds.version : `v${ds.version}`) : ds.version}
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-3">{ds.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{ds.description}</p>
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm text-gray-600">
                          {ds.provider && (
                            <div><span className="font-bold text-gray-800">Provider:</span> {ds.provider}</div>
                          )}
                          {ds.originalUnit && (
                            <div><span className="font-bold text-gray-800">Unit:</span> {ds.originalUnit}</div>
                          )}
                          {ds.geographicLevel && (
                            <div><span className="font-bold text-gray-800">Geography:</span> {ds.geographicLevel}</div>
                          )}
                          {ds.licence && (
                            <div><span className="font-bold text-gray-800">Licence:</span> {ds.licenceUrl ? <a href={ds.licenceUrl} target="_blank" className="hover:underline text-[var(--color-primary)]">{ds.licence}</a> : ds.licence}</div>
                          )}
                        </div>

                        <div className="flex gap-4">
                          <Link href={`/data-portal/datasets/${ds.slug || ds.id}`} className="text-[var(--color-secondary)] font-bold hover:underline inline-flex items-center gap-1">
                            Explore Dataset <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                      <div className="w-full md:w-48 bg-[var(--color-paper-alt)] rounded-lg p-4 flex flex-col items-center justify-center gap-2 border border-gray-100 flex-shrink-0">
                        {ds.datasetDownloadUrl ? (
                           <>
                             <Download className="w-8 h-8 text-[var(--color-primary)]" />
                             <a href={ds.datasetDownloadUrl} target="_blank" className="text-xs text-center text-gray-500 font-medium hover:underline hover:text-[var(--color-dark)]">Free Download</a>
                           </>
                        ) : ds.file?.url ? (
                           <>
                             <Download className="w-8 h-8 text-[var(--color-primary)]" />
                             <a href={ds.file.url} target="_blank" className="text-xs text-center text-gray-500 font-medium hover:underline hover:text-[var(--color-dark)]">Download File</a>
                           </>
                        ) : (
                           <>
                             <BarChart2 className="w-8 h-8 text-gray-400" />
                             <span className="text-xs text-center text-gray-500 font-medium">Data visualization</span>
                           </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-gray-500">
                    No datasets found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* D06 Sources and Methodology */}
      <section className="py-20 bg-[var(--color-paper-alt)] border-t border-gray-200 mt-auto">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-6">Sources and Methodology</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Review where the data comes from, what it measures and how it can be reused. Source notes explain coverage, units, limitations, update schedules and any transformations made for display.
            </p>
            <Link href="/data-portal/sources" className="inline-flex items-center gap-2 bg-[var(--color-dark)] text-white font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors">
              Sources and Methodology <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </section>

    </div>
  );
}
