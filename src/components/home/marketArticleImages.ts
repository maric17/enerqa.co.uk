import config from '@/payload.config';
import { getPayload } from 'payload';
import { normaliseUrl } from '@/lib/api/news/types';
import { resolveMediaUrl } from '@/lib/utils';

type ArticleImage = { url: string; alt: string };

export async function getMarketArticleImages(urls: string[]): Promise<Map<string, ArticleImage>> {
  const images = new Map<string, ArticleImage>();
  if (!urls.length) return images;
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'market-article-images',
      // The public homepage reads images only for the selected, approved articles.
      overrideAccess: true,
      where: { articleUrl: { in: urls.map(normaliseUrl) } },
      select: { articleUrl: true, image: true },
      depth: 1,
      limit: urls.length,
    });
    for (const { articleUrl, image } of docs) {
      if (typeof image !== 'object' || !image?.mimeType?.startsWith('image/')) continue;
      const url = resolveMediaUrl(image.url);
      if (/^\/(?!\/)|^https:\/\//i.test(url)) images.set(articleUrl, { url, alt: image.alt });
    }
  } catch {
    // The commentary still works if editorial media storage is unavailable.
    console.warn('[enerqa:markets] Editorial images could not be read.');
  }
  return images;
}
