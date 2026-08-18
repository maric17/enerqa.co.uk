import React from 'react';
import Link from 'next/link';
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
      <section className="page-hero letterbox">
        <span className="matte-label">enerQA / reel 06</span>
        <span className="matte-scene">SCENE 06 — INSIGHTS</span>
        <div className="still c"></div>
        <div className="page-hero-copy">
          <div className="crumbs"><Link href="/">Home</Link> / <span className="en">Insights</span><span className="ar">رؤى</span></div>
          <h1><span className="en">Notes from the field, as they happen.</span><span className="ar">ملاحظات من الميدان، أولًا بأول.</span></h1>
        </div>
      </section>

      <section className="band tight">
        <div className="wrap">
          <div className="article-feature reveal">
            <div className="still d" style={{ minHeight: 380, borderRadius: 18 }}></div>
            <div>
              <span className="eyebrow"><span className="en">Featured</span><span className="ar">مقال مميز</span></span>
              <h2><span className="en">DPSIR and the Case for Structured Climate Thinking</span><span className="ar">إطار DPSIR وأهمية التفكير المناخي المنظّم</span></h2>
              <p className="lede" style={{ marginTop: 16 }}>
                <span className="en">Why the Drivers–Pressures–State–Impact–Response model is proving useful far beyond its original ecological context — and what it offers Gulf aquaculture policy today.</span>
                <span className="ar">لماذا يثبت نموذج المحركات-الضغوط-الحالة-الأثر-الاستجابة فائدته خارج سياقه البيئي الأصلي — وما الذي يقدمه لسياسات الاستزراع المائي الخليجية اليوم.</span>
              </p>
              <Link href="/insights" className="link-under" style={{ marginTop: 18, display: 'inline-block' }}><span className="en">Read the field note →</span><span className="ar">‹ اقرأ المذكرة الميدانية</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="band panel" style={{ background: 'var(--paper-dim)' }}>
        <div className="wrap">
          <span className="section-index en">Latest</span><span className="section-index ar">الأحدث</span>
          <div className="insights-grid" style={{ marginTop: 16 }}>
            {insights.docs.length > 0 ? (
              insights.docs.map((post) => (
                <Link key={post.id} className="post-card reveal" href="/insights">
                  {/* Handle image conditionally */}
                  <div className="still" style={post.image && typeof post.image !== 'string' && post.image.url ? { backgroundImage: `url(${post.image.url})` } : {}}></div>
                  
                  {/* Format date */}
                  <div className="pdate en">
                    {new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="pdate ar">
                    {new Date(post.createdAt).toLocaleDateString('ar-EG', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>

                  <h4><span className="en">{post.title}</span><span className="ar">{post.title}</span></h4>
                  <p className="en">{post.excerpt}</p>
                  <p className="ar">{post.excerpt}</p>
                  
                  <div className="p-tags en"><span className="tag">{post.category}</span></div>
                  <div className="p-tags ar"><span className="tag">{post.category}</span></div>
                </Link>
              ))
            ) : (
              <p className="en">No insights published yet.</p>
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <Link href="/knowledge-hub" className="btn ghost"><span className="en">Browse the full Knowledge Hub</span><span className="ar">تصفح مركز المعرفة بالكامل</span></Link>
          </div>
        </div>
      </section>

      <section className="band dark tight">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}><span className="en">Stay up to date</span><span className="ar">ابقَ على اطّلاع</span></span>
          <h2><span className="en">Get field notes in your inbox.</span><span className="ar">احصل على ملاحظاتنا الميدانية في بريدك.</span></h2>
          <SubscribeForm />
        </div>
      </section>
    </>
  );
}
