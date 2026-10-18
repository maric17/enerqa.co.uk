import { getProvider, providerEnabled } from '@/lib/api/core/registry';
import { createRateLimiter } from '@/lib/forms/rateLimit';
import type { SearchHit } from './searchIndex';

/**
 * Gate, quota guard and prompt for the AI02 generated answer (p. 202).
 *
 * p. 13 / p. 224: inference must stay inside a free corporate-use allowance,
 * with "a conservative internal hard budget" and no paid fallback; exhaustion
 * "falls back to keyword results and an honest status". p. 224 also says the
 * provider's licence, privacy and input handling "must pass review before
 * enabling inference". So answers are OFF unless the provider registry's
 * `gemini` row is enabled AND reviewed (`providerEnabled`) AND its key is set.
 * Today the row is disabled, so the page shows the AI04 failure state and the
 * keyword results.
 */

/** Env var for the key when the registry row does not name one. */
const DEFAULT_KEY_ENV = 'GEMINI_API_KEY';

export function aiApiKey(env: Record<string, string | undefined> = process.env): string | undefined {
  return env[getProvider('gemini')?.keyEnvVar ?? DEFAULT_KEY_ENV] || undefined;
}

/** `providerOn` is injectable so the rule can be tested with the switch either way. */
export function aiAnswersEnabled(
  env: Record<string, string | undefined> = process.env,
  providerOn: boolean = providerEnabled('gemini'),
): boolean {
  return providerOn && Boolean(aiApiKey(env));
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Internal budget, deliberately far below any published free tier. Confirm
 * against the provider's current free limits when the provider is approved.
 * The real hard stop is a key from a project with billing disabled: these
 * in-memory counts are per server instance (see rateLimit.ts).
 */
export const AI_BUDGET = { perDay: 100, perMinute: 4, perVisitorPerHour: 10 };

export function createAiQuota(budget = AI_BUDGET) {
  const day = createRateLimiter({ limit: budget.perDay, windowMs: DAY });
  const minute = createRateLimiter({ limit: budget.perMinute, windowMs: MINUTE });
  const visitor = createRateLimiter({ limit: budget.perVisitorPerHour, windowMs: HOUR });
  return {
    /** True (and counted) only when every budget still has room. */
    tryConsume(visitorKey: string, now: number = Date.now()): boolean {
      if (!day.peek('all', now).allowed || !minute.peek('all', now).allowed || !visitor.peek(visitorKey, now).allowed) {
        return false;
      }
      day.consume('all', now);
      minute.consume('all', now);
      visitor.consume(visitorKey, now);
      return true;
    },
  };
}

/** One shared guard per server process. */
export const aiQuota = createAiQuota();

/** How many keyword hits are offered to the model as citable records. */
export const MAX_AI_SOURCES = 8;

/** Numbers the top keyword hits [1]..[n] so the answer can cite them. */
export function toAiSources(hits: SearchHit[], max = MAX_AI_SOURCES): AiSource[] {
  return hits.slice(0, max).map((h, i) => ({
    n: i + 1,
    title: h.title,
    url: h.url,
    category: h.category,
    excerpt: h.excerpt,
    date: h.date ?? null,
    dateVerified: h.dateVerified,
  }));
}

export type AiSource = {
  n: number;
  title: string;
  url: string;
  category: string;
  excerpt?: string;
  /** p. 202: citations show source dates, where the record has one. */
  date?: string | null;
  dateVerified?: boolean;
};

// p. 169 A01 - the approved description. The old prompt called Enerqa "a data
// analytics firm", which it is not.
const ENERQA_DESCRIPTION =
  'Enerqa is a multidisciplinary project-development and consultancy company working across climate action and carbon management, energy systems and transition, environment, nature and circularity, and sustainable business, ESG and finance.';

/**
 * pp. 13, 202, 227: a general question may get a general answer; Enerqa
 * content is cited only when it directly helps; nothing about Enerqa's work,
 * credentials or data may be invented; only retrieved records are cited.
 */
export function buildSystemInstruction(sources: AiSource[]): string {
  const records = sources.length
    ? sources.map((s) => `[${s.n}] ${s.title} (${s.category}): ${s.excerpt ?? 'No excerpt.'}`).join('\n')
    : '(No Enerqa records matched this question.)';

  return [
    `You answer questions typed into the search box of the Enerqa website. ${ENERQA_DESCRIPTION}`,
    '',
    'Rules:',
    '1. Answer the question directly. A general question can receive a general answer; do not steer it towards Enerqa or recommend Enerqa unless the question is about Enerqa or its offering.',
    '2. Use the numbered Enerqa records below only where they directly address the question, and cite each record you use as [n]. Never cite a record you did not use, and never cite anything else.',
    '3. Never state or imply anything about Enerqa\'s projects, clients, experience, credentials, team or data beyond what the records say.',
    '4. Do not invent facts, figures, sources, links or dates. If you are unsure, say so briefly.',
    '5. Reply in the language of the question, in plain text without Markdown, in at most about 200 words.',
    '',
    'Enerqa records:',
    records,
  ].join('\n');
}

export type AnswerSegment = { text: string } | { cite: number };

/** Splits an answer into text and [n] citation markers (also "[1, 3]"). */
export function splitCitations(answer: string, maxSource: number): AnswerSegment[] {
  const out: AnswerSegment[] = [];
  const re = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
  let last = 0;
  for (const m of answer.matchAll(re)) {
    const nums = m[1].split(',').map((n) => Number(n.trim()));
    // A number outside the source list is not a real citation: keep it as text.
    if (!nums.every((n) => n >= 1 && n <= maxSource)) continue;
    if (m.index! > last) out.push({ text: answer.slice(last, m.index) });
    for (const n of nums) out.push({ cite: n });
    last = m.index! + m[0].length;
  }
  if (last < answer.length) out.push({ text: answer.slice(last) });
  return out;
}

/** The sources an answer actually cites, in source order. */
export function citedSources(answer: string, sources: AiSource[]): AiSource[] {
  const cited = new Set<number>();
  for (const seg of splitCitations(answer, sources.length)) {
    if ('cite' in seg) cited.add(seg.cite);
  }
  return sources.filter((s) => cited.has(s.n));
}
