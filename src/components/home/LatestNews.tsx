import React from 'react'
import Link from 'next/link'
import { Container } from '../ui/Container'
import { Typography } from '../ui/Typography'
import { NewsSlider } from './NewsSlider'

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
}

export const LatestNews = async () => {
  let newsItems: NewsArticle[] = []

  try {
    const res = await fetch(`https://newsapi.org/v2/everything?q="climate change"&language=en&sortBy=publishedAt&pageSize=12&apiKey=${process.env.NEWS_API_KEY}`, {
      next: { revalidate: 3600 }
    })
    
    if (res.ok) {
      const data = await res.json()
      newsItems = (data.articles || []).filter((article: NewsArticle) => article.urlToImage !== null && article.urlToImage !== '')
    } else {
      console.error('Failed to fetch news:', await res.text())
    }
  } catch (error) {
    console.error('Error fetching news:', error)
  }

  // Fallback to static data if API is exhausted or offline
  if (newsItems.length === 0) {
    newsItems = [
      {
        title: 'enerQA announces strategic partnership with MENA renewable initiative',
        publishedAt: new Date('2024-03-10').toISOString(),
        description: 'New collaboration aims to accelerate solar deployment across the region by providing advanced data analytics.',
        url: '/insights',
        urlToImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop'
      },
      {
        title: 'Our Q1 2024 Climate Policy Report is now available',
        publishedAt: new Date('2024-03-05').toISOString(),
        description: 'Read our latest analysis on shifting regulatory frameworks and their implications for heavy industry.',
        url: '/insights',
        urlToImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1000&auto=format&fit=crop'
      }
    ]
  }

  return (
    <section className="py-16 lg:py-24 border-y border-ink overflow-hidden relative">
      {/* Light Background Image with White Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2000&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        zIndex: 0
      }}></div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.92)', zIndex: 1, pointerEvents: 'none' }}></div>
      
      <Container style={{ position: 'relative', zIndex: 2 }}>
        <NewsSlider newsItems={newsItems.slice(0, 8)} />
      </Container>
    </section>
  )
}
