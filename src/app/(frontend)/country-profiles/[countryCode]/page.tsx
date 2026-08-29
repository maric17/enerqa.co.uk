import React from 'react';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { GHGEmissionsChart, TemperatureTrendChart } from '@/components/shared/CountryCharts';

// Mock data fetching function based on countryCode
async function getCountryData(countryCode: string) {
  // In a real implementation, this would fetch from WRI API, CCKP API, etc.
  // For now, we return mock data based on the code.
  const code = countryCode.toUpperCase();
  const name = code === 'QAT' ? 'Qatar' : code === 'OMN' ? 'Oman' : code;
  const arabicName = code === 'QAT' ? 'قطر' : code === 'OMN' ? 'عمان' : code;
  
  return {
    code,
    name,
    arabicName,
    vulnerabilityIndex: 42.5, // Mock score out of 100
    readinessIndex: 68.2, // Mock score out of 100
    latestEmissions: '102.5 MtCO₂e',
    renewableTarget: '20% by 2030'
  };
}

export default async function CountryProfilePage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params;
  const countryData = await getCountryData(countryCode);

  return (
    <>
      <section className="relative w-full py-20 bg-ink text-white overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-20 bg-[url('/assets/images/hero-bg.jpg')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-transparent z-10"></div>
        
        <Container className="relative z-20 flex flex-col gap-6 items-start">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> 
            {' '}/{' '}
            <Link href="/data-explorer" className="text-white/60 hover:text-white transition-colors no-underline">Data Explorer</Link> 
            {' '}/{' '}
            <span className="en text-white">{countryData.name}</span>
            <span className="ar text-white">{countryData.arabicName}</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Simple flag placeholder */}
            <div className="w-16 h-12 bg-white/10 rounded-sm border border-white/20 flex items-center justify-center overflow-hidden">
              <span className="text-2xl font-bold text-white/50">{countryData.code}</span>
            </div>
            <Typography variant="h1" className="text-white m-0">
              <span className="en block">{countryData.name} Climate Profile</span>
              <span className="ar block text-[0.8em] mt-2 text-white/90">الملف المناخي - {countryData.arabicName}</span>
            </Typography>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 flex flex-col min-w-[150px]">
              <span className="text-[11px] uppercase tracking-wider text-white/60 mb-1">
                <span className="en">Vulnerability Index</span><span className="ar ml-2">مؤشر الضعف</span>
              </span>
              <span className="text-2xl font-bold text-white">{countryData.vulnerabilityIndex}</span>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 flex flex-col min-w-[150px]">
              <span className="text-[11px] uppercase tracking-wider text-white/60 mb-1">
                <span className="en">Readiness Index</span><span className="ar ml-2">مؤشر الجاهزية</span>
              </span>
              <span className="text-2xl font-bold text-white">{countryData.readinessIndex}</span>
            </div>
          </div>
        </Container>
      </section>

      <Section theme="light">
        <div className="w-full flex flex-col gap-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GHGEmissionsChart />
            <TemperatureTrendChart />
          </div>

          <div className="bg-[#FAFBFB] border border-ink/10 rounded-[16px] p-8 mt-4">
            <Typography variant="h3" className="text-ink mb-6">
              <span className="en block">Key Indicators & Policies</span>
              <span className="ar block text-[0.8em] mt-1 text-ink-soft">المؤشرات والسياسات الرئيسية</span>
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-bold text-ink-soft uppercase tracking-wider">
                  <span className="en">Latest GHG Emissions</span>
                </span>
                <span className="text-xl text-ink font-medium">{countryData.latestEmissions}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-bold text-ink-soft uppercase tracking-wider">
                  <span className="en">Renewable Energy Target</span>
                </span>
                <span className="text-xl text-ink font-medium">{countryData.renewableTarget}</span>
                <div className="mt-2">
                  <Badge variant="outline">
                    <span className="en">National Climate Strategy 2030</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </Section>
    </>
  );
}
