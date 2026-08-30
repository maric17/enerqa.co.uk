import { resolveMediaUrl } from "@/lib/utils";
import React from 'react';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import SubscribeForm from '@/components/SubscribeForm';
import { Insight, Category } from '@/payload-types';
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function InsightsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const pageParam = typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : '1'
  const page = parseInt(pageParam, 10) || 1

  const typeParam = typeof resolvedSearchParams.type === 'string' ? resolvedSearchParams.type : undefined;
  const queryParam = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;

  const whereClause: any = {
    _status: {
      equals: 'published'
    },
    publishDate: {
      less_than_equal: new Date().toISOString()
    }
  };

  if (typeParam) {
    whereClause.type = { equals: typeParam };
  }
  if (queryParam) {
    whereClause.or = [
      { title: { like: queryParam } },
      { excerpt: { like: queryParam } }
    ];
  }

  const payload = await getPayload({ config: configPromise });
  const insights = await payload.find({
    collection: 'insights',
    where: whereClause,
    sort: '-publishDate',
    limit: 6,
    page: page,
  });

  return (
    <>
      <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute top-10 left-10 md:top-14 md:left-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0">
          enerQA / reel 06
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 z-20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 m-0 text-right">
          SCENE 06 — INSIGHTS
        </div>
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-[url('/images/banners/default-banner-insights.jpeg')]"></div>
        <div className="hero-insights-overlay z-10 opacity-80"></div>
        
        <Container className="relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/80 mb-2">
            <Link href="/" className="text-white/80 hover:text-white transition-colors no-underline">Home</Link> / <span className="en text-white">Insights</span><span className="ar text-white">رؤى</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">Notes from the field, as they happen.</span>
            <span className="ar block text-[0.8em] mt-3 text-white/90">ملاحظات من الميدان، أولًا بأول.</span>
          </Typography>
          <div className="mt-2">
            <Button href="/data-portal" variant="primary" className="bg-white !text-ink hover:bg-white/90">
              <span className="en">Explore Data Portal</span><span className="ar ml-2">استكشف بوابة البيانات</span>
            </Button>
          </div>
        </Container>
      </section>

      <Section theme="muted">
        <div className="w-full flex flex-col gap-10">
          <Typography variant="eyebrow" className="text-ink-muted mb-0">
            <span className="en">Latest</span><span className="ar ml-2">الأحدث</span>
          </Typography>
          
          <form method="GET" action="/insights" className="flex flex-col sm:flex-row gap-4 mb-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                name="q" 
                placeholder="Search insights..." 
                defaultValue={queryParam}
                className="w-full px-5 py-3 border border-ink/20 rounded-[100px] bg-transparent text-ink placeholder:text-ink/50 focus:outline-none focus:border-ink/50"
              />
            </div>
            <select 
              name="type" 
              defaultValue={typeParam || ""}
              className="px-5 py-3 border border-ink/20 rounded-[100px] bg-transparent text-ink focus:outline-none focus:border-ink/50 w-full sm:w-auto appearance-none cursor-pointer pr-10"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2325050f\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
            >
              <option value="">All Types</option>
              <option value="insight">Insights</option>
              <option value="news">News</option>
              <option value="blog">Blog</option>
            </select>
            <Button type="submit" variant="primary">
              <span className="en">Search</span><span className="ar ml-2">بحث</span>
            </Button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.docs.length > 0 ? (
              insights.docs.map((post: Insight) => {
                const authors = Array.isArray(post.authors) ? post.authors : [];
                const authorNames = authors
                  .map((author: any) => (typeof author === 'object' && author !== null && 'name' in author ? author.name : null))
                  .filter(Boolean)
                  .join(', ');
                  
                return (
                <Link key={post.id} href={`/insights/${post.slug}`} className="flex flex-col gap-4 bg-white p-5 rounded-[16px] border border-ink/10 hover:border-ink/30 transition-all hover:shadow-md group no-underline">
                  <div className="w-full aspect-[16/10] rounded-[8px] bg-line bg-cover bg-center overflow-hidden" style={post.image && typeof post.image === 'object' && 'url' in post.image && resolveMediaUrl(post.image.url) ? { backgroundImage: `url(${resolveMediaUrl(post.image.url)})` } : {}}></div>
                  
                  <div className="text-[13px] text-ink-soft flex items-center justify-between">
                    <div>
                      <span className="en">
                        {authorNames ? `${authorNames} • ` : ''}
                        {new Date(post.publishDate || post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="ar hidden group-[[data-lang=ar]]:inline-block">
                        {authorNames ? `${authorNames} • ` : ''}
                        {new Date(post.publishDate || post.createdAt).toLocaleDateString('ar-EG', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    {post.type && (
                      <span className="uppercase text-[10px] tracking-wider font-bold bg-ink/5 px-2 py-1 rounded">{post.type}</span>
                    )}
                  </div>

                  <Typography variant="h4" className="text-ink m-0 group-hover:text-ink/80 transition-colors">
                    <span className="en line-clamp-2">{post.title}</span><span className="ar hidden group-[[data-lang=ar]]:-webkit-box line-clamp-2">{post.title}</span>
                  </Typography>
                  
                  <p className="text-[14px] leading-[1.6] text-ink-soft m-0 mb-2">
                    <span className="en line-clamp-3">{post.excerpt}</span><span className="ar hidden group-[[data-lang=ar]]:-webkit-box line-clamp-3">{post.excerpt}</span>
                  </p>
                  
                  <div className="mt-auto pt-2 flex flex-wrap gap-2">
                    {post.category && Array.isArray(post.category) && post.category.map((cat: Category | number) => (
                      <Badge key={typeof cat === 'object' && cat !== null ? cat.id : String(cat)} variant="outline">
                        {typeof cat === 'object' && cat !== null ? cat.title : String(cat)}
                      </Badge>
                    ))}
                  </div>
                </Link>
              ); })
            ) : (
              <div className="col-span-full py-10 text-ink-soft text-center">
                <span className="en">No insights published yet.</span>
                <span className="ar ml-2">لا توجد رؤى منشورة بعد.</span>
              </div>
            )}
          </div>
          
          <div className="text-center mt-6 flex flex-wrap gap-4 justify-center">
            <Button href="/knowledge-hub" variant="outline" className="!border-ink !text-ink hover:!bg-ink hover:!text-white">
              <span className="en">Browse the full Knowledge Hub</span><span className="ar ml-2">تصفح مركز المعرفة بالكامل</span>
            </Button>
            <Button href="/data-portal" variant="primary">
              <span className="en">Explore Data Portal</span><span className="ar ml-2">استكشف بوابة البيانات</span>
            </Button>
          </div>

          {insights.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-ink/10">
              {insights.hasPrevPage ? (
                <Link href={`/insights?page=${insights.prevPage}${typeParam ? `&type=${typeParam}` : ''}`} className="px-4 py-2 border border-ink/20 rounded-full text-[13px] font-bold uppercase tracking-wider text-ink hover:bg-ink/5 transition-colors no-underline">
                  <span className="en">Previous</span><span className="ar">السابق</span>
                </Link>
              ) : (
                <span className="px-4 py-2 border border-ink/10 rounded-full text-[13px] font-bold uppercase tracking-wider text-ink-muted cursor-not-allowed">
                  <span className="en">Previous</span><span className="ar">السابق</span>
                </span>
              )}
              
              <div className="text-[13px] font-bold text-ink-soft">
                <span className="en">Page {insights.page} of {insights.totalPages}</span>
                <span className="ar ml-2">صفحة {insights.page} من {insights.totalPages}</span>
              </div>

              {insights.hasNextPage ? (
                <Link href={`/insights?page=${insights.nextPage}${typeParam ? `&type=${typeParam}` : ''}`} className="px-4 py-2 border border-ink/20 rounded-full text-[13px] font-bold uppercase tracking-wider text-ink hover:bg-ink/5 transition-colors no-underline">
                  <span className="en">Next</span><span className="ar">التالي</span>
                </Link>
              ) : (
                <span className="px-4 py-2 border border-ink/10 rounded-full text-[13px] font-bold uppercase tracking-wider text-ink-muted cursor-not-allowed">
                  <span className="en">Next</span><span className="ar">التالي</span>
                </span>
              )}
            </div>
          )}
        </div>
      </Section>

      <section className="relative w-full py-[120px] flex flex-col items-center justify-center bg-ink text-white overflow-hidden text-center border-t border-white/10">
        <div className="max-w-[600px] w-[90%] mx-auto relative z-20 flex flex-col items-center gap-7">
          <Typography variant="eyebrow" className="text-white/80 m-0 w-full text-center flex justify-center">
            <span className="en">Stay up to date</span><span className="ar ml-2">ابقَ على اطّلاع</span>
          </Typography>
          <Typography variant="h2" className="text-white m-0 text-center">
            <span className="en block">Get field notes in your inbox.</span>
            <span className="ar block mt-3 text-white/90">احصل على ملاحظاتنا الميدانية في بريدك.</span>
          </Typography>
          <div className="w-full mt-4">
            <SubscribeForm />
          </div>
        </div>
      </section>
    </>
  );
}
