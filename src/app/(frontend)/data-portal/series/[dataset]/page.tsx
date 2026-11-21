import { ConnectorDatasetContent } from './content';
export { generateMetadata } from './content';

export default function ConnectorDatasetPage(props: Omit<Parameters<typeof ConnectorDatasetContent>[0], 'language'>) {
  return ConnectorDatasetContent(props);
}
