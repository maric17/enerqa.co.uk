"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '../ui/Container'

/**
 * H01 + H02 - the first-fold hero (handoff pp. 9-13).
 *
 * Changes from the previous version, per p. 225 ("replace the full-height
 * rotating hero with the compact first-fold search/news/markets composition"):
 *  - No longer 100vh. The section sizes to its content so the news and markets
 *    band below it is meaningfully visible without scrolling at 1366x768
 *    (p. 15 first-fold test; the CSS is `.hero-insights.hero-compact`).
 *  - The rotating TypeAnimation headline is gone. H01 is now the approved
 *    heading, and the approved narrative sits under it.
 *  - The suggestion chips submit the search instead of navigating away, which
 *    is what "suggested chips" means for an AI search input (p. 13).
 *  - H02 has a visible heading and the p. 13 search guidance line.
 *
 * The glass search pill and chip styling are kept so the page still looks like
 * itself. The video backdrop is kept too, but no longer loads with the first
 * viewport (p. 228 "keep the first viewport lightweight"): the poster image
 * shows at once and the 2.6 MB video only starts after the page has loaded, on
 * wide screens, and never with reduced motion or Save-Data.
 *
 * H03 Global News and H04 Major Markets used to render inside this section as
 * children. They now have their own band below it (see FirstFoldFeeds), which
 * is why the hero only carries the heading, narrative, search and chips.
 */

// Exactly the three chips specified on p. 13.
const SUGGESTED_QUERIES = [
  'How can a climate project attract finance?',
  'Explore renewable-energy feasibility',
  'What does ESG readiness involve?',
]

export const Hero = () => {
  const [query, setQuery] = useState('')
  // H02 requires a visible loading state on submit.
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Deferred backdrop video. `preload="none"` and no `autoPlay` mean nothing is
  // fetched until this runs; it waits for the load event so the video never
  // competes with the hero, the search box or the news band for bandwidth.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    const wantsVideo =
      window.matchMedia('(min-width: 769px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !saveData
    if (!wantsVideo) return

    const start = () => {
      // play() can reject (autoplay policy); the poster simply stays.
      video.play().catch(() => {})
    }
    if (document.readyState === 'complete') {
      start()
      return
    }
    window.addEventListener('load', start, { once: true })
    return () => window.removeEventListener('load', start)
  }, [])

  const runSearch = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setIsSubmitting(true)
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    runSearch(query)
  }

  return (
    <section className="hero-insights">
      <div className="hero-insights-bg"></div>
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        preload="none"
        poster="/images/hero-bg.jpg"
        aria-hidden="true"
        tabIndex={-1}
        className="hero-insights-video"
      >
        <source src="/videos/video-banner.mp4" type="video/mp4" />
      </video>
      <div className="hero-insights-overlay"></div>

      {/* Stacked and centered content */}
      <Container className="relative z-10 w-full">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-y-10 text-center">
          <div className="flex flex-col items-center">
            {/* H01 - the approved page heading, balanced over two lines. */}
            <h1 className="hero-title m-0 text-white">
              Project Development for a Sustainable Future
            </h1>
            <p className="m-0 mt-4 max-w-[56ch] text-[clamp(15px,1.15vw,17px)] leading-[1.6] text-white/85">
              From an initial idea to feasibility, finance and implementation, Enerqa develops projects across climate action, energy transition, environment, nature, circularity, ESG and sustainable finance.
            </p>
          </div>

          {/* H02 Ask Explore Discover */}
          <div className="relative z-20 flex w-full flex-col items-center">
            <h2 className="m-0 text-[17px] font-semibold leading-tight text-white">Ask Explore Discover</h2>
            {/* p. 13 search guidance, verbatim */}
            <p id="h02-guidance" className="mx-auto m-0 mb-4 mt-1 max-w-2xl text-[14px] leading-snug text-white/80">
              Ask about any topic. Where relevant, explore Enerqa’s capabilities, publications, data and tools alongside a source-led answer.
            </p>
            <form onSubmit={handleSearch} role="search" className="hero-search-wrapper mx-auto flex w-full max-w-2xl items-center">
              <svg className="mr-3 h-5 w-5 shrink-0 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                type="text"
                className="hero-search-input flex-1"
                placeholder="Ask a question or explore a topic."
                aria-label="Ask a question or explore a topic"
                aria-describedby="h02-guidance"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSubmitting}
              />
              <button type="submit" className="hero-search-btn" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Searching…' : 'Ask'}</span>
              </button>
            </form>

            {/* Suggested chips - submitting them runs the search (p. 13) */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUERIES.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => runSearch(suggestion)}
                  disabled={isSubmitting}
                  className="hero-chip disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            {/* Loading state announced to assistive tech as well as shown */}
            <p aria-live="polite" className="sr-only">
              {isSubmitting ? 'Searching, please wait.' : ''}
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
