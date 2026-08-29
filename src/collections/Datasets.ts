import type { CollectionConfig } from 'payload'

export const Datasets: CollectionConfig = {
  slug: 'datasets',
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
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Brief insights or summary for this dataset.',
      },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'apiEndpoint',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional path for API access (e.g. /api/climate/emissions)',
      },
    },
    {
      name: 'topic',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: false,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
  ],
}
