import { DashboardDetailContent } from './content';
export { generateMetadata } from './content';

export default function DashboardDetailPage(props: Omit<Parameters<typeof DashboardDetailContent>[0], 'language'>) {
  return DashboardDetailContent(props);
}
