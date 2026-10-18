'use client';

import React, { useId, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

export interface FooterNavGroupProps {
  title: string;
  links: { label: string; href: string }[];
}

/**
 * One footer link group. On phones the heading is a button that opens and
 * closes the list (the WAI accordion pattern: a button inside the heading,
 * with aria-expanded), so the six groups fold into six rows. From md up the
 * list is always shown and the heading is plain text.
 *
 * A native <details> was the lighter option, but CSS cannot hold it open on
 * wider screens, so the desktop columns would start closed.
 */
export default function FooterNavGroup({ title, links }: FooterNavGroupProps) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <div>
      <h2 className="text-white font-semibold text-[15px] md:text-[13px] leading-[18px] md:mb-2.5">
        {/* Phone: 48px tall, above the 44px minimum touch target. */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((isOpen) => !isOpen)}
          className="md:hidden flex w-full min-h-12 items-center justify-between gap-4 text-start cursor-pointer"
        >
          {title}
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`w-3 h-3 text-white/70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        <span className="hidden md:inline">{title}</span>
      </h2>
      {/* Closed lists are display:none on phones only; md:flex always shows them. */}
      <ul
        id={listId}
        className={`${open ? 'flex' : 'hidden'} md:flex flex-col md:gap-1.5 pb-3 md:pb-0 text-sm md:text-[13px] md:leading-5 list-none m-0 pl-0`}
      >
        {links.map((link) => (
          <li key={link.href}>
            {/* min-h-10 gives each phone link a comfortable tap area. */}
            <Link
              href={link.href}
              className="flex min-h-10 md:min-h-0 items-center md:block text-white/70 hover:text-white transition-colors duration-200 no-underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
