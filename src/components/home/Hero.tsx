import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export const Hero = () => {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col justify-center overflow-hidden pt-20">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0 bg-[#8c1639]">
        <Image src="/images/hero-bg.jpg" alt="Background" fill className="object-cover opacity-30 mix-blend-overlay" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-[#8c1639]/90 via-[#8c1639]/70 to-[#111827]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#ffb7c5] mb-4">
          Technical Advisory &amp; Knowledge Hub
        </span>
        
        <h1 className="text-[clamp(34px,4.8vw,56px)] font-[800] leading-[1.15] tracking-[-0.03em] text-white max-w-4xl mb-4">
          Sustainable decisions start with better data.
        </h1>
        
        <p className="text-[clamp(15px,1.6vw,18px)] text-white/90 leading-[1.45] font-light max-w-[60ch] mb-8">
          A resource base for climate action, carbon policy, and ESG transition parameters.
        </p>

        {/* Large Search Bar */}
        <div className="w-full max-w-[680px] mt-6">
          <div className="relative flex items-center w-full bg-white rounded-full p-2 shadow-2xl">
            <svg className="w-5 h-5 text-gray-500 ml-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" className="w-full bg-transparent border-none focus:outline-none focus:ring-0 px-4 text-[15px] text-gray-800 placeholder:text-gray-400" placeholder="Search publications, tools, and emissions dashboards..." />
            <button className="bg-[#8c1639] hover:bg-[#72102d] text-white px-6 py-3 rounded-full text-[14px] font-bold tracking-wide transition-colors">
              Search
            </button>
          </div>

          {/* Trending Topics */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <div className="flex flex-wrap gap-2 pt-2">
              {['Climate Finance', 'Grid Modelling', 'ESIA', 'Capacity Building', 'Monitoring & Evaluation'].map(tag => (
                <Link key={tag} href="/knowledge-hub" className="text-[12px] text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded transition-colors">
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <a href="#insights-teaser" className="flex items-center justify-center w-11 h-11 rounded-full border border-white/25 bg-white/5 text-white hover:bg-white/10 transition-colors">
          <svg className="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
        </a>
      </div>
    </section>
  )
}
