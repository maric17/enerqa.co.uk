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
          label: 'Learning Materials Section',
          fields: [
            {
              name: 'learningMaterialsEyebrow',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'Learning Materials',
            },
            {
              name: 'learningMaterialsEyebrowAr',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'مواد تعليمية',
            },
          ]
        },
        {
          label: 'Glossary Section',
          fields: [
            {
              name: 'glossaryEyebrow',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'Glossary of Terms',
            },
            {
              name: 'glossaryEyebrowAr',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'مسرد المصطلحات',
            },
            {
              name: 'glossaryTitle',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'Climate & Sustainability Dictionary',
            },
            {
              name: 'glossaryTitleAr',
              type: 'text',
              localized: true,
              required: false,
            },
            {
              name: 'glossaryDescription',
              type: 'textarea',
              localized: true,
              required: true,
              defaultValue: 'Explore definitions for technical jargon, acronyms, and key concepts used throughout the portal.',
            },
            {
              name: 'glossaryDescriptionAr',
              type: 'textarea',
              localized: true,
              required: false,
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
