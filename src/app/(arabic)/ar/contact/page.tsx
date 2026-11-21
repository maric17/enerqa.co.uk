import type { Metadata } from 'next';
import { ContactContent } from '../../../(frontend)/contact/ContactContent';

export const metadata: Metadata = { title: "تواصل معنا", description: "شاركنا فكرة أو فرصة لمشروع أو سؤالاً عن عمل إنيرقا." };

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ContactContent language="ar" searchParams={searchParams} />;
}
