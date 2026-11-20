import type { CollectionConfig } from 'payload'
import path from 'node:path'

const localMedia = process.env.MEDIA_STORAGE === 'local'
const mediaDirectory = process.env.MEDIA_STORAGE_DIR

if (localMedia && (!mediaDirectory || !path.isAbsolute(mediaDirectory))) {
  throw new Error('MEDIA_STORAGE_DIR must be an absolute path when local media storage is enabled.')
}

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    disableLocalStorage: !localMedia,
    ...(localMedia ? { staticDir: mediaDirectory } : {}),
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
