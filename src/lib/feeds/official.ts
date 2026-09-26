import { fetchOfficialNews, isNewsItemStale, type NewsItem } from '@/lib/api/news';
import {
  fetchIssuerFilings,
  fetchResearchForThemes,
  isFutureDate,
  isOnTheme,
  type ResearchProvider,
  type TaggedResearchItem,
} from '@/lib/api/research';
import { isStale } from '@/lib/api/core/provenance';
import { firstVerified } from '@/lib/api/core/accessCheck';
import type { RegionKey } from '@/lib/api/news/geography';
import type { DomainFeed, SpecialistFeed } from './contextual';

/**
 * CP / EP / NP / BP - the official-updates module on each domain page - and the
 * specialist half of I{nn}R on each industry page.
 *
 * p. 29: "Follow original-source reports and updates relevant to this domain,
 * with their organisation, document type and publication date clearly
 * identified." So every item is normalised to exactly those three facts plus a
 * link to the original document.
 *
 * Which providers feed a page is the page's own "Specialist feeds for ..." line
 * (pp. 30, 38, 49, 60 and 66-138), held in contextual.ts. Nothing here picks a
 * provider by domain name any more.
 */
export type OfficialUpdate = {
  id: string;
  title: string;
  url: string;
  /**
   * The issuing organisation as the provider states it. Null when it does not
   * say - never the provider's own name ("GBIF Literature API") and never a
   * document type ("Journal Article").
   */
  organisation: string | null;
  docType: string;
  publishedAt: string | null;
  retrievedAt: string;
  /** Provider attribution for this item. */
  sourceLabel: string;
  feed: SpecialistFeed;
  /** Coverage geography from the item's own text (p. 179); empty when none is named. */
  coverage: RegionKey[];
  /**
   * The source's own geographic focus, where the spec says to label it:
   * p. 216 EEA "transparently labelled Europe-focused".
   */
  focus: string | null;
  /** Passed the anonymous access check of its destination (pp. 209, 227). */
  verifiedOpen: boolean;
  /** When that check ran, or null when it has not. */
  accessCheckedAt: string | null;
  stale: boolean;
  authors: string[];
  doi: string | null;
  peerReviewed: boolean | null;
};

export type OfficialResult = {
  items: OfficialUpdate[];
  /** Who supplied the displayed items, for the attribution line. */
  sources: string[];
  /** Nothing answered at all - show the unavailable state, not "no updates". */
  sourcesFailed: boolean;
  /** Oldest retrieval time among displayed items (p. 226: show their age). */
  retrievedAt: string | null;
  /** A displayed item is older than its provider's refresh interval (p. 227). */
  stale: boolean;
};

/** What one specialist feed contributed. `failed` means asked and unreachable. */
type FeedBatch = { items: OfficialUpdate[]; failed: boolean };

const SOURCE_LABEL: Record<SpecialistFeed, string> = {
  eia_rss: 'U.S. EIA Today in Energy',
  eea_rss: 'European Environment Agency',
  osti: 'DOE OSTI.GOV',
  gbif_literature: 'GBIF literature',
  reliefweb: 'ReliefWeb',
  sec_edgar: 'SEC EDGAR',
};

/** The keyword-search connectors, by their specialist-feed spelling. */
const RESEARCH_PROVIDER: Partial<Record<SpecialistFeed, ResearchProvider>> = {
  osti: 'osti',
  gbif_literature: 'gbif-literature',
  reliefweb: 'reliefweb',
};

function placeCoverage(regions: readonly string[] | undefined): RegionKey[] {
  return (regions ?? []).filter((r): r is RegionKey => r !== 'Not Specified');
}

/**
 * EEA publishes two feeds and labels them itself: newsroom "Press releases",
 * and editorial pieces whose headline starts "Interview —" or "Editorial —".
 * The document type is read from those labels, not guessed.
 */
export function eeaDocType(item: Pick<NewsItem, 'url' | 'title' | 'docType'>): string {
  // The feed's own channel label, where the item came from one of the three
  // directory feeds (news/eeaRss.ts).
  if (item.docType) return item.docType;
  if (item.url.includes('/newsroom/news/')) return 'Press release';
  if (item.url.includes('/analysis/publications/')) return 'Publication';
  const prefix = item.title.match(/^(Interview|Editorial)\s+[—–-]\s+/);
  return prefix ? prefix[1] : 'Editorial';
}

function fromNews(item: NewsItem, feed: 'eia_rss' | 'eea_rss'): OfficialUpdate {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    organisation: item.publisher,
    // p. 214: "Label as official energy analysis".
    docType: feed === 'eia_rss' ? 'Official energy analysis' : eeaDocType(item),
    publishedAt: item.publishedAt,
    retrievedAt: item.retrievedAt,
    sourceLabel: SOURCE_LABEL[feed],
    feed,
    // p. 214 / p. 216: EIA's U.S./international and EEA's European coverage
    // are shown, not implied.
    coverage: placeCoverage(item.regions),
    focus: feed === 'eea_rss' ? 'Europe-focused source' : null,
    // Decided by the access check in fetchSpecialistUpdates.
    verifiedOpen: false,
    accessCheckedAt: null,
    stale: isNewsItemStale(item),
    authors: [],
    doi: null,
    peerReviewed: null,
  };
}

/** Document type when the connector does not state one. Never "Technical report" by default. */
const KIND_DOC_TYPE: Record<TaggedResearchItem['kind'], string> = {
  research: 'Research',
  report: 'Report',
  disclosure: 'Corporate disclosure',
};

function fromResearch(item: TaggedResearchItem, feed: SpecialistFeed): OfficialUpdate {
  return {
    id: item.id,
    title: item.title,
    url: item.readUrl,
    // OSTI used to put its product type here ("Journal Article") and GBIF its
    // own API name; the connectors now return `organisation` separately.
    organisation: item.organisation ?? null,
    docType: item.docType ?? (item.preprint ? 'Preprint' : KIND_DOC_TYPE[item.kind]),
    publishedAt: item.publishedAt,
    retrievedAt: item.provenance.retrievedAt,
    sourceLabel: SOURCE_LABEL[feed],
    feed,
    coverage: placeCoverage(item.regions),
    focus: null,
    verifiedOpen: item.provenance.accessStatus === 'verified_open',
    accessCheckedAt: item.provenance.accessCheckedAt,
    stale: isStale(item.provenance),
    authors: item.authors,
    doi: item.doi,
    peerReviewed: item.peerReviewed,
  };
}

async function officialRss(feed: 'eia_rss' | 'eea_rss', themes: string[]): Promise<FeedBatch> {
  // EIA is checked against Energy, EEA against Environment and Nature - their
  // own subjects - and then against this page's research themes (p. 226).
  const result = await fetchOfficialNews(feed, feed === 'eia_rss' ? 'energy' : 'environment');
  const items = result.items
    .filter((item) => themes.length === 0 || themes.some((theme) => isOnTheme(item, theme)))
    .map((item) => fromNews(item, feed));
  return { items, failed: result.sourcesFailed };
}

async function keywordFeed(feed: SpecialistFeed, provider: ResearchProvider, themes: string[], limit: number): Promise<FeedBatch> {
  // The same gate as "Research and Articles": verified open, no future date,
  // on the page's themes, tagged with coverage geography.
  const result = await fetchResearchForThemes(themes, limit, { providers: [provider] });
  // `sourcesFailed` already treats "off by design" (ReliefWeb until its appname
  // is registered) as not asked, rather than as an outage.
  return { items: result.items.map((item) => fromResearch(item, feed)), failed: result.sourcesFailed };
}

async function secFilings(limit: number): Promise<FeedBatch> {
  // p. 217: a selected-issuer disclosure feed, "not general keyword ESG
  // search", so there is no theme filter to apply - the watchlist is the
  // selection. p. 59: "Identify issuer, form and filing date". The connector
  // labels each filing "Corporate disclosure, Form ..." (p. 217); access is
  // checked with the other candidates below.
  const result = await fetchIssuerFilings({ perIssuer: 1 });
  if (!result.ok) return { items: [], failed: result.reason === 'unavailable' || result.reason === 'rate_limited' };
  const items = result.data
    .filter((item) => !isFutureDate(item.publishedAt))
    .slice(0, limit * 2)
    .map((item) => fromResearch({ ...item, regions: [] }, 'sec_edgar'));
  return { items, failed: false };
}

function fetchFeed(feed: SpecialistFeed, themes: string[], limit: number): Promise<FeedBatch> {
  if (feed === 'eia_rss' || feed === 'eea_rss') return officialRss(feed, themes);
  if (feed === 'sec_edgar') return secFilings(limit);
  return keywordFeed(feed, RESEARCH_PROVIDER[feed]!, themes, limit);
}

const byNewest = (a: OfficialUpdate, b: OfficialUpdate) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');

/**
 * Take items in turn from each feed, newest first within a feed, so one busy
 * feed cannot fill the module alone: on EP, p. 37 asks for EIA analysis AND
 * OSTI research, and newest-first across both used to show only one of them.
 * Returns the whole interleaved order; the caller cuts it to size after the
 * access check.
 */
export function interleaveFeeds(batches: OfficialUpdate[][], limit = Infinity): OfficialUpdate[] {
  const queues = batches.map((b) => [...b].filter((i) => !isFutureDate(i.publishedAt)).sort(byNewest));
  const seen = new Set<string>();
  const out: OfficialUpdate[] = [];
  while (out.length < limit && queues.some((q) => q.length > 0)) {
    for (const q of queues) {
      const next = q.shift();
      if (!next || out.length >= limit) continue;
      const key = next.url.split('#')[0].toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(next);
    }
  }
  return out;
}

export async function fetchSpecialistUpdates(options: {
  feeds: SpecialistFeed[];
  themes: string[];
  limit?: number;
}): Promise<OfficialResult> {
  const { feeds, themes, limit = 3 } = options;
  const batches = await Promise.all(feeds.map((feed) => fetchFeed(feed, themes, limit)));

  // pp. 209, 227: only destinations that pass the anonymous check publish.
  // The interleaved order is walked until `limit` have passed, so the check
  // only ever runs on items that could be displayed. The research feeds were
  // already checked upstream; their verdicts come back from the cache.
  const passed = await firstVerified(interleaveFeeds(batches.map((b) => b.items)), { url: (i) => i.url, limit });
  const shown = passed
    .map(({ item, verdict }) => ({ ...item, verifiedOpen: true, accessCheckedAt: verdict.checkedAt }))
    .sort(byNewest);
  const times = shown.map((i) => i.retrievedAt).sort();

  return {
    items: shown,
    // Credit only the sources that actually made it into the displayed items.
    sources: [...new Set(shown.map((i) => i.sourceLabel))],
    // p. 226: "unavailable" only when every feed was asked and failed.
    sourcesFailed: batches.length > 0 && batches.every((b) => b.failed),
    retrievedAt: times[0] ?? null,
    stale: shown.some((i) => i.stale),
  };
}

export function fetchOfficialUpdates(feed: DomainFeed, limit = 3): Promise<OfficialResult> {
  return fetchSpecialistUpdates({ feeds: feed.specialistFeeds, themes: feed.researchThemes, limit });
}
