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
