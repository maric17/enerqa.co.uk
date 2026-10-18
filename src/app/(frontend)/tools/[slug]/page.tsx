import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import CarbonCalculator from '@/components/tools/CarbonCalculator';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { publishedToolsWhere } from '@/collections/Tools';
import { Container } from '@/components/ui/Container';
import { ExternalEmbed } from '@/components/ExternalEmbed';
import { NATIVE_CALCULATOR_SLUG, getToolAccess, requestAccessHref } from '../access';
import { resolveMediaUrl } from '@/lib/utils';

import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

// pp. 3, 166: only validated tools publish, so an unvalidated slug is a 404.
// `cache` shares the one lookup between generateMetadata and the page.
const getPublishedTool = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'tools',
    where: { and: [{ slug: { equals: slug } }, publishedToolsWhere] },
    limit: 1,
    depth: 1,
  });
  return result.docs[0] ?? null;
});

const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getPublishedTool(slug);
  // Unknown and unvalidated slugs render the 404 page (see below); p. 208 names it.
  if (!tool) return { title: 'Page Not Found' };

  return {
    title: String(tool.title),
    // The p. 165 T02 narrative for the flagships (p. 191: TD01 intro copy).
    description: tool.desc ? String(tool.desc) : undefined,
    alternates: { canonical: `/tools/${tool.slug}` },
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getPublishedTool(slug);

  if (!tool) {
    notFound();
  }

  // p. 191: the action is decided by the real tool (file, application or
  // controlled provision), never by the template.
  const access = getToolAccess(tool);
  const file = tool.file && typeof tool.file === 'object' ? tool.file : null;
  const relatedDomains = (tool.domains ?? []).filter(
    (domain): domain is Exclude<typeof domain, number> => typeof domain === 'object' && Boolean(domain?.slug),
  );
  const hasMethod = Boolean(tool.method || tool.assumptions || tool.version);

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
          <nav aria-label="Breadcrumb" className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link>
            <span aria-hidden="true"> / </span>
            <Link href="/tools" className="text-white/60 hover:text-white transition-colors no-underline">Tools</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className="en text-white">{tool.title}</span>
          </nav>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">{tool.title}</span>
          </Typography>
        </Container>
      </section>

      <Section theme="light">
        <div className="max-w-4xl mx-auto flex flex-col gap-12 w-full">

          {/* TD01 Tool Overview (p. 191): validated name, purpose (the p. 165 T02
              narrative for flagships), current availability, and Request Access
              as the default action until a tested file or tool is confirmed. */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Tool Overview</h2>
            {tool.purpose ? (
              <div className="prose prose-lg prose-ink max-w-none">
                <RichText data={tool.purpose as any} />
              </div>
            ) : (
              <Typography variant="body" className="text-ink text-lg leading-relaxed">
                {tool.desc}
              </Typography>
            )}
            <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted m-0">
              Availability: {access.availability}
            </p>
            <div>
              <Button
                href={access.href}
                variant="primary"
                {...(access.kind === 'online' && !access.embedded ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {access.label}
              </Button>
            </div>
          </div>

          {/* TD02 Inputs and Outputs (p. 191): approved text only, so the section
              is hidden when a tool has none on record. */}
          {(tool.inputs || tool.outputs) && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold">Inputs and Outputs</h2>
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
            </div>
          )}

          {/* TD03 Methodology and Limits (p. 191): method, default assumptions and
              limits, and the confirmed version. Hidden until approved text exists. */}
          {hasMethod && (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Methodology and Limits</h2>
              {tool.method && (
                <div className="prose prose-lg prose-ink max-w-none">
                  <RichText data={tool.method as any} />
                </div>
              )}
              {tool.assumptions && (
                <div className="prose prose-lg prose-ink max-w-none">
                  <RichText data={tool.assumptions as any} />
                </div>
              )}
              {tool.version && (
                <p className="text-sm text-ink-muted m-0">Version: {tool.version}</p>
              )}
            </div>
          )}

          {/* TD04 Access the Tool (p. 191). id + scroll offset so a catalogue
              "Launch Tool" can land here directly. Only the verified action shows. */}
          <div id="access" className="border-t border-ink/10 pt-12 flex flex-col gap-6 scroll-mt-24">
            <h2 className="text-2xl font-bold">Access the Tool</h2>

            {access.kind === 'request' && (
              <div className="bg-white border border-ink/10 rounded-lg p-6 shadow-sm flex flex-col gap-4 items-start">
                {/* p. 166 (T05) request copy; the form itself lives on /contact. */}
                <Typography variant="body" className="m-0">
                  Tell us which tool you are interested in and how you intend to use it.
                </Typography>
                <Button href={access.href} variant="primary">
                  Request Access
                </Button>
              </div>
            )}

            {access.kind === 'download' && (
              <div className="p-8 bg-[#FAFBFB] rounded-[16px] border border-ink/10 flex flex-col gap-4 items-start shadow-sm">
                {/* p. 191: file type, version and size alongside a cleared file. */}
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm m-0 mb-4">
                  {file?.mimeType && (<><dt className="font-semibold">File type</dt><dd className="m-0">{file.mimeType}</dd></>)}
                  {tool.version && (<><dt className="font-semibold">Version</dt><dd className="m-0">{tool.version}</dd></>)}
                  {file?.filesize ? (<><dt className="font-semibold">Size</dt><dd className="m-0">{formatBytes(file.filesize)}</dd></>) : null}
                  {tool.licence && (<><dt className="font-semibold">Licence</dt><dd className="m-0">{tool.licence as string}</dd></>)}
                </dl>
                
                {tool.systemRequirements && (
                  <div className="prose prose-sm max-w-none mb-4">
                    <h3 className="text-sm font-semibold m-0 mb-1">System Requirements</h3>
                    <RichText data={tool.systemRequirements as any} />
                  </div>
                )}
                
                <Button href={access.href} variant="primary" target="_blank" rel="noopener noreferrer">
                  Download Tool
                </Button>
              </div>
            )}

            {access.kind === 'online' && access.embedded && tool.slug === NATIVE_CALCULATOR_SLUG && (
              <div className="w-full">
                <CarbonCalculator />
              </div>
            )}

            {access.kind === 'online' && access.embedded && tool.slug !== NATIVE_CALCULATOR_SLUG && tool.iframeUrl && (
              <div className="w-full rounded-[16px] overflow-hidden border border-ink/10 shadow-sm bg-[#FAFBFB] aspect-[16/9] md:aspect-[21/9]">
                {/* A third-party tool may set its own cookies: it loads only with consent (p. 208 U03). */}
                <ExternalEmbed src={tool.iframeUrl} title={tool.title} className="w-full h-full border-none" />
              </div>
            )}

            {access.kind === 'online' && !access.embedded && (
              <div>
                <Button href={access.href} variant="primary" target="_blank" rel="noopener noreferrer">
                  Launch Tool
                </Button>
              </div>
            )}
          </div>

          {/* TD05 Guidance and Support (p. 191): how inputs are handled (privacy),
              related domains, and a support contact on the spec's tool route
              (/contact ignores other intents). No user guide is on record yet. */}
          <div className="bg-[#FAFBFB] border border-ink/10 rounded-lg p-8 flex flex-col gap-4">
            <h2 className="text-xl font-bold">Guidance and Support</h2>
            {tool.privacy && (
              <div className="prose prose-sm max-w-none">
                <RichText data={tool.privacy as any} />
              </div>
            )}
            {relatedDomains.length > 0 && (
              <p className="text-sm m-0">
                Related domains:{' '}
                {relatedDomains.map((domain, index) => (
                  <React.Fragment key={domain.id}>
                    {index > 0 && ', '}
                    <Link href={`/domains/${domain.slug}`} className="underline">{domain.title}</Link>
                  </React.Fragment>
                ))}
              </p>
            )}
            {/* p. 166 (T04) wording. */}
            <Typography variant="body" className="m-0">
              Specialist support can help interpret results and identify the further work required.
            </Typography>
            {tool.userGuide && typeof tool.userGuide === 'object' && 'url' in tool.userGuide && (
              <div>
                <Button href={resolveMediaUrl(tool.userGuide.url)} variant="secondary" target="_blank" rel="noopener noreferrer">
                  Download User Guide
                </Button>
              </div>
            )}
            <div>
              <Button href={requestAccessHref(tool.slug)} variant="secondary">
                Contact Support
              </Button>
            </div>
          </div>

        </div>
      </Section>
    </>
  );
}
