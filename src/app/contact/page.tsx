'use client';
import React from 'react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <>
      <section className="page-hero letterbox">
        <span className="matte-label">enerQA / reel 08</span>
        <span className="matte-scene">SCENE 08 — CONTACT</span>
        <div className="still"></div>
        <div className="page-hero-copy">
          <div className="crumbs"><Link href="/">Home</Link> / <span className="en">Contact</span><span className="ar">تواصل</span></div>
          <h1><span className="en">Start a conversation.</span><span className="ar">ابدأ محادثة.</span></h1>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="contact-split">
            <div className="reveal">
              <h2><span className="en">Tell us where you sit today.</span><span className="ar">أخبرنا أين تقف اليوم.</span></h2>
              <p className="lede" style={{ marginTop: 16 }}>
                <span className="en">We'll route your inquiry to the right advisory lead — usually within two business days.</span>
                <span className="ar">سنوجّه استفسارك إلى المستشار المناسب — عادة خلال يومي عمل.</span>
              </p>
              <div className="tier-list">
                <label className="tier">
                  <div>
                    <div className="t-label en">General inquiry</div><div className="t-label ar">استفسار عام</div>
                    <div className="t-desc en">Questions about our work or capabilities</div><div className="t-desc ar">أسئلة حول عملنا أو قدراتنا</div>
                  </div>
                  <input type="radio" name="tier" defaultChecked />
                </label>
                <label className="tier">
                  <div>
                    <div className="t-label en">Project / consulting request</div><div className="t-label ar">طلب مشروع / استشارة</div>
                    <div className="t-desc en">Scoped engagement or proposal request</div><div className="t-desc ar">طلب تكليف محدد النطاق أو مقترح</div>
                  </div>
                  <input type="radio" name="tier" />
                </label>
                <label className="tier">
                  <div>
                    <div className="t-label en">Media &amp; partnerships</div><div className="t-label ar">الإعلام والشراكات</div>
                    <div className="t-desc en">Press, speaking, or institutional partnership</div><div className="t-desc ar">صحافة أو مشاركة أو شراكة مؤسسية</div>
                  </div>
                  <input type="radio" name="tier" />
                </label>
                <label className="tier" id="careers">
                  <div>
                    <div className="t-label en">Careers</div><div className="t-label ar">الوظائف</div>
                    <div className="t-desc en">Roles, internships and applications</div><div className="t-desc ar">الوظائف والتدريب والطلبات</div>
                  </div>
                  <input type="radio" name="tier" />
                </label>
              </div>

              <div className="info-strip">
                <div>
                  <h6><span className="en">Office</span><span className="ar">المكتب</span></h6>
                  <p><span className="en">London, United Kingdom</span><span className="ar">لندن، المملكة المتحدة</span></p>
                </div>
                <div>
                  <h6><span className="en">Email</span><span className="ar">البريد الإلكتروني</span></h6>
                  <p>info@enerqa.co.uk</p>
                </div>
                <div>
                  <h6><span className="en">Response time</span><span className="ar">وقت الرد</span></h6>
                  <p><span className="en">Within 2 business days</span><span className="ar">خلال يومي عمل</span></p>
                </div>
              </div>
            </div>

            <form className="contact-form reveal d1" onSubmit={(e) => e.preventDefault()}>
              <div className="row2">
                <div><label htmlFor="c-name" className="en">Full name</label><label htmlFor="c-name" className="ar">الاسم الكامل</label><input type="text" id="c-name" /></div>
                <div><label htmlFor="c-org" className="en">Organisation</label><label htmlFor="c-org" className="ar">الجهة</label><input type="text" id="c-org" /></div>
              </div>
              <div className="row2">
                <div><label htmlFor="c-email" className="en">Email</label><label htmlFor="c-email" className="ar">البريد الإلكتروني</label><input type="email" id="c-email" /></div>
                <div><label htmlFor="c-country" className="en">Country</label><label htmlFor="c-country" className="ar">الدولة</label><input type="text" id="c-country" /></div>
              </div>
              <label htmlFor="c-msg" className="en">Message</label><label htmlFor="c-msg" className="ar">الرسالة</label>
              <textarea id="c-msg" placeholder="Tell us about your context and objectives" className="en"></textarea>
              <textarea id="c-msg-ar" placeholder="أخبرنا عن سياق عملك وأهدافك" className="ar"></textarea>
              <button className="btn"><span className="en">Submit inquiry</span><span className="ar">إرسال الاستفسار</span></button>
            </form>
          </div>
        </div>
      </section>

      <section className="band forest tight">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}><span className="en">Prefer to browse first?</span><span className="ar">تفضّل التصفّح أولًا؟</span></span>
          <div className="hero-cta" style={{ justifyContent: 'center', marginTop: 18 }}>
            <Link href="/services" className="btn ghost"><span className="en">See our domains</span><span className="ar">اطّلع على مجالاتنا</span></Link>
            <Link href="/knowledge-hub" className="btn ghost"><span className="en">Browse publications</span><span className="ar">تصفح المنشورات</span></Link>
            <Link href="/projects" className="btn ghost"><span className="en">Read case studies</span><span className="ar">اقرأ دراسات الحالة</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
