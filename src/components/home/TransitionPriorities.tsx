import React from 'react'
import Link from 'next/link'
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
  },
  {
    title: 'Energy Systems & Transition',
    arabic: 'أنظمة الطاقة والتحول',
    description: 'The energy transition is reshaping how energy is produced, managed, financed and consumed.',
    slug: 'energy-systems-transition',
  },
  {
    title: 'Environment, Nature & Circularity',
    arabic: 'البيئة والطبيعة والاقتصاد الدائري',
    description: 'Projects and operations depend on healthy environmental, social and natural systems.',
    slug: 'environment-nature-circularity',
  },
  {
    title: 'Sustainable Business, ESG & Finance',
    arabic: 'الأعمال المستدامة والحوكمة والتمويل',
    description: 'Sustainability creates lasting value when it influences strategy, governance, investment and daily operations.',
    slug: 'sustainable-business-esg-finance',
  },
]

// CSS reveals details on hover/focus; touch devices always show the details.
export const TransitionPriorities = () => (
  <section className="bg-[var(--color-dark)] py-16 text-white lg:py-20" id="transition-priorities" aria-labelledby="h05-explore-domains">
    <Container>
      <div className="mb-10 max-w-3xl">
        <Typography variant="h2" id="h05-explore-domains" className="home-h2 mb-4 text-white">
          <span className="en">Explore Our Domains</span>
          <span className="ar">استكشف مجالاتنا</span>
        </Typography>
        <p className="m-0 text-[16px] font-light leading-relaxed text-white/80" lang="en">
          Four interconnected domains combine technical analysis, project development and investment thinking. Explore the work relevant to your priorities.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-px bg-white/15 md:grid-cols-2 lg:grid-cols-4" id="h05-domain-cards">
        {pillars.map((pillar, index) => (
          <Link key={pillar.slug} href={`/domains/${pillar.slug}`} className="domain-panel group block bg-[var(--color-dark)] p-6 text-white no-underline transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-primary)] lg:min-h-[300px]">
            <span className="mb-10 block text-xs font-semibold tracking-widest text-[var(--color-primary)]" aria-hidden="true">0{index + 1}</span>
            <h3 className="m-0 text-xl font-semibold leading-snug">
              <span className="en">{pillar.title}</span><span className="ar">{pillar.arabic}</span>
            </h3>
            <div className="domain-panel-details">
              <p className="mb-5 mt-4 text-sm leading-relaxed text-white/80" lang="en">{pillar.description}</p>
              <span className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--color-primary)]">
                Discover <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  </section>
)
