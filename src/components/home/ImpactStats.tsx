import React from 'react'
import { Typography } from '../ui/Typography'

export const ImpactStats = () => {
  return (
    <section className="bg-white py-[60px] overflow-visible" id="impact-stats">
      <div className="wrap">
        <div className="flex gap-16 items-center flex-wrap">

          {/* Left Column (Image representing purpose/results) */}
          <div className="flex-[1.2] min-w-[320px] relative">
            <div className="rounded-[var(--r-lg)] overflow-hidden shadow-[0_20px_40px_rgba(15,40,65,0.08)] border border-line h-[380px]">
              <img src="/assets/images/port.jpg" alt="Strategic Maritime Port Advisory" className="w-full h-full object-cover block" />
            </div>
            <div className="absolute -bottom-6 left-5 bg-[#8B1538] text-white py-5 px-6 rounded-[var(--r-md)] shadow-[0_10px_25px_rgba(139,21,56,0.3)] max-w-[220px] text-left z-10">
              <h5 className="text-[13px] font-extrabold uppercase tracking-[0.05em] m-0 mb-1.5">
                Advisory Audit
              </h5>
              <p className="text-xs leading-[1.4] m-0 text-white/90 font-light">
                Verified carbon reduction and technical viability across maritime corridors.
              </p>
            </div>
          </div>

           {/* Right Column (Stats) */}
          <div className="flex-[1.5] min-w-[360px] flex flex-col gap-8 text-left">
            <div>
              <Typography variant="h3" className="text-ink uppercase mb-4">
                Our <span className="font-extrabold">Impact</span>
              </Typography>
              <p className="text-[15px] text-ink-soft leading-[1.6] m-0 font-light">
                Our project evaluations and transition roadmaps deliver rigorous, audited milestones that stand up to
                institutional investor scrutiny and global rating standards.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Stat Item 1 */}
              <div className="stat-row-item">
                <div className="stat-number">
                  <span>50+</span>
                  <svg className="w-6 h-6 text-[#8B1538] stroke-[2.5px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                </div>
                <p className="text-[13.5px] text-ink-soft m-0 font-light">
                  <strong className="text-ink">Successful Advisory Projects</strong> completed across MENA,
                  Africa, and Europe, establishing a proven track record.
                </p>
              </div>

              {/* Stat Item 2 */}
              <div className="stat-row-item">
                <div className="stat-number">
                  <span>35+</span>
                  <svg className="w-6 h-6 text-[#8B1538] stroke-[2.5px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                </div>
                <p className="text-[13.5px] text-ink-soft m-0 font-light">
                  <strong className="text-ink">Multidisciplinary Experts</strong> including PhD and Master's
                  graduates specializing in energy, climate, and ESG.
                </p>
              </div>

              {/* Stat Item 3 */}
              <div className="stat-row-item">
                <div className="stat-number">
                  <span>325+</span>
                  <svg className="w-6 h-6 text-[#8B1538] stroke-[2.5px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                </div>
                <p className="text-[13.5px] text-ink-soft m-0 font-light">
                  <strong className="text-ink">Years of Combined Experience</strong> driving impactful
                  climate action, policy development, and strategic solutions.
                </p>
              </div>

              {/* Stat Item 4 */}
              <div className="stat-row-item">
                <div className="stat-number">
                  <span>25+</span>
                  <svg className="w-6 h-6 text-[#8B1538] stroke-[2.5px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                </div>
                <p className="text-[13.5px] text-ink-soft m-0 font-light">
                  <strong className="text-ink">Global Specialist Countries</strong> represented in our
                  international consultancy and research network.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
