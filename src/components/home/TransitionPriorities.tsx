'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { Typography } from '../ui/Typography'
import { Container } from '../ui/Container'

const pillars = [
  {
    title: 'Climate Action & Carbon Management',
    arabic: 'العمل المناخي وإدارة الكربون',
    description: 'Climate change action becomes credible when commitments are translated into practical programmes, measurable results and investable projects.',
    slug: 'climate-action-carbon-management',
    image: '/images/domains/climate-glacier.webp',
  },
  {
    title: 'Energy Systems & Transition',
    arabic: 'أنظمة الطاقة والتحول',
    description: 'The energy transition is reshaping how energy is produced, managed, financed and consumed.',
    slug: 'energy-systems-transition',
    image: '/images/domains/energy-solar.webp',
  },
  {
    title: 'Environment, Nature & Circularity',
    arabic: 'البيئة والطبيعة والاقتصاد الدائري',
    description: 'Projects and operations depend on healthy environmental, social and natural systems.',
    slug: 'environment-nature-circularity',
    image: '/images/domains/nature-river.webp',
  },
  {
    title: 'Sustainable Business, ESG & Finance',
    arabic: 'الأعمال المستدامة والحوكمة والتمويل',
    description: 'Sustainability creates lasting value when it influences strategy, governance, investment and daily operations.',
    slug: 'sustainable-business-esg-finance',
    image: '/images/domains/business-building.webp',
  },
]

// Restore the shared-background layout from 530691e; selection follows hover or focus.
export const TransitionPriorities = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="relative isolate m-0 w-full overflow-hidden bg-[var(--color-dark)] text-white" id="transition-priorities" aria-labelledby="h05-explore-domains">
      {/* Keep all four local photos ready so changing domains crossfades immediately. */}
      {pillars.map((pillar, index) => (
        <div key={pillar.slug} data-domain-background={pillar.slug} data-active={index === activeIndex}
          aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-20 transition-opacity duration-500 motion-reduce:transition-none ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}>
          <Image src={pillar.image} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      ))}
      {/* One dark overlay keeps every heading and description readable over the photos. */}
      <div className="domain-stage-shade" aria-hidden="true" />
      <Container className="flex min-h-[620px] flex-col pt-12">
        <div className="max-w-[800px]">
          <Typography variant="h2" id="h05-explore-domains" className="home-h2 mb-4 text-white">
            <span className="en">Explore Our Domains</span>
            <span className="ar">استكشف مجالاتنا</span>
          </Typography>
          <p className="m-0 text-[16px] font-light leading-relaxed text-white/80" lang="en">
            Four interconnected domains combine technical analysis, project development and investment thinking. Explore the work relevant to your priorities.
          </p>
        </div>
        <div className="mt-10 flex flex-1 flex-col md:min-h-[400px] md:flex-row" id="h05-domain-cards">
          {pillars.map((pillar, index) => {
            const isActive = index === activeIndex
            return (
              <Link key={pillar.slug} href={`/domains/${pillar.slug}`} data-active={isActive}
                onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)}
                className={`domain-panel group relative flex flex-1 flex-col justify-end border-b border-white/15 p-6 text-white no-underline transition-[flex,background-color] duration-500 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-primary)] md:border-b-0 md:border-r md:p-8 md:last:border-r-0 ${isActive ? 'bg-black/10 md:flex-[1.2]' : ''}`}>
                <div>
                  <h3 className="m-0 text-xl font-semibold leading-snug">
                    <span className="en">{pillar.title}</span><span className="ar">{pillar.arabic}</span>
                  </h3>
                  <div className="domain-panel-details">
                    <p className="mb-5 mt-4 text-sm leading-relaxed text-white/80" lang="en">{pillar.description}</p>
                    <span className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--color-primary)]">
                      Discover <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
                <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-1 origin-left bg-[var(--color-primary)] transition-transform duration-500 motion-reduce:transition-none ${isActive ? 'scale-x-100' : 'scale-x-0'}`} />
              </Link>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
