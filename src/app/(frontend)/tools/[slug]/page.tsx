import { ToolDetailContent, toolMetadata } from './content';
export function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  return toolMetadata(props);
}

export default function ToolDetailPage(props: Omit<Parameters<typeof ToolDetailContent>[0], 'language'>) {
  return ToolDetailContent(props);
}
