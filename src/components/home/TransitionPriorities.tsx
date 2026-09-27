'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Typography } from '../ui/Typography'
import { Container } from '../ui/Container'

/**
 * H05 Explore Our Domains (handoff p. 14).
 *
 * Card descriptions are the opening sentence of each domain's approved
 * narrative (O02, pp. 19-20, also the domain page hero text in the CMS),
 * verbatim. p. 14 itself gives the cards a title and a link only.
 *
 * The highlighted card rotates. WCAG 2.2.2 (Pause, Stop, Hide) and p. 228
 * (reduced motion) therefore apply: there is a visible pause control, rotation
 * stops while the pointer is over the cards or keyboard focus is inside them,
 * and it never starts for visitors who ask for reduced motion.
 */
const pillars = [
  {
    id: 'climate',
    titleEn: 'Climate Action & Carbon Management',
    titleAr: 'العمل المناخي وإدارة الكربون',
    descEn: 'Climate change action becomes credible when commitments are translated into practical programmes, measurable results and investable projects.',
    link: '/domains/climate-action-carbon-management',
    bgImage: '/assets/images/hero-bg.jpg'
  },
  {
    id: 'energy',
    titleEn: 'Energy Systems & Transition',
    titleAr: 'أنظمة الطاقة والتحول',
    descEn: 'The energy transition is reshaping how energy is produced, managed, financed and consumed.',
    link: '/domains/energy-systems-transition',
    bgImage: '/assets/images/solar.jpg'
  },
  {
    id: 'environment',
    titleEn: 'Environment, Nature & Circularity',
    titleAr: 'البيئة والطبيعة والاقتصاد الدائري',
    descEn: 'Projects and operations depend on healthy environmental, social and natural systems.',
    link: '/domains/environment-nature-circularity',
    bgImage: '/assets/images/port.jpg'
  },
  {
    id: 'business',
    titleEn: 'Sustainable Business, ESG & Finance',
    titleAr: 'الأعمال المستدامة والحوكمة والتمويل',
    descEn: 'Sustainability creates lasting value when it influences strategy, governance, investment and daily operations.',
    link: '/domains/sustainable-business-esg-finance',
    bgImage: '/assets/images/gas-energy.jpg'
  }
]

export const TransitionPriorities = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [hasFocusInside, setHasFocusInside] = useState(false)
  // The visitor's own choice via the pause button. It wins over hover/focus.
  const [isPausedByUser, setIsPausedByUser] = useState(false)
  // Read after mount, so the server and first client render agree.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const isRotating = !isPausedByUser && !isHovering && !hasFocusInside && !prefersReducedMotion

  useEffect(() => {
    if (isRotating) {
      timerRef.current = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % pillars.length)
      }, 4000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRotating])

  return (
    <section className="p-0 m-0 w-full overflow-hidden" id="transition-priorities" aria-labelledby="h05-explore-domains">
      {/* Full-bleed crossfade stage */}
      <div 
        className="relative w-full h-auto min-h-[700px] md:min-h-[620px] flex items-center justify-center m-0" 
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        // Keyboard focus anywhere inside pauses rotation (WCAG 2.2.2).
        onFocus={() => setHasFocusInside(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHasFocusInside(false)
        }}
      >
        
        {/* Background layers — one per pillar, crossfade between them */}
        {pillars.map((pillar, idx) => (
          <div 
            key={pillar.id}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ease-in-out motion-reduce:transition-none z-0 ${idx === activeIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url('${pillar.bgImage}')` }}
          />
        ))}

        {/* Unified dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/80 z-10 pointer-events-none"></div>

        {/* Header Overlaid inside the stage */}
        <Container className="absolute top-10 md:top-12 left-1/2 -translate-x-1/2 w-full z-30 pointer-events-none">
          <div className="flex flex-col items-start gap-3 md:flex-row md:justify-between md:gap-6">
            <div className="max-w-[800px] text-left">
              <Typography variant="h2" id="h05-explore-domains" className="home-h2 text-white mb-3">
                <span className="en">Explore Our Domains</span>
                <span className="ar text-white/70 block mt-1">استكشف مجالاتنا</span>
              </Typography>
              {/* p. 14 H05 narrative, verbatim. The Arabic line that used to sit
                  here did not translate it, so it was removed; the English shows
                  in both languages until an approved translation exists (p. 227). */}
              <p className="text-[15.5px] text-white/80 leading-[1.6] m-0 font-light" lang="en">
                Four interconnected domains combine technical analysis, project development and investment thinking. Explore the work relevant to your priorities.
              </p>
            </div>
            {/* WCAG 2.2.2: a visible way to stop the rotation. Not needed (and
                not shown) when reduced motion means nothing rotates. The label
                itself says what the button will do next, so there is no
                aria-pressed as well (that would read "Resume rotation, pressed"). */}
            {!prefersReducedMotion && (
              <button
                type="button"
                onClick={() => setIsPausedByUser((paused) => !paused)}
                aria-controls="h05-domain-cards"
                className="pointer-events-auto mt-1 inline-flex shrink-0 items-center gap-2 rounded-full border border-white/30 bg-black/30 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-white/60 hover:bg-black/50"
              >
                {isPausedByUser ? (
                  <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                ) : (
                  <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                )}
                {isPausedByUser ? 'Resume rotation' : 'Pause rotation'}
              </button>
            )}
          </div>
        </Container>

        {/* Columns — transparent, sit on top of the shared background */}
        <div id="h05-domain-cards" className="absolute inset-0 top-[220px] md:top-[160px] z-20 flex flex-col md:flex-row w-full max-w-none md:max-w-[1400px] mx-auto h-[calc(100%-220px)] md:h-[calc(100%-160px)]">
          {pillars.map((pillar, idx) => {
            const isActive = idx === activeIndex
            return (
              <Link
                key={pillar.id}
                href={pillar.link}
                className={`flex-1 flex flex-col justify-end border-b md:border-b-0 md:border-r border-white/10 last:border-r-0 relative overflow-hidden transition-all duration-[600ms] ease-in-out motion-reduce:transition-none group no-underline cursor-pointer ${isActive ? 'bg-black/10 md:flex-[1.2]' : 'bg-transparent'}`}
                data-index={idx}
                onMouseEnter={() => setActiveIndex(idx)}
                // Keyboard users get the same highlight as pointer users.
                onFocus={() => setActiveIndex(idx)}
              >
                <div className={`p-6 md:p-10 transition-transform duration-[600ms] motion-reduce:transition-none ${isActive ? 'translate-y-0' : 'translate-y-0 md:translate-y-12'} flex flex-col gap-2 md:gap-4 relative z-10 w-full h-full md:h-auto justify-end`}>
                  <h3 className="text-lg md:text-2xl font-bold text-white m-0 leading-tight">
                    <span className="en block">{pillar.titleEn}</span>
                    <span className="ar block text-[0.8em] mt-1 text-white/90">{pillar.titleAr}</span>
                  </h3>
                  <p className={`text-[12px] md:text-[14px] text-white/70 font-light leading-[1.5] m-0 transition-opacity duration-[600ms] ${isActive ? 'opacity-100 max-h-[100px]' : 'opacity-100 md:opacity-0 max-h-[100px] md:max-h-0 overflow-hidden md:m-0'}`}>
                    <span className="en">{pillar.descEn}</span>
                  </p>
                  <div className={`hidden md:flex items-center gap-1.5 text-[14px] font-semibold mt-2 transition-all duration-[400ms] ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    <span className="en text-white group-hover:text-[#00cfc8] transition-colors">Discover</span>
                    <svg aria-hidden="true" className="w-3.5 h-3.5 text-white group-hover:text-[#00cfc8] transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
                
                {/* Active hover indicator strip */}
                <div className={`absolute bottom-0 left-0 w-full md:h-[4px] h-[2px] bg-[#0972b8] transition-transform duration-[600ms] origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`}></div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
