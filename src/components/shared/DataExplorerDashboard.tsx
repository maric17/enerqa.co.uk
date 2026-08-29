'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

export default function DataExplorerDashboard() {
  const [indicator, setIndicator] = useState<'emissions' | 'energy'>('emissions');
  const [countries, setCountries] = useState<string[]>(['Qatar']);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/climate/${indicator === 'emissions' ? 'emissions' : 'temperature'}`);
        const json = await res.json();
        // Since energy API is not built, we fall back to the emissions endpoint format for mock
        setData(json.data || []);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [indicator]);

  const handleCountryToggle = (country: string) => {
    if (countries.includes(country)) {
      setCountries(countries.filter(c => c !== country));
    } else {
      setCountries([...countries, country]);
    }
  };
  
  // Format for CSV download
  const handleDownloadCSV = () => {
    const header = ['year', ...countries].join(',');
    const rows = data.map(row => {
      const vals = [row.year];
      countries.forEach(c => vals.push(row[c] || 0));
      return vals.join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${indicator}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8 mt-4">
      {/* Sidebar Filters */}
      <aside className="flex flex-col gap-6 h-fit bg-[#FAFBFB] p-6 rounded-[16px] border border-ink/10 shadow-sm">
        <Typography variant="h3" className="text-ink m-0">
          <span className="en block">Filters</span>
          <span className="ar block mt-1">التصفية</span>
        </Typography>
        
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">
            <span className="en">Indicator</span>
          </label>
          <select 
            value={indicator}
            onChange={(e) => setIndicator(e.target.value as any)}
            className="w-full bg-white border border-ink/10 rounded-md px-3 py-2 text-[14px] text-ink outline-none focus:border-ink/30"
          >
            <option value="emissions">GHG Emissions (MtCO₂e)</option>
            <option value="energy">Renewable Energy Capacity (MW)</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">
            <span className="en">Countries / Regions</span>
          </label>
          <div className="flex flex-col gap-2">
            {['Qatar', 'Oman', 'UAE'].map(country => (
              <label key={country} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={countries.includes(country)} 
                  onChange={() => handleCountryToggle(country)} 
                  className="w-4 h-4 accent-ink"
                />
                <span className="text-[14px] text-ink">{country}</span>
              </label>
            ))}
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleDownloadCSV}
          className="w-full justify-center mt-4"
        >
          <span className="en">Download Data (.csv)</span>
        </Button>
      </aside>

      {/* Main Chart Dashboard */}
      <div className="w-full bg-white p-6 rounded-[16px] border border-ink/10 shadow-sm flex flex-col">
        <div className="mb-6">
          <Typography variant="h2" className="text-ink m-0">
            <span className="en block">
              {indicator === 'emissions' ? 'Greenhouse Gas Emissions' : 'Renewable Energy Capacity'}
            </span>
          </Typography>
        </div>
        
        {countries.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-ink-soft py-20">
            <span className="en">Please select at least one country to view data.</span>
          </div>
        ) : loading ? (
          <div className="flex-grow flex flex-col gap-3 items-center justify-center text-ink-soft py-20">
            <div className="w-8 h-8 border-4 border-ink/20 border-t-ink rounded-full animate-spin"></div>
            <span className="en text-sm font-medium">Fetching dataset...</span>
          </div>
        ) : (
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                
                {countries.includes('Qatar') && (
                  <Line type="monotone" dataKey="Qatar" stroke="#A8192E" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                )}
                {countries.includes('Oman') && (
                  <Line type="monotone" dataKey="Oman" stroke="#D97706" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                )}
                {countries.includes('UAE') && (
                  <Line type="monotone" dataKey="UAE" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
