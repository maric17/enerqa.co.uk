import type { CollectionConfig } from 'payload'
import { standardEditor } from '../editorConfig'

export const Datasets: CollectionConfig = {
  slug: 'datasets',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true;
      return { status: { equals: 'verified_open' } };
    },
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
        description: 'Brief insights or summary for this dataset.',
      },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'apiEndpoint',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional path for API access (e.g. /api/climate/emissions)',
      },
    },
    {
      name: 'topic',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: false,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'provider',
      type: 'text',
      admin: {
        description: 'Organization or entity that produced the dataset.',
      },
    },
    {
      name: 'identifier',
      type: 'text',
      admin: {
        description: 'Series or dataset identifier.',
      },
    },
    {
      name: 'version',
      type: 'text',
      admin: {
        description: 'Version or release.',
      },
    },
    {
      name: 'licence',
      type: 'text',
    },
    {
      name: 'licenceUrl',
      type: 'text',
    },
    {
      name: 'originalUnit',
      type: 'text',
    },
    {
      name: 'geographicLevel',
      type: 'text',
      admin: {
        description: 'Geographic scope or level (e.g. Global, Europe, United States).',
      },
    },
    {
      name: 'observationPeriod',
      type: 'text',
      admin: {
        description: 'Time period covered by the dataset (e.g. 2010 - 2026).',
      },
    },
    {
      name: 'retrievalTime',
      type: 'date',
    },
    {
      name: 'datasetDownloadUrl',
      type: 'text',
      admin: {
        description: 'Ungated free anonymous download link.',
      },
    },
    {
      name: 'accessStatus',
      type: 'select',
      options: [
        { label: 'Verified Open', value: 'verified_open' },
        { label: 'Unknown', value: 'unknown' },
        { label: 'Gated', value: 'gated' },
        { label: 'Broken', value: 'broken' },
        { label: 'Embargoed', value: 'embargoed' },
        // Legacy values still held by the 3 existing rows. Kept so the dev
        // schema push doesn't drop them from the enum (data-loss prompt).
        // Neither counts as publishable; re-check those rows, then remove.
        { label: 'Free (legacy, unverified)', value: 'free' },
        { label: 'Restricted (legacy)', value: 'restricted' },
      ],
    },
    {
      name: 'accessCheckedAt',
      type: 'date',
    },
    {
      name: 'accessEvidence',
      type: 'text',
    },
    {
      name: 'corporateReuse',
      type: 'checkbox',
    },
    {
      name: 'redistribution',
      type: 'checkbox',
    },
    {
      name: 'attribution',
      type: 'textarea',
    },
    {
      name: 'sourceReleaseDate',
      type: 'date',
      admin: {
        description: 'When the provider released this version of the data.',
      },
    },
    {
      name: 'frequency',
      type: 'text',
      admin: {
        description: 'Update frequency (e.g. Annual, Monthly).',
      },
    },
    {
      name: 'format',
      type: 'text',
      admin: {
        description: 'Data format (e.g. CSV, JSON, NetCDF).',
      },
    },
    {
      name: 'modificationPermission',
      type: 'checkbox',
      admin: {
        description: 'Whether the licence allows derivative works or modifications.',
      },
    },
    {
      name: 'embedUrl',
      type: 'text',
      admin: {
        description: 'Iframe URL for interactive charts/maps (Tableau, PowerBI, Observable).',
      },
    },
    {
      name: 'citation',
      type: 'textarea',
      admin: {
        description: 'Ready-to-copy citation format.',
      },
    },
    {
      name: 'methodology',
      type: 'richText',
      editor: standardEditor,
      admin: {
        description: 'Detailed sources and methodology.',
      },
    },
    {
      name: 'relatedDatasets',
      type: 'relationship',
      relationTo: 'datasets',
      hasMany: true,
    },
    {
      name: 'domains',
      type: 'relationship',
      relationTo: 'domains',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'industries',
      type: 'relationship',
      relationTo: 'industries',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Verified Open', value: 'verified_open' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
