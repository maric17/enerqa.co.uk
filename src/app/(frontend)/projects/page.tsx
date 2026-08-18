import React from 'react';
import Link from 'next/link';
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
      <section className="page-hero letterbox">
        <span className="matte-label">enerQA / reel 04</span>
        <span className="matte-scene">SCENE 04 — PROJECTS</span>
        <div className="still d"></div>
        <div className="page-hero-copy">
          <div className="crumbs"><Link href="/">Home</Link> / <span className="en">Projects</span><span className="ar">المشاريع</span></div>
          <h1><span className="en">A running log of engagements.</span><span className="ar">سجل متواصل لمشاريعنا.</span></h1>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <span className="section-index en">Case studies, in the order they happened</span>
          <span className="section-index ar">دراسات الحالة، بترتيب حدوثها</span>
          <div className="timeline">
            {projects.docs.length > 0 ? (
              projects.docs.map((project, index) => (
                <div key={project.id} className="tl-item reveal">
                  <div className="tl-head">
                    <span className="tl-year">{new Date(project.date).getFullYear()}</span>
                    <span className="tl-status en">{project.status}</span>
                    <span className="tl-status ar">{project.status}</span>
                  </div>
                  <div className="tl-grid">
                    <div>
                      <h3><span className="en">{project.title}</span><span className="ar">{project.title}</span></h3>
                      <p style={{ marginTop: 10 }}>
                        <span className="en">{project.description}</span>
                        <span className="ar">{project.description}</span>
                      </p>
                      
                      {project.impact && project.impact.length > 0 && (
                        <>
                          <div className="tl-markers en">
                            {project.impact.map((imp: any, i: number) => (
                              <span key={i}>{imp.metric}</span>
                            ))}
                          </div>
                          <div className="tl-markers ar">
                            {project.impact.map((imp: any, i: number) => (
                              <span key={i}>{imp.metric}</span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {/* Optional Image */}
                    <div className="still" style={project.image && typeof project.image !== 'string' && project.image.url ? { backgroundImage: `url(${project.image.url})` } : {}}></div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px 0', color: 'var(--ink-soft)' }}>
                <span className="en">No projects available yet.</span><span className="ar">لا توجد مشاريع متاحة بعد.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="band dark letterbox">
        <span className="matte-label en">enerQA / reel 04</span><span className="matte-label ar">إنيرقا / الحلقة 04</span>
        <span className="matte-scene">END SCENE</span>
        <div className="wrap" style={{ textAlign: 'center', padding: '20px 48px' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}><span className="en">Have a similar challenge?</span><span className="ar">هل تواجه تحديًا مشابهًا؟</span></span>
          <h2><span className="en">Let's scope your engagement.</span><span className="ar">لنحدد نطاق مشروعك معًا.</span></h2>
          <div className="hero-cta" style={{ justifyContent: 'center', marginTop: 28 }}>
            <Link href="/contact" className="btn on-dark"><span className="en">Start an inquiry</span><span className="ar">ابدأ استفسارًا</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
