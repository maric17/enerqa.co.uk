import type { CollectionConfig } from 'payload'

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    create: () => true, // Allow public submissions
    read: () => false, // Only admins can view enquiries
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'text', required: true },
    { name: 'message', type: 'textarea' },
    { name: 'toolRequested', type: 'relationship', relationTo: 'tools' },
    { name: 'source', type: 'text', defaultValue: 'Tool Request' },
  ],
}
