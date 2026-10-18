import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const payload = await getPayload({ config: configPromise });
  
  // Maps image filename to its payload media ID
  const mediaMap = new Map<string, number | string>();
  
  // The images to upload
  const images = ['solar.jpg', 'port.jpg', 'research-banner.webp', 'hero-bg.jpg'];
  
  for (const img of images) {
    const filePath = path.resolve(__dirname, '../../public/images', img);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    
    // Check if it exists in Payload
    const existing = await payload.find({
      collection: 'media',
      where: {
        filename: { equals: img }
      }
    });
    
    if (existing.docs.length > 0) {
      mediaMap.set(img, existing.docs[0].id);
      console.log(`Found existing media for ${img}: ${existing.docs[0].id}`);
    } else {
      // Upload
      const size = fs.statSync(filePath).size;
      const doc = await payload.create({
        collection: 'media',
        data: {
          alt: `Banner for ${img}`
        },
        file: {
          data: fs.readFileSync(filePath),
          mimetype: img.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
          name: img,
          size: size
        }
      });
      mediaMap.set(img, doc.id);
      console.log(`Uploaded media for ${img}: ${doc.id}`);
    }
  }

  // Get all industries
  const industries = await payload.find({ collection: 'industries', limit: 100 });
  
  for (const ind of industries.docs) {
    // Pick an image based on industry slug
    let assignedImage = 'hero-bg.jpg'; // default
    if (ind.slug.includes('energy') || ind.slug.includes('government') || ind.slug.includes('water')) {
      assignedImage = 'solar.jpg';
    } else if (ind.slug.includes('transport') || ind.slug.includes('infrastructure') || ind.slug.includes('manufacturing')) {
      assignedImage = 'port.jpg';
    } else if (ind.slug.includes('health') || ind.slug.includes('telecom') || ind.slug.includes('finance')) {
      assignedImage = 'research-banner.webp';
    } else {
      assignedImage = 'hero-bg.jpg';
    }
    
    const mediaId = mediaMap.get(assignedImage);
    if (mediaId) {
      await payload.update({
        collection: 'industries',
        id: ind.id,
        data: {
          heroImage: mediaId as any
        }
      });
      console.log(`Updated industry ${ind.title} with image ${assignedImage}`);
    }
  }

  console.log('Done!');
  process.exit(0);
}

run();
