import { siteText, type SiteLanguage } from './site';
import { pilotHref } from './pilot';

export type { SiteLanguage } from './site';

export function publicCopy(language: SiteLanguage, copy: Readonly<Record<string, string>>, english: string) {
  if (language === 'en') return english;
  const shared = siteText(language, english);
  if (shared !== english) return shared;
  return Object.hasOwn(copy, english) ? copy[english] : english;
}

/** Translate text leaves while preserving links, lists, formatting and references. */
export function publicRichText<T>(language: SiteLanguage, copy: Readonly<Record<string, string>>, value: T): T {
  if (language === 'en' || value == null) return value;
  return JSON.parse(JSON.stringify(value, (key, field) => {
    if (key === 'text' && typeof field === 'string') return publicCopy(language, copy, field);
    if (key === 'url' && typeof field === 'string') return pilotHref(language, field);
    if (key === 'direction' && (field === 'ltr' || field === 'rtl')) return 'rtl';
    return field;
  })) as T;
}
