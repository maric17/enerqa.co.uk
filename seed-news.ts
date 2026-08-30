import { getPayload } from 'payload'
import configPromise from './src/payload.config'

async function seed() {
  const payload = await getPayload({ config: configPromise })
  
  const dummyNews = [
    {
      title: 'enerQA CEO to speak at Global Sustainability Summit',
      slug: 'ceo-speaking-global-sustainability-summit',
      excerpt: 'Join us next month as we discuss the future of ESG reporting standards.',
      type: 'news',
      category: [1],
      image: 57,
      publishDate: new Date('2024-02-28').toISOString(),
      content: { root: { children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'We are thrilled to announce that our CEO will be a keynote speaker at the upcoming Global Sustainability Summit.' }] }], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } },
      _status: 'published'
    },
    {
      title: 'New API features added to the Data Portal',
      slug: 'new-api-features-data-portal',
      excerpt: 'Developers can now access high-resolution emission tracking metrics programmatically.',
      type: 'news',
      category: [1],
      image: 57,
      publishDate: new Date('2024-02-15').toISOString(),
      content: { root: { children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Our engineering team has rolled out a major update to the API, exposing real-time emission data for enterprise users.' }] }], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } },
      _status: 'published'
    }
  ]

  for (const news of dummyNews) {
    try {
      await payload.create({
        collection: 'insights',
        data: news as any,
      })
      console.log(`Created: ${news.title}`)
    } catch (err) {
      console.error(`Failed to create ${news.title}:`, err.message)
    }
  }
  process.exit(0)
}

seed()
