import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export const AboutEnerqa = () => {
  return (
    <section id="about-enerqa" className="bg-[#8c1639] py-10 my-[100px] overflow-visible relative z-10">
      <div className="w-full max-w-7xl mx-auto px-6 relative flex items-center justify-between min-h-[260px] overflow-visible flex-wrap gap-10">
        
        {/* Left Column (Content) */}
        <div className="flex-[1.4] flex flex-col gap-7 text-left relative z-[2] max-w-full md:max-w-[52%]">
          <div>
            <span className="text-[11px] font-bold uppercase text-white/70 tracking-[0.15em] inline-block mb-2">
              About enerQA
            </span>
            <h3 className="text-[clamp(20px,2.6vw,32px)] font-light text-white leading-[1.15] tracking-[-0.02em] m-0 mb-3 uppercase">
              ENGINEERING<br/><span className="font-extrabold">SUSTAINABLE DECISIONS</span>
            </h3>
            <p className="text-[13.5px] text-white/85 leading-[1.6] m-0 font-light">
              A multidisciplinary advisory firm at the crossroads of engineering and environmental strategy — helping governments and corporations navigate the energy transition.
            </p>
          </div>

          <div className="flex gap-10 flex-wrap mt-2 border-t border-white/15 pt-8">
            {/* Column 1 */}
            <div className="flex-1 min-w-[200px] md:border-r md:border-white/15 md:pr-10">
              <h5 className="text-[13px] font-bold text-white m-0 mb-2">Engineering Precision</h5>
              <p className="text-[12px] text-white/75 leading-[1.55] m-0 mb-3 font-light">
                Technical audits, energy models, and infrastructure assessments.
              </p>
              <Link href="/about" className="text-white text-[12px] font-bold no-underline border-b-[1.5px] border-white pb-0.5 hover:text-white/80 transition-colors">
                Our Approach
              </Link>
            </div>

            {/* Column 2 */}
            <div className="flex-1 min-w-[200px]">
              <h5 className="text-[13px] font-bold text-white m-0 mb-2">ESG Intelligence</h5>
              <p className="text-[12px] text-white/75 leading-[1.55] m-0 mb-3 font-light">
                Governance frameworks, impact measurement, and disclosure readiness.
              </p>
              <Link href="/about" className="text-white text-[12.5px] font-bold no-underline border-b-[1.5px] border-white pb-0.5 hover:text-white/80 transition-colors">
                Meet the Team
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (Overlapping Circle) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[100] hidden lg:block">
          <div className="relative w-[460px] h-[460px] overflow-visible z-[100]">
            {/* Dark arc rings behind the image */}
            <div className="absolute -inset-[12px] rounded-full bg-[rgba(10,2,5,0.55)] z-0"></div>
            <div className="absolute -inset-[24px] rounded-full bg-[rgba(10,2,5,0.25)] z-0"></div>
            <Image 
              src="/images/gas-energy.jpg" 
              alt="About enerQA"
              width={460}
              height={460}
              className="w-full h-full object-cover rounded-full relative z-[101] block"
            />
          </div>
        </div>

      </div>
    </section>
  )
}
