"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '../ui/Container'

/**
 * H01 + H02 - the first-fold hero (handoff pp. 9-13).
 *
 * Changes from the previous version, per p. 225 ("replace the full-height
 * rotating hero with the compact first-fold search/news/markets composition"):
 *  - No longer 100vh. The section sizes to its content so the news and markets
 *    panel below it is meaningfully visible without scrolling at 1366x768.
 *  - The rotating TypeAnimation headline is gone. H01 is now the approved
 *    heading, and the approved narrative sits under it.
 *  - The suggestion chips submit the search instead of navigating away, which
 *    is what "suggested chips" means for an AI search input (p. 13).
 *
 * The video backdrop, glass search pill and chip styling are deliberately kept
 * so the page still looks like itself.
 */

// Exactly the three chips specified on p. 13.
const SUGGESTED_QUERIES = [
  'How can a climate project attract finance?',
  'Explore renewable-energy feasibility',
  'What does ESG readiness involve?',
]

export const Hero = ({ children }: { children?: React.ReactNode }) => {
  const [query, setQuery] = useState('')
  // H02 requires a visible loading state on submit.
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

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
    <section className="hero-insights hero-compact">
      <div className="hero-insights-bg"></div>
      <video autoPlay loop muted playsInline className="hero-insights-video">
        <source src="/videos/video-banner.mp4" type="video/mp4" />
      </video>
      <div className="hero-insights-overlay"></div>

      <Container className="relative z-10 flex w-full grow flex-col items-center justify-center gap-5 py-4 text-center">
        <div className="flex max-w-[820px] flex-col items-center">
          {/* H01 - the approved page heading, now the actual h1 */}
          <h1 className="m-0 mb-3 text-[clamp(28px,3.6vw,44px)] font-extrabold leading-[1.12] tracking-[-0.03em] text-white">
            Project Development for a Sustainable Future
          </h1>
          <p className="mx-auto mb-1 max-w-[62ch] text-[clamp(14px,1.5vw,17px)] font-light leading-[1.45] text-white/90">
            From an initial idea to feasibility, finance and implementation, Enerqa develops projects across climate action, energy transition, environment, nature, circularity, ESG and sustainable finance.
          </p>

          {/* H02 Ask Explore Discover */}
          <div className="relative z-20 mx-auto mt-4 w-full max-w-[680px]">
            <h2 className="sr-only">Ask Explore Discover</h2>
            <form onSubmit={handleSearch} className="hero-search-wrapper flex w-full items-center">
              <svg className="mr-3 h-5 w-5 shrink-0 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                type="text"
                className="hero-search-input flex-1"
                placeholder="Ask a question or explore a topic."
                aria-label="Ask a question or explore a topic"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSubmitting}
              />
              <button type="submit" className="hero-search-btn" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Searching…' : 'Ask'}</span>
              </button>
            </form>

            {/* Suggested chips - submitting them runs the search (p. 13) */}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUERIES.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => runSearch(suggestion)}
                  disabled={isSubmitting}
                  className="search-tag-link rounded border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white transition-all duration-200 disabled:opacity-50"
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

        {/* H03 + H04 render here so search, news and markets share the fold */}
        {children}
      </Container>
    </section>
  )
}
