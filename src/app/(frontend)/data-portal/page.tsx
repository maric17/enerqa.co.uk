import React from 'react';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import DataExplorerDashboard from '@/components/shared/DataExplorerDashboard';
import DatasetList from '@/components/DatasetList';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export default async function DataExplorerPage() {
  const payload = await getPayload({ config: configPromise });
  
  const datasets = await payload.find({
    collection: 'datasets',
    sort: '-date',
    limit: 50,
    depth: 2,
  });

  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
  });

  return (
    <>
      <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-[url('/assets/images/data-portal-banner.jpg')] opacity-60 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/60 to-ink z-10"></div>
        
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-24 md:mt-32">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> 
            {' '}/{' '}
            <span className="en text-white">Data Portal</span>
            <span className="ar text-white">بوابة البيانات</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">Climate Data Portal</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">بوابة بيانات المناخ</span>
          </Typography>
          <p className="text-[15px] md:text-[17px] leading-[1.6] text-white/80 max-w-[700px] m-0">
            <span className="en block">Visualize and download climate datasets, emissions indicators, and energy transition metrics across the MENA region.</span>
            <span className="ar block mt-2">تصور وتنزيل مجموعات البيانات المناخية ومؤشرات الانبعاثات ومقاييس انتقال الطاقة عبر منطقة الشرق الأوسط وشمال أفريقيا.</span>
          </p>
        </Container>
      </section>

      <Section theme="light">
        <div className="w-full flex flex-col gap-8">
          <div className="mb-4">
            <Typography variant="eyebrow" className="text-ink-muted mb-0">
              <span className="en">Interactive Dashboard</span>
              <span className="ar ml-2">لوحة معلومات تفاعلية</span>
            </Typography>
          </div>
          <DataExplorerDashboard />
        </div>
      </Section>

      <Section theme="white" className="border-t border-ink/5">
        <div className="w-full flex flex-col gap-12">
          <Typography variant="eyebrow" className="text-ink-muted mb-0">
            <span className="en">Searchable Datasets Catalogue</span>
            <span className="ar ml-2">كتالوج البيانات القابل للبحث</span>
          </Typography>
          
          <DatasetList datasets={datasets.docs as any} categories={categories.docs as any} />
        </div>
      </Section>

      <Section theme="dark" id="api">
        <div className="w-full flex flex-col md:flex-row gap-12 lg:gap-24 items-start">
          <div className="flex-1 flex flex-col gap-6">
            <Typography variant="eyebrow" className="text-white/60 mb-0">
              <span className="en">Developer Access</span>
              <span className="ar ml-2">وصول المطورين</span>
            </Typography>
            <Typography variant="h2" className="text-white m-0">
              <span className="en block">Data &amp; Graphical APIs</span>
              <span className="ar block text-[0.8em] mt-2 text-white/90">واجهات برمجة البيانات والرسوم البيانية</span>
            </Typography>
            <p className="text-[15px] md:text-[17px] leading-[1.6] text-white/80 max-w-[600px] m-0">
              <span className="en block">Integrate our climate datasets directly into your models, dashboards, or applications. Our RESTful APIs provide programmatic access to historical data, real-time indicators, and dynamically generated graphical charts.</span>
              <span className="ar block mt-3">قم بدمج مجموعات البيانات المناخية الخاصة بنا مباشرة في نماذجك أو لوحات المعلومات أو التطبيقات. توفر واجهات برمجة التطبيقات الخاصة بنا وصولاً برمجيًا إلى البيانات التاريخية والمؤشرات في الوقت الفعلي.</span>
            </p>
            <div className="mt-4">
              <Link href="/contact" className="inline-block bg-white text-ink px-8 py-4 rounded-[4px] font-bold text-[14px] uppercase tracking-[0.1em] hover:bg-white/90 transition-colors no-underline">
                <span className="en">Request API Key</span><span className="ar ml-2">طلب مفتاح API</span>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full bg-ink-soft/40 p-6 md:p-8 rounded-[16px] border border-white/10">
            <Typography variant="h3" className="text-white m-0 mb-4">
              <span className="en">API Endpoints Overview</span>
            </Typography>
            <div className="flex flex-col gap-4 font-mono text-[13px] md:text-[14px]">
              <div className="flex flex-col gap-1">
                <span className="text-white/50 uppercase text-[10px] tracking-wider">Emissions Data</span>
                <div className="bg-ink p-3 rounded text-green-400 overflow-x-auto">
                  GET /api/climate/emissions?country=Qatar&amp;year=2023
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-white/50 uppercase text-[10px] tracking-wider">Renewable Capacity Data</span>
                <div className="bg-ink p-3 rounded text-green-400 overflow-x-auto">
                  GET /api/climate/energy?region=MENA
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-white/50 uppercase text-[10px] tracking-wider">Generate SVG Chart</span>
                <div className="bg-ink p-3 rounded text-blue-400 overflow-x-auto">
                  GET /api/graphical/chart?dataset=emissions&amp;type=line
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
