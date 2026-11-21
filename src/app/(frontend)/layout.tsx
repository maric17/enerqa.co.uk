import type { Metadata } from 'next';
import { WebsiteLayout } from './WebsiteLayout';

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://enerqa.co.uk';

export const metadata: Metadata = {
  // Without this every relative canonical (`alternates.canonical: '/about'`)
  // rendered as a relative URL.
  metadataBase: new URL(SITE_URL),
  // `template` appends " | Enerqa" to whatever title a child page sets, so each page
  // only declares its own unique part. `default` is used when a page sets no title.
  // Handoff p. 227 requires a unique descriptive title on every substantive page.
  title: {
    default: "Enerqa",
    template: "%s | Enerqa",
  },
  // The homepage H01 narrative (p. 13) - the handoff's own summary of the site.
  // Replaces the legacy "Climate, Energy & ESG Advisory".
  description:
    "From an initial idea to feasibility, finance and implementation, Enerqa develops projects across climate action, energy transition, environment, nature, circularity, ESG and sustainable finance.",
  // No `alternates.languages` here: it sent hreflang en AND ar (both to the
  // homepage) on every page without its own metadata, but no Arabic page exists.
  // p. 227: reciprocal hreflang only for real corresponding pages.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <WebsiteLayout>{children}</WebsiteLayout>;
}
