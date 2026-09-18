import { resolveMediaUrl } from "@/lib/utils";
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Typography } from '../ui/Typography'
import { Container } from '../ui/Container'

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
      id: 'easysolar',
      category: 'Solar Energy',
      title: 'easySOLAR',
      desc: 'Early solar-energy feasibility, battery-storage sizing and financial performance.',
      image: '/assets/images/solar.jpg',
      link: '/tools/easysolar'
    },
    {
      id: 'greenscale',
      category: 'Sustainability',
      title: 'GreenScale Pro',
      desc: 'Assessment framework for examining sustainability and resilience criteria in buildings and infrastructure.',
      image: '/assets/images/greenscale.png',
      link: '/tools/greenscale-pro'
    }
  ]

  const secondaryTools = toolsData.length > 0 ? toolsData.map(doc => ({
    id: doc.id,
    category: doc.category,
    title: doc.title,
    desc: doc.desc,
    image: (doc.image && typeof doc.image === 'object' && doc.image !== null && 'url' in doc.image && resolveMediaUrl(doc.image.url)) ? (resolveMediaUrl(doc.image.url) as string) : '/assets/images/solar.jpg',
    link: doc.link || (doc.slug ? `/tools/${doc.slug}` : '/tools')
  })) : defaultTools


  return (
    <section className="bg-white py-[60px]" id="tools">
      <Container>

        <div className="max-w-[800px] mb-12 text-left">
          <Typography variant="h2" className="text-ink uppercase mb-4">
            PROPRIETARY <span className="font-extrabold">Tools</span>
          </Typography>
          <p className="text-[15.5px] text-ink-soft leading-[1.6] m-0 font-light">
            We leverage a suite of proprietary algorithms, dashboards, and structured templates to guide sustainable
            decisions and carbon reduction pathways.
          </p>
        </div>

        {/* Hybrid layout: Sticky Flagship on left, scrolling grid on right */}
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_2fr] gap-8 w-full items-start">

          {/* Left: Sticky Flagship Card (ESG Readiness Tool) */}
          <div className="group bg-white border-[1.5px] border-[var(--green)]/30 rounded-[var(--r-md)] pt-14 px-9 pb-9 flex flex-col justify-start gap-6 transition-all duration-300 shadow-[0_15px_40px_rgba(0,207,200,0.05)] md:sticky md:top-[150px] z-10 box-border self-start h-auto overflow-visible mt-10 hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(0,207,200,0.12)]">
            <div>
              {/* Overlapping Banner */}
              <div className="bg-[#FAFBFB] h-[140px] border-[1.5px] border-[var(--green)]/20 rounded-[var(--r-sm)] flex items-center justify-center -mt-[76px] mb-6 shadow-[0_12px_28px_rgba(0,207,200,0.08)] relative z-10 overflow-hidden p-4">
                <Image src="/assets/images/esg-logo.webp" alt="ESG Logo" width={200} height={100} className="max-w-full max-h-full object-contain" />
              </div>
              <span className="text-[10px] font-bold uppercase text-[var(--color-secondary)] tracking-[0.1em] block mb-1.5">
                Online Tool
              </span>
              <h3 className="text-[20px] font-extrabold text-ink m-0 mb-2 tracking-[-0.02em]">
                ESG Readiness Tool
              </h3>
              <p className="text-[13.5px] text-ink-soft leading-[1.5] m-0 font-light">
                A structured assessment to help organisations understand how current practices address environmental, social and governance priorities.
              </p>

              {/* Features List */}
              <div className="border-t border-[var(--green)]/20 pt-5 mt-6">
                <ul className="list-none p-0 m-0 flex flex-col gap-3">
                  <li className="text-[13px] text-ink flex items-center gap-2.5 font-medium">
                    <svg className="w-4 h-4 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                    Identify readiness gaps
                  </li>
                  <li className="text-[13px] text-ink flex items-center gap-2.5 font-medium">
                    <svg className="w-4 h-4 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                    Guide ESG strategy and action plans
                  </li>
                  <li className="text-[13px] text-ink flex items-center gap-2.5 font-medium">
                    <svg className="w-4 h-4 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                    Align with relevant frameworks
                  </li>
                </ul>
              </div>
            </div>

            <Link href="/tools/esg-readiness" className="bg-[var(--color-secondary)] text-white text-center py-3.5 px-6 rounded-full text-[13px] font-bold block transition-colors shadow-[0_4px_14px_rgba(9,114,184,0.25)] no-underline hover:bg-[#075a93]">
              Request Access
            </Link>
          </div>

          {/* Right: Grid of remaining tools (Scrolls with page scroll) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 box-border">
            {secondaryTools.map(tool => (
              <div key={tool.id} className="group bg-white border border-[var(--green)]/20 rounded-[var(--r-md)] p-6 flex flex-col justify-between gap-4 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,207,200,0.08)] hover:border-[var(--green)]/40">
                <div>
                  <div className="bg-[#FAFBFB] h-[110px] rounded-[var(--r-sm)] flex items-center justify-center mb-4 border border-[var(--green)]/20 overflow-hidden p-3 transition-colors group-hover:bg-white">
                    <Image src={tool.image} alt={tool.title} width={200} height={100} className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-[var(--color-secondary)] tracking-[0.05em] block mb-1.5">
                    {tool.category}
                  </span>
                  <h4 className="text-[15px] font-bold text-ink m-0 mb-2">
                    {tool.title}
                  </h4>
                  <p className="text-[12.5px] text-ink-soft leading-[1.55] m-0 font-light">
                    {tool.desc}
                  </p>
                </div>
                <Link href={tool.link} className="text-[12px] font-bold text-[var(--color-secondary)] flex items-center gap-1 no-underline transition-colors mt-3 hover:text-[#075a93]">
                  Explore Tool &rarr;
                </Link>
              </div>
            ))}
          </div>
          
        </div>
      </Container>
    </section>
  )
}

