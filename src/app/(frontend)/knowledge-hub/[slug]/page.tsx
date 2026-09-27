import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { RichText, JSXConvertersFunction } from '@payloadcms/richtext-lexical/react';
import { resolveMediaUrl } from '@/lib/utils';

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }: { node: any }) => {
      const data = node.value;
      if (!data || typeof data === 'string') return null;
      
      const fields = node.fields || {};
      const float = fields.float || 'none';
      const alignment = fields.alignment || 'left';
      const widthPreset = fields.width || 'original';
      const exactWidth = fields.exactWidth;
      const cornerRadius = fields.cornerRadius !== undefined ? fields.cornerRadius : 0;
      const captionText = fields.caption || data.caption;

      // Base classes
      let containerClasses = 'relative ';
      const figureStyles: React.CSSProperties = { marginBottom: '2rem' };
      const imgStyles: React.CSSProperties = { borderRadius: `${cornerRadius}px`, margin: 0 };
      
      // Float & Alignment
      if (float === 'left') {
        containerClasses += 'float-none md:float-start me-0 md:me-8 ms-0 mb-4 clear-both md:clear-none ';
        figureStyles.marginBottom = '1rem';
        figureStyles.display = 'table';
      } else if (float === 'right') {
        containerClasses += 'float-none md:float-end ms-0 md:ms-8 me-0 mb-4 clear-both md:clear-none ';
        figureStyles.marginBottom = '1rem';
        figureStyles.display = 'table';
      } else {
        // Alignment (if not floating)
        containerClasses += 'flex flex-col clear-both ';
        if (alignment === 'center') containerClasses += 'items-center ';
        else if (alignment === 'right') containerClasses += 'items-end ';
        else containerClasses += 'items-start '; // left
      }

      // Width
      if (exactWidth) {
        figureStyles.width = `${exactWidth}px`;
        figureStyles.maxWidth = '100%';
        imgStyles.width = '100%';
      } else {
        if (widthPreset === 'full') { figureStyles.width = '100%'; imgStyles.width = '100%'; }
        else if (widthPreset === 'large') { figureStyles.width = '100%'; figureStyles.maxWidth = '75%'; imgStyles.width = '100%'; }
        else if (widthPreset === 'medium') { figureStyles.width = '100%'; figureStyles.maxWidth = '50%'; imgStyles.width = '100%'; }
        else if (widthPreset === 'small') { figureStyles.width = '100%'; figureStyles.maxWidth = '25%'; imgStyles.width = '100%'; }
        else {
           // original
           imgStyles.width = 'auto';
        }
      }

      const imageUrl = resolveMediaUrl(data.url);

      return (
        <span className={containerClasses} style={figureStyles}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageUrl} 
            alt={data.alt || 'Image'} 
            style={imgStyles}
            className="h-auto max-w-full object-cover"
          />
          {captionText && (
            <span className="text-center text-sm text-ink-muted mt-2 block" style={{ display: 'table-caption', captionSide: 'bottom' }}>
              {captionText}
            </span>
          )}
        </span>
      );
    }
  ,
  blocks: {
    grid: ({ node }: { node: any }) => {
      const colClass = {
        '2': 'md:grid-cols-2',
        '3': 'md:grid-cols-3',
        '4': 'md:grid-cols-4',
      }[node.fields.columns as string] || 'md:grid-cols-2';

      return (
        <div className={`grid grid-cols-1 ${colClass} gap-6 my-8`}>
          {node.fields.items?.map((item: any, i: number) => (
            <div key={i} className="prose prose-lg prose-ink max-w-none">
              <RichText data={item.content} converters={jsxConverters} />
            </div>
          ))}
        </div>
      );
    }
  } as any
});

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const payload = await getPayload({ config: configPromise });
  const posts = await payload.find({
    collection: 'publications',
    where: {
      slug: {
        equals: slug,
      },
      // Same rule as the list and the sitemap: only real articles get a page.
      recordKind: { equals: 'article' },
    },
    limit: 1,
  });

  const post = posts.docs[0] as any;

  if (!post) {
    return {};
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.metaKeywords,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.ogImage && typeof post.ogImage === 'object' && post.ogImage !== null && 'url' in post.ogImage && resolveMediaUrl(post.ogImage.url) ? [resolveMediaUrl(post.ogImage.url)] : [],
    },
  };
}

export default async function PublicationSinglePage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const payload = await getPayload({ config: configPromise });
  const posts = await payload.find({
    collection: 'publications',
    where: {
      slug: {
        equals: slug,
      },
      // Same rule as the list and the sitemap: only real articles get a page.
      recordKind: { equals: 'article' },
    },
    limit: 1,
  });

  const post = posts.docs[0] as any;

  if (!post) {
    return notFound();
  }

  const topics = Array.isArray(post.topic) ? post.topic : [];
  const domains = Array.isArray(post.domains) ? post.domains : [];
  const industries = Array.isArray(post.industries) ? post.industries : [];
  const datasets = Array.isArray(post.datasets) ? post.datasets : [];
  const tools = Array.isArray(post.tools) ? post.tools : [];

  const orConditions: any[] = [];
  if (domains.length > 0) orConditions.push({ domains: { in: domains.map((d: any) => typeof d === 'object' ? d.id : d) } });
  if (industries.length > 0) orConditions.push({ industries: { in: industries.map((i: any) => typeof i === 'object' ? i.id : i) } });
  if (datasets.length > 0) orConditions.push({ datasets: { in: datasets.map((d: any) => typeof d === 'object' ? d.id : d) } });
  if (tools.length > 0) orConditions.push({ tools: { in: tools.map((t: any) => typeof t === 'object' ? t.id : t) } });
  // Fallback to topic if no other tags
  if (orConditions.length === 0 && topics.length > 0) orConditions.push({ topic: { in: topics.map((t: any) => typeof t === 'object' ? t.id : t) } });

  const related = await payload.find({
    collection: 'publications',
    where: {
      id: { not_equals: post.id },
      recordKind: { equals: 'article' },
      ...(orConditions.length > 0 ? { or: orConditions } : { id: { equals: 'non-existent' } })
    },
    limit: 3,
  });

  return (
    <>
      {/* A01 Article Intro */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex items-end pb-16 bg-ink text-white overflow-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: post.title,
              description: post.excerpt,
              datePublished: post.dateVerified === false ? undefined : post.date,
              dateModified: post.updatedAt,
              author: post.author ? {
                '@type': 'Person',
                name: typeof post.author === 'string' ? post.author : (post.author as any).name || 'Enerqa',
              } : undefined,
            }),
          }}
        />
        <div className="absolute inset-0 bg-cover bg-center bg-[url('/assets/images/gas-energy.jpg')]"></div>
        <div className="hero-insights-overlay z-10 opacity-80"></div>
        
        <Container className="relative z-20 flex flex-col gap-4">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/knowledge-hub#publications" className="text-white/60 hover:text-white transition-colors no-underline">Knowledge Hub</Link> 
            {topics.length > 0 && <span className="mx-1 text-white/60">/</span>}
            {topics.map((cat, i: number) => (
              <React.Fragment key={typeof cat === 'object' && cat !== null ? cat.id : String(cat)}>
                <span className="text-white">{typeof cat === 'object' && cat !== null ? cat.title : String(cat)}</span>
                {i < topics.length - 1 && <span className="mx-1 text-white/60">,</span>}
              </React.Fragment>
            ))}
            <span className="mx-1 text-white/60">/</span>
            <span className="text-white/40">{post.title}</span>
          </div>
          
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            {post.title}
          </Typography>
          
          <div className="flex flex-wrap gap-4 items-center text-white/80 text-sm mt-4">
            <span>
              {/* UTC, like the Knowledge Hub cards, so every visitor sees the same calendar day. */}
              {new Date(post.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })}
              {post.dateVerified === false && ' (date unverified)'}
            </span>
            {post.author && (
              <>
                <span className="text-white/40">|</span>
                <span>By {post.author}</span>
              </>
            )}
            {post.language && (
              <>
                <span className="text-white/40">|</span>
                <span>{post.language === 'ar' ? 'Arabic' : 'English'}</span>
              </>
            )}
            {post.type && (
              <Badge variant="outline" className="text-white border-white/30 uppercase text-[10px] tracking-wider">
                {post.type}
              </Badge>
            )}
            
            {post.file && typeof post.file !== 'string' && resolveMediaUrl(post.file.url) && (
              <Button href={resolveMediaUrl(post.file.url)} variant="outline" className="text-white border-white hover:bg-white hover:text-ink text-xs py-1 px-3">
                Download PDF
              </Button>
            )}
          </div>
        </Container>
      </section>

      <Section theme="light">
        <Container className="max-w-[800px] mx-auto">
          {post.heading && (
            <Typography variant="h3" className="mb-6">{post.heading}</Typography>
          )}
          
          {/* PUBL02 Summary and Tags */}
          <div className="mb-10 p-6 bg-gray-50 border border-gray-200 rounded-xl">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Executive Summary</h2>
            <p className="text-gray-700 font-medium mb-4">{post.excerpt}</p>
            {topics.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-4">
                {topics.map((t: any) => (
                  <span key={typeof t === 'object' ? t.id : String(t)} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-bold text-gray-600">
                    {typeof t === 'object' ? t.title : String(t)}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="prose prose-lg prose-ink max-w-none">
            {post.content ? (
              <RichText data={post.content} converters={jsxConverters} />
            ) : null}
          </div>

          {/* PUBL04 References and Downloads. Only real actions render (p. 225:
              no placeholder buttons) - a Cite action needs a citation field first. */}
          {((post.file && typeof post.file !== 'string' && resolveMediaUrl(post.file.url)) || post.originalUrl || post.citation) && (
            <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col items-center justify-center gap-6">
              <div className="flex flex-wrap gap-4 items-center justify-center">
                {post.file && typeof post.file !== 'string' && resolveMediaUrl(post.file.url) && (
                  <Button href={resolveMediaUrl(post.file.url)} variant="secondary" className="gap-2">
                    Download Report
                  </Button>
                )}
                {post.originalUrl && (
                  <Button href={post.originalUrl} variant="outline" className="gap-2 text-[var(--color-dark)]" target="_blank">
                    Read Original Publication
                  </Button>
                )}
              </div>
              
              {post.citation && (
                <div className="w-full max-w-2xl bg-gray-50 border border-gray-200 p-6 rounded-xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Cite This Publication</h3>
                  <p className="text-gray-800 text-sm m-0 select-all">{post.citation}</p>
                </div>
              )}
            </div>
          )}
        </Container>
      </Section>

      {/* PUBL05 Related Content */}
      {related.docs.length > 0 && (
        <section className="py-20 bg-[var(--color-paper-alt)] border-t border-gray-200">
          <Container>
             <h2 className="text-3xl font-bold text-center mb-10 text-[var(--color-dark)]">Related Content</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {related.docs.map((item: any) => (
                 <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                   <h3 className="text-xl font-bold text-[var(--color-dark)] mb-3">{item.title}</h3>
                   <p className="text-gray-600 line-clamp-3 mb-4">{item.excerpt}</p>
                   <Link href={`/knowledge-hub/${item.slug}`} className="text-[var(--color-primary)] font-bold hover:underline text-sm">
                     Read Article →
                   </Link>
                 </div>
               ))}
             </div>
          </Container>
        </section>
      )}

      {/* PUBL06 Continue Exploring */}
      <section className="py-16 bg-white border-t border-gray-200 text-center">
        <Container className="flex flex-col items-center gap-6">
           <h2 className="text-2xl font-bold text-[var(--color-dark)] m-0">Continue Exploring</h2>
           <div className="flex flex-wrap gap-4 justify-center">
             <Button href="/knowledge-hub" variant="outline" className="text-[var(--color-dark)]">Explore the Knowledge Hub</Button>
             <Button href="/contact?intent=project" variant="primary">Discuss Your Project</Button>
           </div>
        </Container>
      </section>
    </>
  );
}
