import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Payload stores rich text as a Lexical tree. Each block is plain text, a
// [bold label, rest] pair (the company profile's "Label: text" style), or a
// list whose items may carry one nested bullet list (the profile's feature lists).
type ListItem = string | { text: string; items: string[] };
type Block = string | [string, string] | { list: 'number' | 'bullet'; items: ListItem[] };
const base = { version: 1, direction: 'ltr', format: '', indent: 0 };
const textNode = (text: string, bold = false) => ({
  type: 'text', version: 1, text, format: bold ? 1 : 0, detail: 0, mode: 'normal', style: '',
});
const listNode = (listType: 'number' | 'bullet', items: ListItem[]): Record<string, unknown> => ({
  ...base,
  type: 'list',
  listType,
  tag: listType === 'number' ? 'ol' : 'ul',
  start: 1,
  children: items.flatMap((item, i) =>
    typeof item === 'string'
      ? [{ ...base, type: 'listitem', value: i + 1, children: [textNode(item)] }]
      : [
          { ...base, type: 'listitem', value: i + 1, children: [textNode(item.text)] },
          { ...base, type: 'listitem', value: i + 1, children: [listNode('bullet', item.items)] },
        ],
  ),
});
const lexical = (...blocks: Block[]) => ({
  root: {
    ...base,
    type: 'root',
    children: blocks.map((b) =>
      typeof b === 'string' || Array.isArray(b)
        ? {
            ...base,
            type: 'paragraph',
            textFormat: 0,
            children: typeof b === 'string' ? [textNode(b)] : [textNode(b[0], true), textNode(b[1])],
          }
        : listNode(b.list, b.items),
    ),
  },
});

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const policies = [
    {
      title: 'Privacy Policy',
      slug: 'privacy',
      content: lexical(
        'This Privacy Policy describes how we collect, use, and share your personal data.',
        'Information we collect',
        { list: 'bullet', items: ['Contact details (e.g., name, email address)', 'Technical data (e.g., IP address, browser type)'] },
        'How we use your information',
        { list: 'bullet', items: ['To provide and maintain our services', 'To communicate with you'] },
        'If you have any questions, please contact us.'
      )
    },
    {
      title: 'Terms and Conditions',
      slug: 'terms',
      content: lexical(
        'These Terms and Conditions govern your use of our website and services.',
        'Acceptance of Terms',
        'By accessing or using our website, you agree to be bound by these terms.',
        'Use of Data',
        'You agree to use data provided on this site in accordance with open-data principles and any applicable licenses.',
        'Limitation of Liability',
        'We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the site.'
      )
    },
    {
      title: 'Cookie Choices',
      slug: 'cookie-choices',
      content: lexical(
        'We use cookies to enhance your experience and analyze site usage.',
        'Types of Cookies We Use',
        { list: 'bullet', items: ['Essential Cookies: Required for the website to function properly.', 'Analytics Cookies: Help us understand how visitors interact with the site.'] },
        'Managing Your Preferences',
        'You can control your cookie preferences through your browser settings. However, disabling certain cookies may limit your ability to use some features of our website.'
      )
    },
    {
      title: 'Accessibility Statement',
      slug: 'accessibility',
      content: lexical(
        'We are committed to ensuring our website is accessible to everyone, regardless of ability.',
        'Our efforts include:',
        { list: 'bullet', items: ['Ensuring sufficient color contrast', 'Providing text alternatives for non-text content', 'Supporting keyboard navigation'] },
        'Feedback',
        'If you encounter any accessibility barriers on our website, please contact us so we can address the issue.'
      )
    }
  ];

  for (const p of policies) {
    const existing = await payload.find({
      collection: 'policies',
      where: { slug: { equals: p.slug } }
    });
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'policies',
        data: p as any,
      });
    }
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const slugs = ['privacy', 'terms', 'cookie-choices', 'accessibility'];
  for (const slug of slugs) {
    const existing = await payload.find({
      collection: 'policies',
      where: { slug: { equals: slug } }
    });
    if (existing.docs.length > 0) {
      await payload.delete({
        collection: 'policies',
        id: existing.docs[0].id
      });
    }
  }
}
