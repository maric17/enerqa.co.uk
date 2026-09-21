import type { CollectionConfig } from 'payload'
import { standardEditor } from '../editorConfig'

export const Tools: CollectionConfig = {
  slug: 'tools',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'category',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Interactive Tool', value: 'interactive' },
        { label: 'Informational Guide/Toolkit', value: 'informational' },
      ],
      defaultValue: 'informational',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'desc',
      type: 'textarea',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      // Optional: the tools list already renders without artwork
      // (ToolsList.tsx guards with `tool.image && ...`), and the tool
      // detail page never reads it. Requiring it blocked every seed.
      required: false,
    },
    {
      name: 'link',
      type: 'text',
      required: false,
      admin: {
        description: 'External link or native route (e.g. /tools/carbon-calculator)',
      },
    },
    {
      name: 'iframeUrl',
      type: 'text',
      required: false,
      admin: {
        condition: (data) => data.type === 'interactive',
        description: 'URL to embed if this is an external interactive tool (e.g. Tableau dashboard)',
      },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        condition: (data) => data.type === 'informational',
        description: 'PDF or document download for informational guides',
      },
    },
    {
      name: 'industries',
      label: 'Industry',
      type: 'relationship',
      relationTo: 'industries',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    { name: 'version', type: 'text' },
    {
      name: 'access',
      type: 'select',
      defaultValue: 'Request Access',
      options: [
        { label: 'Request Access', value: 'Request Access' },
        { label: 'Public', value: 'Public' },
        { label: 'Enterprise', value: 'Enterprise' },
      ],
    },
    { name: 'purpose', type: 'richText', editor: standardEditor },
    { name: 'inputs', type: 'richText', editor: standardEditor },
    { name: 'outputs', type: 'richText', editor: standardEditor },
    { name: 'method', type: 'richText', editor: standardEditor },
    { name: 'privacy', type: 'richText', editor: standardEditor },
  ],
}
