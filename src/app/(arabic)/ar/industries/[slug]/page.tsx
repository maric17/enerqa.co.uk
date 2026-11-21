import { IndustryContent, industryMetadata } from '../../../../(frontend)/industries/[slug]/IndustryContent';
import { EnglishPageContent } from '@/components/ui/EnglishPageContent';
import { getArabicIndustry } from '@/lib/i18n/industries';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props) {
  return industryMetadata(props, getArabicIndustry((await props.params).slug) ? 'ar' : 'en');
}

export default async function ArabicIndustryPage(props: Props) {
  if (getArabicIndustry((await props.params).slug)) return <IndustryContent {...props} language="ar" />;
  return <EnglishPageContent><IndustryContent {...props} /></EnglishPageContent>;
}
