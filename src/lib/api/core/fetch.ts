import { getProvider } from './registry';
import { fail, ok, type ConnectorResult, type ProviderId } from './types';

/**
 * The one way connectors talk to the outside world (handoff p. 226).
 *
 * Everything the architecture section asks for happens here, once, rather than
 * being re-implemented (and forgotten) in thirteen files:
 *   - server-side only, behind Next's shared fetch cache, never per visitor
 *   - a descriptive User-Agent so providers can identify and contact us
 *   - a per-provider request budget
 *   - a disabled provider is skipped entirely (p. 227)
 *   - failures return a typed result, never a throw and never invented data
 */

/**
 * p. 215 and p. 217 both ask for a contact address in the User-Agent. SEC in
 * particular will block a generic agent. Override with API_CONTACT_EMAIL.
 */
function userAgent(): string {
  const contact = process.env.API_CONTACT_EMAIL ?? 'info@enerqa.co.uk';
  return `enerqa.co.uk/1.0 (+https://enerqa.co.uk; ${contact})`;
}

/**
 * Per-provider request budgets (p. 226).
 *
 * In-process and reset daily, so this is a guard rail rather than a ledger:
 * each server instance counts on its own and a restart clears it. The shared
 * fetch cache is what actually keeps request volume down; this exists so a
 * runaway loop trips something instead of quietly burning a provider's quota.
 */
const DAILY_BUDGET: Partial<Record<ProviderId, number>> = {
  'oecd-sdmx': 240, // documented limit is 60/hour
  'openaq-v3': 1200, // documented limit is 2,000/hour
  openalex: 400,
  doaj: 400,
  'sec-edgar': 400,
  'eia-open-data': 2000,
};
const DEFAULT_BUDGET = 500;

const spend = new Map<ProviderId, { day: string; used: number }>();

function withinBudget(providerId: ProviderId): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const limit = DAILY_BUDGET[providerId] ?? DEFAULT_BUDGET;
  const current = spend.get(providerId);

  if (!current || current.day !== today) {
    spend.set(providerId, { day: today, used: 1 });
    return true;
  }
  if (current.used >= limit) return false;
  current.used += 1;
  return true;
}

export type FetchOptions = {
  /** Override the provider's registry default. */
  revalidate?: number;
  headers?: Record<string, string>;
  /** Extra cache tags, on top of the provider id. */
  tags?: string[];
  /** Abort if the provider does not answer. Keeps a slow source off the render path. */
  timeoutMs?: number;
  /** Parse as text rather than JSON (SDMX-CSV, XML). */
  asText?: boolean;
};

export async function fetchFromProvider<T>(
  providerId: ProviderId,
  url: string,
  options: FetchOptions = {},
): Promise<ConnectorResult<T>> {
  const provider = getProvider(providerId);

  // p. 227: a provider under licence review is off everywhere at once.
  if (!provider.enabled) {
    return fail(providerId, 'disabled', `${provider.name} is disabled pending review. ${provider.note ?? ''}`.trim());
  }

  if (!withinBudget(providerId)) {
    console.warn(`[${providerId}] daily request budget reached - skipping`);
    return fail(providerId, 'rate_limited', `${provider.name} request budget reached for today.`);
  }

  const { revalidate = provider.revalidate, headers = {}, tags = [], timeoutMs = 15000, asText = false } = options;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent(), Accept: 'application/json', ...headers },
      // One cached response serves every visitor. This is the single most
      // important line for staying inside every provider's published limits.
      next: { revalidate, tags: [providerId, 'external-data', ...tags] },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (res.status === 429) {
      console.warn(`[${providerId}] rate limited (429)`);
      return fail(providerId, 'rate_limited', `${provider.name} is rate limiting requests.`);
    }

    if (!res.ok) {
      console.warn(`[${providerId}] HTTP ${res.status} for ${url.split('?')[0]}`);
      return fail(providerId, 'unavailable', `${provider.name} returned HTTP ${res.status}.`);
    }

    const body = asText ? ((await res.text()) as unknown as T) : ((await res.json()) as T);
    return ok(providerId, body);
  } catch (error) {
    // A timeout lands here too, which is the point: a slow provider must not
    // hold up a page render.
    console.warn(`[${providerId}] request failed:`, error);
    return fail(providerId, 'unavailable', `${provider.name} could not be reached.`);
  }
}

/**
 * Read a provider's API key.
 *
 * Deliberately never falls back to a literal. A missing key is reported as
 * `not_configured` and the section shows nothing - which is the behaviour
 * p. 226 requires, and the opposite of what the old newsapi.org call did.
 */
export function providerKey(providerId: ProviderId): string | null {
  const envVar = getProvider(providerId).keyEnvVar;
  if (!envVar) return null;
  const value = process.env[envVar];
  return value && value.trim() ? value.trim() : null;
}
