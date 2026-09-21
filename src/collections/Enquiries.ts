import type { CollectionConfig } from 'payload'

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: () => true, // Allow public submissions
    read: () => false, // Only admins can view enquiries
  },
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'text' },
    { name: 'natureOfEnquiry', type: 'text' },
    { name: 'message', type: 'textarea' },
    { name: 'marketingConsent', type: 'checkbox', defaultValue: false },
    { name: 'toolRequested', type: 'relationship', relationTo: 'tools' },
    { name: 'source', type: 'text', defaultValue: 'General Enquiry' },
  ],
}
