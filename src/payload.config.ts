import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { standardEditor } from './editorConfig'
import path from 'path'
import { fileURLToPath } from 'url'

import { Capabilities } from './collections/Capabilities'
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
import { Policies } from './collections/Policies'
import { KnowledgeHubConfig } from './globals/KnowledgeHubConfig'
import { DataPortalSourcesConfig } from './globals/DataPortalSourcesConfig'
import { CareersConfig } from './globals/CareersConfig'
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
    Capabilities,
    Datasets,
    Dashboards,
    ExternalItems,
    Glossary,
    FAQs,
    Enquiries,
    Policies,
  ],
  globals: [
    KnowledgeHubConfig,
    DataPortalSourcesConfig,
    CareersConfig,
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
  secret: process.env.PAYLOAD_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('PAYLOAD_SECRET is not set. Refusing to run in production with the public development fallback, which would let anyone forge admin sessions.') })() : 'fallback-secret-key-1234567890'), // The fallback is public (it is in the repo), so it is for local development only.
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || 'postgres://127.0.0.1:5432/enerqa',
    },
    // Live data is shared across environments. Verification can disable schema writes.
    push: process.env.PAYLOAD_SCHEMA_PUSH !== 'false',
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
