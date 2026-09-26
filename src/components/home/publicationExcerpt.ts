/**
 * H08 excerpt gate (p. 14, p. 225 "Clean publication imports").
 *
 * The 2024 archive import filled `excerpt` with raw PDF text: the importer's
 * own failure message, table-of-contents runs ("4. Climate Change and War ...
 * 5. Greenhouse Gases ..."), running headers with page numbers and "By:"
 * bylines. None of that is a teaser. This returns the excerpt only when it
 * reads like one, and null otherwise, so the card shows no excerpt rather than
 * a broken one. Nothing is ever rewritten or generated.
 */
const JUNK_PATTERNS: RegExp[] = [
  /could not extract content/i,
  // PDF layout artefact: runs of 3+ spaces between extracted text blocks.
  /\S {3,}\S/,
  // Table-of-contents entry: starts "2. Title" or contains "... 5. Title".
  /^\s*\d{1,2}\.\s/,
  /\s\d{1,2}\.\s+[A-Z]/,
  // A byline fragment copied from the article header.
  /\bby:\s/i,
];

const normalise = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function usableExcerpt(excerpt: string | null | undefined, title?: string | null): string | null {
  const text = excerpt?.trim();
  if (!text || text.length < 40) return null;
  if (JUNK_PATTERNS.some((pattern) => pattern.test(text))) return null;
  // A running header repeats the title as the first words of the "excerpt".
  if (title && normalise(text).startsWith(normalise(title))) return null;
  return text;
}
