import React from 'react'
import Image from 'next/image'

export const ImpactStats = () => {
  const stats = [
    {
      number: '50+',
      text: (
        <>
          <strong className="text-gray-900 font-bold">Successful Advisory Projects</strong> completed across MENA, Africa, and Europe, establishing a proven track record.
        </>
      )
    },
    {
      number: '35+',
      text: (
        <>
          <strong className="text-gray-900 font-bold">Multidisciplinary Experts</strong> including PhD and Master's graduates specializing in energy, climate, and ESG.
        </>
      )
    },
    {
      number: '325+',
      text: (
        <>
          <strong className="text-gray-900 font-bold">Years of Combined Experience</strong> driving impactful climate action, policy development, and strategic solutions.
        </>
      )
    },
    {
      number: '25+',
      text: (
        <>
          <strong className="text-gray-900 font-bold">Global Specialist Countries</strong> represented in our international consultancy and research network.
        </>
      )
    }
  ]

  return (
    <section id="impact-stats" className="bg-white py-[60px] overflow-visible">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="flex gap-16 items-center flex-wrap">

          {/* Left Column (Image representing purpose/results) */}
          <div className="flex-[1.2] min-w-[320px] relative">
            <div className="rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(15,40,65,0.08)] border border-gray-200 h-[380px]">
              <Image 
                src="/images/port.jpg" 
                alt="Strategic Maritime Port Advisory"
                width={600}
                height={380}
                className="w-full h-full object-cover block"
              />
            </div>
            <div className="absolute -bottom-6 left-5 bg-[#8B1538] text-white p-5 px-6 rounded-lg shadow-[0_10px_25px_rgba(139,21,56,0.3)] max-w-[220px] text-left z-[2]">
              <h5 className="text-[13px] font-extrabold uppercase tracking-[0.05em] m-0 mb-1.5">
                Advisory Audit
              </h5>
              <p className="text-[12px] leading-[1.4] m-0 text-white/90 font-light">
                Verified carbon reduction and technical viability across maritime corridors.
              </p>
            </div>
          </div>

          {/* Right Column (Stats) */}
          <div className="flex-[1.5] min-w-[360px] flex flex-col gap-8 text-left mt-8 md:mt-0">
            <div>
              <h3 className="text-[clamp(24px,3.5vw,38px)] font-light text-gray-900 leading-[1.2] tracking-[-0.02em] m-0 mb-4 uppercase">
                Our <span className="font-extrabold">Impact</span>
              </h3>
              <p className="text-[15px] text-gray-600 leading-[1.6] m-0 font-light">
                Our project evaluations and transition roadmaps deliver rigorous, audited milestones that stand up to institutional investor scrutiny and global rating standards.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex items-start gap-5 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[32px] font-extrabold text-[#8B1538] leading-none tracking-[-0.03em] font-mono">
                      {stat.number}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B1538] shrink-0"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                  </div>
                  <p className="text-[13.5px] text-gray-600 m-0 font-light pt-1.5">
                    {stat.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
