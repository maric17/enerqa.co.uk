import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Container } from '../ui/Container'
import { Insight } from '@/payload-types'
import { Typography } from '../ui/Typography'

export const LatestNews = async () => {
  const payload = await getPayload({ config: configPromise })
  
  const { docs: newsData } = await payload.find({
    collection: 'insights',
    where: {
      type: { equals: 'news' }
    },
    sort: '-publishDate',
    limit: 5,
  })

  // Fallback to static data if CMS is empty for now
  const newsItems = newsData.length > 0 ? newsData : [
    {
      id: 'n1',
      title: 'enerQA announces strategic partnership with MENA renewable initiative',
      publishDate: new Date('2024-03-10').toISOString(),
      excerpt: 'New collaboration aims to accelerate solar deployment across the region by providing advanced data analytics.',
      slug: 'strategic-partnership-mena-renewable',
      type: 'news'
    },
    {
      id: 'n2',
      title: 'Our Q1 2024 Climate Policy Report is now available',
      publishDate: new Date('2024-03-05').toISOString(),
      excerpt: 'Read our latest analysis on shifting regulatory frameworks and their implications for heavy industry.',
      slug: 'q1-2024-climate-policy-report',
      type: 'news'
    },
    {
      id: 'n3',
      title: 'enerQA CEO to speak at Global Sustainability Summit',
      publishDate: new Date('2024-02-28').toISOString(),
      excerpt: 'Join us next month as we discuss the future of ESG reporting standards.',
      slug: 'ceo-speaking-global-sustainability-summit',
      type: 'news'
    },
    {
      id: 'n4',
      title: 'New API features added to the Data Portal',
      publishDate: new Date('2024-02-15').toISOString(),
      excerpt: 'Developers can now access high-resolution emission tracking metrics programmatically.',
      slug: 'new-api-features-data-portal',
      type: 'news'
    }
  ]

  return (
    <section className="bg-ink-soft py-16 lg:py-24 border-y border-ink">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="lg:w-1/3 flex flex-col gap-6 items-start">
            <Typography variant="eyebrow" className="text-white/60 m-0">
              <span className="en block">News Feed</span>
              <span className="ar block mt-1">تغذية الأخبار</span>
            </Typography>
            <Typography variant="h2" className="text-white m-0">
              <span className="en block">Latest Updates</span>
              <span className="ar block text-[0.8em] mt-2 text-white/90">أحدث التحديثات</span>
            </Typography>
            <p className="text-white/70 text-[15px] leading-relaxed max-w-[400px]">
              <span className="en">Stay informed with the latest announcements, policy updates, and milestones from enerQA and the wider energy sector.</span>
            </p>
            <Link href="/insights?type=news" className="mt-4 border border-white/20 text-white hover:bg-white hover:text-ink px-6 py-3 text-[13px] uppercase tracking-wider font-bold rounded-[4px] transition-colors">
              <span className="en">All News</span>
            </Link>
          </div>

          <div className="lg:w-2/3 flex flex-col">
            {newsItems.map((news, index) => (
              <Link 
                key={news.id} 
                href={news.slug ? `/insights/${news.slug}` : `/insights`}
                className={`group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 py-6 ${index !== 0 ? 'border-t border-white/10' : ''} transition-colors hover:bg-white/5 px-4 -mx-4 rounded-[8px] no-underline`}
              >
                <div className="text-white/50 text-[13px] font-mono whitespace-nowrap pt-1 sm:pt-0">
                  {new Date(news.publishDate || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-white text-[16px] md:text-[18px] font-bold leading-snug group-hover:text-green-400 transition-colors m-0">
                    {news.title}
                  </h3>
                  {news.excerpt && (
                    <p className="text-white/60 text-[14px] line-clamp-2 m-0">
                      {news.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
