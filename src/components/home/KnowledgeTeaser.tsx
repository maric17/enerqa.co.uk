import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { KnowledgeSlider } from './KnowledgeSlider'

export const KnowledgeTeaser = async () => {
  const payload = await getPayload({ config: configPromise })
  
  const { docs: publicationsData } = await payload.find({
    collection: 'publications',
    limit: 6,
    depth: 1, // Populate the file/media relation
  })

  // Map bgGradientType to actual Tailwind gradients
  const gradientMap: Record<string, string> = {
    'Green': 'from-[#0e3029] to-[#061915]',
    'Red': 'from-[#8B1538] to-[#4a0a1c]',
    'Blue': 'from-[#0f2841] to-[#06121e]',
    'Dark': 'from-[#1b0a0f] to-[#100407]'
  }
  
  const typeColorMap: Record<string, string> = {
    'Advisory Note': 'text-[#a8d5cd]',
    'Case Study': 'text-[#ffb7c5]',
    'Technical Paper': 'text-[#c1f2e6]',
    'Strategic Report': 'text-[#ffb7c5]'
  }

  // Fallback data if CMS is empty
  const defaultPublications = [
    {
      id: '1',
      type: 'Advisory Note',
      typeColor: 'text-[#a8d5cd]',
      title: 'Climate Finance Checklist',
      date: 'June 2026',
      bgGradient: 'from-[#0e3029] to-[#061915]',
      heading: 'Climate Finance Readiness Checklist',
      excerpt: 'How organizations can align project criteria to successfully prepare and qualify for international green funding lines.',
      file: '/assets/publications/Climate-Finance-Advisory.pdf'
    },
    {
      id: '2',
      type: 'Case Study',
      typeColor: 'text-[#ffb7c5]',
      title: 'ESIA Frameworks for Utility Solar',
      date: 'November 2025',
      bgGradient: 'from-[#8B1538] to-[#4a0a1c]',
      heading: 'ESIA Frameworks for Solar in Water-Stressed Areas',
      excerpt: 'Environmental & social impact assessments tailored for massive utility-scale PV deployments across highly arid environments.',
      file: '/assets/publications/Sustainable-Agriculture-Redsea.pdf'
    },
    {
      id: '3',
      type: 'Technical Paper',
      typeColor: 'text-[#c1f2e6]',
      title: 'Distributed Energy Resources',
      date: 'September 2025',
      bgGradient: 'from-[#0f2841] to-[#06121e]',
      heading: 'Feasibility Modelling for Distributed Resources',
      excerpt: 'Economic and grid stability viability modeling for localized behind-the-meter generation networks.',
      file: '/assets/publications/GHG-Emissions-Report.pdf'
    },
    {
      id: '4',
      type: 'Strategic Report',
      typeColor: 'text-[#ffb7c5]',
      title: 'National Energy Transition Models',
      date: 'August 2025',
      bgGradient: 'from-[#1b0a0f] to-[#100407]',
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
      typeColor: typeColorMap[doc.type] || 'text-[#ffb7c5]',
      title: doc.title,
      date: formattedDate,
      bgGradient: gradientMap[doc.bgGradientType] || 'from-[#1b0a0f] to-[#100407]',
      heading: doc.heading,
      excerpt: doc.excerpt,
      // @ts-ignore
      file: doc.file?.url || ''
    }
  }) : defaultPublications

  return (
    <section id="knowledge-teaser" className="bg-[#FAF7F6] py-[60px] overflow-visible relative">
      <div className="w-full max-w-7xl mx-auto px-6">
        
        {/* Header Row */}
        <div className="flex justify-between items-end mb-12 flex-wrap gap-6 relative z-10">
          <div className="max-w-[600px] text-left">
            <h2 className="text-[clamp(24px,3.5vw,38px)] font-light text-gray-900 leading-[1.2] tracking-[-0.02em] m-0 uppercase">
              <span className="font-extrabold">Research</span> &amp; Publications
            </h2>
          </div>

          <div className="flex items-center gap-5 flex-wrap">
            <Link 
              href="/knowledge-hub"
              className="border-[1.5px] border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538] hover:text-white bg-transparent px-6 py-2.5 rounded-full text-[13px] no-underline font-bold transition-all whitespace-nowrap inline-block"
            >
              More Research &amp; Publications
            </Link>
          </div>
        </div>

        {/* Use Client Component for the slider interactiveness */}
        <KnowledgeSlider publications={publications} />

      </div>
    </section>
  )
}
