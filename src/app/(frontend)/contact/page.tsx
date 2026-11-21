import type { Metadata } from 'next';
import { ContactContent } from './ContactContent';

export const metadata: Metadata = {
  title: { absolute: 'Contact Enerqa' },
  description:
    'Share an idea, a project opportunity or a question about Enerqa’s work. A complete project brief is not required to begin a conversation.',
  alternates: { canonical: '/contact' },
};

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ContactContent searchParams={searchParams} />;
}
