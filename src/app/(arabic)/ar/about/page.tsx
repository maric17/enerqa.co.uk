import type { Metadata } from 'next';
import { AboutContent } from '../../../(frontend)/about/AboutContent';

export const metadata: Metadata = { title: "عن إنيرقا", description: "تعرّف على إنيرقا ونهجها في تطوير المشاريع والاستشارات." };

export default function Page() {
  return <AboutContent language="ar" />;
}
