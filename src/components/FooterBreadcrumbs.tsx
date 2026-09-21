'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FooterBreadcrumbs() {
  const pathname = usePathname();
  
  if (!pathname || pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);

  const formatSegment = (segment: string) => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 mb-6 uppercase tracking-widest font-bold">
      <Link href="/" className="hover:text-white transition-colors no-underline">Home</Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        return (
          <React.Fragment key={href}>
            <span className="text-white/30">/</span>
            {isLast ? (
              <span className="text-white">{formatSegment(segment)}</span>
            ) : (
              <Link href={href} className="hover:text-white transition-colors no-underline">
                {formatSegment(segment)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
