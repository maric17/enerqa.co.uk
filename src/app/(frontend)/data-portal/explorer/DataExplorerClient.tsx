'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ReactECharts from 'echarts-for-react';
import { Container } from '@/components/ui/Container';
import { Loader2, AlertCircle, Table as TableIcon, Download, Info, BarChart2, Activity, ShieldAlert } from 'lucide-react';
import { ExternalEmbed } from '@/components/ExternalEmbed';

type Dataset = {
  id: string;
  name: string;
  topic: string;
  source: string;
  licence: string;
};

type Observation = {
  geo: string;
  time: string;
  value: number;
};

type Metadata = Dataset & {
  attribution: string;
  concept: string;
};

export default function DataExplorerClient() {
  const [catalogue, setCatalogue] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const [observations, setObservations] = useState<Observation[]>([]);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'explorer' | 'gapminder'>('explorer');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter' | 'table'>('line');
  
  // Step 11: Accessibility
  const [reduceMotion, setReduceMotion] = useState(false);

  // Step 11b: iframe consent

  // UI Filters
  const [geoFilter, setGeoFilter] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/data-portal/catalogue?limit=1000')
      .then(res => res.json())
      .then(data => {
        if (data.results) {
          setCatalogue(data.results);
          if (data.results.length > 0) {
            setSelectedDatasetId(data.results[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedDatasetId) return;

    let active = true;
    setLoading(true);
    setError(null);
    setObservations([]);
    setMetadata(null);
    setGeoFilter([]);

    Promise.all([
      fetch(`/api/data-portal/metadata?id=${selectedDatasetId}`).then(r => r.json()),
      fetch(`/api/data-portal/observations?id=${selectedDatasetId}`).then(r => r.json())
    ])
    .then(([metaData, obsData]) => {
      if (!active) return;
      if (metaData.error) throw new Error(metaData.error);
      if (obsData.error) throw new Error(obsData.error);
      
      setMetadata(metaData);
      setObservations(obsData.observations || []);
    })
    .catch(err => {
      if (active) setError(err.message);
    })
    .finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [selectedDatasetId]);

  // Derive all unique geos for filter picker
  const allGeos = useMemo(() => {
    const geos = new Set<string>();
    observations.forEach(o => geos.add(o.geo));
    return Array.from(geos).sort();
  }, [observations]);

  // The actual filtered data that drives both UI and downloads (Step 9)
  const filteredObservations = useMemo(() => {
    if (geoFilter.length === 0) {
      // If none selected, default to top 5 by average to prevent spaghetti charts
      const geoMap = new Map<string, number[]>();
      observations.forEach(obs => {
        if (!geoMap.has(obs.geo)) geoMap.set(obs.geo, []);
        geoMap.get(obs.geo)!.push(obs.value);
      });
      const top5 = Array.from(geoMap.entries()).map(([geo, vals]) => {
        return { geo, avg: vals.reduce((a,b)=>a+b,0)/vals.length };
      }).sort((a,b)=>b.avg - a.avg).slice(0, 5).map(g => g.geo);
      return observations.filter(o => top5.includes(o.geo));
    }
    return observations.filter(o => geoFilter.includes(o.geo));
  }, [observations, geoFilter]);

  // Step 9: Export filtered CSV
  const handleFilteredDownload = () => {
    const header = 'geo,time,value\n';
    const csvContent = filteredObservations.map(o => `${o.geo},${o.time},${o.value}`).join('\n');
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata?.concept || 'data'}_filtered.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Step 9: Export filtered JSON metadata
  const handleMetadataDownload = () => {
    const metaPayload = {
      ...metadata,
      filtered_geos: geoFilter.length ? geoFilter : 'Top 5 automatic',
      observation_count: filteredObservations.length,
      exported_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(metaPayload, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata?.concept || 'data'}_metadata.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getChartOptions = () => {
    if (!filteredObservations.length) return {};

    const geoMap = new Map<string, { [year: string]: number }>();
    const yearsSet = new Set<string>();

    filteredObservations.forEach(obs => {
      yearsSet.add(obs.time);
      if (!geoMap.has(obs.geo)) geoMap.set(obs.geo, {});
      geoMap.get(obs.geo)![obs.time] = obs.value;
    });

    const years = Array.from(yearsSet).sort();
    
    const series = Array.from(geoMap.keys()).map(geo => {
      const data = geoMap.get(geo)!;
      const vals = Object.values(data);
      const avg = vals.reduce((a,b)=>a+b,0)/(vals.length||1);
      return {
        name: geo,
        type: chartType === 'scatter' ? 'scatter' : chartType === 'bar' ? 'bar' : 'line',
        data: years.map(y => data[y] || null),
        symbolSize: chartType === 'scatter' ? (val: number) => Math.max(5, Math.min(30, val / (avg||1) * 10)) : undefined,
      };
    });

    return {
      tooltip: { trigger: 'axis' },
      legend: { data: Array.from(geoMap.keys()), bottom: 0 },
      xAxis: { type: 'category', data: years, name: 'Year' },
      yAxis: { type: 'value', name: metadata?.name || 'Value' },
      series: series,
      animation: !reduceMotion,
      animationDuration: reduceMotion ? 0 : 1500,
    };
  };

  return (
    <div className="pt-[70px] flex flex-col min-h-screen bg-gray-50">
      <div className="bg-[var(--color-dark)] text-white py-12">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-4">Enerqa Data Explorer</h1>
              <p className="text-gray-300 text-lg max-w-2xl">
                Visualize global trends, download open-source observations, or view the original Gapminder charts.
              </p>
            </div>
            <Link href="/data-portal/sources" className="text-sm font-medium text-blue-300 hover:text-white underline flex items-center gap-1 shrink-0 pb-1">
              Sources & Methodology
            </Link>
          </div>
        </Container>
      </div>

      <Container className="py-8 flex-1 flex flex-col">
        <div className="flex border-b border-gray-200 mb-8">
          <button 
            className={`py-3 px-6 font-bold text-sm ${activeTab === 'explorer' ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('explorer')}
          >
            Data Explorer
          </button>
          <button 
            className={`py-3 px-6 font-bold text-sm ${activeTab === 'gapminder' ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('gapminder')}
          >
            Original Gapminder Chart
          </button>
        </div>

        {activeTab === 'explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Dataset</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-[var(--color-primary)]"
                  value={selectedDatasetId}
                  onChange={(e) => setSelectedDatasetId(e.target.value)}
                >
                  {catalogue.length === 0 ? <option>Loading catalogue...</option> : null}
                  {catalogue.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Geographic Filter</label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 text-sm bg-gray-50">
                  {allGeos.length === 0 ? <span className="text-gray-500 p-2">Loading geos...</span> : null}
                  {allGeos.map(geo => (
                    <label key={geo} className="flex items-center gap-2 p-1 hover:bg-gray-100 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={geoFilter.includes(geo)}
                        onChange={(e) => {
                          if (e.target.checked) setGeoFilter([...geoFilter, geo]);
                          else setGeoFilter(geoFilter.filter(g => g !== geo));
                        }}
                      />
                      {geo}
                    </label>
                  ))}
                </div>
                {geoFilter.length > 0 && (
                  <button onClick={() => setGeoFilter([])} className="text-xs text-[var(--color-primary)] mt-2 hover:underline">
                    Clear geo filters (Default Top 5)
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Visualization Type</label>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setChartType('line')} className={`flex items-center gap-3 p-3 rounded-lg border ${chartType === 'line' ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <Activity className="w-5 h-5" /> Line Chart
                  </button>
                  <button onClick={() => setChartType('bar')} className={`flex items-center gap-3 p-3 rounded-lg border ${chartType === 'bar' ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <BarChart2 className="w-5 h-5" /> Bar Chart
                  </button>
                  <button onClick={() => setChartType('scatter')} className={`flex items-center gap-3 p-3 rounded-lg border ${chartType === 'scatter' ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <div className="w-5 h-5 rounded-full border-2 border-current" /> Bubble Chart
                  </button>
                  <button onClick={() => setChartType('table')} className={`flex items-center gap-3 p-3 rounded-lg border ${chartType === 'table' ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <TableIcon className="w-5 h-5" /> Data Table
                  </button>
                </div>
              </div>
              
              {/* Step 11: Accessibility Controls */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700">
                  <input type="checkbox" checked={reduceMotion} onChange={e => setReduceMotion(e.target.checked)} />
                  Pause Animations (Reduce Motion)
                </label>
              </div>

              {/* Step 10: Visible provenance, limitations, provider credits, dataset versions */}
              {metadata && (
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-200 flex flex-col gap-3 text-sm text-gray-800 shadow-inner">
                  <h3 className="font-bold text-blue-900 flex items-center gap-2 border-b border-blue-200 pb-2">
                    <ShieldAlert className="w-5 h-5" /> Data Source & Limitations
                  </h3>
                  <div className="space-y-1">
                    <p><strong>Original Provider:</strong> {metadata.source} <em>via Gapminder</em></p>
                    <p><strong>Licence:</strong> {metadata.licence}</p>
                    <p><strong>Version / Concept:</strong> {metadata.concept}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-blue-100 text-xs text-gray-600 font-mono mt-1">
                    <strong>Mandatory Attribution:</strong><br />
                    {metadata.attribution}
                  </div>
                  
                  <div className="text-xs text-gray-600 mt-2 space-y-2 leading-relaxed">
                    <p><strong>Limitations:</strong> Values are fetched directly from verified upstream sources without zero-coercion or gap interpolation.</p>
                    <p><strong>Cautions:</strong> Gapminder states that many of its gap-filled series are intended to illustrate broad trends, not detailed numerical analysis. Historical country series also use present-day geographic boundaries.</p>
                    <p className="font-bold text-gray-800">Do not present this explorer as a substitute for source-grade MRV, feasibility, or investment evidence.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-3 flex flex-col">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-[500px]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{metadata?.name || 'Select a dataset'}</h2>
                    {metadata && <p className="text-sm text-gray-500 mt-1">Showing {filteredObservations.length} filtered observations</p>}
                  </div>
                  {metadata && (
                    <div className="flex gap-2">
                      <button onClick={handleFilteredDownload} className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                        <Download className="w-4 h-4" /> Filtered CSV
                      </button>
                      <button onClick={handleMetadataDownload} className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <Download className="w-4 h-4" /> JSON Meta
                      </button>
                      <a href={`/api/data-portal/observations?id=${metadata.id}&format=csv`} download className="flex items-center gap-2 text-sm font-bold text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        Full CSV
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex-1 relative">
                  {loading && (
                    <div className="absolute inset-0 z-10 bg-white/80 flex flex-col items-center justify-center">
                      <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)] mb-4" />
                      <p className="text-gray-500 font-medium">Fetching observations...</p>
                    </div>
                  )}

                  {error && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-red-500">
                      <AlertCircle className="w-12 h-12 mb-4" />
                      <p className="font-bold">{error}</p>
                    </div>
                  )}

                  {!loading && !error && filteredObservations.length > 0 && chartType !== 'table' && (
                    <ReactECharts option={getChartOptions()} style={{ height: '100%', width: '100%', minHeight: '400px' }} />
                  )}

                  {!loading && !error && filteredObservations.length > 0 && chartType === 'table' && (
                    <div className="overflow-auto max-h-[500px] border border-gray-200 rounded-lg">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 shadow-sm">
                          <tr>
                            <th className="px-6 py-3">Geography</th>
                            <th className="px-6 py-3">Year</th>
                            <th className="px-6 py-3">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredObservations.slice(0, 1000).map((obs, idx) => (
                            <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-3">{obs.geo}</td>
                              <td className="px-6 py-3">{obs.time}</td>
                              <td className="px-6 py-3">{obs.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredObservations.length > 1000 && (
                        <div className="text-center p-4 text-xs text-gray-500 bg-gray-50">
                          Showing first 1,000 rows. Download CSV to view all {filteredObservations.length.toLocaleString()} rows.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'gapminder' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[600px] flex flex-col">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="font-bold text-xl text-gray-900">Original Gapminder Visualization</h2>
              <a href="https://www.gapminder.org/tools" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] text-sm font-bold hover:underline">
                Open in new tab &nearr;
              </a>
            </div>
            
            {/* Step 11b: Gapminder may set its own cookies, so it loads only with
                consent (p. 208 U03): a click here, or "embedded content" allowed on
                /cookie-choices. */}
            <ExternalEmbed
              src="https://www.gapminder.org/tools/?embedded=true#$chart-type=bubbles"
              title="Gapminder Tools"
              className="w-full flex-1 border-0 rounded-lg min-h-[600px]"
            />
            <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100">
              Data and visualization provided by <a href="https://www.gapminder.org" className="underline font-bold">Gapminder</a>. 
              The Gapminder Tools are embedded here for convenience. Use the "Open in new tab" link above if the iframe is restricted by your browser.
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
