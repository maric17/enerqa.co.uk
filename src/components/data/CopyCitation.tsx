'use client';
import { useState } from 'react';

export function CopyCitation({ citation }: { citation: string }) {
  const [message, setMessage] = useState('');
  return <div>
    <button type="button" className="rounded border border-gray-300 px-4 py-2 font-semibold" onClick={async () => {
      try { await navigator.clipboard.writeText(citation); setMessage('Citation copied.'); }
      catch { setMessage('Copy unavailable. Select and copy the citation below.'); }
    }}>Copy Citation</button>
    <p role="status" className="text-sm">{message}</p>
    <p className="select-text text-sm break-words">{citation}</p>
  </div>;
}
