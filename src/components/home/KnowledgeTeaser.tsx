import { resolveMediaUrl } from "@/lib/utils";
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { KnowledgeSlider } from './KnowledgeSlider'
import { Container } from '../ui/Container'

export const KnowledgeTeaser = async () => {
  const payload = await getPayload({ config: configPromise })
  
  const { docs: publicationsData } = await payload.find({
    collection: 'publications',
    // Only real articles. The 2024 import brought in category separators and a
    // biography page; handoff p. 225 says those are not publications.
    where: { recordKind: { equals: 'article' } },
    limit: 6,
    depth: 1, // Populate the file/media relation
    sort: '-date',
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
      file: (doc.file && typeof doc.file === 'object' && doc.file !== null && 'url' in doc.file && resolveMediaUrl(doc.file.url)) ? (resolveMediaUrl(doc.file.url) as string) : ''
    }
  }) : []

  return (
    <section className="band" id="knowledge-teaser" style={{ padding: '60px 0', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/images/research-banner.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        zIndex: 0
      }}></div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 2, 5, 0.4)', zIndex: 1, pointerEvents: 'none' }}></div>
      <Container style={{ position: 'relative', zIndex: 2 }}>
        {/* Use Client Component for the slider interactiveness */}
        <KnowledgeSlider publications={publications} />
      </Container>
    </section>
  )
}

