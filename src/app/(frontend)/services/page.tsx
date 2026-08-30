import React from 'react';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

export default function ServicesPage() {
  return (
    <>
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0">
          enerQA / reel 03
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          SCENE 03 — SERVICES
        </div>
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-[url('/assets/images/port.jpg')]"></div>
        <div className="hero-insights-overlay z-10 opacity-80"></div>
        
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> / <span className="en text-white">Domains &amp; Services</span><span className="ar text-white">المجالات والخدمات</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">Four domains, tailored to your stage.</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">أربعة مجالات، مصمّمة لمرحلتك.</span>
          </Typography>
        </Container>
      </section>

      {/* Domain 01: Climate Change */}
      <Section theme="muted">
        <div className="flex flex-col gap-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-5">
              <Typography variant="eyebrow" className="mb-0 text-ink-muted">
                <span className="en">01 — Climate Change</span><span className="ar ml-2">01 — تغيّر المناخ</span>
              </Typography>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">Climate Change</span><span className="ar block text-[0.8em] mt-3 text-ink/90">تغيّر المناخ</span>
              </Typography>
              <p className="text-[17px] md:text-[19px] leading-[1.6] text-ink font-light m-0 mt-3">
                <span className="en block">Solutions for climate project financing, strategies and action plans to mitigate and adapt to climate effects, and transparent climate reporting.</span>
                <span className="ar block mt-4">حلول لتمويل مشاريع المناخ، واستراتيجيات وخطط عمل للتخفيف والتكيف مع آثار تغيّر المناخ، وإبلاغ مناخي شفاف.</span>
              </p>
              <div className="mt-4">
                <Button href="/services/climate-change" variant="primary" className="w-fit">
                  <span className="en">Explore Climate Change</span><span className="ar ml-2">اكتشف المجال</span>
                </Button>
              </div>
            </div>
            <div className="w-full min-h-[300px] rounded-[18px] bg-line bg-cover bg-center overflow-hidden bg-[url('/assets/images/hero-bg.jpg')]"></div>
          </div>
        </div>
      </Section>
      
      {/* Domain 02: Environment */}
      <Section theme="light">
        <div className="flex flex-col gap-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-5 md:order-2">
              <Typography variant="eyebrow" className="mb-0 text-ink-muted">
                <span className="en">02 — Environment</span><span className="ar ml-2">02 — البيئة</span>
              </Typography>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">Environment &amp; ESG</span><span className="ar block text-[0.8em] mt-3 text-ink/90">البيئة</span>
              </Typography>
              <p className="text-[17px] md:text-[19px] leading-[1.6] text-ink font-light m-0 mt-3">
                <span className="en block">Environmental assessments, management plans, and ESG (Environmental, Social &amp; Governance) reporting.</span>
                <span className="ar block mt-4">تقييمات بيئية وخطط إدارة وتقارير الحوكمة البيئية والاجتماعية (ESG).</span>
              </p>
              <div className="mt-4">
                <Button href="/services/environment-esg" variant="primary" className="w-fit">
                  <span className="en">Explore Environment &amp; ESG</span><span className="ar ml-2">اكتشف المجال</span>
                </Button>
              </div>
            </div>
            <div className="w-full min-h-[300px] rounded-[18px] bg-line bg-cover bg-center overflow-hidden bg-[url('/assets/images/port.jpg')] md:order-1"></div>
          </div>
        </div>
      </Section>
      
      {/* Domain 03: Energy */}
      <Section theme="muted">
        <div className="flex flex-col gap-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-5">
              <Typography variant="eyebrow" className="mb-0 text-ink-muted">
                <span className="en">03 — Energy</span><span className="ar ml-2">03 — الطاقة</span>
              </Typography>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">Energy</span><span className="ar block text-[0.8em] mt-3 text-ink/90">الطاقة</span>
              </Typography>
              <p className="text-[17px] md:text-[19px] leading-[1.6] text-ink font-light m-0 mt-3">
                <span className="en block">Management of existing consumption, development of renewable energy projects, and energy modelling &amp; policy analysis.</span>
                <span className="ar block mt-4">إدارة الاستهلاك القائم، وتطوير مشاريع الطاقة المتجددة، ونمذجة الطاقة وتحليل السياسات.</span>
              </p>
              <div className="mt-4">
                <Button href="/services/energy" variant="primary" className="w-fit">
                  <span className="en">Explore Energy</span><span className="ar ml-2">اكتشف المجال</span>
                </Button>
              </div>
            </div>
            <div className="w-full min-h-[300px] rounded-[18px] bg-line-dark bg-cover bg-center overflow-hidden bg-[url('/assets/images/solar.jpg')]"></div>
          </div>
        </div>
      </Section>

      {/* Domain 04: Business Solutions */}
      <Section theme="light">
        <div className="flex flex-col gap-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-5 md:order-2">
              <Typography variant="eyebrow" className="mb-0 text-ink-muted">
                <span className="en">04 — Business Solutions</span><span className="ar ml-2">04 — حلول الأعمال</span>
              </Typography>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">Business Solutions</span><span className="ar block text-[0.8em] mt-3 text-ink/90">حلول الأعمال</span>
              </Typography>
              <p className="text-[17px] md:text-[19px] leading-[1.6] text-ink font-light m-0 mt-3">
                <span className="en block">Business models and feasibility studies, green credit lines, and supporting studies tailored to each client's needs.</span>
                <span className="ar block mt-4">نماذج أعمال ودراسات جدوى، وخطوط ائتمان أخضر، ودراسات داعمة مصممة لاحتياجات كل عميل.</span>
              </p>
              <div className="mt-4">
                <Button href="/services/business-solutions" variant="primary" className="w-fit">
                  <span className="en">Explore Business Solutions</span><span className="ar ml-2">اكتشف المجال</span>
                </Button>
              </div>
            </div>
            <div className="w-full min-h-[300px] rounded-[18px] bg-line bg-cover bg-center overflow-hidden bg-[url('/assets/images/gas-energy.jpg')] md:order-1"></div>
          </div>
        </div>
      </Section>

      <section className="relative w-full py-[120px] flex items-center justify-center bg-ink text-white overflow-hidden text-center">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-left">
          <span className="en block">enerQA / reel 03</span><span className="ar block mt-1">إنيرقا / الحلقة 03</span>
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          END SCENE
        </div>
        <div className="w-full max-w-[800px] mx-auto relative z-20 flex flex-col items-center gap-7">
          <Typography variant="eyebrow" className="text-white/60 m-0 w-full text-center flex justify-center">
            <span className="en">Not sure where to start?</span><span className="ar ml-2">لست متأكدًا من أين تبدأ؟</span>
          </Typography>
          <Typography variant="h2" className="text-white m-0 text-center">
            <span className="en block">Describe the challenge — we'll route it to the right domain lead.</span>
            <span className="ar block mt-3 text-white/90">صف التحدي — وسنوجّهه إلى المتخصص المناسب.</span>
          </Typography>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Button href="/contact" variant="primary" className="bg-white !text-ink hover:bg-white/90">
              <span className="en">Start an inquiry</span><span className="ar ml-2">ابدأ استفسارًا</span>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
