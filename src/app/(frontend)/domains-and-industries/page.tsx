import type { Metadata } from 'next';
import { DomainsAndIndustriesContent } from './DomainsAndIndustriesContent';

// Static metadata: this page's content never changes per-request, so a plain
// `metadata` object is enough (no need for the async `generateMetadata`).
// The root layout appends " | Enerqa" to the title via its template.
// Handoff p. 227: unique descriptive title + meta description on every page.
export const metadata: Metadata = {
  title: 'Domains and Industries',
  description:
    "Enerqa's work is organised around four interconnected domains and thirteen industries, connected by project development, data, modelling and MRV.",
  alternates: {
    // Canonical URL stops the retired /services pages competing with this one
    // once the redirects in the handoff redirect register (p. 228) are in place.
    canonical: '/domains-and-industries',
  },
};

export default function DomainsAndIndustriesPage() {
  return <DomainsAndIndustriesContent />;
}
