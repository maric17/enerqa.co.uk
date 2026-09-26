import { MetadataRoute } from 'next';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { publishedToolsWhere } from '@/collections/Tools';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://enerqa.co.uk';

  // Fetch all public content from CMS
  const [publications, datasets, tools, domains, industries] = await Promise.all([
    // Category separators and biographies from the archive import never
    // publish, so they must not be advertised to search engines either (p. 225).
    payload.find({ collection: 'publications', where: { recordKind: { equals: 'article' } }, limit: 1000, depth: 0 }),
    payload.find({ collection: 'datasets', limit: 1000, depth: 0 }),
    // Unvalidated tools 404 (p. 3, 166), so they must not be advertised either.
    payload.find({ collection: 'tools', where: publishedToolsWhere, limit: 1000, depth: 0 }),
    payload.find({ collection: 'domains', limit: 1000, depth: 0 }),
    payload.find({ collection: 'industries', limit: 1000, depth: 0 }),
  ]);

  // Every valid launch page (p. 227). Transactional states (newsletter
  // confirm/unsubscribe), search results and the unpublished careers template
  // are deliberately left out.
  const staticPages = [
    '',
    '/domains-and-industries',
    '/project-development',
    '/about',
    '/data-portal',
    '/data-portal/sources',
    '/tools',
    '/knowledge-hub',
    '/knowledge-hub/global-intelligence',
    '/contact',
    '/privacy',
    '/terms',
    '/accessibility',
    // Was '/cookies', which is not a route - the page lives at /cookie-choices.
    '/cookie-choices',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const pubUrls = publications.docs.map((doc) => ({
    url: `${baseUrl}/knowledge-hub/${doc.slug}`,
    lastModified: new Date(doc.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const dataUrls = datasets.docs.map((doc) => ({
    url: `${baseUrl}/data-portal/datasets/${doc.slug}`,
    lastModified: new Date(doc.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const toolUrls = tools.docs.map((doc) => ({
    url: `${baseUrl}/tools/${doc.slug}`,
    lastModified: new Date(doc.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const domainUrls = domains.docs.map((doc) => ({
    url: `${baseUrl}/domains/${doc.slug}`,
    lastModified: new Date(doc.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const industryUrls = industries.docs.map((doc) => ({
    url: `${baseUrl}/industries/${doc.slug}`,
    lastModified: new Date(doc.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...pubUrls, ...dataUrls, ...toolUrls, ...domainUrls, ...industryUrls];
}
