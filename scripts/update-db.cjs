const { Client } = require('pg');

const base = { version: 1, direction: 'ltr', format: '', indent: 0 };
const textNode = (text, bold = false) => ({
  type: 'text', version: 1, text, format: bold ? 1 : 0, detail: 0, mode: 'normal', style: '',
});
const linkNode = (text, url) => ({
  type: 'link', version: 1, format: '', indent: 0, direction: 'ltr', fields: { url, newTab: false, linkType: 'custom' }, children: [textNode(text)]
});

const p_privacy = {
  root: {
    ...base, type: 'root', children: [
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('This Privacy Notice describes how Enerqa collects, uses, and shares your personal data.')] },
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('Information we collect includes contact details submitted via forms or newsletter signups. Our hosting providers and analytics partners may also collect technical data. We use this information to respond to your queries and provide our services.')] },
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('We do not sell your data. We use vetted third-party processors to help deliver our services securely. Our AI search uses the OpenAI API, which is governed by our enterprise agreement to ensure your data is protected and not used to train public models.')] },
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('If you have any questions, please '), linkNode('contact us', '/contact'), textNode('.')] }
    ]
  }
};

const p_terms = {
  root: {
    ...base, type: 'root', children: [
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('These Terms of Use govern your access to the Enerqa website and Data Portal.')] },
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('By using our site, you agree to these terms. Data available in the Data Portal is sourced from public APIs and is subject to open-data principles and the specific licenses identified for each dataset (e.g., CC BY 4.0, CC0).')] },
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('You may freely use, adapt, and share the information provided here in accordance with the cited licenses, provided you maintain proper attribution to the original sources.')] },
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('For any inquiries, please '), linkNode('contact us', '/contact'), textNode('.')] }
    ]
  }
};

const p_cookie = {
  root: {
    ...base, type: 'root', children: [
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('Enerqa uses only essential cookies necessary for the secure and reliable operation of this website.')] },
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('We do not use tracking or analytics cookies, nor do we use cookies for marketing or targeted advertising purposes. As our cookies are strictly necessary, no consent controls are required.')] },
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('If you have any questions, please '), linkNode('contact us', '/contact'), textNode('.')] }
    ]
  }
};

const p_access = {
  root: {
    ...base, type: 'root', children: [
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('Enerqa is committed to ensuring digital accessibility for all users.')] },
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('We have conducted manual testing to ensure our site meets accessibility standards, including keyboard navigation support, semantic headings, and sufficient contrast. During our testing, we identified color contrast issues with some text elements (e.g., text-gray-400), which we have actively resolved to ensure readability across all devices and display settings.')] },
      { ...base, type: 'paragraph', textFormat: 0, children: [textNode('If you encounter any barriers, please '), linkNode('contact us', '/contact'), textNode(' so we can improve your experience.')] }
    ]
  }
};

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URI });
  await client.connect();

  await client.query("UPDATE policies SET title = $1, content = $2 WHERE slug = 'privacy'", ['Privacy Notice', JSON.stringify(p_privacy)]);
  await client.query("UPDATE policies SET title = $1, content = $2 WHERE slug = 'terms'", ['Terms of Use', JSON.stringify(p_terms)]);
  await client.query("UPDATE policies SET title = $1, content = $2 WHERE slug = 'cookie-choices'", ['Cookie Choices', JSON.stringify(p_cookie)]);
  await client.query("UPDATE policies SET title = $1, content = $2 WHERE slug = 'accessibility'", ['Accessibility Statement', JSON.stringify(p_access)]);

  console.log("Policies updated.");
  await client.end();
}

main().catch(console.error);
