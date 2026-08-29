'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { Typography } from '@/components/ui/Typography';

export function GHGEmissionsChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/climate/emissions');
        const json = await res.json();
        // The API returns multi-country data. We will map it to actual vs target for Qatar here.
        // Or just map the raw data for 'Qatar'.
        const mappedData = json.data?.map((d: any) => ({
          year: d.year,
          emissions: d.Qatar,
          target: d.target || 100
        })) || [];
        setData(mappedData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="w-full bg-white p-6 rounded-[16px] border border-ink/10 shadow-sm flex flex-col h-[400px]">
      <Typography variant="h3" className="text-ink mb-6">
        <span className="en block">Greenhouse Gas Emissions (MtCO₂e)</span>
        <span className="ar block text-[0.8em] mt-1 text-ink-soft">انبعاثات غازات الاحتباس الحراري</span>
      </Typography>
      <div className="flex-grow w-full">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-ink/20 border-t-ink rounded-full animate-spin"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <RechartsTooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="emissions" name="Actual Emissions" fill="#A8192E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" name="Target" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function TemperatureTrendChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/climate/temperature');
        const json = await res.json();
        setData(json.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="w-full bg-white p-6 rounded-[16px] border border-ink/10 shadow-sm flex flex-col h-[400px]">
      <Typography variant="h3" className="text-ink mb-6">
        <span className="en block">Temperature Anomaly (°C)</span>
        <span className="ar block text-[0.8em] mt-1 text-ink-soft">انحراف درجة الحرارة</span>
      </Typography>
      <div className="flex-grow w-full">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-ink/20 border-t-ink rounded-full animate-spin"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <RechartsTooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line type="monotone" dataKey="tempAnomaly" name="Anomaly (°C)" stroke="#D97706" strokeWidth={3} dot={{ r: 4, fill: '#D97706' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
