import React from 'react';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import KnowledgeHubList from '@/components/KnowledgeHubList';
import LearningMaterialsList from '@/components/LearningMaterialsList';
import GlossarySection from '@/components/GlossarySection';
import FAQSection from '@/components/FAQSection';

export default async function KnowledgeHubPage() {
  const payload = await getPayload({ config: configPromise });
  
  const pageConfig = await payload.findGlobal({
    slug: 'knowledge-hub-config',
  });

  const publications = await payload.find({
    collection: 'publications',
    sort: '-date',
    limit: 50,
  });

  const materials = await payload.find({
    collection: 'learning-materials',
    limit: 50,
  });

  const glossary = await payload.find({
    collection: 'glossary',
    limit: 200,
    pagination: false,
  });

  const faqs = await payload.find({
    collection: 'faqs',
    sort: 'order',
    limit: 100,
    pagination: false,
  });

  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
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
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-[url('/assets/images/port.jpg')]"></div>
        <div className="hero-insights-overlay z-10 opacity-80"></div>
        
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> / <span className="en text-white">Knowledge Hub</span><span className="ar text-white">مركز المعرفة</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">{pageConfig.heroTitle || 'A searchable library of our published work and resources.'}</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">{(pageConfig as any).heroTitleAr || 'مكتبة قابلة للبحث لأعمالنا المنشورة ومواردنا.'}</span>
          </Typography>
        </Container>
      </section>

      {/* Sticky Jump Links */}
      <div className="sticky top-[80px] z-30 bg-white border-b border-ink/10 shadow-sm transition-all duration-300 jump-links-nav">
        <Container className="flex items-center overflow-x-auto hide-scrollbar gap-8 py-4">
          <a href="#publications" className="text-[13px] font-bold uppercase tracking-wider text-ink/60 hover:text-ink whitespace-nowrap transition-colors no-underline">Publications</a>
          <a href="#learning" className="text-[13px] font-bold uppercase tracking-wider text-ink/60 hover:text-ink whitespace-nowrap transition-colors no-underline">Learning Materials</a>
          <a href="#glossary" className="text-[13px] font-bold uppercase tracking-wider text-ink/60 hover:text-ink whitespace-nowrap transition-colors no-underline">Glossary</a>
          <a href="#faqs" className="text-[13px] font-bold uppercase tracking-wider text-ink/60 hover:text-ink whitespace-nowrap transition-colors no-underline">FAQs</a>
        </Container>
      </div>

      <Section theme="light" id="publications" className="scroll-mt-[130px]">
        <div className="w-full flex flex-col gap-8">
          <Typography variant="eyebrow" className="text-ink-muted mb-0">
            <span className="en">{pageConfig.publicationsEyebrow || 'Publications & Reports'}</span>
            <span className="ar ml-2">{(pageConfig as any).publicationsEyebrowAr || 'المنشورات والتقارير'}</span>
          </Typography>
          <KnowledgeHubList publications={publications.docs as any} categories={categories.docs as any} />
        </div>
      </Section>

      <Section theme="white" id="learning" className="scroll-mt-[130px] border-t border-ink/5">
        <div className="w-full flex flex-col gap-8">
          <Typography variant="eyebrow" className="text-ink-muted mb-0">
            <span className="en">{pageConfig.learningMaterialsEyebrow || 'Learning Materials'}</span>
            <span className="ar ml-2">{(pageConfig as any).learningMaterialsEyebrowAr || 'مواد تعليمية'}</span>
          </Typography>
          <LearningMaterialsList materials={materials.docs as any} categories={categories.docs as any} />
        </div>
      </Section>

      <Section theme="light" id="glossary" className="scroll-mt-[130px] border-t border-ink/5">
        <div className="w-full flex flex-col gap-8">
          <div className="flex flex-col gap-2 max-w-2xl">
            <Typography variant="eyebrow" className="text-ink-muted mb-0">
              <span className="en">{pageConfig.glossaryEyebrow || 'Glossary of Terms'}</span>
              <span className="ar ml-2">{(pageConfig as any).glossaryEyebrowAr || 'مسرد المصطلحات'}</span>
            </Typography>
            <Typography variant="h2" className="text-ink m-0">
              <span className="en block">{pageConfig.glossaryTitle || 'Climate & Sustainability Dictionary'}</span>
              {(pageConfig as any).glossaryTitleAr && <span className="ar block mt-2 text-[0.8em]">{(pageConfig as any).glossaryTitleAr}</span>}
            </Typography>
            <p className="text-ink-soft text-[15px]">
              <span className="en block">{pageConfig.glossaryDescription || 'Explore definitions for technical jargon, acronyms, and key concepts used throughout the portal.'}</span>
              {(pageConfig as any).glossaryDescriptionAr && <span className="ar block mt-1">{(pageConfig as any).glossaryDescriptionAr}</span>}
            </p>
          </div>
          <GlossarySection terms={glossary.docs as any} />
        </div>
      </Section>

      <Section theme="white" id="faqs" className="scroll-mt-[130px] border-t border-ink/5 pb-24">
        <div className="w-full flex flex-col gap-12">
          <div className="flex flex-col gap-2 max-w-2xl text-center mx-auto items-center">
            <Typography variant="eyebrow" className="text-ink-muted mb-0">
              <span className="en">{pageConfig.faqsEyebrow || 'Frequently Asked Questions'}</span>
              <span className="ar ml-2">{(pageConfig as any).faqsEyebrowAr || 'أسئلة مكررة'}</span>
            </Typography>
            <Typography variant="h2" className="text-ink m-0">
              <span className="en block">{pageConfig.faqsTitle || 'Got questions?'}</span>
              {(pageConfig as any).faqsTitleAr && <span className="ar block mt-2 text-[0.8em]">{(pageConfig as any).faqsTitleAr}</span>}
            </Typography>
          </div>
          <FAQSection faqs={faqs.docs as any} />
        </div>
      </Section>
    </>
  );
}
