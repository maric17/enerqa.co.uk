'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { Typography } from '../ui/Typography'

export interface SliderPublication {
  id: string | number;
  slug: string;
  type: string;
  typeColor: string;
  title: string;
  /** Approved byline, or null when the record has none yet. */
  author: string | null;
  /** "December 2024". null when the record has no date. */
  date: string | null;
  /** false until an editor confirms the date against the original (p. 225). */
  dateVerified: boolean;
  bgGradient: string;
  /** Only a clean excerpt reaches here; junk from the PDF import is null. */
  excerpt: string | null;
  file: string | null;
}

export const KnowledgeSlider = ({ publications }: { publications: SliderPublication[] }) => {
  const sliderRef = useRef<HTMLUListElement>(null)

  const scrollPublications = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return
    const scrollAmount = sliderRef.current.clientWidth * 0.8
    // p. 228 reduced-motion support: jump instead of gliding when asked to.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: reduceMotion ? 'auto' : 'smooth'
    })
  }

  const arrowStyle: React.CSSProperties = { border: '1.5px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#ffffff', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }

  return (
    <>
      {/* Header row: heading, narrative and action on the left (p. 7), slide controls on the right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ maxWidth: '640px', textAlign: 'left' }}>
          <Typography variant="h2" id="h08-enerqa-publication" className="home-h2 mb-3 text-white">
            Enerqa Publication
          </Typography>
          {/* p. 14 H08 narrative, verbatim */}
          <p style={{ fontSize: '15.5px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: '0 0 20px', fontWeight: 300 }}>
            Research, analysis and practical perspectives on the systems, decisions and projects shaping a more sustainable future.
          </p>
          <Link href="/knowledge-hub" className="client-hover-btn" style={{ border: '1.5px solid #00cfc8', color: '#00cfc8', background: 'transparent', padding: '10px 24px', borderRadius: '100px', fontSize: '13px', textDecoration: 'none', fontWeight: 700, transition: 'all 0.2s', whiteSpace: 'nowrap', display: 'inline-block' }}>
            Explore Enerqa Publication
          </Link>
        </div>

        {publications.length > 1 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={() => scrollPublications('left')} aria-label="Previous publications" aria-controls="publications-slider" className="slider-arrow-btn" style={arrowStyle}>
              <svg aria-hidden="true" style={{ width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button type="button" onClick={() => scrollPublications('right')} aria-label="Next publications" aria-controls="publications-slider" className="slider-arrow-btn" style={arrowStyle}>
              <svg aria-hidden="true" style={{ width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* Slider */}
      <ul id="publications-slider" ref={sliderRef} style={{ display: 'flex', gap: '56px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '24px', msOverflowStyle: 'none', scrollbarWidth: 'none', listStyle: 'none', margin: 0, paddingLeft: 0 }}>
        {publications.map((pub) => (
          <li key={pub.id} className="publication-slide">
            {/* Decorative cover. Everything on it is repeated in the text beside
                it, so it is hidden from assistive tech to avoid reading it twice. */}
            <div className="publication-cover" style={{ background: pub.bgGradient }} aria-hidden="true">
              <div style={{ fontSize: '10px', color: pub.typeColor, fontWeight: 600 }}>
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
              {/* p. 229: owned publications must not be confused with external items. */}
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', fontWeight: 600, margin: '0 0 8px' }}>
                Enerqa Publication · {pub.type}
              </p>
              <h3 style={{ fontSize: '21px', fontWeight: 700, lineHeight: 1.3, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                <Link href={`/knowledge-hub/${pub.slug}`} className="publication-title-link" style={{ color: '#ffffff', textDecoration: 'none' }}>
                  {pub.title}
                </Link>
              </h3>
              {/* p. 14: real author and date. An unconfirmed date is labelled as such. */}
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: '0 0 16px' }}>
                {pub.author && <span>By {pub.author}</span>}
                {pub.author && pub.date && <span aria-hidden="true"> · </span>}
                {pub.date && (
                  <span>
                    {pub.date}
                    {!pub.dateVerified && ' (date unverified)'}
                  </span>
                )}
              </p>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', marginBottom: '16px', width: '100%' }}></div>
              {pub.excerpt && (
                <p style={{ fontSize: '14.5px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, margin: '0 0 20px', fontWeight: 300 }} className="line-clamp-4">
                  {pub.excerpt}
                </p>
              )}
              {pub.file && (
                <a href={pub.file} download className="client-read-btn" style={{ fontSize: '13px', fontWeight: 700, color: '#00cfc8', textDecoration: 'none', borderBottom: '1.5px solid #00cfc8', paddingBottom: '2px', width: 'fit-content', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}>
                  Download Full Report<span className="sr-only">: {pub.title}</span>
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      <style dangerouslySetInnerHTML={{__html: `
        .slider-arrow-btn:hover { border-color: #ffffff !important; background: #ffffff !important; color: #082C45 !important; }
        .client-hover-btn:hover { background: #00cfc8 !important; color: #082C45 !important; border-color: #00cfc8 !important; }
        .client-read-btn:hover { color: #ffffff !important; border-bottom-color: #ffffff !important; }
        .publication-title-link:hover { color: #00cfc8 !important; text-decoration: underline !important; }
        #publications-slider::-webkit-scrollbar { display: none; }
        .publication-slide { flex: 0 0 calc(50% - 28px); min-width: 540px; scroll-snap-align: start; display: flex; gap: 32px; align-items: flex-start; }
        .publication-cover { width: 220px; height: 290px; border-radius: 6px; overflow: hidden; box-shadow: 0 16px 36px rgba(139, 21, 56, 0.18), 0 4px 14px rgba(0, 0, 0, 0.12); position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.08); flex-shrink: 0; }
        @media (max-width: 1100px) { .publication-slide { flex: 0 0 100% !important; min-width: 100% !important; } }
        @media (max-width: 580px) { .publication-slide { flex-direction: column !important; gap: 20px !important; } .publication-cover { width: 180px; height: 240px; } }
      `}} />
    </>
  )
}
