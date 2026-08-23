import type { CollectionConfig } from 'payload'
import { standardEditor } from '../editorConfig'

export const Insights: CollectionConfig = {
  slug: 'insights',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'category', 'publishDate', '_status'],
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/insights/${doc.slug}`
      }
      return null
    },
  },
  versions: {
    drafts: true,
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
              localized: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
            },
            {
              name: 'excerpt',
              type: 'textarea',
              required: true,
              localized: true,
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              editor: standardEditor,
              localized: true,
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
              localized: true,
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              admin: { description: 'SEO Description' },
              localized: true,
            },
            {
              name: 'metaKeywords',
              type: 'text',
              admin: { description: 'SEO Keywords' },
              localized: true,
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
        { label: 'Insight', value: 'insight' },
        { label: 'News', value: 'news' },
        { label: 'Blog', value: 'blog' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishDate',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    {
      name: 'image',
      label: 'Thumbnail Image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'bannerImage',
      label: 'Banner Image',
      type: 'upload',
      relationTo: 'media',
      admin: { position: 'sidebar' },
    },
  ],
}
