const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/');
  
  const metrics = await page.evaluate(() => {
    const section = document.getElementById('about-enerqa');
    const container = section.querySelector('.grid');
    const textCol = container.children[0];
    const imgCol = container.children[1];
    const imgWrapper = imgCol.children[0];
    
    return {
      section: section.getBoundingClientRect(),
      container: container.getBoundingClientRect(),
      textCol: textCol.getBoundingClientRect(),
      imgCol: imgCol.getBoundingClientRect(),
      imgWrapper: imgWrapper.getBoundingClientRect(),
      imgWrapperPosition: window.getComputedStyle(imgWrapper).position,
      imgWrapperWidth: window.getComputedStyle(imgWrapper).width,
      imgWrapperHeight: window.getComputedStyle(imgWrapper).height,
    };
  });
  
  console.log(JSON.stringify(metrics, null, 2));
  await browser.close();
})();
