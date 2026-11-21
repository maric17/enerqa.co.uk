import GlobalIntelligencePage from '../../../../(frontend)/knowledge-hub/global-intelligence/page';
import { EnglishPageContent } from '@/components/ui/EnglishPageContent';

export default function ArabicGlobalIntelligencePage(props: Parameters<typeof GlobalIntelligencePage>[0]) {
  return <EnglishPageContent><GlobalIntelligencePage {...props} /></EnglishPageContent>;
}
