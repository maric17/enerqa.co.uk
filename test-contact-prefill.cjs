const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/contact?intent=tool&tool=easysolar', { waitUntil: 'networkidle' });

  // Get the selected value of the 'enquiryType' radio button
  const selectedRadio = await page.$eval('input[name="enquiryType"]:checked', el => el.value).catch(() => null);
  console.log('Selected Enquiry Type:', selectedRadio);

  // Get the selected value of the 'tool' dropdown
  const selectedTool = await page.$eval('select[name="tool"]', el => el.value).catch(() => null);
  console.log('Selected Tool:', selectedTool);

  await browser.close();
})();
