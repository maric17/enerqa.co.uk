import type { GlobalConfig } from 'payload'

export const KnowledgeHubConfig: GlobalConfig = {
  slug: 'knowledge-hub-config',
  label: 'Knowledge Hub Config',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero Section',
          fields: [
            {
              name: 'heroTitle',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'A searchable library of our published work and resources.',
            },
            {
              name: 'heroTitleAr',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'مكتبة قابلة للبحث لأعمالنا المنشورة ومواردنا.',
            },
          ]
        },
        {
          label: 'Publications Section',
          fields: [
            {
              name: 'publicationsEyebrow',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'Publications & Reports',
            },
            {
              name: 'publicationsEyebrowAr',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'المنشورات والتقارير',
            },
          ]
        },
        {
          label: 'FAQs Section',
          fields: [
            {
              name: 'faqsEyebrow',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'Frequently Asked Questions',
            },
            {
              name: 'faqsEyebrowAr',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'أسئلة مكررة',
            },
            {
              name: 'faqsTitle',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'Got questions?',
            },
            {
              name: 'faqsTitleAr',
              type: 'text',
              localized: true,
              required: false,
            },
          ]
        }
      ]
    }
  ],
}
