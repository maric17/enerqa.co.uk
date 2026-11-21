import { notFound } from 'next/navigation';
import { EnglishPageContent } from '@/components/ui/EnglishPageContent';
import { arabicPilotPath } from '@/lib/i18n/pilot';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Props = { params: Promise<{ segments: string[] }>; searchParams: SearchParams };

// Reuse the public page content until a dedicated Arabic page is available.
// Keep this server-side so private routes cannot be imported by a URL segment.
const loadPages = {
  '/about/careers': () => import('../../../(frontend)/about/careers/page'),
  '/domains-and-industries': () => import('../../../(frontend)/domains-and-industries/page'),
  '/project-development': () => import('../../../(frontend)/project-development/page'),
  '/tools': () => import('../../../(frontend)/tools/page'),
  '/data-portal': () => import('../../../(frontend)/data-portal/page'),
  '/data-portal/explorer': () => import('../../../(frontend)/data-portal/explorer/page'),
  '/data-portal/sources': () => import('../../../(frontend)/data-portal/sources/page'),
  '/search': () => import('../../../(frontend)/search/page'),
};

async function fallbackContent(segments: string[], searchParams: SearchParams) {
  const path = '/' + segments.join('/');
  if (!arabicPilotPath(path)) notFound();

  if (Object.hasOwn(loadPages, path)) {
    const { default: Page } = await loadPages[path as keyof typeof loadPages]();
    return <Page searchParams={searchParams} />;
  }

  const [section, second, third] = segments;
  const slugParams = Promise.resolve({ slug: third ?? second });
  switch (section) {
    case 'domains': {
      const { default: Page } = await import('../../../(frontend)/domains/[slug]/page');
      return <Page params={slugParams} />;
    }
    case 'tools': {
      const { default: Page } = await import('../../../(frontend)/tools/[slug]/page');
      return <Page params={slugParams} />;
    }
    case 'data-portal': {
      switch (second) {
        case 'datasets': {
          const { default: Page } = await import('../../../(frontend)/data-portal/datasets/[slug]/page');
          return <Page params={slugParams} searchParams={searchParams} />;
        }
        case 'dashboards': {
          const { default: Page } = await import('../../../(frontend)/data-portal/dashboards/[slug]/page');
          return <Page params={slugParams} />;
        }
        case 'series': {
          const { default: Page } = await import('../../../(frontend)/data-portal/series/[dataset]/page');
          return <Page params={Promise.resolve({ dataset: third })} searchParams={searchParams} />;
        }
        case 'occurrences': {
          const { default: Page } = await import('../../../(frontend)/data-portal/occurrences/page');
          const country = searchParams.then(query => ({ country: typeof query.country === 'string' ? query.country : undefined }));
          return <Page searchParams={country} />;
        }
      }
      return notFound();
    }
    case 'terms':
    case 'privacy':
    case 'cookie-choices':
    case 'accessibility': {
      const { default: Page } = await import('../../../(frontend)/[policy]/page');
      return <Page params={Promise.resolve({ policy: section })} />;
    }
    default:
      return notFound();
  }
}

export default async function ArabicFallbackPage({ params, searchParams }: Props) {
  const { segments } = await params;
  return <EnglishPageContent>{await fallbackContent(segments, searchParams)}</EnglishPageContent>;
}
