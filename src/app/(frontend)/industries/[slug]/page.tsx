import React, { cache, Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { notFound } from 'next/navigation';
import { INDUSTRY_FEEDS, newsPhrases } from '@/lib/feeds/contextual';
import { NewsFeed } from '@/components/feeds/NewsFeed';
import { ResearchFeed } from '@/components/feeds/ResearchFeed';
import { RelatedPublications } from '@/components/feeds/RelatedPublications';
import { RelatedDataset } from '@/components/feeds/RelatedDataset';
import { FeedSkeleton } from '@/components/feeds/feedParts';
import { SourceUnavailable } from '@/components/ui/SourceUnavailable';

/**
 * Fetch one industry by slug.
 *
 * Wrapped in React's `cache` so generateMetadata and the page component share a
 * single database query instead of running one each. depth 2 so each related
 * capability arrives with its parent domain, which supplies the link's path.
 */
const getIndustry = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'industries',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return result.docs[0] ?? null;
});

// Handoff p. 227: unique descriptive title and meta description on every page.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry: any = await getIndustry(slug);

  if (!industry) return { title: 'Industry not found' };

  return {
    title: industry.metaTitle || industry.title,
    // Fall back to the opening of the approved narrative so an industry page is
    // never published with an empty description.
    description:
      industry.metaDescription || String(industry.heroNarrative || '').slice(0, 155),
    alternates: { canonical: `/industries/${slug}` },
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const industry: any = await getIndustry(slug);

  if (!industry) {
    notFound();
  }

  const { title, heroNarrative, ctaText, lifecycleNarrative, relatedCapabilities, heroImage, relevantTools, dataSources } = industry;

  const tools = Array.isArray(relevantTools) ? relevantTools : [];
  const sources = Array.isArray(dataSources) ? dataSources : [];
  const heroImageUrl = heroImage && typeof heroImage === 'object' && 'url' in heroImage ? heroImage.url : null;

  // I{nn}02 links. Each capability is a real record with a parent domain, so
  // the anchor always exists. A capability without a populated domain is
  // skipped rather than linked to a guessed path (p. 4: no dead links).
  const workAreas = (Array.isArray(relatedCapabilities) ? relatedCapabilities : [])
    .filter((cap: any) => cap && typeof cap === 'object' && cap.domain?.slug)
    .map((cap: any) => ({ id: cap.id, heading: cap.heading, href: `/domains/${cap.domain.slug}#${cap.slug}` }));

  // This industry's own news baskets and research themes from the handoff's
  // configuration page (pp. 66, 72, 78 ... 138).
  const feed = INDUSTRY_FEEDS[slug];
  const nearest = { href: `/knowledge-hub/global-intelligence?industry=${slug}`, label: 'browse Global Intelligence' };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--paper)]">
      {/* INITIAL VIEW (Top viewport fold y 0 to y 768) */}
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-[var(--ink)] text-white overflow-hidden py-[100px]">
        {/* Background Image & Overlay */}
        {heroImageUrl && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImageUrl})` }}
          ></div>
        )}
        <div className={`hero-domain-overlay z-10 ${heroImageUrl ? 'opacity-90' : 'opacity-100'}`}></div>

        <Container className="relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12 w-full">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/80 mb-2">
            <Link href="/" className="text-white/80 hover:text-white transition-colors no-underline">Home</Link> / <Link href="/domains-and-industries#industries" className="text-white/80 hover:text-white transition-colors no-underline">Industries</Link> / <span className="en text-white" aria-current="page">{title}</span>
          </nav>

          {/* H1 Title */}
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">{title}</span>
          </Typography>
        </Container>
      </section>

      {/* Narrative, CTA & Capability Links Section */}
      <section className="bg-[var(--paper)] pt-12 pb-8 border-b border-[var(--line)] shadow-sm">
        <Container>
          <div className="max-w-4xl mb-8">
            <p className="text-[18px] md:text-[22px] leading-[1.6] text-[var(--ink-soft)] font-light m-0 whitespace-pre-line">
              {heroNarrative}
            </p>
          </div>

          {/* Handoff p. 7: the action sits below the narrative - never floating over it */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <Link
              href={`/contact?industry=${slug}`}
              className="inline-flex items-center gap-2 bg-[var(--green)] text-white font-bold py-3 px-8 rounded-full hover:bg-[var(--green-deep)] transition-colors text-base shadow-sm hover:shadow-md shrink-0 w-fit"
            >
              {ctaText || 'Discuss Your Project'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </Container>
      </section>

      {/* I{nn}02 - RELEVANT DOMAINS AND WORK AREAS (handoff p. 64).
          Its own section with an h2, so the page keeps a coherent H1 > H2
          hierarchy (p. 227). Each link points at a capability anchor on the
          parent domain page - p. 61 is explicit that industry pages must not
          repeat the capability paragraphs. */}
      {workAreas.length > 0 && (
        <section className="py-20 bg-[var(--paper)]">
          <Container>
            <div className="max-w-4xl mb-10">
              <h2 className="text-3xl font-bold text-[var(--ink)] mb-4">Relevant Domains and Work Areas</h2>
              <p className="text-lg text-[var(--ink-soft)] leading-relaxed">
                Explore the technical, environmental, climate and business work areas relevant to this industry. Each link explains the scope within its parent domain rather than repeating it here.
              </p>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl list-none p-0 m-0">
              {workAreas.map((area: { id: number; heading: string; href: string }) => (
                <li key={area.id}>
                  <Link
                    href={area.href}
                    className="flex h-full items-center justify-between gap-4 bg-[var(--paper-alt)] p-6 rounded-[var(--r-md)] border border-[var(--line)] hover:border-[var(--green)] transition-colors"
                  >
                    <span className="text-base font-bold text-[var(--ink)]">{area.heading}</span>
                    <ArrowRight className="w-5 h-5 text-[var(--color-secondary)] shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* I{nn}L - PROJECT DEVELOPMENT & LIFECYCLE */}
      <section className="py-20 bg-[var(--paper-alt)]">
        <Container>
          <div className="max-w-4xl border-l-4 border-[var(--color-secondary)] pl-8 lg:pl-12">
            <h2 className="text-3xl font-bold text-[var(--ink)] mb-6">Project Development and Lifecycle Support</h2>
            {lifecycleNarrative && (
              <p className="text-lg text-[var(--ink-soft)] mb-8 leading-relaxed whitespace-pre-line">
                {lifecycleNarrative}
              </p>
            )}
            <Link href="/project-development" className="inline-flex items-center gap-2 text-[var(--color-secondary)] font-semibold hover:text-[var(--color-secondary-dark)] transition-colors">
              Explore Our Project Development Approach <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </Container>
      </section>

      {/* I{nn}N - INDUSTRY NEWS. Reads the shared cached pool, filtered by this
          industry's own handoff baskets - no provider call of its own (p. 226).
          Text only: feed access does not clear image rights (pp. 210, 214, 216). */}
      <section className="py-20 bg-[var(--paper)] border-t border-[var(--line)]">
        <Container>
          <div className="flex justify-between items-end gap-6 mb-4">
            <h2 className="text-3xl font-bold text-[var(--ink)]">Industry News</h2>
            <Link href={`/knowledge-hub/global-intelligence?industry=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline shrink-0">
              View All Industry News
            </Link>
          </div>
          <p className="text-lg text-[var(--ink-soft)] leading-relaxed max-w-4xl mb-8">
            Follow relevant developments in {String(title).toLowerCase()}, including the climate, energy, environmental and investment issues affecting the sector.
          </p>
          {feed ? (
            // L516: on one column, reserve one card (the empty state's height).
            <Suspense fallback={<FeedSkeleton cards={3} mobileCards={1} />}>
              <NewsFeed phrases={newsPhrases(feed)} baskets={feed.newsBaskets} limit={3} nearest={nearest} />
            </Suspense>
          ) : (
            <SourceUnavailable className="min-h-[220px]" />
          )}
        </Container>
      </section>

      {/* I{nn}R - RESEARCH AND OFFICIAL UPDATES */}
      <section className="py-20 bg-[var(--paper)] border-b border-[var(--line)]">
        <Container>
          <div className="flex justify-between items-end gap-6 mb-4">
            <h2 className="text-3xl font-bold text-[var(--ink)]">Research and Official Updates</h2>
            <Link href={`/knowledge-hub/global-intelligence?industry=${slug}&type=research`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline shrink-0">
              Explore Related Research
            </Link>
          </div>
          <p className="text-lg text-[var(--ink-soft)] leading-relaxed max-w-4xl mb-8">
            Explore research, policy and technical publications relevant to this industry. Sources, authors, dates and document types make the evidence easier to assess.
          </p>
          {feed ? (
            <Suspense fallback={<FeedSkeleton cards={4} mobileCards={2} columns="md:grid-cols-2" cardHeight="h-[240px]" />}>
              {/* p. 65: "OpenAlex/DOAJ shared scholarly sources plus the specialist
                  sources identified in the industry mapping" (pp. 66-138). */}
              <ResearchFeed themes={feed.researchThemes} limit={4} nearest={nearest} specialistFeeds={feed.specialistFeeds} />
            </Suspense>
          ) : (
            <SourceUnavailable className="min-h-[240px]" />
          )}
        </Container>
      </section>

      {/* DATA, TOOLS & PUBLICATIONS */}
      <section className="py-20 bg-[var(--paper)]">
        <Container>
          <div className="flex flex-col gap-20">
            {/* I{nn}D - RELATED DATA (handoff p. 65). One compact dataset card
                at most. p. 66: with no geographically relevant licensed dataset,
                show the canonical catalogue link - NOT a sample statistic. */}
            <div>
              <div className="flex justify-between items-end gap-6 mb-8 max-w-4xl">
                <h2 className="text-3xl font-bold text-[var(--ink)]">Related Data</h2>
                <Link href={`/data-portal?industry=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline shrink-0">
                  Explore Related Data
                </Link>
              </div>
              <p className="text-lg text-[var(--ink-soft)] leading-relaxed max-w-4xl mb-8">
                Explore open-access datasets through charts and accessible tables. Each view identifies its source, geography, observation period, units and update date. Open a dataset to review the methodology and download data free of charge.
              </p>
              {/* The CMS "Recommended numerical sources" (pp. 65-137) become the
                  providers' own catalogue links when no dataset card is linked.
                  They used to be printed as internal provider ids (L526). */}
              <RelatedDataset
                field="industries"
                id={industry.id}
                sources={sources.map((src: { provider?: string }) => src.provider).filter(Boolean) as string[]}
              />
            </div>

            {/* Tools & Publications - Side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* I{nn}T - Relevant Tools */}
              <div>
                <div className="flex justify-between items-end gap-6 mb-4">
                  <h2 className="text-3xl font-bold text-[var(--ink)]">Relevant Enerqa Tools</h2>
                  <Link href={`/tools?industry=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline shrink-0">
                    Explore All Tools
                  </Link>
                </div>
                <p className="text-lg text-[var(--ink-soft)] leading-relaxed mb-8">
                  Explore assessment and modelling tools relevant to this industry.
                </p>
                {tools.length > 0 ? (
                  <ul className="flex flex-col gap-4 list-none p-0 m-0">
                    {tools.map((tool: any, idx: number) => (
                      <li key={tool.id || `${tool.href}-${idx}`}>
                        <Link
                          href={tool.href}
                          className="flex items-center justify-between gap-4 bg-[var(--paper-alt)] p-6 rounded-[var(--r-md)] border border-[var(--line)] hover:border-[var(--green)] transition-colors"
                        >
                          <span className="text-base font-bold text-[var(--ink)]">{tool.label}</span>
                          <ArrowRight className="w-5 h-5 text-[var(--color-secondary)] shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <SourceUnavailable className="min-h-[200px]" />
                )}
              </div>

              {/* I{nn}K - Enerqa Publication (first-party CMS only) */}
              <div>
                <div className="flex justify-between items-end gap-6 mb-4">
                  <h2 className="text-3xl font-bold text-[var(--ink)]">Enerqa Publication</h2>
                  <Link href={`/knowledge-hub?industry=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline shrink-0">
                    Explore Related Publications
                  </Link>
                </div>
                <p className="text-lg text-[var(--ink-soft)] leading-relaxed mb-8">
                  Read Enerqa&rsquo;s perspectives on the sustainability and project-development questions relevant to this industry.
                </p>
                <RelatedPublications field="industries" id={industry.id} limit={3} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* I{nn}A - DISCUSS YOUR PROJECT. Copy and button label per p. 66. */}
      <section className="py-24 bg-[var(--ink)] text-white text-center">
        <Container>
          <h2 className="text-4xl font-bold mb-6">Discuss Your Project</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Share the industry context, location, current stage and the decisions ahead. Support can be scoped around the questions that matter to your opportunity.
          </p>
          <Link
            href={`/contact?industry=${slug}`}
            className="inline-flex items-center gap-2 bg-[var(--green)] text-[var(--ink)] font-bold py-4 px-10 rounded-full hover:bg-[var(--paper)] hover:text-[var(--ink)] transition-colors text-lg"
          >
            Discuss Your Project
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Container>
      </section>
    </div>
  );
}
