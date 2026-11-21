import { GlobalIntelligenceContent, intelligenceMetadata, type IntelligencePageProps } from './GlobalIntelligenceContent';

export const metadata = intelligenceMetadata();

export default function GlobalIntelligencePage(props: IntelligencePageProps) {
  return <GlobalIntelligenceContent {...props} />;
}
