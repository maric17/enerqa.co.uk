import type { CollectionConfig } from 'payload'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
    },
    {
      name: 'category',
      type: 'text',
      required: true,
      defaultValue: 'General Climate Questions',
    },
    {
      name: 'order',
      type: 'number',
      required: false,
      admin: {
        description: 'Optional sort order.',
      }
    }
  ],
}
