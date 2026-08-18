import React from 'react'

export const GlobalNetwork = () => {
  return (
    <section className="band" id="global-network" style={{ background: '#ffffff', padding: '60px 0', overflow: 'visible' }}>
      <div className="wrap">
        <div style={{ display: 'flex', gap: '64px', alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Left Column (Text & Offices list) */}
          <div style={{ flex: 1, minWidth: '320px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px', textTransform: 'uppercase' }}>
                <span style={{ fontWeight: 800 }}>Over 25 Countries,</span><br/>One Shared Mission
              </h2>
              <p style={{ fontSize: '15.5px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
                We connect global expertise with regional insights. Backed by specialists from over 25 countries, we
                manage a growing network of regional and representative offices.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
              <div>
                <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Key Offices</h5>
                <ul style={{ fontSize: '13px', color: 'var(--ink-soft)', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '4px' }}><strong style={{ color: 'var(--ink)' }}>London, UK</strong> (Corporate)</li>
                  <li style={{ marginBottom: '4px' }}><strong style={{ color: 'var(--ink)' }}>Doha, Qatar</strong> (MENA Regional)
                  </li>
                  <li style={{ marginBottom: '4px' }}><strong style={{ color: 'var(--ink)' }}>Sharjah, UAE</strong> (SPC Free Zone)
                  </li>
                </ul>
              </div>
              <div>
                <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Representative Offices</h5>
                <ul style={{ fontSize: '13px', color: 'var(--ink-soft)', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '4px' }}>Muscat, Oman</li>
                  <li style={{ marginBottom: '4px' }}>Riyadh, Saudi Arabia</li>
                  <li style={{ marginBottom: '4px' }}>Khartoum, Sudan</li>
                  <li style={{ marginBottom: '4px' }}>Beijing, China</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column (Maroon Map Card) */}
          <div className="global-map-wrapper" style={{ flex: 1.6, minWidth: '480px', background: 'linear-gradient(135deg, #8B1538 0%, #5a0d1e 100%)', borderRadius: 'var(--r-lg)', padding: 0, position: 'relative', boxShadow: '0 20px 50px rgba(139,21,56,0.2)', height: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

            {/* Unified SVG with Zoomed ViewBox */}
            <svg width="100%" height="100%" viewBox="370 340 280 180" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.95, position: 'relative', zIndex: 1 }}>

              {/* Real World Map Embedded via SVG Image */}
              <image href="/assets/images/world-map.svg" x="30.767" y="241.591" width="784.077" height="458.627" style={{ opacity: 0.18, filter: 'brightness(20)' }} preserveAspectRatio="none" />

              {/* Connection Lines from Doha (527, 463) to other offices */}
              <path d="M 527 463 Q 460 410, 398 372" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" strokeDasharray="2 2" /> {/* London */}
              <path d="M 527 463 L 515 467" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
              {/* Riyadh */}
              <path d="M 527 463 L 534 477" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
              {/* Muscat */}
              <path d="M 527 463 Q 500 480, 475 495" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" strokeDasharray="2 2" /> {/* Khartoum */}
              <path d="M 527 463 Q 580 420, 630 385" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" strokeDasharray="2 2" /> {/* Beijing */}

              {/* Key Locations Pulsing Dots */}

              {/* Doha (Qatar) MENA Office */}
              <g style={{ cursor: 'pointer' }}>
                <circle cx="527" cy="463" r="3" fill="rgba(255,255,255,0.25)">
                  <animate attributeName="r" values="2;5;2" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="527" cy="463" r="1.5" fill="#ffffff" />
                <text x="527" y="457" fill="rgba(255,255,255,0.9)" fontSize="5" fontWeight="700" textAnchor="middle">Doha
                  (MENA)</text>
              </g>

              {/* London */}
              <g style={{ cursor: 'pointer' }}>
                <circle cx="398" cy="372" r="1.5" fill="#ffffff" />
                <text x="398" y="367" fill="rgba(255,255,255,0.85)" fontSize="4.5" fontWeight="600" textAnchor="middle">London</text>
              </g>

              {/* Riyadh */}
              <g style={{ cursor: 'pointer' }}>
                <circle cx="515" cy="467" r="1.5" fill="#ffffff" />
                <text x="510" y="468.5" fill="rgba(255,255,255,0.85)" fontSize="4.5" fontWeight="600" textAnchor="end">Riyadh</text>
              </g>

              {/* Muscat */}
              <g style={{ cursor: 'pointer' }}>
                <circle cx="534" cy="477" r="1.5" fill="#ffffff" />
                <text x="539" y="478.5" fill="rgba(255,255,255,0.85)" fontSize="4.5" fontWeight="600" textAnchor="start">Muscat</text>
              </g>

              {/* Khartoum */}
              <g style={{ cursor: 'pointer' }}>
                <circle cx="475" cy="495" r="1.5" fill="#ffffff" />
                <text x="475" y="504" fill="rgba(255,255,255,0.85)" fontSize="4.5" fontWeight="600" textAnchor="middle">Khartoum</text>
              </g>

              {/* Beijing */}
              <g style={{ cursor: 'pointer' }}>
                <circle cx="630" cy="385" r="1.5" fill="#ffffff" />
                <text x="630" y="380" fill="rgba(255,255,255,0.85)" fontSize="4.5" fontWeight="600" textAnchor="middle">Beijing</text>
              </g>

              {/* UAE / Sharjah */}
              <g style={{ cursor: 'pointer' }}>
                <circle cx="530" cy="465" r="1" fill="#ffffff" />
              </g>
            </svg>

            <div style={{ position: 'absolute', bottom: '16px', left: '24px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 2 }}>
              <span style={{ width: '8px', height: '8px', background: '#ffffff', borderRadius: '50%', display: 'inline-block' }}></span>
              <span>Offices &amp; Representative Hubs</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
