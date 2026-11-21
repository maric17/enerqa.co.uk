import type { Metadata } from 'next';
import { KnowledgeHubContent } from '../../../(frontend)/knowledge-hub/KnowledgeHubContent';

export const metadata: Metadata = {
  title: 'مركز المعرفة',
  description: 'تصفّح المنشورات والتحليلات الأصلية من إنيرقا.',
};

export default function Page() {
  return <KnowledgeHubContent language="ar" />;
}
