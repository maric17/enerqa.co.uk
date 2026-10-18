/**
 * A small fixed-window rate limiter (p. 228: "Enquiry and newsletter forms
 * need ... spam protection").
 *
 * It is pure - no Next.js or Payload imports - so the rules can be tested
 * directly, and the same helper also backs the AI search quota guard.
 *
 * Limitation, stated so nobody over-trusts it: counts live in this server
 * process's memory. On a single long-running server that is a real limit; on
 * serverless hosting each instance keeps its own counts and a cold start
 * resets them, so treat it as a brake on bursts, not a guarantee. A shared
 * store (database or KV) is the upgrade path if abuse appears.
 */

export type RateLimitResult = {
  allowed: boolean;
  /** How many more attempts fit in the current window (0 when blocked). */
  remaining: number;
  /** Milliseconds until the current window ends. */
  retryAfterMs: number;
};

export type RateLimiter = {
  /** Records one attempt for `key` and says whether it is within the limit. */
  consume: (key: string, now?: number) => RateLimitResult;
  /** Reports the state for `key` without recording an attempt. */
  peek: (key: string, now?: number) => RateLimitResult;
};

type Window = { start: number; count: number };

/** Stop the map growing without bound if a flood of distinct keys arrives. */
const MAX_TRACKED_KEYS = 5000;

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }): RateLimiter {
  const windows = new Map<string, Window>();

  function current(key: string, now: number): Window | undefined {
    const w = windows.get(key);
    if (w && now - w.start >= windowMs) {
      windows.delete(key);
      return undefined;
    }
    return w;
  }

  function prune(now: number) {
    if (windows.size < MAX_TRACKED_KEYS) return;
    for (const [key, w] of windows) {
      if (now - w.start >= windowMs) windows.delete(key);
    }
    // Still full (a burst of fresh keys): drop the oldest half rather than
    // refuse everyone.
    if (windows.size >= MAX_TRACKED_KEYS) {
      let toDrop = Math.floor(windows.size / 2);
      for (const key of windows.keys()) {
        if (toDrop-- <= 0) break;
        windows.delete(key);
      }
    }
  }

  function result(w: Window | undefined, now: number): RateLimitResult {
    const count = w?.count ?? 0;
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterMs: w ? Math.max(0, windowMs - (now - w.start)) : 0,
    };
  }

  return {
    consume(key, now = Date.now()) {
      prune(now);
      let w = current(key, now);
      if (!w) {
        w = { start: now, count: 0 };
        windows.set(key, w);
      }
      w.count += 1;
      return result(w, now);
    },
    peek(key, now = Date.now()) {
      const w = current(key, now);
      // Peeking must not count as an attempt, so compare against the next one.
      const r = result(w, now);
      return { ...r, allowed: (w?.count ?? 0) < limit };
    },
  };
}
