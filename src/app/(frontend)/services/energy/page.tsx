import React from 'react';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

export default function EnergyPage() {
  return (
    <>
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0">
          enerQA / reel 03.3
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          SCENE 03.3 — ENERGY
        </div>
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-[url('/assets/images/solar.jpg')]"></div>
        <div className="hero-insights-overlay z-10 opacity-80"></div>
        
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/80 mb-2">
            <Link href="/" className="text-white/80 hover:text-white transition-colors no-underline">Home</Link> / <Link href="/services" className="text-white/80 hover:text-white transition-colors no-underline">Domains &amp; Services</Link> / <span className="en text-white">Energy</span><span className="ar text-white">الطاقة</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">Energy</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">الطاقة</span>
          </Typography>
          <p className="text-[17px] md:text-[19px] leading-[1.6] text-white/90 font-light m-0 mt-3 max-w-[800px]">
            <span className="en block">Energy management, renewable project development, and energy modelling without compromising facility functions.</span>
            <span className="ar block mt-4">إدارة الاستهلاك القائم، وتطوير مشاريع الطاقة المتجددة، ونمذجة الطاقة وتحليل السياسات.</span>
          </p>
        </Container>
      </section>

      {/* Energy Management */}
      <Section theme="light" id="energy-management" className="pt-16 pb-12 border-b border-ink/10">
        <div className="w-full flex flex-col gap-12 mt-12 md:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
            <div className="flex flex-col gap-6 sticky top-24">
              <div className="text-[12px] font-bold text-ink/60 font-mono tracking-widest uppercase">03.1 — Audits &amp; Systems</div>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">Energy Management</span>
              </Typography>
              <p className="text-[16px] leading-[1.6] text-ink-soft m-0">
                <span className="en block">Using engineering and economic principles, we assist in projects development and energy cost control without compromise in the needed functions of the facility systems.</span>
              </p>

              <div className="flex flex-col gap-4 mt-6 p-8 bg-[#FAFBFB] border border-ink/5 rounded-2xl">
                <h4 className="text-[18px] font-bold text-ink m-0">Energy Audits</h4>
                <p className="text-[14px] leading-[1.6] text-ink-soft m-0">A crucial initial step in implementing an efficient program to control energy costs. Our audits evaluate how energy is utilized in facilities and provide recommendations on modifying operational procedures or equipment.</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-white border border-ink/10 rounded-full text-[12px] font-bold text-ink/60 uppercase tracking-wider">Walkthrough Audits</span>
                  <span className="px-3 py-1 bg-white border border-ink/10 rounded-full text-[12px] font-bold text-ink/60 uppercase tracking-wider">Mini Audits</span>
                  <span className="px-3 py-1 bg-white border border-ink/10 rounded-full text-[12px] font-bold text-ink/60 uppercase tracking-wider">Maxi Audits</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-6">
                <h3 className="text-[22px] font-bold text-ink m-0 pb-2 border-b border-ink/10">Energy Management Systems (EnMS) <span className="font-light text-ink/50 ml-2">ISO 50001</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="text-[16px] font-bold text-ink m-0">EnMS Development</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">We collaborate with clients to develop a customized EnMS that aligns perfectly with unique needs and energy profile.</p>
                  </div>
                  <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="text-[16px] font-bold text-ink m-0">Policy &amp; Strategy</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">We guide in crafting an actionable energy policy, setting measurable objectives, and establishing a continuous improvement roadmap.</p>
                  </div>
                  <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="text-[16px] font-bold text-ink m-0">Process Implementation</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">We assist in key processes for energy data collection, analysis, and record-keeping, ensuring transparency.</p>
                  </div>
                  <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="text-[16px] font-bold text-ink m-0">Resource Optimization</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">Identify energy-saving measures across operations, including training, tech upgrades, and operational tweaks.</p>
                  </div>
                  <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="text-[16px] font-bold text-ink m-0">Monitoring &amp; Reporting</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">Support in establishing a system to continuously monitor energy performance against targets and track progress.</p>
                  </div>
                  <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="text-[16px] font-bold text-ink m-0">ISO 50001 Certification</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">Guide through the certification process, including gap analysis, documentation preparation, and audit support.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 p-8 bg-ink text-white rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/3"></div>
                <h3 className="text-[22px] font-bold text-white m-0 relative z-10">Energy Modelling &amp; Policy Analysis</h3>
                <p className="text-[14px] leading-[1.6] text-white/70 m-0 relative z-10 mb-2">Through our combined expertise, we provide a powerful toolbox to:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[15px] font-bold text-white m-0 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50 block"></span>
                      Forecast Consumption
                    </h4>
                    <p className="text-[13px] leading-[1.6] text-white/60 m-0 pl-3.5">Leverage data and statistical methods to create accurate models predicting energy use and environmental impact.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[15px] font-bold text-white m-0 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50 block"></span>
                      Evaluate Policies
                    </h4>
                    <p className="text-[13px] leading-[1.6] text-white/60 m-0 pl-3.5">Analyze the effectiveness of current energy-related policies to identify areas for improvement.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[15px] font-bold text-white m-0 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50 block"></span>
                      Develop New Policies
                    </h4>
                    <p className="text-[13px] leading-[1.6] text-white/60 m-0 pl-3.5">Help craft innovative policies that address future uncertainties like resource availability and tech advancements.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[15px] font-bold text-white m-0 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50 block"></span>
                      Navigate Trade-offs
                    </h4>
                    <p className="text-[13px] leading-[1.6] text-white/60 m-0 pl-3.5">Visualize the potential impact of different policy options, balancing competing priorities and uncertainties.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Renewable Energy Projects */}
      <Section theme="muted" id="renewables" className="py-16">
        <div className="w-full flex flex-col gap-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
            <div className="flex flex-col gap-6 sticky top-24">
              <div className="text-[12px] font-bold text-ink/60 font-mono tracking-widest uppercase">03.2 — Project Development</div>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">Renewable Energy</span>
              </Typography>
              <p className="text-[16px] leading-[1.6] text-ink-soft m-0">
                <span className="en block">We offer comprehensive guidance throughout the entire renewable energy project lifecycle, from initial feasibility assessment to ongoing operation and performance monitoring. We navigate every step, including system design, permitting, construction oversight, and long-term maintenance.</span>
              </p>
            </div>
            
            <div className="flex flex-col gap-6">
              <h3 className="text-[20px] font-bold text-ink m-0 mb-2">Maximizing Environmental &amp; Financial Benefits</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col p-8 bg-white border border-ink/5 rounded-2xl gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                  <h4 className="text-[18px] font-bold text-ink m-0">Carbon Markets Entry</h4>
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We assist in exploring opportunities to participate in carbon markets. This could involve generating and trading carbon credits based on the emissions the project offsets.</p>
                </div>
                
                <div className="flex flex-col p-8 bg-white border border-ink/5 rounded-2xl gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                  <h4 className="text-[18px] font-bold text-ink m-0">Climate Finance Access</h4>
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We guide our clients through the process of securing climate finance, such as grants, subsidies, or tax credits, to support the project's development and implementation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <section className="relative w-full py-[120px] flex items-center justify-center bg-ink text-white overflow-hidden text-center">
        <div className="w-full max-w-[800px] mx-auto relative z-20 flex flex-col items-center gap-7">
          <Typography variant="eyebrow" className="text-white/80 m-0 w-full text-center flex justify-center">
            <span className="en">Optimize your energy strategy today</span>
          </Typography>
          <Typography variant="h2" className="text-white m-0 text-center">
            <span className="en block">Unlock your facility's true energy potential.</span>
          </Typography>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Button href="/contact" variant="primary">
              <span className="en">Contact our team</span>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
