import React from 'react';
import Link from 'next/link';
import { getClientKey } from '@/lib/forms/clientKey';
import {
  aiAnswersEnabled,
  aiApiKey,
  aiQuota,
  buildSystemInstruction,
  citedSources,
  splitCitations,
  type AiSource,
} from './aiAnswer';
import { SEARCH_COPY, formatSourceDate } from './searchIndex';

function AnswerUnavailable() {
  return (
    <p role="status" className="bg-gray-50 text-gray-700 p-6 rounded-xl border border-gray-200 m-0">
      {SEARCH_COPY.failure}
    </p>
  );
}

/**
 * AI02 Answer and Sources (p. 202): a generated answer that cites only the
 * Enerqa records actually retrieved, with links and source dates.
 *
 * Every failure - provider not approved, no key, quota spent, timeout, empty
 * reply - shows the same honest status and leaves the keyword results below
 * it (pp. 13, 224). Nothing is generated when retrieval failed: the page does
 * not render this component then.
 */
export async function AIResponse({ query, sources }: { query: string; sources: AiSource[] }) {
  if (!aiAnswersEnabled()) return <AnswerUnavailable />;

  // Hard quota guard (p. 224: "a conservative internal hard budget").
  if (!aiQuota.tryConsume(await getClientKey())) return <AnswerUnavailable />;

  let answer: string | undefined;
  try {
    // Loaded only when answers are switched on.
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: aiApiKey() });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: query }] }],
      config: {
        systemInstruction: buildSystemInstruction(sources),
        temperature: 0.1,
        maxOutputTokens: 600,
        // p. 228: a provider timeout must not hang the page.
        abortSignal: AbortSignal.timeout(15_000),
      },
    });
    answer = response.text?.trim();
  } catch (error) {
    console.error('AI answer failed:', error);
  }
  if (!answer) return <AnswerUnavailable />;

  const segments = splitCitations(answer, sources.length);
  const cited = citedSources(answer, sources);

  return (
    <div className="bg-blue-50 border border-blue-200 p-8 rounded-2xl flex flex-col gap-4">
      {/* p. 202: "Distinguish the generated answer from quoted source material." */}
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
      {cited.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-blue-950 mb-2">Sources</h3>
          <ol className="list-none p-0 m-0 flex flex-col gap-2">
            {cited.map((s) => {
              const date = formatSourceDate(s.date, s.dateVerified);
              return (
                <li key={s.n} id={`answer-source-${s.n}`} className="text-sm text-blue-950">
                  [{s.n}]{' '}
                  <Link href={s.url} className="font-semibold underline" dir="auto">
                    {s.title}
                  </Link>
                  {' '}- {s.category}
                  {date && <>, <time dateTime={s.date ?? undefined}>{date}</time></>}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
