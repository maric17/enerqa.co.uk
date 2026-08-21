'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Typography } from '../ui/Typography'

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
    <section className="p-0 m-0 w-full overflow-hidden" id="transition-priorities">
      {/* Full-bleed crossfade stage */}
      <div 
        className="relative w-full h-auto min-h-[700px] md:min-h-[620px] flex items-center justify-center m-0" 
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        
        {/* Background layers — one per pillar, crossfade between them */}
        {pillars.map((pillar, idx) => (
          <div 
            key={pillar.id}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ease-in-out z-0 ${idx === activeIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url('${pillar.bgImage}')` }}
          />
        ))}

        {/* Unified dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/80 z-10 pointer-events-none"></div>

        {/* Header Overlaid inside the stage */}
        <div className="wrap absolute top-10 md:top-12 left-1/2 -translate-x-1/2 w-full z-30 pointer-events-none">
          <div className="max-w-[800px] text-left">
            <Typography variant="h2" className="text-white mb-3">
              <span className="en"><span className="font-bold">Action</span> Pillars</span>
              <span className="ar text-white/70 block mt-1">أولوياتنا الانتقالية</span>
            </Typography>
            <p className="text-[15.5px] text-white/80 leading-[1.6] m-0 font-light">
              <span className="en block mb-1">Explore our core domains of expertise guiding governments and corporations through climate, energy, and ESG transitions.</span>
              <span className="ar text-white/65 block">اكتشف مجالات خبرتنا الأساسية التي توجه الحكومات والشركات خلال انتقالات المناخ والطاقة والحوكمة البيئية والاجتماعية والمؤسسية.</span>
            </p>
          </div>
        </div>

        {/* Columns — transparent, sit on top of the shared background */}
        <div className="absolute inset-0 top-[220px] md:top-[160px] z-20 flex flex-col md:flex-row w-full max-w-none md:max-w-[1400px] mx-auto h-[calc(100%-220px)] md:h-[calc(100%-160px)]">
          {pillars.map((pillar, idx) => {
            const isActive = idx === activeIndex
            return (
              <Link
                key={pillar.id}
                href={pillar.link}
                className={`flex-1 flex flex-col justify-end border-b md:border-b-0 md:border-r border-white/10 last:border-r-0 relative overflow-hidden transition-all duration-[600ms] ease-in-out group no-underline cursor-pointer ${isActive ? 'bg-black/10 md:flex-[1.2]' : 'bg-transparent'}`}
                data-index={idx}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <div className={`p-6 md:p-10 transition-transform duration-[600ms] ${isActive ? 'translate-y-0' : 'translate-y-0 md:translate-y-12'} flex flex-col gap-2 md:gap-4 relative z-10 w-full h-full md:h-auto justify-end`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] md:text-xs font-bold text-white/50 tracking-[0.2em]">{pillar.tag}</span>
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold text-white m-0 leading-tight">
                    <span className="en block">{pillar.titleEn}</span>
                    <span className="ar block text-[0.8em] mt-1 text-white/90">{pillar.titleAr}</span>
                  </h3>
                  <p className={`text-[12px] md:text-[14px] text-white/70 font-light leading-[1.5] m-0 transition-opacity duration-[600ms] ${isActive ? 'opacity-100 max-h-[100px]' : 'opacity-100 md:opacity-0 max-h-[100px] md:max-h-0 overflow-hidden md:m-0'}`}>
                    <span className="en">{pillar.descEn}</span>
                  </p>
                  <div className={`hidden md:flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] mt-2 transition-all duration-[400ms] ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    <span className="en text-white group-hover:text-[#8B1538] transition-colors">Discover</span>
                    <svg className="w-3.5 h-3.5 text-white group-hover:text-[#8B1538] transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
                
                {/* Active hover indicator strip */}
                <div className={`absolute bottom-0 left-0 w-full md:h-[4px] h-[2px] bg-[#8B1538] transition-transform duration-[600ms] origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`}></div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
