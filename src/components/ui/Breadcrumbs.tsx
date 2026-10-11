import React from 'react';
import Link from 'next/link';

type Props = {
  parents: { label: string; href: string }[];
  current: string;
  className?: string;
};

// Use record titles supplied by the page; URL slugs cannot provide an accurate title.
export function Breadcrumbs({ parents, current, className }: Props) {
  const items: { label: string; href?: string }[] = [...parents, { label: current }];
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-1 list-none p-0">
        {items.map((item, index) => (
          <li key={item.href ?? 'current'} className="inline-flex max-w-full min-w-0 items-baseline gap-2">
            {/* Separators are decoration; only page names belong in the spoken trail. */}
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="min-w-0 [overflow-wrap:anywhere] no-underline hover:underline underline-offset-4">{item.label}</Link>
            ) : (
              <span aria-current="page" className="min-w-0 [overflow-wrap:anywhere]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
