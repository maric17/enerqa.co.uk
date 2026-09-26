import { unstable_cache } from 'next/cache';
import { getProvider, providerEnabled } from './registry';
import {
  acquireSlot,
  isStaleAge,
  noteUsage,
  parseRetryAfter,
  recordFailure,
  recordSuccess,
  refusal,
  spend,
} from './health';
import { fail, ok, type ConnectorFailure, type ConnectorResult, type ProviderId } from './types';

export { isStaleAge } from './health';

/**
 * The one way connectors talk to the outside world (handoff p. 226).
 *
 * Everything the architecture section asks for happens here, once, rather than
 * being re-implemented (and forgotten) in every connector:
 *   - server-side only, behind Next's shared cache, never per visitor
 *   - a descriptive User-Agent so providers can identify and contact us
 *   - a per-provider request budget that counts REAL upstream requests only
 *   - exponential backoff, Retry-After and a circuit breaker (pp. 209, 226)
 *   - an error or rate-limit reply is never cached as data (L1030)
 *   - a disabled provider is skipped entirely (p. 227)
 *   - failures return a typed result, never a throw and never invented data
 *
 * How the cache and the budget fit together. The upstream call runs inside
 * `unstable_cache`, so its body only executes on a cache miss or when Next
 * refreshes a stale entry in the background - never on a cache hit. That is
 * where the budget is spent, so cache hits cost nothing (L379). When the
 * budget is spent or the breaker is open the callback throws: Next caches
 * nothing, and a stale entry goes on being served with its real age, which is
 * p. 209's "honest cached ... fallback when a free allowance is exhausted".
 * The same throw is how a 200 response that is really an error (GDELT's
 * rate-limit text, NewsData's status:"error") stays out of the cache. Next's
 * own fetch cache could not do this: it stores every HTTP 200 body.
 */

/**
 * p. 215 and p. 217 both ask for a contact address in the User-Agent. SEC in
 * particular will block a generic agent. Override with API_CONTACT_EMAIL.
 */
function userAgent(): string {
  const contact = process.env.API_CONTACT_EMAIL ?? 'info@enerqa.co.uk';
  return `enerqa.co.uk/1.0 (+https://enerqa.co.uk; ${contact})`;
}

/** A body the provider sent with HTTP 200 that is really an error. */
export type BodyRejection = { reason: 'rate_limited' | 'unavailable'; message: string };

export type FetchOptions = {
  /** Override the provider's registry default. */
  revalidate?: number;
  headers?: Record<string, string>;
  /** Extra cache tags, on top of the provider id. */
  tags?: string[];
  /** Abort if the provider does not answer. Keeps a slow source off the render path. */
  timeoutMs?: number;
  /** Parse as text rather than JSON (SDMX-CSV, XML, RSS). */
  asText?: boolean;
  /**
   * Inspect a 200 body before it is cached. Return a rejection for a reply
   * that is really an error, so it is never cached or shown as data.
   */
  rejectBody?: (body: unknown) => BodyRejection | null;
};

/** Thrown inside the cached callback so Next caches nothing. */
class UpstreamError extends Error {
  constructor(
    readonly reason: ConnectorFailure['reason'],
    message: string,
  ) {
    super(message);
    this.name = 'UpstreamError';
  }
}

/** Query parameters that carry a credential. Kept out of cache keys and logs. */
const SECRET_PARAMS = new Set(['apikey', 'api_key', 'key', 'token', 'access_token']);

/** The URL with any credential removed, for cache keys and log lines. */
export function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    for (const name of [...u.searchParams.keys()]) {
      if (SECRET_PARAMS.has(name.toLowerCase())) u.searchParams.delete(name);
    }
    return u.toString();
  } catch {
    return url.split('?')[0];
  }
}

type Cached<T> = { body: T; retrievedAt: string };

/**
 * One real upstream request. Runs only on a cache miss or a background refresh.
 * Throws UpstreamError for anything that must not be cached.
 */
async function upstream<T>(providerId: ProviderId, url: string, options: FetchOptions): Promise<Cached<T>> {
  const name = getProvider(providerId).name;
  const { headers = {}, timeoutMs = 15000, asText = false, rejectBody } = options;

  const blocked = refusal(providerId);
  if (blocked) throw new UpstreamError('rate_limited', `${name}: ${blocked}; not requested`);

  const release = await acquireSlot(providerId);
  try {
    // Another request may have tripped the breaker while this one queued.
    const stillBlocked = refusal(providerId);
    if (stillBlocked) throw new UpstreamError('rate_limited', `${name}: ${stillBlocked}; not requested`);

    spend(providerId);

    let res: Response;
    try {
      res = await fetch(url, {
        headers: { 'User-Agent': userAgent(), Accept: 'application/json', ...headers },
        // The shared cache is the unstable_cache around this call. The raw
        // response is never cached, because it may turn out to be an error.
        cache: 'no-store',
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      // A timeout lands here too: a slow provider must not hold up a render.
      const msg = error instanceof Error ? error.message : 'Unknown error';
      const cause = error instanceof Error && (error.cause as Error)?.message ? ` - ${(error.cause as Error).message}` : '';
      recordFailure(providerId, 'no response');
      throw new UpstreamError('unavailable', `${name} could not be reached (${msg}${cause})`);
    }

    noteUsage(providerId, res.headers);

    if (res.status === 429 || res.status === 503) {
      // p. 226: "backoff for 429/errors". Retry-After, where sent, wins when
      // it asks for longer than the exponential backoff.
      const retryAfterMs = parseRetryAfter(res.headers.get('retry-after'));
      recordFailure(providerId, `HTTP ${res.status}`, { retryAfterMs, slowDown: true });
      throw new UpstreamError(
        res.status === 429 ? 'rate_limited' : 'unavailable',
        `${name} returned HTTP ${res.status}${retryAfterMs ? ` (Retry-After ${Math.round(retryAfterMs / 1000)}s)` : ''}`,
      );
    }
    if (res.status >= 500) {
      recordFailure(providerId, `HTTP ${res.status}`);
      throw new UpstreamError('unavailable', `${name} returned HTTP ${res.status}`);
    }
    if (!res.ok) {
      // A 4xx is about this one request (a bad query, a missing record), not
      // the provider's health, so it does not trip the breaker.
      throw new UpstreamError('unavailable', `${name} returned HTTP ${res.status} for ${redactUrl(url).split('?')[0]}`);
    }

    let body: unknown;
    try {
      body = asText ? await res.text() : await res.json();
    } catch {
      recordFailure(providerId, 'unreadable body');
      throw new UpstreamError('unavailable', `${name} sent a body that could not be read`);
    }

    const rejected = rejectBody?.(body);
    if (rejected) {
      // A rate-limit reply in the body (GDELT's text, NewsData's code) is a
      // "slow down" as much as a 429 is.
      recordFailure(providerId, rejected.message, { slowDown: rejected.reason === 'rate_limited' });
      throw new UpstreamError(rejected.reason, `${name}: ${rejected.message}`);
    }

    recordSuccess(providerId);
    return { body: body as T, retrievedAt: upstreamRetrievedAt(res) };
  } finally {
    release();
  }
}

/**
 * Next's shared cache around `fn`. Outside a Next.js server (unit tests,
 * scripts) there is no cache to share, so `fn` simply runs.
 */
async function sharedCache<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  opts: { revalidate: number; tags: string[] },
): Promise<T> {
  // revalidate 0 means "never cache"; unstable_cache refuses it outright.
  if (!opts.revalidate) return fn();
  try {
    return await unstable_cache(fn, keyParts, opts)();
  } catch (error) {
    if (error instanceof Error && error.message.includes('incrementalCache missing')) return fn();
    throw error;
  }
}

export async function fetchFromProvider<T>(
  providerId: ProviderId,
  url: string,
  options: FetchOptions = {},
): Promise<ConnectorResult<T>> {
  const provider = getProvider(providerId);

  // p. 227: a provider under licence review is off everywhere at once.
  if (!providerEnabled(providerId)) {
    return fail(providerId, 'disabled', `${provider.name} is disabled pending review. ${provider.note ?? ''}`.trim());
  }

  const revalidate = options.revalidate ?? provider.revalidate;
  const tags = [providerId, 'external-data', ...(options.tags ?? [])];

  try {
    const hit = await sharedCache(
      () => upstream<T>(providerId, url, options),
      ['provider-fetch', providerId, redactUrl(url), options.asText ? 'text' : 'json'],
      { revalidate, tags },
    );
    return ok(providerId, hit.body, hit.retrievedAt, isStaleAge(providerId, hit.retrievedAt, revalidate));
  } catch (error) {
    if (error instanceof UpstreamError) {
      console.warn(`[${providerId}] ${error.message}`);
      return fail(providerId, error.reason, error.message);
    }
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[${providerId}] request failed: ${msg}`);
    return fail(providerId, 'unavailable', `${provider.name} could not be reached.`);
  }
}

/**
 * When the provider actually served this response, as an ISO string.
 *
 * For a cached response this is the original fetch time, which is exactly the
 * "Enerqa retrieval time" p. 226 asks us to label. Falls back to now only when
 * the provider sends no usable Date header.
 */
export function upstreamRetrievedAt(res: Response): string {
  const header = res.headers.get('date');
  const time = header ? Date.parse(header) : NaN;
  return Number.isNaN(time) ? new Date().toISOString() : new Date(time).toISOString();
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
