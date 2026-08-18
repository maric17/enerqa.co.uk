import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export const InsightsTeaser = async () => {
  const payload = await getPayload({ config: configPromise })
  
  const { docs: insightsData } = await payload.find({
    collection: 'insights',
    limit: 3,
    depth: 1, // Populate the media relation
  })

  // Fallback to static data if CMS is empty for now
  const defaultInsights = [
    {
      id: '1',
      title: 'GHG Emissions: The Burden on Our Planet',
      excerpt: 'How human activity has driven the sharp rise in greenhouse gases — and the case for urgent action.',
      category: 'GHG Emissions',
      image: '/images/port.jpg'
    },
    {
      id: '2',
      title: 'Climate Forcers: Drivers of Warming',
      excerpt: "Beyond CO₂ — how short-lived pollutants like black carbon shape the planet's trajectory.",
      category: 'Climate Forcers',
      image: '/images/solar.jpg'
    },
    {
      id: '3',
      title: 'Climate Resilience in Supply Chains',
      excerpt: 'What recent disruption reveals about exposure — and how to design for resilience in logistics.',
      category: 'Supply Chains',
      image: '/images/gas-energy.jpg'
    }
  ]

  const insights = insightsData.length > 0 ? insightsData.map(doc => ({
    id: doc.id,
    title: doc.title,
    excerpt: doc.excerpt,
    category: doc.category,
    // @ts-ignore
    image: doc.image?.url || '/images/port.jpg'
  })) : defaultInsights


  return (
    <section id="insights-teaser" className="bg-white py-20">
      <div className="w-full max-w-7xl mx-auto px-6">
        
        {/* Header with View All Button */}
        <div className="flex justify-between items-end flex-wrap gap-6 mb-12 text-left">
          <div>
            <h2 className="text-[clamp(24px,3.5vw,38px)] font-light text-gray-900 leading-[1.2] tracking-[-0.02em] m-0 uppercase">
              <span className="font-extrabold">Latest</span> Insights
            </h2>
          </div>

          <div>
            <Link href="/knowledge-hub" className="border-[1.5px] border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538] hover:text-white bg-transparent px-6 py-2.5 rounded-full text-[13px] no-underline font-bold transition-all whitespace-nowrap inline-block">
              More Insights
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {insights.map((insight) => (
            <Link key={insight.id} href="/knowledge-hub" className="group relative bg-[#25050f] border-t-4 border-t-[#8c1639] border-x-[1.5px] border-b-[1.5px] border-[#8c1639]/15 hover:border-[#8c1639]/35 rounded-lg overflow-hidden flex flex-col no-underline shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] h-[420px] transition-all duration-300 hover:-translate-y-1.5">
              <div className="absolute top-0 left-0 right-0 h-[260px] overflow-hidden z-[1]">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${insight.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-65% to-[#25050f]" />
              </div>
              
              <span className="absolute top-4 right-4 text-[10px] font-bold text-[#8B1538] bg-white/95 px-3 py-1 rounded-full z-[5] border border-[#8c1639]/15 shadow-sm">
                {insight.category}
              </span>
              
              <div className="mt-auto p-6 flex flex-col gap-2 relative z-[2]">
                <h3 className="text-[18px] font-bold text-white leading-[1.35] m-0 group-hover:text-[#ffb7c5] transition-colors">
                  {insight.title}
                </h3>
                <p className="text-[14px] text-white/75 leading-[1.55] m-0">
                  {insight.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
