'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Home, Search } from 'lucide-react';
import { Container } from '@/components/ui/Container';

// p. 4: a 404 directs visitors to search and the nearest relevant section.
// The section is read from the URL they tried, so /knowledge-hub/old-slug
// offers the Knowledge Hub. Domains, industries and the lifecycle page are
// already covered by the "Explore Domains and Industries" button.
const SECTIONS = [
  { prefix: '/knowledge-hub/global-intelligence', label: 'Global Intelligence', href: '/knowledge-hub/global-intelligence' },
  { prefix: '/knowledge-hub', label: 'Knowledge Hub', href: '/knowledge-hub' },
  { prefix: '/data-portal', label: 'Data Portal', href: '/data-portal' },
  { prefix: '/tools', label: 'Tools', href: '/tools' },
  { prefix: '/about', label: 'About', href: '/about' },
];

// Not exported: Next special files should only export their component.
function nearestSection(pathname: string | null) {
  if (!pathname) return null;
  return SECTIONS.find((s) => pathname === s.prefix || pathname.startsWith(`${s.prefix}/`)) ?? null;
}

const primaryButton = 'inline-flex justify-center items-center gap-2 bg-[var(--color-dark)] text-white font-bold py-4 px-8 rounded-full hover:bg-gray-800 transition-colors';
const secondaryButton = 'inline-flex justify-center items-center gap-2 bg-white text-[var(--color-dark)] font-bold py-4 px-8 rounded-full border border-gray-300 hover:border-[var(--color-dark)] transition-colors';

// A Client Component because the nearest section depends on the URL, and
// not-found files receive no props (Next docs: use usePathname instead).
export default function NotFound() {
  const section = nearestSection(usePathname());

  return (
    <div className="flex flex-col min-h-[80vh] bg-[var(--color-paper)] pt-[var(--header-offset)] justify-center items-center">
      <Container>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="text-[12rem] font-bold text-gray-100 leading-none select-none" aria-hidden="true">404</div>
          {/* p. 208 U01/U02: the title and the proposed message, verbatim. */}
          <h1 className="text-4xl font-bold text-[var(--color-dark)] mb-6 -mt-12 relative z-10">Page Not Found</h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed relative z-10">
            We could not find this page. Search the site or explore one of the main sections.
          </p>

          {/* p. 208 U03: the three 404 buttons, plus the section the URL was in. */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4 relative z-10">
            {section && (
              <Link href={section.href} className={primaryButton}>
                Go to {section.label} <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            )}
            <Link href="/search" className={section ? secondaryButton : primaryButton}>
              <Search className="w-5 h-5" aria-hidden="true" /> Search Enerqa
            </Link>
            <Link href="/" className={secondaryButton}>
              <Home className="w-5 h-5" aria-hidden="true" /> Go to Homepage
            </Link>
            <Link href="/domains-and-industries" className={secondaryButton}>
              Explore Domains and Industries <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
