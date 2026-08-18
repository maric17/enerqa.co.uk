import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HomePage from './page'

// Mock child components to keep the unit test isolated
vi.mock('@/components/home/Hero', () => ({ Hero: () => <div data-testid="hero" /> }))
vi.mock('@/components/home/InsightsTeaser', () => ({ InsightsTeaser: () => <div data-testid="insights-teaser" /> }))
vi.mock('@/components/home/KnowledgeTeaser', () => ({ KnowledgeTeaser: () => <div data-testid="knowledge-teaser" /> }))
vi.mock('@/components/home/SustainabilityData', () => ({ SustainabilityData: () => <div data-testid="sustainability-data" /> }))
vi.mock('@/components/home/TransitionPriorities', () => ({ TransitionPriorities: () => <div data-testid="transition-priorities" /> }))
vi.mock('@/components/home/Tools', () => ({ Tools: () => <div data-testid="tools" /> }))
vi.mock('@/components/home/AboutEnerqa', () => ({ AboutEnerqa: () => <div data-testid="about-enerqa" /> }))
vi.mock('@/components/home/ImpactStats', () => ({ ImpactStats: () => <div data-testid="impact-stats" /> }))
vi.mock('@/components/home/GlobalNetwork', () => ({ GlobalNetwork: () => <div data-testid="global-network" /> }))
vi.mock('@/components/shared/ContactCTA', () => ({ ContactCTA: () => <div data-testid="contact-cta" /> }))
vi.mock('@/components/layout/Footer', () => ({ Footer: () => <div data-testid="footer" /> }))

describe('HomePage', () => {
  it('should render all main homepage sections', () => {
    render(<HomePage />)
    
    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByTestId('insights-teaser')).toBeInTheDocument()
    expect(screen.getByTestId('knowledge-teaser')).toBeInTheDocument()
    expect(screen.getByTestId('sustainability-data')).toBeInTheDocument()
    expect(screen.getByTestId('transition-priorities')).toBeInTheDocument()
    expect(screen.getByTestId('tools')).toBeInTheDocument()
    expect(screen.getByTestId('about-enerqa')).toBeInTheDocument()
    expect(screen.getByTestId('impact-stats')).toBeInTheDocument()
    expect(screen.getByTestId('global-network')).toBeInTheDocument()
    expect(screen.getByTestId('contact-cta')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })
})
