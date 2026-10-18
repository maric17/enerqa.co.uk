/**
 * K03 "Find a Publication" (p. 155): search, ordering and pagination for the
 * Enerqa Publication collection.
 *
 * Pure functions, so the behaviour is testable without a database or a
 * browser. Word handling is shared with the site search (/search), so
 * "emissions" finds "emission" and "hydro" finds "hydrogen" in both places.
 *
 * p. 155: "K03 uses first-party CMS search across titles, approved article
 * text, summaries and tags." The server flattens each article into
 * `searchText` - its distinct words only - so the browser can search the full
 * text without receiving the rich-text bodies (~91 KB of words for 25
 * articles, against 2.76 MB of rich text before).
 */
import { normalise, termMatches, words } from '../search/searchIndex';
import type { PublicationImage } from '@/components/publications/publicationImage';

/** Results per page (p. 155: "pagination below results"). */
export const PER_PAGE = 10;

/**
 * What the browser receives for each publication: the K04 card fields and the
 * flattened search words, never the rich-text body. Kept here rather than in
 * the client component so the server page can import it too.
 */
export type PublicationCard = {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string | null;
  author: string | null;
  date: string | null;
  dateVerified: boolean;
  type: string | null;
  language: string | null;
  archiveCategory: string | null;
  fileUrl: string | null;
  image: PublicationImage | null;
  domains: { slug: string; title: string }[];
  industries: { slug: string; title: string }[];
  searchText: string;
};

export const LANGUAGE_LABELS: Record<string, string> = { en: 'English', ar: 'Arabic' };

/** p. 155: the 2024 archive's four categories, kept as optional secondary tags. */
export const ARCHIVE_LABELS: Record<string, string> = {
  'climate-science-and-impacts': 'Climate Science and Impacts',
  'energy-technology-and-finance': 'Energy, Technology and Finance',
  'environment-and-society': 'Environment and Society',
  'frameworks-and-methodologies': 'Frameworks and Methodologies',
};

// Lexical nodes that sit inside a line of text rather than forming a block.
const INLINE = new Set(['text', 'link', 'autolink', 'linebreak', 'tab']);

function collect(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const { type, text, children } = node as { type?: string; text?: unknown; children?: unknown };
  if (type === 'linebreak' || type === 'tab') return ' ';
  if (typeof text === 'string') return text;
  if (!Array.isArray(children)) return '';
  // Runs inside a paragraph keep their own spacing; blocks get a space between them.
  const inline = children.every((c) => INLINE.has((c as { type?: string })?.type ?? ''));
  return children.map(collect).join(inline ? '' : ' ');
}

/** The plain text of a Lexical rich-text node and its children. */
export function lexicalText(node: unknown): string {
  return collect(node).replace(/\s+/g, ' ').trim();
}

/** Every distinct normalised word of the given parts, space-separated. */
export function searchWords(...parts: (string | null | undefined)[]): string {
  const seen = new Set<string>();
  for (const part of parts) if (part) for (const w of words(part)) seen.add(w);
  return [...seen].join(' ');
}

/**
 * 0 when the publication does not match; otherwise a score where higher is
 * more relevant. Every query term must match (extra words narrow the list,
 * as in a catalogue filter), and a term found in the title counts more than
 * one found only in the text.
 */
export function matchPublication(pub: { title: string; searchText: string }, terms: string[]): number {
  if (terms.length === 0) return 1;
  const all = pub.searchText.split(' ');
  const title = words(pub.title);
  let score = 0;
  for (const term of terms) {
    if (termMatches(term, title)) score += 3;
    else if (termMatches(term, all)) score += 1;
    else return 0;
  }
  return score;
}

// ---- K03 facets --------------------------------------------------------------

/** Sidebar filters. Authors remain publication bylines and searchable text. */
export type FacetKey = 'archiveCategory' | 'domain' | 'industry' | 'type' | 'year' | 'language';
export const FACET_KEYS: FacetKey[] = ['archiveCategory', 'domain', 'industry', 'type', 'year', 'language'];
export type Selection = Record<FacetKey, string[]>;
export const EMPTY_SELECTION: Selection = {
  archiveCategory: [], domain: [], industry: [], type: [], year: [], language: [],
};

type Facetable = Pick<PublicationCard, 'date' | 'archiveCategory' | 'type' | 'language' | 'domains' | 'industries'>;

/** A publication's values for one facet (a list, because it can carry several domains or industries). */
export function facetValues(pub: Facetable, key: FacetKey): string[] {
  // UTC, like the card date, so the Year facet and the printed date always agree.
  if (key === 'year') return pub.date ? [String(new Date(pub.date).getUTCFullYear())] : [];
  if (key === 'domain') return pub.domains.map((d) => d.slug);
  if (key === 'industry') return pub.industries.map((i) => i.slug);
  const value = pub[key];
  return value ? [value] : [];
}

/**
 * Selected values are alternatives within a facet (OR) and combine across
 * facets (AND). `except` leaves one facet out, for counting that facet's options.
 */
export function matchesFacets(pub: Facetable, selected: Selection, except?: FacetKey): boolean {
  return FACET_KEYS.every(
    (key) => key === except || selected[key].length === 0 || facetValues(pub, key).some((v) => selected[key].includes(v)),
  );
}

/**
 * How many results each filter option would give, with the current search and
 * the other facets' selections applied. A facet's own selection is left out
 * because its options are alternatives: ticking 2024 must not make 2022 look
 * empty. Options that would give 0 can then be disabled, so a filter never
 * leads to an empty list.
 */
export function facetCounts(
  pubs: (Facetable & { title: string; searchText: string })[],
  terms: string[],
  selected: Selection,
): Record<FacetKey, Map<string, number>> {
  const found = pubs.filter((p) => matchPublication(p, terms) > 0);
  const out = {} as Record<FacetKey, Map<string, number>>;
  for (const key of FACET_KEYS) {
    const counts = new Map<string, number>();
    for (const pub of found) {
      if (!matchesFacets(pub, selected, key)) continue;
      for (const v of facetValues(pub, key)) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    out[key] = counts;
  }
  return out;
}

type Dated = { title: string; date?: string | null; dateVerified?: boolean | null };

/**
 * Newest verified date first, then the records whose date is still a
 * placeholder (p. 226: an unverified date must not be presented as verified,
 * so it must not make an article look like the newest either).
 */
export function sortByDate<T extends Dated>(items: T[]): T[] {
  const time = (d?: string | null) => (d ? new Date(d).getTime() : 0);
  return [...items].sort(
    (a, b) =>
      Number(Boolean(b.dateVerified)) - Number(Boolean(a.dateVerified)) ||
      time(b.date) - time(a.date) ||
      normalise(a.title).localeCompare(normalise(b.title)),
  );
}

/** One page of results. Out-of-range pages are clamped, and there is always at least one page. */
export function paginate<T>(items: T[], page: number, perPage: number): { items: T[]; page: number; pageCount: number } {
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  return { items: items.slice((current - 1) * perPage, current * perPage), page: current, pageCount };
}
