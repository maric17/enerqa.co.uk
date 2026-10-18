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
 *    band below it is meaningfully visible without scrolling at 1366x768
 *    (the CSS is `.hero-insights.hero-feedback`).
 *  - The rotating TypeAnimation headline is gone. H01 is now the approved
 *    heading, and the approved narrative sits under it.
 *  - The suggestion chips submit the search instead of navigating away, which
 *    is what "suggested chips" means for an AI search input (p. 13).
 *  - The search sits directly under the headline, with its own accessible label.
 *
 * October feedback confines news imagery to the news slideshow. The shared
 * hero surface stays static, while the feed still streams below the search.
 */

// Exactly the three chips specified on p. 13.
const SUGGESTED_QUERIES = [
  'How can a climate project attract finance?',
  'Explore renewable-energy feasibility',
  'What does ESG readiness involve?',
]

export const Hero = ({ children }: { children?: React.ReactNode }) => {
  return <HeroContent>{children}</HeroContent>
}

function HeroContent({ children }: { children?: React.ReactNode }) {
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
    <section className="hero-insights hero-feedback">

      {/* Stacked and centered content */}
      <Container className="relative z-10 w-full">
        <div className="mx-auto flex w-full flex-col items-center justify-center gap-y-3 text-center">
          <div className="flex flex-col items-center">
            {/* Keep the headline on one line on desktop and readable on smaller screens. */}
            <h1 className="hero-title m-0 text-white">
              Project Development for a Sustainable Future
            </h1>
            <p className="m-0 mt-2 max-w-[110ch] text-[14px] leading-relaxed text-white/85">
              From an initial idea to feasibility, finance and implementation, Enerqa develops projects across climate action, energy transition, environment, nature, circularity, ESG and sustainable finance.
            </p>
          </div>

          {/* The input's label keeps search accessible without the extra heading and copy. */}
          <div className="relative z-20 flex w-full flex-col items-center">
            <form onSubmit={handleSearch} role="search" className="mx-auto flex w-full max-w-2xl items-center bg-white/5 border border-white/15 backdrop-blur-md rounded-full p-1.5 transition-all shadow-xl hover:bg-white/10 focus-within:bg-white/10 focus-within:border-teal-400/50">
              <svg className="ml-3 mr-3 h-5 w-5 shrink-0 text-white/50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                type="text"
                className="min-w-0 flex-1 bg-transparent border-none text-white text-base outline-none placeholder:text-white/40"
                placeholder="Ask a question or explore a topic."
                aria-label="Ask a question or explore a topic"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSubmitting}
              />
              <button type="submit" className="bg-teal-400 text-teal-950 border-none px-6 py-2 rounded-full font-semibold text-base cursor-pointer hover:bg-teal-500 transition-colors disabled:opacity-50" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Searching…' : 'Ask'}</span>
              </button>
            </form>

            {/* Suggested chips - submitting them runs the search (p. 13) */}
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {SUGGESTED_QUERIES.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => runSearch(suggestion)}
                  disabled={isSubmitting}
                  className="bg-white/5 border border-white/10 text-white/70 px-3 py-1.5 rounded-full text-[12px] cursor-pointer backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white disabled:opacity-50"
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
      
      {/* News imagery stays inside the news slide. */}
      {children}
    </section>
  )
}
