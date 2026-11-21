import { PolicyContent } from './content';
export { generateStaticParams, generateMetadata } from './content';

export default function PolicyPage(props: Omit<Parameters<typeof PolicyContent>[0], 'language'>) {
  return PolicyContent(props);
}
