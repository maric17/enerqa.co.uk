import React from 'react';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

export default function BusinessSolutionsPage() {
  return (
    <>
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0">
          enerQA / reel 03.4
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          SCENE 03.4 — BUSINESS SOLUTIONS
        </div>
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-[url('/assets/images/gas-energy.jpg')]"></div>
        <div className="hero-insights-overlay z-10 opacity-80"></div>
        
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/80 mb-2">
            <Link href="/" className="text-white/80 hover:text-white transition-colors no-underline">Home</Link> / <Link href="/services" className="text-white/80 hover:text-white transition-colors no-underline">Domains &amp; Services</Link> / <span className="en text-white">Business Solutions</span><span className="ar text-white">حلول الأعمال</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">Business Solutions</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">حلول الأعمال</span>
          </Typography>
          <p className="text-[17px] md:text-[19px] leading-[1.6] text-white/90 font-light m-0 mt-3 max-w-[800px]">
            <span className="en block">Business models and feasibility studies, green credit lines, and supporting studies tailored to each client's needs.</span>
            <span className="ar block mt-4">نماذج أعمال ودراسات جدوى، وخطوط ائتمان أخضر، ودراسات داعمة مصممة لاحتياجات كل عميل.</span>
          </p>
        </Container>
      </section>

      {/* Green Credit Lines */}
      <Section theme="light" id="green-credit" className="pt-16 pb-12 border-b border-ink/10">
        <div className="w-full flex flex-col gap-12 mt-12 md:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
            <div className="flex flex-col gap-6 sticky top-24">
              <div className="text-[12px] font-bold text-ink/60 font-mono tracking-widest uppercase">04.1 — Finance &amp; Eligibility</div>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">Green Credit Lines</span>
              </Typography>
              <p className="text-[16px] leading-[1.6] text-ink-soft m-0">
                <span className="en block">Structuring and eligibility frameworks connecting borrowers with green finance facilities.</span>
              </p>
            </div>
            
            <div className="flex flex-col gap-8">
              <div className="p-8 bg-ink rounded-2xl text-white shadow-xl">
                <h3 className="text-[20px] font-bold text-white m-0 mb-4">Support for Financial Institutions</h3>
                <p className="text-[15px] leading-[1.6] text-white/80 m-0">
                  We provide comprehensive support to financial institutions (FIs) interested in financing environmentally responsible projects, particularly in the renewable energy (RE) and energy efficiency (EE) sectors. This enables FIs to effectively advance their sustainability initiatives while ensuring financial viability and contributing to environmental stewardship.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col p-6 bg-white border border-ink/5 rounded-2xl gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                  <h4 className="text-[16px] font-bold text-ink m-0">Eligibility &amp; Taxonomy</h4>
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0">Alignment with eligibility criteria and green taxonomy frameworks.</p>
                </div>
                <div className="flex flex-col p-6 bg-white border border-ink/5 rounded-2xl gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                  <h4 className="text-[16px] font-bold text-ink m-0">Facility Structuring</h4>
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0">Strategic support and structuring for green finance facilities.</p>
                </div>
                <div className="flex flex-col p-6 bg-white border border-ink/5 rounded-2xl gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                  <h4 className="text-[16px] font-bold text-ink m-0">Risk Categorisation</h4>
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0">Comprehensive environmental and social risk categorisation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Supporting Studies & M&E */}
      <Section theme="muted" id="studies-m-e" className="py-16">
        <div className="w-full flex flex-col gap-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
            <div className="flex flex-col gap-6 sticky top-24">
              <div className="text-[12px] font-bold text-ink/60 font-mono tracking-widest uppercase">04.2 — Frameworks &amp; Studies</div>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">Studies &amp; M&amp;E Frameworks</span>
              </Typography>
              <p className="text-[16px] leading-[1.6] text-ink-soft m-0">
                <span className="en block">This category of services is cross-cutting across all domains and supports our other services, ensuring strategic growth and measurable impact.</span>
              </p>
            </div>
            
            <div className="flex flex-col gap-12">
              {/* Business Models */}
              <div className="flex flex-col gap-6">
                <h3 className="text-[22px] font-bold text-ink m-0 pb-2 border-b border-ink/10">Business Models &amp; Feasibility Studies</h3>
                <p className="text-[14px] leading-[1.6] text-ink-soft m-0 -mt-2">We guide businesses through detailed Business Modeling and Feasibility Studies to ensure strategic growth and profitability. Our services include:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="text-[16px] font-bold text-ink m-0">Preliminary Evaluation</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">Initial assessment of business ideas to evaluate their viability and potential success in the market.</p>
                  </div>
                  <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="text-[16px] font-bold text-ink m-0">Market Research</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">Extensive market research to identify opportunities and gaps that align with your business objectives.</p>
                  </div>
                  <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="text-[16px] font-bold text-ink m-0">Concept Development</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">Develop a concise concept statement outlining the unique value proposition and market positioning.</p>
                  </div>
                  <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="text-[16px] font-bold text-ink m-0">Organizational Readiness</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">Evaluate the management expertise, capacity, and resources needed for a successful launch or expansion.</p>
                  </div>
                  <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="text-[16px] font-bold text-ink m-0">Financial Feasibility</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">In-depth analyses to provide a robust foundation for preparing financial forecasts and assessing investment viability.</p>
                  </div>
                  <div className="bg-white border border-ink/5 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-2 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="text-[16px] font-bold text-ink m-0">Decision Support</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">Strategic recommendations based on our analyses to help you decide whether to proceed with the proposed project.</p>
                  </div>
                </div>
              </div>

              {/* M&E */}
              <div className="flex flex-col gap-6 p-8 bg-[#FAFBFB] border border-ink/10 rounded-2xl">
                <h3 className="text-[22px] font-bold text-ink m-0 pb-2 border-b border-ink/10">Monitoring &amp; Evaluation (M&amp;E)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center text-[16px] font-bold text-ink">01</div>
                    <h4 className="text-[16px] font-bold text-ink m-0">Framework Development</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">We design a comprehensive plan to assess the performance, progress, and overall impact of your initiatives using structured, data-driven frameworks.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center text-[16px] font-bold text-ink">02</div>
                    <h4 className="text-[16px] font-bold text-ink m-0">Effectiveness Assessment</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">In-depth analyses to evaluate real-world impact. We utilize quantitative and qualitative methods to provide actionable insights for improvement.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center text-[16px] font-bold text-ink">03</div>
                    <h4 className="text-[16px] font-bold text-ink m-0">Costed M&amp;E Plan</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">We develop detailed, costed M&amp;E plans ensuring financial transparency and outlining necessary human, financial, and technological resources.</p>
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
            <span className="en">Elevate your business impact</span>
          </Typography>
          <Typography variant="h2" className="text-white m-0 text-center">
            <span className="en block">Explore custom solutions for strategic growth and sustainability.</span>
          </Typography>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Button href="/contact" variant="primary">
              <span className="en">Start an inquiry</span>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
