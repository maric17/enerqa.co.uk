import { publishableOnly } from '../core/provenance';
import type { ResearchItem } from '../core/types';
import { fetchOpenAlexWorks } from './openalex';
import { fetchDoajArticles } from './doaj';
import { fetchGbifLiterature } from './gbifLiterature';
import { fetchOstiRecords } from './osti';
import { fetchReliefWebReports } from './reliefweb';

export type { ResearchItem } from '../core/types';
export { fetchIssuerFilings, DEFAULT_WATCHLIST } from './secEdgar';

/**
 * One entry point for "Research and Official Updates" (handoff p. 212 onward).
 *
 * Same shape as the news aggregator: several providers, one shared cache, a
 * single gate on the way out. A provider that is disabled, unconfigured or
 * unreachable contributes nothing and costs nothing - it does not fail the
 * batch and it never produces a placeholder.
 */

export type ResearchResult = {
  items: ResearchItem[];
  /** Providers that actually contributed a displayed item. */
  sources: { id: string; name: string }[];
  /**
   * Providers that were asked but returned nothing, with the reason. Useful in
   * the server log and for an honest "some sources unavailable" note; never a
   * reason to invent a result.
   */
  skipped: { id: string; reason: string; message: string }[];
  retrievedAt: string;
  unavailable: boolean;
};

/** DOI is the strongest identity; fall back to the destination URL. */
function dedupeKey(item: ResearchItem): string {
  if (item.doi) return item.doi.toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, '');
  return item.readUrl.split('?')[0].toLowerCase();
}

/**
 * Preference when the same paper arrives from two indexes. DOAJ and GBIF state
 * peer-review status and carry an abstract, so their copy is the richer one.
 */
const DEDUPE_PRIORITY: Record<string, number> = {
  doaj: 0,
  'gbif-literature': 1,
  openalex: 2,
  osti: 3,
  reliefweb: 4,
  'sec-edgar': 5,
};

export async function fetchResearch(options: {
  search: string;
  limit?: number;
  /** Include humanitarian reports. Off by default - p. 214 warns it is not a policy feed. */
  includeReports?: boolean;
}): Promise<ResearchResult> {
  const { search, limit = 6, includeReports = false } = options;

  const results = await Promise.all([
    fetchOpenAlexWorks({ search, perPage: limit }),
    fetchDoajArticles({ search, pageSize: limit }),
    fetchGbifLiterature({ search, limit }),
    fetchOstiRecords({ search, rows: limit }),
    includeReports
      ? fetchReliefWebReports({ query: search, limit })
      : Promise.resolve({ ok: false as const, providerId: 'reliefweb' as const, reason: 'disabled' as const, message: 'Not requested.' }),
  ]);

  const collected: ResearchItem[] = [];
  const skipped: ResearchResult['skipped'] = [];

  for (const result of results) {
    if (result.ok) collected.push(...result.data);
    else skipped.push({ id: result.providerId, reason: result.reason, message: result.message });
  }

  // p. 227: only verified_open records publish.
  const publishable = publishableOnly(collected);

  // Sort by richness first so dedupe keeps the better copy, then dedupe, then
  // present newest first.
  const deduped = new Map<string, ResearchItem>();
  for (const item of [...publishable].sort(
    (a, b) => (DEDUPE_PRIORITY[a.provenance.providerId] ?? 9) - (DEDUPE_PRIORITY[b.provenance.providerId] ?? 9),
  )) {
    const key = dedupeKey(item);
    if (!deduped.has(key)) deduped.set(key, item);
  }

  const items = [...deduped.values()]
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
    .slice(0, limit);

  const sources = [...new Set(items.map((i) => i.provenance.providerId))].map((id) => ({
    id,
    name: items.find((i) => i.provenance.providerId === id)!.provenance.providerName,
  }));

  return {
    items,
    sources,
    skipped,
    retrievedAt: new Date().toISOString(),
    unavailable: items.length === 0,
  };
}
