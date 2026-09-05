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
  const dataPath = path.resolve(scratchPath, 'batch2/content_with_fonts.json');
  const pagesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  // Articles definition (based on pages from PDF extraction)
  // Note: PyMuPDF page numbers are 1-indexed. The pages are 8-9, 10-11, 12-14
  const articlesDef = [
    { title: "Climate Change and War: A Complex Interplay", startPage: 13, endPage: 15 },
    { title: "Greenhouse Gases and Climate Change: An Overview", startPage: 16, endPage: 19 },
    { title: "Breathing vs. Burning: The Carbon Footprint Contrast", startPage: 20, endPage: 21 }
  ];

  // Fetch categories
  const categoriesRes = await payload.find({
    collection: 'categories',
    limit: 100,
  });
  const categoryIds = categoriesRes.docs.map(c => c.id);

  const bgTypes = ['Green', 'Red', 'Blue', 'Dark'];

  for (let i = 0; i < articlesDef.length; i++) {
    const def = articlesDef[i];
    console.log(`Processing '${def.title}'...`);
    
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
          
          let cleanText = text.replace(/^(•|-|\d+[\.\-])\s*/, '').replace(/^:\s*/, ''); // Some bullets are "• :"
          
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
    
    // Process pages for this article
    for (let pageNum = def.startPage; pageNum <= def.endPage; pageNum++) {
      const pageData = pagesData.find((p: any) => p.page === pageNum);
      if (!pageData) continue;
      
      for (const block of pageData.blocks) {
        if (block.type === 'newline') {
           flushParagraph();
        } else if (block.type === 'text') {
          // Ignore the footer/header titles (small italics at the top)
          if (block.size < 9) continue; 
          // Ignore page numbers (exact matches to single numbers)
          if (/^\d+$/.test(block.content)) continue;
          // Ignore reference brackets
          if (block.content === '\u3010' || block.content === '\u3011' || block.content.includes('【') || block.content.includes('】')) continue;
          
          // Ignore the big duplicate title (Aptos Black)
          if (block.font && block.font.includes('Aptos Black')) continue;
          // Ignore "By: Author name"
          if (block.content.startsWith('By:')) continue;
          if (block.content.includes('Mohamed M.') || block.content.includes('Quosay')) continue;

          // If it's bold, treat as a heading (h2/h3)
          if (block.font && block.font.includes('Bold')) {
            flushParagraph(true, block.content);
          } else {
            // Append to current paragraph
            currentParagraphText += (currentParagraphText ? " " : "") + block.content;
          }
        } else if (block.type === 'image') {
          flushParagraph();
          
          const absoluteImgPath = path.resolve(scratchPath, 'batch2', block.filename);
          const fileSize = fs.statSync(absoluteImgPath).size;
          
          if (fileSize === 4700) {
             console.log(`Skipping dark logo image ${block.filename}`);
             continue;
          }
          
          // Upload image to Payload
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
                alt: `Image for ${def.title}`
              }
            });
            
            // Push image block
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
    }
    
    // Final flush
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
    
    const slug = slugify(def.title);
    const assignedCategory = categoryIds.length > 0 ? [categoryIds[i % categoryIds.length]] : [];
    
    // Find excerpt from the first text paragraph
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
          title: def.title,
          slug: slug,
          metaTitle: def.title,
          metaDescription: excerpt,
          topic: assignedCategory as any,
          heading: def.title,
          excerpt: excerpt,
          date: '2024-12-01T00:00:00.000Z',
          bgGradientType: bgTypes[i % bgTypes.length],
          content: content as any,
        },
      });
      console.log(` - Success for ${def.title}`);
    } catch (e) {
      console.error(` - Error inserting ${def.title}:`, e);
    }
  }

  console.log('Batch 2 done.');
  process.exit(0);
}

run();
