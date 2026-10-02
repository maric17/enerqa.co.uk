import type { ProviderId } from './types';

/**
 * Request budgets, backoff and circuit breakers for every provider
 * (handoff pp. 209 and 226: "Apply a conservative internal request/credit
 * budget below the free allowance, exponential backoff and circuit breakers",
 * "request budgets, backoff for 429/errors and stale-cache notices").
 *
 * Everything here counts REAL upstream requests only. `fetchFromProvider`
 * calls `spend()` inside the shared-cache callback, which Next runs on a cache
 * miss or a background refresh and never on a cache hit. The old budgets
 * counted every render, so ~30 page views switched NewsData off until
 * midnight (L379, L1016).
 *
 * The state is in-process, so each server instance keeps its own ledger and a
 * restart clears it. That makes it a guard rail below the provider's own
 * limit, not the limit itself; the shared cache is what keeps volume down. It
 * lives on globalThis so a dev hot reload does not reset it.
 */

export type Limits = {
  /** Real upstream requests per UTC day. */
  daily: number;
  /** A shorter rolling window, where the provider publishes one. */
  window?: { max: number; seconds: number };
  /** Minimum gap between two requests, for providers that ask for spacing. */
  minIntervalMs?: number;
  /** Requests allowed in flight at once. */
  maxConcurrent?: number;
};

const DEFAULT_LIMITS: Limits = { daily: 500, maxConcurrent: 4 };

/**
 * Each figure sits below the provider's published free allowance (pp. 210-224)
 * so a retry or a second server instance still fits underneath it.
 */
export const LIMITS: Partial<Record<ProviderId, Limits>> = {
  // p. 210: 200 credits/day and 30 credits per 15 minutes. The 4 topic
  // baskets every 2 hours and the 38 page baskets every 12 hours cost 124/day
  // (news/newsdata.ts); the rest is headroom for retries (p. 210 "reserve
  // quota for pagination/retries").
  newsdata: { daily: 150, window: { max: 25, seconds: 15 * 60 }, maxConcurrent: 2 },
  // GDELT answers faster polling with "Please limit requests to one every 5
  // seconds" (checked 25 Sep 2026), so requests are spaced by that much.
  gdelt: { daily: 400, minIntervalMs: 5500, maxConcurrent: 1 },
  // p. 212: with no key the allowance is $0.10/day, and a search costs
  // $0.001, so about 100 searches. With a free key it is $1/day (~1,000).
  // `openAlexDailyBudget()` picks the right one at call time.
  openalex: { daily: 80, maxConcurrent: 4 },
  // p. 213: "use conservative <=2 requests/sec initially".
  doaj: { daily: 400, minIntervalMs: 500, maxConcurrent: 2 },
  // p. 215: "restrained batching"; OSTI closes some parallel connections.
  osti: { daily: 400, minIntervalMs: 500, maxConcurrent: 1 },
  // p. 217: maximum 10 requests/second.
  'sec-edgar': { daily: 400, minIntervalMs: 150, maxConcurrent: 2 },
  // p. 220: maximum 60 data downloads per hour.
  'oecd-sdmx': { daily: 240, window: { max: 50, seconds: 3600 }, maxConcurrent: 2 },
  // p. 224: 60 requests/minute and 2,000/hour on the free plan.
  'openaq-v3': { daily: 1200, window: { max: 50, seconds: 60 }, maxConcurrent: 4 },
  // p. 221: bursts under 5/second.
  'eia-open-data': { daily: 2000, minIntervalMs: 250, maxConcurrent: 2 },
  // p. 214: 1,000 calls/day.
  reliefweb: { daily: 600, maxConcurrent: 2 },
  'gbif-literature': { daily: 500, maxConcurrent: 2 },
  'gbif-occurrence': { daily: 500, maxConcurrent: 2 },
};

/** p. 212: the no-key OpenAlex allowance is a tenth of the free-key one. */
export function openAlexDailyBudget(hasKey: boolean): number {
  return hasKey ? 800 : 80;
}

export function limitsFor(providerId: ProviderId): Limits {
  const limits = LIMITS[providerId] ?? DEFAULT_LIMITS;
  if (providerId === 'openalex') {
    return { ...limits, daily: openAlexDailyBudget(Boolean(process.env.OPENALEX_API_KEY?.trim())) };
  }
  return limits;
}

type State = {
  day: string;
  usedToday: number;
  /** Start times of recent requests, for the rolling window. */
  recent: number[];
  inFlight: number;
  /** Earliest time the next request may start (spacing). */
  nextSlotAt: number;
  queue: (() => void)[];
  /** Consecutive failures since the last success. */
  failures: number;
  /** While now < openUntil the breaker is open and nothing is sent. */
  openUntil: number;
  lastFailureAt: number;
  lastSuccessAt: number;
  lastReason: string | null;
  /** The provider's own usage headers said the allowance is spent until then. */
  spentUntil: number;
  /** The refusal already logged, so one pause is reported once. */
  announced: string | null;
};

type Registry = Map<ProviderId, State>;

const globalKey = '__enerqaProviderHealth';
const store = globalThis as unknown as { [globalKey]?: Registry };
const states: Registry = (store[globalKey] ??= new Map());

function today(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function stateOf(providerId: ProviderId, now = Date.now()): State {
  let s = states.get(providerId);
  if (!s) {
    s = {
      day: today(now),
      usedToday: 0,
      recent: [],
      inFlight: 0,
      nextSlotAt: 0,
      queue: [],
      failures: 0,
      openUntil: 0,
      lastFailureAt: 0,
      lastSuccessAt: 0,
      lastReason: null,
      spentUntil: 0,
      announced: null,
    };
    states.set(providerId, s);
  }
  if (s.day !== today(now)) {
    s.day = today(now);
    s.usedToday = 0;
  }
  return s;
}

/**
 * Why a request may not be sent right now. `key` names the pause itself (it
 * stays the same while the countdown in `message` ticks down), so a pause can
 * be logged once.
 */
function block(providerId: ProviderId, now: number): { key: string; message: string } | null {
  const s = stateOf(providerId, now);
  const limits = limitsFor(providerId);
  if (now < s.openUntil) {
    const seconds = Math.ceil((s.openUntil - now) / 1000);
    return {
      key: `open:${s.openUntil}`,
      message: `backing off for ${seconds}s after ${s.failures} failed request${s.failures === 1 ? '' : 's'} (${s.lastReason ?? 'error'})`,
    };
  }
  if (now < s.spentUntil) return { key: `spent:${s.spentUntil}`, message: 'the provider reports its free allowance is spent' };
  if (s.usedToday >= limits.daily) return { key: `daily:${s.day}`, message: `daily request budget of ${limits.daily} reached` };
  if (limits.window) {
    const since = now - limits.window.seconds * 1000;
    s.recent = s.recent.filter((t) => t > since);
    if (s.recent.length >= limits.window.max) {
      return {
        key: `window:${s.recent[0]}`,
        message: `budget of ${limits.window.max} requests per ${limits.window.seconds / 60} minutes reached`,
      };
    }
  }
  return null;
}

/** Why a request may not be sent right now, or null when it may. */
export function refusal(providerId: ProviderId, now = Date.now()): string | null {
  return block(providerId, now)?.message ?? null;
}

/**
 * True the first time the current refusal is seen. During a 16-minute backoff
 * every render is refused, and logging each one buried the failure that
 * started the pause.
 */
export function isNewRefusal(providerId: ProviderId, now = Date.now()): boolean {
  const current = block(providerId, now);
  if (!current) return false;
  const s = stateOf(providerId, now);
  if (s.announced === current.key) return false;
  s.announced = current.key;
  return true;
}

/** Record one real upstream request. Call only when a request is actually sent. */
export function spend(providerId: ProviderId, now = Date.now()): void {
  const s = stateOf(providerId, now);
  s.usedToday += 1;
  if (limitsFor(providerId).window) s.recent.push(now);
}

export function usedToday(providerId: ProviderId): number {
  return stateOf(providerId).usedToday;
}

/** Backoff after the Nth consecutive failure: 30 s, 1 min, 2 min ... capped at 30 min. */
export function backoffMs(failures: number): number {
  return Math.min(30_000 * 2 ** Math.max(0, failures - 1), 30 * 60_000);
}

/**
 * "Retry-After" is either delay-seconds or an HTTP date (RFC 9110). Returns
 * milliseconds from now, or null when absent or unreadable. Capped at 6 hours
 * so a malformed header cannot switch a provider off for days.
 */
export function parseRetryAfter(header: string | null, now = Date.now()): number | null {
  if (!header) return null;
  const value = header.trim();
  let ms: number;
  if (/^\d+$/.test(value)) ms = Number(value) * 1000;
  else {
    const at = Date.parse(value);
    if (Number.isNaN(at)) return null;
    ms = at - now;
  }
  return Math.min(Math.max(ms, 0), 6 * 3600_000);
}

export function recordSuccess(providerId: ProviderId, now = Date.now()): void {
  const s = stateOf(providerId, now);
  s.failures = 0;
  s.openUntil = 0;
  s.lastSuccessAt = now;
  s.lastReason = null;
}

/** The provider's own usage headers from its last answer (p. 212: "track usage headers"). */
export type Usage = { remaining: number; unit: 'requests' | 'USD'; resetAt: number | null; seenAt: number };

const usage = new Map<ProviderId, Usage>();

export function lastUsage(providerId: ProviderId): Usage | null {
  return usage.get(providerId) ?? null;
}

/**
 * Read X-RateLimit-* headers where a provider sends them (OpenAlex sends the
 * USD variants). When the provider says the allowance is spent, stop asking
 * until it resets instead of collecting 429s: p. 212 "hard-stop below the
 * daily free budget".
 */
export function noteUsage(providerId: ProviderId, headers: Headers, now = Date.now()): void {
  const usd = headers.get('x-ratelimit-remaining-usd');
  const count = headers.get('x-ratelimit-remaining');
  const raw = usd ?? count;
  if (raw === null) return;
  const remaining = Number(raw);
  if (!Number.isFinite(remaining)) return;

  const resetHeader = Number(headers.get('x-ratelimit-reset'));
  // Either seconds from now or an epoch time in seconds.
  const resetAt = Number.isFinite(resetHeader) && resetHeader > 0
    ? resetHeader > 1e9 ? resetHeader * 1000 : now + resetHeader * 1000
    : null;
  usage.set(providerId, { remaining, unit: usd !== null ? 'USD' : 'requests', resetAt, seenAt: now });

  if (remaining <= 0) {
    // Kept apart from the breaker: this response itself may be fine, but
    // the next one would be refused or billed.
    stateOf(providerId, now).spentUntil = Math.min(resetAt ?? now + 3600_000, now + 24 * 3600_000);
  }
}

/**
 * A 429, a 5xx, a timeout or an unusable body.
 *
 * An explicit "slow down" (429, 503, or any Retry-After) opens the breaker at
 * once, for the exponential backoff or for as long as Retry-After asks if that
 * is longer. Any other failure opens it from the second in a row, so one slow
 * connection does not take a provider off every page for 30 seconds.
 */
export function recordFailure(
  providerId: ProviderId,
  reason: string,
  opts: { retryAfterMs?: number | null; slowDown?: boolean; now?: number } = {},
): void {
  const now = opts.now ?? Date.now();
  const s = stateOf(providerId, now);
  s.failures += 1;
  s.lastFailureAt = now;
  s.lastReason = reason;
  const slowDown = opts.slowDown || Boolean(opts.retryAfterMs);
  if (slowDown || s.failures >= FAILURES_TO_OPEN) {
    s.openUntil = Math.max(s.openUntil, now + Math.max(backoffMs(s.failures), opts.retryAfterMs ?? 0));
  }
}

/** Ordinary failures in a row before the breaker opens. */
export const FAILURES_TO_OPEN = 2;

/**
 * True while the provider's most recent attempt failed or its budget is spent,
 * i.e. a refresh is being refused. Used for the stale-data notice, so a reader
 * is told "could not be refreshed" only when that is what happened (p. 227).
 */
export function isUnhealthy(providerId: ProviderId, now = Date.now()): boolean {
  const s = stateOf(providerId, now);
  if (s.lastFailureAt > s.lastSuccessAt) return true;
  return refusal(providerId, now) !== null;
}

/**
 * Wait for a free slot: at most `maxConcurrent` in flight, and `minIntervalMs`
 * between starts. Returns the function that releases the slot.
 */
export async function acquireSlot(providerId: ProviderId): Promise<() => void> {
  const limits = limitsFor(providerId);
  const s = stateOf(providerId);
  const max = limits.maxConcurrent ?? DEFAULT_LIMITS.maxConcurrent ?? 4;

  if (s.inFlight >= max) {
    // The releasing request hands its slot straight to us (see below), so the
    // in-flight count never overshoots `max` between the two.
    await new Promise<void>((resolve) => s.queue.push(resolve));
  } else {
    s.inFlight += 1;
  }

  const gap = limits.minIntervalMs ?? 0;
  if (gap > 0) {
    const now = Date.now();
    const startAt = Math.max(now, s.nextSlotAt);
    s.nextSlotAt = startAt + gap;
    if (startAt > now) await new Promise((r) => setTimeout(r, startAt - now));
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const next = s.queue.shift();
    if (next) next();
    else s.inFlight -= 1;
  };
}

/**
 * p. 227: "If the source is unavailable, show the latest cached release with a
 * stale-data notice". Data older than the provider's refresh interval is
 * stale when a refresh is actually being refused (a failure, backoff or spent
 * budget) - not merely because the first visitor after a quiet spell was
 * served the old copy while Next refreshed it in the background. Past twice
 * the interval it is stale regardless: some refresh has been failing.
 */
export function isStaleAge(providerId: ProviderId, retrievedAt: string, revalidateSeconds: number, now = Date.now()): boolean {
  const t = Date.parse(retrievedAt);
  if (Number.isNaN(t) || !revalidateSeconds) return false;
  const age = now - t;
  if (age <= revalidateSeconds * 1000) return false;
  return isUnhealthy(providerId, now) || age > 2 * revalidateSeconds * 1000;
}

/** For tests only: forget every provider's state. */
export function resetHealth(): void {
  states.clear();
  usage.clear();
}
