import React from 'react';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export default async function TeamPage() {
  const payload = await getPayload({ config: configPromise });
  const team = await payload.find({
    collection: 'team',
    limit: 20,
  });

  return (
    <>
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0">
          enerQA / reel 07
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          SCENE 07 — TEAM
        </div>
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-[url('/assets/images/hero-bg.jpg')]"></div>
        <div className="hero-insights-overlay z-10 opacity-80"></div>
        
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> / <span className="en text-white">Team &amp; Experts</span><span className="ar text-white">الفريق والخبراء</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">The people behind the field data.</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">الأشخاص وراء بيانات الميدان.</span>
          </Typography>
        </Container>
      </section>

      <Section theme="light">
        <div className="w-full flex flex-col gap-12">
          <div className="flex flex-col gap-4 max-w-[800px]">
            <Typography variant="eyebrow" className="text-ink-muted mb-0">
              <span className="en">Leadership &amp; advisory leads</span>
              <span className="ar ml-2">القيادة والمستشارون الرئيسيون</span>
            </Typography>
            <p className="text-[17px] md:text-[21px] leading-[1.6] text-ink font-light m-0">
              <span className="en block">A cross-disciplinary bench of engineers, climate scientists, safeguards specialists and finance advisors — working across English and Arabic client contexts.</span>
              <span className="ar block mt-4">فريق متعدد التخصصات من المهندسين وعلماء المناخ ومتخصصي الضمانات ومستشاري التمويل — يعمل مع عملاء باللغتين العربية والإنجليزية.</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 mt-4">
            {team.docs.length > 0 ? (
              team.docs.map((member) => {
                const imageUrl = member.image && typeof member.image === 'object' && member.image !== null && 'url' in member.image ? member.image.url : null;
                return (
                <div key={member.id} className="flex flex-col items-start gap-4 group">
                  <div className="w-full aspect-[4/5] rounded-[16px] bg-[#FAFBFB] bg-cover bg-center overflow-hidden border border-ink/10 group-hover:border-ink/20 transition-colors" style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}></div>
                  <div className="flex flex-col gap-1 w-full">
                    <Typography variant="h4" className="text-ink m-0 group-hover:text-ink/80 transition-colors">
                      {member.name}
                    </Typography>
                    <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-ink-muted mb-2">
                      <span className="en">{member.role}</span><span className="ar hidden group-[[data-lang=ar]]:inline-block">{member.role}</span>
                    </div>
                    <p className="text-[14px] leading-[1.6] text-ink-soft m-0">
                      <span className="en line-clamp-4">{member.bio}</span><span className="ar hidden group-[[data-lang=ar]]:-webkit-box line-clamp-4">{member.bio}</span>
                    </p>
                  </div>
                </div>
              )})
            ) : (
              <div className="col-span-full py-10 text-ink-soft">
                <span className="en">No team members listed yet.</span><span className="ar ml-2">لا يوجد أعضاء في الفريق بعد.</span>
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section theme="muted">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-12 items-center w-full">
          <div className="flex flex-col gap-6 items-start">
            <Typography variant="eyebrow" className="text-ink-muted m-0">
              <span className="en">Careers</span><span className="ar ml-2">الوظائف</span>
            </Typography>
            <Typography variant="h2" className="text-ink m-0">
              <span className="en block">We hire for judgement, not just credentials.</span>
              <span className="ar block text-[0.8em] mt-3 text-ink/90">نوظّف من أجل الحصافة، لا الشهادات فقط.</span>
            </Typography>
            <p className="text-[17px] md:text-[19px] leading-[1.6] text-ink font-light m-0">
              <span className="en block">enerQA is a small, deliberately cross-disciplinary team. We look for people who can hold data rigour and field pragmatism at the same time.</span>
              <span className="ar block mt-4">إنيرقا فريق صغير متعدد التخصصات بقصد. نبحث عن أشخاص يجمعون بين الدقة في البيانات والواقعية الميدانية.</span>
            </p>
            <div className="mt-2">
              <Button href="/contact#careers" variant="primary">
                <span className="en">View open roles</span><span className="ar ml-2">اطّلع على الوظائف الشاغرة</span>
              </Button>
            </div>
          </div>
          <div className="w-full min-h-[300px] aspect-[4/3] md:aspect-auto md:h-full rounded-[18px] bg-line-dark bg-cover bg-center overflow-hidden bg-[url('/assets/images/port.jpg')]"></div>
        </div>
      </Section>
    </>
  );
}
