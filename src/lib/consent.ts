'use client';

import { useSyncExternalStore } from 'react';

// p. 208 U03: "Cookie controls must change actual consent settings."
// The only optional storage on this site comes from third-party embeds (tool
// iframes, dataset charts, the Gapminder explorer): the embedded site may set
// its own cookies. There is no analytics code in src, so there is no analytics
// choice to offer. Add a key here only when the code it controls exists.
export const CONSENT_KEY = 'enerqa-consent';

// Fired in this tab after a save; the 'storage' event covers other tabs.
const CHANGE_EVENT = 'enerqa-consent-change';

type Consent = { embeds: boolean };

// Storage can throw (private mode, blocked site data), and old or edited
// values can be anything. Every doubt means "not allowed".
export function embedsAllowed(): boolean {
  try {
    const parsed = JSON.parse(localStorage.getItem(CONSENT_KEY) ?? 'null');
    return parsed?.embeds === true;
  } catch {
    return false;
  }
}

export function saveConsent(consent: Consent): void {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...consent, savedAt: new Date().toISOString() }));
  } catch {
    /* blocked storage: the choice cannot be remembered, so nothing loads automatically */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

// Re-renders every embed and the Cookie Choices control when the choice
// changes. The server snapshot is `false`, so server HTML never includes a
// third-party iframe.
export function useEmbedConsent(): boolean {
  return useSyncExternalStore(subscribe, embedsAllowed, () => false);
}
