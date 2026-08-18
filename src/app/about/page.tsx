import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <section className="page-hero letterbox">
        <span className="matte-label">enerQA / reel 02</span>
        <span className="matte-scene">SCENE 02 — ABOUT</span>
        <div className="still b"></div>
        <div className="page-hero-copy">
          <div className="crumbs"><Link href="/">Home</Link> / <span className="en">About</span><span className="ar">من نحن</span></div>
          <h1><span className="en">Built on field experience, run on evidence.</span><span className="ar">مبنيّون على خبرة ميدانية، ونعمل بالأدلة.</span></h1>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <span className="section-index en">01 — Background</span><span className="section-index ar">01 — الخلفية</span>
          <div className="article-feature reveal">
            <div>
              <h2><span className="en">A collective of practitioners, not a slide deck.</span><span className="ar">مجموعة من الممارسين، لا مجرد عرض تقديمي.</span></h2>
              <p className="lede" style={{ marginTop: 20 }}>
                <span className="en">Building on the professional heritage of its founders and anchored by a diverse group of experienced professionals committed to environmental responsibility, enerQA sees itself as a driving force in shaping a sustainable future. We don't just deliver solutions — we build collaborative partnerships tailored to the challenges faced by a broad range of stakeholders, from startups to established institutions and government agencies.</span>
                <span className="ar">بالاستناد إلى الإرث المهني لمؤسسيها ومجموعة متنوعة من المتخصصين ذوي الخبرة الملتزمين بالمسؤولية البيئية، ترى إنيرقا نفسها قوة دافعة في تشكيل مستقبل مستدام. نحن لا نكتفي بتقديم الحلول، بل نبني شراكات تعاونية مصممة خصيصًا للتحديات التي تواجه طيفًا واسعًا من أصحاب المصلحة، من الشركات الناشئة إلى المؤسسات الراسخة والجهات الحكومية.</span>
              </p>
              <p style={{ marginTop: 16 }}>
                <span className="en">Our philosophy is rooted in research and innovation, emphasising practical solutions grounded in data and scientific rigor.</span>
                <span className="ar">تقوم فلسفتنا على البحث والابتكار، مع التركيز على حلول عملية مستندة إلى البيانات والدقة العلمية.</span>
              </p>
            </div>
            <div className="still" style={{ minHeight: 380, borderRadius: 18 }}></div>
          </div>
        </div>
      </section>

      <section className="band forest">
        <div className="wrap">
          <div className="dl-domains reveal" style={{ background: 'var(--line-dark)', borderColor: 'var(--line-dark)' }}>
            <Link href="/services" style={{ background: 'rgba(255,255,255,.04)' }}>
              <h4><span className="en">Experienced professionals</span><span className="ar">متخصصون ذوو خبرة</span></h4>
              <p><span className="en">A cross-disciplinary bench spanning engineering, climate science, finance and safeguards.</span><span className="ar">فريق متعدد التخصصات يجمع الهندسة وعلوم المناخ والتمويل والضمانات البيئية.</span></p>
            </Link>
            <Link href="/services" style={{ background: 'rgba(255,255,255,.04)' }}>
              <h4><span className="en">Flexible service offerings</span><span className="ar">خدمات مرنة وقابلة للتخصيص</span></h4>
              <p><span className="en">Scoped engagements that flex to the client's stage, from feasibility to full delivery.</span><span className="ar">تكليفات مرنة تتكيف مع مرحلة العميل، من الجدوى إلى التسليم الكامل.</span></p>
            </Link>
            <Link href="/services" style={{ background: 'rgba(255,255,255,.04)' }}>
              <h4><span className="en">Active stakeholder engagement</span><span className="ar">تفاعل فعّال مع أصحاب المصلحة</span></h4>
              <p><span className="en">Participatory design that keeps communities and regulators inside the process.</span><span className="ar">تصميم تشاركي يُبقي المجتمعات والجهات الرقابية جزءًا من العملية.</span></p>
            </Link>
            <Link href="/services" style={{ background: 'rgba(255,255,255,.04)' }}>
              <h4><span className="en">Research &amp; development focus</span><span className="ar">التركيز على البحث والتطوير</span></h4>
              <p><span className="en">Continuous investment in methods, tools and publications ahead of client need.</span><span className="ar">استثمار مستمر في الأساليب والأدوات والمنشورات استباقًا لاحتياجات العملاء.</span></p>
            </Link>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <span className="section-index en">02 — Mission &amp; objective</span><span className="section-index ar">02 — الرسالة والهدف</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44 }} className="reveal">
            <div className="pull">
              <span className="en">To globally avail knowledge and good practices in climate change, energy, environmental &amp; social safeguards and related business solutions.</span>
              <span className="ar">إتاحة المعرفة والممارسات الجيدة عالميًا في مجالات تغيّر المناخ والطاقة والضمانات البيئية والاجتماعية وحلول الأعمال ذات الصلة.</span>
            </div>
            <div>
              <h3 className="en">Our objective</h3><h3 className="ar">هدفنا</h3>
              <p style={{ marginTop: 14 }}>
                <span className="en">To cultivate wisdom by transforming data into knowledge and refining it into fundamental principles — bridging the gap from data and information to universal, useful and accessible knowledge for energy, climate change, sustainability and business solutions.</span>
                <span className="ar">تنمية الحكمة عبر تحويل البيانات إلى معرفة وتكريرها إلى مبادئ أساسية — لسدّ الفجوة بين البيانات والمعلومات ومعرفة عملية ومتاحة في الطاقة وتغيّر المناخ والاستدامة وحلول الأعمال.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="band dark letterbox">
        <span className="matte-label en">enerQA / reel 02</span><span className="matte-label ar">إنيرقا / الحلقة 02</span>
        <span className="matte-scene">END SCENE</span>
        <div className="wrap" style={{ textAlign: 'center', padding: '20px 48px' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}><span className="en">Governance</span><span className="ar">الحوكمة</span></span>
          <h2><span className="en">Independent by design, accountable by practice.</span><span className="ar">مستقلون بالتصميم، مسؤولون بالممارسة.</span></h2>
          <div className="hero-cta" style={{ justifyContent: 'center', marginTop: 28 }}>
            <Link href="/team" className="btn on-dark"><span className="en">Meet the experts</span><span className="ar">تعرّف على الخبراء</span></Link>
            <Link href="/services" className="btn ghost light"><span className="en">See our domains</span><span className="ar">اطّلع على مجالاتنا</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
