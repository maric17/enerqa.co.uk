const publicPages = new Set([
  '/', '/about', '/about/careers', '/contact', '/domains-and-industries',
  '/project-development', '/tools', '/knowledge-hub', '/knowledge-hub/global-intelligence',
  '/data-portal', '/data-portal/explorer', '/data-portal/sources', '/data-portal/occurrences',
  '/search', '/terms', '/privacy', '/cookie-choices', '/accessibility',
]);

// Only public content routes have an Arabic counterpart. API calls, downloads,
// account actions and external links must continue to use their original URLs.
const detailPage = /^\/(?:domains|industries|tools|knowledge-hub|data-portal\/(?:datasets|dashboards|series))\/[a-z0-9][a-z0-9_-]*$/i;

export function arabicPilotPath(pathname: string) {
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return null;
  const path = pathname.replace(/\/$/, '') || '/';
  if (!publicPages.has(path) && !detailPage.test(path)) return null;
  return path === '/' ? '/ar' : `/ar${path}`;
}

export function pilotHref(language: 'en' | 'ar', href: string) {
  if (language === 'en') return href;
  const path = href.split(/[?#]/, 1)[0];
  const translated = arabicPilotPath(path);
  return translated ? translated + href.slice(path.length) : href;
}
