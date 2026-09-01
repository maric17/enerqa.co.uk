import { getPayload } from 'payload';
import configPromise from './src/payload.config.ts';

async function run() {
  const payload = await getPayload({ config: configPromise });
  const publications = await payload.find({
    collection: 'publications',
    limit: 1,
  });
  console.log("File field:");
  console.dir(publications.docs[0]?.file, { depth: null });
}
run().catch(console.error);
