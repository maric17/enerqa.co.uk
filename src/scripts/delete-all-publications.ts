import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';

async function run() {
  const payload = await getPayload({ config: configPromise });
  const pubs = await payload.find({
    collection: 'publications',
    limit: 1000,
  });

  console.log(`Found ${pubs.docs.length} publications to delete.`);

  for (const pub of pubs.docs) {
    console.log(`Deleting ${pub.title}...`);
    await payload.delete({
      collection: 'publications',
      id: pub.id,
    });
  }
  
  console.log('All publications deleted.');
  process.exit(0);
}
run();
