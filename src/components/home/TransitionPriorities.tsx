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
    bgImage: '/images/hero-bg.jpg'
  },
  {
    id: 'energy',
    tag: '02',
    titleEn: 'Energy Advisory',
    titleAr: 'استشارات الطاقة',
    descEn: 'Feasibility studies for solar, wind, and grids, alongside energy audits and transition strategies.',
    link: '/services#energy',
    bgImage: '/images/solar.jpg'
  },
  {
    id: 'environment',
    tag: '03',
    titleEn: 'Environment & ESG',
    titleAr: 'البيئة والحوكمة (ESG)',
    descEn: 'Integrating ESG principles into operations, gap assessments, and environmental impact assessments.',
    link: '/services#environment',
    bgImage: '/images/port.jpg'
  },
  {
    id: 'business',
    tag: '04',
    titleEn: 'Business Solutions',
    titleAr: 'حلول الأعمال',
    descEn: 'Elevating projects with robust business planning, green scoring, and long-term viability analysis.',
    link: '/services#business',
    bgImage: '/images/gas-energy.jpg'
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
    <section id="transition-priorities" className="p-0 m-0 relative">
      {/* Full-bleed crossfade stage */}
      <div 
        className="w-full relative flex items-end h-[620px] m-0 overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        
        {/* Background layers */}
        {pillars.map((pillar, idx) => (
          <div 
            key={pillar.id}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out z-0 ${idx === activeIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${pillar.bgImage})` }}
          />
        ))}

        {/* Unified dark gradient overlay */}
        <div 
          className="absolute inset-0 z-[1]"
          style={{ background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.8) 100%)' }}
        />

        {/* Header Overlaid inside the stage */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[3] w-full pointer-events-none px-6">
          <div className="w-full max-w-[800px] mx-auto text-left flex flex-col gap-3">
            <h2 className="text-white text-[clamp(24px,3.5vw,38px)] font-light leading-[1.2] tracking-[-0.02em] m-0 uppercase">
              <span className="font-extrabold">Action</span> Pillars
              <span className="block text-white/70 text-[20px] font-bold mt-1">أولوياتنا الانتقالية</span>
            </h2>
            <p className="text-[15.5px] text-white/80 leading-[1.6] m-0 font-light">
              <span className="block mb-1">Explore our core domains of expertise guiding governments and corporations through climate, energy, and ESG transitions.</span>
              <span className="block text-white/65">اكتشف مجالات خبرتنا الأساسية التي توجه الحكومات والشركات خلال انتقالات المناخ والطاقة والحوكمة البيئية والاجتماعية والمؤسسية.</span>
            </p>
          </div>
        </div>

        {/* Columns Grid */}
        <div className="w-full relative z-[2] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto h-[400px]">
          {pillars.map((pillar, idx) => {
            const isActive = idx === activeIndex
            return (
              <Link
                key={pillar.id}
                href={pillar.link}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`relative flex items-end no-underline p-8 md:p-10 transition-all duration-500 border-t border-t-white/10 lg:border-t-0 lg:border-l lg:border-l-white/10 ${isActive ? 'bg-[linear-gradient(to_top,rgba(139,21,56,0.9),rgba(139,21,56,0.3))]' : 'hover:bg-white/5'}`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute top-0 left-0 w-full lg:w-auto lg:h-full lg:left-0 lg:top-0 h-1 lg:w-1 bg-[#8B1538] shadow-[0_0_15px_#8B1538]" />
                )}

                <div className="flex flex-col gap-4 w-full relative z-10 transition-transform duration-500">
                  <div className={`text-[12px] font-extrabold font-mono tracking-widest ${isActive ? 'text-[#ffb7c5]' : 'text-white/50'}`}>
                    {pillar.tag}
                  </div>
                  
                  <h3 className="text-white text-[22px] font-bold leading-[1.2] m-0">
                    <span className="block">{pillar.titleEn}</span>
                    <span className={`block text-[14px] mt-1 transition-colors ${isActive ? 'text-white/80' : 'text-white/40'}`}>
                      {pillar.titleAr}
                    </span>
                  </h3>

                  {/* Description (visible on active) */}
                  <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${isActive ? 'max-h-[120px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                    <p className="text-[14px] text-white/80 leading-[1.6] m-0 font-light border-l-[1.5px] border-[#ffb7c5] pl-3">
                      {pillar.descEn}
                    </p>
                  </div>

                  <div className={`text-[12px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors mt-2 ${isActive ? 'text-white' : 'text-white/40'}`}>
                    Discover
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
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
