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
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-[url('/assets/images/hero-bg.jpg')]"></div>
        <div className="hero-insights-overlay z-10 opacity-80"></div>
        
        <Container className="w-full relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12 h-full justify-center">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> / <span className="en text-white">About</span><span className="ar text-white">من نحن</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">Built on field experience, run on evidence.</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">مبنيّون على خبرة ميدانية، ونعمل بالأدلة.</span>
          </Typography>
        </Container>
      </section>

      <Section theme="light">
        <div className="flex flex-col gap-12 w-full">
          <Typography variant="eyebrow" className="mb-0 text-ink-muted">
            <span className="en">01 — Background</span>
            <span className="ar ml-2">01 — الخلفية</span>
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-5">
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">A collective of practitioners, not a slide deck.</span>
                <span className="ar block text-[0.8em] mt-3 text-ink/90">مجموعة من الممارسين، لا مجرد عرض تقديمي.</span>
              </Typography>
              <p className="text-[17px] md:text-[19px] leading-[1.6] text-ink font-light m-0 mt-3">
                <span className="en block">Building on the professional heritage of its founders and anchored by a diverse group of experienced professionals committed to environmental responsibility, enerQA sees itself as a driving force in shaping a sustainable future. We don&apos;t just deliver solutions — we build collaborative partnerships tailored to the challenges faced by a broad range of stakeholders, from startups to established institutions and government agencies.</span>
                <span className="ar block mt-4">بالاستناد إلى الإرث المهني لمؤسسيها ومجموعة متنوعة من المتخصصين ذوي الخبرة الملتزمين بالمسؤولية البيئية، ترى إنيرقا نفسها قوة دافعة في تشكيل مستقبل مستدام. نحن لا نكتفي بتقديم الحلول، بل نبني شراكات تعاونية مصممة خصيصًا للتحديات التي تواجه طيفًا واسعًا من أصحاب المصلحة، من الشركات الناشئة إلى المؤسسات الراسخة والجهات الحكومية.</span>
              </p>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0 mt-2">
                <span className="en block">Our philosophy is rooted in research and innovation, emphasising practical solutions grounded in data and scientific rigor.</span>
                <span className="ar block mt-2">تقوم فلسفتنا على البحث والابتكار، مع التركيز على حلول عملية مستندة إلى البيانات والدقة العلمية.</span>
              </p>
            </div>
            <div className="w-full min-h-[380px] rounded-[18px] bg-line bg-cover bg-center overflow-hidden bg-[url('/assets/images/solar.jpg')]"></div>
          </div>
        </div>
      </Section>

      <Section theme="muted">
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[1px] bg-ink-muted/10 border border-ink-muted/10 overflow-hidden rounded-[var(--r-lg)]">
            <Link href="/services" className="bg-ink p-8 flex flex-col gap-4 no-underline transition-colors hover:bg-ink-muted group">
              <Typography variant="h4" className="text-white m-0 group-hover:text-white transition-colors">
                <span className="en block">Experienced professionals</span>
                <span className="ar block mt-1 text-[0.9em] opacity-90">متخصصون ذوو خبرة</span>
              </Typography>
              <p className="text-[13.5px] leading-[1.5] text-white/70 m-0">
                <span className="en block">A cross-disciplinary bench spanning engineering, climate science, finance and safeguards.</span>
                <span className="ar block mt-2 opacity-80">فريق متعدد التخصصات يجمع الهندسة وعلوم المناخ والتمويل والضمانات البيئية.</span>
              </p>
            </Link>
            <Link href="/services" className="bg-ink p-8 flex flex-col gap-4 no-underline transition-colors hover:bg-ink-muted group">
              <Typography variant="h4" className="text-white m-0 group-hover:text-white transition-colors">
                <span className="en block">Flexible service offerings</span>
                <span className="ar block mt-1 text-[0.9em] opacity-90">خدمات مرنة وقابلة للتخصيص</span>
              </Typography>
              <p className="text-[13.5px] leading-[1.5] text-white/70 m-0">
                <span className="en block">Scoped engagements that flex to the client&apos;s stage, from feasibility to full delivery.</span>
                <span className="ar block mt-2 opacity-80">تكليفات مرنة تتكيف مع مرحلة العميل، من الجدوى إلى التسليم الكامل.</span>
              </p>
            </Link>
            <Link href="/services" className="bg-ink p-8 flex flex-col gap-4 no-underline transition-colors hover:bg-ink-muted group">
              <Typography variant="h4" className="text-white m-0 group-hover:text-white transition-colors">
                <span className="en block">Active stakeholder engagement</span>
                <span className="ar block mt-1 text-[0.9em] opacity-90">تفاعل فعّال مع أصحاب المصلحة</span>
              </Typography>
              <p className="text-[13.5px] leading-[1.5] text-white/70 m-0">
                <span className="en block">Participatory design that keeps communities and regulators inside the process.</span>
                <span className="ar block mt-2 opacity-80">تصميم تشاركي يُبقي المجتمعات والجهات الرقابية جزءًا من العملية.</span>
              </p>
            </Link>
            <Link href="/services" className="bg-ink p-8 flex flex-col gap-4 no-underline transition-colors hover:bg-ink-muted group">
              <Typography variant="h4" className="text-white m-0 group-hover:text-white transition-colors">
                <span className="en block">Research &amp; development focus</span>
                <span className="ar block mt-1 text-[0.9em] opacity-90">التركيز على البحث والتطوير</span>
              </Typography>
              <p className="text-[13.5px] leading-[1.5] text-white/70 m-0">
                <span className="en block">Continuous investment in methods, tools and publications ahead of client need.</span>
                <span className="ar block mt-2 opacity-80">استثمار مستمر في الأساليب والأدوات والمنشورات استباقًا لاحتياجات العملاء.</span>
              </p>
            </Link>
          </div>
        </div>
      </Section>

      <Section theme="light">
        <div className="w-full flex flex-col gap-12">
          <Typography variant="eyebrow" className="mb-0 text-ink-muted">
            <span className="en">02 — Mission &amp; objective</span>
            <span className="ar ml-2">02 — الرسالة والهدف</span>
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-11 md:gap-[120px]">
            <div className="text-[22px] md:text-[26px] leading-[1.4] text-ink font-light tracking-[-0.01em]">
              <span className="en block">To globally avail knowledge and good practices in climate change, energy, environmental &amp; social safeguards and related business solutions.</span>
              <span className="ar block mt-5">إتاحة المعرفة والممارسات الجيدة عالميًا في مجالات تغيّر المناخ والطاقة والضمانات البيئية والاجتماعية وحلول الأعمال ذات الصلة.</span>
            </div>
            <div className="flex flex-col gap-3.5 pt-2">
              <Typography variant="h3" className="text-ink m-0">
                <span className="en block">Our objective</span>
                <span className="ar block mt-1">هدفنا</span>
              </Typography>
              <p className="text-[15px] leading-[1.6] text-ink-soft m-0">
                <span className="en block">To cultivate wisdom by transforming data into knowledge and refining it into fundamental principles — bridging the gap from data and information to universal, useful and accessible knowledge for energy, climate change, sustainability and business solutions.</span>
                <span className="ar block mt-4">تنمية الحكمة عبر تحويل البيانات إلى معرفة وتكريرها إلى مبادئ أساسية — لسدّ الفجوة بين البيانات والمعلومات ومعرفة عملية ومتاحة في الطاقة وتغيّر المناخ والاستدامة وحلول الأعمال.</span>
              </p>
            </div>
          </div>
        </div>
      </Section>

      <section className="relative w-full py-[120px] flex items-center justify-center bg-ink text-white overflow-hidden text-center">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-left">
          <span className="en block">enerQA / reel 02</span><span className="ar block mt-1">إنيرقا / الحلقة 02</span>
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          END SCENE
        </div>
        <Container className="w-full relative z-20 flex flex-col items-center gap-7">
          <Typography variant="eyebrow" className="text-white/60 m-0 w-full text-center flex justify-center">
            <span className="en">Governance</span><span className="ar ml-2">الحوكمة</span>
          </Typography>
          <Typography variant="h2" className="text-white m-0 text-center">
            <span className="en block">Independent by design, accountable by practice.</span>
            <span className="ar block mt-3 text-white/90">مستقلون بالتصميم، مسؤولون بالممارسة.</span>
          </Typography>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Button href="/team" variant="primary">
              <span className="en">Meet the experts</span><span className="ar ml-2">تعرّف على الخبراء</span>
            </Button>
            <Button href="/services" variant="outline">
              <span className="en">See our domains</span><span className="ar ml-2">اطّلع على مجالاتنا</span>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
