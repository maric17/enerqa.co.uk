import { Container } from '@/components/ui/Container';

// Reserve the chart/table space while a shared source release loads.
export default function Loading() {
  return <Container className="pt-36 pb-20"><p role="status">Loading source observations…</p><div aria-hidden="true" className="h-96 rounded border bg-gray-50 motion-safe:animate-pulse" /></Container>;
}
