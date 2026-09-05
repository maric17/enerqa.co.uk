import { getPayload } from 'payload';
import configPromise from '/Users/maric/Documents/Work/Repos/enerqa.co.uk/src/payload.config.ts';
import fs from 'fs';
import path from 'path';

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           
    .replace(/[^\w\-]+/g, '')       
    .replace(/\-\-+/g, '-')         
    .replace(/^-+/, '')             
    .replace(/-+$/, '');            
}

function textToLexical(text: string) {
  const paragraphs = text.split('\n').filter(p => p.trim() !== '');
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map(p => ({
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: p,
            type: 'text',
            version: 1,
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      })),
    }
  };
}

async function run() {
  const payload = await getPayload({ config: configPromise });

  const dataPath = '/Users/maric/.gemini/antigravity-ide/brain/e6f469c5-128a-4ddd-a028-bbfcc38f1059/scratch/articles.json';
  
  if (!fs.existsSync(dataPath)) {
    console.error('Data file not found:', dataPath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(dataPath, 'utf8');
  const articles = JSON.parse(rawData);

  console.log(`Found ${articles.length} articles to import.`);

  const bgTypes = ['Green', 'Red', 'Blue', 'Dark'];

  // Fetch categories
  const categoriesRes = await payload.find({
    collection: 'categories',
    limit: 100,
  });
  const categoryIds = categoriesRes.docs.map(c => c.id);

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    
    // Clean up strings
    const title = article.title.trim().substring(0, 150); // Keep reasonable length
    const heading = title;
    let excerpt = article.excerpt.replace(/\n/g, ' ').substring(0, 300);
    if (excerpt.length >= 300) excerpt += '...';
    const bgGradientType = bgTypes[i % bgTypes.length];
    
    const content = textToLexical(article.content);
    
    const slug = slugify(title);
    const assignedCategory = categoryIds.length > 0 ? [categoryIds[i % categoryIds.length]] : [];

    try {
      console.log(`Inserting '${title}'...`);
      await payload.create({
        collection: 'publications',
        data: {
          type: 'Article',
          title: title,
          slug: slug,
          metaTitle: title,
          metaDescription: excerpt,
          topic: assignedCategory as any,
          heading: heading,
          excerpt: excerpt,
          date: '2024-12-01T00:00:00.000Z',
          bgGradientType: bgGradientType,
          content: content as any,
        },
      });
      console.log(` - Success`);
    } catch (e) {
      console.error(` - Error inserting ${title}:`, e);
    }
  }

  console.log('Done.');
  process.exit(0);
}

run();
