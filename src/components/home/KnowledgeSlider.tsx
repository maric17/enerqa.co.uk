'use client'

import React, { useRef } from 'react'

interface Publication {
  id: string | number;
  type: string;
  typeColor: string;
  title: string;
  date: string;
  bgGradient: string;
  heading: string;
  excerpt: string;
  file: string;
}

export const KnowledgeSlider = ({ publications }: { publications: Publication[] }) => {
  const sliderRef = useRef<HTMLDivElement>(null)

  const scrollPublications = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return
    const scrollAmount = sliderRef.current.clientWidth * 0.8
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <>
      {/* Header Row with Title and Button / Slide Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ maxWidth: '600px', textAlign: 'left' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 300, color: '#ffffff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' }}>
            <span style={{ fontWeight: 800 }}>Research</span> &amp; Publications
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Sliding Navigation Arrows */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => scrollPublications('left')} className="slider-arrow-btn" style={{ border: '1.5px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#ffffff', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              <svg style={{ width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button onClick={() => scrollPublications('right')} className="slider-arrow-btn" style={{ border: '1.5px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#ffffff', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              <svg style={{ width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <a href="/knowledge-hub" className="client-hover-btn" style={{ border: '1.5px solid #ffb7c5', color: '#ffb7c5', background: 'transparent', padding: '10px 24px', borderRadius: '100px', fontSize: '13px', textDecoration: 'none', fontWeight: 700, transition: 'all 0.2s', whiteSpace: 'nowrap', display: 'inline-block' }}>
            More Research &amp; Publications
          </a>
        </div>
      </div>

      {/* Slider Wrapper */}
      <div id="publications-slider" ref={sliderRef} style={{ display: 'flex', gap: '56px', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', paddingBottom: '24px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {publications.map((pub, idx) => (
          <div key={idx} className="publication-slide">
            {/* Cover image */}
            <div className="publication-cover" style={{ background: pub.bgGradient }}>
              <div style={{ fontSize: '10px', color: pub.typeColor, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>
                {pub.type}
              </div>
              <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: 800, lineHeight: 1.35, textShadow: '0 2px 4px rgba(0,0,0,0.35)' }}>
                {pub.title}
              </div>
              <div style={{ fontSize: '10px', color: pub.typeColor, opacity: 0.8, fontWeight: 600 }}>
                {pub.date}
              </div>
            </div>
            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left', paddingTop: '6px' }}>
              <h4 style={{ fontSize: '21px', fontWeight: 700, color: '#ffffff', lineHeight: 1.3, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                {pub.heading}
              </h4>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', marginBottom: '16px', width: '100%' }}></div>
              <p style={{ fontSize: '14.5px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, margin: '0 0 20px', fontWeight: 300 }}>
                {pub.excerpt}
              </p>
              {pub.file && (
                <a href={pub.file} download className="client-read-btn" style={{ fontSize: '13px', fontWeight: 700, color: '#ffb7c5', textDecoration: 'none', borderBottom: '1.5px solid #ffb7c5', paddingBottom: '2px', width: 'fit-content', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}>
                  Read Full Report
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .slider-arrow-btn:hover { border-color: #ffffff !important; background: #ffffff !important; color: #100407 !important; }
        .client-hover-btn:hover { background: #ffb7c5 !important; color: #100407 !important; border-color: #ffb7c5 !important; }
        .client-read-btn:hover { color: #ffffff !important; border-bottom-color: #ffffff !important; }
        #publications-slider::-webkit-scrollbar { display: none; }
        .publication-slide { flex: 0 0 calc(50% - 28px); min-width: 540px; scroll-snap-align: start; display: flex; gap: 32px; align-items: flex-start; }
        .publication-cover { width: 220px; height: 290px; border-radius: 6px; overflow: hidden; box-shadow: 0 16px 36px rgba(139, 21, 56, 0.18), 0 4px 14px rgba(0, 0, 0, 0.12); position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.08); flex-shrink: 0; }
        @media (max-width: 1100px) { .publication-slide { flex: 0 0 100% !important; min-width: 100% !important; } }
        @media (max-width: 580px) { .publication-slide { flex-direction: column !important; gap: 20px !important; } .publication-cover { width: 180px; height: 240px; } }
      `}} />
    </>
  )
}

