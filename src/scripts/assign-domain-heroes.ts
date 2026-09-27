import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';

async function run() {
  const payload = await getPayload({ config: configPromise });
  
  const mappings = [
    { match: 'esg', file: 'research-banner.webp' },
    { match: 'environment', file: 'agriculture_banner.jpg' },
    { match: 'energy', file: 'solar.jpg' },
    { match: 'climate', file: 'hero-bg.jpg' }
  ];
  
  for (const { file, match } of mappings) {
    // Check if it exists in Payload
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: file } }
    });
    
    if (existing.docs.length === 0) {
      console.error(`Media not found for ${file}`);
      continue;
    }
    
    const mediaId = existing.docs[0].id;

    const domains = await payload.find({
      collection: 'domains',
      where: { slug: { contains: match } },
      limit: 1
    });

    if (domains.docs.length > 0) {
      await payload.update({
        collection: 'domains',
        id: domains.docs[0].id,
        data: { heroImage: mediaId as any }
      });
      console.log(`Updated Domain: ${domains.docs[0].title} with ${file}`);
    } else {
      console.log(`Domain not found for match: ${match}`);
    }
  }

  process.exit(0);
}

run();
