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
    <section className="band" id="sustainability-data" style={{ position: 'relative', background: '#ffffff', padding: '100px 0 60px', overflow: 'visible' }}>
      {/* Background SVG Network */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.28 }}>
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

      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Left Column */}
          <div style={{ flex: 1, minWidth: '320px', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' }}>
              <span style={{ fontWeight: 800 }}>Data</span> for Sustainability
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
              Access critical ESG disclosures, carbon intensity trends, policy risks, and green finance insights to drive data-led corporate transitions.
            </p>
            <a href="/tools" className="btn primary client-hover-btn-primary" style={{ background: '#8B1538', color: '#ffffff', padding: '12px 28px', borderRadius: '100px', fontSize: '13.5px', textDecoration: 'none', fontWeight: 700, width: 'fit-content', display: 'inline-block', transition: 'background 0.3s' }}>
              Explore Data Hub
            </a>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginBottom: '8px' }}>
                Explore by Focus Area
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
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
                    className={`data-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                    style={activeTab === tab.key 
                      ? { padding: '8px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, border: '1.5px solid #8B1538', background: '#ffffff', color: '#8B1538', cursor: 'pointer' }
                      : { padding: '8px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, border: '1.5px solid var(--line)', background: 'transparent', color: 'var(--ink-soft)', cursor: 'pointer', transition: 'all 0.2s' }
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ flex: 1.8, minWidth: '480px', display: 'flex', flexDirection: 'column', gap: '36px' }}>
            {/* Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', borderBottom: '1px solid rgba(139, 21, 56, 0.1)', paddingBottom: '32px' }}>
              {info.cards.map((card, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.category}</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#8B1538', lineHeight: 1.1 }}>{card.value}</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>{card.text}</div>
                </div>
              ))}
            </div>

            {/* Dynamic Graph Visualizer Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>
                  {info.chartTitle}
                </h4>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#8B1538', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#8B1538', borderRadius: '50%' }}></span>
                  Interactive Projection
                </div>
              </div>

              {/* SVG Graph Container */}
              <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                <div style={{ color: 'var(--ink-muted)', fontSize: '13px', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px dashed var(--line)', borderRadius: 'var(--r-md)' }}>
                  [Chart Placeholder: {info.chartType} graph for {activeTab}]
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .client-hover-btn-primary:hover { background: #72102d !important; }
        .data-tab-btn:not(.active):hover { border-color: #8B1538 !important; color: #8B1538 !important; }
        @media (max-width: 900px) {
          #sustainability-data .wrap > div { flex-direction: column; }
          #sustainability-data .wrap > div > div:nth-child(2) { min-width: 100% !important; }
        }
      `}} />
    </section>
  )
}

