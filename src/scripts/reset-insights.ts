import { getPayload } from 'payload';
import configPromise from '/Users/maric/Documents/Work/Repos/enerqa.co.uk/src/payload.config.ts';
import { JSDOM } from 'jsdom';

async function run() {
  const payload = await getPayload({ config: configPromise });

  console.log('Deleting existing insights...');
  const existingInsights = await payload.find({
    collection: 'insights',
    limit: 1000,
  });

  for (const doc of existingInsights.docs) {
    await payload.delete({
      collection: 'insights',
      id: doc.id,
    });
    console.log(`Deleted insight: ${doc.slug}`);
  }
  console.log('All previous insights deleted.');

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

  // Find a media item to fulfill the required image field
  let imageId = null;
  const medias = await payload.find({
    collection: 'media',
    limit: 1,
  });
  if (medias.docs.length > 0) {
    imageId = medias.docs[0].id;
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

      const createData: any = {
        title,
        slug,
        type: 'blog',
        category: [categoryId],
        excerpt,
        content: lexicalContent,
        metaTitle,
        metaDescription: metaDesc,
        _status: 'draft',
      };
      
      if (imageId) {
        createData.image = imageId;
      } else {
        // payload may reject this, but let's try
      }

      await payload.create({
        collection: 'insights',
        data: createData,
      });
      console.log(`Created insight: ${title}`);

    } catch (e) {
      console.error(`Error scraping ${url}:`, e);
    }
  }

  console.log('Reset and Migration script complete.');
  process.exit(0);
}

run();
