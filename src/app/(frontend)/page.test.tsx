import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HomePage from './page'

// Mock child components to keep the unit test isolated.
// This list must match the sections actually rendered by page.tsx - mocking a
// module that no longer exists makes vitest fail at collection time.
// Hero must render its children: the homepage passes <FirstFoldFeeds /> into it
// so that search, news and markets share the first viewport. A mock that drops
// children would silently hide H03 and H04 from this test.
vi.mock('@/components/home/Hero', () => ({
  Hero: ({ children }: { children?: React.ReactNode }) => <div data-testid="hero">{children}</div>,
}))
vi.mock('@/components/home/KnowledgeTeaser', () => ({ KnowledgeTeaser: () => <div data-testid="knowledge-teaser" /> }))
vi.mock('@/components/home/FirstFoldFeeds', () => ({ FirstFoldFeeds: () => <div data-testid="first-fold-feeds" /> }))
vi.mock('@/components/home/LifecycleAndIndustries', () => ({ LifecycleAndIndustries: () => <div data-testid="lifecycle-industries" /> }))
vi.mock('@/components/home/DataPortalTeaser', () => ({ DataPortalTeaser: () => <div data-testid="data-portal-teaser" /> }))
vi.mock('@/components/home/TransitionPriorities', () => ({ TransitionPriorities: () => <div data-testid="transition-priorities" /> }))
vi.mock('@/components/home/Tools', () => ({ Tools: () => <div data-testid="tools" /> }))
vi.mock('@/components/home/AboutEnerqa', () => ({ AboutEnerqa: () => <div data-testid="about-enerqa" /> }))
vi.mock('@/components/shared/ContactCTA', () => ({ ContactCTA: () => <div data-testid="contact-cta" /> }))

describe('HomePage', () => {
  it('should render all main homepage sections', () => {
    render(<HomePage />)

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

  // Handoff p. 229: "No Projects, Experience, Case Studies, history counters or
  // project-client galleries appear anywhere."
  it('should not render retired experience or project sections', () => {
    render(<HomePage />)

    expect(screen.queryByTestId('impact-stats')).not.toBeInTheDocument()
    expect(screen.queryByTestId('global-network')).not.toBeInTheDocument()
    expect(screen.queryByTestId('insights-teaser')).not.toBeInTheDocument()
  })
})
