import type { CollectionConfig } from 'payload'

export const Publications: CollectionConfig = {
  slug: 'publications',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Advisory Note', value: 'Advisory Note' },
        { label: 'Case Study', value: 'Case Study' },
        { label: 'Technical Paper', value: 'Technical Paper' },
        { label: 'Strategic Report', value: 'Strategic Report' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'bgGradientType',
      type: 'select',
      required: true,
      options: [
        { label: 'Green', value: 'Green' },
        { label: 'Red', value: 'Red' },
        { label: 'Blue', value: 'Blue' },
        { label: 'Dark', value: 'Dark' },
      ],
    },
  ],
}
