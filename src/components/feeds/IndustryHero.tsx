import React, { Suspense } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { GlobalNewsPanel } from '@/components/home/GlobalNewsPanel';
import { formatDateTimeUtc, toCard, type HeroSlide } from '@/components/home/firstFoldNews';
import { fetchNewsForKeywords, isNewsItemStale } from '@/lib/api/news';
import { INDUSTRY_FEEDS, newsPhrases } from '@/lib/feeds/contextual';
import { industryRefreshJob } from '@/lib/api/news/discovery';

type Industry = { title: string; slug: string };

function emptySlide({ title, slug }: Industry): HeroSlide {
  return { key: slug, label: title, item: null, sourcesFailed: false,
    retrievedAt: null, delayed: false, stale: false };
}

/** Read the same saved, sector-filtered feed previously shown lower on the page. */
export async function IndustryHeadlines({ industry }: { industry: Industry }) {
  const feed = INDUSTRY_FEEDS[industry.slug];
  if (!feed) return <GlobalNewsPanel industry={industry} slides={[emptySlide(industry)]} />;

  const result = await fetchNewsForKeywords(newsPhrases(feed), 3, { baskets: feed.newsBaskets,
    contextRules: feed.newsContextRules, sectorRules: feed.newsSectorRules,
    refreshJob: industryRefreshJob(industry.slug) });
  const stories = result.items.map(item => ({
    item: toCard(item),
    retrievedAt: formatDateTimeUtc(item.feedRefreshedAt ?? item.retrievedAt),
    delayed: ['apitube', 'newsdata'].includes(item.provider),
    stale: isNewsItemStale(item),
  }));
  const slide: HeroSlide = { ...emptySlide(industry), stories,
    ...stories[0], sourcesFailed: result.sourcesFailed };
  return <GlobalNewsPanel industry={industry} slides={[slide]} />;
}

/** The industry name stays outside the slideshow, including while news loads. */
export function IndustryHero({ title, slug }: Industry) {
  const industry = { title, slug };
  return <section className="home-hero industry-hero" aria-labelledby="industry-title">
    <Container className="industry-hero-heading">
      <nav aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true"> / </span>
        <Link href="/domains-and-industries#industries">Industries</Link>
      </nav>
      <h1 id="industry-title">{title}</h1>
    </Container>
    <Suspense fallback={<GlobalNewsPanel industry={industry} slides={[emptySlide(industry)]} loading />}>
      <IndustryHeadlines industry={industry} />
    </Suspense>
  </section>;
}
