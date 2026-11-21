import type { Metadata } from 'next';
import { AboutContent } from './AboutContent';

export const metadata: Metadata = {
  title: { absolute: 'About Enerqa' },
  description:
    'Enerqa is a multidisciplinary project-development and consultancy company working across climate action and carbon management, energy systems and transition, environment, nature and circularity, and sustainable business, ESG and finance.',
  alternates: { canonical: '/about' },
};

export default function Page() {
  return <AboutContent />;
}
