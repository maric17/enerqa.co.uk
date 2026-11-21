import React, { cache } from 'react';
import { siteText, type SiteLanguage } from '@/lib/i18n/site';
import { pilotHref } from '@/lib/i18n/pilot';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from '@/components/ui/SiteLink';
import { RichText, JSXConvertersFunction } from '@payloadcms/richtext-lexical/react';
import { resolveMediaUrl } from '@/lib/utils';
import { PublicationCover } from '@/components/publications/PublicationCover';
import { PublicationBody } from '@/components/publications/PublicationBody';
import { publicationImage } from '@/components/publications/publicationImage';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

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

const findPublication = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'publications',
    overrideAccess: false,
    draft: false,
    pagination: false,
    where: {
      slug: { equals: slug },
      recordKind: { equals: 'article' },
    },
    limit: 1,
  });
  return docs[0];
});

export async function publicationMetadata({ params }: Props) {
  const post = await findPublication((await params).slug);
  if (!post) {
    return {};
  }

  // Editors can keep a separate sharing image; otherwise use the article cover.
  const sharingImage = publicationImage({ ogImage: post.ogImage }) ?? publicationImage(post);

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.metaKeywords,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: sharingImage ? [sharingImage.src] : [],
    },
  };
}

export async function PublicationContent({ params, language = 'en' }: Props & { language?: SiteLanguage }) {
  const t = (text: string) => siteText(language, text);
  const post = await findPublication((await params).slug);
  if (!post) {
    return notFound();
  }
  const originalLanguage = post.language === 'ar' ? 'ar' : 'en';
  const fileUrl = post.file && typeof post.file === 'object' ? resolveMediaUrl(post.file.url) : '';

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

  const payload = await getPayload({ config: configPromise });
  const related = await payload.find({
    collection: 'publications',
    overrideAccess: false,
    draft: false,
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
      {/* Let long titles expand the cover and clear the fixed navigation. */}
      <section className="relative w-full min-h-[max(400px,60vh)] flex items-end pt-36 pb-16 bg-ink text-white overflow-hidden">
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
        <PublicationCover image={publicationImage(post)} />

        <Container className="relative z-20 flex flex-col gap-4">
          <Breadcrumbs
            parents={[{ label: t('Home'), href: pilotHref(language, '/') }, { label: t('Knowledge Hub'), href: pilotHref(language, '/knowledge-hub') }]}
            current={post.title}
            className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/80 mb-2"
          />

          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <bdi lang={originalLanguage}>{post.title}</bdi>
          </Typography>

          <div className="flex flex-wrap gap-4 items-center text-white/80 text-sm mt-4">
            <span>
              {/* UTC, like the Knowledge Hub cards, so every visitor sees the same calendar day. */}
              {new Date(post.date).toLocaleDateString(language === 'ar' ? 'ar-QA' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })}
              {post.dateVerified === false && ` ${t('(date unverified)')}`}
            </span>
            {post.author && (
              <>
                <span className="text-white/40">|</span>
                <span>{t('By')} <bdi>{post.author}</bdi></span>
              </>
            )}
            {post.language && (
              <>
                <span className="text-white/40">|</span>
                <span>{t(post.language === 'ar' ? 'Arabic' : 'English')}</span>
              </>
            )}
            {post.type && (
              <Badge variant="outline" className="text-white border-white/30 uppercase text-[10px] tracking-wider">
                {t(post.type)}
              </Badge>
            )}

            {fileUrl && (
              <Button href={fileUrl} variant="outline" className="text-white border-white hover:bg-white hover:text-ink text-xs py-1 px-3">
                {t("Download PDF")}
              </Button>
            )}
          </div>
        </Container>
      </section>

      <Section theme="light">
        <Container className="max-w-[800px] mx-auto">
          {language === 'ar' && originalLanguage === 'en' && (
            <p className="mb-6 text-sm text-gray-600">محتوى هذا المنشور متاح باللغة الإنجليزية حاليًا.</p>
          )}
          {post.heading && (
            <Typography variant="h3" className="mb-6"><bdi lang={originalLanguage}>{post.heading}</bdi></Typography>
          )}

          {/* Keep topic metadata without repeating the Executive Summary. */}
            {topics.length > 0 && (
              <div className="mb-8 flex gap-2 flex-wrap" aria-label={t('Article topics')}>
                {topics.map((t: any) => (
                  <span key={typeof t === 'object' ? t.id : String(t)} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-bold text-gray-600">
                    {typeof t === 'object' ? t.title : String(t)}
                  </span>
                ))}
              </div>
            )}
          <div lang={post.language ?? "en"} dir={post.language === "ar" ? "rtl" : "ltr"} className="prose prose-lg prose-ink max-w-none">
            {post.content ? (
              <PublicationBody slug={post.slug} data={post.content} converters={jsxConverters} />
            ) : null}
          </div>

          {/* PUBL04 References and Downloads. Only real actions render (p. 225:
              no placeholder buttons) - a Cite action needs a citation field first. */}
          {(fileUrl || post.originalUrl || post.citation) && (
            <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col items-center justify-center gap-6">
              <div className="flex flex-wrap gap-4 items-center justify-center">
                {fileUrl && (
                  <Button href={fileUrl} variant="secondary" className="gap-2">
                    {t("Download Report")}
                  </Button>
                )}
                {post.originalUrl && (
                  <Button href={post.originalUrl} variant="secondary" className="gap-2" target="_blank">
                    {t("Read Original Publication")}
                  </Button>
                )}
              </div>

              {post.citation && (
                <div className="w-full max-w-2xl bg-gray-50 border border-gray-200 p-6 rounded-xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">{t("Cite This Publication")}</h3>
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
             <h2 className="text-3xl font-bold text-center mb-10 text-[var(--color-dark)]">{t("Related Content")}</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {related.docs.map((item: any) => (
                 <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                   <h3 className="text-xl font-bold text-[var(--color-dark)] mb-3">{item.title}</h3>
                   <p className="text-gray-600 line-clamp-3 mb-4">{item.excerpt}</p>
                   <Link href={`/knowledge-hub/${item.slug}`} className="text-[var(--color-primary)] font-bold hover:underline text-sm">
                     {t("Read Article")} {language === 'ar' ? '←' : '→'}
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
           <h2 className="text-2xl font-bold text-[var(--color-dark)] m-0">{t("Continue Exploring")}</h2>
           <div className="flex flex-wrap gap-4 justify-center">
             {/* Navy text and border keep this button visible on the white section. */}
             <Button href={pilotHref(language, '/knowledge-hub')} variant="secondary">{t("Explore the Knowledge Hub")}</Button>
             <Button href={pilotHref(language, '/contact?intent=project')} variant="primary">{t("Discuss Your Project")}</Button>
           </div>
        </Container>
      </section>
    </>
  );
}
