import { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const GridBlock: Block = {
  slug: 'grid',
  labels: {
    singular: 'Grid (Columns)',
    plural: 'Grids',
  },
  fields: [
    {
      name: 'columns',
      type: 'select',
      defaultValue: '2',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
      admin: {
        description: 'Number of columns on desktop. Always collapses to 1 column on mobile.',
      }
    },
    {
      name: 'items',
      type: 'array',
      label: 'Items',
      labels: {
        singular: 'Column',
        plural: 'Columns',
      },
      minRows: 1,
      admin: {
        description: 'Each item becomes one cell in the grid.',
      },
      fields: [
        {
          name: 'content',
          type: 'richText',
          required: true,
          editor: lexicalEditor({}),
        }
      ]
    }
  ]
}
