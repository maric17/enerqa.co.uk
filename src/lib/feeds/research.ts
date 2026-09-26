import { fetchResearchForThemes, type TaggedResearchItem } from '@/lib/api/research';
import { isStale } from '@/lib/api/core/provenance';
import { fetchSpecialistUpdates, type OfficialUpdate } from './official';
import type { SpecialistFeed } from './contextual';

/**
 * CR/ER/NR/BR "Research and Articles" and I{nn}R "Research and Official
 * Updates", as one list of cards.
 *
 *  - Domains (pp. 28, 37, 48, 59): "OpenAlex with is_oa:true first, DOAJ
 *    supplementary". Nothing else.
 *  - Industries (p. 65): "OpenAlex/DOAJ shared scholarly sources plus the
 *    specialist sources identified in the industry mapping. Official reports
 *    and corporate disclosures remain separate labels." So the scholarly
 *    records come first, the page's specialist feeds follow, and every card is
 *    labelled with what it is.
 */
export type ResearchCard = {
  id: string;
  url: string;
  /** What the record is: "Research", "Preprint", "Report", "Corporate disclosure", "Official energy analysis"... */
  label: string;
  /** Journal, publisher or issuing organisation, as the provider states it. */
  source: string | null;
  title: string;
  authors: string[];
  publishedAt: string | null;
  doi: string | null;
  peerReviewed: boolean | null;
  /** Licence of the linked copy, as the provider states it (p. 212 "licence ... labels"). */
  licence: string | null;
  /** Which manuscript the linked copy is (p. 212 "version ... labels"). */
  version: string | null;
  /** Passed the anonymous access check of its destination, so the "Open access" badge states a fact. */
  openAccess: boolean;
  /** A scholarly record (OpenAlex / DOAJ) rather than a specialist feed item. */
  scholarly: boolean;
  sourceLabel: string;
  retrievedAt: string;
  stale: boolean;
};

export type ResearchCards = {
  cards: ResearchCard[];
  sources: string[];
  retrievedAt: string | null;
  sourcesFailed: boolean;
  stale: boolean;
};

/** p. 28: "Separate journal research, reports and unreviewed preprints." The connector's own fields decide. */
export function researchLabel(item: Pick<TaggedResearchItem, 'kind' | 'preprint'>): string {
  if (item.kind === 'disclosure') return 'Corporate disclosure';
  if (item.kind === 'report') return 'Report';
  return item.preprint ? 'Preprint' : 'Research';
}

export function cardFromResearch(item: TaggedResearchItem): ResearchCard {
  return {
    id: item.id,
    url: item.readUrl,
    label: researchLabel(item),
    source: item.source,
    title: item.title,
    authors: item.authors,
    publishedAt: item.publishedAt,
    doi: item.doi,
    peerReviewed: item.peerReviewed,
    licence: item.articleLicence ?? null,
    version: item.articleVersion ?? null,
    openAccess: item.provenance.accessStatus === 'verified_open',
    scholarly: true,
    sourceLabel: item.provenance.providerName,
    retrievedAt: item.provenance.retrievedAt,
    stale: isStale(item.provenance),
  };
}

export function cardFromOfficial(item: OfficialUpdate): ResearchCard {
  return {
    id: item.id,
    url: item.url,
    label: item.docType,
    source: item.organisation,
    title: item.title,
    authors: item.authors,
    publishedAt: item.publishedAt,
    doi: item.doi,
    peerReviewed: item.peerReviewed,
    licence: null,
    version: null,
    openAccess: item.verifiedOpen,
    scholarly: false,
    sourceLabel: item.sourceLabel,
    retrievedAt: item.retrievedAt,
    stale: item.stale,
  };
}

/**
 * Scholarly first, specialist after - but "plus" the specialist sources means
 * they must actually appear: with OpenAlex usually able to fill every slot on
 * its own, a plain "scholarly first" list would never show one. So up to
 * `reserve` slots are kept for specialist items when there are any, and either
 * side fills the other's unused slots.
 */
export function blendSpecialist(
  scholarly: ResearchCard[],
  specialist: ResearchCard[],
  limit: number,
  reserve = Math.min(2, Math.floor(limit / 2)),
): ResearchCard[] {
  const specialistSlots = Math.min(specialist.length, reserve);
  const fromScholarly = scholarly.slice(0, limit - specialistSlots);
  const fromSpecialist = specialist.slice(0, limit - fromScholarly.length);
  const seen = new Set<string>();
  return [...fromScholarly, ...fromSpecialist].filter((card) => {
    const key = (card.doi ?? card.url).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchResearchCards(options: {
  themes: string[];
  limit?: number;
  /** I{nn}R only. Domains pass nothing: their research module is OpenAlex and DOAJ alone. */
  specialistFeeds?: SpecialistFeed[];
}): Promise<ResearchCards> {
  const { themes, limit = 4, specialistFeeds = [] } = options;

  const [scholarly, specialist] = await Promise.all([
    fetchResearchForThemes(themes, limit),
    specialistFeeds.length > 0 ? fetchSpecialistUpdates({ feeds: specialistFeeds, themes, limit }) : null,
  ]);

  const cards = blendSpecialist(
    scholarly.items.map(cardFromResearch),
    (specialist?.items ?? []).map(cardFromOfficial),
    limit,
  );

  const times = cards.map((c) => c.retrievedAt).sort();
  return {
    cards,
    sources: [...new Set(cards.map((c) => c.sourceLabel))],
    retrievedAt: times[0] ?? null,
    sourcesFailed: scholarly.sourcesFailed && (specialist ? specialist.sourcesFailed : true),
    stale: cards.some((c) => c.stale),
  };
}
