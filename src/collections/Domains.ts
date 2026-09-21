import type { CollectionConfig } from 'payload'

export const Domains: CollectionConfig = {
  slug: 'domains',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
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
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional. Background image for the domain hero banner. Falls back to brand gradient if empty.',
      }
    },
    {
      name: 'heroNarrative',
      type: 'textarea',
      required: true,
    },
    {
      name: 'ctaText',
      type: 'text',
      defaultValue: 'Discuss Your Project',
    },
    {
      name: 'capabilities',
      type: 'array',
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
            description:
              'Stable, heading-derived anchor (handoff p. 227). Becomes the #anchor on the domain page - changing it breaks existing links.',
          },
        },
        {
          name: 'narrative',
          type: 'textarea',
          required: true,
        },
      ],
    },
    // CI / EI / NI / BI - "Relevant Industries" (handoff p. 28).
    // A relationship, not free text, so industry links always resolve to a real
    // page. Empty is fine: the page then shows only the "Explore All Industries"
    // link rather than placeholder cards.
    {
      name: 'relevantIndustries',
      type: 'relationship',
      relationTo: 'industries',
      hasMany: true,
      admin: {
        description:
          'Industries where this domain applies. Selected through the shared domain/industry taxonomy (handoff p. 28). Leave empty until the mapping is agreed.',
      },
    },
    // CP / EP / NP / BP - the official-updates module. The heading differs per
    // domain ("Policy and Official Updates", "Official Energy Analysis and
    // Research", etc.), so it is stored rather than hard-coded in the template.
    {
      name: 'policyUpdates',
      type: 'group',
      label: 'Policy and Official Updates',
      fields: [
        {
          name: 'heading',
          type: 'text',
          admin: {
            description:
              'Exact website heading for this domain, e.g. "Policy and Official Updates" (climate) or "Corporate Disclosures and Finance Updates" (ESG). Handoff pp. 29, 37, 48, 59.',
          },
        },
        {
          name: 'narrative',
          type: 'textarea',
        },
        {
          name: 'sourceNote',
          type: 'textarea',
          admin: {
            description:
              'Editor-facing note on which verified open-access providers feed this module. Shown to visitors as the source line.',
          },
        },
      ],
    },
    // CT / ET / NT / BT - "Relevant Enerqa Tools" (handoff pp. 29, 38, 49, 59).
    // Only add a tool here once its name, endpoint and access have been tested:
    // the spec forbids labelling a tool public or online before that.
    {
      name: 'relevantTools',
      type: 'array',
      label: 'Relevant Enerqa Tools',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
          admin: {
            description: 'Internal path, e.g. /tools/esg-readiness',
          },
        },
      ],
    },
    // SEO - mirrors the fields already on the Industries collection.
    {
      name: 'metaTitle',
      type: 'text',
      admin: {
        description:
          'Unique page title (handoff p. 227). Falls back to the domain title. " | Enerqa" is appended automatically.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: {
        description: 'Unique meta description, roughly 150-160 characters.',
      },
    },
  ],
}
