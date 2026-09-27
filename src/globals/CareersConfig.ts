import type { GlobalConfig } from 'payload'
import { standardEditor } from '../editorConfig'

export const CareersConfig: GlobalConfig = {
  slug: 'careers-config',
  label: 'Careers Page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'isApproved',
      type: 'checkbox',
      label: 'Approved for Publication',
      admin: {
        description: 'Check this box to publish the careers page. The page will return 404 if unchecked.',
      },
      defaultValue: false,
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Q01 - Purpose and Scope (Heading)',
      defaultValue: 'Careers',
      required: true,
    },
    {
      name: 'intro',
      type: 'textarea',
      label: 'Q01 - Purpose and Scope (Introduction)',
      required: true,
    },
    {
      name: 'sections',
      type: 'array',
      label: 'Q02 - Main Content Sections',
      admin: {
        description: 'Real current opportunities or approved recruitment information.',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      type: 'group',
      name: 'nextAction',
      label: 'Q03 - Next Action',
      admin: {
        description: 'An approved application or contact route with privacy information.',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          label: 'Link URL (e.g., mailto:careers@enerqa.co.uk)',
          required: true,
        },
        {
          name: 'privacyLine',
          type: 'text',
          label: 'Privacy Notice Line',
          required: true,
        },
      ],
    },
  ],
}
