'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import type { AiSource } from './aiAnswer';
import { SEARCH_COPY } from './searchIndex';

function linkifyCitations(text: string) {
  const re = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
  const segments: Array<{ text: string } | { cite: number }> = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) segments.push({ text: text.slice(last, m.index) });
    const nums = m[1].split(',').map((n) => Number(n.trim()));
    for (const n of nums) segments.push({ cite: n });
    last = m.index! + m[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}

export function AIResponse({ query, sources }: { query: string; sources: AiSource[] }) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [citations, setCitations] = useState<any[]>([]);
  const [callToAction, setCallToAction] = useState<any>(null);
  const [companyKnowledge, setCompanyKnowledge] = useState<any[]>([]);
  const fetched = useRef(false);

  useEffect(() => {
    // Reset state on new query
    fetched.current = false;
    setAnswer(null);
    setStatus('loading');
  }, [query]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    
    let active = true;
    async function fetchAnswer() {
      try {
        const isCooldown = sessionStorage.getItem('enerqa_promotion_cooldown') === 'true';

        const res = await fetch('/api/ai-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request_id: crypto.randomUUID(),
            session_id: 'session-' + Date.now(),
            query,
            locale: 'en',
            promotion_opt_out: isCooldown,
          }),
        });

        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        if (data.status === 'success' && data.answer?.text && active) {
          setAnswer(data.answer.text);
          // If the AI didn't provide citations, fallback to the energetic keyword sources
          setCitations(data.answer.citations?.length ? data.answer.citations : sources);
          setCallToAction(data.call_to_action);
          setCompanyKnowledge(data.company_knowledge || []);
          setStatus('success');
        } else if (active) {
          setStatus('failed');
        }
      } catch (err) {
        console.error('AI search fetch failed:', err);
        if (active) setStatus('failed');
      }
    }

    fetchAnswer();
    return () => { active = false; };
  }, [query, sources]);

  if (status === 'loading') {
    return (
      <p role="status" className="text-gray-600 bg-gray-50 p-8 rounded-xl border border-gray-200 m-0 animate-pulse">
        {SEARCH_COPY.loading}
      </p>
    );
  }

  if (status === 'failed' || !answer) {
    return (
      <p role="status" className="bg-gray-50 text-gray-700 p-6 rounded-xl border border-gray-200 m-0">
        {SEARCH_COPY.failure}
      </p>
    );
  }

  const segments = linkifyCitations(answer);

  return (
    <div className="bg-blue-50 border border-blue-200 p-8 rounded-2xl flex flex-col gap-4">
      <p className="text-xs font-bold uppercase tracking-wider text-blue-900 m-0">Generated answer</p>
      <p dir="auto" className="text-blue-950 leading-relaxed whitespace-pre-wrap m-0">
        {segments.map((seg, i) =>
          'cite' in seg ? (
            <sup key={i}>
              <a href={`#answer-source-${seg.cite}`} className="font-semibold underline" aria-label={`Source ${seg.cite}`}>
                [{seg.cite}]
              </a>
            </sup>
          ) : (
            <React.Fragment key={i}>{seg.text}</React.Fragment>
          ),
        )}
      </p>
      {companyKnowledge.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-xl border border-blue-100">
          <h3 className="text-sm font-bold text-blue-900 mb-2 uppercase tracking-wider">Relevant Company Context</h3>
          <ul className="text-sm text-gray-700 flex flex-col gap-2 m-0 p-0 list-none">
            {companyKnowledge.map((k, idx) => (
              <li key={idx} className="flex gap-2 items-start">
                <span className="text-blue-500 mt-1">•</span>
                <span>{k.content}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {callToAction && (
        <div className="mt-4 p-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl text-white shadow-md flex justify-between items-center relative">
          <button 
            className="absolute top-2 right-2 text-blue-200 hover:text-white"
            onClick={() => {
              sessionStorage.setItem('enerqa_promotion_cooldown', 'true');
              setCallToAction(null);
            }}
            aria-label="Dismiss promotion"
          >
            ✕
          </button>
          <div>
            <h3 className="font-bold text-lg">{callToAction.text}</h3>
            {callToAction.services && callToAction.services.length > 0 && (
              <p className="text-sm text-blue-100 mt-1">Suggested: {callToAction.services.join(', ')}</p>
            )}
          </div>
          <Link href={callToAction.link || '#'} className="bg-white text-blue-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors mr-6">
            {callToAction.type === 'contact' ? 'Contact Us' : 'Learn More'}
          </Link>
        </div>
      )}

      {citations.length > 0 && (
        <div className="mt-4">
          <h3 className="text-base font-bold text-blue-950 mb-2">Sources</h3>
          <ol className="list-none p-0 m-0 flex flex-col gap-2">
            {citations.map((s, index) => {
              const num = s.id || s.n || (index + 1);
              const title = s.title || s.url || 'Reference';
              return (
                <li key={num} id={`answer-source-${num}`} className="text-sm text-blue-950">
                  [{num}]{' '}
                  <Link href={s.url || '#'} className="font-semibold underline" dir="auto">
                    {title}
                  </Link>
                  {s.category && ` - ${s.category}`}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
