/**
 * Destination rules shared by the research connectors (handoff pp. 212-216).
 *
 * p. 212: "Do not link the generic DOI/publisher page when a vetted repository
 * OA copy is the usable destination."
 *
 * Note the shape of that rule. It is a PREFERENCE, not a ban. A hybrid
 * open-access article often lives only at the publisher, reached through its
 * DOI, and that copy is genuinely free to read - refusing to link it would
 * discard legitimately open research. What the rule forbids is choosing the
 * DOI when a repository copy was available all along.
 *
 * So resolvers sort last rather than being excluded, and p. 216's stricter
 * "exclude records without a verified full-reading URL" is applied where the
 * provider gives us nothing but a resolver.
 */

/** doi.org and dx.doi.org forward to somewhere else; they are not a destination. */
export function isDoiResolver(url: string): boolean {
  try {
    return /^(dx\.)?doi\.org$/i.test(new URL(url).hostname.replace(/^www\./, ''));
  } catch {
    return false;
  }
}

/**
 * Pick a reading destination from candidates in the connector's own order of
 * preference, moving DOI resolvers to the back without dropping them.
 */
export function preferredReadUrl(candidates: (string | null | undefined)[]): string | null {
  const usable = candidates.filter((c): c is string => Boolean(c && c.startsWith('http')));
  if (usable.length === 0) return null;
  return usable.find((c) => !isDoiResolver(c)) ?? usable[0];
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
};

/**
 * Provider titles and abstracts sometimes carry inline markup - OSTI sends
 * "Upgrading Biogas through <em>in situ</em> ..." and OpenAlex "CO<sub>2</sub>".
 * We print text, never provider HTML (a third-party string must not become
 * markup on our page), so tags are removed and entities decoded (L524).
 */
export function stripMarkup(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
      if (code[0] === '#') {
        const n = code[1].toLowerCase() === 'x' ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
        return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : match;
      }
      return ENTITIES[code.toLowerCase()] ?? match;
    })
    .replace(/\s+/g, ' ')
    .trim();
}
