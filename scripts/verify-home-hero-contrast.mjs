// Sample the rendered photo and shade to check text contrast on every category.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE || undefined});
const report={checkedAt:new Date().toISOString(),origin:process.env.FEEDBACK_PREVIEW_URL ?? 'http://localhost:3000',checks:[],errors:[]};
const luminance=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
try {
 for(const width of [1366,390]) {
  const page=await browser.newPage({viewport:{width,height:width===390?844:768},reducedMotion:'reduce'});
  page.on('pageerror',error=>report.errors.push(error.message));
  const response=await page.goto(report.origin,{waitUntil:'networkidle'});
  const categories=page.locator('.home-hero-categories button');
  for(let index=0;index<4;index++) {
   await categories.nth(index).click();
   const measurements=await page.evaluate(()=>{
    const selectors=['.home-hero-search h1','.home-hero-eyebrow','.home-hero-story h2','.home-hero-teaser','.home-hero-source','.home-hero-attribution','.home-hero-categories button','.home-hero-view-all'];
    return selectors.flatMap(selector=>Array.from(document.querySelectorAll(selector)).flatMap(element=>{
     const style=getComputedStyle(element);
     const bounds=element.getBoundingClientRect();
     if(!bounds.width||!bounds.height)return [];
     const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);const rects=[];
     for(let node=walker.nextNode();node;node=walker.nextNode()) {
      const range=document.createRange();range.selectNodeContents(node);
      for(const rect of range.getClientRects())rects.push({x:rect.x,y:rect.y,width:rect.width,height:rect.height});
     }
     return [{selector,color:style.color,fontSize:parseFloat(style.fontSize),fontWeight:parseInt(style.fontWeight),rects}];
    }));
   });
   // Capture the actual photo and shade beneath the text, preserving all geometry.
   const screenshot=await page.screenshot({style:'.home-hero h1,.home-hero h2,.home-hero p,.home-hero p span,.home-hero p time,.home-hero p a,.home-hero-categories button,.home-hero-view-all{color:transparent!important}.home-hero svg{visibility:hidden!important}'});
   const {data,info}=await sharp(screenshot).removeAlpha().raw().toBuffer({resolveWithObject:true});
   const contrast=measurements.map(measurement=>{
    const rgb=measurement.color.match(/[\d.]+/g).slice(0,3).map(Number);const foreground=luminance(rgb);let minimum=100;
    for(const rect of measurement.rects) for(let y=Math.max(0,Math.ceil(rect.y));y<Math.min(info.height,rect.y+rect.height);y+=2) for(let x=Math.max(0,Math.ceil(rect.x));x<Math.min(info.width,rect.x+rect.width);x+=2) {
     const offset=(y*info.width+x)*info.channels;const background=luminance([data[offset],data[offset+1],data[offset+2]]);
     minimum=Math.min(minimum,(Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05));
    }
    const required=measurement.fontSize>=24||(measurement.fontSize>=18.66&&measurement.fontWeight>=700)?3:4.5;
    return {selector:measurement.selector,ratio:Number(minimum.toFixed(2)),required};
   });
   report.checks.push({width,status:response.status(),category:await categories.nth(index).textContent(),contrast});
  }
  await page.close();
 }
} finally {await browser.close();await writeFile('docs/feedback/hero-production-verification.json',JSON.stringify(report,null,2)+'\n');}
const failures=report.checks.flatMap(check=>check.contrast.filter(test=>test.ratio<test.required).map(test=>({width:check.width,category:check.category,...test})));
console.log(JSON.stringify({slides:report.checks.length,errors:report.errors,contrastFailures:failures},null,2));
if(report.errors.length||failures.length)process.exitCode=1;
