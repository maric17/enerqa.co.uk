import React from 'react'
import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Stand-in for Lenis: records construction and teardown only.
const lenisInstances: { destroy: ReturnType<typeof vi.fn> }[] = []
vi.mock('lenis', () => ({
  default: vi.fn().mockImplementation(function (this: unknown) {
    const instance = { raf: vi.fn(), destroy: vi.fn() }
    lenisInstances.push(instance)
    return instance
  }),
}))

import Lenis from 'lenis'
import { SmoothScroll } from './SmoothScroll'

// A controllable prefers-reduced-motion media query.
function mockReducedMotion(initial: boolean) {
  let listener: (() => void) | null = null
  const query = {
    matches: initial,
    addEventListener: (_: string, fn: () => void) => { listener = fn },
    removeEventListener: vi.fn(),
  }
  window.matchMedia = vi.fn().mockReturnValue(query) as unknown as typeof window.matchMedia
  return {
    set(value: boolean) {
      query.matches = value
      act(() => listener?.())
    },
  }
}

beforeEach(() => {
  lenisInstances.length = 0
  vi.mocked(Lenis).mockClear()
})

describe('SmoothScroll (p. 228 reduced motion)', () => {
  it('runs Lenis when the visitor has not asked for reduced motion', () => {
    mockReducedMotion(false)
    render(<SmoothScroll><p>page</p></SmoothScroll>)
    expect(Lenis).toHaveBeenCalledTimes(1)
  })

  it('never starts Lenis under prefers-reduced-motion: reduce', () => {
    mockReducedMotion(true)
    const { getByText } = render(<SmoothScroll><p>page</p></SmoothScroll>)
    expect(Lenis).not.toHaveBeenCalled()
    expect(getByText('page')).toBeInTheDocument()
  })

  it('stops Lenis if the setting is turned on mid-visit', () => {
    const motion = mockReducedMotion(false)
    render(<SmoothScroll><p>page</p></SmoothScroll>)
    motion.set(true)
    expect(lenisInstances[0].destroy).toHaveBeenCalled()
  })
})
