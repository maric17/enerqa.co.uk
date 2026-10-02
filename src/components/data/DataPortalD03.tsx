'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getExploreData } from '@/app/(frontend)/data-portal/actions';
import { Container } from '@/components/ui/Container';
import { DataSeriesTable } from './DataSeriesTable';
import type { DataSeries } from '@/lib/api/core/types';

export default function DataPortalD03() {
  const [country, setCountry] = useState('WLD');
  const [indicator, setIndicator] = useState<'co2PerCapita' | 'energy-generation'>('co2PerCapita');
  const [data, setData] = useState<DataSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const area = indicator === 'energy-generation' ? 'USA' : country;
  const query = new URLSearchParams(indicator === 'energy-generation' ? {} : { countries: area, indicator });
  const dataset = indicator === 'energy-generation' ? indicator : 'world-bank-indicator';

  useEffect(() => {
    // A slower previous selection must not replace the visitor's newest one.
    let active = true;
    setLoading(true); setData(null); setError(null);
    getExploreData(area, indicator).then(result => {
      if (!active) return;
      if (result.error) setError(result.error);
      else setData(result.data?.[0] ?? null);
    }).catch(() => { if (active) setError('This data source is temporarily unavailable.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [area, indicator]);

  const observations = data?.observations.slice(-20) ?? [];
  const max = Math.max(1, ...observations.map(o => Math.abs(o.value ?? 0)));
  return <section className="py-20 bg-white border-b border-gray-200">
    <Container>
      <h2 className="text-3xl font-bold mb-4">Explore a Dataset</h2>
      <p className="mb-6">Explore source observations with their units, observation periods and downloadable data.</p>
      <div className="flex flex-wrap gap-4 mb-6">
        <label>Dataset <select value={indicator} onChange={e => setIndicator(e.target.value as typeof indicator)} className="border rounded p-2">
          <option value="co2PerCapita">Country CO₂ emissions per person</option><option value="energy-generation">United States electricity generation</option>
        </select></label>
        <label>Geography <select value={area} disabled={indicator === 'energy-generation'} onChange={e => setCountry(e.target.value)} className="border rounded p-2">
          {[['WLD', 'World'], ['USA', 'United States'], ['CHN', 'China'], ['IND', 'India'], ['EUU', 'European Union'], ['ZAF', 'South Africa'], ['BRA', 'Brazil']].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select></label>
      </div>
      <div className="min-h-[400px] border rounded p-6">
        {loading ? <p role="status">Loading source observations…</p> : error ? <p role="status">{error}</p> : data ? <>
          <h3 className="text-xl font-bold">{data.label}</h3>
          <p>{data.unit} · {data.frequency} · {data.area ?? 'Geography not specified'}</p>
          <figure className="my-6"><figcaption>Latest 20 returned periods. Signed values are labelled; missing values have no bar.</figcaption>
            <div className="max-h-80 overflow-auto">{observations.map(o => <div key={o.period} className="grid grid-cols-[5rem_1fr] gap-3 my-2">
              <span>{o.period}</span><div><span>{o.value === null ? '— (missing)' : `${o.value.toLocaleString('en-GB')} ${data.unit}`}</span>
                {o.value !== null && <div aria-hidden="true" className="h-2 bg-[var(--color-primary-deep)]" style={{ width: `${Math.abs(o.value) / max * 100}%` }} />}
              </div>
            </div>)}</div>
          </figure>
          <div className="overflow-x-auto"><DataSeriesTable series={[{ ...data, observations }]} caption="Equivalent table for the chart above" /></div>
          <div className="flex flex-wrap gap-6 mt-6">
            <Link className="underline" href={`/data-portal/series/${dataset}?${query}`}>Explore all returned periods</Link>
            <a className="underline" href={`/api/data/${dataset}?${query}`}>Download selected dataset (CSV)</a>
          </div>
        </> : <p role="status">No observations are available for this selection.</p>}
      </div>
      <Link className="underline block mt-4" href="/data-portal/sources">Sources and Methodology</Link>
    </Container>
  </section>;
}
