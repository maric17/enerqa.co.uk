import React, { Suspense } from 'react'
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
import { getPrivacyHref } from '@/lib/policies'

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
 * H12 Stay Informed / H13 Discuss Your Project      -> ContactCTA (H12 first)
 *
 * First fold (p. 15, 229): at 1366x768 the header, H01, H02, H03 and H04 must
 * all be visible without scrolling. H03 and H04 sit in their own compact light
 * band directly below a compact hero, and that band ends around y 720.
 *
 * No per-section fade-in: eight identical entrance animations added motion
 * without meaning, and the page reads calmer without them.
 *
 * Streaming: FirstFoldFeeds wraps its provider calls in <Suspense> itself. The
 * CMS-backed sections below the fold get their own boundaries so a slow CMS
 * query never holds back the hero and search either. Their fallbacks reserve
 * roughly the loaded height (p. 226, 228).
 */
export default async function HomePage() {
  return (
    <>
      <Hero />

      {/* H03 Global News + H04 Major Markets */}
      <FirstFoldFeeds />

      <TransitionPriorities />
      <LifecycleAndIndustries />
      <Suspense fallback={<div aria-hidden="true" className="min-h-[560px] bg-[var(--color-dark)]" />}>
        <KnowledgeTeaser />
      </Suspense>
      <Suspense fallback={<div aria-hidden="true" className="min-h-[420px] bg-[var(--paper-alt)]" />}>
        <DataPortalTeaser />
      </Suspense>
      <Suspense fallback={<div aria-hidden="true" className="min-h-[520px] bg-white" />}>
        <Tools />
      </Suspense>
      <AboutEnerqa />
      <ContactCTA privacyHref={await getPrivacyHref()} />
    </>
  )
}
