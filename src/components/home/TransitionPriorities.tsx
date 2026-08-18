'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const pillars = [
  {
    id: 'climate',
    tag: '01',
    titleEn: 'Climate Change',
    titleAr: 'تغير المناخ',
    descEn: 'Supporting governments and institutions with GHG inventories, NDC tracking, and climate finance modeling.',
    link: '/services#climate',
    bgImage: '/assets/images/hero-bg.jpg'
  },
  {
    id: 'energy',
    tag: '02',
    titleEn: 'Energy Advisory',
    titleAr: 'استشارات الطاقة',
    descEn: 'Feasibility studies for solar, wind, and grids, alongside energy audits and transition strategies.',
    link: '/services#energy',
    bgImage: '/assets/images/solar.jpg'
  },
  {
    id: 'environment',
    tag: '03',
    titleEn: 'Environment & ESG',
    titleAr: 'البيئة والحوكمة (ESG)',
    descEn: 'Integrating ESG principles into operations, gap assessments, and environmental impact assessments.',
    link: '/services#environment',
    bgImage: '/assets/images/port.jpg'
  },
  {
    id: 'business',
    tag: '04',
    titleEn: 'Business Solutions',
    titleAr: 'حلول الأعمال',
    descEn: 'Elevating projects with robust business planning, green scoring, and long-term viability analysis.',
    link: '/services#business',
    bgImage: '/assets/images/gas-energy.jpg'
  }
]

export const TransitionPriorities = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isHovering) {
      timerRef.current = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % pillars.length)
      }, 4000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isHovering])

  return (
    <section className="band agenda-section" id="transition-priorities" style={{ padding: '0 !important' }}>
      {/* Full-bleed crossfade stage */}
      <div 
        className="agenda-stage" 
        style={{ marginTop: 0, height: '620px' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        
        {/* Background layers — one per pillar, crossfade between them */}
        {pillars.map((pillar, idx) => (
          <div 
            key={pillar.id}
            className={`agenda-bg ${idx === activeIndex ? 'active' : ''}`}
            data-bg={idx}
            style={{ backgroundImage: `url('${pillar.bgImage}')` }}
          />
        ))}

        {/* Unified dark gradient overlay */}
        <div className="agenda-stage-overlay" style={{ background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.8) 100%)' }}></div>

        {/* Header Overlaid inside the stage */}
        <div className="wrap" style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 3, width: '100%', pointerEvents: 'none' }}>
          <div className="agenda-header" style={{ position: 'static', marginBottom: 0, maxWidth: '800px', textAlign: 'left' }}>
            <h2 className="agenda-title" style={{ marginBottom: '12px', color: '#ffffff !important' }}>
              <span className="en"><span style={{ fontWeight: 700 }}>Action</span> Pillars</span>
              <span className="ar" style={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>أولوياتنا الانتقالية</span>
            </h2>
            <p style={{ fontSize: '15.5px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
              <span className="en" style={{ display: 'block', marginBottom: '4px' }}>Explore our core domains of expertise guiding governments and corporations through climate, energy, and ESG transitions.</span>
              <span className="ar" style={{ color: 'rgba(255,255,255,0.65)', display: 'block' }}>اكتشف مجالات خبرتنا الأساسية التي توجه الحكومات والشركات خلال انتقالات المناخ والطاقة والحوكمة البيئية والاجتماعية والمؤسسية.</span>
            </p>
          </div>
        </div>

        {/* Columns — transparent, sit on top of the shared background */}
        <div className="agenda-grid">
          {pillars.map((pillar, idx) => {
            const isActive = idx === activeIndex
            return (
              <Link
                key={pillar.id}
                href={pillar.link}
                className={`agenda-col ${isActive ? 'active' : ''}`}
                data-index={idx}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <div className="agenda-col-content">
                  <div className="agenda-col-meta">
                    <span className="agenda-col-tag">{pillar.tag}</span>
                  </div>
                  <h3 className="agenda-col-title">
                    <span className="en">{pillar.titleEn}</span>
                    <span className="ar">{pillar.titleAr}</span>
                  </h3>
                  <p className="agenda-col-desc">
                    <span className="en">{pillar.descEn}</span>
                  </p>
                  <div className="agenda-discover">
                    <span className="en">Discover</span>
                    <svg style={{ width: '14px', height: '14px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
