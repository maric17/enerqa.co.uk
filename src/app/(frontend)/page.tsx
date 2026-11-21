import type { Metadata } from 'next';
import { HomeContent } from './HomeContent';

export const metadata: Metadata = {
  title: {
    absolute: 'Enerqa — Project Development for a Sustainable Future',
  },
  description:
    'Enerqa develops projects across climate action, energy transition, environment, nature, circularity, ESG and sustainable finance.',
  alternates: { canonical: '/' },
}

export default async function Page() {
  return HomeContent({});
}
