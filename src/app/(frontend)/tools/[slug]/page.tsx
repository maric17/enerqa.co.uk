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
import { RichText } from '@payloadcms/richtext-lexical/react';
import { RequestAccessForm } from '@/components/tools/RequestAccessForm';

import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'tools',
    where: { slug: { equals: slug } },
    limit: 1,
  });

  const tool = result.docs[0];
  if (!tool) return { title: 'Not Found' };

  return {
    title: String(tool.title),
    description: tool.desc ? String(tool.desc) : undefined,
  };
}

export default async function ToolDetailPage({ params }: Props) {
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: tool.title,
                description: tool.desc,
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Any',
                url: `https://enerqa.co.uk/tools/${tool.slug}`,
                softwareVersion: tool.version || undefined,
              },
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://enerqa.co.uk/' },
                  { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://enerqa.co.uk/tools' },
                  { '@type': 'ListItem', position: 3, name: tool.title }
                ]
              }
            ])
          }}
        />
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-24">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> / 
            <Link href="/tools" className="text-white/60 hover:text-white transition-colors no-underline mx-1">Tools</Link> / 
            <span className="en text-white ml-1">{tool.title}</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">{tool.title}</span>
          </Typography>
          {tool.version && (
            <div className="text-white/80 text-sm bg-white/10 px-3 py-1 rounded">
              Version: {tool.version as string}
            </div>
          )}
        </Container>
      </section>

      <Section theme="light">
        <div className="max-w-4xl mx-auto flex flex-col gap-12 w-full">
          
          {/* TD01: Tool Overview */}
          <div className="flex flex-col gap-4">
            {tool.purpose ? (
              <div className="prose prose-lg prose-ink max-w-none">
                <RichText data={tool.purpose as any} />
              </div>
            ) : (
              <Typography variant="body" className="text-ink text-lg leading-relaxed">
                {tool.desc}
              </Typography>
            )}
          </div>

          {/* TD02: Inputs and Outputs */}
          {(tool.inputs || tool.outputs) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tool.inputs && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Inputs</h3>
                  <div className="prose prose-ink max-w-none">
                    <RichText data={tool.inputs as any} />
                  </div>
                </div>
              )}
              {tool.outputs && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Outputs</h3>
                  <div className="prose prose-ink max-w-none">
                    <RichText data={tool.outputs as any} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TD03: Methodology and Limits */}
          {tool.method && (
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-bold">Methodology and Limits</h3>
              <div className="prose prose-lg prose-ink max-w-none">
                <RichText data={tool.method as any} />
              </div>
            </div>
          )}

          {/* TD04: Access the Tool */}
          <div className="border-t border-ink/10 pt-12 flex flex-col gap-6">
            <h3 className="text-2xl font-bold">Access the Tool</h3>
            
            {tool.access === 'Request Access' && (
              <div className="bg-white border border-ink/10 rounded-lg p-6 shadow-sm">
                <Typography variant="body" className="mb-4">
                  This tool is available upon request. Please fill out the form below to request access.
                </Typography>
                <RequestAccessForm toolId={String(tool.id)} />
              </div>
            )}

            {tool.access !== 'Request Access' && (
              <div className="flex flex-col gap-8">
                {/* Interactive Tool (External iframe) */}
                {tool.type === 'interactive' && !isNativeCalculator && tool.iframeUrl && (
                  <div className="w-full rounded-[16px] overflow-hidden border border-ink/10 shadow-sm bg-[#FAFBFB] aspect-[16/9] md:aspect-[21/9]">
                    <iframe 
                      src={tool.iframeUrl as string} 
                      className="w-full h-full border-none"
                      title={tool.title}
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Interactive Tool (Native React Component) */}
                {tool.type === 'interactive' && isNativeCalculator && (
                  <div className="w-full">
                    <CarbonCalculator />
                  </div>
                )}

                {/* Informational Guide (PDF Download) */}
                {tool.type === 'informational' && tool.file && typeof tool.file === 'object' && 'url' in tool.file && typeof resolveMediaUrl(tool.file.url) === 'string' && (
                  <div className="p-8 bg-[#FAFBFB] rounded-[16px] border border-ink/10 flex flex-col items-center justify-center gap-6 text-center shadow-sm">
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
                  <div>
                    <Button href={tool.link as string} variant="outline" target="_blank" rel="noopener noreferrer">
                      <span className="en">Visit External Link</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Privacy Note */}
          {tool.privacy && (
            <div className="mt-8 text-sm text-ink-muted">
              <div className="prose prose-sm max-w-none">
                <RichText data={tool.privacy as any} />
              </div>
            </div>
          )}

          {/* TD05: Guidance and Support */}
          <div className="bg-[#FAFBFB] border border-ink/10 rounded-lg p-8 text-center flex flex-col gap-4 mt-8">
            <h3 className="text-xl font-bold">Guidance and Support</h3>
            <Typography variant="body" className="max-w-2xl mx-auto block">
              For assistance with this tool, technical support, or to discuss a broader project implementation, please contact our team.
            </Typography>
            <div>
              <Button href="/contact?intent=tool-support" variant="primary">
                Contact Support
              </Button>
            </div>
          </div>

        </div>
      </Section>
    </>
  );
}
