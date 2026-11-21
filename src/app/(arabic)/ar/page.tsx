import type { Metadata } from 'next';
import { HomeContent } from '../../(frontend)/HomeContent';

export const metadata: Metadata = { title: "إنيرقا", description: "تطوّر إنيرقا مشاريع في مجالات المناخ والطاقة والبيئة والتمويل المستدام." };

export default function Page() {
  return <HomeContent language="ar" />;
}
