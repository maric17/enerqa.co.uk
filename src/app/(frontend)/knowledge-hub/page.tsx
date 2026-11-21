import type { Metadata } from 'next';
import { KnowledgeHubContent } from './KnowledgeHubContent';

export const metadata: Metadata = {
  title: 'Knowledge Hub',
  description:
    'Original Enerqa analysis alongside open-access news, research and official updates. Two collections: Publications and Global Intelligence.',
  alternates: { canonical: '/knowledge-hub' },
};

export default function Page() {
  return <KnowledgeHubContent />;
}
