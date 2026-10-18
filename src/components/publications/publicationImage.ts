import { resolveMediaUrl } from '@/lib/utils';

export type PublicationImage = { src: string; alt: string };

function mediaImage(value: unknown): PublicationImage | null {
  if (!value || typeof value !== 'object') return null;
  const media = value as { url?: string | null; mimeType?: string | null; alt?: string | null };
  if (typeof media.url !== 'string' || !media.url.trim()) return null;
  // Uploads can also be PDFs. Only image files can become a cover.
  const isImage = media.mimeType
    ? media.mimeType.startsWith('image/')
    : /\.(avif|gif|jpe?g|png|svg|webp)(?:[?#]|$)/i.test(media.url);
  return isImage ? { src: resolveMediaUrl(media.url), alt: media.alt ?? '' } : null;
}

function contentImage(node: unknown): PublicationImage | null {
  if (!node || typeof node !== 'object') return null;
  const record = node as { type?: string; value?: unknown };
  if (record.type === 'upload') {
    const image = mediaImage(record.value);
    if (image) return image;
  }
  // Walk nested rich-text blocks too, so images inside a grid can be used.
  for (const child of Object.values(node)) {
    const image = contentImage(child);
    if (image) return image;
  }
  return null;
}

export function publicationImage(post: { featuredImage?: unknown; ogImage?: unknown; content?: unknown }): PublicationImage | null {
  // One image choice drives both the article banner and its listing thumbnail.
  return mediaImage(post.featuredImage) ?? mediaImage(post.ogImage) ?? contentImage(post.content);
}
