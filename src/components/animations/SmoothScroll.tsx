'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

interface SmoothScrollProps {
  children: React.ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // p. 228: reduced-motion support. Lenis replaces native scrolling with an
    // eased animation, so it only runs when the visitor has not asked the OS
    // for less motion - and stops if they turn that setting on mid-visit.
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis: Lenis | null = null
    let frame = 0

    const start = () => {
      if (lenis) return
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      })
      const raf = (time: number) => {
        lenis?.raf(time)
        frame = requestAnimationFrame(raf)
      }
      frame = requestAnimationFrame(raf)
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      lenis?.destroy()
      lenis = null
    }

    const sync = () => (query.matches ? stop() : start())
    sync()
    query.addEventListener('change', sync)

    return () => {
      query.removeEventListener('change', sync)
      stop()
    }
  }, [])

  return <>{children}</>
}
