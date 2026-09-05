import { getPayload } from 'payload';
import configPromise from '/Users/maric/Documents/Work/Repos/enerqa.co.uk/src/payload.config.ts';

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

async function run() {
  const payload = await getPayload({ config: configPromise });
  
  // Get all categories to randomly assign one
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
  });
  
  const categoryIds = categories.docs.map(c => c.id);
  
  const pubs = await payload.find({
    collection: 'publications',
    limit: 100,
  });
  
  for (let i = 0; i < pubs.docs.length; i++) {
    const pub = pubs.docs[i];
    const slug = slugify(pub.title);
    const metaTitle = pub.title;
    const metaDescription = pub.excerpt ? pub.excerpt.substring(0, 150) + '...' : pub.title;
    
    const assignedCategory = categoryIds.length > 0 ? [categoryIds[i % categoryIds.length]] : [];
    
    console.log(`Updating [${pub.id}] with slug: ${slug} and topic: ${assignedCategory}`);
    
    await payload.update({
      collection: 'publications',
      id: pub.id,
      data: {
        slug: slug,
        metaTitle: metaTitle,
        metaDescription: metaDescription,
        topic: assignedCategory,
      } as any,
    });
  }

  console.log('Migration complete.');
  process.exit(0);
}

run();
