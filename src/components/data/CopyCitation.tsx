'use client';
import { useState } from 'react';
import { useSiteLanguage } from '@/components/LanguageProvider';
import copy from '@/lib/i18n/data-portal-copy.json';
import { publicCopy } from '@/lib/i18n/publicCopy';

export function CopyCitation({ citation }: { citation: string }) {
  const language = useSiteLanguage();
  const t = (text: string) => publicCopy(language, copy, text);
  const [message, setMessage] = useState('');
  return <div>
    <button type="button" className="rounded border border-gray-300 px-4 py-2 font-semibold" onClick={async () => {
      try { await navigator.clipboard.writeText(citation); setMessage('Citation copied.'); }
      catch { setMessage('Copy unavailable. Select and copy the citation below.'); }
    }}>{t("Copy Citation")}</button>
    <p role="status" className="text-sm">{message && t(message)}</p>
    <p className="select-text text-sm break-words">{citation}</p>
  </div>;
}
