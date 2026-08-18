import React from 'react'

export const ImpactStats = () => {
  return (
    <section className="band" id="impact-stats" style={{ background: '#ffffff', padding: '60px 0', overflow: 'visible' }}>
      <div className="wrap">
        <div style={{ display: 'flex', gap: '64px', alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Left Column (Image representing purpose/results) */}
          <div style={{ flex: 1.2, minWidth: '320px', position: 'relative' }}>
            <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(15,40,65,0.08)', border: '1px solid var(--line)', height: '380px' }}>
              <img src="/assets/images/port.jpg" alt="Strategic Maritime Port Advisory" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '-24px', left: '20px', background: '#8B1538', color: '#ffffff', padding: '20px 24px', borderRadius: 'var(--r-md)', boxShadow: '0 10px 25px rgba(139,21,56,0.3)', maxWidth: '220px', textAlign: 'left', zIndex: 2 }}>
              <h5 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
                Advisory Audit
              </h5>
              <p style={{ fontSize: '12px', lineHeight: 1.4, margin: 0, color: 'rgba(255,255,255,0.9)', fontWeight: 300 }}>
                Verified carbon reduction and technical viability across maritime corridors.
              </p>
            </div>
          </div>

           {/* Right Column (Stats) */}
          <div style={{ flex: 1.5, minWidth: '360px', display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
            <div>
              <h3 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px', textTransform: 'uppercase' }}>
                Our <span style={{ fontWeight: 800 }}>Impact</span>
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
                Our project evaluations and transition roadmaps deliver rigorous, audited milestones that stand up to
                institutional investor scrutiny and global rating standards.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Stat Item 1 */}
              <div className="stat-row-item">
                <div className="stat-number">
                  <span>50+</span>
                  <svg style={{ width: '24px', height: '24px', color: '#8B1538', strokeWidth: '2.5px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0, fontWeight: 300 }}>
                  <strong style={{ color: 'var(--ink)' }}>Successful Advisory Projects</strong> completed across MENA,
                  Africa, and Europe, establishing a proven track record.
                </p>
              </div>

              {/* Stat Item 2 */}
              <div className="stat-row-item">
                <div className="stat-number">
                  <span>35+</span>
                  <svg style={{ width: '24px', height: '24px', color: '#8B1538', strokeWidth: '2.5px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0, fontWeight: 300 }}>
                  <strong style={{ color: 'var(--ink)' }}>Multidisciplinary Experts</strong> including PhD and Master's
                  graduates specializing in energy, climate, and ESG.
                </p>
              </div>

              {/* Stat Item 3 */}
              <div className="stat-row-item">
                <div className="stat-number">
                  <span>325+</span>
                  <svg style={{ width: '24px', height: '24px', color: '#8B1538', strokeWidth: '2.5px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0, fontWeight: 300 }}>
                  <strong style={{ color: 'var(--ink)' }}>Years of Combined Experience</strong> driving impactful
                  climate action, policy development, and strategic solutions.
                </p>
              </div>

              {/* Stat Item 4 */}
              <div className="stat-row-item">
                <div className="stat-number">
                  <span>25+</span>
                  <svg style={{ width: '24px', height: '24px', color: '#8B1538', strokeWidth: '2.5px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0, fontWeight: 300 }}>
                  <strong style={{ color: 'var(--ink)' }}>Global Specialist Countries</strong> represented in our
                  international consultancy and research network.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
