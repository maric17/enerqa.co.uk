# Climate domain research cache fix — 18 October 2026

The user reported a server console overlay at `/domains/climate-action-carbon-management`, highlighting ResearchFeed and an access-check cache key for an EGU research destination.

## Cause and change

The browser reproduced two `revalidating cache with key` console errors. Temporary source failures were intentionally thrown by the anonymous access probe. The extra Next.js cache wrapper could run that probe in background revalidation, outside the caller's catch block, log the failure and return an old verdict.

Access evidence already has a shared database cache with expiry tied to the actual check time. Removed the redundant Next.js cache wrapper from access checks. The caller now awaits an expired destination's fresh check and handles temporary failures as `unknown`, with the existing 30-minute retry. Definitive verdicts still use the existing seven-day evidence lifetime. A per-process pending-request map shares simultaneous checks of the same URL and prevents duplicate fetches and evidence writes.

The anonymous request, full-document checks, access gates, database-outage behavior, concurrency cap and evidence requirements are retained. No schema migration or fabricated feed content was introduced.

## Verification

- Before the fix, regression tests failed on stale approval reuse and duplicate requests. They now pass, including source timeout, HTTP 503, recovery after 30 minutes and shared saved-evidence reuse.
- All 582 tests across 78 files pass, including existing paywall, abstract-only, bot-wall and storage-outage checks.
- TypeScript, changed-code ESLint, whitespace checks and the production build pass. Build used `PAYLOAD_SCHEMA_PUSH=false`.
- The exact local Climate route loaded twice with HTTP 200, four research cards, no page overflow, zero console errors and zero browser exceptions.

Evidence: [before](domain-access-check-before.json), [after](domain-access-check-verification.json). Repeat the browser check with `scripts/verify-domain-access-check.mjs`, using the same Playwright/browser/preview environment options as the other local verifiers. These results establish the local fix, not public deployment or permanent upstream availability.
