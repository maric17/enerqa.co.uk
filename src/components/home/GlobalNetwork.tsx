import React from 'react'
import { Typography } from '../ui/Typography'
import { Container } from '../ui/Container'

export const GlobalNetwork = () => {
  return (
    <section className="bg-white py-[60px] overflow-visible" id="global-network">
      <Container>
        <div className="flex gap-16 items-center flex-wrap">

          {/* Left Column (Text & Offices list) */}
          <div className="flex-1 min-w-[320px] text-left flex flex-col gap-6">
            <div>
              <Typography variant="h2" className="text-ink uppercase mb-4">
                <span className="font-extrabold">Over 25 Countries,</span><br/>One Shared Mission
              </Typography>
              <p className="text-[15.5px] text-ink-soft leading-[1.6] m-0 font-light">
                We connect global expertise with regional insights. Backed by specialists from over 25 countries, we
                manage a growing network of regional and representative offices.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5 border-t border-line pt-6">
              <div>
                <h5 className="text-sm font-bold text-ink mb-2 uppercase tracking-[0.05em]">
                  Key Offices
                </h5>
                <ul className="text-[13px] text-ink-soft flex flex-col gap-1.5 list-none p-0">
                  <li className="mb-1"><strong className="text-ink">London, UK</strong> (Corporate)</li>
                  <li className="mb-1"><strong className="text-ink">Doha, Qatar</strong> (MENA Regional)</li>
                  <li className="mb-1"><strong className="text-ink">Sharjah, UAE</strong> (SPC Free Zone)</li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-bold text-ink mb-2 uppercase tracking-[0.05em]">
                  Representative Offices
                </h5>
                <ul className="text-[13px] text-ink-soft flex flex-col gap-1.5 list-none p-0">
                  <li className="mb-1">Muscat, Oman</li>
                  <li className="mb-1">Riyadh, Saudi Arabia</li>
                  <li className="mb-1">Khartoum, Sudan</li>
                  <li className="mb-1">Beijing, China</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column (Maroon Map Card) */}
          <div className="global-map-wrapper flex-[1.6] min-w-[480px] bg-gradient-to-br from-[#8B1538] to-[#5a0d1e] rounded-[var(--r-lg)] p-0 relative shadow-[0_20px_50px_rgba(139,21,56,0.2)] h-[440px] flex items-center justify-center overflow-hidden">
            {/* Unified SVG with Zoomed ViewBox */}
            <svg width="100%" height="100%" viewBox="370 340 280 180" xmlns="http://www.w3.org/2000/svg" className="opacity-95 relative z-10">

              {/* Real World Map Embedded via SVG Image */}
              <image href="/assets/images/world-map.svg" x="30.767" y="241.591" width="784.077" height="458.627" className="opacity-[0.18] brightness-[20]" preserveAspectRatio="none" />

              {/* Connection Lines from Doha (527, 463) to other offices */}
              <path d="M 527 463 Q 460 410, 398 372" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" strokeDasharray="2 2" /> {/* London */}
              <path d="M 527 463 L 515 467" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
              {/* Riyadh */}
              <path d="M 527 463 L 534 477" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
              {/* Muscat */}
              <path d="M 527 463 Q 500 480, 475 495" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" strokeDasharray="2 2" /> {/* Khartoum */}
              <path d="M 527 463 Q 580 420, 630 385" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" strokeDasharray="2 2" /> {/* Beijing */}

              {/* Key Locations Pulsing Dots */}

              {/* Doha (Qatar) MENA Office */}
              <g className="cursor-pointer">
                <circle cx="527" cy="463" r="3" fill="rgba(255,255,255,0.25)">
                  <animate attributeName="r" values="2;5;2" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="527" cy="463" r="1.5" fill="#ffffff" />
                <text x="527" y="457" fill="rgba(255,255,255,0.9)" fontSize="5" fontWeight="700" textAnchor="middle">Doha (MENA)</text>
              </g>

              {/* London */}
              <g className="cursor-pointer">
                <circle cx="398" cy="372" r="1.5" fill="#ffffff" />
                <text x="398" y="367" fill="rgba(255,255,255,0.85)" fontSize="4.5" fontWeight="600" textAnchor="middle">London</text>
              </g>

              {/* Riyadh */}
              <g className="cursor-pointer">
                <circle cx="515" cy="467" r="1.5" fill="#ffffff" />
                <text x="510" y="468.5" fill="rgba(255,255,255,0.85)" fontSize="4.5" fontWeight="600" textAnchor="end">Riyadh</text>
              </g>

              {/* Muscat */}
              <g className="cursor-pointer">
                <circle cx="534" cy="477" r="1.5" fill="#ffffff" />
                <text x="539" y="478.5" fill="rgba(255,255,255,0.85)" fontSize="4.5" fontWeight="600" textAnchor="start">Muscat</text>
              </g>

              {/* Khartoum */}
              <g className="cursor-pointer">
                <circle cx="475" cy="495" r="1.5" fill="#ffffff" />
                <text x="475" y="504" fill="rgba(255,255,255,0.85)" fontSize="4.5" fontWeight="600" textAnchor="middle">Khartoum</text>
              </g>

              {/* Beijing */}
              <g className="cursor-pointer">
                <circle cx="630" cy="385" r="1.5" fill="#ffffff" />
                <text x="630" y="380" fill="rgba(255,255,255,0.85)" fontSize="4.5" fontWeight="600" textAnchor="middle">Beijing</text>
              </g>

              {/* UAE / Sharjah */}
              <g className="cursor-pointer">
                <circle cx="530" cy="465" r="1" fill="#ffffff" />
              </g>
            </svg>

            <div className="absolute bottom-4 left-6 text-[11px] font-bold text-white/70 flex items-center gap-1.5 z-20">
              <span className="w-2 h-2 bg-white rounded-full inline-block"></span>
              <span>Offices &amp; Representative Hubs</span>
            </div>
          </div>

        </div>
      </Container>
    </section>
  )
}
