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
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <main id="main">
        <Hero />
        <InsightsTeaser />
        <KnowledgeTeaser />
        <SustainabilityData />
        <TransitionPriorities />
        <Tools />
        <AboutEnerqa />
        <ImpactStats />
        <GlobalNetwork />
        <ContactCTA />
      </main>
      <Footer />
    </>
  )
}
