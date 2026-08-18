import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export const InsightsTeaser = async () => {
  const payload = await getPayload({ config: configPromise })
  
  const { docs: insightsData } = await payload.find({
    collection: 'insights',
    limit: 3,
    depth: 1, // Populate the media relation
  })

  // Fallback to static data if CMS is empty for now
  const defaultInsights = [
    {
      id: '1',
      title: 'GHG Emissions: The Burden on Our Planet',
      excerpt: 'How human activity has driven the sharp rise in greenhouse gases — and the case for urgent action.',
      category: 'GHG Emissions',
      image: '/assets/images/port.jpg'
    },
    {
      id: '2',
      title: 'Climate Forcers: Drivers of Warming',
      excerpt: "Beyond CO₂ — how short-lived pollutants like black carbon shape the planet's trajectory.",
      category: 'Climate Forcers',
      image: '/assets/images/solar.jpg'
    },
    {
      id: '3',
      title: 'Climate Resilience in Supply Chains',
      excerpt: 'What recent disruption reveals about exposure — and how to design for resilience in logistics.',
      category: 'Supply Chains',
      image: '/assets/images/gas-energy.jpg'
    }
  ]

  const insights = insightsData.length > 0 ? insightsData.map(doc => ({
    id: doc.id,
    title: doc.title,
    excerpt: doc.excerpt,
    category: doc.category,
    // @ts-ignore
    image: doc.image?.url || '/assets/images/port.jpg'
  })) : defaultInsights

  return (
    <section className="band panel" id="insights-teaser" style={{ background: '#ffffff', padding: '80px 0' }}>
      <div className="wrap">
        {/* Header with View All Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px', marginBottom: '48px', paddingBottom: '0', textAlign: 'left' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' }}>
              <span style={{ fontWeight: 800 }}>Latest</span> Insights
            </h2>
          </div>
          <div>
            <Link href="/knowledge-hub" className="client-hover-btn" style={{ border: '1.5px solid #8B1538', color: '#8B1538', background: 'transparent', padding: '10px 24px', borderRadius: '100px', fontSize: '13px', textDecoration: 'none', fontWeight: 700, transition: 'all 0.2s', whiteSpace: 'nowrap', display: 'inline-block' }}>
              More Insights
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          {insights.map((insight) => (
            <Link key={insight.id} href="/knowledge-hub" className="post-card client-hover-card" style={{ position: 'relative', background: '#25050f', borderTop: '4px solid #8c1639', borderLeft: '1.5px solid rgba(139,21,56,0.15)', borderRight: '1.5px solid rgba(139,21,56,0.15)', borderBottom: '1.5px solid rgba(139,21,56,0.15)', borderRadius: 'var(--r-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', height: '420px', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '260px', overflow: 'hidden', zIndex: 1 }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('${insight.image}')`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.5s' }} className="card-bg"></div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 65%, #25050f 100%)' }}></div>
              </div>
              <span style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '10px', fontWeight: 700, color: '#8B1538', background: 'rgba(255,255,255,0.95)', padding: '4px 12px', borderRadius: '100px', zIndex: 5, border: '1px solid rgba(139,21,56,0.15)' }}>
                {insight.category}
              </span>
              <div style={{ marginTop: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 2 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', lineHeight: 1.35, margin: 0 }} className="card-title">
                  {insight.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.55, margin: 0 }}>
                  {insight.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* We add a small inline style block for hovers since React doesn't support inline onMouseOver on Server Components nicely */}
      <style dangerouslySetInnerHTML={{__html: `
        .client-hover-btn:hover { background: #8B1538 !important; color: #ffffff !important; }
        .client-hover-card:hover { transform: translateY(-6px) !important; box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important; border-color: rgba(140,22,57,0.35) !important; }
        .client-hover-card:hover .card-bg { transform: scale(1.05); }
        .client-hover-card:hover .card-title { color: #ffb7c5 !important; }
      `}} />
    </section>
  )
}

