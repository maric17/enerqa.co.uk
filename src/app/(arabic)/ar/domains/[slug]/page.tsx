import { DomainContent, domainMetadata } from '../../../../(frontend)/domains/[slug]/DomainContent';
import { EnglishPageContent } from '@/components/ui/EnglishPageContent';
import { getArabicDomain } from '@/lib/i18n/domains';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props) {
  return domainMetadata(props, getArabicDomain((await props.params).slug) ? 'ar' : 'en');
}

export default async function ArabicDomainPage(props: Props) {
  if (getArabicDomain((await props.params).slug)) return <DomainContent {...props} language="ar" />;
  return <EnglishPageContent><DomainContent {...props} /></EnglishPageContent>;
}
