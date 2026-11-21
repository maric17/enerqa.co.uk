'use client';
import React, { useEffect, useState } from 'react';
import { SEARCH_COPY } from './searchIndex';
import { useSiteLanguage } from '@/components/LanguageProvider';
import { siteText } from '@/lib/i18n/site';
import Link from '@/components/ui/SiteLink';
import { searchResultSchema, type SearchResult } from '@/lib/api/ai-search/answer';

export function AIResponse({ query }: { query: string }) {
  const language = useSiteLanguage();
  const t = (text: string) => siteText(language, text);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [status, setStatus] = useState<'loading' | 'failed' | 'stopped' | 'done'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [controller, setController] = useState<AbortController | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    let active = true;
    setController(abort); setResult(null); setStatus('loading');
    // Defer one turn so Strict Mode's setup/cleanup probe cannot submit twice.
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/ai-search', { method: 'POST', signal: abort.signal, headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: crypto.randomUUID(), query, locale: 'en' }) });
        if (!res.ok) throw new Error('Unavailable');
        const parsed = searchResultSchema.safeParse(await res.json());
        if (!parsed.success) throw new Error('Invalid answer');
        if (active) { setResult(parsed.data); setStatus('done'); }
      } catch { if (active && !abort.signal.aborted) setStatus('failed'); }
    }, 0);
    return () => { active = false; clearTimeout(timer); abort.abort(); };
  }, [query, attempt]);
  return <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 space-y-4">
    <p className="text-sm">{t("AI answers can make mistakes. Check the linked sources. Please do not share confidential information.")}</p>
    {status === 'loading' && <><p role="status">{t(SEARCH_COPY.loading)}</p><button type="button" className="underline" onClick={() => { controller?.abort(); setStatus('stopped'); }}>{t("Stop")}</button></>}
    {status === 'failed' && <p role="status">{t(SEARCH_COPY.failure)}</p>}
    {status === 'stopped' && <p role="status">{t("Search stopped.")}</p>}
    {status === 'done' && result?.status === 'insufficient' && <p role="status">{t("There is not enough verified open-access evidence to provide an answer. Try a more specific question.")}</p>}
    {status === 'done' && result?.status === 'refused' && <p role="status">{t("This request cannot be answered. Try a different question.")}</p>}
    {result?.status === 'complete' && <>
      <p className="text-xs uppercase font-bold">Generated answer</p>
      {result.answer.map((block, index) => {
        const segments: React.ReactNode[] = [];
        let cursor = 0;
        for (const citation of block.citations) {
          const source = result.sources.find(s => s.id === citation.source_id)!;
          segments.push(block.text.slice(cursor, citation.start));
          segments.push(<a key={`${citation.start}-${source.id}`} href={source.url} className="underline font-semibold" target="_blank" rel="noopener noreferrer">{block.text.slice(citation.start, citation.end)}</a>);
          cursor = citation.end;
        }
        segments.push(block.text.slice(cursor));
        return <p key={index} dir="auto" className="whitespace-pre-wrap">{segments}</p>;
      })}
      <h3 className="font-bold">Sources</h3>
      <ul className="space-y-2">{result.sources.map(s => <li key={s.id} className="text-sm"><a href={s.url} className="underline">{s.title}</a> · {s.published_at ? `Published ${s.published_at}` : 'Publication date not supplied'} · Retrieved {s.retrieved_at}</li>)}</ul>
    </>}
    {status !== 'loading' && <button type="button" className="underline" onClick={() => setAttempt(n => n + 1)}>{t("Retry search")}</button>}
    <p className="text-sm"><Link href="/search" className="underline">{t("Clear search")}</Link> · <Link href="/contact?intent=general" className="underline">{t("Send search feedback")}</Link></p>
  </div>;
}
