'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useEmbedConsent } from '@/lib/consent';

// "gapminder.org" from "https://www.gapminder.org/tools/…". A malformed CMS
// URL still gets an honest placeholder instead of crashing the page.
function hostOf(src: string): string {
  try {
    return new URL(src).hostname.replace(/^www\./, '');
  } catch {
    return 'another site';
  }
}

/**
 * A third-party iframe that loads only with consent (p. 208 U03): either the
 * visitor allowed embedded content on /cookie-choices, or clicked Load for this
 * one. Until then the placeholder fills the same box, so nothing shifts (p. 228).
 */
export function ExternalEmbed({ src, title, className = '' }: { src: string; title: string; className?: string }) {
  const allowed = useEmbedConsent();
  // Consent for this one embed on this visit only; it is not saved.
  const [loadedOnce, setLoadedOnce] = useState(false);
  const host = hostOf(src);

  if (allowed || loadedOnce) {
    return <iframe src={src} title={title} className={className} loading="lazy" allowFullScreen />;
  }

  return (
    <div className={`${className} flex flex-col items-center justify-center gap-4 p-6 text-center bg-paper-alt`}>
      <p className="m-0 max-w-md text-gray-700">
        This content is hosted by {host}, which may set its own cookies. It loads only if you choose.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* The accessible name starts with the visible words (WCAG 2.5.3) and
            names the embed, so two placeholders on one page stay distinct. */}
        <Button type="button" onClick={() => setLoadedOnce(true)} aria-label={`Load content – ${title}`}>
          Load content
        </Button>
        <a href={src} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline">
          Open on {host}<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
