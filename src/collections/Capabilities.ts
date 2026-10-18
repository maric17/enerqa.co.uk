import type { CollectionConfig } from 'payload'

export const Capabilities: CollectionConfig = {
  slug: 'capabilities',
  admin: {
    useAsTitle: 'heading',
    defaultColumns: ['heading', 'slug', 'domain'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        description: 'Stable, heading-derived anchor. Becomes the #anchor on the domain page.',
      },
    },
    {
      name: 'narrative',
      type: 'textarea',
      required: true,
    },
    {
      name: 'domain',
      type: 'relationship',
      relationTo: 'domains',
      required: true,
      admin: {
        description: 'The parent domain this capability belongs to.',
      },
    },
  ],
}
