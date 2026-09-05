import type { CollectionConfig } from 'payload'
import { standardEditor } from '../editorConfig'

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
              admin: { description: 'URL slug for the dedicated page' },
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
              name: 'content',
              type: 'richText',
              editor: standardEditor,
              required: false,
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
              admin: { description: 'SEO Open Graph Image' },
            },
          ],
        },
      ],
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'White Paper', value: 'White Paper' },
        { label: 'Case Study', value: 'Case Study' },
        { label: 'Article', value: 'Article' },
        { label: 'Research', value: 'Research' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'topic',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: { position: 'sidebar' },
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
      admin: { position: 'sidebar' },
    },
  ],
}
