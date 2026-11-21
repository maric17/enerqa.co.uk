import { SearchContent } from './content';
export { metadata } from './content';

export default function SearchPage(props: Omit<Parameters<typeof SearchContent>[0], 'language'>) {
  return SearchContent(props);
}
