import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { standardEditor } from './editorConfig'
import path from 'path'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Publications } from './collections/Publications'
import { Tools } from './collections/Tools'
import { Team } from './collections/Team'
import { Categories } from './collections/Categories'
import { Authors } from './collections/Authors'
import { Domains } from './collections/Domains'
import { Industries } from './collections/Industries'
import { Datasets } from './collections/Datasets'
import { Dashboards } from './collections/Dashboards'
import { ExternalItems } from './collections/ExternalItems'
import { Glossary } from './collections/Glossary'
import { FAQs } from './collections/FAQs'
import { Enquiries } from './collections/Enquiries'
import { KnowledgeHubConfig } from './globals/KnowledgeHubConfig'
import { DataPortalSourcesConfig } from './globals/DataPortalSourcesConfig'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  localization: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    fallback: true,
  },
  admin: {
    user: 'users',
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
    Media,
    Publications,
    Tools,
    Team,
    Categories,
    Authors,
    Domains,
    Industries,
    Datasets,
    Dashboards,
    ExternalItems,
    Glossary,
    FAQs,
    Enquiries,
  ],
  globals: [
    KnowledgeHubConfig,
    DataPortalSourcesConfig,
  ],
  editor: standardEditor,
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-key-1234567890',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || 'postgres://127.0.0.1:5432/enerqa',
    }
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
