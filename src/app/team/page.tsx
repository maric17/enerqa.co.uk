import React from 'react';
import Link from 'next/link';
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
      <section className="page-hero letterbox">
        <span className="matte-label">enerQA / reel 07</span>
        <span className="matte-scene">SCENE 07 — TEAM</span>
        <div className="still b"></div>
        <div className="page-hero-copy">
          <div className="crumbs"><Link href="/">Home</Link> / <span className="en">Team &amp; Experts</span><span className="ar">الفريق والخبراء</span></div>
          <h1><span className="en">The people behind the field data.</span><span className="ar">الأشخاص وراء بيانات الميدان.</span></h1>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <span className="section-index en">Leadership &amp; advisory leads</span><span className="section-index ar">القيادة والمستشارون الرئيسيون</span>
          <p className="lede reveal" style={{ margin: '16px 0 40px' }}>
            <span className="en">A cross-disciplinary bench of engineers, climate scientists, safeguards specialists and finance advisors — working across English and Arabic client contexts.</span>
            <span className="ar">فريق متعدد التخصصات من المهندسين وعلماء المناخ ومتخصصي الضمانات ومستشاري التمويل — يعمل مع عملاء باللغتين العربية والإنجليزية.</span>
          </p>
          <div className="roster reveal d1">
            {team.docs.length > 0 ? (
              team.docs.map((member) => (
                <div key={member.id} className="expert reveal">
                  <div className="avatar still" style={member.image && typeof member.image !== 'string' && member.image.url ? { backgroundImage: `url(${member.image.url})` } : {}}></div>
                  <h4>{member.name}</h4>
                  <div className="role en">{member.role}</div><div className="role ar">{member.role}</div>
                  <p className="en">{member.bio}</p><p className="ar">{member.bio}</p>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--ink-soft)' }}>
                <span className="en">No team members listed yet.</span><span className="ar">لا يوجد أعضاء في الفريق بعد.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="band forest">
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 44, alignItems: 'center' }}>
          <div className="reveal">
            <span className="eyebrow"><span className="en">Careers</span><span className="ar">الوظائف</span></span>
            <h2><span className="en">We hire for judgement, not just credentials.</span><span className="ar">نوظّف من أجل الحصافة، لا الشهادات فقط.</span></h2>
            <p className="lede" style={{ marginTop: 16 }}>
              <span className="en">enerQA is a small, deliberately cross-disciplinary team. We look for people who can hold data rigour and field pragmatism at the same time.</span>
              <span className="ar">إنيرقا فريق صغير متعدد التخصصات بقصد. نبحث عن أشخاص يجمعون بين الدقة في البيانات والواقعية الميدانية.</span>
            </p>
            <Link href="/contact#careers" className="btn" style={{ marginTop: 24 }}><span className="en">View open roles</span><span className="ar">اطّلع على الوظائف الشاغرة</span></Link>
          </div>
          <div className="still" style={{ minHeight: 300, borderRadius: 18 }}></div>
        </div>
      </section>
    </>
  );
}
