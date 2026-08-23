import { getPayload } from 'payload';
import configPromise from '/Users/maric/Documents/Work/Repos/enerqa.co.uk/src/payload.config.ts';

async function run() {
  const payload = await getPayload({ config: configPromise });

  console.log('Fetching insights in English (en)...');
  const insights = await payload.find({
    collection: 'insights',
    limit: 1000,
    locale: 'en',
    depth: 0,
  });

  console.log(`Found ${insights.docs.length} insights.`);

  for (const doc of insights.docs) {
    try {
      console.log(`Copying '${doc.title}' to Arabic (ar) locale...`);
      await payload.update({
        collection: 'insights',
        id: doc.id,
        locale: 'ar',
        data: {
          title: doc.title,
          excerpt: doc.excerpt,
          content: doc.content,
          metaTitle: doc.metaTitle,
          metaDescription: doc.metaDescription,
          metaKeywords: doc.metaKeywords,
        },
      });
      console.log(` - Success: ${doc.slug}`);
    } catch (e) {
      console.error(` - Error copying ${doc.slug}:`, e);
    }
  }

  console.log('Done.');
  process.exit(0);
}

run();
