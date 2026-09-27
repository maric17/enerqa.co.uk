import { resolveMediaUrl } from "@/lib/utils";
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { KnowledgeSlider, type SliderPublication } from './KnowledgeSlider'
import { usableExcerpt } from './publicationExcerpt'
import { Container } from '../ui/Container'

/**
 * H08 Enerqa Publication (handoff p. 14).
 *
 * "First-party CMS content, not a news API. Show real publication type,
 * author, title and actual publication date. Do not import archive headings or
 * biographies as articles."
 *
 * The 2024 import gave every record the same placeholder date, so a date is
 * labelled "(date unverified)" until an editor ticks `dateVerified` (p. 225
 * "recover true dates"), the same rule the Knowledge Hub applies.
 */
export const KnowledgeTeaser = async () => {
  const payload = await getPayload({ config: configPromise })

  const { docs: publicationsData } = await payload.find({
    collection: 'publications',
    // Only real articles. The 2024 import brought in category separators and a
    // biography page; handoff p. 225 says those are not publications.
    where: { recordKind: { equals: 'article' } },
    limit: 6,
    depth: 1, // Populate the file/media relation
    // Many records share the placeholder date; the id keeps the order stable.
    sort: ['-date', 'id'],
  })

  // Map bgGradientType to actual CSS gradients
  const gradientMap: Record<string, string> = {
    'Green': 'linear-gradient(135deg, #0e3029 0%, #061915 100%)',
    'Red': 'linear-gradient(135deg, #0972b8 0%, #075a93 100%)',
    'Blue': 'linear-gradient(135deg, #0f2841 0%, #06121e 100%)',
    'Dark': 'linear-gradient(135deg, #0C3A5C 0%, #082C45 100%)'
  }

  // Keyed by the collection's real `type` options. "Case Study" is gone: p. 229
  // allows no Case Study surface anywhere.
  const typeColorMap: Record<string, string> = {
    'Article': 'rgba(168,213,205,0.85)',
    'White Paper': 'rgba(193,242,230,0.85)',
    'Research': 'rgba(193,242,230,0.85)',
    'Conference Paper': 'rgba(168,213,205,0.85)',
  }

  const publications: SliderPublication[] = publicationsData.map(doc => {
    // Month and year only: the day in the imported dates is a placeholder.
    const formattedDate = doc.date
      ? new Date(doc.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
      : null
    const fileUrl =
      doc.file && typeof doc.file === 'object' && 'url' in doc.file ? resolveMediaUrl(doc.file.url) : null

    return {
      id: doc.id,
      slug: doc.slug,
      type: doc.type,
      typeColor: typeColorMap[doc.type] || 'rgba(168,213,205,0.85)',
      title: doc.title,
      author: doc.author || null,
      date: formattedDate,
      dateVerified: Boolean(doc.dateVerified),
      bgGradient: gradientMap[doc.bgGradientType] || 'linear-gradient(135deg, #0C3A5C 0%, #082C45 100%)',
      excerpt: usableExcerpt(doc.excerpt, doc.title),
      file: fileUrl || null,
    }
  })

  return (
    <section className="band" id="knowledge-teaser" aria-labelledby="h08-enerqa-publication" style={{ padding: '60px 0', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/images/research-banner.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0
      }}></div>
      {/* The photo is texture only. At 0.4 the light chart image left white text
          near 2.5:1; 0.86 navy keeps it above 4.5:1 wherever it falls (p. 228). */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8, 44, 69, 0.86)', zIndex: 1, pointerEvents: 'none' }}></div>
      <Container style={{ position: 'relative', zIndex: 2 }}>
        {/* Use Client Component for the slider interactiveness */}
        <KnowledgeSlider publications={publications} />
      </Container>
    </section>
  )
}
