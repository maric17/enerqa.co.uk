import type { CollectionConfig } from 'payload'

export const Glossary: CollectionConfig = {
  slug: 'glossary',
  admin: {
    useAsTitle: 'term',
    defaultColumns: ['term', 'category'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'term',
      type: 'text',
      required: true,
    },
    {
      name: 'termAr',
      type: 'text',
      required: false,
      admin: {
        description: 'Arabic translation or transliteration of the term.',
      }
    },
    {
      name: 'definition',
      type: 'textarea',
      required: true,
    },
    {
      name: 'category',
      type: 'text',
      required: false,
      admin: {
        description: 'e.g., Science, Policy, Finance',
      }
    },
  ],
}
