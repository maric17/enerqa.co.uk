'use client';

import React, { useState } from 'react';
import { saveConsent, useEmbedConsent } from '@/lib/consent';

/**
 * The Cookie Choices control (p. 208 U03). It describes only what the site
 * actually stores, and changes the one optional choice: whether third-party
 * embeds load automatically. ExternalEmbed reads the same setting, so the
 * change takes effect on every tool and data page straight away.
 */
export function CookieChoicesControl() {
  const embeds = useEmbedConsent();
  // Announced by screen readers after each save (role="status" below).
  const [status, setStatus] = useState('');

  return (
    <fieldset className="flex flex-col gap-6 m-0 p-6 md:p-8 rounded-2xl border border-gray-200 bg-white">
      <legend className="px-2 text-lg font-bold text-[var(--color-dark)]">Your choices</legend>

      <div>
        <p className="m-0 font-semibold text-[var(--color-dark)]">Essential storage (always on)</p>
        <p className="m-0 mt-1 text-gray-600">
          Remembers these choices and your language setting, and keeps staff signed in to the content editor.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="consent-embeds"
          type="checkbox"
          checked={embeds}
          onChange={(e) => {
            saveConsent({ embeds: e.target.checked });
            setStatus(
              e.target.checked
                ? 'Saved. Embedded content will load automatically.'
                : 'Saved. Embedded content will wait until you choose to load it.',
            );
          }}
          aria-describedby="consent-embeds-help"
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-primary-deep)]"
        />
        <div>
          <label htmlFor="consent-embeds" className="font-semibold text-[var(--color-dark)]">
            Load embedded third-party content automatically
          </label>
          <p id="consent-embeds-help" className="m-0 mt-1 text-gray-600">
            Some tools and data views are hosted by other sites, which may set their own cookies. When this is off, each
            one waits until you choose to load it.
          </p>
        </div>
      </div>

      {/* Present from the first render so the first announcement is not missed. */}
      <p role="status" className="m-0 text-sm font-medium text-[var(--color-dark)]">
        {status}
      </p>
    </fieldset>
  );
}
