import React, { cache, Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { notFound } from 'next/navigation';
import { DOMAIN_FEEDS, newsPhrases, SPECIALIST_PROVIDER } from '@/lib/feeds/contextual';
import { providerEnabled } from '@/lib/api/core/registry';
import { NewsFeed } from '@/components/feeds/NewsFeed';
import { ResearchFeed } from '@/components/feeds/ResearchFeed';
import { OfficialFeed } from '@/components/feeds/OfficialFeed';
import { RelatedPublications } from '@/components/feeds/RelatedPublications';
import { RelatedDataset } from '@/components/feeds/RelatedDataset';
import { CuratedSources } from '@/components/feeds/CuratedSources';
import { FeedSkeleton } from '@/components/feeds/feedParts';
import { SourceUnavailable } from '@/components/ui/SourceUnavailable';

/**
 * Fetch one domain by slug.
 *
 * Wrapped in React's `cache` so that generateMetadata and the page component
 * share a single database query instead of each running their own. `depth: 1`
 * makes Payload populate the relevantIndustries relationship with the actual
 * industry documents rather than just their IDs.
 */
const getDomain = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'domains',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  return result.docs[0] ?? null;
});

// Handoff p. 227: every substantive page needs a unique title and description.
// generateMetadata (not the static `metadata` object) because the values come
// from the CMS record for this slug.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const domain: any = await getDomain(slug);

  if (!domain) return { title: 'Domain not found' };

  return {
    title: domain.metaTitle || domain.title,
    // Fall back to the first ~155 characters of the approved narrative so a
    // domain is never published with an empty description.
    description:
      domain.metaDescription || String(domain.heroNarrative || '').slice(0, 155),
    alternates: { canonical: `/domains/${slug}` },
  };
}

export default async function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const domain: any = await getDomain(slug);

  if (!domain) {
    notFound();
  }

  const {
    title,
    heroNarrative,
    ctaText,
    capabilities,
    heroImage,
    relevantIndustries,
    policyUpdates,
    relevantTools,
    lifecycleNarrative,
    topicPhrase,
  } = domain;

  // Per-domain news baskets, research themes and official sources from the
  // handoff's "Contextual API and link configuration" (pp. 30, 38, 49, 60).
  const feed = DOMAIN_FEEDS[slug];
  // Where a failed feed sends the visitor instead (p. 4).
  const nearest = { href: `/knowledge-hub/global-intelligence?domain=${slug}`, label: 'browse Global Intelligence' };
  // CP's only feed (ReliefWeb) is switched off until its appname is
  // registered, so its module always resolves to the empty state; the
  // skeleton reserves that height rather than three cards (L516).
  const officialLive = Boolean(feed?.specialistFeeds.some((f) => providerEnabled(SPECIALIST_PROVIDER[f])));

  const heroImageUrl =
    heroImage && typeof heroImage === 'object' && 'url' in heroImage ? heroImage.url : null;

  // depth: 1 gives us full industry documents, but Payload returns bare IDs if
  // depth is ever lowered - filter to objects so the map below is always safe.
  const industries = Array.isArray(relevantIndustries)
    ? relevantIndustries.filter((i: unknown) => i && typeof i === 'object')
    : [];

  const tools = Array.isArray(relevantTools) ? relevantTools : [];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--paper)]">
      {/* C01 - INITIAL VIEW (Top viewport fold y 0 to y 768) */}
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
          {/* Breadcrumb - handoff p. 8: identify the current section and its parent */}
          <nav aria-label="Breadcrumb" className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/80 mb-2">
            <Link href="/" className="text-white/80 hover:text-white transition-colors no-underline">Home</Link> / <Link href="/domains-and-industries" className="text-white/80 hover:text-white transition-colors no-underline">Domains &amp; Industries</Link> / <span className="en text-white" aria-current="page">{title}</span>
          </nav>

          {/* H1 Title */}
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">{title}</span>
          </Typography>
        </Container>
      </section>

      {/* Narrative, CTA & capability anchors */}
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
              href={`/contact?domain=${slug}`}
              className="inline-flex items-center gap-2 bg-[var(--green)] text-white font-bold py-3 px-8 rounded-full hover:bg-[var(--green-deep)] transition-colors text-base shadow-sm hover:shadow-md shrink-0 w-fit"
            >
              {ctaText || 'Discuss Your Project'}
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Topic filters: jump links to the capability anchors below (p. 21) */}
            {capabilities && capabilities.length > 0 && (
              <nav aria-label="Jump to a work area" className="flex flex-wrap md:justify-end gap-3">
                {capabilities.map((cap: any) => (
                  <Link
                    key={cap.id}
                    href={`#${cap.slug}`}
                    className="text-xs font-bold uppercase tracking-wider bg-[var(--paper-alt)] text-[var(--ink-soft)] py-2 px-4 rounded-full hover:bg-[var(--color-secondary)] hover:text-white transition-all border border-[var(--line)]"
                  >
                    {cap.heading}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </Container>
      </section>

      {/* C02-C08 - CAPABILITY SECTIONS.
          Handoff p. 21: all capability narrative stays visible in the page HTML
          and is reachable by section anchors - no tabs, no accordions. */}
      {capabilities && capabilities.length > 0 && (
        <section className="py-20 bg-[var(--paper)]">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
              {capabilities.map((cap: any, idx: number) => {
                const isLastAndOdd = idx === capabilities.length - 1 && capabilities.length % 2 !== 0;
                return (
                  <div
                    key={cap.id}
                    id={cap.slug}
                    className={`scroll-mt-[100px] border-t-4 border-[var(--green)] pt-6 ${isLastAndOdd ? 'lg:col-span-2' : ''}`}
                  >
                    <h2 className="text-2xl font-bold text-[var(--ink)] mb-4 tracking-tight">
                      {cap.heading}
                    </h2>
                    <div className="prose prose-lg prose-p:text-[var(--ink-soft)] prose-p:leading-relaxed max-w-none whitespace-pre-line">
                      {cap.narrative}
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* CI - RELEVANT INDUSTRIES (handoff p. 28) */}
      <section className="py-20 bg-[var(--ink-soft)] text-white">
        <Container>
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl font-bold mb-4">Relevant Industries</h2>
            <p className="text-lg text-gray-300">
              Explore how this domain applies to the operational and investment priorities of different industries.
            </p>
          </div>

          {/* Real industry links only. When the taxonomy mapping is not set yet we
              show nothing here rather than placeholder cards - handoff p. 4 rules
              out empty or fake links, and p. 28 rules out logo-based navigation. */}
          {industries.length > 0 && (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 list-none p-0 m-0">
              {industries.map((industry: any) => (
                <li key={industry.id}>
                  <Link
                    href={`/industries/${industry.slug}`}
                    className="block h-full bg-[var(--ink)] p-6 rounded-[var(--r-md)] border border-gray-700/50 hover:border-[var(--green)] transition-colors"
                  >
                    <span className="text-sm font-bold text-white">{industry.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link href="/domains-and-industries#industries" className="inline-flex items-center gap-2 text-[var(--green)] font-semibold hover:text-white transition-colors">
            Explore All Industries <ArrowRight className="w-5 h-5" />
          </Link>
        </Container>
      </section>

      {/* CL - PROJECT DEVELOPMENT & LIFECYCLE (handoff p. 28).
          Handoff p. 227: this module points back to the one canonical lifecycle page. */}
      <section className="py-20 bg-[var(--paper-alt)]">
        <Container>
          <div className="max-w-4xl border-l-4 border-[var(--color-secondary)] pl-8 lg:pl-12">
            <h2 className="text-3xl font-bold text-[var(--ink)] mb-6">Project Development and Lifecycle Support</h2>
            {/* The approved domain-specific paragraph (pp. 28, 37, 47, 58). The
                old generic sentence here was not in the handoff. */}
            {lifecycleNarrative && (
              <p className="text-lg text-[var(--ink-soft)] mb-8 leading-relaxed">{lifecycleNarrative}</p>
            )}
            <Link href="/project-development" className="inline-flex items-center gap-2 text-[var(--color-secondary)] font-semibold hover:text-[var(--color-secondary-dark)] transition-colors">
              Explore Our Project Development Approach <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </Container>
      </section>

      {/* CN - LATEST NEWS (pp. 29, 37, 48, 58). Separately labelled from
          research, as p. 21 requires. Streams in behind a same-size skeleton so
          a slow provider never blocks the page or shifts its layout (p. 226). */}
      <section className="py-20 bg-[var(--paper)] border-t border-[var(--line)]">
        <Container>
          <div className="flex justify-between items-end gap-6 mb-4">
            <h2 className="text-3xl font-bold text-[var(--ink)]">Latest News</h2>
            <Link href={`/knowledge-hub/global-intelligence?domain=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline shrink-0">
              View All News
            </Link>
          </div>
          {topicPhrase && (
            <p className="text-lg text-[var(--ink-soft)] leading-relaxed max-w-4xl mb-8">
              Follow developments in {topicPhrase}. Headlines are selected for relevance to this domain and linked to their original publishers.
            </p>
          )}
          {feed ? (
            // L516: on one column, reserve one card - the empty state is the
            // same height - rather than three stacked cards that rarely all arrive.
            <Suspense fallback={<FeedSkeleton cards={3} mobileCards={1} />}>
              <NewsFeed phrases={newsPhrases(feed)} baskets={feed.newsBaskets} limit={3} nearest={nearest} />
            </Suspense>
          ) : (
            <SourceUnavailable className="min-h-[220px]" />
          )}
        </Container>
      </section>

      {/* CR - RESEARCH AND ARTICLES: OpenAlex (is_oa) first, DOAJ supplementary. */}
      <section className="py-20 bg-[var(--paper)] border-b border-[var(--line)]">
        <Container>
          <div className="flex justify-between items-end gap-6 mb-4">
            <h2 className="text-3xl font-bold text-[var(--ink)]">Research and Articles</h2>
            <Link href={`/knowledge-hub/global-intelligence?type=research&domain=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline shrink-0">
              Explore Research
            </Link>
          </div>
          {topicPhrase && (
            <p className="text-lg text-[var(--ink-soft)] leading-relaxed max-w-4xl mb-8">
              Explore research and technical publications that inform decisions in {topicPhrase}. Each record identifies its authors, publication source and date, with a link to the original work.
            </p>
          )}
          {feed ? (
            <Suspense fallback={<FeedSkeleton cards={4} mobileCards={2} columns="md:grid-cols-2" cardHeight="h-[240px]" />}>
              <ResearchFeed themes={feed.researchThemes} limit={4} nearest={nearest} />
            </Suspense>
          ) : (
            <SourceUnavailable className="min-h-[240px]" />
          )}
        </Container>
      </section>

      {/* CP / EP / NP / BP - POLICY AND OFFICIAL UPDATES (handoff pp. 29, 37, 48, 59).
          The heading differs per domain, so it comes from the CMS record. The
          whole section is hidden when no heading is set, rather than shipping an
          empty module. */}
      {policyUpdates?.heading && (
        <section className="py-20 bg-[var(--paper-alt)]">
          <Container>
            <div className="flex justify-between items-end mb-8 max-w-4xl">
              <h2 className="text-3xl font-bold text-[var(--ink)]">{policyUpdates.heading}</h2>
              <Link href={`/knowledge-hub/global-intelligence?type=official&domain=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline">
                View All Updates
              </Link>
            </div>

            {policyUpdates.narrative && (
              <p className="text-lg text-[var(--ink-soft)] leading-relaxed max-w-4xl mb-8">
                {policyUpdates.narrative}
              </p>
            )}

            <div className="max-w-4xl">
              {feed ? (
                <Suspense
                  fallback={
                    officialLive ? <FeedSkeleton cards={3} columns="" cardHeight="h-[96px]" /> : <FeedSkeleton cards={1} columns="" cardHeight="h-[200px]" />
                  }
                >
                  <OfficialFeed feed={feed} limit={3} nearest={nearest} />
                </Suspense>
              ) : (
                <SourceUnavailable className="min-h-[200px]" />
              )}
            </div>

            {/* Handoff p. 29: organisation, document type and publication date must
                be clearly identified - the source line names who supplies them. */}
            {policyUpdates.sourceNote && (
              <p className="text-sm text-[var(--ink-muted)] max-w-4xl mt-4">
                {policyUpdates.sourceNote}
              </p>
            )}

            {/* pp. 29, 48, 59: the curated official source links beside the live
                feed. Static, so outside the Suspense boundary. */}
            <div className="max-w-4xl">
              <CuratedSources domainSlug={slug} />
            </div>
          </Container>
        </section>
      )}

      {/* CD - RELATED DATA */}
      <section className="py-20 bg-[var(--paper)]">
        <Container>
          <div className="flex justify-between items-end mb-8 max-w-4xl">
            <h2 className="text-3xl font-bold text-[var(--ink)]">Related Data</h2>
            <Link href={`/data-portal?domain=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline">
              Explore Related Data
            </Link>
          </div>
          <p className="text-lg text-[var(--ink-soft)] leading-relaxed max-w-4xl mb-8">
            Explore open-access datasets through charts and accessible tables. Each view identifies its source, geography, observation period, units and update date. Open a dataset to review the methodology and download data free of charge.
          </p>
          {/* p. 29: one dataset card, or the canonical catalogue links of the
              domain's recommended numerical sources (pp. 29, 38, 49, 59). */}
          <RelatedDataset field="domains" id={domain.id} sources={feed?.dataSources ?? []} />
        </Container>
      </section>

      {/* CT / ET / NT / BT - RELEVANT ENERQA TOOLS (handoff pp. 29, 38, 49, 59).
          Hidden entirely when no tools are listed: handoff p. 29 forbids labelling
          a tool public or online before its name, endpoint and access are tested. */}
      {tools.length > 0 && (
        <section className="py-20 bg-[var(--paper-alt)] border-y border-[var(--line)]">
          <Container>
            <div className="max-w-4xl mb-8">
              <h2 className="text-3xl font-bold text-[var(--ink)] mb-4">Relevant Enerqa Tools</h2>
              <p className="text-lg text-[var(--ink-soft)] leading-relaxed">
                Explore tools that help structure assessment and project decisions in this domain.
              </p>
            </div>
            {/* Handoff p. 8: tool cards lead with the purpose and put the access
                action at the bottom left. */}
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl list-none p-0 m-0">
              {tools.map((tool: any, idx: number) => (
                <li key={tool.id || `${tool.href}-${idx}`}>
                  <Link
                    href={tool.href}
                    className="flex h-full items-center justify-between gap-4 bg-[var(--paper)] p-6 rounded-[var(--r-md)] border border-[var(--line)] hover:border-[var(--green)] transition-colors"
                  >
                    <span className="text-lg font-bold text-[var(--ink)]">{tool.label}</span>
                    <ArrowRight className="w-5 h-5 text-[var(--color-secondary)] shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* CK - ENERQA PUBLICATION */}
      <section className="py-20 bg-[var(--paper)]">
        <Container>
          <div className="flex justify-between items-end mb-8 max-w-4xl">
            <h2 className="text-3xl font-bold text-[var(--ink)]">Enerqa Publication</h2>
            <Link href={`/knowledge-hub?domain=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline">
              Explore Enerqa Publication
            </Link>
          </div>
          {topicPhrase && (
            <p className="text-lg text-[var(--ink-soft)] leading-relaxed max-w-4xl mb-8">
              Read Enerqa&rsquo;s analysis and practical perspectives related to {topicPhrase}.
            </p>
          )}
          <div className="max-w-4xl">
            <RelatedPublications field="domains" id={domain.id} limit={3} />
          </div>
        </Container>
      </section>

      {/* CA - DISCUSS YOUR PROJECT */}
      <section className="py-24 bg-[var(--ink)] text-white text-center">
        <Container>
          <h2 className="text-4xl font-bold mb-6">Discuss Your Project</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Share your priorities, project stage and the questions that need to be resolved. The engagement can focus on a defined workstream or a broader development process.
          </p>
          <Link
            href={`/contact?domain=${slug}`}
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
