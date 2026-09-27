import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';

async function run() {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: 'publications',
  });
  console.log("Found:", result.docs.length, "publications");
  if(result.docs.length > 0) {
    console.log("First one:", result.docs[0].slug);
    console.log("Checking sustainable-tourism:", result.docs.find(d => d.slug === 'sustainable-tourism'));
  }
}

run();
