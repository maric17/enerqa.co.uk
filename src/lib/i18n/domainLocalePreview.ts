// Use localized CMS fields only on the migrated, isolated review database.
export const domainLocalePreview = process.env.PUBLICATION_LOCALE_PREVIEW === 'true'
  && new URL(process.env.DATABASE_URI ?? 'postgres://localhost/default').pathname === '/enerqa_translation_preview';

export const domainLocaleFields = domainLocalePreview ? { localized: true as const } : {};
