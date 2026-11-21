import { PublicationContent, publicationMetadata } from '../../../../(frontend)/knowledge-hub/[slug]/PublicationContent';

type Props = { params: Promise<{ slug: string }> };

export function generateMetadata(props: Props) {
  return publicationMetadata(props);
}

export default function Page(props: Props) {
  return <PublicationContent {...props} language="ar" />;
}
