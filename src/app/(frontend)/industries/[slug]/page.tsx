import React, { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { notFound } from 'next/navigation';
import { fetchNewsForKeywords } from '@/lib/api/news';
import { fetchResearch } from '@/lib/api/research';

/**
 * Words that carry no topic meaning, so they would match almost any headline.
 * "Energy & Utilities" should search for "energy" and "utilities", not "and".
 */
const STOPWORDS = new Set([
  'and', 'the', 'of', 'for', 'in', 'to', 'with', 'services', 'systems',
  'institutions', 'infrastructure', 'development', 'public', 'natural',
]);

/**
 * Industry news - handoff p. 64 and p. 226.
 *
 * This used to call newsapi.org directly. Two reasons it no longer does:
 *  - newsapi.org's free tier is licensed for development only, which fails the
 *    "free access must permit public corporate use" rule on p. 209.
 *  - p. 226 asks us to "reuse filtered records across home, domains,
 *    industries and Global Intelligence" rather than give every page its own
 *    upstream query.
 *
 * So this now filters the shared, already-cached pool. An industry page makes
 * no external request of its own.
 */
async function getIndustryNews(title: string) {
  // The cut-off is 2 characters, not 4. "Oil, Gas & Petrochemicals" is the
  // clearest case: a longer minimum throws away "oil" and "gas", which are the
  // only two words in that title a headline is likely to contain.
  const keywords = title
    .toLowerCase()
    .replace(/[,&]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
    .map((word) => {
      // Prevent "regulators" from becoming a strict match for "regulators(s)",
      // by converting it to "regulator*" which matches singular and plural.
      // We skip short words like 'gas' and words ending in 'ss' like 'business'.
      if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) {
        return word.slice(0, -1) + '*';
      }
      return word;
    });

  const result = await fetchNewsForKeywords(keywords, 4);
  return result.items;
}


/**
 * Research and official updates - handoff p. 212 onward.
 *
 * This called OpenAlex inline. Two problems with that, both fixed by moving to
 * the shared connector layer:
 *  - It fell back to `work.doi` as the destination when no open copy existed.
 *    p. 212 says the opposite: "Do not link the generic DOI/publisher page when
 *    a vetted repository OA copy is the usable destination", and a bare DOI
 *    often lands on a paywall - which fails the p. 209 access test.
 *  - It checked `work.is_oa`, which is not a field OpenAlex returns at the top
 *    level (it lives on `open_access.is_oa`), so the Open Access badge never
 *    appeared.
 *
 * The aggregator also brings in DOAJ, GBIF literature and OSTI, so a topic that
 * OpenAlex is thin on is not simply empty.
 */
async function getIndustryResearch(title: string) {
  const cleanTitle = title.replace(/[,&]/g, ' ').replace(/\s+/g, ' ').trim();
  const result = await fetchResearch({ search: `${cleanTitle} sustainability climate`, limit: 4 });
  return result.items;
}

/**
 * Fetch one industry by slug.
 *
 * Wrapped in React's `cache` so generateMetadata and the page component share a
 * single database query instead of running one each.
 */
const getIndustry = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'industries',
    where: { slug: { equals: slug } },
    limit: 1,
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

  const { title, heroNarrative, ctaText, lifecycleNarrative, workAreas, heroImage, relevantTools, dataSources } = industry;

  const tools = Array.isArray(relevantTools) ? relevantTools : [];
  const sources = Array.isArray(dataSources) ? dataSources : [];
  const heroImageUrl = heroImage && typeof heroImage === 'object' && 'url' in heroImage ? heroImage.url : null;

  // Fetch news data
  const newsArticles = await getIndustryNews(title);
  
  // Fetch research data
  const researchWorks = await getIndustryResearch(title);


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
             {/* Narrative / Description moved here */}
            <p className="text-[18px] md:text-[22px] leading-[1.6] text-[var(--ink-soft)] font-light m-0 whitespace-pre-line">
              {heroNarrative}
            </p>
          </div>
          
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
      {workAreas && workAreas.length > 0 && (
        <section className="py-20 bg-[var(--paper)]">
          <Container>
            <div className="max-w-4xl mb-10">
              <h2 className="text-3xl font-bold text-[var(--ink)] mb-4">Relevant Domains and Work Areas</h2>
              <p className="text-lg text-[var(--ink-soft)] leading-relaxed">
                Explore the technical, environmental, climate and business work areas relevant to this industry. Each link explains the scope within its parent domain rather than repeating it here.
              </p>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl list-none p-0 m-0">
              {workAreas.map((area: any) => (
                <li key={area.id || area.url}>
                  <Link
                    href={area.url}
                    className="flex h-full items-center justify-between gap-4 bg-[var(--paper-alt)] p-6 rounded-[var(--r-md)] border border-[var(--line)] hover:border-[var(--green)] transition-colors"
                  >
                    <span className="text-base font-bold text-[var(--ink)]">{area.title}</span>
                    <ArrowRight className="w-5 h-5 text-[var(--color-secondary)] shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}



      {/* PROJECT DEVELOPMENT & LIFECYCLE (SCROLL VIEW 3) */}
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

      {/* LATEST NEWS & RESEARCH (SCROLL VIEW 3 & 4) */}
      <section className="py-20 bg-[var(--paper)] border-y border-[var(--line)]">
        <Container>
          <div className="flex flex-col gap-20">
            {/* News */}
            <div>
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-3xl font-bold text-[var(--ink)]">Industry News</h2>
                <Link href={`/knowledge-hub/global-intelligence?industry=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline">
                  View All Industry News
                </Link>
              </div>
              
              {newsArticles && newsArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Text only, no publisher photographs. pp. 210, 214 and 216
                      all say the same thing: API or feed access does not clear
                      the rights to an article's images. */}
                  {newsArticles.map((article) => (
                    <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className="bg-white border border-[var(--line)] rounded-[var(--r-md)] overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group">
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="text-xs font-bold text-[var(--color-secondary)] mb-2 uppercase tracking-wide">
                          {article.publisher}
                        </div>
                        <h3 className="text-lg font-bold text-[var(--ink)] mb-3 line-clamp-3 group-hover:text-[var(--color-secondary)] transition-colors leading-snug">
                          {article.title}
                        </h3>
                        {article.summary && (
                          <p className="text-sm text-[var(--ink-soft)] mb-4 line-clamp-3 flex-grow leading-relaxed">
                            {article.summary}
                          </p>
                        )}
                        {article.publishedAt && (
                          <time dateTime={article.publishedAt} className="text-xs text-[var(--ink-muted)] mt-auto font-medium">
                            {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </time>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="bg-[var(--paper-alt)] p-8 rounded-[var(--r-md)] border border-[var(--line)] flex items-center justify-center min-h-[250px]">
                  <p className="text-[var(--ink-muted)] font-medium">No recent news available for this industry.</p>
                </div>
              )}
            </div>
            
            {/* Research */}
            <div>
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-3xl font-bold text-[var(--ink)]">Research and Official Updates</h2>
                <Link href={`/knowledge-hub/global-intelligence?type=research&industry=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline">
                  Explore Related Research
                </Link>
              </div>
              
              {researchWorks && researchWorks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {researchWorks.map((work) => {
                    const authorStr =
                      work.authors.slice(0, 2).join(', ') + (work.authors.length > 2 ? ' et al.' : '');

                    return (
                      <a key={work.id} href={work.readUrl} target="_blank" rel="noopener noreferrer" className="bg-white border border-[var(--line)] rounded-[var(--r-md)] p-6 hover:shadow-md transition-shadow flex flex-col h-full group">
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <div className="text-xs font-bold text-[var(--color-secondary)] uppercase tracking-wide line-clamp-2">
                            {work.source ?? work.provenance.providerName}
                          </div>
                          {/* Every item here passed the connector's verified_open
                              gate, so the badge is a fact rather than a guess. */}
                          <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-[var(--green)]/10 text-[var(--green-deep)] px-2 py-1 rounded-sm">
                            Open Access
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-[var(--ink)] mb-3 line-clamp-3 group-hover:text-[var(--color-secondary)] transition-colors leading-snug">
                          {work.title}
                        </h3>
                        {authorStr && (
                          <p className="text-sm text-[var(--ink-soft)] mb-4 line-clamp-2 italic flex-grow">
                            {authorStr}
                          </p>
                        )}
                        <div className="flex justify-between items-center text-xs text-[var(--ink-muted)] mt-auto font-medium border-t border-[var(--line)] pt-3">
                          {work.publishedAt ? (
                            <time dateTime={work.publishedAt}>{work.publishedAt}</time>
                          ) : (
                            <span>Date not stated</span>
                          )}
                          {/* p. 212: label research vs news, and never imply peer
                              review the provider did not state. */}
                          {work.peerReviewed === true && (
                            <span className="ml-2 text-[10px] uppercase tracking-wide">Peer reviewed</span>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[var(--paper-alt)] p-8 rounded-[var(--r-md)] border border-[var(--line)] flex items-center justify-center min-h-[250px]">
                  <p className="text-[var(--ink-muted)] font-medium">No relevant updates are available.</p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* DATA, TOOLS & PUBLICATIONS (SCROLL VIEW 4 & 5) */}
      <section className="py-20 bg-[var(--paper)]">
        <Container>
          <div className="flex flex-col gap-20">
            {/* I{nn}D - RELATED DATA (handoff p. 65).
                No live preview yet: p. 66 says use the industry-specific source
                mapping, and if no geographically relevant licensed dataset is
                available, show canonical catalogue links - NOT a sample
                statistic. The recommended providers below come from the
                handoff mapping and drive the Data Portal work. */}
            <div>
              <div className="flex justify-between items-end mb-8 max-w-4xl">
                <h2 className="text-3xl font-bold text-[var(--ink)]">Related Data</h2>
                <Link href={`/data-portal?industry=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline">
                  Explore Related Data
                </Link>
              </div>
              <p className="text-lg text-[var(--ink-soft)] leading-relaxed max-w-4xl mb-8">
                Explore open-access datasets through charts and accessible tables. Each view identifies its source, geography, observation period, units and update date. Open a dataset to review the methodology and download data free of charge.
              </p>
              <Link
                href={`/data-portal?industry=${slug}`}
                className="inline-flex items-center gap-2 bg-[var(--paper-alt)] text-[var(--ink)] font-bold py-3 px-6 rounded-full hover:bg-[var(--line)] transition-colors text-sm border border-[var(--line)]"
              >
                Browse the dataset catalogue <ArrowRight className="w-4 h-4" />
              </Link>
              {sources.length > 0 && (
                <p className="text-sm text-[var(--ink-muted)] max-w-4xl mt-4">
                  Recommended sources for this industry:{' '}
                  {sources.map((src: any) => src.provider).join(', ')}.
                </p>
              )}
            </div>

            {/* Tools & Publications - Side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Relevant Tools */}
              <div>
                <div className="flex justify-between items-end mb-8">
                  <h2 className="text-3xl font-bold text-[var(--ink)]">Relevant Enerqa Tools</h2>
                  <Link href={`/tools?industry=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline">
                    Explore All Tools
                  </Link>
                </div>
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
                  <div className="bg-[var(--paper-alt)] p-8 rounded-[var(--r-md)] border border-[var(--line)] flex items-center justify-center min-h-[250px]">
                    <p className="text-[var(--ink-muted)] font-medium">No relevant updates are available.</p>
                  </div>
                )}
              </div>

              {/* Enerqa Publications */}
              <div>
                <div className="flex justify-between items-end mb-8">
                  <h2 className="text-3xl font-bold text-[var(--ink)]">Enerqa Publication</h2>
                  <Link href={`/knowledge-hub?industry=${slug}`} className="text-sm font-semibold text-[var(--color-secondary)] hover:underline">
                    Explore Related Publications
                  </Link>
                </div>
                <div className="bg-[var(--paper-alt)] p-8 rounded-[var(--r-md)] border border-[var(--line)] flex items-center justify-center min-h-[250px]">
                  <p className="text-[var(--ink-muted)] font-medium">No relevant updates are available.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* DISCUSS YOUR PROJECT (SCROLL VIEW 6) */}
      <section className="py-24 bg-[var(--ink)] text-white text-center">
        <Container>
          <h2 className="text-4xl font-bold mb-6">Discuss Your Project</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Share your priorities, project stage and the questions that need to be resolved. The engagement can focus on a defined workstream or a broader development process.
          </p>
          <Link 
            href={`/contact?industry=${slug}`}
            className="inline-flex items-center gap-2 bg-[var(--green)] text-[var(--ink)] font-bold py-4 px-10 rounded-full hover:bg-[var(--paper)] hover:text-[var(--ink)] transition-colors text-lg"
          >
            Contact Enerqa
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Container>
      </section>
    </div>
  );
}
