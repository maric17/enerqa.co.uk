import type { CollectionConfig } from 'payload'

export const LearningMaterials: CollectionConfig = {
  slug: 'learning-materials',
  admin: {
    useAsTitle: 'title',
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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'PDF Guide', value: 'PDF' },
        { label: 'Video Lecture', value: 'Video' },
        { label: 'Online Course', value: 'Course' },
        { label: 'Toolkit', value: 'Toolkit' },
        { label: 'Presentation', value: 'Presentation' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'source',
      type: 'text',
      required: false,
      admin: {
        description: 'Author or Organization (e.g., "UN CC:Learn", "Qatar University")',
      }
    },
    {
      name: 'level',
      type: 'select',
      required: false,
      options: [
        { label: 'Beginner', value: 'Beginner' },
        { label: 'Intermediate', value: 'Intermediate' },
        { label: 'Advanced', value: 'Advanced' },
      ],
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        condition: (data) => data.type === 'PDF' || data.type === 'Presentation' || data.type === 'Toolkit',
      }
    },
    {
      name: 'url',
      type: 'text',
      required: false,
      admin: {
        description: 'External link or video embed URL.',
      }
    },
    {
      name: 'topic',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: false,
    },
  ],
}
