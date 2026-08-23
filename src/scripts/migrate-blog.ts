import { getPayload } from 'payload'
import config from '../payload.config'
import { XMLParser } from 'fast-xml-parser'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { JSDOM } from 'jsdom'

interface LexicalNode {
  type: string
  version: number
  [key: string]: unknown
}

interface LexicalElement extends LexicalNode {
  children: LexicalNode[]
  format: string
  indent: number
  direction?: 'ltr' | 'rtl' | null
}

// Simple Lexical Converter from HTML
function convertHtmlToLexical(html: string) {
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const root: LexicalElement = {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    children: []
  }

  // Iterate over root children and convert
  doc.body.childNodes.forEach(node => {
    if (node.nodeType === 1) { // Element Node
      const el = node as HTMLElement
      if (el.tagName === 'P' || el.tagName === 'DIV') {
        const text = el.textContent?.trim()
        if (text) {
          root.children.push({
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: text,
                version: 1
              }
            ]
          })
        }
      } else if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3') {
        const text = el.textContent?.trim()
        if (text) {
          root.children.push({
            type: 'heading',
            tag: el.tagName.toLowerCase(),
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: text,
                version: 1
              }
            ]
          })
        }
      } else if (el.tagName === 'UL' || el.tagName === 'OL') {
        const listNode: LexicalElement = {
          type: 'list',
          listType: el.tagName === 'UL' ? 'bullet' : 'number',
          format: '',
          indent: 0,
          version: 1,
          children: []
        }
        el.querySelectorAll('li').forEach(li => {
          const text = li.textContent?.trim()
          if (text) {
            listNode.children.push({
              type: 'listitem',
              format: '',
              indent: 0,
              version: 1,
              value: 1,
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: text,
                  version: 1
                }
              ]
            })
          }
        })
        if (listNode.children.length > 0) {
          root.children.push(listNode)
        }
      }
    }
  })

  // If empty, add a default empty paragraph so Lexical doesn't crash
  if (root.children.length === 0) {
    root.children.push({
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      children: []
    })
  }

  return { root }
}

async function run() {
  const payload = await getPayload({ config })
  console.log('Payload initialized.')

  // Fetch RSS Feed
  const res = await fetch('https://www.enerqa.co.uk/feed/rss2')
  const xml = await res.text()

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  })
  const feed = parser.parse(xml)
  const items = feed.rss.channel.item || []
  
  console.log(`Found ${items.length} items in RSS feed.`)

  // Ensure 'Blog' Category exists
  const cats = await payload.find({
    collection: 'categories',
    where: {
      title: { equals: 'Blog' }
    }
  })
  
  let blogCategoryId = cats.docs.length > 0 ? cats.docs[0].id : null
  if (!blogCategoryId) {
    const newCat = await payload.create({
      collection: 'categories',
      data: {
        title: 'Blog',
      }
    })
    blogCategoryId = newCat.id
    console.log('Created Blog category.')
  }

  for (const item of items) {
    console.log(`Processing: ${item.title}`)
    
    // Check if it exists by slug
    const slug = item.link.split('/').pop() || ''
    
    const existing = await payload.find({
      collection: 'insights',
      where: {
        slug: { equals: slug }
      }
    })

    if (existing.docs.length > 0) {
      console.log(` - Post ${slug} already exists, skipping.`)
      continue
    }

    let mediaId: number | null = null
    // Get Image
    let imageUrl = null
    if (item['media:content']) {
      const media = Array.isArray(item['media:content']) ? item['media:content'] : [item['media:content']]
      imageUrl = media[0]['@_url']
    } else if (item.enclosure && item.enclosure['@_url']) {
      imageUrl = item.enclosure['@_url']
    }

    if (imageUrl) {
      console.log(` - Downloading image: ${imageUrl}`)
      const imgRes = await fetch(imageUrl)
      const arrayBuffer = await imgRes.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const fileName = imageUrl.split('/').pop()?.split('?')[0] || 'thumbnail.jpg'
      const tmpPath = path.join(os.tmpdir(), fileName)
      fs.writeFileSync(tmpPath, buffer)
      
      try {
        const mediaDoc = await payload.create({
          collection: 'media',
          data: {
            alt: item.title,
          },
          filePath: tmpPath
        })
        mediaId = mediaDoc.id as number
      } catch (e: unknown) {
        console.error(` - Failed to upload image: ${e instanceof Error ? e.message : String(e)}`)
      }
    }
    
    // Process Content
    const htmlContent = item['content:encoded'] || item.description || ''
    const lexicalContent = convertHtmlToLexical(htmlContent)

    // Generate Excerpt
    const dom = new JSDOM(htmlContent)
    const textContent = dom.window.document.body.textContent || ''
    const excerpt = textContent.split('. ').slice(0, 2).join('. ') + (textContent.length > 0 ? '.' : '')

    // Create post
    try {
      // @ts-expect-error Payload's complex types for Lexical and drafts sometimes conflict here
      await payload.create({
        collection: 'insights',
        data: {
          title: item.title,
          slug: slug,
          type: 'blog',
          category: [blogCategoryId],
          publishDate: new Date(item.pubDate).toISOString(),
          excerpt: excerpt.substring(0, 300), // Ensure it fits
          content: lexicalContent as never,
          image: mediaId as number | undefined, // Link to media ID
        }
      })
      console.log(` - Created Insight: ${item.title}`)
    } catch (e: unknown) {
      console.error(` - Failed to create Insight: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  console.log('Migration complete.')
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
