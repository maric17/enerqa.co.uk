import React from 'react';
import Link from 'next/link';
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
      <section className="page-hero letterbox">
        <span className="matte-label">enerQA / reel 05</span>
        <span className="matte-scene">SCENE 05 — KNOWLEDGE HUB</span>
        <div className="still"></div>
        <div className="page-hero-copy">
          <div className="crumbs"><Link href="/">Home</Link> / <span className="en">Knowledge Hub</span><span className="ar">مركز المعرفة</span></div>
          <h1><span className="en">A searchable library of our published work.</span><span className="ar">مكتبة قابلة للبحث لأعمالنا المنشورة.</span></h1>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <span className="section-index en">Publications &amp; resources</span><span className="section-index ar">المنشورات والموارد</span>
          <KnowledgeHubList publications={publications.docs as any} />
        </div>
      </section>
    </>
  );
}
