'use client'

import { useEffect, useRef } from 'react'
import { useInView, animate } from 'framer-motion'

interface CountUpNumberProps {
  value: number
  duration?: number
  delay?: number
  className?: string
  suffix?: string
  prefix?: string
}

export function CountUpNumber({
  value,
  duration = 2,
  delay = 0,
  className = '',
  suffix = '',
  prefix = ''
}: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (isInView && ref.current) {
      const node = ref.current
      
      const controls = animate(0, value, {
        duration,
        delay,
        ease: 'easeOut',
        onUpdate(v) {
          node.textContent = `${prefix}${Math.round(v)}${suffix}`
        },
      })

      return () => controls.stop()
    }
  }, [isInView, value, duration, delay, prefix, suffix])

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  )
}
