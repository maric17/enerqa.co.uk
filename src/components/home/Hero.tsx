"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '../ui/Container'

const SUGGESTED_QUERIES = [
  'How can a climate project attract finance?',
  'Explore renewable-energy feasibility',
  'What does ESG readiness involve?',
]

/** Search stays available immediately while the saved news streams behind it. */
export const Hero = ({ children }: { children?: React.ReactNode }) => {
  const [query, setQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const runSearch = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || isSubmitting) return
    setIsSubmitting(true)
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <section className="home-hero" aria-label="Enerqa project development and latest insights">
      <Container className="home-hero-search-layer">
        <div className="home-hero-search">
          <h1>Project Development for a Sustainable Future</h1>
          {/* Explain Enerqa's scope directly below the title, before the search. */}
          <p className="home-hero-description">
            From an initial idea to feasibility, finance and implementation, Enerqa develops projects across climate action, energy transition, environment, nature, circularity, ESG and sustainable finance.
          </p>
          <form onSubmit={event => { event.preventDefault(); runSearch(query) }} role="search" aria-label="Explore Enerqa">
            <label htmlFor="home-hero-query" className="sr-only">Ask a question or explore a topic</label>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input id="home-hero-query" type="text" placeholder="Ask a question or explore a topic."
              value={query} onChange={event => setQuery(event.target.value)} disabled={isSubmitting} />
            <button type="submit" disabled={isSubmitting || !query.trim()}>{isSubmitting ? 'Searching…' : 'Ask'}</button>
          </form>
          <div className="home-hero-suggestions">
            {SUGGESTED_QUERIES.map(suggestion => (
              <button key={suggestion} type="button" onClick={() => runSearch(suggestion)} disabled={isSubmitting}>{suggestion}</button>
            ))}
          </div>
          <p aria-live="polite" className="sr-only">{isSubmitting ? 'Searching, please wait.' : ''}</p>
        </div>
      </Container>
      {children}
    </section>
  )
}
