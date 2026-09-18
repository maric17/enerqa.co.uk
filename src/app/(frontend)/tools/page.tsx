import React from 'react';
import Link from 'next/link';
import { ArrowRight, Settings, Sun, Factory, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default function ToolsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-paper)] pt-[70px]">
      
      {/* T01 Our Tools Intro */}
      <section className="py-20 bg-[var(--color-dark)] text-white border-b border-gray-800">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">Digital Tools and Calculators</h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              Enerqa develops proprietary digital platforms and calculators to support project development, ESG strategy and technical decision-making. These tools provide rapid preliminary assessments, diagnostic insights and structured data to inform the development lifecycle.
            </p>
          </div>
        </Container>
      </section>

      {/* T02 ESG Readiness Tool */}
      <section className="py-24 bg-white border-b border-gray-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-3xl font-bold text-[var(--color-dark)]">ESG Readiness Diagnostic</h2>
              </div>
              <div className="prose prose-lg text-gray-600 max-w-none">
                <p className="mb-6 leading-relaxed">
                  Navigating the expanding landscape of mandatory sustainability reporting (including CSRD, IFRS S1/S2 and regional taxonomies) requires a clear understanding of current capabilities and data gaps.
                </p>
                <p className="mb-8 leading-relaxed">
                  The ESG Readiness Diagnostic provides a structured assessment of your organisation's reporting maturity, governance structures and data availability against principal international standards. The output helps prioritize actions before engaging in formal assurance or compliance exercises.
                </p>
                <Link href="/tools/esg-readiness" className="inline-flex items-center gap-2 bg-[var(--color-secondary)] text-white font-bold py-3 px-6 rounded-full hover:bg-[var(--color-secondary-dark)] transition-colors">
                  Access ESG Readiness Tool <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2 bg-[var(--color-paper-alt)] rounded-2xl p-8 border border-gray-100 flex flex-col justify-center h-full min-h-[300px] relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative z-10 space-y-4">
                {/* Mock UI Element */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                  <span className="font-medium text-[var(--color-dark)]">Governance &amp; Strategy</span>
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold">Developing</span>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                  <span className="font-medium text-[var(--color-dark)]">Metrics &amp; Targets (GHG)</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded font-bold">Advanced</span>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                  <span className="font-medium text-[var(--color-dark)]">Value Chain Assessment</span>
                  <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded font-bold">Initial</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* T03 easySOLAR */}
      <section className="py-24 bg-[var(--color-paper-alt)] border-b border-gray-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 flex flex-col justify-center h-full min-h-[300px] relative overflow-hidden shadow-sm">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />
              <div className="relative z-10">
                {/* Mock UI Element */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Estimated System Size</div>
                      <div className="text-2xl font-bold text-[var(--color-dark)]">250 kWp</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Annual Generation</div>
                      <div className="text-xl font-bold text-[var(--color-primary)]">380 MWh</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Payback Period</div>
                      <div className="text-xl font-bold text-[var(--color-dark)]">4.2 Years</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">IRR (20yr)</div>
                      <div className="text-xl font-bold text-green-600">18.5%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <h2 className="text-3xl font-bold text-[var(--color-dark)]">easySOLAR</h2>
              </div>
              <div className="prose prose-lg text-gray-600 max-w-none">
                <p className="mb-6 leading-relaxed">
                  Assessing the commercial and technical viability of commercial and industrial (C&amp;I) rooftop solar requires rapid processing of load profiles, solar resource data and local tariff structures.
                </p>
                <p className="mb-8 leading-relaxed">
                  easySOLAR is a preliminary sizing and financial calculator for distributed generation and battery energy storage systems (BESS). It helps facility owners and developers establish an initial business case, optimize system sizing for self-consumption, and compare financing options before committing to detailed engineering design.
                </p>
                <Link href="/tools/easysolar" className="inline-flex items-center gap-2 bg-[var(--color-dark)] text-white font-bold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors">
                  Try easySOLAR Calculator <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* T04 GreenScale Pro */}
      <section className="py-24 bg-white border-b border-gray-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                  <Factory className="w-5 h-5" />
                </div>
                <h2 className="text-3xl font-bold text-[var(--color-dark)]">GreenScale Pro</h2>
              </div>
              <div className="prose prose-lg text-gray-600 max-w-none">
                <p className="mb-6 leading-relaxed">
                  Industrial decarbonisation often involves complex trade-offs between energy efficiency, electrification, alternative fuels (such as green hydrogen) and carbon capture.
                </p>
                <p className="mb-8 leading-relaxed">
                  GreenScale Pro is a scenario-modelling platform designed for industrial facility operators and project developers. It allows users to compare different abatement pathways based on their marginal abatement cost, technology readiness, and impact on production economics over a defined transition period.
                </p>
                <Link href="/contact?intent=greenscale" className="inline-flex items-center gap-2 bg-[var(--color-secondary)] text-white font-bold py-3 px-6 rounded-full hover:bg-[var(--color-secondary-dark)] transition-colors">
                  Request GreenScale Demo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2 bg-[var(--color-dark)] rounded-2xl p-8 border border-gray-800 flex flex-col justify-center h-full min-h-[300px] relative overflow-hidden shadow-sm text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative z-10">
                {/* Mock UI Element */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Energy Efficiency</span>
                      <span className="text-[var(--color-primary)]">-15% Emissions</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-[var(--color-primary)] h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Electrification (Heat Pumps)</span>
                      <span className="text-[var(--color-primary)]">-40% Emissions</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-[var(--color-primary)] h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Green Hydrogen Substitution</span>
                      <span className="text-[var(--color-primary)]">-35% Emissions</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-[var(--color-primary)] h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Custom Tool Development CTA */}
      <section className="py-20 bg-[var(--color-dark)] text-white mt-auto">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Custom Tool Development</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              If your project or organisation requires a bespoke data model, monitoring platform or assessment tool, our digital and technical teams can develop a tailored solution.
            </p>
            <Link href="/contact?intent=custom-tool" className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-[var(--color-dark)] font-bold py-4 px-8 rounded-full hover:bg-[var(--color-primary-dark)] transition-colors">
              Discuss Custom Development <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </Container>
      </section>

    </div>
  );
}
