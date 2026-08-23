import { JSDOM } from 'jsdom';

async function run() {
  const response = await fetch('https://www.enerqa.co.uk/blog');
  const text = await response.text();
  const dom = new JSDOM(text);
  const document = dom.window.document;
  
  const links = Array.from(document.querySelectorAll('a')).filter(a => {
    return a.href.includes('/blog') || a.href.includes('/post');
  });
  
  const posts = new Set(links.map(a => {
    // resolve relative URLs
    try {
      return new URL(a.href, 'https://www.enerqa.co.uk/').href;
    } catch {
      return a.href;
    }
  }));
  
  console.log('Found posts:', Array.from(posts).filter(p => p !== 'https://www.enerqa.co.uk/blog'));
}

run().catch(console.error);
