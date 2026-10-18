import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';

/**
 * K02 "Choose a Collection" (p. 155), copy verbatim: "two prominent collection
 * links directly below the introduction and above search ... The same switch
 * appears on Global Intelligence." Both collection pages render this one
 * component, so the two can't drift apart.
 */
const COLLECTIONS = [
  { key: 'publications', label: 'Enerqa Publication', href: '/knowledge-hub' },
  { key: 'global-intelligence', label: 'Global Intelligence', href: '/knowledge-hub/global-intelligence' },
] as const;

export function CollectionSwitch({ active }: { active: (typeof COLLECTIONS)[number]['key'] }) {
  return (
    <section aria-labelledby="k02-heading" className="border-b border-gray-200 bg-white py-10">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 id="k02-heading" className="m-0 text-2xl font-bold text-[var(--color-dark)]">
              Choose a Collection
            </h2>
            <p className="m-0 mt-2 text-gray-600">
              Knowledge Hub contains two collections: Enerqa Publication and Global Intelligence. Each has its own
              searchable results and filters.
            </p>
          </div>
          <nav aria-label="Knowledge Hub collections">
            <ul className="m-0 flex list-none gap-1.5 rounded-xl bg-[var(--color-paper-alt)] p-1.5">
              {COLLECTIONS.map((c) => {
                const isActive = c.key === active;
                return (
                  <li key={c.key} className="flex-1 md:flex-none">
                    <Link
                      href={c.href}
                      // Tells screen readers which collection is showing (the
                      // old tabs only signalled it with colour).
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex min-h-[48px] items-center justify-center whitespace-nowrap rounded-lg px-3 text-sm font-bold md:px-5 no-underline transition-colors md:text-base ${
                        isActive
                          ? 'bg-[var(--color-dark)] text-white'
                          : 'text-[var(--color-dark)] hover:bg-white'
                      }`}
                    >
                      {c.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </Container>
    </section>
  );
}
