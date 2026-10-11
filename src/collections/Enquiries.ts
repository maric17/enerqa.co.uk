import type { CollectionConfig } from 'payload'

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // p. 228: every public submission must pass server-side validation, the
    // honeypot and the rate limit. The site's server actions write through the
    // Local API, which skips access rules by default (`overrideAccess: true`),
    // so they are unaffected. Restricting create to logged-in staff closes the
    // REST/GraphQL route (`POST /api/enquiries`) that used to skip all of that.
    create: ({ req }) => Boolean(req.user),
    // Only logged-in staff can view enquiries. `() => false` blocked everyone,
    // admins included, so submissions were saved but unreadable in the CMS.
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
      admin: {
        description:
          'The contact form asks for one Name; it is stored split at the first space (first name + last name = the name as typed). "—" means a single name was given.',
      },
    },
    { name: 'lastName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'text' },
    { name: 'natureOfEnquiry', type: 'text' },
    { name: 'message', type: 'textarea' },
    { name: 'marketingConsent', type: 'checkbox', defaultValue: false },
    { name: 'toolRequested', type: 'relationship', relationTo: 'tools' },
    // p. 198 F02: Domain, Industry, Project Location and Current Stage are
    // optional fields on the contact form.
    { name: 'domain', type: 'relationship', relationTo: 'domains' },
    { name: 'industry', type: 'relationship', relationTo: 'industries' },
    { name: 'projectLocation', type: 'text' },
    { name: 'currentStage', type: 'text' },
    { name: 'source', type: 'text', defaultValue: 'General Enquiry' },
    // Q2: an admin edit is not automatically substantive contact.
    { name: 'lastSubstantiveContactAt', type: 'date', admin: { description: 'Record the actual last substantive contact. Enquiries expire two years after this date, or after submission if empty.' } },
    { name: 'retentionHoldReason', type: 'textarea', admin: { description: 'Document a legally necessary exception or transfer to client records. A hold must also have a review/expiry date.' } },
    { name: 'retentionHoldUntil', type: 'date', validate: (value, { siblingData }) => !(siblingData as { retentionHoldReason?: string })?.retentionHoldReason || Boolean(value) || 'A documented hold needs an expiry date.' },
    { name: 'notificationSentAt', type: 'date', admin: { readOnly: true } },
    { name: 'newsletterSyncedAt', type: 'date', admin: { readOnly: true } },
  ],
}
