import { DatasetDetailContent } from './content';
export { generateMetadata } from './content';

export default function DatasetDetailPage(props: Omit<Parameters<typeof DatasetDetailContent>[0], 'language'>) {
  return DatasetDetailContent(props);
}
