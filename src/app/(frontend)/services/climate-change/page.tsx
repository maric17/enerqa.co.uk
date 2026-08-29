import React from 'react';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

export default function ClimateChangePage() {
  return (
    <>
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0">
          enerQA / reel 03.1
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          SCENE 03.1 — CLIMATE CHANGE
        </div>
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-[url('/assets/images/hero-bg.jpg')]"></div>
        <div className="hero-insights-overlay z-10 opacity-80"></div>
        
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/80 mb-2">
            <Link href="/" className="text-white/80 hover:text-white transition-colors no-underline">Home</Link> / <Link href="/services" className="text-white/80 hover:text-white transition-colors no-underline">Domains &amp; Services</Link> / <span className="en text-white">Climate Change</span><span className="ar text-white">تغيّر المناخ</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">Climate Change</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">تغيّر المناخ</span>
          </Typography>
          <p className="text-[17px] md:text-[19px] leading-[1.6] text-white/90 font-light m-0 mt-3 max-w-[800px]">
            <span className="en block">Solutions for climate action, carbon credits &amp; climate finance, and transparent climate reporting.</span>
            <span className="ar block mt-4">حلول للعمل المناخي، وأرصدة الكربون وتمويل المناخ، وإبلاغ مناخي شفاف.</span>
          </p>
        </Container>
      </section>

      {/* Climate Action */}
      <Section theme="light" id="climate-action" className="pt-16 pb-12 border-b border-ink/10">
        <div className="w-full flex flex-col gap-12 mt-12 md:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
            <div className="flex flex-col gap-6 sticky top-24">
              <div className="text-[12px] font-bold text-ink/60 font-mono tracking-widest uppercase">01.1 — Mitigation &amp; Adaptation</div>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">Climate Action</span>
              </Typography>
              <p className="text-[16px] leading-[1.6] text-ink-soft m-0">
                <span className="en block">The Paris Agreement has broadened the parties' responsibilities of mitigation and adaptation actions to include all levels within a country (institutions, NGOs, private sector, etc.). enerQA offers mitigation and adaptation solutions for all levels and sectors. We support you in transforming impacts into opportunities.</span>
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-ink/5 rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                <h4 className="text-[18px] font-bold text-ink m-0">Decarbonization Strategy</h4>
                <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We collaborate with you to develop a customized decarbonization strategy, outlining a roadmap for reducing greenhouse gas emissions across your operations.</p>
              </div>
              <div className="bg-white border border-ink/5 rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                <h4 className="text-[18px] font-bold text-ink m-0">Mitigation Pathway Analysis</h4>
                <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We conduct in-depth analyses to identify the most effective mitigation strategies aligned with your specific industry and context.</p>
              </div>
              <div className="bg-white border border-ink/5 rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                <h4 className="text-[18px] font-bold text-ink m-0">Carbon Footprint Assessment</h4>
                <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We calculate your organization's carbon footprint, providing a clear picture of your emissions profile and areas for reduction.</p>
              </div>
              <div className="bg-white border border-ink/5 rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                <h4 className="text-[18px] font-bold text-ink m-0">Clean Tech Feasibility</h4>
                <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We assess the feasibility of implementing clean technologies, evaluating their potential impact on your emissions and operations.</p>
              </div>
              <div className="bg-white border border-ink/5 rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all md:col-span-2">
                <h4 className="text-[18px] font-bold text-ink m-0">Life Cycle Assessment (LCA)</h4>
                <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We conduct Life Cycle Assessments (LCA) to evaluate the environmental impact of your products or services throughout their entire lifecycle, informing eco-design strategies.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Climate Finance */}
      <Section theme="muted" id="climate-finance" className="py-16">
        <div className="w-full flex flex-col gap-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
            <div className="flex flex-col gap-6 sticky top-24">
              <div className="text-[12px] font-bold text-ink/60 font-mono tracking-widest uppercase">01.2 — Carbon Credits</div>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">Climate Finance</span>
              </Typography>
              <p className="text-[16px] leading-[1.6] text-ink-soft m-0">
                <span className="en block">We help organisations accelerate their sustainability journey by unlocking the potential of carbon credits and securing climate finance.</span>
              </p>
            </div>
            
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-6">
                <h3 className="text-[22px] font-bold text-ink m-0 pb-2 border-b border-ink/10">Unlocking the Potential of Carbon Credits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[16px] font-bold text-ink m-0">Project Development &amp; Verification</h4>
                    <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We assist in identifying and developing carbon reduction projects that meet the highest standards. We also guide through the verification process to ensure the legitimacy of carbon credits.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[16px] font-bold text-ink m-0">Carbon Market Access</h4>
                    <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We navigate carbon markets, helping you find the right buyers for credits and maximize financial value.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <h3 className="text-[22px] font-bold text-ink m-0 pb-2 border-b border-ink/10">Securing Climate Finance for Sustainability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[16px] font-bold text-ink m-0">Funding Identification</h4>
                    <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We'll help you identify relevant climate finance options, such as grants, subsidies, or tax credits, which align with your project goals.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[16px] font-bold text-ink m-0">Proposal Development</h4>
                    <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We'll work with you to develop compelling proposals that effectively showcase the environmental impact and financial viability of your project.</p>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <h4 className="text-[16px] font-bold text-ink m-0">Compliance and Reporting</h4>
                    <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We'll ensure you meet all necessary reporting requirements, maximizing your chances of securing climate finance.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Transparency & Reporting */}
      <Section theme="light" id="transparency" className="py-16">
        <div className="w-full flex flex-col gap-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
            <div className="flex flex-col gap-6 sticky top-24">
              <div className="text-[12px] font-bold text-ink/60 font-mono tracking-widest uppercase">01.3 — Measurement &amp; MRV</div>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">Transparency &amp; Reporting</span>
              </Typography>
              <p className="text-[16px] leading-[1.6] text-ink-soft m-0">
                <span className="en block">In today's transparent business landscape, demonstrating your commitment to sustainability is crucial. We offer technical assistance to accurately measure, report, and communicate your environmental impact.</span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col p-8 bg-[#FAFBFB] border border-ink/5 rounded-2xl gap-4">
                <h3 className="text-[20px] font-bold text-ink m-0">Carbon Footprints &amp; GHG Emissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  <div>
                    <h4 className="text-[15px] font-bold text-ink m-0 mb-2">Carbon Footprint Studies</h4>
                    <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We conduct comprehensive carbon footprint studies, providing a clear picture of your GHG emissions across the entire value chain. Essential for setting baselines and tracking progress.</p>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-ink m-0 mb-2">GHG Emissions Baseline</h4>
                    <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We establish robust GHG emissions baselines which serve as the reference point for measuring your future emissions reductions.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col p-8 bg-[#FAFBFB] border border-ink/5 rounded-2xl gap-3">
                  <h3 className="text-[18px] font-bold text-ink m-0">Sustainability Reporting</h3>
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We assist in developing clear and concise sustainability reports that effectively communicate your performance to stakeholders, tailored to international frameworks like the Global Reporting Initiative (GRI).</p>
                </div>
                <div className="flex flex-col p-8 bg-[#FAFBFB] border border-ink/5 rounded-2xl gap-3">
                  <h3 className="text-[18px] font-bold text-ink m-0">Data Management &amp; Verification</h3>
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We guide you through implementing robust data management systems to ensure accuracy. We can also connect you with verification bodies to add further credibility to your reporting.</p>
                </div>
              </div>

              <div className="flex flex-col p-8 bg-ink text-white rounded-2xl gap-6 shadow-xl relative overflow-hidden mt-2">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <h3 className="text-[20px] font-bold text-white m-0 relative z-10">MRV Systems Development &amp; Capacity Building</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold mb-2">1</div>
                    <h4 className="text-[15px] font-bold text-white m-0">Systems Development</h4>
                    <p className="text-[14px] leading-[1.6] text-white/70 m-0">We collaborate with you to design and implement a tailored robust MRV (Measurement, Reporting and Verification) system. Our experts guide you through data collection methodologies and reporting protocols.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold mb-2">2</div>
                    <h4 className="text-[15px] font-bold text-white m-0">Capacity Building</h4>
                    <p className="text-[14px] leading-[1.6] text-white/70 m-0">We equip your team with the knowledge and skills necessary to operate the MRV system effectively. Programs include training workshops, technical guidance, and ongoing support.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <section className="relative w-full py-[120px] flex items-center justify-center bg-ink text-white overflow-hidden text-center">
        <div className="w-full max-w-[800px] mx-auto relative z-20 flex flex-col items-center gap-7">
          <Typography variant="eyebrow" className="text-white/80 m-0 w-full text-center flex justify-center">
            <span className="en">Ready to take climate action?</span>
          </Typography>
          <Typography variant="h2" className="text-white m-0 text-center">
            <span className="en block">Start your journey toward a sustainable future today.</span>
          </Typography>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Button href="/contact" variant="primary">
              <span className="en">Get in touch</span>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
