import { findPublication, PublicationContent, publicationMetadata } from '../../../../(frontend)/knowledge-hub/[slug]/PublicationContent';
import { EnglishPageContent } from '@/components/ui/EnglishPageContent';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props) {
  const post = await findPublication((await props.params).slug, 'en');
  return publicationMetadata(props, post?.language === 'ar' ? 'ar' : 'en');
}

export default async function Page(props: Props) {
  const post = await findPublication((await props.params).slug, 'en');
  if (post?.language === 'ar') return <PublicationContent {...props} language="ar" />;
  return <EnglishPageContent><PublicationContent {...props} /></EnglishPageContent>;
}
