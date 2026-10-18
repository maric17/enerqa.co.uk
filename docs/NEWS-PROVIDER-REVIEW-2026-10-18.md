# News cron check and provider review

Checked on 18 October 2026, approximately 16:20–16:22 Asia/Manila. Prices are USD unless stated otherwise. This review changes no application code, scheduler settings, subscriptions or deployment.

## Follow-up: manual recovery at 16:27 Manila

The user reported clicking Run in Vercel Settings → Cron Jobs and supplied a log screenshot containing an HTTP 401 at 16:21:05.92. That timestamp also coincides with this review's unauthenticated endpoint check, so the screenshot alone cannot attribute that entry to the dashboard invocation. The shared job state still showed the earlier 14:29 completion when rechecked at 16:26:55. No later successful dashboard invocation was established.

The route rejects missing or mismatched authorization before starting provider work. Its missing-server-secret response is 503; 401 means the deployed handler has a secret but the supplied authorization does not match. Vercel documents automatically supplying the `Authorization: Bearer <CRON_SECRET>` header on its cron invocations. If a confirmed dashboard invocation returns 401, check the current Production environment value and redeploy so the handler uses the current configuration. Never remove authentication, expose the secret in a URL, or treat a `skipped: true` response as an authorization error. An authenticated duplicate invocation in an already consumed slot intentionally skips work.

After the user's follow-up, one existing operator command, `scripts/pull-news.ts --manual`, ran using the corrected local connector and the configured shared database. It started at `2026-10-18T08:27:16.670Z` and completed at `2026-10-18T08:27:58.544Z` (16:27 Manila):

- All 21 NewsData queries succeeded, returning 62 mapped candidates in total; some queries correctly returned zero results.
- GDELT succeeded with 250 mapped candidates. EIA and EEA succeeded with 18 and 75 mapped candidates.
- Combined access/relevance checks saved or updated 93 eligible records. This is not 93 newly published stories or 93 new database rows.
- A read-only database check confirmed `trigger: manual`, successful provider timestamps and `storage: ok`. Total NewsData records increased from 26 to 27; GDELT increased from 59 to 61. The newest saved NewsData publication became `2026-10-17T19:00:39.000Z`.
- The first deployed homepage read retained the previous cache entry. A subsequent read returned HTTP 200 and contained the new `2026-10-18T08:27:58.544Z` completion timestamp instead of the previous one.

- [x] Recover the shared news store with one protected operator pull and verify the deployed page observes its completion.
- [ ] Confirm dashboard authorization and the next automatic deployed provider batch.
  - Next action: verify Production `CRON_SECRET`, deploy the current connector/configuration, and inspect the specific new invocation's status and provider outcomes. This workspace has no Vercel token, linked project or local copy of `CRON_SECRET`; remote configuration was not changed or verified.

The sections below retain the initial pre-recovery snapshot. The manual recovery establishes local provider and shared-store health, not successful deployed cron authorization.

## Current refresh evidence

- Repository schedule: 06:00, 14:00 and 22:00 Manila, every day. See `vercel.json` and `src/lib/api/news/schedule.ts`.
- Read-only queries against the configured shared database found provider-request bursts in every expected slot from 16 October 22:00 Manila through 18 October 14:00 Manila. This is execution evidence from shared accounting, not direct access to Vercel invocation logs or proof of which deployment made every request.
- Latest saved job: `trigger: scheduled`, slot `2026-10-18T06:00:00.000Z`; started at 14:29:24 Manila and completed at 14:29:57 Manila. Storage was healthy.
- All 21 NewsData queries in that job failed with HTTP 422. GDELT failed with HTTP 429. EIA and EEA returned 18 and 75 mapped items respectively. A completed job or HTTP 200 does not establish that every news provider succeeded.
- Latest saved successful provider polls: NewsData 18 October 11:14:02 Manila; GDELT 17 October 06:29:46 Manila. These timestamps describe provider polls, not article publication times.
- Newest saved NewsData publication was `2026-10-16T18:56:50.000Z`, or 17 October 02:56:50 Manila, approximately 37 hours before this check.
- Public deployed homepage returned HTTP 200 and contained the latest completed-job timestamp. Unauthenticated `/api/ingest/news` returned HTTP 401, confirming endpoint protection. No authenticated full refresh was triggered.

## Why cards can appear unchanged for two days

NewsData documents a 12-hour delay on its free plan. An eight-hour polling interval can add nearly eight more hours once a story becomes available. Roughly 12–20 hours is therefore an expected baseline under healthy conditions, plus provider indexing and processing time. It is not a guaranteed maximum.

There is also a confirmed operational problem: the latest deployed scheduled batch received only NewsData 422 errors. GDELT's rate limit reduces the alternate news supply. Saved eligible articles remain visible during these failures, so the page can look unchanged even though the scheduled job runs.

Publisher and access restrictions further reduce coverage. The current NewsData prefilter requests only Reuters, Guardian, IEA and UN. The site separately checks its approved publishers, topic relevance and anonymous access. A replacement provider alone will not broaden this editorial policy or guarantee fresh eligible stories for every topic.

The current committed local connector already excludes `worldbank.org`, which its comments and regression test identify as an unsupported NewsData filter. A fresh, usage-tracked local request using that request builder succeeded at `2026-10-18T08:21:30.000Z` with ten mapped articles. It made no article or job-state writes; normal shared request accounting was used. This establishes local request success, not the deployed request parameters or the exact cause of its 422 errors. The saved diagnostics contain no provider error body.

Existing focused request-builder and protected-route tests passed: six tests across two files. No new tests or application changes were needed for this review.

- [x] Check current shared job state and request history without schema changes.
- [x] Verify the current local NewsData request builder against the provider once.
- [ ] Verify deployed NewsData recovery.
  - Next action: confirm the Production deployment contains the current `newsdata.ts` publisher prefilter, then inspect the next scheduled batch for NewsData successes and a new last-success timestamp. If 422 persists, inspect the provider error code safely; do not assume the filter is the cause solely from the HTTP status.
  - Blocker: this workspace has no configured Vercel token or linked Vercel project, so deployment identity and invocation logs were not available here.
- [ ] Verify fresh GDELT recovery.
  - Next action: inspect the next scheduled attempt after normal backoff. Persistent 429 responses need provider investigation or an alternative source; repeated manual pulls spend allowance without resolving the refusal.

## Service shortlist

| Service | Current price | Filtering and fit | Recommendation |
| --- | --- | --- | --- |
| Exa Search, Fast/Auto | $7 per 1,000 requests, up to ten results per request | Meaning-based queries, publication-date bounds and publisher-domain filters; useful for broad sustainability discovery | Trial first for topic relevance. Estimated scheduled base usage fits $10–20/month. Index freshness and approved-publisher coverage need measurement. |
| TheNewsAPI Basic | $19/month; $16/month equivalent with annual billing | 2,500 requests/day, 25 articles/request, advertised real-time data; Boolean phrases, publisher, language and date filters | Strong fixed-price candidate for a conventional news feed. Confirm commercial display permission and source coverage before purchase. |
| Mediastack Standard | $24.99/month, or $22.99/month equivalent billed annually | Advertised live data and commercial use, 10,000 requests/month | Slightly above budget; fallback candidate if the first two lack coverage. |
| NewsData Basic | $199.99/month | Advertised real-time article availability | Outside the stated budget. Do not upgrade solely to remove the free-tier delay at this budget. |

Sources: [Exa pricing](https://exa.ai/docs/admin/pricing), [Exa search reference](https://exa.ai/docs/reference/search), [TheNewsAPI pricing](https://www.thenewsapi.com/pricing), [TheNewsAPI documentation](https://www.thenewsapi.com/documentation), [Mediastack pricing](https://mediastack.com/pricing/), [NewsData pricing](https://newsdata.io/pricing).

## Exa assessment and budget

Exa is an established search API business. Its investor independently confirms its investment in [Investing in Exa](https://a16z.com/announcement/investing-in-exa/). That establishes business credibility, not a guarantee of news quality or uptime for Enerqa.

Exa is suitable for a trial across climate change/action, energy transition, nature/biodiversity, circularity/environment, sustainable business and sustainable finance/ESG. ESG means environmental, social and governance issues. These should be six explicit topic searches, with synonyms and exclusions, rather than an assumption that either service has an exact category matching each topic. TheNewsAPI documents general categories, so this taxonomy would use keyword rules. Exa supports queries by meaning plus date/domain constraints, but results still require local relevance and access checks.

The estimated base cost for the site's existing 61 scheduled queries/day is `61 × 30 × $0.007 = $12.81/month`, with at most ten results per request. This excludes visitor searches, retries, more results, separate content calls, summaries, taxes and any other provider charges. It is a workload estimate, not a coverage-equivalence claim or invoice quote. The rate card also lists Instant Search at $4/1,000 requests; its suitability should be tested rather than assumed.

Requesting an AI-generated summary for every result at ten results/request would add up to $18.30/month at the same volume, for $31.11 total. Asking for more than ten results also adds cost. At twice the existing scheduled volume, Auto Search alone would cost approximately $25.62/month. Consequently, increasing cron frequency needs a query redesign or a larger budget. Six topic queries every two hours would be 72/day, approximately $15.12/month in base Auto Search usage, but would replace the existing domain/industry discovery design and needs coverage testing.

Use scheduled Search calls and the existing shared saved store for an initial trial. Keep visitor page views off the paid provider. Enforce a server-side spend/request limit shared by scheduled and interactive searches. Exa Monitors have a separate $15/1,000-request rate; this estimate does not use that product. Treat promotional free credits as trial help rather than the production budget.

Fresh content extraction from a known URL does not prove that the search index has discovered all new articles. No specific publisher-to-index delay or completeness guarantee was established by this review. A real-time marketing label should not be presented to the client as a promise of immediate or complete coverage.

Both providers' terms need attention for a public news panel: [Exa terms](https://exa.ai/terms), [TheNewsAPI terms](https://www.thenewsapi.com/tos). The retrieved Exa terms restrict republication unless otherwise permitted; TheNewsAPI's general terms contain non-commercial limitations. Confirm the applicable API agreement permits stored public headlines, short descriptions and links. Publisher image and full-article rights need separate confirmation. API access alone does not establish these permissions.

## Recommended decision and trial

Repair/verify the existing deployed request failure first, so a replacement is compared against a healthy baseline. Trial Exa for seven days, with TheNewsAPI as the fixed-price comparison if trial access is available. Neither replacement was called in this review because no account/key was supplied. No paid account was created or subscription purchased.

- [ ] Confirm API display/storage permissions for the chosen public news use.
  - Next action: obtain the applicable API terms or written provider confirmation for headlines, supplied excerpts, source links, retention and image use.
- [ ] Run a seven-day, six-topic coverage comparison.
  - Next action: use the same approved publishers, date windows and access checks; record publication time, first discovery time, relevant unique stories per topic, rejected/gated destinations and actual cost. Compare indexing delay separately from the site's polling interval.
- [ ] Choose the primary provider from measured coverage.
  - Next action: prefer Exa if its meaning-based discovery produces enough fresh approved stories within the spend limit; prefer TheNewsAPI if its news coverage is stronger and fixed monthly billing is preferable. Retain healthy official RSS feeds alongside either option.
- [ ] Update the integration after selection.
  - Next action: add the provider to the existing registry, shared accounting/storage and diagnostics; replace NewsData-specific delay labels and rights text; validate topic selection and failed-refresh behavior. Provider substitution is implementation work and has not been performed here.
