import type { CollectionConfig } from 'payload';
import { revalidatePath } from 'next/cache';
import { normaliseUrl } from '@/lib/api/news/types';

function refreshHome() {
  try {
    revalidatePath('/');
    revalidatePath('/ar');
  } catch {
    // Content scripts can save without a running Next.js cache.
  }
}

export const MarketArticleImages: CollectionConfig = {
  slug: 'market-article-images',
  labels: { singular: 'Market Article Image', plural: 'Market Article Images' },
  // Each record changes one image. The unique URL prevents competing overrides.
  lockDocuments: false,
  admin: { useAsTitle: 'articleUrl' },
  access: { read: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [refreshHome], afterDelete: [refreshHome] },
  fields: [
    {
      name: 'articleUrl',
      type: 'text',
      required: true,
      unique: true,
      label: 'Original article link',
      admin: { description: 'Copy the link from the headline in Major Markets. The image follows that article if its position changes.' },
      validate: (value: string | null | undefined) => {
        try {
          const url = new URL(value ?? '');
          if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password) return true;
        } catch { /* Return the same message for malformed links. */ }
        return 'Enter the full article link, starting with https:// or http://.';
      },
      hooks: { beforeValidate: [({ value }) => typeof value === 'string' ? normaliseUrl(value.trim()) : value] },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { like: 'image/' } },
      admin: { description: 'Choose a photo approved for use on Enerqa. Describe the photo in the Media alt text field.' },
      validate: async (value: unknown, { req }) => {
        if (value == null) return true;
        if (typeof value !== 'number' && typeof value !== 'string') return 'Choose an image from Media.';
        const media = await req.payload.findByID({ collection: 'media', id: value, depth: 0, disableErrors: true, req });
        return media?.mimeType?.startsWith('image/') ? true : 'Choose an image file from Media.';
      },
    },
  ],
};
