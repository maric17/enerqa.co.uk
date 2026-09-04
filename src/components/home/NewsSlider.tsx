"use client"

import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
}

export const NewsSlider = ({ newsItems }: { newsItems: NewsArticle[] }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      // Scroll by roughly one card width
      const scrollAmount = direction === 'left' ? -420 : 420
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Header Row with Title and Slide Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ maxWidth: '600px', textAlign: 'left' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 300, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' }}>
            <span style={{ fontWeight: 800 }}>Latest</span> Updates
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Sliding Navigation Arrows */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => scroll('left')} className="news-slider-arrow-btn" style={{ border: '1.5px solid rgba(15,23,42,0.2)', background: 'transparent', color: '#0f172a', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              <svg style={{ width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button onClick={() => scroll('right')} className="news-slider-arrow-btn" style={{ border: '1.5px solid rgba(15,23,42,0.2)', background: 'transparent', color: '#0f172a', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              <svg style={{ width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Slider Wrapper */}
      <div id="news-slider" ref={scrollContainerRef} style={{ display: 'flex', gap: '56px', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', paddingBottom: '24px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {newsItems.map((news, idx) => (
          <div key={idx} className="news-slide" style={{ flex: '0 0 calc(50% - 28px)', minWidth: '540px', scrollSnapAlign: 'start', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            {/* Cover image (Left) */}
            {news.urlToImage && (
              <div className="news-cover" style={{ width: '220px', height: '290px', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 16px 36px rgba(0,0,0,0.08), 0 4px 14px rgba(0,0,0,0.04)', position: 'relative', flexShrink: 0 }}>
                <img 
                  src={news.urlToImage} 
                  alt={news.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            
            {/* Content (Right) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left', paddingTop: '6px' }}>
              <div style={{ fontSize: '12px', color: 'rgba(15,23,42,0.6)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '12px' }}>
                 {new Date(news.publishedAt || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <h4 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                {news.title}
              </h4>
              <div style={{ borderBottom: '1px solid rgba(15,23,42,0.1)', marginBottom: '16px', width: '100%' }}></div>
              {news.description && (
                <p style={{ fontSize: '14.5px', color: 'rgba(15,23,42,0.7)', lineHeight: 1.6, margin: '0 0 20px', fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {news.description}
                </p>
              )}
              <a href={news.url} target="_blank" rel="noopener noreferrer" className="news-read-btn" style={{ fontSize: '13px', fontWeight: 700, color: '#059669', textDecoration: 'none', borderBottom: '1.5px solid #059669', paddingBottom: '2px', width: 'fit-content', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}>
                Read Full Article
              </a>
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .news-slider-arrow-btn:hover { border-color: #0f172a !important; background: #0f172a !important; color: #ffffff !important; }
        .news-read-btn:hover { color: #0f172a !important; border-bottom-color: #0f172a !important; }
        #news-slider::-webkit-scrollbar { display: none; }
        @media (max-width: 1100px) { .news-slide { flex: 0 0 100% !important; min-width: 100% !important; } }
        @media (max-width: 580px) { .news-slide { flex-direction: column !important; gap: 20px !important; } .news-cover { width: 100% !important; height: 240px !important; } }
      `}} />
    </>
  )
}
