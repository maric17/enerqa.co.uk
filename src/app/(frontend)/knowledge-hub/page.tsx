import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { Container } from '@/components/ui/Container';
import { getPrivacyHref } from '@/lib/policies';
import { Typography } from '@/components/ui/Typography';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/Button';
import SubscribeForm from '@/components/SubscribeForm';
import { NewsFeed } from '@/components/feeds/NewsFeed';
import { FeedSkeleton } from '@/components/feeds/feedParts';
import { resolveMediaUrl } from '@/lib/utils';
import KnowledgeHubClient from './KnowledgeHubClient';
import { CollectionSwitch } from './CollectionSwitch';
import { ARCHIVE_LABELS, lexicalText, searchWords, sortByDate, type PublicationCard } from './publicationFinder';

// Handoff p. 227: unique descriptive title and meta description.
export const metadata: Metadata = {
  title: 'Knowledge Hub',
  description:
    'Original Enerqa analysis alongside open-access news, research and official updates. Two collections: Enerqa Publication and Global Intelligence.',
  alternates: { canonical: '/knowledge-hub' },
};

type Related = { slug?: string | null; title?: string | null } | number | null | undefined;
const related = (list: Related[] | null | undefined) =>
  (list ?? []).flatMap((r) => (r && typeof r === 'object' && r.slug ? [{ slug: r.slug, title: r.title ?? r.slug }] : []));

/**
 * /knowledge-hub, segments K01-K06 (pp. 152-156).
 *
 * Static page: ?domain= / ?industry= are read in the browser by the client
 * component, so this does not become a per-request database query. Only K03/K04
 * (search, filters, results) run in the browser; the rest is server-rendered.
 */
export default async function KnowledgeHubPage() {
  const payload = await getPayload({ config: configPromise });

  // recordKind keeps category separators and biography pages out (p. 155:
  // "Exclude category separators and biography pages from publication imports").
  const { docs } = await payload.find({
    collection: 'publications',
    where: { recordKind: { equals: 'article' } },
    limit: 200,
    depth: 1,
    // The body is read here only to build the search words; it is not sent to
    // the browser (see `cards` below).
    select: {
      title: true, slug: true, excerpt: true, content: true, author: true, date: true, dateVerified: true,
      type: true, language: true, archiveCategory: true, metaKeywords: true, file: true, domains: true, industries: true,
    },
    // The Domain/Industry facets need only a slug and a label.
    populate: {
      domains: { slug: true, title: true },
      industries: { slug: true, title: true },
    },
  });

  const cards: PublicationCard[] = sortByDate(
    docs.map((d) => {
      const domains = related(d.domains as Related[]);
      const industries = related(d.industries as Related[]);
      const file = d.file && typeof d.file === 'object' ? resolveMediaUrl(d.file.url) : '';
      const topic = d.archiveCategory ? ARCHIVE_LABELS[d.archiveCategory] ?? d.archiveCategory : null;
      return {
        id: d.id,
        slug: d.slug,
        title: d.title,
        excerpt: d.excerpt ?? null,
        author: d.author ?? null,
        date: d.date ?? null,
        dateVerified: Boolean(d.dateVerified),
        type: d.type ?? null,
        language: d.language ?? null,
        archiveCategory: d.archiveCategory ?? null,
        fileUrl: file || null,
        domains,
        industries,
        // p. 155: "search across titles, approved article text, summaries and tags".
        searchText: searchWords(
          d.title, d.excerpt, d.author, d.type, topic, d.metaKeywords,
          ...domains.map((x) => x.title), ...industries.map((x) => x.title),
          lexicalText(d.content?.root),
        ),
      };
    }),
  );

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper)]">
      {/* K01 "Breadcrumb, H1 and two-collection introduction" (p. 152), copy p. 155 verbatim */}
      <PageHero
        title="Knowledge Hub"
        imageUrl="/images/knowledge_hub_banner_no_text.jpg"
        breadcrumbs={
          <>
            <Link href="/" className="text-white/80 hover:text-white transition-colors no-underline">Home</Link> / <span className="en text-white" aria-current="page">Knowledge Hub</span>
          </>
        }
      />

      {/* Narrative Section */}
      <section className="bg-[var(--paper)] pt-12 pb-8 border-b border-[var(--line)] shadow-sm">
        <Container>
          <div className="max-w-4xl mb-8">
            <p className="text-[18px] md:text-[22px] leading-[1.6] text-[var(--ink-soft)] font-light m-0 whitespace-pre-line">
              Explore original Enerqa analysis alongside open-access news, research and official updates from around the world. Choose Enerqa Publication for our own work, or Global Intelligence for external evidence relevant to climate, energy, environment, nature, circularity, ESG and finance.
            </p>
          </div>
        </Container>
      </section>

      {/* K02 Choose a Collection */}
      <CollectionSwitch active="publications" />

      {/* K03 Find a Publication + K04 Enerqa Publication */}
      <KnowledgeHubClient publications={cards} />

      {/* K05 Global Intelligence (p. 156): "Verified open-access external items +
          second-collection link" (p. 153). The items stream in behind a
          same-size skeleton, so the publications never wait on a provider. */}
      <section aria-labelledby="k05-heading" className="border-t border-gray-200 bg-[var(--color-paper-alt)] py-16">
        <Container>
          <div className="mb-8 max-w-3xl">
            <h2 id="k05-heading" className="m-0 text-3xl font-bold text-[var(--color-dark)]">Global Intelligence</h2>
            <p className="m-0 mt-3 text-lg text-gray-600">
              Follow open-access news, research and official updates from external sources. Search the second collection by topic, domain and geography to explore evidence relevant to your interests.
            </p>
          </div>
          <Suspense fallback={<FeedSkeleton cards={3} columns="md:grid-cols-3" cardHeight="h-[220px]" />}>
            <NewsFeed limit={3} nearest={{ href: '/knowledge-hub/global-intelligence', label: 'Global Intelligence' }} />
          </Suspense>
          <div className="mt-8">
            <Button href="/knowledge-hub/global-intelligence" variant="primary" className="gap-2">
              Explore Global Intelligence <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Container>
      </section>

      {/* K06 Stay Informed (p. 156). `id` is the target of the live site's
          /newsletter-subscription redirect (next.config.ts). */}
      <section id="stay-informed" aria-labelledby="k06-heading" className="mt-auto scroll-mt-24 border-t border-gray-200 bg-white py-16">
        <Container>
          <div className="mx-auto grid max-w-4xl gap-8 rounded-2xl border border-gray-200 bg-[var(--color-paper-alt)] p-8 md:grid-cols-[1fr_auto] md:items-end md:p-10">
            <div>
              <h2 id="k06-heading" className="m-0 text-3xl font-bold text-[var(--color-dark)]">Stay Informed</h2>
              <p className="m-0 mb-6 mt-3 text-lg text-gray-600">Receive new Enerqa publications and selected updates.</p>
              {/* The same working form as the footer. */}
              <div className="max-w-md">
                <SubscribeForm tone="light" privacyHref={await getPrivacyHref()} />
              </div>
            </div>
            <Button href="/contact?intent=project" variant="secondary">
              Discuss Your Project
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
