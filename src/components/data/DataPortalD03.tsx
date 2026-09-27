'use client';

import React, { useState, useEffect } from 'react';
import { getExploreData } from '@/app/(frontend)/data-portal/actions';
import { Container } from '@/components/ui/Container';
import { BarChart2, Table as TableIcon, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DataPortalD03() {
  const [country, setCountry] = useState('WLD'); // World by default
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getExploreData(country, 'co2PerCapita');
        if (res.error) {
          setError(res.error);
        } else if (res.data) {
          setData(res.data[0]);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [country]);

  return (
    <section className="py-20 bg-white border-b border-gray-200">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-4">Explore a Dataset</h2>
            <p className="text-gray-600 text-lg">
              Quickly preview trends with our interactive dataset explorer.
            </p>
          </div>
          <Link href="/data-portal/datasets/global-co2-emissions" className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white font-bold py-3 px-6 rounded hover:bg-opacity-90 transition-all shrink-0">
            Open Dataset <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* Controls Bar */}
          <div className="bg-white border-b border-gray-200 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Geography</label>
                <select 
                  className="border border-gray-300 rounded p-2 text-sm focus:ring-[var(--color-primary)] outline-none min-w-[200px]"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="WLD">World</option>
                  <option value="USA">United States</option>
                  <option value="CHN">China</option>
                  <option value="IND">India</option>
                  <option value="EUU">European Union</option>
                  <option value="ZAF">South Africa</option>
                  <option value="BRA">Brazil</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Observation Period</label>
                <div className="border border-gray-200 rounded p-2 text-sm bg-gray-50 text-gray-600 h-[38px] flex items-center">
                  {data?.provenance?.observationPeriod || 'Loading...'}
                </div>
              </div>
            </div>

            <div className="flex bg-gray-100 rounded p-1 border border-gray-200">
              <button 
                onClick={() => setViewMode('chart')}
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${viewMode === 'chart' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <BarChart2 className="w-4 h-4" /> Chart
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <TableIcon className="w-4 h-4" /> Table
              </button>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="p-6 md:p-10 min-h-[400px] flex flex-col justify-center">
            {loading ? (
              <div className="flex flex-col items-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Loading data from World Bank...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center text-red-500 text-center max-w-md mx-auto">
                <AlertCircle className="w-10 h-10 mb-4" />
                <p className="font-bold mb-2">Could not load dataset</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : data ? (
              <div className="w-full h-full">
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold text-[var(--color-dark)]">{data.label}</h3>
                  <p className="text-gray-500 text-sm mt-1">{data.unit}</p>
                </div>
                
                {viewMode === 'table' ? (
                  <div className="overflow-x-auto border border-gray-200 rounded max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-6 py-3">Period</th>
                          <th className="px-6 py-3">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.observations.map((obs: any, idx: number) => (
                          <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{obs.period}</td>
                            <td className="px-6 py-4">
                              {obs.value !== null ? obs.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="w-full h-[300px] flex items-end justify-between gap-1 overflow-x-hidden pt-10 border-b border-l border-gray-300 relative pl-2 pb-2">
                    {/* Y-axis labels mock */}
                    <div className="absolute left-[-40px] top-0 bottom-0 w-[30px] flex flex-col justify-between items-end text-xs text-gray-500 pb-2">
                      <span>High</span>
                      <span>Mid</span>
                      <span>0</span>
                    </div>
                    {(() => {
                      const maxVal = Math.max(...data.observations.map((o: any) => o.value || 0));
                      const items = data.observations.filter((_: any, i: number) => i % Math.max(1, Math.floor(data.observations.length / 30)) === 0);
                      return items.map((obs: any, idx: number) => (
                        <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group">
                          <div 
                            className="w-full bg-[var(--color-primary)] opacity-70 group-hover:opacity-100 transition-opacity rounded-t min-h-[1px] relative"
                            style={{ height: `${(obs.value / maxVal) * 100}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                              {obs.period}: {obs.value !== null && obs.value !== undefined ? obs.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : 'No data'}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
