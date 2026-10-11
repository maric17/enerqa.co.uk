# Saved news and three daily pulls

Implemented on 3 October 2026. News readers use approved records from the existing private `enerqa_connectors.external_records` table. Only authenticated `GET /api/ingest/news` performs news-provider pulls. This change creates no tables and requires no database migration.

## Schedule

`vercel.json` contains three separate daily jobs. Vercel uses UTC:

| Manila time (Asia/Manila) | UTC | Cron expression |
| --- | --- | --- |
| 6 AM | 10 PM on the previous UTC date | `0 22 * * *` |
| 2 PM | 6 AM | `0 6 * * *` |
| 10 PM | 2 PM | `0 14 * * *` |

As of the 11 October local coverage fix, each job fetches four NewsData topic baskets and twelve unique domain query groups once, GDELT's shared `all` query once, EIA RSS once and the three EEA RSS channels once. The NewsData baseline becomes **16 calls per pull / 48 per day**, within the unchanged shared limits of 25 requests per 15 minutes and 150 per day. GDELT remains three calls, EIA three feed calls and EEA nine feed calls per day. Existing shared budgets, provider disable checks, request spacing and backoff remain active. The job awaits fresh replies rather than receiving an old reply while a cache refresh runs in the background.

Home, domain pages, industry pages, Global Intelligence news, news search and official EIA/EEA news reads use saved records. All domain and industry page-basket configurations select saved content without extra NewsData queries during browsing. The scheduler now requests the twelve domain groups to address missing domain coverage; industry groups still select from the same saved pool. When a URL is returned by several topic/domain queries, its saved record retains every matching query so a domain can recognize that provenance even when its exact phrase is absent from the headline/teaser. This local change requires code deployment before the live cron job can use it.

## Failure and freshness rules

- A provider failure never clears previously saved articles. Healthy providers continue independently.
- Articles retain original publication and retrieval times. The last successful provider poll is stored separately and displayed as the feed refresh time.
- Repeated articles update existing provider/source records. Display deduplication uses the canonical article URL and prefers richer provider metadata.
- A shared database control record claims one eight-hour schedule slot atomically. Duplicate calls in that slot skip provider work, including duplicate calls from another deployment sharing the database. A ten-minute lease also prevents overlapping runs. The route has a five-minute execution limit.
- Each provider verifies at most 80 approved articles per run, considering new results and previous saved candidates. Unverified destinations are withheld. Page visits never run those article checks.
- Existing publication-date rules still reject articles over 60 days old. Access evidence expires after seven days. Newer refused access evidence excludes a previously approved destination immediately on a fresh database read; the shared read cache can delay that change by up to its normal 60-second refresh interval.
- Saved database reads share a 60-second cache. Failed database reads are not cached as healthy empty feeds; an existing cached result can remain available. Publication and access expiry checks are applied again when selecting cards.
- Provider failures and missed successful polls produce stale notices. A successful empty provider reply records a healthy poll, adds no articles and preserves still-eligible saved records.
- A failed run consumes its slot. There are no unlimited or automatic same-slot retries. After fixing configuration, the next scheduled slot can try again. Authenticated manual seed requests use the same guard and budgets.

## Deployment setup and remaining checks

The user deployed the news changes on 3 October. The authenticated seed completed at 00:30 UTC (8:30 AM Manila), and unauthorized access returned 401. Server database writes and reads are confirmed below. NewsData credentials, GDELT recovery and the three automatic scheduled invocations remain to be verified; local database connectivity is a separate unresolved issue.

1. Fix the active server-side `NEWSDATA_API_KEY` in the Vercel environment serving the site. The user's deployed diagnostic screenshot showed HTTP 401 for all four NewsData queries and HTTP 429 for GDELT.
2. Confirm the configured `DATABASE_URI` can reach the existing operational tables. The read-only `npm run db:check` on 3 October timed out from this workspace on both checked Supabase pooler ports, before authentication. No migration was run.
3. Set a random server-only `CRON_SECRET` in the scheduler-owning Vercel project. The local workspace has no configured secret. Vercel supplies it as a Bearer authorization header for scheduled invocations.
4. Deploy this code and `vercel.json`. Use one project as the news writer if dev and production share the same database. The common job claim protects duplicate slots, but choosing one writer makes ownership clear.
5. Run one authenticated `GET /api/ingest/news` to seed approved articles, then verify the homepage and `/?newsDebug=1`. Confirm `mode: database`, positive saved article counts and a last successful refresh time. A `skipped: true` response means this slot was already claimed; wait for the next slot.
6. Verify a request without authorization returns 401, check the three scheduled invocations, and confirm a provider refusal leaves existing eligible cards visible. For an unconfigured secret the endpoint returns 503.

Vercel cron jobs target production deployments, even when the project is being used as a dev site. Three separate daily expressions are used so each job runs once daily; confirm the deployment accepts them on the current hosting plan. Hobby scheduling can run within the configured hour, so exact-minute execution is not promised. See [Vercel cron management](https://vercel.com/docs/cron-jobs/manage-cron-jobs) and [usage limits](https://vercel.com/docs/cron-jobs/usage-and-pricing).

## Verification

Earlier manual seed attempt on 3 October 2026, before deployment: the deployed `https://enerqa-co-uk.vercel.app/api/ingest/news` returned HTTP 404. The local workspace had no configured `CRON_SECRET` or Vercel credentials, and a repeat `npm run db:check` timed out on both Supabase pooler ports (6543 and 5432) before authentication. No provider pull or database write was performed by that earlier attempt. The deployment subsequently resolved the missing live endpoint; local database connectivity still needs restoration for local builds/seeding.

Live seed after the user's deployment on 3 October 2026:

- Unauthenticated `GET /api/ingest/news` returned HTTP 401. The authenticated request returned HTTP 200, `skipped: false`, `storedItems: 41` and `storage: ok`; completion was recorded at `2026-10-03T00:30:14.706Z`.
- EIA returned 22 mapped articles and EEA returned 75. Of 97 total mapped articles, 62 passed connector relevance and 41 candidates passed the combined gate and anonymous access checks; those 41 official-source records were saved/updated. This count is not a count of fresh NewsData/GDELT stories or necessarily 41 new database rows.
- NewsData still returned HTTP 401 for all four baskets; GDELT still returned HTTP 429. The aggregate response was successful because official providers succeeded, so HTTP 200 alone does not establish news-provider recovery.
- A subsequent single credential-check request using the existing local NewsData key returned HTTP 200, `status: success` and 10 articles. The local key works for that request; Vercel may have a different value or restrictions. Sync/check the Production configuration before regenerating the key, then verify a new scheduled pull. This manual check did not seed articles or retry the job slot. See [NEWS-TROUBLESHOOTING.md](NEWS-TROUBLESHOOTING.md).
- A subsequent homepage response returned HTTP 200, three `data-news-card` elements and two `data-market-card` elements. Its `mode: database` summary contained the completed job timestamp and EIA/EEA last-success timestamps. The homepage's existing NewsData/GDELT pool retained 21 eligible saved records, with 11 returned after selection; visits made zero article access checks. Existing saved news remains usable despite the new provider refusals.
- All three automatic scheduled invocations, overlap behavior across live instances and renewed NewsData/GDELT pulls remain unverified. Fix the NewsData key, allow GDELT backoff to expire, and inspect the next scheduled job's safe diagnostics. Do not repeat this seed to bypass the slot or rate limits.

Offline tests cover database-only reads on every public news path, provider failures retaining cards, independent provider recovery, storage failures, authorization, duplicate slots, schedule conversion, access expiry, changed access verdicts, fresh scheduled upstream replies and saved-result pagination. Live manual seeding and rejected unauthorized access are now verified; automatic scheduled execution remains unverified.

The full offline suite passed: 451 tests across 53 files. TypeScript, ESLint for changed source files and `git diff --check` passed. Job-claim SQL is covered by offline assertions; real database concurrency remains part of deployment verification because this workspace could not reach Postgres.

The production build compiled successfully and completed its TypeScript phase, then failed collecting the existing `/[policy]` page because Payload could not connect to Postgres (`ECONNREFUSED`). It was run with `PAYLOAD_SCHEMA_PUSH=false`. Restoring database reachability is required to finish the build and live checks.
