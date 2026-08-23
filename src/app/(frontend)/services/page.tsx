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
            </div>
            <div className="w-full min-h-[300px] rounded-[18px] bg-line bg-cover bg-center overflow-hidden bg-[url('/assets/images/hero-bg.jpg')]"></div>
          </div>
        </div>
      </Section>
      
      <Section theme="light" id="climate" className="pt-0 md:pt-0">
        <div className="w-full flex flex-col gap-12 mt-12 md:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-start py-12 border-b border-ink/10">
            <div className="text-[24px] font-bold text-ink/20 font-mono tracking-tighter w-16">01.1</div>
            <div className="flex flex-col gap-4">
              <Typography variant="h3" className="text-ink m-0">
                <span className="en block">Climate Finance</span><span className="ar block mt-1">تمويل المناخ</span>
              </Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 max-w-[600px]">
                <span className="en block">Readiness support for accessing climate funds and structuring bankable, fundable proposals.</span>
                <span className="ar block mt-2">دعم الجاهزية للوصول إلى صناديق المناخ وهيكلة مقترحات قابلة للتمويل.</span>
              </p>
              <ul className="list-disc pl-5 mt-4 flex flex-col gap-2 text-[14px] text-ink max-w-[600px]">
                <li><span className="en">Fund readiness diagnostics (GCF, Adaptation Fund, GEF)</span><span className="ar block text-[0.9em] text-ink-soft">تشخيص الجاهزية للصناديق (GCF وGEF وصندوق التكيف)</span></li>
                <li><span className="en">Concept note &amp; proposal development</span><span className="ar block text-[0.9em] text-ink-soft">إعداد مذكرات المفاهيم والمقترحات</span></li>
                <li><span className="en">Financial structuring &amp; blended finance advisory</span><span className="ar block text-[0.9em] text-ink-soft">الهيكلة المالية واستشارات التمويل المُدمج</span></li>
              </ul>
            </div>
            <div className="bg-[#FAFBFB] border border-ink/10 rounded-[12px] p-6 w-full lg:w-[320px] flex flex-col gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <h5 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink m-0"><span className="en">Ask about this service</span><span className="ar ml-2">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name / الاسم الكامل" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <input type="email" placeholder="Email / البريد الإلكتروني" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <textarea placeholder="Brief context / نبذة عن السياق" rows={3} className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors resize-none"></textarea>
              <Button variant="primary" className="w-full justify-center">
                <span className="en">Send inquiry</span><span className="ar ml-2">إرسال الاستفسار</span>
              </Button>
            </div>
          </div>
          <div id="climate-finance"></div>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-start py-12 border-b border-ink/10">
            <div className="text-[24px] font-bold text-ink/20 font-mono tracking-tighter w-16">01.2</div>
            <div className="flex flex-col gap-4">
              <Typography variant="h3" className="text-ink m-0">
                <span className="en block">Climate Action — Mitigation &amp; Adaptation</span><span className="ar block mt-1">العمل المناخي — التخفيف والتكيف</span>
              </Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 max-w-[600px]">
                <span className="en block">Strategy and action-plan design that translates national commitments into implementable projects.</span>
                <span className="ar block mt-2">تصميم استراتيجيات وخطط عمل تُترجم الالتزامات الوطنية إلى مشاريع قابلة للتنفيذ.</span>
              </p>
              <ul className="list-disc pl-5 mt-4 flex flex-col gap-2 text-[14px] text-ink max-w-[600px]">
                <li><span className="en">NDC &amp; NAP technical support</span><span className="ar block text-[0.9em] text-ink-soft">دعم فني للمساهمات المحددة وطنيًا وخطط التكيف الوطنية</span></li>
                <li><span className="en">Vulnerability &amp; risk assessments</span><span className="ar block text-[0.9em] text-ink-soft">تقييمات الهشاشة والمخاطر</span></li>
                <li><span className="en">Sector mitigation pathways</span><span className="ar block text-[0.9em] text-ink-soft">مسارات تخفيف قطاعية</span></li>
              </ul>
            </div>
            <div className="bg-[#FAFBFB] border border-ink/10 rounded-[12px] p-6 w-full lg:w-[320px] flex flex-col gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <h5 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink m-0"><span className="en">Ask about this service</span><span className="ar ml-2">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name / الاسم الكامل" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <input type="email" placeholder="Email / البريد الإلكتروني" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <textarea placeholder="Brief context / نبذة عن السياق" rows={3} className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors resize-none"></textarea>
              <Button variant="primary" className="w-full justify-center">
                <span className="en">Send inquiry</span><span className="ar ml-2">إرسال الاستفسار</span>
              </Button>
            </div>
          </div>
          <div id="climate-action"></div>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-start py-12 border-b border-ink/10">
            <div className="text-[24px] font-bold text-ink/20 font-mono tracking-tighter w-16">01.3</div>
            <div className="flex flex-col gap-4">
              <Typography variant="h3" className="text-ink m-0">
                <span className="en block">Transparency &amp; Reporting</span><span className="ar block mt-1">الشفافية والإبلاغ</span>
              </Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 max-w-[600px]">
                <span className="en block">MRV systems and donor-grade reporting that hold up under external review.</span>
                <span className="ar block mt-2">أنظمة قياس وإبلاغ وتحقق (MRV) وتقارير بمعايير المانحين تصمد أمام المراجعة الخارجية.</span>
              </p>
              <ul className="list-disc pl-5 mt-4 flex flex-col gap-2 text-[14px] text-ink max-w-[600px]">
                <li><span className="en">Biennial transparency reports (BTRs)</span><span className="ar block text-[0.9em] text-ink-soft">تقارير الشفافية الثنائية</span></li>
                <li><span className="en">MRV system design</span><span className="ar block text-[0.9em] text-ink-soft">تصميم أنظمة القياس والإبلاغ والتحقق</span></li>
                <li><span className="en">Donor &amp; regulator reporting packages</span><span className="ar block text-[0.9em] text-ink-soft">حزم إبلاغ للمانحين والجهات الرقابية</span></li>
              </ul>
            </div>
            <div className="bg-[#FAFBFB] border border-ink/10 rounded-[12px] p-6 w-full lg:w-[320px] flex flex-col gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <h5 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink m-0"><span className="en">Ask about this service</span><span className="ar ml-2">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name / الاسم الكامل" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <input type="email" placeholder="Email / البريد الإلكتروني" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <textarea placeholder="Brief context / نبذة عن السياق" rows={3} className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors resize-none"></textarea>
              <Button variant="primary" className="w-full justify-center">
                <span className="en">Send inquiry</span><span className="ar ml-2">إرسال الاستفسار</span>
              </Button>
            </div>
          </div>
          <div id="transparency"></div>
        </div>
      </Section>

      {/* Domain 02: Environment */}
      <Section theme="muted">
        <div className="flex flex-col gap-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-5">
              <Typography variant="eyebrow" className="mb-0 text-ink-muted">
                <span className="en">02 — Environment</span><span className="ar ml-2">02 — البيئة</span>
              </Typography>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">Environment</span><span className="ar block text-[0.8em] mt-3 text-ink/90">البيئة</span>
              </Typography>
              <p className="text-[17px] md:text-[19px] leading-[1.6] text-ink font-light m-0 mt-3">
                <span className="en block">Environmental assessments, management plans, and ESG (Environmental, Social &amp; Governance) reporting.</span>
                <span className="ar block mt-4">تقييمات بيئية وخطط إدارة وتقارير الحوكمة البيئية والاجتماعية (ESG).</span>
              </p>
            </div>
            <div className="w-full min-h-[300px] rounded-[18px] bg-line bg-cover bg-center overflow-hidden bg-[url('/assets/images/port.jpg')]"></div>
          </div>
        </div>
      </Section>
      
      <Section theme="light" id="environment" className="pt-0 md:pt-0">
        <div className="w-full flex flex-col gap-12 mt-12 md:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-start py-12 border-b border-ink/10">
            <div className="text-[24px] font-bold text-ink/20 font-mono tracking-tighter w-16">02.1</div>
            <div className="flex flex-col gap-4">
              <Typography variant="h3" className="text-ink m-0">
                <span className="en block">ESG Reporting</span><span className="ar block mt-1">تقارير الحوكمة (ESG)</span>
              </Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 max-w-[600px]">
                <span className="en block">Readiness assessment and reporting frameworks aligned to investor and regulatory expectations.</span>
                <span className="ar block mt-2">تقييم الجاهزية وأطر إبلاغ متوافقة مع توقعات المستثمرين والجهات الرقابية.</span>
              </p>
              <ul className="list-disc pl-5 mt-4 flex flex-col gap-2 text-[14px] text-ink max-w-[600px]">
                <li><span className="en">ESG readiness diagnostics &amp; scoring</span><span className="ar block text-[0.9em] text-ink-soft">تشخيص وتقييم جاهزية الحوكمة البيئية والاجتماعية</span></li>
                <li><span className="en">Materiality assessments</span><span className="ar block text-[0.9em] text-ink-soft">تقييمات الأهمية النسبية</span></li>
                <li><span className="en">Disclosure &amp; reporting framework design</span><span className="ar block text-[0.9em] text-ink-soft">تصميم أطر الإفصاح والإبلاغ</span></li>
              </ul>
            </div>
            <div className="bg-[#FAFBFB] border border-ink/10 rounded-[12px] p-6 w-full lg:w-[320px] flex flex-col gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <h5 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink m-0"><span className="en">Ask about this service</span><span className="ar ml-2">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name / الاسم الكامل" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <input type="email" placeholder="Email / البريد الإلكتروني" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <textarea placeholder="Brief context / نبذة عن السياق" rows={3} className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors resize-none"></textarea>
              <Button variant="primary" className="w-full justify-center">
                <span className="en">Send inquiry</span><span className="ar ml-2">إرسال الاستفسار</span>
              </Button>
            </div>
          </div>
          <div id="esg"></div>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-start py-12 border-b border-ink/10">
            <div className="text-[24px] font-bold text-ink/20 font-mono tracking-tighter w-16">02.2</div>
            <div className="flex flex-col gap-4">
              <Typography variant="h3" className="text-ink m-0">
                <span className="en block">Environmental Assessments</span><span className="ar block mt-1">التقييمات البيئية</span>
              </Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 max-w-[600px]">
                <span className="en block">Environmental and social impact assessments and management plans for projects across sectors.</span>
                <span className="ar block mt-2">تقييمات الأثر البيئي والاجتماعي وخطط الإدارة للمشاريع في مختلف القطاعات.</span>
              </p>
              <ul className="list-disc pl-5 mt-4 flex flex-col gap-2 text-[14px] text-ink max-w-[600px]">
                <li><span className="en">ESIA / ESMP development</span><span className="ar block text-[0.9em] text-ink-soft">إعداد تقييمات وخطط الأثر البيئي والاجتماعي</span></li>
                <li><span className="en">Stakeholder engagement design</span><span className="ar block text-[0.9em] text-ink-soft">تصميم مشاركة أصحاب المصلحة</span></li>
                <li><span className="en">Safeguards compliance &amp; monitoring</span><span className="ar block text-[0.9em] text-ink-soft">الامتثال للضمانات والمتابعة</span></li>
              </ul>
            </div>
            <div className="bg-[#FAFBFB] border border-ink/10 rounded-[12px] p-6 w-full lg:w-[320px] flex flex-col gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <h5 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink m-0"><span className="en">Ask about this service</span><span className="ar ml-2">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name / الاسم الكامل" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <input type="email" placeholder="Email / البريد الإلكتروني" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <textarea placeholder="Brief context / نبذة عن السياق" rows={3} className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors resize-none"></textarea>
              <Button variant="primary" className="w-full justify-center">
                <span className="en">Send inquiry</span><span className="ar ml-2">إرسال الاستفسار</span>
              </Button>
            </div>
          </div>
          <div id="assessments"></div>
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
            </div>
            <div className="w-full min-h-[300px] rounded-[18px] bg-line-dark bg-cover bg-center overflow-hidden bg-[url('/assets/images/solar.jpg')]"></div>
          </div>
        </div>
      </Section>

      <Section theme="light" id="energy" className="pt-0 md:pt-0">
        <div className="w-full flex flex-col gap-12 mt-12 md:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-start py-12 border-b border-ink/10">
            <div className="text-[24px] font-bold text-ink/20 font-mono tracking-tighter w-16">03.1</div>
            <div className="flex flex-col gap-4">
              <Typography variant="h3" className="text-ink m-0">
                <span className="en block">Energy Management</span><span className="ar block mt-1">إدارة الطاقة</span>
              </Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 max-w-[600px]">
                <span className="en block">Audits and monitoring systems that cut consumption without cutting output.</span>
                <span className="ar block mt-2">تدقيقات وأنظمة رصد لخفض الاستهلاك دون التأثير في الإنتاج.</span>
              </p>
              <ul className="list-disc pl-5 mt-4 flex flex-col gap-2 text-[14px] text-ink max-w-[600px]">
                <li><span className="en">Energy audits &amp; benchmarking</span><span className="ar block text-[0.9em] text-ink-soft">تدقيقات الطاقة والمقارنة المرجعية</span></li>
                <li><span className="en">Metering &amp; monitoring system design</span><span className="ar block text-[0.9em] text-ink-soft">تصميم أنظمة العدادات والرصد</span></li>
                <li><span className="en">Demand-side management planning</span><span className="ar block text-[0.9em] text-ink-soft">تخطيط إدارة جانب الطلب</span></li>
              </ul>
            </div>
            <div className="bg-[#FAFBFB] border border-ink/10 rounded-[12px] p-6 w-full lg:w-[320px] flex flex-col gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <h5 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink m-0"><span className="en">Ask about this service</span><span className="ar ml-2">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name / الاسم الكامل" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <input type="email" placeholder="Email / البريد الإلكتروني" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <textarea placeholder="Brief context / نبذة عن السياق" rows={3} className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors resize-none"></textarea>
              <Button variant="primary" className="w-full justify-center">
                <span className="en">Send inquiry</span><span className="ar ml-2">إرسال الاستفسار</span>
              </Button>
            </div>
          </div>
          <div id="energy-mgmt"></div>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-start py-12 border-b border-ink/10">
            <div className="text-[24px] font-bold text-ink/20 font-mono tracking-tighter w-16">03.2</div>
            <div className="flex flex-col gap-4">
              <Typography variant="h3" className="text-ink m-0">
                <span className="en block">Renewable Energy Projects Development</span><span className="ar block mt-1">تطوير مشاريع الطاقة المتجددة</span>
              </Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 max-w-[600px]">
                <span className="en block">Technical and financial development support from resource assessment to financial close.</span>
                <span className="ar block mt-2">دعم فني ومالي من تقييم الموارد وحتى الإغلاق المالي.</span>
              </p>
              <ul className="list-disc pl-5 mt-4 flex flex-col gap-2 text-[14px] text-ink max-w-[600px]">
                <li><span className="en">Resource &amp; site assessment</span><span className="ar block text-[0.9em] text-ink-soft">تقييم الموارد والموقع</span></li>
                <li><span className="en">Feasibility &amp; bankability studies</span><span className="ar block text-[0.9em] text-ink-soft">دراسات الجدوى وقابلية التمويل</span></li>
                <li><span className="en">I-RECs &amp; renewable certification advisory</span><span className="ar block text-[0.9em] text-ink-soft">استشارات شهادات الطاقة المتجددة I-REC</span></li>
              </ul>
            </div>
            <div className="bg-[#FAFBFB] border border-ink/10 rounded-[12px] p-6 w-full lg:w-[320px] flex flex-col gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <h5 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink m-0"><span className="en">Ask about this service</span><span className="ar ml-2">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name / الاسم الكامل" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <input type="email" placeholder="Email / البريد الإلكتروني" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <textarea placeholder="Brief context / نبذة عن السياق" rows={3} className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors resize-none"></textarea>
              <Button variant="primary" className="w-full justify-center">
                <span className="en">Send inquiry</span><span className="ar ml-2">إرسال الاستفسار</span>
              </Button>
            </div>
          </div>
          <div id="renewables"></div>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-start py-12 border-b border-ink/10">
            <div className="text-[24px] font-bold text-ink/20 font-mono tracking-tighter w-16">03.3</div>
            <div className="flex flex-col gap-4">
              <Typography variant="h3" className="text-ink m-0">
                <span className="en block">Energy Modelling &amp; Policy Analysis</span><span className="ar block mt-1">نمذجة الطاقة وتحليل السياسات</span>
              </Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 max-w-[600px]">
                <span className="en block">Scenario modelling that informs policy and investment decisions with defensible numbers.</span>
                <span className="ar block mt-2">نمذجة سيناريوهات توجّه قرارات السياسات والاستثمار بأرقام موثوقة.</span>
              </p>
              <ul className="list-disc pl-5 mt-4 flex flex-col gap-2 text-[14px] text-ink max-w-[600px]">
                <li><span className="en">Supply &amp; demand modelling</span><span className="ar block text-[0.9em] text-ink-soft">نمذجة العرض والطلب</span></li>
                <li><span className="en">Policy &amp; tariff impact analysis</span><span className="ar block text-[0.9em] text-ink-soft">تحليل أثر السياسات والتعرفة</span></li>
                <li><span className="en">Least-cost planning</span><span className="ar block text-[0.9em] text-ink-soft">التخطيط الأقل تكلفة</span></li>
              </ul>
            </div>
            <div className="bg-[#FAFBFB] border border-ink/10 rounded-[12px] p-6 w-full lg:w-[320px] flex flex-col gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <h5 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink m-0"><span className="en">Ask about this service</span><span className="ar ml-2">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name / الاسم الكامل" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <input type="email" placeholder="Email / البريد الإلكتروني" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <textarea placeholder="Brief context / نبذة عن السياق" rows={3} className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors resize-none"></textarea>
              <Button variant="primary" className="w-full justify-center">
                <span className="en">Send inquiry</span><span className="ar ml-2">إرسال الاستفسار</span>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Domain 04: Business Solutions */}
      <Section theme="muted">
        <div className="flex flex-col gap-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-5">
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
            </div>
            <div className="w-full min-h-[300px] rounded-[18px] bg-line bg-cover bg-center overflow-hidden bg-[url('/assets/images/gas-energy.jpg')]"></div>
          </div>
        </div>
      </Section>

      <Section theme="light" id="business" className="pt-0 md:pt-0">
        <div className="w-full flex flex-col gap-12 mt-12 md:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-start py-12 border-b border-ink/10">
            <div className="text-[24px] font-bold text-ink/20 font-mono tracking-tighter w-16">04.1</div>
            <div className="flex flex-col gap-4">
              <Typography variant="h3" className="text-ink m-0">
                <span className="en block">Green Credit Lines</span><span className="ar block mt-1">خطوط الائتمان الأخضر</span>
              </Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 max-w-[600px]">
                <span className="en block">Structuring and eligibility frameworks connecting borrowers with green finance facilities.</span>
                <span className="ar block mt-2">هيكلة وأطر أهلية تربط المقترضين بمرافق التمويل الأخضر.</span>
              </p>
              <ul className="list-disc pl-5 mt-4 flex flex-col gap-2 text-[14px] text-ink max-w-[600px]">
                <li><span className="en">Eligibility criteria &amp; taxonomy alignment</span><span className="ar block text-[0.9em] text-ink-soft">معايير الأهلية والتوافق مع التصنيف الأخضر</span></li>
                <li><span className="en">Green facility structuring support</span><span className="ar block text-[0.9em] text-ink-soft">دعم هيكلة المرافق الخضراء</span></li>
                <li><span className="en">Environmental &amp; social risk categorisation</span><span className="ar block text-[0.9em] text-ink-soft">تصنيف المخاطر البيئية والاجتماعية</span></li>
              </ul>
            </div>
            <div className="bg-[#FAFBFB] border border-ink/10 rounded-[12px] p-6 w-full lg:w-[320px] flex flex-col gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <h5 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink m-0"><span className="en">Ask about this service</span><span className="ar ml-2">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name / الاسم الكامل" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <input type="email" placeholder="Email / البريد الإلكتروني" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <textarea placeholder="Brief context / نبذة عن السياق" rows={3} className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors resize-none"></textarea>
              <Button variant="primary" className="w-full justify-center">
                <span className="en">Send inquiry</span><span className="ar ml-2">إرسال الاستفسار</span>
              </Button>
            </div>
          </div>
          <div id="credit-lines"></div>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-start py-12 border-b border-ink/10">
            <div className="text-[24px] font-bold text-ink/20 font-mono tracking-tighter w-16">04.2</div>
            <div className="flex flex-col gap-4">
              <Typography variant="h3" className="text-ink m-0">
                <span className="en block">Supporting Studies &amp; M&amp;E Frameworks</span><span className="ar block mt-1">دراسات داعمة وأطر متابعة وتقييم</span>
              </Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 max-w-[600px]">
                <span className="en block">Business models, feasibility studies and monitoring &amp; evaluation frameworks across all four domains.</span>
                <span className="ar block mt-2">نماذج أعمال ودراسات جدوى وأطر متابعة وتقييم عبر المجالات الأربعة.</span>
              </p>
              <ul className="list-disc pl-5 mt-4 flex flex-col gap-2 text-[14px] text-ink max-w-[600px]">
                <li><span className="en">Business model &amp; feasibility studies</span><span className="ar block text-[0.9em] text-ink-soft">نماذج أعمال ودراسات جدوى</span></li>
                <li><span className="en">Monitoring &amp; evaluation (M&amp;E) framework design</span><span className="ar block text-[0.9em] text-ink-soft">تصميم أطر المتابعة والتقييم</span></li>
                <li><span className="en">Baseline &amp; results-measurement studies</span><span className="ar block text-[0.9em] text-ink-soft">دراسات خط الأساس وقياس النتائج</span></li>
              </ul>
            </div>
            <div className="bg-[#FAFBFB] border border-ink/10 rounded-[12px] p-6 w-full lg:w-[320px] flex flex-col gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <h5 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink m-0"><span className="en">Ask about this service</span><span className="ar ml-2">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name / الاسم الكامل" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <input type="email" placeholder="Email / البريد الإلكتروني" className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors" />
              <textarea placeholder="Brief context / نبذة عن السياق" rows={3} className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[13px] text-ink outline-none focus:border-ink/30 transition-colors resize-none"></textarea>
              <Button variant="primary" className="w-full justify-center">
                <span className="en">Send inquiry</span><span className="ar ml-2">إرسال الاستفسار</span>
              </Button>
            </div>
          </div>
          <div id="studies"></div>
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
            <Button href="/contact" variant="primary">
              <span className="en">Start an inquiry</span><span className="ar ml-2">ابدأ استفسارًا</span>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
