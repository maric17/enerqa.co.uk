import React from 'react';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import SubscribeForm from '@/components/SubscribeForm';

export default async function InsightsPage() {
  const payload = await getPayload({ config: configPromise });
  const insights = await payload.find({
    collection: 'insights',
    sort: '-createdAt',
    limit: 6,
  });

  return (
    <>
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0">
          enerQA / reel 06
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          SCENE 06 — INSIGHTS
        </div>
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-60 mix-blend-luminosity bg-[url('/assets/images/solar.jpg')]"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink via-ink/30 to-ink/70"></div>
        
        <div className="w-[90%] max-w-[1400px] mx-auto relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> / <span className="en text-white">Insights</span><span className="ar text-white">رؤى</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">Notes from the field, as they happen.</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">ملاحظات من الميدان، أولًا بأول.</span>
          </Typography>
        </div>
      </section>

      <Section theme="light">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="w-full aspect-[4/3] rounded-[18px] bg-line-dark bg-cover bg-center overflow-hidden bg-[url('/assets/images/port.jpg')]"></div>
            <div className="flex flex-col gap-4">
              <Typography variant="eyebrow" className="text-ink-muted mb-0">
                <span className="en">Featured</span><span className="ar ml-2">مقال مميز</span>
              </Typography>
              <Typography variant="h2" className="text-ink m-0">
                <span className="en block">DPSIR and the Case for Structured Climate Thinking</span>
                <span className="ar block text-[0.8em] mt-3 text-ink/90">إطار DPSIR وأهمية التفكير المناخي المنظّم</span>
              </Typography>
              <p className="text-[17px] md:text-[19px] leading-[1.6] text-ink font-light m-0 mt-2">
                <span className="en block">Why the Drivers–Pressures–State–Impact–Response model is proving useful far beyond its original ecological context — and what it offers Gulf aquaculture policy today.</span>
                <span className="ar block mt-4">لماذا يثبت نموذج المحركات-الضغوط-الحالة-الأثر-الاستجابة فائدته خارج سياقه البيئي الأصلي — وما الذي يقدمه لسياسات الاستزراع المائي الخليجية اليوم.</span>
              </p>
              <Link href="/insights" className="text-[15px] font-bold text-ink hover:text-ink-soft transition-colors mt-2 inline-block">
                <span className="en">Read the field note →</span><span className="ar">‹ اقرأ المذكرة الميدانية</span>
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section theme="muted">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-10">
          <Typography variant="eyebrow" className="text-ink-muted mb-0">
            <span className="en">Latest</span><span className="ar ml-2">الأحدث</span>
          </Typography>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.docs.length > 0 ? (
              insights.docs.map((post) => (
                <Link key={post.id} href="/insights" className="flex flex-col gap-4 bg-white p-5 rounded-[16px] border border-ink/10 hover:border-ink/30 transition-all hover:shadow-md group no-underline">
                  <div className="w-full aspect-[16/10] rounded-[8px] bg-line bg-cover bg-center overflow-hidden" style={post.image && typeof post.image !== 'string' && post.image.url ? { backgroundImage: `url(${post.image.url})` } : {}}></div>
                  
                  <div className="text-[13px] text-ink-soft">
                    <span className="en">{new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    <span className="ar hidden group-[[data-lang=ar]]:inline-block">{new Date(post.createdAt).toLocaleDateString('ar-EG', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>

                  <Typography variant="h4" className="text-ink m-0 group-hover:text-ink/80 transition-colors">
                    <span className="en line-clamp-2">{post.title}</span><span className="ar hidden group-[[data-lang=ar]]:-webkit-box line-clamp-2">{post.title}</span>
                  </Typography>
                  
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0 mb-2">
                    <span className="en line-clamp-3">{post.excerpt}</span><span className="ar hidden group-[[data-lang=ar]]:-webkit-box line-clamp-3">{post.excerpt}</span>
                  </p>
                  
                  <div className="mt-auto pt-2">
                    <Badge variant="light">
                      {post.category}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-10 text-ink-soft text-center">
                <span className="en">No insights published yet.</span>
                <span className="ar ml-2">لا توجد رؤى منشورة بعد.</span>
              </div>
            )}
          </div>
          
          <div className="text-center mt-6">
            <Button href="/knowledge-hub" variant="outline">
              <span className="en">Browse the full Knowledge Hub</span><span className="ar ml-2">تصفح مركز المعرفة بالكامل</span>
            </Button>
          </div>
        </div>
      </Section>

      <section className="relative w-full py-[120px] flex flex-col items-center justify-center bg-ink text-white overflow-hidden text-center border-t border-white/10">
        <div className="max-w-[600px] w-[90%] mx-auto relative z-20 flex flex-col items-center gap-7">
          <Typography variant="eyebrow" className="text-white/60 m-0 w-full text-center flex justify-center">
            <span className="en">Stay up to date</span><span className="ar ml-2">ابقَ على اطّلاع</span>
          </Typography>
          <Typography variant="h2" className="text-white m-0 text-center">
            <span className="en block">Get field notes in your inbox.</span>
            <span className="ar block mt-3 text-white/90">احصل على ملاحظاتنا الميدانية في بريدك.</span>
          </Typography>
          <div className="w-full mt-4">
            <SubscribeForm />
          </div>
        </div>
      </section>
    </>
  );
}
