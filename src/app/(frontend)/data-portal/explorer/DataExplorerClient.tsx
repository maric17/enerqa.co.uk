'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ReactECharts from 'echarts-for-react';
import { Container } from '@/components/ui/Container';
import { Loader2, AlertCircle, Table as TableIcon, Download, BarChart2, Activity, ShieldAlert } from 'lucide-react';
import { ExternalEmbed } from '@/components/ExternalEmbed';
import { IndicatorSelector } from '@/components/data/IndicatorSelector';
import { countryName, matchIndicators, type Observation } from '@/lib/data-portal/explorer';
import { TIME_PERIODS, aggregateTimePeriods, availableTimePeriod, effectiveTimePeriod, valueAxisBounds, type TimePeriod } from '@/lib/data-portal/timePeriods';

type Dataset = {
  id: string;
  name: string;
  topic: string;
  source: string;
  licence: string;
};

type Metadata = Dataset & {
  attribution: string;
  concept: string;
};

export default function DataExplorerClient() {
  const [catalogue, setCatalogue] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [xIndicatorId, setXIndicatorId] = useState('year');
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [observations, setObservations] = useState<Observation[]>([]);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [xObservations, setXObservations] = useState<Observation[]>([]);
  const [xMetadata, setXMetadata] = useState<Metadata | null>(null);
  const [xLoading, setXLoading] = useState(false);
  const [xError, setXError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'explorer' | 'gapminder'>('explorer');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter' | 'table'>('line');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('yearly');

  // Step 11: Accessibility
  const [reduceMotion, setReduceMotion] = useState(false);

  // Step 11b: iframe consent

  // UI Filters
  const [geoFilter, setGeoFilter] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/data-portal/catalogue?limit=1000', { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Unable to load the indicator catalogue. Please reload to try again.');
        return res.json();
      })
      .then(data => {
        if (data.results) {
          setCatalogue(data.results);
          if (data.results.length > 0) {
            setSelectedDatasetId(data.results[0].id);
          }
        }
      })
      .catch(err => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setCatalogueLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedDatasetId) return;

    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setObservations([]);
    setMetadata(null);
    setGeoFilter([]);

    Promise.all([
      fetch(`/api/data-portal/metadata?id=${encodeURIComponent(selectedDatasetId)}`, { signal: controller.signal }).then(r => r.json()),
      fetch(`/api/data-portal/observations?id=${encodeURIComponent(selectedDatasetId)}`, { signal: controller.signal }).then(r => r.json())
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

    return () => { active = false; controller.abort(); };
  }, [selectedDatasetId]);

  useEffect(() => {
    if (xIndicatorId === 'year' || xIndicatorId === selectedDatasetId) return;
    const controller = new AbortController();
    setXLoading(true);
    setXError(null);
    setXObservations([]);
    setXMetadata(null);
    Promise.all([
      fetch(`/api/data-portal/metadata?id=${encodeURIComponent(xIndicatorId)}`, { signal: controller.signal }).then(r => r.json()),
      fetch(`/api/data-portal/observations?id=${encodeURIComponent(xIndicatorId)}`, { signal: controller.signal }).then(r => r.json()),
    ]).then(([metaData, obsData]) => {
      if (controller.signal.aborted) return;
      if (metaData.error) throw new Error(metaData.error);
      if (obsData.error) throw new Error(obsData.error);
      setXMetadata(metaData);
      setXObservations(obsData.observations || []);
    }).catch(err => {
      if (!controller.signal.aborted) setXError(err.message);
    }).finally(() => {
      if (!controller.signal.aborted) setXLoading(false);
    });
    return () => controller.abort();
  }, [xIndicatorId, selectedDatasetId]);

  const isComparison = xIndicatorId !== 'year';
  const hasSeparateX = isComparison && xIndicatorId !== selectedDatasetId;
  const chartLoading = catalogueLoading || loading || (hasSeparateX && xLoading);
  const chartError = error || (hasSeparateX ? xError : null);

  // Derive all unique geos for filter picker
  const allGeos = useMemo(() => {
    const geos = new Set<string>();
    observations.forEach(o => geos.add(o.geo));
    return Array.from(geos).sort((a, b) => countryName(a).localeCompare(countryName(b)));
  }, [observations]);

  const visibleGeos = allGeos.filter(geo => `${countryName(geo)} ${geo}`.toLowerCase().includes(countrySearch.trim().toLowerCase()));
  const xOptions = useMemo(() => [{ id: 'year', name: 'Year' }, ...catalogue], [catalogue]);

  const pairedObservations = useMemo(() => matchIndicators(observations, isComparison ? hasSeparateX ? xObservations : observations : null), [observations, xObservations, isComparison, hasSeparateX]);
  const availablePeriod = useMemo(() => availableTimePeriod(pairedObservations), [pairedObservations]);
  const effectivePeriod = effectiveTimePeriod(timePeriod, availablePeriod);
  const periodOption = TIME_PERIODS.find(option => option.value === effectivePeriod)!;
  const xName = isComparison ? catalogue.find(c => c.id === xIndicatorId)?.name ?? 'Value' : periodOption.axis;

  // Pick countries before grouping so changing periods does not change the top five.
  const selectedObservations = useMemo(() => {
    if (geoFilter.length === 0) {
      // If none selected, default to top 5 by average to prevent spaghetti charts
      const geoMap = new Map<string, number[]>();
      pairedObservations.forEach(obs => {
        if (!geoMap.has(obs.geo)) geoMap.set(obs.geo, []);
        geoMap.get(obs.geo)!.push(obs.value);
      });
      const top5 = Array.from(geoMap.entries()).map(([geo, vals]) => {
        return { geo, avg: vals.reduce((a,b)=>a+b,0)/vals.length };
      }).sort((a,b)=>b.avg - a.avg).slice(0, 5).map(g => g.geo);
      return pairedObservations.filter(o => top5.includes(o.geo));
    }
    return pairedObservations.filter(o => geoFilter.includes(o.geo));
  }, [pairedObservations, geoFilter]);
  // Charts, tables and filtered downloads share the same period averages.
  const filteredObservations = useMemo(() => aggregateTimePeriods(selectedObservations, effectivePeriod), [selectedObservations, effectivePeriod]);

  // Step 9: Export filtered CSV
  const handleFilteredDownload = () => {
    // Quote full country names because some names contain commas.
    const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const header = `geo,country,time,${isComparison ? 'x_value,y_value' : 'value'}\n`;
    const csvContent = filteredObservations.map(o => `${quote(o.geo)},${quote(countryName(o.geo))},${quote(o.time)},${isComparison ? `${o.x},` : ''}${o.value}`).join('\n');
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
      x_axis: { id: xIndicatorId, name: xName, metadata: hasSeparateX ? xMetadata : isComparison ? metadata : null },
      y_axis: { id: selectedDatasetId, name: metadata?.name },
      filtered_geos: geoFilter.length ? geoFilter : 'Top 5 automatic',
      time_period: timePeriod,
      effective_time_period: effectivePeriod,
      aggregation: 'mean',
      week_starts_on: 'Monday',
      time_zone: 'UTC',
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

    const geoMap = new Map<string, { [period: string]: number }>();
    const periodsSet = new Set<string>();

    filteredObservations.forEach(obs => {
      periodsSet.add(obs.time);
      if (!geoMap.has(obs.geo)) geoMap.set(obs.geo, {});
      geoMap.get(obs.geo)![obs.time] = obs.value;
    });

    const periods = Array.from(periodsSet).sort();

    const series = Array.from(geoMap.keys()).map(geo => {
      const data = geoMap.get(geo)!;
      const vals = Object.values(data);
      const avg = vals.reduce((a,b)=>a+b,0)/(vals.length||1);
      return {
        name: countryName(geo),
        type: chartType === 'scatter' ? 'scatter' : chartType === 'bar' ? 'bar' : 'line',
        // Keep real zeroes and show the selected period in comparison tooltips.
        data: isComparison
          ? filteredObservations.filter(o => o.geo === geo).map(o => [o.x, o.value, effectivePeriod === 'yearly' ? Number(o.time) : o.time])
          : periods.map(period => data[period] ?? null),
        // Internal names stay unique even when both axes use the same dataset.
        dimensions: isComparison ? [{ name: 'xValue', displayName: xName }, { name: 'yValue', displayName: metadata?.name || 'Value' }, { name: 'period', displayName: periodOption.axis, type: 'ordinal' }] : undefined,
        encode: isComparison ? { x: 0, y: 1, tooltip: [0, 1, 2] } : undefined,
        symbolSize: chartType === 'scatter' ? (val: number | number[]) => Math.max(5, Math.min(30, Math.abs((Array.isArray(val) ? val[1] : val) / (avg || 1)) * 10)) : undefined,
      };
    });

    return {
      tooltip: { trigger: isComparison || chartType === 'scatter' ? 'item' : 'axis' },
      grid: { left: 65, right: 25, top: 65, bottom: 100, containLabel: true },
      legend: { type: 'scroll', data: Array.from(geoMap.keys()).map(countryName), bottom: 0 },
      xAxis: { type: isComparison ? 'value' : 'category', data: isComparison ? undefined : periods, name: xName, nameLocation: 'middle', nameGap: 40, nameTextStyle: { width: 260, overflow: 'truncate' } },
      // Recalculate from the displayed averages; bars keep a zero baseline.
      yAxis: { type: 'value', scale: true, ...valueAxisBounds(filteredObservations, chartType === 'bar'), name: metadata?.name || 'Value', nameTextStyle: { width: 260, overflow: 'truncate' } },
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
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 items-start gap-8">
            {/* Scroll the filters independently so their contents cannot stretch the chart. */}
            <aside aria-label="Explorer filters" tabIndex={0} data-lenis-prevent className="lg:col-span-1 min-w-0 max-h-[420px] lg:max-h-[560px] overflow-y-auto overscroll-contain scroll-py-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]">
              <IndicatorSelector id="y-axis-indicator" label="Y-axis indicator" searchLabel="Search datasets" options={catalogue} value={selectedDatasetId} onChange={setSelectedDatasetId} loading={catalogueLoading} />
              <IndicatorSelector id="x-axis-indicator" label="X-axis indicator" searchLabel="Search X-axis indicators" options={xOptions} value={xIndicatorId} onChange={value => {
                setXIndicatorId(value);
                if (value !== 'year' && chartType !== 'table') setChartType('scatter');
              }} loading={catalogueLoading} />
              <p className="text-xs text-gray-500">Use Year for trends over time, or compare two indicators using matching countries and observation dates.</p>

              <div>
                <label htmlFor="time-period" className="block text-sm font-bold text-gray-700 mb-2">Time period</label>
                <select id="time-period" value={timePeriod} onChange={event => setTimePeriod(event.target.value as TimePeriod)} aria-describedby="time-period-help" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-2 focus:outline-[var(--color-primary)]">
                  {TIME_PERIODS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <p id="time-period-help" className="text-xs text-gray-500 mt-2">Each period shows the average of available observations. Weeks start on Monday; dates use UTC.</p>
              </div>

              <div>
                <label htmlFor="country-search" className="block text-sm font-bold text-gray-700 mb-2">Countries and regions</label>
                <input id="country-search" type="search" aria-label="Search countries" aria-controls="country-options" placeholder="Search countries or codes" value={countrySearch} onChange={e => setCountrySearch(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-2 focus:outline-2 focus:outline-[var(--color-primary)]" />
                <div id="country-options" role="group" aria-label="Countries and regions" className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 text-sm bg-gray-50" data-lenis-prevent>
                  {allGeos.length === 0 ? <span className="text-gray-500 p-2">{loading || catalogueLoading ? 'Loading countries...' : 'No countries available.'}</span> : null}
                  {allGeos.length > 0 && visibleGeos.length === 0 && <p role="status" className="text-gray-500 p-2">No countries match your search.</p>}
                  {visibleGeos.map(geo => (
                    <label key={geo} className="flex items-center gap-2 p-1 hover:bg-gray-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={geoFilter.includes(geo)}
                        onChange={(e) => {
                          setGeoFilter(current => e.target.checked ? [...current, geo] : current.filter(g => g !== geo));
                        }}
                      />
                      {countryName(geo)}
                    </label>
                  ))}
                </div>
                {geoFilter.length > 0 && (
                  <button onClick={() => setGeoFilter([])} className="text-xs text-[var(--color-primary)] mt-2 hover:underline">
                    Clear country filters (Default Top 5)
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

            </aside>

            <div className="lg:col-span-3 min-w-0 flex flex-col">
              <div className="min-w-0 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-[500px]">
                <div className="flex flex-col xl:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{metadata?.name || 'Select a dataset'}</h2>
                    {metadata && <p className="text-sm text-gray-500 mt-1">{isComparison && <span>{xName} (X) vs {metadata.name} (Y). </span>}Showing {filteredObservations.length.toLocaleString()} {periodOption.label.toLowerCase()} {isComparison ? 'matching' : 'filtered'} averages</p>}
                  </div>
                  {metadata && (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={handleFilteredDownload} disabled={chartLoading || !!chartError || filteredObservations.length === 0} className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50">
                        <Download className="w-4 h-4" /> Filtered CSV
                      </button>
                      <button onClick={handleMetadataDownload} disabled={chartLoading || !!chartError} className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
                        <Download className="w-4 h-4" /> JSON Meta
                      </button>
                      <a href={`/api/data-portal/observations?id=${encodeURIComponent(metadata.id)}&format=csv`} download className="flex items-center gap-2 text-sm font-bold text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        {isComparison ? 'Full Y-axis CSV' : 'Full CSV'}
                      </a>
                    </div>
                  )}
                </div>

                {!chartLoading && !chartError && filteredObservations.length > 0 && effectivePeriod !== timePeriod && (
                  <p role="status" className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">These observations are only available at {periodOption.label.toLowerCase()} resolution. The selected {timePeriod} view shows the available {periodOption.label.toLowerCase()} values; finer observations are unavailable.</p>
                )}

                <div className="flex-1 relative">
                  {chartLoading && (
                    <div className="absolute inset-0 z-10 bg-white/80 flex flex-col items-center justify-center">
                      <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)] mb-4" />
                      <p className="text-gray-500 font-medium">Fetching observations...</p>
                    </div>
                  )}

                  {chartError && (
                    <div role="alert" className="absolute inset-0 z-10 flex flex-col items-center justify-center text-red-500">
                      <AlertCircle className="w-12 h-12 mb-4" />
                      <p className="font-bold">{chartError}</p>
                    </div>
                  )}

                  {!chartLoading && !chartError && filteredObservations.length === 0 && (
                    <p role="status" className="p-8 text-center text-gray-500">{isComparison ? 'No matching country and observation date pairs for these indicators. Choose another indicator or clear the country filters.' : 'No observations available. Choose another dataset or clear the country filters.'}</p>
                  )}

                  {!chartLoading && !chartError && filteredObservations.length > 0 && chartType !== 'table' && (
                    <ReactECharts option={getChartOptions()} notMerge style={{ height: '100%', width: '100%', minHeight: '400px' }} />
                  )}

                  {!chartLoading && !chartError && filteredObservations.length > 0 && chartType === 'table' && (
                    <div className="overflow-auto max-h-[500px] border border-gray-200 rounded-lg">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 shadow-sm">
                          <tr>
                            <th scope="col" className="px-6 py-3">Country / region</th>
                            <th scope="col" className="px-6 py-3">{periodOption.axis}</th>
                            {isComparison && <th scope="col" className="px-6 py-3">{xName} (X)</th>}
                            <th scope="col" className="px-6 py-3">{metadata?.name || 'Value'}{isComparison ? ' (Y)' : ''}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredObservations.slice(0, 1000).map((obs, idx) => (
                            <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-3">{countryName(obs.geo)}</td>
                              <td className="px-6 py-3">{obs.time}</td>
                              {isComparison && <td className="px-6 py-3">{obs.x.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>}
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

            {/* Step 10: Visible provenance, limitations, provider credits, dataset versions */}
            {metadata && (
              <div className="min-w-0 [overflow-wrap:anywhere] bg-blue-50 p-6 rounded-xl border border-blue-200 flex flex-col gap-4 text-sm text-gray-800 shadow-sm mt-4">
                <h3 className="font-bold text-blue-900 flex items-center gap-2 border-b border-blue-200 pb-3 text-lg">
                  <ShieldAlert className="w-6 h-6" /> Data Source & Limitations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 md:col-span-1 border-b md:border-b-0 md:border-r border-blue-200 pb-4 md:pb-0 md:pr-4">
                    <p><strong>Original Provider:</strong> <br/>{metadata.source} <em>via Gapminder</em></p>
                    <p><strong>Licence:</strong> <br/>{metadata.licence}</p>
                    <p><strong>Version / Concept:</strong> <br/>{metadata.concept}</p>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-100 text-xs text-gray-600 font-mono">
                      <strong className="text-gray-800 text-sm font-sans mb-1 block">Mandatory Attribution:</strong>
                      {metadata.attribution}
                    </div>

                    <div className="text-sm text-gray-700 space-y-2 leading-relaxed bg-blue-100/50 p-4 rounded-lg">
                      <p><strong>Limitations:</strong> Values are fetched directly from verified upstream sources without zero-coercion or gap interpolation.</p>
                      <p><strong>Cautions:</strong> Gapminder states that many of its gap-filled series are intended to illustrate broad trends, not detailed numerical analysis. Historical country series also use present-day geographic boundaries.</p>
                      <p className="font-bold text-gray-900 mt-2">Do not present this explorer as a substitute for source-grade MRV, feasibility, or investment evidence.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'explorer' && hasSeparateX && xMetadata && !chartLoading && !chartError && (
          <div className="min-w-0 [overflow-wrap:anywhere] bg-blue-50 p-6 rounded-xl border border-blue-200 text-sm text-gray-800 space-y-2 mt-4">
            <h3 className="font-bold text-blue-900">X-axis source: {xMetadata.name}</h3>
            <p><strong>Original Provider:</strong> {xMetadata.source} <em>via Gapminder</em></p>
            <p><strong>Licence:</strong> {xMetadata.licence}</p>
            <p><strong>Version / Concept:</strong> {xMetadata.concept}</p>
            <p><strong>Attribution:</strong> {xMetadata.attribution}</p>
            <p>Only exact country and observation date matches are included in period averages. Missing values are excluded.</p>
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
