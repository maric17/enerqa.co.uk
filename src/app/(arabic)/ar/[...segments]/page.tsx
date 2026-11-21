import { notFound } from 'next/navigation';
import { arabicPilotPath } from '@/lib/i18n/pilot';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Props = { params: Promise<{ segments: string[] }>; searchParams: SearchParams };

// Keep the route list explicit so private pages cannot be loaded by a URL segment.
const loadPages = {
  '/about/careers': () => import('../../../(frontend)/about/careers/content').then(module => module.CareersContent),
  '/project-development': () => import('../../../(frontend)/project-development/content').then(module => module.ProjectDevelopmentContent),
  '/tools': () => import('../../../(frontend)/tools/content').then(module => module.ToolsContent),
  '/data-portal': () => import('../../../(frontend)/data-portal/page').then(module => module.default),
  '/data-portal/explorer': () => import('../../../(frontend)/data-portal/explorer/page').then(module => module.default),
  '/data-portal/sources': () => import('../../../(frontend)/data-portal/sources/content').then(module => module.DataPortalSourcesContent),
  '/newsletter/confirm': () => import('../../../(frontend)/newsletter/confirm/content').then(module => module.NewsletterConfirmContent),
  '/newsletter/unsubscribe': () => import('../../../(frontend)/newsletter/unsubscribe/content').then(module => module.NewsletterUnsubscribeContent),
  '/search': () => import('../../../(frontend)/search/content').then(module => module.SearchContent),
};

async function arabicContent(segments: string[], searchParams: SearchParams) {
  const path = '/' + segments.join('/');
  if (!arabicPilotPath(path)) notFound();

  if (Object.hasOwn(loadPages, path)) {
    const Page = await loadPages[path as keyof typeof loadPages]();
    return <Page searchParams={searchParams} language="ar" />;
  }

  const [section, second, third] = segments;
  const slugParams = Promise.resolve({ slug: third ?? second });
  switch (section) {
    case 'tools': {
      const { ToolDetailContent } = await import('../../../(frontend)/tools/[slug]/content');
      return <ToolDetailContent params={slugParams} language="ar" />;
    }
    case 'data-portal': {
      switch (second) {
        case 'datasets': {
          const { DatasetDetailContent } = await import('../../../(frontend)/data-portal/datasets/[slug]/content');
          return <DatasetDetailContent params={slugParams} searchParams={searchParams} language="ar" />;
        }
        case 'dashboards': {
          const { DashboardDetailContent } = await import('../../../(frontend)/data-portal/dashboards/[slug]/content');
          return <DashboardDetailContent params={slugParams} language="ar" />;
        }
        case 'series': {
          const { ConnectorDatasetContent } = await import('../../../(frontend)/data-portal/series/[dataset]/content');
          return <ConnectorDatasetContent params={Promise.resolve({ dataset: third })} searchParams={searchParams} language="ar" />;
        }
        case 'occurrences': {
          const { OccurrencesContent } = await import('../../../(frontend)/data-portal/occurrences/content');
          const country = searchParams.then(query => ({ country: typeof query.country === 'string' ? query.country : undefined }));
          return <OccurrencesContent searchParams={country} language="ar" />;
        }
      }
      return notFound();
    }
    case 'terms':
    case 'privacy':
    case 'cookie-choices':
    case 'accessibility': {
      const { PolicyContent } = await import('../../../(frontend)/[policy]/content');
      return <PolicyContent params={Promise.resolve({ policy: section })} language="ar" />;
    }
    default:
      return notFound();
  }
}

export default async function ArabicPublicPage({ params, searchParams }: Props) {
  const { segments } = await params;
  return arabicContent(segments, searchParams);
}

export async function generateMetadata({ params }: Props) {
  const { segments } = await params;
  if (segments[0] !== 'tools') return {};
  if (segments.length === 1) return { title: 'أدوات إنيرقا', alternates: { canonical: '/ar/tools' } };
  if (segments.length === 2) {
    const { toolMetadata } = await import('../../../(frontend)/tools/[slug]/content');
    return toolMetadata({ params: Promise.resolve({ slug: segments[1] }) }, 'ar');
  }
  return {};
}
