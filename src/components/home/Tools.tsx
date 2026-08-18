import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export const Tools = async () => {
  const payload = await getPayload({ config: configPromise })
  
  const { docs: toolsData } = await payload.find({
    collection: 'tools',
    limit: 4,
    depth: 1, // Populate media relation
  })

  // Fallback data if CMS is empty
  const defaultTools = [
    {
      id: 'ghg',
      category: 'Carbon Footprint',
      title: 'GHG Emissions Calculator',
      desc: 'Streamlining accurate and comprehensive emissions accounting.',
      image: '/assets/images/ghg365.png',
      link: '/tools#ghg365'
    },
    {
      id: 'mrv',
      category: 'Measurement & Reporting',
      title: 'MRV Tool',
      desc: 'Facilitating robust data management and transparent reporting.',
      image: '/assets/images/logo-color.png',
      link: '/tools#mrv'
    },
    {
      id: 'ecorisk',
      category: 'Risk Management',
      title: 'ESIA Risk Assessment Tool',
      desc: 'Identifying and mitigating environmental and social impacts.',
      image: '/assets/images/ecorisk.png',
      link: '/tools#eccrisk'
    },
    {
      id: 'greenscale',
      category: 'Capital Advisory',
      title: 'Green Project Scoring Tool',
      desc: 'Determining eligibility for "Green Finance" initiatives.',
      image: '/assets/images/greenscale.png',
      link: '/tools#greenscale'
    }
  ]

  const secondaryTools = toolsData.length > 0 ? toolsData.map(doc => ({
    id: doc.id,
    category: doc.category,
    title: doc.title,
    desc: doc.desc,
    // @ts-ignore
    image: doc.image?.url || '/assets/images/ghg365.png',
    link: doc.link
  })) : defaultTools


  return (
    <section className="band" id="tools" style={{ background: '#ffffff', padding: '60px 0' }}>
      <div className="wrap">

        <div style={{ maxWidth: '800px', marginBottom: '48px', textAlign: 'left' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px', textTransform: 'uppercase' }}>
            PROPRIETARY <span style={{ fontWeight: 800 }}>Tools</span>
          </h2>
          <p style={{ fontSize: '15.5px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
            We leverage a suite of proprietary algorithms, dashboards, and structured templates to guide sustainable
            decisions and carbon reduction pathways.
          </p>
        </div>

        {/* Hybrid layout: Sticky Flagship on left, scrolling grid on right */}
        <div className="tools-hybrid-container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: '32px', width: '100%', alignItems: 'start' }}>

          {/* Left: Sticky Flagship Card (ESG Readiness Tool) */}
          <div className="flagship-tool-card client-hover-flagship" style={{ background: '#ffffff', border: '1.5px solid rgba(139, 21, 56, 0.15)', borderRadius: 'var(--r-md)', padding: '56px 36px 36px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '24px', transition: 'all 0.3s ease', boxShadow: '0 15px 40px rgba(139,21,56,0.03)', position: 'sticky', top: '150px', zIndex: 10, boxSizing: 'border-box', alignSelf: 'start', height: 'auto', overflow: 'visible', marginTop: '40px' }}>
            <div>
              {/* Overlapping Banner */}
              <div style={{ background: '#FAFBFB', height: '140px', border: '1.5px solid rgba(139, 21, 56, 0.12)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-76px', marginBottom: '24px', boxShadow: '0 12px 28px rgba(139,21,56,0.06)', position: 'relative', zIndex: 5, overflow: 'hidden', padding: '16px' }}>
                <img src="/assets/images/esg-logo.webp" alt="ESG Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#8B1538', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
                Flagship Application
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                ESG Readiness Tool
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0, fontWeight: 300 }}>
                Assessing and enhancing your Environmental, Social, and Governance performance.
              </p>

              {/* Features List */}
              <div style={{ borderTop: '1px solid rgba(139,21,56,0.08)', paddingTop: '20px', marginTop: '24px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={{ fontSize: '13px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500 }}>
                    <svg style={{ width: '16px', height: '16px', color: '#8B1538' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                    Automated SASB &amp; GRI alignment
                  </li>
                  <li style={{ fontSize: '13px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500 }}>
                    <svg style={{ width: '16px', height: '16px', color: '#8B1538' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                    Real-time peer benchmarking
                  </li>
                  <li style={{ fontSize: '13px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500 }}>
                    <svg style={{ width: '16px', height: '16px', color: '#8B1538' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                    Custom materiality matrices
                  </li>
                </ul>
              </div>
            </div>

            <Link href="/esg-assessment" className="btn client-hover-btn-launch" style={{ background: '#8B1538', color: '#ffffff', textAlign: 'center', padding: '14px 24px', borderRadius: '100px', fontSize: '13px', fontWeight: 700, display: 'block', transition: 'background 0.2s', boxShadow: '0 4px 14px rgba(139,21,56,0.25)', textDecoration: 'none' }}>
              Launch Assessment Tool
            </Link>
          </div>

          {/* Right: Grid of remaining 4 tools (Scrolls with page scroll) */}
          <div className="secondary-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', boxSizing: 'border-box' }}>
            {secondaryTools.map(tool => (
              <div key={tool.id} className="client-hover-tool" style={{ background: '#ffffff', border: '1px solid rgba(139, 21, 56, 0.08)', borderRadius: 'var(--r-md)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px', transition: 'all 0.3s ease', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <div>
                  <div className="tool-img-bg" style={{ background: '#FAFBFB', height: '110px', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid rgba(139, 21, 56, 0.1)', overflow: 'hidden', padding: '12px', transition: 'background 0.3s' }}>
                    <img src={tool.image} alt={tool.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#8B1538', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                    {tool.category}
                  </span>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px' }}>
                    {tool.title}
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', lineHeight: 1.55, margin: 0, fontWeight: 300 }}>
                    {tool.desc}
                  </p>
                </div>
                <Link href={tool.link} className="client-hover-tool-link" style={{ fontSize: '12px', fontWeight: 700, color: '#8B1538', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', transition: 'color 0.2s', marginTop: '12px' }}>
                  Learn More &rarr;
                </Link>
              </div>
            ))}
          </div>
          
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .client-hover-flagship:hover { transform: translateY(-4px) !important; box-shadow: 0 25px 50px rgba(139,21,56,0.08) !important; }
        .client-hover-btn-launch:hover { background: #72102d !important; }
        .client-hover-tool:hover { transform: translateY(-4px) !important; box-shadow: 0 20px 40px rgba(139,21,56,0.06) !important; border-color: rgba(139,21,56,0.2) !important; }
        .client-hover-tool:hover .tool-img-bg { background: #ffffff !important; }
        .client-hover-tool-link:hover { color: #72102d !important; }
        @media (max-width: 900px) {
          .tools-hybrid-container { grid-template-columns: 1fr !important; }
          .flagship-tool-card { position: static !important; }
          .secondary-tools-grid { grid-template-columns: 1fr !important; }
        }
      `}} />
    </section>
  )
}

