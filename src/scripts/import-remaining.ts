import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';
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

async function run() {
  const payload = await getPayload({ config: configPromise });

  const scratchPath = '/Users/maric/.gemini/antigravity-ide/brain/e6f469c5-128a-4ddd-a028-bbfcc38f1059/scratch';
  const dataPath = path.resolve(scratchPath, 'remaining2/content_with_fonts.json');
  const pagesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // Fetch categories
  const categoriesRes = await payload.find({
    collection: 'categories',
    limit: 100,
  });
  const categoryIds = categoriesRes.docs.map(c => c.id);

  const bgTypes = ['Green', 'Red', 'Blue', 'Dark'];

  // Parse articles dynamically
  const articles: any[] = [];
  let currentArticle: any = null;

  for (const pageData of pagesData) {
    for (const block of pageData.blocks) {
      if (block.type === 'text' && block.font && block.font.includes('Aptos Black')) {
        // Start of a new article or continuation of a title
        if (currentArticle && currentArticle.blocks.length === 0) {
           // still building title
           currentArticle.title += " " + block.content.trim();
        } else {
           if (currentArticle) {
               articles.push(currentArticle);
           }
           currentArticle = {
               title: block.content.trim(),
               blocks: []
           };
        }
      } else {
        if (currentArticle) {
           currentArticle.blocks.push(block);
        }
      }
    }
  }
  if (currentArticle) {
     articles.push(currentArticle);
  }

  console.log(`Found ${articles.length} articles to process.`);

  let processedCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const art = articles[i];
    const cleanTitle = art.title.replace(/^\d+\.\s*/, '').replace('?', '').replace('-', '').trim();
    console.log(`\nProcessing Article ${i + 1}: '${cleanTitle}'...`);
    
    // Check if it exists in insights
    const existingInsight = await payload.find({
      collection: 'insights',
      where: {
        title: {
          contains: cleanTitle.split(' ')[0] // Simple check for partial match if exact match fails
        }
      }
    });

    // Let's do a more robust check in TS
    const existingDocs = existingInsight.docs.filter((doc: any) => doc.title.toLowerCase().includes(cleanTitle.toLowerCase()));
    
    if (existingDocs.length > 0) {
      console.log(`Skipping '${cleanTitle}' because it exists in Insights.`);
      continue;
    }

    const children: any[] = [];
    let currentParagraphText = "";
    let currentList: any = null;

    const flushParagraph = (isHeading = false, headingText = "") => {
      let text = currentParagraphText.trim();
      currentParagraphText = "";
      
      if (text) {
        let isBullet = text.startsWith('•') || text.startsWith('-');
        let isNumberMatch = text.match(/^(\d+)[\.\-]/);
        
        if (isBullet || isNumberMatch) {
          if (!currentList || (isBullet && currentList.listType !== 'bullet') || (isNumberMatch && currentList.listType !== 'number')) {
            if (currentList) children.push(currentList);
            currentList = {
              type: 'list',
              listType: isBullet ? 'bullet' : 'number',
              tag: isBullet ? 'ul' : 'ol',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: []
            };
          }
          
          let cleanText = text.replace(/^(•|-|\d+[\.\-])\s*/, '').replace(/^:\s*/, '');
          
          currentList.children.push({
            type: 'listitem',
            value: isNumberMatch ? parseInt(isNumberMatch[1]) : 1,
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [{ mode: 'normal', text: cleanText, type: 'text', version: 1 }]
          });
        } else {
          if (currentList) {
            children.push(currentList);
            currentList = null;
          }
          
          children.push({
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [{ mode: 'normal', text: text, type: 'text', version: 1 }]
          });
        }
      }
      
      if (isHeading && headingText) {
        if (currentList) {
          children.push(currentList);
          currentList = null;
        }
        children.push({
          type: 'heading',
          tag: 'h3',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [{ mode: 'normal', text: headingText, type: 'text', version: 1 }]
        });
      }
    };

    for (const block of art.blocks) {
        if (block.type === 'newline') {
           flushParagraph();
        } else if (block.type === 'text') {
          if (block.size < 9) continue; 
          if (/^\d+$/.test(block.content)) continue;
          if (block.content === '\u3010' || block.content === '\u3011' || block.content.includes('【') || block.content.includes('】')) continue;
          if (block.content.startsWith('By:')) continue;
          if (block.content.includes('Mohamed M.') || block.content.includes('Quosay') || block.content.includes('Abdelaziz M. A.')) continue;

          if (block.font && block.font.includes('Bold')) {
            flushParagraph(true, block.content);
          } else {
            currentParagraphText += (currentParagraphText ? " " : "") + block.content;
          }
        } else if (block.type === 'image') {
          flushParagraph();
          
          const absoluteImgPath = path.resolve(scratchPath, 'remaining2', block.filename);
          if (!fs.existsSync(absoluteImgPath)) continue;
          
          const fileSize = fs.statSync(absoluteImgPath).size;
          if (fileSize === 4700) {
             console.log(`Skipping dark logo image ${block.filename}`);
             continue;
          }
          
          console.log(`Uploading image ${block.filename}...`);
          try {
            const mediaRes = await payload.create({
              collection: 'media',
              file: {
                data: fs.readFileSync(absoluteImgPath),
                mimetype: block.filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
                name: block.filename,
                size: fs.statSync(absoluteImgPath).size,
              },
              data: {
                alt: `Image for ${cleanTitle}`
              }
            });
            
            children.push({
              type: 'upload',
              relationTo: 'media',
              value: mediaRes.id as any,
              format: '',
              version: 1,
            });
          } catch (e) {
             console.error(`Failed to upload image ${block.filename}`, e);
          }
        }
    }

    flushParagraph();
    if (currentList) {
      children.push(currentList);
      currentList = null;
    }

    const content = {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: children
      }
    };
    
    const slug = slugify(cleanTitle);
    const assignedCategory = categoryIds.length > 0 ? [categoryIds[i % categoryIds.length]] : [];
    
    let excerpt = "";
    for (const child of children) {
        if (child.type === 'paragraph' && child.children[0].text) {
            excerpt += child.children[0].text + " ";
            if (excerpt.length > 200) break;
        }
    }
    excerpt = excerpt.substring(0, 200) + "...";

    try {
      await payload.create({
        collection: 'publications',
        data: {
          type: 'Article',
          title: cleanTitle,
          slug: slug,
          metaTitle: cleanTitle,
          metaDescription: excerpt,
          topic: assignedCategory as any,
          heading: cleanTitle,
          excerpt: excerpt,
          date: '2024-12-01T00:00:00.000Z',
          bgGradientType: bgTypes[i % bgTypes.length],
          content: content as any,
        },
      });
      console.log(` - Success for ${cleanTitle}`);
      processedCount++;
    } catch (e) {
      console.error(` - Error inserting ${cleanTitle}:`, e);
    }
  }

  console.log(`Finished processing. Imported ${processedCount} new articles.`);
  process.exit(0);
}

run();
