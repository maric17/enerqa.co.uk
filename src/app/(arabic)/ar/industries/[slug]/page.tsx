import { IndustryContent, industryMetadata } from '../../../../(frontend)/industries/[slug]/IndustryContent';

type Props = { params: Promise<{ slug: string }> };

export function generateMetadata(props: Props) {
  return industryMetadata(props, 'ar');
}

export default function ArabicIndustryPage(props: Props) {
  return <IndustryContent {...props} language="ar" />;
}
