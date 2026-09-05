import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';

async function run() {
  const payload = await getPayload({ config: configPromise });
  
  const publications = await payload.find({
    collection: 'publications',
    limit: 100
  });

  console.log(`Found ${publications.docs.length} publications to check.`);

  for (const pub of publications.docs) {
    const pubTitle = pub.title;
    const existingInsight = await payload.find({
      collection: 'insights',
      where: {
        title: {
          equals: pubTitle
        }
      }
    });

    if (existingInsight.docs.length > 0) {
      console.log(`Publication "${pubTitle}" is in insights. DELETING it...`);
      await payload.delete({
        collection: 'publications',
        id: pub.id
      });
    } else {
      console.log(`Publication "${pubTitle}" is NOT in insights. Keeping it.`);
    }
  }

  console.log('Check done.');
  process.exit(0);
}

run();
