import React from 'react'
import Link from 'next/link'

export const AboutEnerqa = () => {
  return (
    <section className="band" id="about-enerqa" style={{ background: '#8c1639', padding: '40px 0', margin: '100px 0', overflow: 'visible', position: 'relative', zIndex: 10 }}>
      <div className="wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '260px', overflow: 'visible' }}>

        {/* Left Column (Content) */}
        <div className="priorities-banner-content" style={{ flex: 1.4, display: 'flex', flexDirection: 'column', gap: '28px', textAlign: 'left', position: 'relative', zIndex: 2, maxWidth: '52%' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.15em', display: 'inline-block', marginBottom: '8px' }}>
              About enerQA
            </span>
            <h3 style={{ fontSize: 'clamp(20px, 2.6vw, 32px)', fontWeight: 300, color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
              ENGINEERING<br/><span style={{ fontWeight: 800 }}>SUSTAINABLE DECISIONS</span>
            </h3>
            <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
              A multidisciplinary advisory firm at the crossroads of engineering and environmental strategy — helping
              governments and corporations navigate the energy transition.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '32px' }}>
            {/* Column 1 */}
            <div className="priorities-banner-subcol" style={{ flex: 1, minWidth: '200px', borderRight: '1px solid rgba(255, 255, 255, 0.15)', paddingRight: '40px' }}>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>Engineering Precision</h5>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.55, margin: '0 0 12px', fontWeight: 300 }}>
                Technical audits, energy models, and infrastructure assessments.
              </p>
              <Link href="/about" style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700, textDecoration: 'none', borderBottom: '1.5px solid #ffffff', paddingBottom: '2px' }}>
                Our Approach
              </Link>
            </div>

            {/* Column 2 */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>ESG Intelligence</h5>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.55, margin: '0 0 12px', fontWeight: 300 }}>
                Governance frameworks, impact measurement, and disclosure readiness.
              </p>
              <Link href="/about" style={{ color: '#ffffff', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none', borderBottom: '1.5px solid #ffffff', paddingBottom: '2px' }}>
                Meet the Team
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (Overlapping Circle) */}
        <div className="priorities-banner-image-wrapper" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 100 }}>
          <div style={{ position: 'relative', width: '460px', height: '460px', overflow: 'visible', zIndex: 100 }}>
            {/* Dark arc ring behind the image */}
            <div style={{ position: 'absolute', inset: '-12px', borderRadius: '50%', background: 'rgba(10, 2, 5, 0.55)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', inset: '-24px', borderRadius: '50%', background: 'rgba(10, 2, 5, 0.25)', zIndex: 0 }}></div>
            <img src="/assets/images/gas-energy.jpg" alt="About enerQA" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', position: 'relative', zIndex: 101, display: 'block' }} />
          </div>
        </div>

      </div>
    </section>
  )
}

