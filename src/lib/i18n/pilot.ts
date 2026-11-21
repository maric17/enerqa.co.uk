import { getArabicIndustry } from './industries';

// Only the routes with a complete pilot page can be opened from the language switch.
const englishRoutes: ReadonlySet<string> = new Set(['/', '/about', '/contact', '/knowledge-hub']);

export function arabicPilotPath(pathname: string) {
  const industry = /^\/industries\/([^/]+)$/.exec(pathname);
  if (industry && getArabicIndustry(industry[1])) return `/ar${pathname}`;
  return englishRoutes.has(pathname) ? (pathname === '/' ? '/ar' : `/ar${pathname}`) : null;
}

// During the pilot, keep links to untranslated pages reachable at their English URL.
export function pilotHref(language: 'en' | 'ar', href: string) {
  if (language === 'en') return href;
  const path = href.split(/[?#]/, 1)[0];
  const translated = arabicPilotPath(path);
  return translated ? translated + href.slice(path.length) : href;
}

// Keep draft translations local until the client has reviewed them.
export const arabicPilotEnabled = process.env.NODE_ENV === 'development';
