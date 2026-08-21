'use client'

import { motion, useInView, Variants } from 'framer-motion'
import { useRef } from 'react'

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  delayChildren?: number
  viewAmount?: 'some' | 'all' | number
}

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.15,
  delayChildren = 0,
  viewAmount = 0.1
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: viewAmount })

  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayChildren,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}
