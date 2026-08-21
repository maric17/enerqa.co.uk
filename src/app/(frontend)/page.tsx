import React from 'react'
import { Hero } from '@/components/home/Hero'
import { InsightsTeaser } from '@/components/home/InsightsTeaser'
import { KnowledgeTeaser } from '@/components/home/KnowledgeTeaser'
import { SustainabilityData } from '@/components/home/SustainabilityData'
import { TransitionPriorities } from '@/components/home/TransitionPriorities'
import { Tools } from '@/components/home/Tools'
import { AboutEnerqa } from '@/components/home/AboutEnerqa'
import { ImpactStats } from '@/components/home/ImpactStats'
import { GlobalNetwork } from '@/components/home/GlobalNetwork'
import { ContactCTA } from '@/components/shared/ContactCTA'
import { FadeIn } from '@/components/animations/FadeIn'

export default function HomePage() {
  return (
    <>
      <Hero />
      <FadeIn delay={0.1}>
        <InsightsTeaser />
      </FadeIn>
      <FadeIn delay={0.1}>
        <KnowledgeTeaser />
      </FadeIn>
      <FadeIn delay={0.1}>
        <SustainabilityData />
      </FadeIn>
      <FadeIn delay={0.1}>
        <TransitionPriorities />
      </FadeIn>
      <FadeIn delay={0.1}>
        <Tools />
      </FadeIn>
      <FadeIn delay={0.1}>
        <AboutEnerqa />
      </FadeIn>
      <FadeIn delay={0.1}>
        <ImpactStats />
      </FadeIn>
      <FadeIn delay={0.1}>
        <GlobalNetwork />
      </FadeIn>
      <FadeIn delay={0.1}>
        <ContactCTA />
      </FadeIn>
    </>
  )
}
