import { OccurrencesContent } from './content';
export { metadata } from './content';

export default function OccurrencesPage(props: Omit<Parameters<typeof OccurrencesContent>[0], 'language'>) {
  return OccurrencesContent(props);
}
