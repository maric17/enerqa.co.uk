import { GlobalIntelligenceContent, intelligenceMetadata, type IntelligencePageProps } from '../../../../(frontend)/knowledge-hub/global-intelligence/GlobalIntelligenceContent';

export const metadata = intelligenceMetadata('ar');

export default function ArabicGlobalIntelligencePage(props: IntelligencePageProps) {
  return <GlobalIntelligenceContent {...props} language="ar" />;
}
