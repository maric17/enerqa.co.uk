/**
 * The shared record every connector produces (handoff pp. 209, 226-227).
 *
 * The spec's data-integrity rules are mostly about *labels*, not numbers: which
 * period an observation describes, when the source released it, when we
 * fetched it, what licence it carries and whether a reader can actually open
 * it. Those cannot be bolted on later, so they live on the record itself and
 * every connector is required to fill them in.
 */

export type ProviderId =
  // Numerical (pp. 218-224)
  | 'climate-trace'
  | 'world-bank-indicators'
  | 'oecd-sdmx'
  | 'eia-open-data'
  | 'nasa-power'
  | 'gbif-occurrence'
  | 'openaq-v3'
  // Research and disclosure (pp. 212-217)
  | 'openalex'
  | 'doaj'
  | 'reliefweb'
  | 'osti'
  | 'gbif-literature'
  | 'sec-edgar';

/**
 * p. 227: "only `verified_open` records publish". Everything else is an
 * internal review state and must never reach a public card, preview, search
 * result or download button.
 */
export type AccessStatus = 'verified_open' | 'unknown' | 'gated' | 'broken' | 'embargoed';

export type Provenance = {
  providerId: ProviderId;
  providerName: string;
  /** The provider's own identifier for this record, where it has one. */
  sourceId: string | null;
  /** Canonical source URL a reader can open. */
  sourceUrl: string;
  /**
   * When the SOURCE released this data. p. 227 insists this stays separate
   * from both the observation period and our retrieval time - none of the
   * three is automatically "live".
   */
  sourceReleasedAt: string | null;
  /** The period the data describes, e.g. "2021" or "2024-06". */
  observationPeriod: string | null;
  /** When Enerqa fetched it. */
  retrievedAt: string;
  /** Dataset/release version, where the provider publishes one. */
  version: string | null;
  licence: string;
  licenceUrl: string | null;
  /** The exact attribution string to display. */
  attribution: string;
  accessStatus: AccessStatus;
  accessCheckedAt: string | null;
  accessEvidence: string | null;
  /**
   * Anything we did to the numbers. p. 227 requires transformation notes to
   * travel with the data into CSV exports, so they are recorded here rather
   * than written by hand in the UI.
   */
  transformations: string[];
};

/**
 * One observation.
 *
 * `value: null` means "the source has no figure for this period". p. 227:
 * "Never fill missing values with zero." A null renders as a gap in a chart
 * and as an em dash in a table; a zero would be a lie.
 */
export type Observation = {
  period: string;
  value: number | null;
  /** Provider status flag, e.g. an OBS_STATUS code. */
  flag?: string | null;
};

export type Frequency = 'annual' | 'monthly' | 'weekly' | 'daily' | 'hourly' | 'other';

export type DataSeries = {
  id: string;
  label: string;
  /** Always stated: p. 227 forbids unlabelled units. */
  unit: string;
  frequency: Frequency;
  /**
   * Anything a reader needs in order not to misread the number, such as
   * "CO2e, 100-year GWP" or "current US$, not inflation adjusted". p. 227
   * singles out GWP horizons and nominal vs constant currency by name.
   */
  measureNote: string | null;
  /** Geography label, where the series is geographic. */
  area: string | null;
  observations: Observation[];
  provenance: Provenance;
};

/** A research article, report or corporate filing. */
export type ResearchItem = {
  id: string;
  title: string;
  /** Provider-supplied abstract or summary, where licensed. */
  summary: string | null;
  authors: string[];
  /** The publication or issuing organisation. */
  source: string | null;
  publishedAt: string | null;
  doi: string | null;
  /**
   * The URL a reader should actually be sent to. p. 212: prefer a vetted
   * open-access copy over the generic DOI or publisher landing page.
   */
  readUrl: string;
  /** What kind of record this is, so the UI never mislabels it. */
  kind: 'research' | 'report' | 'disclosure';
  /** True only where the provider states peer review. Never inferred. */
  peerReviewed: boolean | null;
  provenance: Provenance;
};

/**
 * Every connector returns this instead of throwing or returning a bare array.
 *
 * The failure branch carries a reason so the UI can tell the three cases
 * apart, which p. 226 requires: nothing found, temporarily unavailable, and
 * not configured are different messages to a reader.
 */
export type ConnectorFailure = {
  ok: false;
  providerId: ProviderId;
  reason: 'unavailable' | 'not_configured' | 'rate_limited' | 'disabled' | 'no_results';
  message: string;
};

export type ConnectorSuccess<T> = {
  ok: true;
  providerId: ProviderId;
  data: T;
  /**
   * True when this came from a cache older than the provider's suggested
   * refresh. p. 227: show cached items with their age rather than nothing.
   */
  stale: boolean;
  retrievedAt: string;
};

export type ConnectorResult<T> = ConnectorSuccess<T> | ConnectorFailure;

export function ok<T>(providerId: ProviderId, data: T, retrievedAt = new Date().toISOString()): ConnectorSuccess<T> {
  return { ok: true, providerId, data, stale: false, retrievedAt };
}

export function fail(
  providerId: ProviderId,
  reason: ConnectorFailure['reason'],
  message: string,
): ConnectorFailure {
  return { ok: false, providerId, reason, message };
}

/** Reader-facing text for a failure. Never invents a number or a headline. */
export function failureMessage(failure: ConnectorFailure): string {
  switch (failure.reason) {
    case 'no_results':
      return 'No relevant updates are available.';
    case 'not_configured':
      return 'This data source is not yet enabled.';
    case 'disabled':
      return 'This data source is paused pending a licence review.';
    case 'rate_limited':
    case 'unavailable':
    default:
      return 'This data source is temporarily unavailable.';
  }
}
