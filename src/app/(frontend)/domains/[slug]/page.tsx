import { DomainContent, domainMetadata } from './DomainContent';

type Props = Pick<Parameters<typeof DomainContent>[0], 'params'>;

export function generateMetadata(props: Props) {
  return domainMetadata(props);
}

export default function DomainPage(props: Props) {
  return DomainContent(props);
}
