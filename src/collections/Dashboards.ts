import type { CollectionConfig } from 'payload'
import { standardEditor } from '../editorConfig'

export const Dashboards: CollectionConfig = {
  slug: 'dashboards',
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
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'High level overview of the dashboard.',
      },
    },
    {
      name: 'datasetConnector',
      type: 'select',
      options: [
        { label: 'World Bank API', value: 'wb-api' },
        { label: 'Climate TRACE API', value: 'climate-trace' },
      ],
      admin: {
        description: 'Native connector to use instead of third-party iframes (replaces Tableau/PowerBI embeds).',
      },
    },
    {
      name: 'controlsInfo',
      type: 'richText',
      editor: standardEditor,
      admin: {
        description: 'Instructions on how to use the dashboard controls/filters.',
      },
    },
    {
      name: 'interpretation',
      type: 'richText',
      editor: standardEditor,
      admin: {
        description: 'Key takeaways and interpretation of the data.',
      },
    },
    {
      name: 'underlyingDatasets',
      type: 'relationship',
      relationTo: 'datasets',
      hasMany: true,
      admin: {
        description: 'Internal datasets that power this dashboard.',
      },
    },
    {
      name: 'externalSources',
      type: 'richText',
      editor: standardEditor,
      admin: {
        description: 'Attributions for external data sources not tracked in Datasets.',
      },
    },
  ],
}
