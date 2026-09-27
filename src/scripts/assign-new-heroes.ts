import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const payload = await getPayload({ config: configPromise });
  
  const images = [
    { file: 'healthcare_banner.jpg', match: 'healthcare' },
    { file: 'technology_banner.jpg', match: 'technology' },
    { file: 'tourism_banner.jpg', match: 'tourism' },
    { file: 'mining_banner.jpg', match: 'mining' },
    { file: 'agriculture_banner.jpg', match: 'agriculture' }
  ];
  
  for (const { file, match } of images) {
    const filePath = path.resolve(__dirname, '../../public/images', file);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    
    // Check if it exists in Payload
    let mediaId;
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: file } }
    });
    
    if (existing.docs.length > 0) {
      mediaId = existing.docs[0].id;
    } else {
      const size = fs.statSync(filePath).size;
      const doc = await payload.create({
        collection: 'media',
        data: { alt: `Banner for ${match}` },
        file: {
          data: fs.readFileSync(filePath),
          mimetype: 'image/jpeg',
          name: file,
          size: size
        }
      });
      mediaId = doc.id;
    }

    const industries = await payload.find({
      collection: 'industries',
      where: { slug: { contains: match } },
      limit: 1
    });

    if (industries.docs.length > 0) {
      await payload.update({
        collection: 'industries',
        id: industries.docs[0].id,
        data: { heroImage: mediaId as any }
      });
      console.log(`Updated ${industries.docs[0].title} with ${file}`);
    }
  }

  process.exit(0);
}

run();
