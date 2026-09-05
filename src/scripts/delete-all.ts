import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';

async function run() {
  const payload = await getPayload({ config: configPromise });
  const docs = await payload.find({
    collection: 'publications',
    limit: 1000
  });
  
  console.log(`Found ${docs.docs.length} publications to delete.`);
  
  for (const doc of docs.docs) {
    await payload.delete({
      collection: 'publications',
      id: doc.id
    });
    console.log(`Deleted ${doc.title}`);
  }
  
  console.log('All publications deleted.');
  process.exit(0);
}
run();
