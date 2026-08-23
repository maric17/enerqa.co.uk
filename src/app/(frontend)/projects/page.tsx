import React from 'react';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export default async function ProjectsPage() {
  const payload = await getPayload({ config: configPromise });
  const projects = await payload.find({
    collection: 'projects',
    sort: '-date',
    limit: 20,
  });

  return (
    <>
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0">
          enerQA / reel 04
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          SCENE 04 — PROJECTS
        </div>
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-[url('/assets/images/solar.jpg')]"></div>
        <div className="hero-insights-overlay z-10 opacity-80"></div>
        
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> / <span className="en text-white">Projects</span><span className="ar text-white">المشاريع</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">A running log of engagements.</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">سجل متواصل لمشاريعنا.</span>
          </Typography>
        </Container>
      </section>

      <Section theme="light">
        <div className="w-full flex flex-col gap-12">
          <Typography variant="eyebrow" className="text-ink-muted mb-0">
            <span className="en">Case studies, in the order they happened</span>
            <span className="ar ml-2">دراسات الحالة، بترتيب حدوثها</span>
          </Typography>
          
          <div className="flex flex-col gap-12 md:gap-16 relative before:content-[''] before:absolute before:left-[11px] md:before:left-[43px] before:top-2 before:bottom-2 before:w-[2px] before:bg-ink/10">
            {projects.docs.length > 0 ? (
              projects.docs.map((project, index) => (
                <div key={project.id} className="relative flex flex-col md:flex-row gap-6 md:gap-12 md:pl-24 pl-10 group">
                  <div className="absolute left-0 md:left-4 top-2 w-[24px] h-[24px] rounded-full bg-white border-4 border-ink/20 group-hover:border-ink/50 transition-colors z-10"></div>
                  
                  <div className="flex flex-col gap-1 min-w-[100px] pt-1">
                    <span className="text-[28px] md:text-[32px] font-bold text-ink/20 font-mono tracking-tighter leading-none">{new Date(project.date).getFullYear()}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-muted">
                      <span className="en">{project.status}</span>
                      <span className="ar">{project.status}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8 md:gap-12 flex-1">
                    <div className="flex flex-col gap-4">
                      <Typography variant="h3" className="text-ink m-0">
                        <span className="en block">{project.title}</span><span className="ar block mt-1">{project.title}</span>
                      </Typography>
                      <p className="text-[15px] leading-[1.6] text-ink-soft m-0">
                        <span className="en block">{project.description}</span>
                        <span className="ar block mt-2">{project.description}</span>
                      </p>
                      
                      {project.impact && project.impact.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.impact.map((imp: any, i: number) => (
                            <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAFBFB] border border-ink/10 text-[12px] font-bold text-ink/70">
                              {imp.metric}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {project.image && typeof project.image !== 'string' && project.image.url && (
                      <div className="w-full h-[140px] md:h-full min-h-[140px] rounded-[12px] bg-cover bg-center border border-ink/10" style={{ backgroundImage: `url(${project.image.url})` }}></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-ink-soft text-center w-full">
                <span className="en block">No projects available yet.</span><span className="ar block mt-2">لا توجد مشاريع متاحة بعد.</span>
              </div>
            )}
          </div>
        </div>
      </Section>

      <section className="relative w-full py-[120px] flex items-center justify-center bg-ink text-white overflow-hidden text-center">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-left">
          <span className="en block">enerQA / reel 04</span><span className="ar block mt-1">إنيرقا / الحلقة 04</span>
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          END SCENE
        </div>
        <div className="w-full max-w-[800px] mx-auto relative z-20 flex flex-col items-center gap-7">
          <Typography variant="eyebrow" className="text-white/60 m-0 w-full text-center flex justify-center">
            <span className="en">Have a similar challenge?</span><span className="ar ml-2">هل تواجه تحديًا مشابهًا؟</span>
          </Typography>
          <Typography variant="h2" className="text-white m-0 text-center">
            <span className="en block">Let's scope your engagement.</span>
            <span className="ar block mt-3 text-white/90">لنحدد نطاق مشروعك معًا.</span>
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
