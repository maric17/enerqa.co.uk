import { getPayload } from 'payload';
import configPromise from '/Users/maric/Documents/Work/Repos/enerqa.co.uk/src/payload.config.ts';

async function run() {
  const payload = await getPayload({ config: configPromise });

  console.log('Fetching draft insights...');
  const insights = await payload.find({
    collection: 'insights',
    limit: 1000,
    depth: 0,
    draft: true, // Ensure we fetch drafts
  });

  console.log(`Found ${insights.docs.length} insights.`);

  for (const doc of insights.docs) {
    try {
      console.log(`Publishing '${doc.title}'...`);
      await payload.update({
        collection: 'insights',
        id: doc.id,
        data: {
          _status: 'published',
        },
      });
      console.log(` - Success: ${doc.slug}`);
    } catch (e) {
      console.error(` - Error publishing ${doc.slug}:`, e);
    }
  }

  console.log('Done.');
  process.exit(0);
}

run();
