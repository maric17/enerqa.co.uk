import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { arabicPilotEnabled } from '@/lib/i18n/pilot';
import { WebsiteLayout } from '../../(frontend)/WebsiteLayout';

export const metadata: Metadata = {
  title: { default: 'إنيرقا', template: '%s | إنيرقا' },
  robots: { index: false, follow: false },
};

export default function ArabicLayout({ children }: { children: React.ReactNode }) {
  if (!arabicPilotEnabled) notFound();
  return <WebsiteLayout language="ar">{children}</WebsiteLayout>;
}
