import type { CollectionConfig } from 'payload'

export const Tools: CollectionConfig = {
  slug: 'tools',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'category',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Interactive Tool', value: 'interactive' },
        { label: 'Informational Guide/Toolkit', value: 'informational' },
      ],
      defaultValue: 'informational',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'desc',
      type: 'textarea',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'link',
      type: 'text',
      required: false,
      admin: {
        description: 'External link or native route (e.g. /tools/carbon-calculator)',
      },
    },
    {
      name: 'iframeUrl',
      type: 'text',
      required: false,
      admin: {
        condition: (data) => data.type === 'interactive',
        description: 'URL to embed if this is an external interactive tool (e.g. Tableau dashboard)',
      },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        condition: (data) => data.type === 'informational',
        description: 'PDF or document download for informational guides',
      },
    },
  ],
}
