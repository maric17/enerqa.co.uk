import type { CollectionConfig } from 'payload'
import { domainLocaleFields } from '../lib/i18n/domainLocalePreview'

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
      ...domainLocaleFields,
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
      ...domainLocaleFields,
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
