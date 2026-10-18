import type { GlobalConfig } from 'payload'
import { standardEditor } from '../editorConfig'

export const DataPortalSourcesConfig: GlobalConfig = {
  slug: 'data-portal-sources-config',
  label: 'Data Portal Sources',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 's01_intro',
      type: 'richText',
      editor: standardEditor,
      label: 'S01 - Sources and Methodology (Introduction)',
      admin: {
        description: 'Introductory text for the Data Portal Sources and Methodology page.',
      },
    },
    {
      name: 's02_directory',
      type: 'richText',
      editor: standardEditor,
      label: 'S02 - Source Directory',
      admin: {
        description: 'Directory of primary data sources.',
      },
    },
    {
      name: 's03_attribution',
      type: 'richText',
      editor: standardEditor,
      label: 'S03 - Attribution and Reuse',
      admin: {
        description: 'Policies on attribution and data reuse.',
      },
    },
    {
      name: 's04_understanding',
      type: 'richText',
      editor: standardEditor,
      label: 'S04 - Understanding the Data',
      admin: {
        description: 'Definitions, statistical limits, or context on data smoothing.',
      },
    },
  ],
}
