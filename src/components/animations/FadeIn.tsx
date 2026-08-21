'use client'

import { motion, useInView, Variants } from 'framer-motion'
import { useRef } from 'react'

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  fullWidth?: boolean
  viewAmount?: 'some' | 'all' | number
}

export function FadeIn({
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  direction = 'up',
  fullWidth = false,
  viewAmount = 0.2
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  // Trigger animation when the element comes into view. 'once: true' ensures it only happens once.
  const isInView = useInView(ref, { once: true, amount: viewAmount })

  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: duration,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Custom spring-like easing for a premium feel
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
