import React from 'react'
import Link from 'next/link'

export const Hero = () => {
  return (
    <section className="hero-insights">
      <div className="hero-insights-bg"></div>
      <div className="hero-insights-overlay"></div>

      {/* Centered Hero Content */}
      <div className="wrap" style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '24px', paddingBottom: '24px', flexGrow: 1 }}>
        <div style={{ maxWidth: '820px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#ffb7c5', display: 'inline-block', marginBottom: '14px' }}>
            Technical Advisory &amp; Knowledge Hub
          </span>
          <h1 style={{ fontSize: 'clamp(34px, 4.8vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', color: '#ffffff', margin: '0 0 16px', textAlign: 'center' }}>
            Sustainable decisions start with better data.
          </h1>
          <p style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.45, margin: '0 auto 26px', maxWidth: '60ch', fontWeight: 300, textAlign: 'center' }}>
            A resource base for climate action, carbon policy, and ESG transition parameters.
          </p>

          {/* Large Search Bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '680px', zIndex: 5, margin: '24px auto 0' }}>
            <div className="hero-search-wrapper">
              <svg className="shrink-0" style={{ width: '20px', height: '20px', color: '#6b7280', marginRight: '12px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" className="hero-search-input" placeholder="Search publications, tools, and emissions dashboards..." aria-label="Search Query" />
              <button className="hero-search-btn">
                <span>Search</span>
              </button>
            </div>

            {/* Trending Topics / Quick Tags */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', alignSelf: 'center', marginRight: '4px' }}>Trending:</span>
              <Link href="/knowledge-hub" className="search-tag-link" style={{ fontSize: '12px', color: '#ffffff', background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.12)', transition: 'all 0.2s ease' }}>GHG Inventories</Link>
              <Link href="/knowledge-hub" className="search-tag-link" style={{ fontSize: '12px', color: '#ffffff', background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.12)', transition: 'all 0.2s ease' }}>Carbon Credits</Link>
              <Link href="/knowledge-hub" className="search-tag-link" style={{ fontSize: '12px', color: '#ffffff', background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.12)', transition: 'all 0.2s ease' }}>ESG Disclosures</Link>
              <Link href="/knowledge-hub" className="search-tag-link" style={{ fontSize: '12px', color: '#ffffff', background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.12)', transition: 'all 0.2s ease' }}>LEAP Modeling</Link>
              <Link href="/knowledge-hub" className="search-tag-link" style={{ fontSize: '12px', color: '#ffffff', background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.12)', transition: 'all 0.2s ease' }}>Decarbonization</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Down Cue */}
      <div style={{ position: 'relative', zIndex: 2, marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <a href="#insights-teaser" className="scroll-down-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', color: '#ffffff', transition: 'all 0.3s ease', textDecoration: 'none' }}>
          <svg className="scroll-arrow" style={{ width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
        </a>
      </div>
    </section>
  )
}

