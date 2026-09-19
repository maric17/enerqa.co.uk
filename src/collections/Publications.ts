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
        { label: 'Article', value: 'Article' },
        { label: 'Research', value: 'Research' },
        { label: 'Conference Paper', value: 'Conference Paper' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Case Study was removed: handoff p. 229 requires that no Case Study surface appears anywhere.',
      },
    },
    // K04 (p. 155): every publication card shows an author byline. Authors are
    // byline metadata and search filters only - p. 225 rules out a public
    // Authors section.
    {
      name: 'author',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Approved byline, exactly as it should be published.',
      },
    },
    {
      name: 'language',
      type: 'select',
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Arabic', value: 'ar' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Drives the K03 Language filter. Do not label a publication Arabic until a real translation exists (p. 227).',
      },
    },
    // p. 155: keep the 2024 archive as a Year filter, not a third collection,
    // and preserve its four categories as optional secondary tags.
    {
      name: 'archiveCategory',
      type: 'select',
      options: [
        { label: 'Climate Science and Impacts', value: 'climate-science-and-impacts' },
        { label: 'Energy, Technology and Finance', value: 'energy-technology-and-finance' },
        { label: 'Environment and Society', value: 'environment-and-society' },
        { label: 'Frameworks and Methodologies', value: 'frameworks-and-methodologies' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Optional secondary tag carried over from the 2024 archive.',
      },
    },
    // p. 225 / K04: "category separators and biography pages are not articles".
    // They stay as records so nothing is lost, but only `article` is published.
    {
      name: 'recordKind',
      type: 'select',
      required: true,
      defaultValue: 'article',
      options: [
        { label: 'Article (publish)', value: 'article' },
        { label: 'Category heading (do not publish)', value: 'category-heading' },
        { label: 'Biography page (do not publish)', value: 'biography' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Only Article records appear in the public Enerqa Publication collection.',
      },
    },
    // p. 225: "recover true dates". The 2024 import gave every record the same
    // date, so this flag makes an unverified date visible to editors instead of
    // letting a placeholder pass as fact.
    {
      name: 'dateVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Tick once this publication\'s real publication date has been confirmed against the original source.',
      },
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
