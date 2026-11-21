'use client';

import type { ComponentProps } from 'react';
import Link from 'next/link';
import { useSiteLanguage } from '@/components/LanguageProvider';
import { pilotHref } from '@/lib/i18n/pilot';

export default function SiteLink({ href, ...props }: ComponentProps<typeof Link>) {
  const language = useSiteLanguage();
  // Keep public page links in the current language, including in English fallback copy.
  return <Link {...props} href={typeof href === 'string' ? pilotHref(language, href) : href} />;
}

export function SiteGetForm({ action, ...props }: Omit<ComponentProps<'form'>, 'action' | 'method'> & { action: string }) {
  const language = useSiteLanguage();
  return <form {...props} action={pilotHref(language, action)} method="GET" />;
}
