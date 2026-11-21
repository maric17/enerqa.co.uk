import { domainLocalePreview } from './domainLocalePreview';
import type { SiteLanguage } from './site';

// The existing database and CI build use this database name after the locale table is installed.
const database = new URL(process.env.DATABASE_URI ?? 'postgres://localhost/default');
export const toolLocaleEnabled = domainLocalePreview || database.pathname === '/enerqa_production';
export const toolLocaleFields = toolLocaleEnabled ? { localized: true as const } : {};

export function toolLocaleOptions(language: SiteLanguage) {
  return toolLocaleEnabled ? { locale: language, fallbackLocale: 'en' as const } : {};
}
