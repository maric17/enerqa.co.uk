import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HomePage from './page'

// Mock child components to keep the unit test isolated.
// This list must match the sections actually rendered by page.tsx - mocking a
// module that no longer exists makes vitest fail at collection time.
// H03/H04 (FirstFoldFeeds) are a sibling band directly below the hero, not
// children of it, so the hero mock takes no children.
vi.mock('@/components/home/Hero', () => ({ Hero: () => <div data-testid="hero" /> }))
vi.mock('@/components/home/KnowledgeTeaser', () => ({ KnowledgeTeaser: () => <div data-testid="knowledge-teaser" /> }))
vi.mock('@/components/home/FirstFoldFeeds', () => ({ FirstFoldFeeds: () => <div data-testid="first-fold-feeds" /> }))
vi.mock('@/components/home/LifecycleAndIndustries', () => ({ LifecycleAndIndustries: () => <div data-testid="lifecycle-industries" /> }))
vi.mock('@/components/home/DataPortalTeaser', () => ({ DataPortalTeaser: () => <div data-testid="data-portal-teaser" /> }))
vi.mock('@/components/home/TransitionPriorities', () => ({ TransitionPriorities: () => <div data-testid="transition-priorities" /> }))
vi.mock('@/components/home/Tools', () => ({ Tools: () => <div data-testid="tools" /> }))
vi.mock('@/components/home/AboutEnerqa', () => ({ AboutEnerqa: () => <div data-testid="about-enerqa" /> }))
vi.mock('@/components/shared/ContactCTA', () => ({ ContactCTA: () => <div data-testid="contact-cta" /> }))
// The page asks the CMS whether the Privacy Notice is published; no database here.
vi.mock('@/lib/policies', () => ({ getPrivacyHref: async () => undefined }))

describe('HomePage', () => {
  it('should render all main homepage sections', async () => {
    render(await HomePage())

    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByTestId('knowledge-teaser')).toBeInTheDocument()
    expect(screen.getByTestId('first-fold-feeds')).toBeInTheDocument()
    expect(screen.getByTestId('lifecycle-industries')).toBeInTheDocument()
    expect(screen.getByTestId('data-portal-teaser')).toBeInTheDocument()
    expect(screen.getByTestId('transition-priorities')).toBeInTheDocument()
    expect(screen.getByTestId('tools')).toBeInTheDocument()
    expect(screen.getByTestId('about-enerqa')).toBeInTheDocument()
    expect(screen.getByTestId('contact-cta')).toBeInTheDocument()
  })

  // pp. 13-15 list the segments H01-H13 in this order; H03/H04 must follow the
  // hero directly so they stay in the first fold (p. 15, p. 229).
  it('renders the segments in the spec order', async () => {
    const { container } = render(await HomePage())
    const order = [...container.querySelectorAll('[data-testid]')].map((el) => el.getAttribute('data-testid'))
    expect(order).toEqual([
      'hero', // H01 + H02
      'first-fold-feeds', // H03 + H04
      'transition-priorities', // H05
      'lifecycle-industries', // H06 + H07
      'knowledge-teaser', // H08
      'data-portal-teaser', // H09
      'tools', // H10
      'about-enerqa', // H11
      'contact-cta', // H12 + H13
    ])
  })

  // Handoff p. 229: "No Projects, Experience, Case Studies, history counters or
  // project-client galleries appear anywhere."
  it('should not render retired experience or project sections', async () => {
    render(await HomePage())

    expect(screen.queryByTestId('impact-stats')).not.toBeInTheDocument()
    expect(screen.queryByTestId('global-network')).not.toBeInTheDocument()
    expect(screen.queryByTestId('insights-teaser')).not.toBeInTheDocument()
  })
})
