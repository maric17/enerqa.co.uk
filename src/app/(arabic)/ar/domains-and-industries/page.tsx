import type { Metadata } from 'next';
import { DomainsAndIndustriesContent } from '../../../(frontend)/domains-and-industries/DomainsAndIndustriesContent';

export const metadata: Metadata = {
  title: 'المجالات والقطاعات',
  description: 'تعمل إنيرقا في أربعة مجالات مترابطة وثلاثة عشر قطاعاً، يجمع بينها تطوير المشاريع والبيانات والنمذجة والقياس والإبلاغ والتحقق.',
  alternates: { canonical: '/ar/domains-and-industries' },
};

export default function ArabicDomainsAndIndustriesPage() {
  return <DomainsAndIndustriesContent language="ar" />;
}
