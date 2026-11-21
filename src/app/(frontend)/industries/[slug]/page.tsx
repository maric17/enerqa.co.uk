import { IndustryContent, industryMetadata } from './IndustryContent';

type Props = { params: Promise<{ slug: string }> };

export function generateMetadata(props: Props) {
  return industryMetadata(props);
}

export default function IndustryPage(props: Props) {
  return IndustryContent(props);
}
