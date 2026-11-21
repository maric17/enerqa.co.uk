import arabicCopy from './domain-copy.json';

type DomainTranslation = {
  title: string;
  introduction: string;
  metaDescription: string;
  topic: string;
  lifecycle: string;
  policyHeading: string;
  sourceNote: string;
  capabilities: Partial<Record<string, { heading: string; narrative: string }>>;
};

const arabicDomains: Partial<Record<string, DomainTranslation>> = arabicCopy;

// Match the CMS slugs so translated copy follows the editor's saved order.
export function getArabicDomain(slug: string) {
  return Object.hasOwn(arabicDomains, slug) ? arabicDomains[slug] : undefined;
}
