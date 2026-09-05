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
    },
    limit: 1,
  });

  const post = posts.docs[0] as any;

  if (!post) {
    return notFound();
  }

  const topics = Array.isArray(post.topic) ? post.topic : [];

  return (
    <>
      <section className="relative w-full h-[60vh] min-h-[400px] flex items-end pb-16 bg-ink text-white overflow-hidden">
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
          </div>
          
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            {post.title}
          </Typography>
          
          <div className="flex gap-4 items-center text-white/80 text-sm mt-4">
            <span>
              {new Date(post.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
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
          
          <div className="prose prose-lg prose-ink max-w-none">
            {post.content ? (
              <RichText data={post.content} converters={jsxConverters} />
            ) : (
              <p>{post.excerpt}</p>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
