import React from 'react'
import { Hero } from '@/components/home/Hero'
import { InsightsTeaser } from '@/components/home/InsightsTeaser'
import { LatestNews } from '@/components/home/LatestNews'
import { KnowledgeTeaser } from '@/components/home/KnowledgeTeaser'
import { SustainabilityData } from '@/components/home/SustainabilityData'
import { fetchOpenAQData } from '@/lib/api/openaq'
import { fetchNasaPowerData } from '@/lib/api/nasaPower'
import { fetchWorldBankData } from '@/lib/api/worldBank'
import { fetchNoaaData } from '@/lib/api/noaa'
import { fetchUnSdgData } from '@/lib/api/unSdg'
import { fetchCckpData } from '@/lib/api/cckp'
import { fetchOsmData } from '@/lib/api/osm'
import { fetchUnOchaData } from '@/lib/api/unOcha'
import { TransitionPriorities } from '@/components/home/TransitionPriorities'
import { Tools } from '@/components/home/Tools'
import { AboutEnerqa } from '@/components/home/AboutEnerqa'
import { ImpactStats } from '@/components/home/ImpactStats'
import { GlobalNetwork } from '@/components/home/GlobalNetwork'
import { ContactCTA } from '@/components/shared/ContactCTA'
import { FadeIn } from '@/components/animations/FadeIn'

export default async function HomePage() {
  const [openaq, nasa, worldbank, noaa, unsdg, cckp, osm, unocha] = await Promise.all([
    fetchOpenAQData(),
    fetchNasaPowerData(),
    fetchWorldBankData(),
    fetchNoaaData(),
    fetchUnSdgData(),
    fetchCckpData(),
    fetchOsmData(),
    fetchUnOchaData()
  ])

  const allData = { openaq, nasa, worldbank, noaa, unsdg, cckp, osm, unocha }
  return (
    <>
      <Hero />
      <FadeIn delay={0.1}>
        <InsightsTeaser />
      </FadeIn>
      <FadeIn delay={0.1}>
        <LatestNews />
      </FadeIn>
      <FadeIn delay={0.1}>
        <KnowledgeTeaser />
      </FadeIn>
      <FadeIn delay={0.1}>
        <SustainabilityData apiData={allData} />
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
