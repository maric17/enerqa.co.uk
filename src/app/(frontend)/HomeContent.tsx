import { siteText, type SiteLanguage } from '@/lib/i18n/site';
import React, { Suspense } from 'react'
import Link from 'next/link'
import { Hero } from '@/components/home/Hero'
import { FirstFoldFeeds } from '@/components/home/FirstFoldFeeds'
import { MajorMarkets } from '@/components/home/MajorMarkets'
import { LifecycleAndIndustries } from '@/components/home/LifecycleAndIndustries'
import { DataPortalTeaser } from '@/components/home/DataPortalTeaser'
import { KnowledgeTeaser } from '@/components/home/KnowledgeTeaser'
import { TransitionPriorities } from '@/components/home/TransitionPriorities'
import { Tools } from '@/components/home/Tools'
import { AboutEnerqa } from '@/components/home/AboutEnerqa'
import { ContactCTA } from '@/components/shared/ContactCTA'
import { getPrivacyHref } from '@/lib/policies'
import { Container } from '@/components/ui/Container'
import { PROVIDERS } from '@/lib/api/core/registry'
import { PAGE_NEWS_PROVIDERS } from '@/lib/api/news/policy'



/**
 * Homepage segments H01-H13 (handoff pp. 9-15), in the order the spec lists them.
 *
 * H01 Project Development for a Sustainable Future  -> Hero
 * H02 Ask Explore Discover                          -> Hero (search + chips)
 * H03 Global News                                   -> FirstFoldFeeds
 * H04 Major Markets                                 -> MajorMarkets
 * H05 Explore Our Domains                           -> TransitionPriorities
 * H06 Project Development and Lifecycle Support     -> LifecycleAndIndustries
 * H07 Industries We Work In                         -> LifecycleAndIndustries
 * H08 Publications                            -> KnowledgeTeaser
 * H09 Explore the Data Portal                       -> DataPortalTeaser
 * H10 Enerqa Tools                                  -> Tools
 * H11 About Enerqa                                  -> AboutEnerqa
 * H12 Stay Informed / H13 Discuss Your Project      -> ContactCTA (H12 first)
 *
 * October 18 direction replaces the compact first fold with a full-screen
 * editorial hero. H03 has four domain slides; H04 is a separate section below.
 *
 * No per-section fade-in: eight identical entrance animations added motion
 * without meaning, and the page reads calmer without them.
 *
 * Streaming: FirstFoldFeeds wraps its provider calls in <Suspense> itself. The
 * CMS-backed sections below the fold get their own boundaries so a slow CMS
 * query never holds back the hero and search either. Their fallbacks reserve
 * roughly the loaded height (p. 226, 228).
 */
export async function HomeContent({ language = 'en' }: { language?: SiteLanguage }) {
  const t = (text: string) => siteText(language, text);
  return (
    <>
      <Hero language={language}>
        {/* One saved headline per domain. */}
        <FirstFoldFeeds language={language} />
      </Hero>
      {/* Credit the configured feed below the banner, away from the headlines. */}
      <Container className="home-news-credit">
        <p>{t('News via')} <bdi>{PAGE_NEWS_PROVIDERS.map(provider => PROVIDERS[provider].name).join(', ')}</bdi>. <Link href="/data-portal/sources">{t('Sources and rights')}</Link>{language === 'ar' && <> · {t('English headlines')}</>}</p>
      </Container>

      <MajorMarkets language={language} />
      <TransitionPriorities language={language} />
      <LifecycleAndIndustries language={language} />
      <Suspense fallback={<div aria-hidden="true" className="min-h-[560px] bg-[var(--color-dark)]" />}>
        <KnowledgeTeaser language={language} />
      </Suspense>
      <Suspense fallback={<div aria-hidden="true" className="min-h-[420px] bg-[var(--paper-alt)]" />}>
        <DataPortalTeaser language={language} />
      </Suspense>
      <Suspense fallback={<div aria-hidden="true" className="min-h-[520px] bg-white" />}>
        <Tools language={language} />
      </Suspense>
      <AboutEnerqa language={language} />
      <ContactCTA language={language} privacyHref={await getPrivacyHref()} />
    </>
  )
}
