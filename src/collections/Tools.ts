import type { CollectionConfig, Where } from 'payload'
import { standardEditor } from '../editorConfig'

// pp. 3, 166: tool pages other than the three flagships publish "only after
// validation". Every public query (catalogue, detail route, sitemap, search,
// home cards) must include this filter; the Local API skips `access`, so the
// read rule below only covers the REST/GraphQL API.
export const publishedToolsWhere: Where = { validated: { equals: true } }

export const Tools: CollectionConfig = {
  slug: 'tools',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'access', 'validated'],
  },
  access: {
    // Editors see every record; anonymous API readers see validated tools only.
    read: ({ req }) => (req.user ? true : publishedToolsWhere),
  },
  fields: [
    {
      name: 'validated',
      label: 'Validated for publication',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Tick only once the company has confirmed the tool name, version and release (pp. 3, 166). Unticked tools are hidden from /tools, return 404 and stay out of the sitemap.',
      },
    },
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
      // Optional: neither the tools list nor the tool detail page reads
      // it. Requiring it blocked every seed.
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
    {
      name: 'domains',
      label: 'Domains',
      type: 'relationship',
      relationTo: 'domains',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'version',
      type: 'text',
      admin: {
        description: 'Confirmed release version/date only (p. 191). Leave empty rather than guess.',
      },
    },
    {
      name: 'access',
      type: 'select',
      defaultValue: 'Request Access',
      admin: {
        description:
          'p. 166 availability labels. "Download Available" needs a cleared file and "Online Tool" a working embed or link, otherwise the site falls back to Request Access. "Public" and "Enterprise" are legacy values and are never shown as labels.',
      },
      options: [
        { label: 'Request Access', value: 'Request Access' },
        { label: 'Public', value: 'Public' },
        { label: 'Enterprise', value: 'Enterprise' },
        // p. 166 labels, appended after the legacy values so existing rows keep theirs.
        { label: 'Download Available', value: 'Download Available' },
        { label: 'Online Tool', value: 'Online Tool' },
        { label: 'Client Only', value: 'Client Only' },
        { label: 'In Development', value: 'In Development' },
      ],
    },
    { name: 'purpose', type: 'richText', editor: standardEditor },
    { name: 'inputs', type: 'richText', editor: standardEditor },
    { name: 'outputs', type: 'richText', editor: standardEditor },
    { name: 'method', type: 'richText', editor: standardEditor },
    {
      // p. 165 (T01) promises each tool explains its assumptions; p. 191 (TD03)
      // puts default assumptions and limits under "Methodology and Limits".
      name: 'assumptions',
      label: 'Assumptions and limits',
      type: 'richText',
      editor: standardEditor,
    },
    { name: 'privacy', type: 'richText', editor: standardEditor },
    { name: 'licence', type: 'text' },
    { name: 'systemRequirements', type: 'richText', editor: standardEditor },
    { name: 'userGuide', type: 'upload', relationTo: 'media' },
  ],
}
