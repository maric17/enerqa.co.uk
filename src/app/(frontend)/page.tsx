import React from 'react'
import type { Metadata } from 'next'
import { Hero } from '@/components/home/Hero'
import { FirstFoldFeeds } from '@/components/home/FirstFoldFeeds'
import { LifecycleAndIndustries } from '@/components/home/LifecycleAndIndustries'
import { DataPortalTeaser } from '@/components/home/DataPortalTeaser'
import { KnowledgeTeaser } from '@/components/home/KnowledgeTeaser'
import { TransitionPriorities } from '@/components/home/TransitionPriorities'
import { Tools } from '@/components/home/Tools'
import { AboutEnerqa } from '@/components/home/AboutEnerqa'
import { ContactCTA } from '@/components/shared/ContactCTA'
import { FadeIn } from '@/components/animations/FadeIn'

export const metadata: Metadata = {
  title: {
    absolute: 'Enerqa — Project Development for a Sustainable Future',
  },
  description:
    'Enerqa develops projects across climate action, energy transition, environment, nature, circularity, ESG and sustainable finance.',
  alternates: { canonical: '/' },
}

/**
 * Homepage segments H01-H13 (handoff pp. 9-15), in the order the spec lists them.
 *
 * H01 Project Development for a Sustainable Future  -> Hero
 * H02 Ask Explore Discover                          -> Hero (search + chips)
 * H03 Global News                                   -> FirstFoldFeeds
 * H04 Major Markets                                 -> FirstFoldFeeds
 * H05 Explore Our Domains                           -> TransitionPriorities
 * H06 Project Development and Lifecycle Support     -> LifecycleAndIndustries
 * H07 Industries We Work In                         -> LifecycleAndIndustries
 * H08 Enerqa Publication                            -> KnowledgeTeaser
 * H09 Explore the Data Portal                       -> DataPortalTeaser
 * H10 Enerqa Tools                                  -> Tools
 * H11 About Enerqa                                  -> AboutEnerqa
 * H12 Stay Informed / H13 Discuss Your Project      -> ContactCTA
 *
 * H03 and H04 sit in their own light band directly below the hero rather than
 * inside it. The hero was holding H01, H02, the chips and both feeds at once,
 * which left the first viewport crowded and squeezed the headlines. This moves
 * the feeds out of the reference 768px fold (p. 13, 225) in exchange for a
 * readable hero and readable news - a deliberate trade, not an oversight.
 */
export default function HomePage() {
  return (
    <>
      <Hero />

      {/* H03 Global News + H04 Major Markets */}
      <FirstFoldFeeds />

      <FadeIn delay={0.1}>
        <TransitionPriorities />
      </FadeIn>
      <FadeIn delay={0.1}>
        <LifecycleAndIndustries />
      </FadeIn>
      <FadeIn delay={0.1}>
        <KnowledgeTeaser />
      </FadeIn>
      <FadeIn delay={0.1}>
        <DataPortalTeaser />
      </FadeIn>
      <FadeIn delay={0.1}>
        <Tools />
      </FadeIn>
      <FadeIn delay={0.1}>
        <AboutEnerqa />
      </FadeIn>
      <FadeIn delay={0.1}>
        <ContactCTA />
      </FadeIn>
    </>
  )
}
