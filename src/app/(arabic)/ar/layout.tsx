import type { Metadata } from 'next';
import { WebsiteLayout } from '../../(frontend)/WebsiteLayout';

export const metadata: Metadata = {
  title: { default: 'إنيرقا', template: '%s | إنيرقا' },
  robots: { index: false, follow: false },
};

export default function ArabicLayout({ children }: { children: React.ReactNode }) {
  return <WebsiteLayout language="ar">{children}</WebsiteLayout>;
}
