import { MetadataRoute } from 'next';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://enerqa.co.uk';

  // Fetch all public content from CMS
  const [publications, datasets, tools, domains, industries] = await Promise.all([
    payload.find({ collection: 'publications', limit: 1000, depth: 0 }),
    payload.find({ collection: 'datasets', limit: 1000, depth: 0 }),
    payload.find({ collection: 'tools', limit: 1000, depth: 0 }),
    payload.find({ collection: 'domains', limit: 1000, depth: 0 }),
    payload.find({ collection: 'industries', limit: 1000, depth: 0 }),
  ]);

  // Map to sitemap entries
  const staticPages = [
    '',
    '/about',
    '/data-portal',
    '/tools',
    '/knowledge-hub',
    '/contact',
    '/privacy',
    '/terms',
    '/accessibility',
    '/cookies',
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
