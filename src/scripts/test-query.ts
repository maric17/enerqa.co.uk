import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';
import fs from 'fs';

async function run() {
  const payload = await getPayload({ config: configPromise });
  const docs = await payload.find({
    collection: 'publications',
    where: {
      slug: { equals: 'greenhouse-gases-and-climate-change-an-overview' }
    }
  });
  
  if (docs.docs.length > 0) {
    const doc = docs.docs[0];
    const root = (doc.content as any).root;
    fs.writeFileSync('db-blocks.json', JSON.stringify(root.children, null, 2));
  }
  process.exit(0);
}
run();
