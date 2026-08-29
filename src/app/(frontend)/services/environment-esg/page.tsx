import React from 'react';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

export default function EnvironmentESGPage() {
  return (
    <>
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0">
          enerQA / reel 03.2
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          SCENE 03.2 — ENVIRONMENT &amp; ESG
        </div>
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-[url('/assets/images/port.jpg')]"></div>
        <div className="hero-insights-overlay z-10 opacity-80"></div>
        
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/80 mb-2">
            <Link href="/" className="text-white/80 hover:text-white transition-colors no-underline">Home</Link> / <Link href="/services" className="text-white/80 hover:text-white transition-colors no-underline">Domains &amp; Services</Link> / <span className="en text-white">Environment &amp; ESG</span><span className="ar text-white">البيئة والحوكمة البيئية والاجتماعية والمؤسسية</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">Environment &amp; ESG</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">البيئة والحوكمة البيئية والاجتماعية والمؤسسية</span>
          </Typography>
          <p className="text-[17px] md:text-[19px] leading-[1.6] text-white/90 font-light m-0 mt-3 max-w-[800px]">
            <span className="en block">Comprehensive guidance through ESG reporting and rigorous environmental assessments.</span>
            <span className="ar block mt-4">تقييمات بيئية وخطط إدارة وتقارير الحوكمة البيئية والاجتماعية (ESG).</span>
          </p>
        </Container>
      </section>

      {/* ESG Reporting */}
      <Section theme="light" id="esg-reporting" className="pt-16 pb-12 border-b border-ink/10">
        <div className="w-full flex flex-col gap-12 mt-12 md:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
            <div className="flex flex-col gap-6 sticky top-24">
              <div className="text-[12px] font-bold text-ink/60 font-mono tracking-widest uppercase">02.1 — Frameworks &amp; Disclosure</div>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">ESG Reporting</span>
              </Typography>
              <p className="text-[16px] leading-[1.6] text-ink-soft m-0">
                <span className="en block">We offer our clients comprehensive guidance throughout the ESG reporting process, ensuring alignment with sustainability goals and stakeholder objectives.</span>
              </p>

              <div className="mt-6 p-8 bg-ink rounded-2xl text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/10 transition-colors"></div>
                <h4 className="text-[18px] font-bold text-white m-0 relative z-10 mb-3">Is your organisation pursuing ESG reporting and having trouble where to start?</h4>
                <p className="text-[14px] leading-[1.6] text-white/70 m-0 relative z-10 mb-6">Check your organisation's readiness for ESG reporting using our Tool!</p>
                <Button href="/contact" variant="primary" className="relative z-10 bg-white text-ink hover:bg-white/90">
                  <span className="en">Download Tool</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-ink/5 rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                  <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-xs font-bold mb-2">1</div>
                  <h4 className="text-[16px] font-bold text-ink m-0">Initial Assessment</h4>
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We assess reporting needs and requirements tailored to your organization's goals and stakeholder expectations.</p>
                </div>
                <div className="bg-white border border-ink/5 rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                  <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-xs font-bold mb-2">2</div>
                  <h4 className="text-[16px] font-bold text-ink m-0">Reporting Framework</h4>
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We use widely recognised frameworks (GRI, SASB) to capture relevant ESG metrics according to your industry.</p>
                </div>
                <div className="bg-white border border-ink/5 rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                  <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-xs font-bold mb-2">3</div>
                  <h4 className="text-[16px] font-bold text-ink m-0">Data Collection &amp; Analysis</h4>
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We assist in collecting, analyzing, and verifying data to ensure accuracy and reliability in reported information.</p>
                </div>
                <div className="bg-white border border-ink/5 rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                  <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-xs font-bold mb-2">4</div>
                  <h4 className="text-[16px] font-bold text-ink m-0">Materiality Assessments</h4>
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We conduct materiality assessments to prioritize ESG reporting based on key issues and stakeholder concerns.</p>
                </div>
                <div className="bg-white border border-ink/5 rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                  <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-xs font-bold mb-2">5</div>
                  <h4 className="text-[16px] font-bold text-ink m-0">Stakeholder Engagement</h4>
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We facilitate engagement activities reaching out to a wide range of different key stakeholders.</p>
                </div>
                <div className="bg-white border border-ink/5 rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
                  <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-xs font-bold mb-2">6</div>
                  <h4 className="text-[16px] font-bold text-ink m-0">Report Drafting &amp; Review</h4>
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0">We draft and review ESG reports to ensure clarity, transparency, and compliance with relevant standards and regulations.</p>
                </div>
              </div>

              <div className="flex flex-col p-8 bg-[#FAFBFB] border border-ink/5 rounded-2xl gap-6">
                <h3 className="text-[20px] font-bold text-ink m-0">The Core Pillars of ESG</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[16px] font-bold text-ink m-0 pb-2 border-b border-ink/10">Environmental Pillar</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">Focuses on how a company performs as a steward of environmental responsibility.</p>
                    <ul className="list-disc pl-4 flex flex-col gap-1 text-[13px] text-ink-soft">
                      <li>Carbon emissions and climate change</li>
                      <li>Energy efficiency and renewables</li>
                      <li>Waste management &amp; pollution</li>
                      <li>Water usage and conservation</li>
                      <li>Biodiversity &amp; habitat protection</li>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[16px] font-bold text-ink m-0 pb-2 border-b border-ink/10">Social Pillar</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">Focuses on how a company manages relationships with employees, suppliers, customers, and communities.</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[16px] font-bold text-ink m-0 pb-2 border-b border-ink/10">Governance Pillar</h4>
                    <p className="text-[13px] leading-[1.6] text-ink-soft m-0">Focuses on a company's leadership, executive pay, audits, internal controls, and shareholder rights.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Section>

      {/* Environmental Assessments */}
      <Section theme="muted" id="assessments" className="py-16">
        <div className="w-full flex flex-col gap-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
            <div className="flex flex-col gap-6 sticky top-24">
              <div className="text-[12px] font-bold text-ink/60 font-mono tracking-widest uppercase">02.2 — Impact &amp; Compliance</div>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">Environmental Assessments</span>
              </Typography>
              <p className="text-[16px] leading-[1.6] text-ink-soft m-0">
                <span className="en block">Environmental and social impact assessments and management plans for projects across sectors.</span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col p-8 bg-white border border-ink/5 rounded-2xl gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                <h4 className="text-[16px] font-bold text-ink m-0">ESIA / ESMP Development</h4>
                <p className="text-[14px] leading-[1.6] text-ink-soft m-0">Development of comprehensive Environmental and Social Impact Assessments and Management Plans.</p>
              </div>
              <div className="flex flex-col p-8 bg-white border border-ink/5 rounded-2xl gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                <h4 className="text-[16px] font-bold text-ink m-0">Stakeholder Engagement</h4>
                <p className="text-[14px] leading-[1.6] text-ink-soft m-0">Design and execution of stakeholder engagement plans tailored to community contexts.</p>
              </div>
              <div className="flex flex-col p-8 bg-white border border-ink/5 rounded-2xl gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                <h4 className="text-[16px] font-bold text-ink m-0">Safeguards Compliance</h4>
                <p className="text-[14px] leading-[1.6] text-ink-soft m-0">Monitoring and ensuring ongoing compliance with environmental safeguards and regulations.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <section className="relative w-full py-[120px] flex items-center justify-center bg-ink text-white overflow-hidden text-center">
        <div className="w-full max-w-[800px] mx-auto relative z-20 flex flex-col items-center gap-7">
          <Typography variant="eyebrow" className="text-white/80 m-0 w-full text-center flex justify-center">
            <span className="en">Need an assessment or report?</span>
          </Typography>
          <Typography variant="h2" className="text-white m-0 text-center">
            <span className="en block">Let us guide you through the process.</span>
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
