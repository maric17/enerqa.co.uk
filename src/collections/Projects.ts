import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
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
      name: 'client',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'status',
      type: 'text',
      required: true,
      defaultValue: 'Delivered',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'impact',
      type: 'array',
      fields: [
        {
          name: 'metric',
          type: 'text',
        }
      ]
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'color',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Green', value: 'green' },
        { label: 'Dark', value: 'dark' },
      ],
      defaultValue: 'default',
    }
  ],
}
