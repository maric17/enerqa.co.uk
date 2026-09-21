import type { CollectionConfig } from 'payload'

export const ExternalItems: CollectionConfig = {
  slug: 'external-items',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Headline or title of the external item',
      },
    },
    {
      name: 'provider',
      type: 'text',
      required: true,
    },
    {
      name: 'source',
      type: 'text',
      required: false,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'type',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g., Report, News, Press Release',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Full-reading URL',
    },
    {
      name: 'geography',
      type: 'text',
      admin: {
        description: 'Covered geography (distinct from publisher location)',
      },
    },
    {
      name: 'accessEvidence',
      type: 'textarea',
      admin: {
        description: 'Proof of open access or licensing rights',
      },
    },
    {
      name: 'rights',
      type: 'text',
      admin: {
        description: 'Copyright/distribution rights',
      },
    },
    {
      name: 'domains',
      type: 'relationship',
      relationTo: 'domains',
      hasMany: true,
      required: false,
    },
    {
      name: 'industries',
      type: 'relationship',
      relationTo: 'industries',
      hasMany: true,
      required: false,
    },
  ],
}
