import React from 'react';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import KnowledgeHubList from '@/components/KnowledgeHubList';

export default async function KnowledgeHubPage() {
  const payload = await getPayload({ config: configPromise });
  const publications = await payload.find({
    collection: 'publications',
    sort: '-date',
    limit: 50,
  });

  return (
    <>
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0">
          enerQA / reel 05
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          SCENE 05 — KNOWLEDGE HUB
        </div>
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-luminosity bg-[url('/assets/images/port.jpg')]"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/90"></div>
        
        <div className="w-[90%] max-w-[1400px] mx-auto relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> / <span className="en text-white">Knowledge Hub</span><span className="ar text-white">مركز المعرفة</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">A searchable library of our published work.</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">مكتبة قابلة للبحث لأعمالنا المنشورة.</span>
          </Typography>
        </div>
      </section>

      <Section theme="light">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-12">
          <Typography variant="eyebrow" className="text-ink-muted mb-0">
            <span className="en">Publications &amp; resources</span>
            <span className="ar ml-2">المنشورات والموارد</span>
          </Typography>
          
          <KnowledgeHubList publications={publications.docs as any} />
        </div>
      </Section>
    </>
  );
}
