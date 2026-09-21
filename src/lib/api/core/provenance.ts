import { getProvider } from './registry';
import type { AccessStatus, Provenance, ProviderId } from './types';

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
    accessEvidence?: string | null;
    licence?: string;
    licenceUrl?: string | null;
    attribution?: string;
    transformations?: string[];
  },
): Provenance {
  const provider = getProvider(providerId);
  const now = new Date().toISOString();

  return {
    providerId,
    providerName: provider.name,
    sourceId: input.sourceId ?? null,
    sourceUrl: input.sourceUrl,
    sourceReleasedAt: input.sourceReleasedAt ?? null,
    observationPeriod: input.observationPeriod ?? null,
    retrievedAt: now,
    version: input.version ?? null,
    licence: input.licence ?? provider.licence,
    licenceUrl: input.licenceUrl ?? provider.licenceUrl,
    attribution: input.attribution ?? provider.attribution,
    accessStatus: input.accessStatus ?? 'unknown',
    accessCheckedAt: input.accessStatus ? now : null,
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
