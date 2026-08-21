"use client"

import React from 'react'
import Link from 'next/link'
import { Container } from '../ui/Container'
import { TypeAnimation } from 'react-type-animation'

export const Hero = () => {
  return (
    <section className="hero-insights">
      <div className="hero-insights-bg"></div>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="hero-insights-video"
      >
        <source src="/videos/video-banner.mp4" type="video/mp4" />
      </video>
      <div className="hero-insights-overlay"></div>

      {/* Centered Hero Content */}
      <Container className="relative z-10 w-full flex flex-col items-center justify-center text-center py-6 grow">
        <div className="max-w-[820px] flex flex-col items-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#ffb7c5] inline-block mb-3.5">
            Technical Advisory &amp; Knowledge Hub
          </span>
          <h1 className="text-[clamp(34px,4.8vw,56px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-white m-0 mb-4 text-center min-h-[3.45em] sm:min-h-[2.3em] lg:min-h-[1.15em] flex items-center justify-center">
            <TypeAnimation
              sequence={[
                'Sustainable decisions start with better data.',
                2500,
                'Empowering climate action with insights.',
                2500,
                'Driving ESG transition through knowledge.',
                2500,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </h1>
          <p className="text-[clamp(15px,1.6vw,18px)] text-white/90 leading-[1.45] mx-auto mb-6 max-w-[60ch] font-light text-center">
            A resource base for climate action, carbon policy, and ESG transition parameters.
          </p>

          {/* Large Search Bar */}
          <div className="relative w-full max-w-[680px] z-20 mx-auto mt-6">
            <div className="hero-search-wrapper">
              <svg className="shrink-0 w-5 h-5 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" className="hero-search-input" placeholder="Search publications, tools, and emissions dashboards..." aria-label="Search Query" />
              <button className="hero-search-btn">
                <span>Search</span>
              </button>
            </div>

            {/* Trending Topics / Quick Tags */}
            <div className="flex gap-2 justify-center flex-wrap mt-6">
              <span className="text-xs text-white/60 self-center mr-1">Trending:</span>
              <Link href="/knowledge-hub" className="search-tag-link text-xs text-white bg-white/10 px-3 py-1.5 rounded border border-white/10 transition-all duration-200">GHG Inventories</Link>
              <Link href="/knowledge-hub" className="search-tag-link text-xs text-white bg-white/10 px-3 py-1.5 rounded border border-white/10 transition-all duration-200">Carbon Credits</Link>
              <Link href="/knowledge-hub" className="search-tag-link text-xs text-white bg-white/10 px-3 py-1.5 rounded border border-white/10 transition-all duration-200">ESG Disclosures</Link>
              <Link href="/knowledge-hub" className="search-tag-link text-xs text-white bg-white/10 px-3 py-1.5 rounded border border-white/10 transition-all duration-200">LEAP Modeling</Link>
              <Link href="/knowledge-hub" className="search-tag-link text-xs text-white bg-white/10 px-3 py-1.5 rounded border border-white/10 transition-all duration-200">Decarbonization</Link>
            </div>
          </div>
        </div>
      </Container>

      {/* Scroll Down Cue */}
      <div className="relative z-10 mb-10 flex flex-col items-center justify-center w-full">
        <a href="#insights-teaser" className="scroll-down-btn flex items-center justify-center w-11 h-11 rounded-full border border-white/25 bg-white/5 text-white transition-all duration-300 no-underline">
          <svg className="scroll-arrow w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
        </a>
      </div>
    </section>
  )
}

