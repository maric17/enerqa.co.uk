import { resolveMediaUrl } from "@/lib/utils";
import React from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import CarbonCalculator from '@/components/tools/CarbonCalculator';

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'tools',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  const tool = result.docs[0];

  if (!tool) {
    notFound();
  }

  // Next step is to implement the CarbonCalculator widget, so we'll check for its slug here
  // as a special case for a "native" interactive tool.
  const isNativeCalculator = tool.slug === 'carbon-calculator';

  return (
    <>
      <section className="relative w-full py-32 bg-ink text-white overflow-hidden">
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-24">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> / 
            <Link href="/tools" className="text-white/60 hover:text-white transition-colors no-underline mx-1">Tools</Link> / 
            <span className="en text-white ml-1">{tool.title}</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">{tool.title}</span>
          </Typography>
        </Container>
      </section>

      <Section theme="light">
        <div className="max-w-4xl mx-auto flex flex-col gap-8 w-full">
          <div className="flex flex-col gap-4">
            <Typography variant="body" className="text-ink text-lg leading-relaxed">
              {tool.desc}
            </Typography>
          </div>

          {/* Interactive Tool (External iframe) */}
          {tool.type === 'interactive' && !isNativeCalculator && tool.iframeUrl && (
            <div className="w-full mt-8 rounded-[16px] overflow-hidden border border-ink/10 shadow-sm bg-[#FAFBFB] aspect-[16/9] md:aspect-[21/9]">
              <iframe 
                src={tool.iframeUrl} 
                className="w-full h-full border-none"
                title={tool.title}
                allowFullScreen
              />
            </div>
          )}

          {/* Interactive Tool (Native React Component) */}
          {tool.type === 'interactive' && isNativeCalculator && (
            <div className="w-full mt-8">
              <CarbonCalculator />
            </div>
          )}

          {/* Informational Guide (PDF Download) */}
          {tool.type === 'informational' && tool.file && typeof tool.file === 'object' && 'url' in tool.file && typeof resolveMediaUrl(tool.file.url) === 'string' && (
            <div className="mt-8 p-8 bg-[#FAFBFB] rounded-[16px] border border-ink/10 flex flex-col items-center justify-center gap-6 text-center shadow-sm">
              <Typography variant="h3" className="text-ink m-0">
                <span className="en">Download this Toolkit</span>
              </Typography>
              <Button href={resolveMediaUrl(tool.file.url)} variant="outline" target="_blank" rel="noopener noreferrer">
                <span className="en">Download PDF</span>
              </Button>
            </div>
          )}
          
          {/* External Link Fallback */}
          {tool.link && !tool.iframeUrl && !tool.file && (
            <div className="mt-8">
              <Button href={tool.link} variant="outline" target="_blank" rel="noopener noreferrer">
                <span className="en">Visit External Link</span>
              </Button>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
