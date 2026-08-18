'use client'

import React, { useRef } from 'react'

interface Publication {
  id: string | number;
  type: string;
  typeColor: string;
  title: string;
  date: string;
  bgGradient: string;
  heading: string;
  excerpt: string;
  file: string;
}

export const KnowledgeSlider = ({ publications }: { publications: Publication[] }) => {
  const sliderRef = useRef<HTMLDivElement>(null)

  const scrollPublications = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return
    const scrollAmount = sliderRef.current.clientWidth * 0.8
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <>
      {/* Sliding Navigation Arrows */}
      <div className="flex gap-2">
        <button 
          onClick={() => scrollPublications('left')}
          className="w-[42px] h-[42px] rounded-full border-[1.5px] border-gray-200 bg-white text-gray-500 flex items-center justify-center cursor-pointer transition-colors hover:border-[#8B1538] hover:text-[#8B1538]"
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button 
          onClick={() => scrollPublications('right')}
          className="w-[42px] h-[42px] rounded-full border-[1.5px] border-gray-200 bg-white text-gray-500 flex items-center justify-center cursor-pointer transition-colors hover:border-[#8B1538] hover:text-[#8B1538]"
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <div className="w-full relative mt-12">
        {/* Slider Wrapper */}
        <div 
          id="publications-slider"
          ref={sliderRef}
          className="flex gap-14 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 hide-scrollbar absolute top-0 left-0 right-0 -mt-20 w-full pt-20"
          style={{ position: 'relative', top: 'auto', left: 'auto', right: 'auto', marginTop: '0', paddingTop: '0' }} // Resetting the absolute styles for structure
        >
          {publications.map(pub => (
            <div key={pub.id} className="flex-[0_0_calc(50%-28px)] min-w-[540px] max-[1100px]:flex-[0_0_100%] max-[1100px]:min-w-[100%] max-[580px]:flex-col max-[580px]:gap-5 snap-start flex gap-8 items-start">
              
              {/* Cover Image */}
              <div 
                className={`w-[220px] h-[290px] max-[580px]:w-[180px] max-[580px]:h-[240px] rounded-md overflow-hidden shadow-[0_16px_36px_rgba(139,21,56,0.18),0_4px_14px_rgba(0,0,0,0.12)] relative flex flex-col justify-between p-5 border border-white/10 shrink-0 bg-gradient-to-br ${pub.bgGradient}`}
              >
                <div className={`text-[10px] ${pub.typeColor} uppercase font-bold tracking-[0.1em]`}>
                  {pub.type}
                </div>
                <div className="text-[16px] text-white font-extrabold leading-[1.35] drop-shadow-md">
                  {pub.title}
                </div>
                <div className={`text-[10px] ${pub.typeColor} opacity-80 font-semibold`}>
                  {pub.date}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col text-left pt-1.5">
                <h4 className="text-[21px] font-bold text-gray-900 leading-[1.3] m-0 mb-4 tracking-[-0.02em]">
                  {pub.heading}
                </h4>
                <div className="border-b border-gray-200 mb-4 w-full"></div>
                <p className="text-[14.5px] text-gray-600 leading-[1.6] m-0 mb-5 font-light">
                  {pub.excerpt}
                </p>
                {pub.file && (
                  <a 
                    href={pub.file}
                    className="text-[13px] font-bold text-[#8B1538] hover:text-[#72102d] border-b-[1.5px] border-[#8B1538] hover:border-[#72102d] pb-0.5 w-fit inline-flex items-center gap-1 transition-colors"
                  >
                    Read Full Report
                  </a>
                )}
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
