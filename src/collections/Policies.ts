import type { CollectionConfig, Where } from 'payload';
import { revalidatePath } from 'next/cache';

// p. 208 U01: four distinct destinations with these exact titles, in footer
// order. The [policy] route accepts only these slugs, so the titles live beside
// them and the footer label, breadcrumb, H1 and <title> cannot drift apart.
// The CMS `title` field is only the editor's label.
export const POLICY_PAGES = [
  { slug: 'terms', title: 'Terms of Use' },
  { slug: 'privacy', title: 'Privacy Notice' },
  { slug: 'cookie-choices', title: 'Cookie Choices' },
  { slug: 'accessibility', title: 'Accessibility Statement' },
] as const;

// p. 208 U02 and p. 4 ("approved policy pages; no empty or fake links"): a
// policy is published only once its text is approved. Every site query (page,
// footer, sitemap) must include this filter; the Local API skips `access`, so
// the read rule below only covers the REST/GraphQL API.
export const publishedPoliciesWhere: Where = { approved: { equals: true } };

// p. 208: "Obtain appropriate approval". An approval must say who and when.
export const requiredWhenApproved = (value: unknown, { siblingData }: { siblingData: Partial<{ approved: boolean }> }) =>
  !siblingData?.approved || (value != null && value !== '') || 'Required when the text is approved.';

// Every page's footer lists the published policies, so approving, editing or
// withdrawing one refreshes the whole site on its next visit, not just this
// page. Seed scripts run outside Next, where revalidatePath throws and there
// is no cache to refresh.
const refreshSite = () => {
  try {
    revalidatePath('/', 'layout');
  } catch {
    /* not inside a Next request */
  }
};

export const Policies: CollectionConfig = {
  slug: 'policies',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'approved', 'approvedOn'],
  },
  access: {
    // Editors see drafts; anonymous API readers see approved policies only.
    read: ({ req }) => (req.user ? true : publishedPoliciesWhere),
  },
  hooks: {
    afterChange: [refreshSite],
    afterDelete: [refreshSite],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Policy Title',
      admin: {
        description: 'Editor label only. The page heading is fixed by the slug (p. 208): Privacy Notice, Terms of Use, Cookie Choices or Accessibility Statement.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (value) {
              return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            }
            if (data?.title) {
              return data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            }
            return value;
          }
        ],
      },
      // Any other slug would save but never appear: the route serves these four only.
      validate: (value: unknown) =>
        POLICY_PAGES.some((p) => p.slug === value) || `Use one of: ${POLICY_PAGES.map((p) => p.slug).join(', ')}.`,
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: false,
      label: 'Approved for publication',
      admin: {
        position: 'sidebar',
        description: 'Tick only when the company has approved this exact text (p. 208). Until then the page returns 404 and the footer does not link to it.',
      },
    },
    {
      name: 'approvedBy',
      type: 'text',
      label: 'Approved by',
      admin: {
        position: 'sidebar',
        description: 'Name and role of the person who approved the text.',
      },
      validate: requiredWhenApproved,
    },
    {
      name: 'approvedOn',
      type: 'date',
      label: 'Approval date',
      admin: {
        position: 'sidebar',
        description: 'Shown on the page as "Last updated".',
        date: { pickerAppearance: 'dayOnly' },
      },
      validate: requiredWhenApproved,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Policy Content',
    },
  ],
};
