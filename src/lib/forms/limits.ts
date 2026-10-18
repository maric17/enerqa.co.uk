import { createRateLimiter, type RateLimiter } from './rateLimit';

/**
 * Shared limiters for the public forms (p. 228 spam protection). Module-level
 * so every submission in this server process counts against the same windows.
 *
 * Only attempts that would write a record are counted (after the honeypot and
 * validation), so a visitor correcting a validation error is never locked out.
 */
const TEN_MINUTES = 10 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

/** Contact enquiries and tool-access requests, per visitor. */
export const enquiryLimiter = createRateLimiter({ limit: 5, windowMs: TEN_MINUTES });

/** Newsletter signups and unsubscribes, per visitor. */
export const newsletterLimiter = createRateLimiter({ limit: 5, windowMs: TEN_MINUTES });

/**
 * A ceiling across all visitors, so a distributed flood cannot fill the
 * Enquiries table. Generous enough that real traffic never meets it.
 */
export const allFormsLimiter = createRateLimiter({ limit: 200, windowMs: ONE_HOUR });

/**
 * Records one write attempt against the visitor's limiter and the site-wide
 * ceiling. The ceiling is only charged when the visitor is within their own
 * limit, so one noisy visitor cannot use up everyone else's allowance.
 */
export function allowSubmission(
  limiter: RateLimiter,
  visitorKey: string,
  now: number = Date.now(),
  ceiling: RateLimiter = allFormsLimiter,
): boolean {
  if (!limiter.consume(visitorKey, now).allowed) return false;
  return ceiling.consume('all-visitors', now).allowed;
}
