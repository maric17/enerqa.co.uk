import industryCopy from './industry-copy.json';

type IndustryTranslation = {
  title: string;
  description: string;
  introduction: string;
  lifecycle: string;
};

// Keep Arabic introductions alongside the existing industry routes, keyed by the shared CMS slug.
export const arabicIndustries: Readonly<Partial<Record<string, IndustryTranslation>>> = industryCopy;

export function getArabicIndustry(slug: string) {
  return Object.hasOwn(arabicIndustries, slug) ? arabicIndustries[slug] : undefined;
}
