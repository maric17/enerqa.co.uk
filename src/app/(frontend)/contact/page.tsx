'use client';
import React from 'react';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  return (
    <>
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0">
          enerQA / reel 08
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          SCENE 08 — CONTACT
        </div>
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-60 mix-blend-luminosity bg-[url('/assets/images/gas-energy.jpg')]"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink via-ink/30 to-ink/70"></div>
        
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> / <span className="en text-white">Contact</span><span className="ar text-white">تواصل</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">Start a conversation.</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">ابدأ محادثة.</span>
          </Typography>
        </Container>
      </section>

      <Section theme="light">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="flex flex-col gap-8">
              <div>
                <Typography variant="h2" className="text-ink m-0">
                  <span className="en block">Tell us where you sit today.</span>
                  <span className="ar block text-[0.8em] mt-3 text-ink/90">أخبرنا أين تقف اليوم.</span>
                </Typography>
                <p className="text-[17px] md:text-[19px] leading-[1.6] text-ink font-light m-0 mt-4">
                  <span className="en block">We'll route your inquiry to the right advisory lead — usually within two business days.</span>
                  <span className="ar block mt-4">سنوجّه استفسارك إلى المستشار المناسب — عادة خلال يومي عمل.</span>
                </p>
              </div>
              
              <div className="flex flex-col gap-3 mt-4">
                <label className="flex items-start gap-4 p-5 rounded-[12px] border border-ink/10 cursor-pointer hover:border-ink/30 transition-colors bg-white">
                  <div className="flex-1">
                    <div className="text-[15px] font-bold text-ink"><span className="en">General inquiry</span><span className="ar">استفسار عام</span></div>
                    <div className="text-[14px] text-ink-soft mt-1"><span className="en">Questions about our work or capabilities</span><span className="ar">أسئلة حول عملنا أو قدراتنا</span></div>
                  </div>
                  <input type="radio" name="tier" defaultChecked className="mt-1 w-4 h-4 accent-ink" />
                </label>
                <label className="flex items-start gap-4 p-5 rounded-[12px] border border-ink/10 cursor-pointer hover:border-ink/30 transition-colors bg-white">
                  <div className="flex-1">
                    <div className="text-[15px] font-bold text-ink"><span className="en">Project / consulting request</span><span className="ar">طلب مشروع / استشارة</span></div>
                    <div className="text-[14px] text-ink-soft mt-1"><span className="en">Scoped engagement or proposal request</span><span className="ar">طلب تكليف محدد النطاق أو مقترح</span></div>
                  </div>
                  <input type="radio" name="tier" className="mt-1 w-4 h-4 accent-ink" />
                </label>
                <label className="flex items-start gap-4 p-5 rounded-[12px] border border-ink/10 cursor-pointer hover:border-ink/30 transition-colors bg-white">
                  <div className="flex-1">
                    <div className="text-[15px] font-bold text-ink"><span className="en">Media &amp; partnerships</span><span className="ar">الإعلام والشراكات</span></div>
                    <div className="text-[14px] text-ink-soft mt-1"><span className="en">Press, speaking, or institutional partnership</span><span className="ar">صحافة أو مشاركة أو شراكة مؤسسية</span></div>
                  </div>
                  <input type="radio" name="tier" className="mt-1 w-4 h-4 accent-ink" />
                </label>
                <label className="flex items-start gap-4 p-5 rounded-[12px] border border-ink/10 cursor-pointer hover:border-ink/30 transition-colors bg-white" id="careers">
                  <div className="flex-1">
                    <div className="text-[15px] font-bold text-ink"><span className="en">Careers</span><span className="ar">الوظائف</span></div>
                    <div className="text-[14px] text-ink-soft mt-1"><span className="en">Roles, internships and applications</span><span className="ar">الوظائف والتدريب والطلبات</span></div>
                  </div>
                  <input type="radio" name="tier" className="mt-1 w-4 h-4 accent-ink" />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 mt-4 border-t border-ink/10">
                <div>
                  <h6 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink/50 m-0 mb-1"><span className="en">Office</span><span className="ar">المكتب</span></h6>
                  <p className="text-[14px] text-ink font-medium m-0"><span className="en">London, United Kingdom</span><span className="ar">لندن، المملكة المتحدة</span></p>
                </div>
                <div>
                  <h6 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink/50 m-0 mb-1"><span className="en">Email</span><span className="ar">البريد الإلكتروني</span></h6>
                  <p className="text-[14px] text-ink font-medium m-0">info@enerqa.co.uk</p>
                </div>
                <div>
                  <h6 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink/50 m-0 mb-1"><span className="en">Response time</span><span className="ar">وقت الرد</span></h6>
                  <p className="text-[14px] text-ink font-medium m-0"><span className="en">Within 2 business days</span><span className="ar">خلال يومي عمل</span></p>
                </div>
              </div>
            </div>

            <form className="flex flex-col gap-5 p-8 rounded-[16px] bg-[#FAFBFB] border border-ink/10 shadow-[0_10px_30px_rgba(0,0,0,0.02)] h-fit" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="c-name" className="text-[13px] font-bold text-ink"><span className="en">Full name</span><span className="ar">الاسم الكامل</span></label>
                  <input type="text" id="c-name" className="w-full bg-white border border-ink/10 rounded-md px-4 py-3 text-[14px] text-ink outline-none focus:border-ink/30 transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="c-org" className="text-[13px] font-bold text-ink"><span className="en">Organisation</span><span className="ar">الجهة</span></label>
                  <input type="text" id="c-org" className="w-full bg-white border border-ink/10 rounded-md px-4 py-3 text-[14px] text-ink outline-none focus:border-ink/30 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="c-email" className="text-[13px] font-bold text-ink"><span className="en">Email</span><span className="ar">البريد الإلكتروني</span></label>
                  <input type="email" id="c-email" className="w-full bg-white border border-ink/10 rounded-md px-4 py-3 text-[14px] text-ink outline-none focus:border-ink/30 transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="c-country" className="text-[13px] font-bold text-ink"><span className="en">Country</span><span className="ar">الدولة</span></label>
                  <input type="text" id="c-country" className="w-full bg-white border border-ink/10 rounded-md px-4 py-3 text-[14px] text-ink outline-none focus:border-ink/30 transition-colors" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="c-msg" className="text-[13px] font-bold text-ink"><span className="en">Message</span><span className="ar">الرسالة</span></label>
                <textarea id="c-msg" placeholder="Tell us about your context and objectives" rows={5} className="w-full bg-white border border-ink/10 rounded-md px-4 py-3 text-[14px] text-ink outline-none focus:border-ink/30 transition-colors resize-none en"></textarea>
                <textarea id="c-msg-ar" placeholder="أخبرنا عن سياق عملك وأهدافك" rows={5} className="w-full bg-white border border-ink/10 rounded-md px-4 py-3 text-[14px] text-ink outline-none focus:border-ink/30 transition-colors resize-none ar"></textarea>
              </div>
              <Button variant="primary" className="justify-center mt-2 py-3">
                <span className="en">Submit inquiry</span><span className="ar">إرسال الاستفسار</span>
              </Button>
            </form>
          </div>
        </div>
      </Section>

      <Section theme="muted">
        <div className="max-w-[800px] mx-auto text-center flex flex-col items-center gap-6">
          <Typography variant="eyebrow" className="text-ink-muted m-0 flex justify-center w-full">
            <span className="en">Prefer to browse first?</span><span className="ar">تفضّل التصفّح أولًا؟</span>
          </Typography>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Button href="/services" variant="outline">
              <span className="en">See our domains</span><span className="ar ml-2">اطّلع على مجالاتنا</span>
            </Button>
            <Button href="/knowledge-hub" variant="outline">
              <span className="en">Browse publications</span><span className="ar ml-2">تصفح المنشورات</span>
            </Button>
            <Button href="/projects" variant="outline">
              <span className="en">Read case studies</span><span className="ar ml-2">اقرأ دراسات الحالة</span>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
