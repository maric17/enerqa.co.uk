import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Typography } from '../ui/Typography'
import { Container } from '../ui/Container'

export const AboutEnerqa = () => {
  return (
    <section className="bg-[#8c1639] py-10 my-[100px] overflow-visible relative z-10" id="about-enerqa">
      <Container className="relative flex items-center justify-between min-h-[260px] overflow-visible">
        
        {/* Left Column (Content) */}
        <div className="relative z-10 flex-[1.4] flex flex-col gap-7 text-left max-w-[52%]">
          <div>
            <Typography variant="eyebrow" className="mb-2 text-white/70">
              About enerQA
            </Typography>
            <h3 className="text-[clamp(20px,2.6vw,32px)] font-light text-white leading-[1.15] tracking-[-0.02em] m-0 mb-3">
              ENGINEERING<br/><span className="font-extrabold">SUSTAINABLE DECISIONS</span>
            </h3>
            <p className="text-[13.5px] text-white/85 leading-[1.6] m-0 font-light">
              A multidisciplinary advisory firm at the crossroads of engineering and environmental strategy — helping
              governments and corporations navigate the energy transition.
            </p>
          </div>

          <div className="flex gap-10 flex-wrap mt-2 border-t border-white/15 pt-8">
            {/* Column 1 */}
            <div className="flex-1 min-w-[200px] border-r border-white/15 pr-10">
              <h5 className="text-[13px] font-bold text-white m-0 mb-2">Engineering Precision</h5>
              <p className="text-xs text-white/75 leading-[1.55] m-0 mb-3 font-light">
                Technical audits, energy models, and infrastructure assessments.
              </p>
              <Link href="/about" className="text-white text-xs font-bold no-underline border-b-[1.5px] border-white pb-0.5">
                Our Approach
              </Link>
            </div>

            {/* Column 2 */}
            <div className="flex-1 min-w-[200px]">
              <h5 className="text-[13px] font-bold text-white m-0 mb-2">ESG Intelligence</h5>
              <p className="text-xs text-white/75 leading-[1.55] m-0 mb-3 font-light">
                Governance frameworks, impact measurement, and disclosure readiness.
              </p>
              <Link href="/about" className="text-white text-[12.5px] font-bold no-underline border-b-[1.5px] border-white pb-0.5">
                Meet the Team
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (Overlapping Circle) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-[100]">
          <div className="relative w-[460px] h-[460px] overflow-visible z-[100]">
            {/* Dark arc ring behind the image */}
            <div className="absolute -inset-3 rounded-full bg-[#0a0205]/55 z-0"></div>
            <div className="absolute -inset-6 rounded-full bg-[#0a0205]/25 z-0"></div>
            <Image src="/assets/images/gas-energy.jpg" alt="About enerQA" width={460} height={460} className="w-full h-full object-cover rounded-full relative z-[101] block" />
          </div>
        </div>

      </Container>
    </section>
  )
}

