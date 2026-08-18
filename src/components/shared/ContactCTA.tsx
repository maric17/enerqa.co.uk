'use client'

import React from 'react'

export const ContactCTA = () => {
  return (
    <section id="cta" className="bg-white pt-[60px] pb-[100px]">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#8B1538] to-[#4a071a] p-10 md:p-[80px_60px] shadow-[0_20px_60px_rgba(139,21,56,0.2)] flex items-center gap-12 justify-between flex-wrap">

          {/* Subtle maroon texture overlay */}
          <div 
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.04) 0%, transparent 60%)' }}
          />

          {/* Left Column: Headings */}
          <div className="relative z-[2] flex-1 min-w-[280px] max-w-[460px] text-left">
            <span className="text-[11px] font-bold uppercase text-white/60 tracking-[0.15em] block mb-4">
              Newsletter
            </span>
            <h2 className="text-[clamp(28px,3.5vw,40px)] font-light text-white leading-[1.15] m-0 mb-4 tracking-[-0.02em] uppercase">
              Stay up to <span className="font-extrabold">date</span>
            </h2>
            <p className="text-[15px] text-white/75 leading-[1.6] m-0 font-light">
              Subscribe to receive our latest insights, technical publications, advisory notes, and tools directly to your inbox.
            </p>
          </div>

          {/* Right Column: Input Form */}
          <div className="relative z-[2] flex-[1.2] min-w-[320px] max-w-[560px]">
            <form 
              className="flex flex-col gap-3.5 w-full text-left"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* Input Row */}
              <div className="flex bg-white/95 rounded-md overflow-hidden items-center w-full shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex-col sm:flex-row">
                <input 
                  type="email" 
                  placeholder="* Your email address" 
                  required
                  className="flex-[1.2] min-w-0 p-[14px_24px] border-none bg-transparent text-gray-900 text-[14px] outline-none sm:border-r sm:border-r-[#8B1538]/10 w-full sm:w-auto"
                />
                <input 
                  type="text" 
                  placeholder="First name"
                  className="flex-[0.8] min-w-0 p-[14px_24px] border-none border-t border-t-[#8B1538]/10 sm:border-t-0 bg-transparent text-gray-900 text-[14px] outline-none w-full sm:w-auto"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-2.5 mt-1">
                <input 
                  type="checkbox" 
                  id="consent" 
                  required
                  className="w-4 h-4 rounded mt-0.5 cursor-pointer accent-white"
                />
                <label htmlFor="consent" className="text-[12px] text-white/70 leading-[1.45] cursor-pointer">
                  I agree with the terms of the <a href="/privacy" className="text-white underline font-semibold">Privacy Notice</a> and consent to my personal data being processed to subscribe to updates.
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="mt-2 bg-white text-[#8B1538] hover:bg-gray-100 font-bold text-[14px] py-3.5 px-8 rounded-full w-fit transition-colors shadow-md self-start"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  )
}
