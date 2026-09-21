import type { CollectionConfig } from 'payload'

export const Industries: CollectionConfig = {
  slug: 'industries',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional. Background image for the industry hero banner. Falls back to brand gradient if empty.',
              }
            },
            {
              name: 'heroNarrative',
              type: 'textarea',
              required: true,
            },
            {
              name: 'ctaText',
              type: 'text',
              admin: {
                description: 'Text for the call to action button (e.g. Discuss Your Project)',
              }
            },
            {
              name: 'lifecycleNarrative',
              type: 'textarea',
              admin: {
                description: 'Short industry-specific lifecycle narrative (module I01L).',
              }
            },
            {
              name: 'workAreas',
              type: 'array',
              admin: {
                description: 'Relevant Domains and Work Areas (3-4 contextual links to domain capability anchors)',
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                }
              ]
            },
            // I{nn}T - Relevant Enerqa Tools (handoff pp. 66, 72, 78, ...).
            // Only publish a tool once its name, endpoint and access are tested;
            // the seed script drops any link whose /tools/{slug} page would 404.
            {
              name: 'relevantTools',
              type: 'array',
              label: 'Relevant Enerqa Tools',
              admin: {
                description:
                  'Tools mapped to this industry in the handoff. Use approved availability labels - do not assume a tool is publicly launched.',
              },
              fields: [
                { name: 'label', type: 'text', required: true },
                {
                  name: 'href',
                  type: 'text',
                  required: true,
                  admin: { description: 'Internal path, e.g. /tools/esg-readiness' },
                },
              ],
            },
            // I{nn}D - recommended numerical sources for this industry's data
            // preview (handoff pp. 66, 72, 78, ...). Captured here so the Data
            // Portal work can wire real previews to the right provider later.
            {
              name: 'dataSources',
              type: 'array',
              label: 'Recommended Data Sources',
              admin: {
                description:
                  'Provider IDs recommended for this industry, with the handoff note on what each covers and its limits.',
              },
              fields: [
                { name: 'provider', type: 'text', required: true },
                { name: 'note', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              admin: { description: 'SEO Title' },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              admin: { description: 'SEO Description' },
            },
            {
              name: 'metaKeywords',
              type: 'text',
              admin: { description: 'SEO Keywords' },
            },
            {
              name: 'ogImage',
              label: 'Open Graph Image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
  ],
}
