import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { KnowledgeSlider } from './KnowledgeSlider'
import { Container } from '../ui/Container'

import { ParticleGalaxy } from '../animations/ParticleGalaxy'

export const KnowledgeTeaser = async () => {
  const payload = await getPayload({ config: configPromise })
  
  const { docs: publicationsData } = await payload.find({
    collection: 'publications',
    limit: 6,
    depth: 1, // Populate the file/media relation
  })

  // Map bgGradientType to actual CSS gradients
  const gradientMap: Record<string, string> = {
    'Green': 'linear-gradient(135deg, #0e3029 0%, #061915 100%)',
    'Red': 'linear-gradient(135deg, #8B1538 0%, #4a0a1c 100%)',
    'Blue': 'linear-gradient(135deg, #0f2841 0%, #06121e 100%)',
    'Dark': 'linear-gradient(135deg, #1b0a0f 0%, #100407 100%)'
  }
  
  const typeColorMap: Record<string, string> = {
    'Advisory Note': 'rgba(168,213,205,0.85)',
    'Case Study': 'rgba(255,183,197,0.85)',
    'Technical Paper': 'rgba(193,242,230,0.85)',
    'Strategic Report': 'rgba(255,183,197,0.85)'
  }

  // Fallback data if CMS is empty
  const defaultPublications = [
    {
      id: '1',
      type: 'Advisory Note',
      typeColor: 'rgba(168,213,205,0.85)',
      title: 'Climate Finance Checklist',
      date: 'June 2026',
      bgGradient: 'linear-gradient(135deg, #0e3029 0%, #061915 100%)',
      heading: 'Climate Finance Readiness Checklist',
      excerpt: 'How organizations can align project criteria to successfully prepare and qualify for international green funding lines.',
      file: '/assets/publications/Climate-Finance-Advisory.pdf'
    },
    {
      id: '2',
      type: 'Case Study',
      typeColor: 'rgba(255,183,197,0.85)',
      title: 'ESIA Frameworks for Utility Solar',
      date: 'November 2025',
      bgGradient: 'linear-gradient(135deg, #8B1538 0%, #4a0a1c 100%)',
      heading: 'ESIA Frameworks for Solar in Water-Stressed Areas',
      excerpt: 'Environmental & social impact assessments tailored for massive utility-scale PV deployments across highly arid environments.',
      file: '/assets/publications/Sustainable-Agriculture-Redsea.pdf'
    },
    {
      id: '3',
      type: 'Technical Paper',
      typeColor: 'rgba(193,242,230,0.85)',
      title: 'Distributed Energy Resources',
      date: 'September 2025',
      bgGradient: 'linear-gradient(135deg, #0f2841 0%, #06121e 100%)',
      heading: 'Feasibility Modelling for Distributed Resources',
      excerpt: 'Economic and grid stability viability modeling for localized behind-the-meter generation networks.',
      file: '/assets/publications/GHG-Emissions-Report.pdf'
    },
    {
      id: '4',
      type: 'Strategic Report',
      typeColor: 'rgba(255,183,197,0.85)',
      title: 'National Energy Transition Models',
      date: 'August 2025',
      bgGradient: 'linear-gradient(135deg, #1b0a0f 0%, #100407 100%)',
      heading: 'National Grid Decarbonization Models',
      excerpt: 'Macroeconomic pathways and resource integration policies modeled to target 50% carbon reduction by 2035.',
      file: '/assets/publications/GHG-Emissions-Report.pdf'
    }
  ]

  const publications = publicationsData.length > 0 ? publicationsData.map(doc => {
    // Format date nicely (e.g. "August 2025")
    const dateObj = new Date(doc.date)
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    return {
      id: doc.id,
      type: doc.type,
      typeColor: typeColorMap[doc.type] || 'rgba(255,183,197,0.85)',
      title: doc.title,
      date: formattedDate,
      bgGradient: gradientMap[doc.bgGradientType] || 'linear-gradient(135deg, #1b0a0f 0%, #100407 100%)',
      heading: doc.heading,
      excerpt: doc.excerpt,
      // @ts-ignore
      file: doc.file?.url || ''
    }
  }) : defaultPublications

  return (
    <section className="band" id="knowledge-teaser" style={{ padding: '60px 0', overflow: 'hidden', position: 'relative' }}>
      <ParticleGalaxy />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 2, 5, 0.4)', zIndex: 1, pointerEvents: 'none' }}></div>
      <Container style={{ position: 'relative', zIndex: 2 }}>
        {/* Use Client Component for the slider interactiveness */}
        <KnowledgeSlider publications={publications} />
      </Container>
    </section>
  )
}

