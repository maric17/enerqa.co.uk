import { getProvider } from './registry';
import { isStaleAge } from './health';
import type { AccessStatus, Provenance, ProviderId } from './types';

/**
 * True when this record is older than its provider's refresh interval and a
 * refresh is being refused, i.e. we are showing a cached release because a
 * refresh failed. p. 227: show "the latest cached release with a stale-data
 * notice and original-source link". The rule itself is `isStaleAge`.
 */
export function isStale(provenance: Provenance, now = Date.now()): boolean {
  return isStaleAge(provenance.providerId, provenance.retrievedAt, getProvider(provenance.providerId).revalidate, now);
}

/**
 * Build the provenance record p. 226 requires, filling licence and attribution
 * from the registry so no connector has to restate them (and get them wrong).
 */
export function buildProvenance(
  providerId: ProviderId,
  input: {
    sourceUrl: string;
    sourceId?: string | null;
    sourceReleasedAt?: string | null;
    observationPeriod?: string | null;
    version?: string | null;
    /** Defaults to `unknown`: a record only publishes once it is verified_open (p. 227). */
    accessStatus?: AccessStatus;
    /**
     * When the access check behind `accessStatus` actually ran. Never "now":
     * building a record is not a check (L1009). Null until one has run.
     */
    accessCheckedAt?: string | null;
    accessEvidence?: string | null;
    licence?: string;
    licenceUrl?: string | null;
    attribution?: string;
    transformations?: string[];
    /** The connector result's retrievedAt (provider's own Date header). */
    retrievedAt?: string;
  },
): Provenance {
  const provider = getProvider(providerId);
  const now = new Date().toISOString();
  // Pass the connector result's retrievedAt so a cached response keeps its
  // real age instead of being relabelled "now" on every render (p. 226).
  const retrievedAt = input.retrievedAt ?? now;

  return {
    providerId,
    providerName: provider.name,
    sourceId: input.sourceId ?? null,
    sourceUrl: input.sourceUrl,
    sourceReleasedAt: input.sourceReleasedAt ?? null,
    observationPeriod: input.observationPeriod ?? null,
    retrievedAt,
    version: input.version ?? null,
    licence: input.licence ?? provider.licence,
    licenceUrl: input.licenceUrl ?? provider.licenceUrl,
    attribution: input.attribution ?? provider.attribution,
    accessStatus: input.accessStatus ?? 'unknown',
    accessCheckedAt: input.accessCheckedAt ?? null,
    accessEvidence: input.accessEvidence ?? null,
    transformations: input.transformations ?? [],
  };
}

/**
 * p. 227: "only `verified_open` records publish". Unknown, gated, broken and
 * embargoed are internal review states and must never reach a public card,
 * preview, search result or download button.
 */
export function isPublishable(provenance: Provenance): boolean {
  return provenance.accessStatus === 'verified_open';
}

export function publishableOnly<T extends { provenance: Provenance }>(items: T[]): T[] {
  return items.filter((item) => isPublishable(item.provenance));
}

/**
 * The three dates p. 227 insists on keeping apart. None of them is "live", and
 * conflating them is the mistake the rule exists to prevent.
 */
export function sourceLabel(provenance: Provenance): string {
  const parts = [provenance.attribution];
  if (provenance.observationPeriod) parts.push(`data for ${provenance.observationPeriod}`);
  if (provenance.sourceReleasedAt) {
    parts.push(`released ${formatDate(provenance.sourceReleasedAt)}`);
  }
  parts.push(`retrieved ${formatDate(provenance.retrievedAt)}`);
  if (provenance.version) parts.push(`version ${provenance.version}`);
  return parts.join(' · ');
}

function formatDate(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
