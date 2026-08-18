'use client'

import React, { useState } from 'react'

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
  }
}

type TabKey = keyof typeof dataHub

export const SustainabilityData = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('emissions')
  
  const info = dataHub[activeTab]

  return (
    <section id="sustainability-data" className="relative bg-white pt-[100px] pb-[60px] overflow-visible">
      {/* Background SVG Network */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0">
          <line x1="-40" y1="40" x2="180" y2="10" stroke="rgba(139,21,56,0.32)" strokeWidth="1.8" />
          <line x1="180" y1="10" x2="360" y2="90" stroke="rgba(139,21,56,0.28)" strokeWidth="1.8" />
          <line x1="-40" y1="40" x2="60" y2="260" stroke="rgba(139,21,56,0.22)" strokeWidth="1.8" />
          <line x1="180" y1="10" x2="280" y2="220" stroke="rgba(139,21,56,0.22)" strokeWidth="1.8" />
          <line x1="360" y1="90" x2="460" y2="300" stroke="rgba(139,21,56,0.22)" strokeWidth="1.8" />
          <line x1="60" y1="260" x2="280" y2="220" stroke="rgba(139,21,56,0.26)" strokeWidth="1.8" />
          <line x1="280" y1="220" x2="460" y2="300" stroke="rgba(139,21,56,0.26)" strokeWidth="1.8" />
          <line x1="180" y1="10" x2="460" y2="300" stroke="rgba(139,21,56,0.18)" strokeWidth="1.2" strokeDasharray="4 4" />
          
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

      <div className="w-full max-w-7xl mx-auto px-6 relative z-[1]">
        <div className="flex gap-12 flex-wrap items-start">
          
          {/* Left Column (Description and Tabs) */}
          <div className="flex-1 min-w-[320px] max-w-[480px] flex flex-col gap-6">
            <h3 className="text-[clamp(28px,3.5vw,42px)] font-light text-gray-900 leading-[1.15] tracking-[-0.02em] m-0 uppercase">
              <span className="font-extrabold">Data</span> for Sustainability
            </h3>
            <p className="text-[15px] text-gray-600 leading-[1.6] m-0">
              Access critical ESG disclosures, carbon intensity trends, policy risks, and green finance insights to drive data-led corporate transitions.
            </p>
            <a href="/tools" className="bg-[#8B1538] hover:bg-[#72102d] text-white px-7 py-3 rounded-full text-[13.5px] font-bold w-fit transition-colors">
              Explore Data Hub
            </a>

            <div className="flex flex-col gap-2 mt-4">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-gray-400 mb-2">
                Explore by Focus Area
              </span>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { key: 'emissions', label: 'Emissions' },
                  { key: 'energy', label: 'Clean Energy' },
                  { key: 'finance', label: 'Climate Finance' },
                  { key: 'esg', label: 'ESG Compliance' },
                  { key: 'risks', label: 'Stranded Risks' },
                  { key: 'heatmap', label: 'Climate Risk Heatmap' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as TabKey)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border ${activeTab === tab.key ? 'bg-white text-[#8B1538] border-[#8B1538] shadow-sm' : 'bg-transparent text-gray-500 border-gray-200 hover:border-[#8B1538] hover:text-[#8B1538]'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Cards Grid & Chart Container) */}
          <div className="flex-[1.8] min-w-[320px] lg:min-w-[480px] flex flex-col gap-9">
            
            {/* Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-[#8B1538]/10 pb-8">
              {info.cards.map((card, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 p-4 rounded bg-gray-50/50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{card.category}</div>
                  <div className="text-[18px] font-extrabold text-[#8B1538] leading-none mb-1">{card.value}</div>
                  <div className="text-[12px] text-gray-500 leading-snug">{card.text}</div>
                </div>
              ))}
            </div>

            {/* Dynamic Graph Visualizer Card */}
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h4 className="text-[15px] font-bold text-gray-900 m-0 tracking-tight">
                  {info.chartTitle}
                </h4>
                <div className="text-[11px] font-bold text-[#8B1538] flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="inline-block w-1.5 h-1.5 bg-[#8B1538] rounded-full animate-pulse"></span>
                  Interactive Projection
                </div>
              </div>

              {/* SVG Graph Container */}
              <div className="w-full h-[220px] relative bg-white border border-gray-100 rounded-lg p-2 shadow-sm overflow-hidden flex items-center justify-center">
                <div className="text-gray-400 text-sm italic">
                  [Chart Placeholder: {info.chartType} graph for {activeTab}]
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
