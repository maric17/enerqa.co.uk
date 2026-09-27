'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOMAINS, INDUSTRIES } from './Header';

export interface Crumb {
  label: string;
  /** Absent on the current page, which is not a link. */
  href?: string;
}

// Real page titles for fixed routes. The old version title-cased URL segments
// ("Esia Risk", "Energy Systems Transition") and linked every segment, so
// /domains, /industries, /data-portal/datasets, /data-portal/dashboards and
// /newsletter - none of which exist - were linked from every page (p. 4).
const PAGE_TITLES: Record<string, string> = {
  '/domains-and-industries': 'Domains and Industries',
  '/project-development': 'Project Development and Lifecycle Support',
  '/knowledge-hub': 'Knowledge Hub',
  '/knowledge-hub/global-intelligence': 'Global Intelligence',
  '/data-portal': 'Data Portal',
  '/data-portal/sources': 'Sources and Methodology',
  '/tools': 'Tools',
  '/about': 'About',
  '/about/careers': 'Careers',
  '/contact': 'Contact',
  '/search': 'Search',
  '/privacy': 'Privacy Notice',
  '/terms': 'Terms of Use',
  '/cookie-choices': 'Cookie Choices',
  '/accessibility': 'Accessibility Statement',
  '/newsletter/confirm': 'Subscription Confirmed',
  '/newsletter/unsubscribe': 'Unsubscribe from the Newsletter',
};

// Parent page for fixed routes that sit below a section (sitemap, p. 3).
const PARENTS: Record<string, string> = {
  '/project-development': '/domains-and-industries',
  '/knowledge-hub/global-intelligence': '/knowledge-hub',
  '/data-portal/sources': '/data-portal',
  '/about/careers': '/about',
};

const crumbFor = (href: string): Crumb => ({ label: PAGE_TITLES[href], href });

/**
 * The trail for a URL: Home, the parent section, then the current page.
 * Returns null on the homepage and on URLs that are not a known route (a 404),
 * so a mistyped address never gets a made-up trail.
 */
export function breadcrumbTrail(pathname: string | null): Crumb[] | null {
  const path = (pathname ?? '/').replace(/\/+$/, '') || '/';
  if (path === '/') return null;
  const home: Crumb = { label: 'Home', href: '/' };

  if (PAGE_TITLES[path]) {
    const parent = PARENTS[path];
    return [home, ...(parent ? [crumbFor(parent)] : []), { label: PAGE_TITLES[path] }];
  }

  const [section, sub, slug, ...rest] = path.slice(1).split('/');

  // p. 3: domain and industry pages sit under Domains and Industries. Their
  // names come from the shared menu lists, so "&" survives.
  if ((section === 'domains' || section === 'industries') && sub && !slug) {
    const list = section === 'domains' ? DOMAINS : INDUSTRIES;
    const match = list.find((item) => item.slug === sub);
    return [home, crumbFor('/domains-and-industries'), ...(match ? [{ label: match.title }] : [])];
  }

  // Detail templates whose record title the site-wide footer cannot know:
  // show the section and parent page (p. 8) without inventing a page name.
  if (rest.length === 0) {
    if (section === 'knowledge-hub' && sub && !slug) return [home, crumbFor('/knowledge-hub')];
    if (section === 'tools' && sub && !slug) return [home, crumbFor('/tools')];
    if (section === 'data-portal' && (sub === 'datasets' || sub === 'dashboards') && slug) {
      return [home, crumbFor('/data-portal')];
    }
  }

  return null;
}

// Templates that render their own breadcrumb at the top of the page, with the
// record's real title (tools/page.tsx, tools/[slug], domains/[slug],
// industries/[slug], about/careers, knowledge-hub/page.tsx K01, [policy]).
// Repeating it here gave those pages two "Breadcrumb" landmarks. Add a route
// when another template gains one.
const OWN_TRAIL_ROUTES = [
  /^\/tools$/,
  /^\/about\/careers$/,
  /^\/knowledge-hub$/,
  /^\/(domains|industries|tools)\/[^/]+$/,
  /^\/(privacy|terms|cookie-choices|accessibility)$/,
];

export function templateHasOwnTrail(pathname: string | null): boolean {
  const path = (pathname ?? '/').replace(/\/+$/, '') || '/';
  return OWN_TRAIL_ROUTES.some((route) => route.test(path));
}

export default function FooterBreadcrumbs() {
  const pathname = usePathname();
  const trail = breadcrumbTrail(pathname);
  if (!trail || templateHasOwnTrail(pathname)) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-white/60 uppercase tracking-widest font-bold list-none p-0 m-0">
        {trail.map((crumb, index) => (
          <li key={`${crumb.href ?? 'current'}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span className="text-white/30" aria-hidden="true">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-white transition-colors no-underline">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-white" aria-current="page">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
