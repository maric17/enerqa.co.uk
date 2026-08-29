import React from 'react';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function AboutPage() {
  return (
    <>
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0">
          enerQA / reel 02
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          SCENE 02 — ABOUT
        </div>
        
        {/* Cinematic Parallax Background */}
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-[url('/assets/images/about_team.jpg')] transform scale-105"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink via-ink/80 to-transparent"></div>
        
        <Container className="w-full relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12 h-full justify-center">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-[#8B1538] mb-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
            <Link href="/" className="text-white/80 hover:text-white transition-colors no-underline">Home</Link> / <span className="en text-white">About</span><span className="ar text-white ml-1">من نحن</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px] drop-shadow-2xl">
            <span className="en block">Built on field experience, run on evidence.</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">مبنيّون على خبرة ميدانية، ونعمل بالأدلة.</span>
          </Typography>
        </Container>
      </section>

      {/* 1. Company Overview / Mission */}
      <Section id="overview" theme="light" className="py-[120px] relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8B1538]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="flex flex-col gap-16 w-full relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-[2px] bg-[#8B1538]"></span>
                <Typography variant="eyebrow" className="mb-0 text-[#8B1538] font-extrabold tracking-widest">
                  Our Mission
                </Typography>
              </div>
              <Typography variant="h2" className="text-ink m-0 leading-tight">
                <span className="en block">A collective of practitioners, not a slide deck.</span>
                <span className="ar block text-[0.8em] mt-3 text-ink/90">مجموعة من الممارسين، لا مجرد عرض تقديمي.</span>
              </Typography>
              <p className="text-[18px] md:text-[20px] leading-[1.7] text-ink-soft font-light m-0">
                <span className="en block">Building on the professional heritage of its founders and anchored by a diverse group of experienced professionals committed to environmental responsibility, enerQA sees itself as a driving force in shaping a sustainable future.</span>
                <span className="ar block mt-4 text-right">بالاستناد إلى الإرث المهني لمؤسسيها ومجموعة متنوعة من المتخصصين ذوي الخبرة الملتزمين بالمسؤولية البيئية، ترى إنيرقا نفسها قوة دافعة في تشكيل مستقبل مستدام.</span>
              </p>
              
              <div className="bg-white/60 backdrop-blur-xl border border-ink/5 p-8 rounded-[24px] shadow-sm mt-4">
                <p className="text-[16px] leading-[1.6] text-ink-soft font-medium italic m-0">
                  <span className="en block">"To globally avail knowledge and good practices in climate change, energy, environmental &amp; social safeguards and related business solutions, transforming data into knowledge accessible to all."</span>
                </p>
              </div>
            </div>
            
            <div className="w-full aspect-square md:aspect-[4/5] rounded-[32px] overflow-hidden relative shadow-2xl group">
              <div className="absolute inset-0 bg-[url('/images/about_practitioners.jpg')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent"></div>
            </div>
          </div>
        </div>
      </Section>

      {/* 2. Approach / Methodology (Bento Box Redesign) */}
      <Section id="approach" theme="muted" className="py-[120px] relative overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/images/gas-energy.jpg')] bg-cover bg-center opacity-[0.08] mix-blend-multiply grayscale"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#fbfafa]/90 via-white/80 to-[#fbfafa]/95 backdrop-blur-[2px]"></div>
        </div>

        <div className="w-full flex flex-col gap-16 relative z-10">
          <div className="flex flex-col items-center text-center max-w-[700px] mx-auto gap-4">
            <Typography variant="eyebrow" className="mb-0 text-[#8B1538] font-extrabold tracking-widest">
              Methodology
            </Typography>
            <Typography variant="h2" className="text-ink m-0">
              <span className="en block">Our Core Approach</span>
            </Typography>
          </div>
          
          {/* Bento Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            {/* Bento Item 1 */}
            <div className="md:col-span-2 bg-ink rounded-[32px] p-10 flex flex-col justify-end relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-lg border border-white/10">
              <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/95 to-[#8B1538]/80 z-0"></div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-full bg-[#8B1538]/20 flex items-center justify-center text-[#8B1538] mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <Typography variant="h3" className="text-white m-0">Cross-Disciplinary Bench</Typography>
                <p className="text-[15px] leading-[1.5] text-white/70 m-0 max-w-[400px]">
                  Experienced professionals spanning engineering, climate science, finance and environmental safeguards working as a single unified unit.
                </p>
              </div>
            </div>

            {/* Bento Item 2 */}
            <div className="bg-white rounded-[32px] p-10 flex flex-col justify-end relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-ink/5">
              <div className="absolute inset-0 bg-[url('/images/solar.jpg')] bg-cover bg-center opacity-10 mix-blend-luminosity grayscale group-hover:scale-105 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-white/80 z-0"></div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-full bg-ink/5 flex items-center justify-center text-ink mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <Typography variant="h4" className="text-ink m-0">Flexible Engagements</Typography>
                <p className="text-[14px] leading-[1.5] text-ink-soft m-0">
                  Scoped solutions that flex to the client's exact stage, from initial feasibility to full-scale delivery.
                </p>
              </div>
            </div>

            {/* Bento Item 3 */}
            <div className="bg-white rounded-[32px] p-10 flex flex-col justify-end relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-ink/5">
              <div className="absolute inset-0 bg-[url('/images/ecorisk.png')] bg-cover bg-center opacity-10 mix-blend-luminosity grayscale group-hover:scale-105 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-white/95 to-white/80 z-0"></div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-full bg-ink/5 flex items-center justify-center text-ink mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <Typography variant="h4" className="text-ink m-0">Participatory Design</Typography>
                <p className="text-[14px] leading-[1.5] text-ink-soft m-0">
                  Active stakeholder engagement that keeps communities and regulators inside the entire process.
                </p>
              </div>
            </div>

            {/* Bento Item 4 */}
            <div className="md:col-span-2 bg-[#8B1538] rounded-[32px] p-10 flex flex-col justify-end relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-lg border border-white/20">
              <div className="absolute inset-0 bg-[url('/images/gas-energy.jpg')] bg-cover bg-center opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-[#8B1538]/95 to-[#ab1f49]/80 z-0"></div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white mb-4 backdrop-blur-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </div>
                <Typography variant="h3" className="text-white m-0">Continuous Innovation</Typography>
                <p className="text-[15px] leading-[1.5] text-white/80 m-0 max-w-[400px]">
                  Unwavering focus on research and development, constantly investing in cutting-edge methodologies and tools far ahead of client needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 3. Enerqa's Network */}
      <Section id="network" theme="light" className="py-0 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          <div className="bg-ink flex flex-col justify-center p-12 md:p-24 relative overflow-hidden">
            <div className="relative z-10 flex flex-col gap-6">
              <Typography variant="eyebrow" className="mb-0 text-[#8B1538] font-extrabold tracking-widest">
                Our Reach
              </Typography>
              <Typography variant="h2" className="text-white m-0">
                <span className="en block">A Global Network of Collaborative Innovation.</span>
              </Typography>
              <p className="text-[17px] leading-[1.7] text-white/70 m-0 mt-4">
                <span className="en block">We leverage a robust ecosystem of specialized partners—from deep-tech software providers to academic research institutes. This ensures our solutions are not only state-of-the-art, but deeply integrated and locally adapted for global impact.</span>
              </p>
            </div>
          </div>
          <div className="relative min-h-[400px] lg:min-h-full w-full bg-[#fbfafa] flex flex-col justify-center overflow-hidden gap-12 py-12 border-l border-ink/5">
            <style>{`
              @keyframes marquee-horizontal {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee-horizontal {
                display: flex;
                width: 200%;
                animation: marquee-horizontal 25s linear infinite;
              }
              .animate-marquee-horizontal.reverse {
                animation-direction: reverse;
                animation-duration: 30s;
              }
            `}</style>

            <div className="w-full overflow-hidden">
              <div className="animate-marquee-horizontal">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex-1 flex justify-around items-center gap-8 px-4">
                    <img src="/images/easysolar.png" className="h-10 md:h-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer object-contain" alt="Partner Logo" />
                    <img src="/images/ecorisk.png" className="h-10 md:h-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer object-contain" alt="Partner Logo" />
                    <img src="/images/ghg365.png" className="h-10 md:h-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer object-contain" alt="Partner Logo" />
                    <img src="/images/greenscale.png" className="h-10 md:h-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer object-contain" alt="Partner Logo" />
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full overflow-hidden">
              <div className="animate-marquee-horizontal reverse">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex-1 flex justify-around items-center gap-8 px-4">
                    <img src="/images/esg-logo.webp" className="h-10 md:h-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer object-contain" alt="Partner Logo" />
                    <img src="/images/color-logo.png" className="h-10 md:h-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer object-contain" alt="Partner Logo" />
                    <img src="/images/header-logo.webp" className="h-10 md:h-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer object-contain" alt="Partner Logo" />
                    <img src="/images/logo-color-old.png" className="h-10 md:h-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer object-contain" alt="Partner Logo" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </Section>

      {/* 4. Offices & Branches */}
      <Section id="offices" theme="muted" className="py-[120px] relative">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/assets/images/about_hq.jpg')] bg-cover bg-center bg-fixed opacity-[0.15] mix-blend-luminosity grayscale"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#fbfafa]/95 via-white/90 to-white/95 backdrop-blur-sm"></div>
        </div>

        <div className="w-full flex flex-col gap-16 relative z-10">
          <div className="flex flex-col items-center text-center max-w-[700px] mx-auto gap-4">
            <Typography variant="eyebrow" className="mb-0 text-[#8B1538] font-extrabold tracking-widest">
              Global Presence
            </Typography>
            <Typography variant="h2" className="text-ink m-0">
              <span className="en block">Offices & Branches</span>
            </Typography>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Office 1 */}
            <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[32px] border border-white flex flex-col gap-5 shadow-[0_12px_40px_rgba(139,21,56,0.06)] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-full bg-[#8B1538] flex items-center justify-center text-white mb-2 shadow-lg shadow-[#8B1538]/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <Typography variant="h3" className="text-ink m-0">Doha HQ</Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 font-medium">
                <span className="en block">Tornado Tower, 22nd Floor<br />West Bay, Doha, Qatar</span>
                <span className="ar block mt-2 text-right" dir="rtl">برج تورنادو، الطابق 22<br />الخليج الغربي، الدوحة</span>
              </p>
              <Link href="/contact" className="text-[#8B1538] font-bold text-[13px] uppercase tracking-widest mt-auto inline-flex items-center gap-2 hover:gap-3 transition-all pt-6">
                <span className="en">Contact Doha</span> →
              </Link>
            </div>
            
            {/* Office 2 */}
            <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[32px] border border-white flex flex-col gap-5 shadow-[0_12px_40px_rgba(139,21,56,0.06)] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-full bg-ink flex items-center justify-center text-white mb-2 shadow-lg shadow-ink/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <Typography variant="h3" className="text-ink m-0">London</Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 font-medium">
                <span className="en block">100 Bishopsgate<br />London, EC2N 4AG, UK</span>
                <span className="ar block mt-2 text-right" dir="rtl">100 بيشوبسغيت<br />لندن، المملكة المتحدة</span>
              </p>
              <Link href="/contact" className="text-[#8B1538] font-bold text-[13px] uppercase tracking-widest mt-auto inline-flex items-center gap-2 hover:gap-3 transition-all pt-6">
                <span className="en">Contact London</span> →
              </Link>
            </div>

            {/* Office 3 */}
            <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[32px] border border-white flex flex-col gap-5 shadow-[0_12px_40px_rgba(139,21,56,0.06)] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-full bg-ink flex items-center justify-center text-white mb-2 shadow-lg shadow-ink/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <Typography variant="h3" className="text-ink m-0">Dubai</Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 font-medium">
                <span className="en block">Boulevard Plaza, Tower 1<br />Downtown Dubai, UAE</span>
                <span className="ar block mt-2 text-right" dir="rtl">بوليفارد بلازا، البرج 1<br />وسط مدينة دبي، الإمارات</span>
              </p>
              <Link href="/contact" className="text-[#8B1538] font-bold text-[13px] uppercase tracking-widest mt-auto inline-flex items-center gap-2 hover:gap-3 transition-all pt-6">
                <span className="en">Contact Dubai</span> →
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer CTA */}
      <section className="relative w-full py-[140px] flex items-center justify-center bg-ink text-white overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-0"></div>
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B1538] m-0 text-left">
          <span className="en block">enerQA / reel 02</span><span className="ar block mt-1">إنيرقا / الحلقة 02</span>
        </div>
        <Container className="w-full relative z-20 flex flex-col items-center gap-7">
          <Typography variant="eyebrow" className="text-[#8B1538] font-extrabold tracking-widest m-0 w-full text-center flex justify-center">
            Governance
          </Typography>
          <Typography variant="h1" className="text-white m-0 text-center max-w-[800px]">
            <span className="en block leading-tight">Independent by design,<br />accountable by practice.</span>
          </Typography>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Button href="/team" variant="primary" className="!bg-[#8B1538] !border-[#8B1538] hover:!bg-white hover:!text-[#8B1538] !px-8 !py-4 shadow-xl shadow-[#8B1538]/20">
              <span className="en font-bold text-[14px]">Meet the experts</span>
            </Button>
            <Button href="/contact" variant="outline" className="hover:!bg-white/10 !px-8 !py-4">
              <span className="en font-bold text-[14px]">Contact us</span>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
