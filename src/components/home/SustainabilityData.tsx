'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Typography } from '../ui/Typography'
import { Container } from '../ui/Container'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'

const dataHub = {
  emissions: {
    cards: [
      { category: 'GHG Intensity', value: '45% reduction', text: 'targeted by GCC utility firms by 2030 across Scope 1 and 2 emissions.' },
      { category: 'Methane Leaks', value: '1.2% rate', text: 'average loss rate across regional gas extraction and transport grids.' },
      { category: 'Carbon Price', value: '$25 / ton', text: 'average voluntary carbon market offset price for premium projects in 2026.' }
    ],
    chartTitle: 'Scope 1 & 2 Emissions Reductions Pathway (2020-2030)',
    chartType: 'line',
    chartData: [100, 85, 76, 68, 62, 55],
    chartLabels: ['2020', '2022', '2024', '2026', '2028', '2030']
  },
  energy: {
    cards: [
      { category: 'Solar Capacity', value: '15.4 GW', text: 'of utility-scale solar projects currently under active bidding and construction.' },
      { category: 'Green Hydrogen', value: '3.8 Mtpa', text: 'clean ammonia production targeted by regional developers by 2032.' },
      { category: 'Grid Mix', value: '18 percent', text: 'renewable energy penetration targeted in the integrated grid by 2030.' }
    ],
    chartTitle: 'Clean Energy Grid Penetration Growth (%)',
    chartType: 'bar',
    chartData: [4, 6, 9, 12, 15, 18],
    chartLabels: ['2020', '2022', '2024', '2026', '2028', '2030']
  },
  finance: {
    cards: [
      { category: 'Green Bonds', value: '$12.8 Billion', text: 'issued by sovereign and corporate entities in the regional market in 2025.' },
      { category: 'Capital Shift', value: '65 percent', text: 'of public-private capital commitments targeting low-carbon assets.' },
      { category: 'Taxonomy Match', value: '90% compliance', text: 'required to unlock tier-1 international development bank funding.' }
    ],
    chartTitle: 'Sustainable Debt Issuance ($ Billions)',
    chartType: 'bar',
    chartData: [2.5, 4.8, 7.2, 9.5, 11.2, 12.8],
    chartLabels: ['2020', '2021', '2022', '2023', '2024', '2025']
  },
  esg: {
    cards: [
      { category: 'GRI Standards', value: '8 in 10', text: 'listed companies now utilizing standard Global Reporting Initiative guidelines.' },
      { category: 'ISSB Adoption', value: '100 percent', text: 'sovereign wealth funds demanding ISSB alignment for new allocations by 2027.' },
      { category: 'Scope 3 Audits', value: '35% of firms', text: 'currently conducting audited third-party value chain emissions disclosures.' }
    ],
    chartTitle: 'Framework Disclosure Adoption Rate (%)',
    chartType: 'line',
    chartData: [15, 32, 48, 65, 78, 85],
    chartLabels: ['2020', '2021', '2022', '2023', '2024', '2025']
  },
  risks: {
    cards: [
      { category: 'CBAM Exposure', value: '15% export tariff', text: 'estimated average border carbon adjustment on regional steel and cement exports.' },
      { category: 'Water Stress', value: '85% of assets', text: 'situated in high-baseline water stress areas requiring dry-cooling systems.' },
      { category: 'Asset Impairment', value: '$45B valuation', text: 'at risk of regulatory write-downs under strict Net-Zero carbon limit policies.' }
    ],
    chartTitle: 'Stranded Asset Regulatory Exposure Projection ($ B)',
    chartType: 'line',
    chartData: [10, 18, 25, 32, 40, 45],
    chartLabels: ['2020', '2022', '2024', '2026', '2028', '2030']
  },
  heatmap: {
    cards: [
      { category: 'Weather Anomaly', value: '+1.8°C avg', text: 'increase in regional summer temperature baseline recorded over the last five years.' },
      { category: 'Grid Peak Load', value: '8.4% surge', text: 'observed in desert urban grids during peak heating/cooling periods.' },
      { category: 'Climate Risk Index', value: 'High Exposure', text: 'classified across infrastructure assets near low-lying coastal areas.' }
    ],
    chartTitle: 'Climate Risk Temperature Anomaly Heatmap (2020-2025)',
    chartType: 'heatmap'
  },
  infrastructure: {
    cards: [
      { category: 'Vulnerability Datasets', value: 'N/A', text: 'open humanitarian and risk datasets available for Qatar on HDX.' },
      { category: 'Projected Rainfall', value: 'N/A', text: 'projected monthly precipitation (mm/month).' },
      { category: 'Power Infrastructure', value: 'N/A', text: 'mapped power plant facilities across Qatar.' }
    ],
    chartTitle: 'Integrated Infrastructure & Risk Metrics',
    chartType: 'bar',
    chartData: [0, 0, 0],
    chartLabels: ['HDX Datasets', 'Projected Rain', 'Power Plants']
  }
}

type TabKey = keyof typeof dataHub

interface SustainabilityDataProps {
  apiData?: {
    openaq: any;
    nasa: any;
    worldbank: any;
    noaa: any;
    unsdg: any;
    cckp: any;
    osm: any;
    unocha: any;
  }
}

export const SustainabilityData = ({ apiData }: SustainabilityDataProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('emissions')
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!bgRef.current || !bgRef.current.parentElement) return
      const rect = bgRef.current.parentElement.getBoundingClientRect()
      // Only animate if element is in viewport
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // Calculate difference from center of viewport to center of element
        const diff = (window.innerHeight / 2) - (rect.top + rect.height / 2)
        // Apply parallax factor (e.g. 0.15)
        bgRef.current.style.transform = `translateY(${diff * 0.15}px)`
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Init
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const info = dataHub[activeTab]

  const getDynamicCards = (tab: TabKey, info: any, apiData: any) => {
    if (!apiData) return info.cards;
    
    switch (tab) {
      case 'emissions': {
        const wb = apiData?.worldbank || [];
        const latest = wb[0] ? `${(wb[0].value / 1000).toFixed(1)} Mt` : info.cards[0].value;
        const prev = wb[1] ? `${(wb[1].value / 1000).toFixed(1)} Mt` : info.cards[1].value;
        return [
          { category: 'Latest GHG', value: latest, text: 'total greenhouse gas emissions (CO2 eq) from latest World Bank data.' },
          { category: 'Previous Year', value: prev, text: 'total emissions from the prior reporting period.' },
          info.cards[2]
        ]
      }
      case 'energy': {
        const nasa = apiData?.nasa?.properties?.parameter || {};
        const swdKeys = Object.keys(nasa.ALLSKY_SFC_SW_DWN || {}).filter(k => nasa.ALLSKY_SFC_SW_DWN[k] !== -999);
        const latestSolar = swdKeys.length ? `${nasa.ALLSKY_SFC_SW_DWN[swdKeys[swdKeys.length - 1]]}` : 'N/A';
        const tempKeys = Object.keys(nasa.T2M || {}).filter(k => nasa.T2M[k] !== -999);
        const latestTemp = tempKeys.length ? `${nasa.T2M[tempKeys[tempKeys.length - 1]]} °C` : 'N/A';
        
        return [
          { category: 'Solar Insolation', value: latestSolar, text: 'kW-hr/m^2/day latest solar radiation average for Qatar.' },
          { category: 'Avg Temp (2m)', value: latestTemp, text: 'latest daily average surface temperature from NASA POWER.' },
          info.cards[2]
        ]
      }
      case 'esg': {
        const unsdg = apiData?.unsdg || [];
        const latest = unsdg[0] ? `${parseFloat(unsdg[0].value).toFixed(1)}` : info.cards[0].value;
        return [
          { category: 'SDG 7 - Renewable Energy', value: `${latest}%`, text: 'renewable energy consumption (% of total final energy consumption) from World Bank data.' },
          info.cards[1],
          info.cards[2]
        ]
      }
      case 'risks': {
        const openaq = apiData?.openaq?.results?.[0]?.measurements || [];
        const pm25 = openaq.find((m: any) => m.parameter === 'pm25');
        const pm10 = openaq.find((m: any) => m.parameter === 'pm10');
        return [
          { category: 'Air Quality PM2.5', value: pm25 ? `${pm25.value}` : 'N/A', text: `${pm25 ? pm25.unit : ''} particulate matter density in Doha.` },
          { category: 'Air Quality PM10', value: pm10 ? `${pm10.value}` : 'N/A', text: `${pm10 ? pm10.unit : ''} particulate matter density in Doha.` },
          info.cards[2]
        ]
      }
      case 'heatmap': {
        const noaa = apiData?.noaa || [];
        const latest = noaa[noaa.length - 1] ? `${noaa[noaa.length - 1].value} °C` : info.cards[0].value;
        return [
          { category: 'Recent Avg Temp', value: latest, text: 'average temperature for the most recent year in NOAA records.' },
          info.cards[1],
          info.cards[2]
        ]
      }
      case 'infrastructure': {
        const cckp = apiData?.cckp || { projectedPrecipitation: '0', unit: 'mm' };
        const osm = apiData?.osm || { powerPlantsCount: '0' };
        const unocha = apiData?.unocha || { datasetCount: 0 };
        return [
          { category: 'Vulnerability Datasets', value: `${unocha.datasetCount}`, text: 'open humanitarian and risk datasets available for Qatar on HDX.' },
          { category: 'Projected Rainfall', value: `${cckp.projectedPrecipitation}`, text: `${cckp.unit} median projection under SSP2-4.5 for Qatar.` },
          { category: 'Power Infrastructure', value: osm.powerPlantsCount, text: 'mapped power plant facilities across Qatar on OpenStreetMap.' }
        ]
      }
      default:
        return info.cards;
    }
  }

  const dynamicCards = getDynamicCards(activeTab, info, apiData);

  const renderChart = (tab: TabKey, info: any, apiData: any) => {
    switch (tab) {
      case 'emissions': {
        const wb = apiData?.worldbank;
        const chartData = (Array.isArray(wb) ? wb : []).map((item: any) => ({
          year: item.date,
          emissions: item.value || 0
        })).reverse();
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="emissions" stroke="#8B1538" strokeWidth={3} dot={{ r: 4, fill: '#8B1538', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      }
      case 'energy': {
        const nasa = apiData?.nasa;
        const swd = nasa?.properties?.parameter?.ALLSKY_SFC_SW_DWN || {};
        const chartData = Object.keys(swd)
          .filter(date => swd[date] !== -999)
          .map(date => ({
            date: date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
            solar: swd[date]
          })).slice(-7);

        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B1538" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B1538" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="solar" stroke="#8B1538" strokeWidth={3} fillOpacity={1} fill="url(#colorSolar)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      }
      case 'esg': {
        const unsdg = apiData?.unsdg;
        const chartData = (Array.isArray(unsdg) ? unsdg : []).map((item: any) => ({
          year: item.timePeriodStart,
          value: parseFloat(item.value)
        }));
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="stepAfter" dataKey="value" stroke="#8B1538" strokeWidth={3} dot={{ r: 4, fill: '#8B1538', strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        );
      }
      case 'risks': {
        const openaq = apiData?.openaq;
        const measurements = openaq?.results?.[0]?.measurements || [];
        const chartData = measurements.map((m: any) => ({
          name: m.parameter.toUpperCase(),
          value: m.value
        }));
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" fill="#8B1538" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        );
      }
      case 'heatmap': {
        const noaa = apiData?.noaa;
        const chartData = (Array.isArray(noaa) ? noaa : []).map((item: any) => ({
          year: item.date.substring(0, 4),
          temp: item.value
        }));
        return (
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="temp" fill="#8B1538" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        )
      }
      case 'infrastructure': {
        const cckp = apiData?.cckp || { projectedPrecipitation: 0 };
        const osm = apiData?.osm || { powerPlantsCount: 0 };
        const unocha = apiData?.unocha || { datasetCount: 0 };
        
        const chartData = [
          { name: 'HDX Datasets', value: Number(unocha.datasetCount) },
          { name: 'Rainfall (mm)', value: Number(cckp.projectedPrecipitation) },
          { name: 'Power Plants', value: Number(osm.powerPlantsCount) }
        ];

        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" fill="#8B1538" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        )
      }
      case 'finance':
      default: {
        // Fallback to dummy data mapping for sections without API
        const chartData = (info.chartLabels || []).map((lbl: string, i: number) => ({
          name: lbl,
          value: info.chartData ? info.chartData[i] : 0
        }));
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" fill="#8B1538" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        )
      }
    }
  }

  return (
    <section className="relative py-[80px] pt-[120px] overflow-hidden" id="sustainability-data">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src="/images/solar.jpg" alt="Sustainability Background" className="w-full h-full object-cover opacity-[0.15] mix-blend-luminosity grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbfafa]/95 via-white/90 to-white/95 backdrop-blur-[4px]"></div>
      </div>

      {/* Background SVG Network (Subtle) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
        <div ref={bgRef} className="absolute inset-x-0 -top-[25%] h-[150%] will-change-transform">
          {/* Top Left SVG */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 opacity-[0.28]">
          {/* Connection lines */}
          <line x1="-40" y1="40" x2="180" y2="10" stroke="rgba(139,21,56,0.32)" strokeWidth="1.8" />
          <line x1="180" y1="10" x2="360" y2="90" stroke="rgba(139,21,56,0.28)" strokeWidth="1.8" />
          <line x1="-40" y1="40" x2="60" y2="260" stroke="rgba(139,21,56,0.22)" strokeWidth="1.8" />
          <line x1="180" y1="10" x2="280" y2="220" stroke="rgba(139,21,56,0.22)" strokeWidth="1.8" />
          <line x1="360" y1="90" x2="460" y2="300" stroke="rgba(139,21,56,0.22)" strokeWidth="1.8" />
          <line x1="60" y1="260" x2="280" y2="220" stroke="rgba(139,21,56,0.26)" strokeWidth="1.8" />
          <line x1="280" y1="220" x2="460" y2="300" stroke="rgba(139,21,56,0.26)" strokeWidth="1.8" />
          <line x1="180" y1="10" x2="460" y2="300" stroke="rgba(139,21,56,0.18)" strokeWidth="1.2" strokeDasharray="4 4" />
          {/* Nodes */}
          <circle cx="-40" cy="40" r="8" fill="rgba(139,21,56,0.38)" />
          <circle cx="-40" cy="40" r="4" fill="rgba(139,21,56,0.75)" />
          <circle cx="180" cy="10" r="10" fill="rgba(139,21,56,0.35)" />
          <circle cx="180" cy="10" r="5" fill="rgba(139,21,56,0.80)" />
          <circle cx="360" cy="90" r="8" fill="rgba(139,21,56,0.38)" />
          <circle cx="360" cy="90" r="4" fill="rgba(139,21,56,0.75)" />
          <circle cx="60" cy="260" r="8" fill="rgba(139,21,56,0.38)" />
          <circle cx="60" cy="260" r="4" fill="rgba(139,21,56,0.75)" />
          <circle cx="280" cy="220" r="9" fill="rgba(139,21,56,0.35)" />
          <circle cx="280" cy="220" r="4.5" fill="rgba(139,21,56,0.80)" />
          <circle cx="460" cy="300" r="8" fill="rgba(139,21,56,0.38)" />
          <circle cx="460" cy="300" r="4" fill="rgba(139,21,56,0.75)" />
        </svg>

        {/* Bottom Right SVG (Mirrored) */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 opacity-[0.28]" style={{ transform: 'rotate(180deg)' }}>
          {/* Connection lines */}
          <line x1="-40" y1="40" x2="180" y2="10" stroke="rgba(139,21,56,0.32)" strokeWidth="1.8" />
          <line x1="180" y1="10" x2="360" y2="90" stroke="rgba(139,21,56,0.28)" strokeWidth="1.8" />
          <line x1="-40" y1="40" x2="60" y2="260" stroke="rgba(139,21,56,0.22)" strokeWidth="1.8" />
          <line x1="180" y1="10" x2="280" y2="220" stroke="rgba(139,21,56,0.22)" strokeWidth="1.8" />
          <line x1="360" y1="90" x2="460" y2="300" stroke="rgba(139,21,56,0.22)" strokeWidth="1.8" />
          <line x1="60" y1="260" x2="280" y2="220" stroke="rgba(139,21,56,0.26)" strokeWidth="1.8" />
          <line x1="280" y1="220" x2="460" y2="300" stroke="rgba(139,21,56,0.26)" strokeWidth="1.8" />
          <line x1="180" y1="10" x2="460" y2="300" stroke="rgba(139,21,56,0.18)" strokeWidth="1.2" strokeDasharray="4 4" />
          {/* Nodes */}
          <circle cx="-40" cy="40" r="8" fill="rgba(139,21,56,0.38)" />
          <circle cx="-40" cy="40" r="4" fill="rgba(139,21,56,0.75)" />
          <circle cx="180" cy="10" r="10" fill="rgba(139,21,56,0.35)" />
          <circle cx="180" cy="10" r="5" fill="rgba(139,21,56,0.80)" />
          <circle cx="360" cy="90" r="8" fill="rgba(139,21,56,0.38)" />
          <circle cx="360" cy="90" r="4" fill="rgba(139,21,56,0.75)" />
          <circle cx="60" cy="260" r="8" fill="rgba(139,21,56,0.38)" />
          <circle cx="60" cy="260" r="4" fill="rgba(139,21,56,0.75)" />
          <circle cx="280" cy="220" r="9" fill="rgba(139,21,56,0.35)" />
          <circle cx="280" cy="220" r="4.5" fill="rgba(139,21,56,0.80)" />
          <circle cx="460" cy="300" r="8" fill="rgba(139,21,56,0.38)" />
          <circle cx="460" cy="300" r="4" fill="rgba(139,21,56,0.75)" />
        </svg>
        </div>
      </div>

      <Container className="relative z-10">
        <div className="flex gap-12 flex-wrap items-start">
          
          {/* Left Column */}
          <div className="flex-1 min-w-[320px] max-w-[480px] flex flex-col gap-6">
            <Typography variant="h3" className="uppercase text-ink m-0">
              <span className="font-extrabold">Data</span> for Sustainability
            </Typography>
            <p className="text-[15px] text-ink-soft leading-[1.6] m-0 font-light">
              Access critical ESG disclosures, carbon intensity trends, policy risks, and green finance insights to drive data-led corporate transitions.
            </p>
            <a href="/tools" className="bg-[#8B1538] text-white py-3 px-7 rounded-full text-[13.5px] no-underline font-bold w-fit inline-block transition-colors hover:bg-[#72102d]">
              Explore Data Hub
            </a>

            <div className="flex flex-col gap-2 mt-4">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-ink-muted mb-2">
                Explore by Focus Area
              </span>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { key: 'emissions', label: 'Emissions' },
                  { key: 'energy', label: 'Clean Energy' },
                  { key: 'finance', label: 'Climate Finance' },
                  { key: 'esg', label: 'ESG Compliance' },
                  { key: 'risks', label: 'Stranded Risks' },
                  { key: 'heatmap', label: 'Climate Risk Heatmap' },
                  { key: 'infrastructure', label: 'Infrastructure & Risk' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as TabKey)}
                    className={`py-2 px-4 rounded-full text-xs font-bold border-[1.5px] cursor-pointer transition-all duration-200 ${
                      activeTab === tab.key 
                        ? 'border-[#8B1538] bg-[#8B1538] text-white shadow-md'
                        : 'border-line bg-transparent text-ink-soft hover:border-[#8B1538]/50 hover:bg-[#8B1538]/5 hover:text-[#8B1538]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-[1.8] min-w-full md:min-w-[480px] flex flex-col gap-9">
            {/* Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 min-h-[140px]">
              {dynamicCards.map((card: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-2 p-5 rounded-[20px] bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgba(139,21,56,0.04)] animate-in fade-in slide-in-from-bottom-2 duration-300 hover:-translate-y-1 transition-transform">
                  <div className="text-[10.5px] font-bold text-ink-muted uppercase tracking-[0.08em]">{card.category}</div>
                  <div className="text-[26px] font-extrabold text-[#8B1538] leading-[1.1]">{card.value}</div>
                  <div className="text-[13px] text-ink-soft leading-[1.5] font-light mt-auto">{card.text}</div>
                </div>
              ))}
            </div>

            {/* Dynamic Graph Visualizer Card */}
            <div className="flex flex-col gap-5 p-6 rounded-[24px] bg-white/70 backdrop-blur-2xl border border-white shadow-[0_12px_40px_rgba(139,21,56,0.06)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B1538]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
              
              <div className="flex justify-between items-center flex-wrap gap-2 relative z-10">
                <h4 className="text-[16px] font-bold text-ink m-0 tracking-[-0.01em]">
                  {info.chartTitle}
                </h4>
                <div className="text-[11px] font-bold text-[#8B1538] flex items-center gap-1.5 uppercase tracking-[0.05em] bg-white px-3 py-1.5 rounded-full shadow-sm">
                  <span className="inline-block w-1.5 h-1.5 bg-[#8B1538] rounded-full animate-pulse"></span>
                  Live Data
                </div>
              </div>

              {/* SVG Graph Container */}
              <div className="w-full h-[260px] relative z-10 mt-2">
                {renderChart(activeTab, info, apiData)}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
