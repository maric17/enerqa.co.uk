import { providerDatabase } from '@/lib/api/core/storage';
import { providerEnabled } from '@/lib/api/core/registry';
import { RECHECK_SECONDS } from '@/lib/api/core/accessCheck';
import { isStale } from '@/lib/api/core/provenance';
import type { ResearchItem, ProviderId } from '@/lib/api/core/types';
import { tagIntelligence, type IntelligenceItem } from './intelligence';

export const RESEARCH_SOURCES = ['openalex', 'doaj', 'osti', 'gbif-literature', 'reliefweb', 'sec-edgar'] as const;
type Row = { provider: string; destination: string; record: unknown; access_status: string;
  access_checked_at: Date | string | null; retrieved_at: Date | string;
  verdict: { status?: string; checkedAt?: string } | null };

/** Use the provider's original metadata, keeping abstracts out of public card responses. */
export function researchIntelligence(item: ResearchItem): IntelligenceItem {
  const sourceId = item.provenance.providerId;
  const card = tagIntelligence({
    id: item.id, title: item.title, summary: item.summary, url: item.readUrl,
    type: item.kind === 'disclosure' ? 'disclosure' : ['osti', 'gbif-literature', 'reliefweb'].includes(sourceId) ? 'official' : 'research',
    publisher: item.organisation ?? item.source ?? item.provenance.providerName,
    source: item.provenance.providerName, sourceId, publishedAt: item.publishedAt,
    retrievedAt: item.provenance.retrievedAt, language: item.language ?? null,
    authors: item.authors, doi: item.doi,
    documentType: item.docType ?? (item.preprint ? 'Preprint (not peer reviewed)' : item.kind),
    verifiedOpen: item.provenance.accessStatus === 'verified_open', stale: isStale(item.provenance),
  });
  return { ...card, summary: null };
}

/** Fail closed on expired checks, newer refusals, malformed records and paused providers. */
export function savedResearchRow(row: Row, now = Date.now()): IntelligenceItem | null {
  if (!RESEARCH_SOURCES.includes(row.provider as typeof RESEARCH_SOURCES[number]) || !providerEnabled(row.provider as ProviderId) || row.access_status !== 'verified_open') return null;
  const item = row.record as ResearchItem | null;
  const checked = row.access_checked_at ? new Date(row.access_checked_at).getTime() : NaN;
  const retrieved = new Date(row.retrieved_at).getTime();
  if (!Number.isFinite(checked) || !Number.isFinite(retrieved) || now - checked > RECHECK_SECONDS * 1000) return null;
  if (row.verdict?.checkedAt && Date.parse(row.verdict.checkedAt) >= checked && row.verdict.status !== 'verified_open') return null;
  if (!item || typeof item.id !== 'string' || typeof item.title !== 'string' || !item.title ||
    typeof item.readUrl !== 'string' || item.readUrl !== row.destination || !/^https?:\/\//.test(item.readUrl) ||
    !['research', 'report', 'disclosure'].includes(item.kind) ||
    !Array.isArray(item.authors) || !item.authors.every(a => typeof a === 'string') ||
    (item.summary !== null && typeof item.summary !== 'string') ||
    (item.publishedAt !== null && (typeof item.publishedAt !== 'string' || !Number.isFinite(Date.parse(item.publishedAt)) || Date.parse(item.publishedAt) > now)) ||
    !item.provenance || item.provenance.providerId !== row.provider || item.provenance.accessStatus !== 'verified_open' ||
    typeof item.provenance.providerName !== 'string') return null;
  return researchIntelligence({ ...item, provenance: { ...item.provenance, retrievedAt: new Date(retrieved).toISOString() } });
}

export async function readSavedResearch() {
  const db = providerDatabase();
  if (!db) return { items: [] as IntelligenceItem[], available: false };
  try {
    const { rows } = await db.query<Row>(`SELECT r.*, a.verdict FROM enerqa_connectors.external_records r
      LEFT JOIN enerqa_connectors.access_checks a ON a.url = r.destination
      WHERE r.provider = ANY($1::text[]) AND r.retrieved_at > clock_timestamp() - interval '60 days'
      ORDER BY r.retrieved_at DESC LIMIT 2000`, [RESEARCH_SOURCES]);
    return { items: rows.flatMap(row => { const item = savedResearchRow(row); return item ? [item] : []; }), available: true };
  } catch {
    console.warn('[enerqa:intelligence] Saved research could not be read.');
    return { items: [] as IntelligenceItem[], available: false };
  }
}
