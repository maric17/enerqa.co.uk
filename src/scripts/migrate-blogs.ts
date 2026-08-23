import { getPayload } from 'payload';
import configPromise from '../payload.config';
import { JSDOM } from 'jsdom';

async function run() {
  const payload = await getPayload({ config: configPromise });

  console.log('Fetching sitemap...');
  const sitemapResponse = await fetch('https://www.enerqa.co.uk/sitemap.xml');
  const sitemapText = await sitemapResponse.text();
  
  const urls = [];
  const regex = /<loc>(https:\/\/www\.enerqa\.co\.uk\/blog\/[^<]+)<\/loc>/g;
  let match;
  while ((match = regex.exec(sitemapText)) !== null) {
    urls.push(match[1]);
  }

  console.log(`Found ${urls.length} blog posts in sitemap.`);

  // Create a default category
  const existingCategory = await payload.find({
    collection: 'categories',
    where: { title: { equals: 'Blog' } },
  });

  let categoryId = existingCategory.docs.length > 0 ? existingCategory.docs[0].id : null;
  if (!categoryId) {
    const newCategory = await payload.create({
      collection: 'categories',
      data: {
        title: 'Blog',
      },
    });
    categoryId = newCategory.id;
  }

  for (const url of urls) {
    try {
      console.log(`Scraping ${url}...`);
      const response = await fetch(url);
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const title = document.querySelector('h1')?.textContent || '';
      const slug = url.split('/').pop() || '';
      
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const metaTitle = document.querySelector('title')?.textContent || '';
      
      const contentElements = document.querySelectorAll('article p');
      let contentText = '';
      contentElements.forEach((el: Element) => contentText += el.textContent + '\n\n');

      const excerpt = metaDesc || contentText.substring(0, 150) + '...';

      // We will need to convert contentText to Lexical Rich Text format
      // For now, doing a basic lexical structure. 
      const lexicalContent = {
        root: {
          type: "root",
          format: "",
          indent: 0,
          version: 1,
          children: [
            {
              type: "paragraph",
              format: "",
              indent: 0,
              version: 1,
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: contentText || "Imported content.",
                  type: "text",
                  version: 1
                }
              ]
            }
          ]
        }
      };

      // Upload image to payload if ogImage exists
      // Assuming user handles image uploads manually later or we can fetch buffer and upload
      // Here we just skip image upload for now as it requires downloading to buffer and creating Media

      const existingPost = await payload.find({
        collection: 'insights',
        where: { slug: { equals: slug } },
      });

      if (existingPost.docs.length === 0) {
        await payload.create({
          collection: 'insights',
          data: {
            title,
            slug,
            type: 'blog',
            category: [categoryId],
            excerpt,
            content: lexicalContent,
            metaTitle,
            metaDescription: metaDesc,
            _status: 'draft', 
            // image: id of a default media or skip if not required
          },
        });
        console.log(`Created insight: ${title}`);
      } else {
        console.log(`Insight already exists: ${slug}`);
      }

    } catch (e) {
      console.error(`Error scraping ${url}:`, e);
    }
  }

  console.log('Migration script complete.');
  process.exit(0);
}

run();
