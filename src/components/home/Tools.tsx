import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export const Tools = async () => {
  const payload = await getPayload({ config: configPromise })
  
  const { docs: toolsData } = await payload.find({
    collection: 'tools',
    limit: 4,
    depth: 1, // Populate media relation
  })

  // Fallback data if CMS is empty
  const defaultTools = [
    {
      id: 'ghg',
      category: 'Carbon Footprint',
      title: 'GHG Emissions Calculator',
      desc: 'Streamlining accurate and comprehensive emissions accounting.',
      image: '/images/ghg365.png',
      link: '/tools#ghg365'
    },
    {
      id: 'mrv',
      category: 'Measurement & Reporting',
      title: 'MRV Tool',
      desc: 'Facilitating robust data management and transparent reporting.',
      image: '/images/logo-color.png',
      link: '/tools#mrv'
    },
    {
      id: 'ecorisk',
      category: 'Risk Management',
      title: 'ESIA Risk Assessment Tool',
      desc: 'Identifying and mitigating environmental and social impacts.',
      image: '/images/ecorisk.png',
      link: '/tools#eccrisk'
    },
    {
      id: 'greenscale',
      category: 'Capital Advisory',
      title: 'Green Project Scoring Tool',
      desc: 'Determining eligibility for "Green Finance" initiatives.',
      image: '/images/greenscale.png',
      link: '/tools#greenscale'
    }
  ]

  const secondaryTools = toolsData.length > 0 ? toolsData.map(doc => ({
    id: doc.id,
    category: doc.category,
    title: doc.title,
    desc: doc.desc,
    // @ts-ignore
    image: doc.image?.url || '/images/ghg365.png',
    link: doc.link
  })) : defaultTools


  return (
    <section id="tools" className="bg-white py-[60px]">
      <div className="w-full max-w-7xl mx-auto px-6">
        
        <div className="max-w-[800px] mb-12 text-left">
          <h2 className="text-[clamp(24px,3.5vw,38px)] font-light text-gray-900 leading-[1.2] tracking-[-0.02em] m-0 mb-4 uppercase">
            PROPRIETARY <span className="font-extrabold">Tools</span>
          </h2>
          <p className="text-[15.5px] text-gray-600 leading-[1.6] m-0 font-light">
            We leverage a suite of proprietary algorithms, dashboards, and structured templates to guide sustainable decisions and carbon reduction pathways.
          </p>
        </div>

        {/* Hybrid layout: Sticky Flagship on left, scrolling grid on right */}
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_2fr] gap-8 w-full items-start">
          
          {/* Left: Sticky Flagship Card */}
          <div className="bg-white border-[1.5px] border-[#8B1538]/15 rounded-xl p-9 pt-14 flex flex-col justify-start gap-6 transition-all duration-300 shadow-[0_15px_40px_rgba(139,21,56,0.03)] hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(139,21,56,0.08)] md:sticky md:top-[150px] z-10 box-border self-start h-auto overflow-visible mt-10">
            <div>
              {/* Overlapping Banner */}
              <div className="bg-[#FAFBFB] h-[140px] border-[1.5px] border-[#8B1538]/10 rounded-lg flex items-center justify-center -mt-[90px] mb-6 shadow-[0_12px_28px_rgba(139,21,56,0.06)] relative z-[5] overflow-hidden p-4">
                <Image src="/images/esg-logo.webp" alt="ESG Logo" width={200} height={100} className="max-w-full max-h-full object-contain" />
              </div>
              <span className="text-[10px] font-bold uppercase text-[#8B1538] tracking-[0.1em] block mb-1.5">
                Flagship Application
              </span>
              <h3 className="text-[20px] font-extrabold text-gray-900 m-0 mb-2 tracking-[-0.02em]">
                ESG Readiness Tool
              </h3>
              <p className="text-[13.5px] text-gray-600 leading-[1.5] m-0 font-light">
                Assessing and enhancing your Environmental, Social, and Governance performance.
              </p>

              {/* Features List */}
              <div className="border-t border-[#8B1538]/10 pt-5 mt-4">
                <ul className="list-none p-0 m-0 flex flex-col gap-3">
                  {[
                    'Automated SASB & GRI alignment',
                    'Real-time peer benchmarking',
                    'Custom materiality matrices'
                  ].map((feature, i) => (
                    <li key={i} className="text-[13px] text-gray-900 flex items-center gap-2.5 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B1538] shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link href="/esg-assessment" className="bg-[#8B1538] hover:bg-[#72102d] text-white text-center py-3.5 px-6 rounded-full text-[13px] font-bold block transition-colors shadow-[0_4px_14px_rgba(139,21,56,0.25)]">
              Launch Assessment Tool
            </Link>
          </div>

          {/* Right: Grid of remaining 4 tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 box-border">
            {secondaryTools.map(tool => (
              <div key={tool.id} className="bg-white border border-[#8B1538]/10 rounded-xl p-6 flex flex-col justify-between gap-4 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(139,21,56,0.06)] hover:border-[#8B1538]/20 group">
                <div>
                  <div className="bg-[#FAFBFB] h-[110px] rounded-lg flex items-center justify-center mb-4 border border-[#8B1538]/10 overflow-hidden p-3 transition-colors group-hover:bg-white">
                    <Image src={tool.image} alt={tool.title} width={150} height={80} className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-[#8B1538] tracking-[0.05em] block mb-1.5">
                    {tool.category}
                  </span>
                  <h4 className="text-[15px] font-bold text-gray-900 m-0 mb-2">
                    {tool.title}
                  </h4>
                  <p className="text-[12.5px] text-gray-600 leading-[1.55] m-0 font-light">
                    {tool.desc}
                  </p>
                </div>
                <Link href={tool.link} className="text-[12px] font-bold text-[#8B1538] flex items-center gap-1 mt-3 hover:text-[#72102d] transition-colors">
                  Learn More &rarr;
                </Link>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  )
}
