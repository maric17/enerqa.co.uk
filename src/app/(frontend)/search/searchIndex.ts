/**
 * Keyword matching for /search (AI03, p. 202; index rules, p. 227).
 *
 * Pure functions only - the page loads the records, this ranks them - so the
 * behaviour p. 227 asks to test (general, project, ambiguous and Arabic
 * queries) can be tested without a database.
 *
 * Matching is by term, not by whole phrase: the spec's own chip "What does ESG
 * readiness involve?" used to return nothing because no record contains that
 * exact sentence.
 */

/** p. 202 AI01 and AI04 wording, verbatim. */
export const SEARCH_COPY = {
  placeholder: 'Ask a question or explore a topic.',
  loading: 'Searching for relevant information.',
  // Rendered with "explore our domains" as a link to /domains-and-industries.
  empty: 'No relevant Enerqa content was found; try another query or explore our domains.',
  failure: 'Search is temporarily unavailable; use site navigation or keyword search.',
} as const;

// p. 202 AI03: "Group internal results as Domains and Work Areas; Enerqa
// Publication; Data; Tools."
export type SearchGroup = 'domains' | 'publications' | 'data' | 'tools';

export const GROUP_ORDER: SearchGroup[] = ['domains', 'publications', 'data', 'tools'];

export const GROUP_HEADINGS: Record<SearchGroup, string> = {
  domains: 'Domains and Work Areas',
  publications: 'Enerqa Publication',
  data: 'Data',
  tools: 'Tools',
};

export type IndexEntry = {
  title: string;
  /** Canonical destination (p. 202: "the canonical destination"). */
  url: string;
  group: SearchGroup;
  /** Shown on the result, e.g. "Capability", "Dataset" (p. 227: category). */
  category: string;
  /** Short text shown on the result and matched against. */
  excerpt?: string;
  /** Extra text that is matched but not shown. */
  body?: string;
  /** Source date, ISO string, when the record has one. */
  date?: string | null;
  /** False when the date is a known placeholder (p. 226). */
  dateVerified?: boolean;
};

export type SearchHit = IndexEntry & {
  score: number;
  /** Query terms this entry matched, in query order. */
  matched: string[];
};

// Question words and fillers that say nothing about the topic.
const STOPWORDS = new Set([
  'a', 'about', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'by', 'can', 'could', 'do', 'does', 'for',
  'from', 'has', 'have', 'how', 'i', 'in', 'into', 'is', 'it', 'its', 'me', 'my', 'of', 'on', 'or',
  'our', 'should', 'so', 'tell', 'that', 'the', 'their', 'there', 'this', 'to', 'us', 'was', 'we',
  'what', 'when', 'where', 'which', 'who', 'why', 'will', 'with', 'would', 'you', 'your',
  'explore', 'find', 'show',
  // Arabic particles and question words.
  'في', 'من', 'على', 'إلى', 'الى', 'عن', 'ما', 'ماذا', 'كيف', 'هل', 'أو', 'او', 'و', 'مع', 'هذا', 'هذه',
  'هي', 'هو', 'ان', 'التي', 'الذي',
]);

const MAX_TERMS = 12;

/**
 * Lower-cases and folds the variants that make identical words compare
 * unequal: NFKC forms, Arabic diacritics and tatweel, and the hamza forms of
 * alef.
 */
export function normalise(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآ]/g, 'ا');
}

export function words(text: string): string[] {
  return normalise(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

const LATIN = /^[a-z0-9]+$/;

/**
 * A light English stemmer: enough that "projects", "financing", "finance" and
 * "industries" meet "project", "financial" and "industry" (terms match word
 * starts, so "financ" finds all three). Non-Latin terms are left alone.
 */
export function stem(term: string): string {
  if (!LATIN.test(term)) return term;
  for (const suffix of ['ies', 'ing', 'ed', 'es', 's', 'e']) {
    if (term.endsWith(suffix) && term.length - suffix.length >= 4) return term.slice(0, -suffix.length);
  }
  return term;
}

/**
 * The distinct, meaningful terms of a query, stemmed. "Enerqa" appears in
 * almost every record, so it only counts when it is the whole query.
 */
export function queryTerms(query: string): string[] {
  const out: string[] = [];
  for (const w of words(query)) {
    if (w.length < 2 || STOPWORDS.has(w)) continue;
    const s = stem(w);
    if (!out.includes(s)) out.push(s);
    if (out.length >= MAX_TERMS) break;
  }
  const withoutName = out.filter((t) => t !== 'enerqa');
  return withoutName.length ? withoutName : out;
}

/**
 * Latin terms match the start of a word ("financ" -> "financial"), which
 * avoids hits inside unrelated words. Arabic attaches prefixes such as "و"
 * and "ال" to the word itself, so Arabic terms match anywhere in a word.
 */
export function termMatches(term: string, docWords: string[]): boolean {
  if (LATIN.test(term)) return docWords.some((w) => w.startsWith(term));
  return docWords.some((w) => w.includes(term));
}

/** Scores one entry: a title hit is worth more than a hit in the text. */
export function scoreEntry(entry: IndexEntry, terms: string[]): SearchHit {
  const titleWords = words(entry.title);
  const textWords = words([entry.category, entry.excerpt ?? '', entry.body ?? ''].join(' '));
  let score = 0;
  const matched: string[] = [];
  for (const term of terms) {
    if (termMatches(term, titleWords)) {
      score += 3;
      matched.push(term);
    } else if (termMatches(term, textWords)) {
      score += 1;
      matched.push(term);
    }
  }
  return { ...entry, score, matched };
}

/**
 * Ranks the index for a query. A one- or two-term query must match every term;
 * a longer one at least two. So one incidental word does not pull in the site:
 * "What is the capital of France?" used to list every page that mentions
 * "natural capital" or "capital costs" (pp. 13, 227: no forced Enerqa results).
 */
export function searchIndex(entries: IndexEntry[], query: string): SearchHit[] {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];
  const minMatches = Math.min(terms.length, 2);

  return entries
    .map((e) => scoreEntry(e, terms))
    .filter((h) => h.matched.length >= minMatches)
    .sort((a, b) => b.matched.length - a.matched.length || b.score - a.score || a.title.localeCompare(b.title));
}

/** Groups ranked hits in p. 202 order, keeping at most `perGroup` in each. */
export function groupHits(hits: SearchHit[], perGroup = 5): { group: SearchGroup; heading: string; hits: SearchHit[] }[] {
  return GROUP_ORDER.map((group) => ({
    group,
    heading: GROUP_HEADINGS[group],
    hits: hits.filter((h) => h.group === group).slice(0, perGroup),
  })).filter((g) => g.hits.length > 0);
}

/**
 * p. 202: "Show a short relevant excerpt". Returns a window of the text around
 * the first matched term, or the opening of the text when none is found.
 */
export function excerptFor(text: string | undefined, terms: string[], maxLength = 220): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;

  // toLowerCase keeps string positions aligned with `clean` (normalise can
  // drop characters), so the slice below lands on the match.
  const lower = clean.toLowerCase();
  let at = -1;
  for (const term of terms) {
    const i = lower.indexOf(term);
    if (i !== -1 && (at === -1 || i < at)) at = i;
  }
  if (at === -1 || at < maxLength / 2) return `${clean.slice(0, maxLength).trimEnd()}…`;

  // Start at a word boundary a little before the match.
  let start = clean.lastIndexOf(' ', Math.max(0, at - Math.floor(maxLength / 3)));
  start = start === -1 ? 0 : start + 1;
  const slice = clean.slice(start, start + maxLength).trimEnd();
  return `…${slice}${start + maxLength < clean.length ? '…' : ''}`;
}

/** Placeholder excerpts from the 2024 import that say nothing about the record. */
const PLACEHOLDER_EXCERPTS = ['could not extract content automatically.'];

export function usableText(text: string | null | undefined): string | undefined {
  const t = text?.trim();
  if (!t || PLACEHOLDER_EXCERPTS.includes(t.toLowerCase())) return undefined;
  return t;
}

/** Reads the `q` search param safely: first value, trimmed, length-capped. */
export function readQuery(q: string | string[] | undefined): string {
  const v = Array.isArray(q) ? q[0] : q;
  return (v ?? '').trim().slice(0, 300);
}

export type SearchOutcome =
  | { status: 'failed' }
  | { status: 'ok'; terms: string[]; hits: SearchHit[]; groups: ReturnType<typeof groupHits> };

/**
 * Loads the index and runs the query. A load failure becomes an explicit
 * `failed` outcome rather than a thrown error, so the page shows the AI04
 * failure state (p. 202: "Do not invent an answer when source retrieval
 * fails") instead of an error page or an empty-looking result.
 */
export async function runSearch(query: string, load: () => Promise<IndexEntry[]>): Promise<SearchOutcome> {
  let entries: IndexEntry[];
  try {
    entries = await load();
  } catch (error) {
    console.error('Search index unavailable:', error);
    return { status: 'failed' };
  }
  const hits = searchIndex(entries, query);
  return { status: 'ok', terms: queryTerms(query), hits, groups: groupHits(hits) };
}

/**
 * p. 202: citations and results show source dates. A placeholder date
 * (`dateVerified: false`, p. 226) is not shown as if it were real.
 */
export function formatSourceDate(date: string | null | undefined, dateVerified?: boolean): string | undefined {
  if (!date || dateVerified === false) return undefined;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
