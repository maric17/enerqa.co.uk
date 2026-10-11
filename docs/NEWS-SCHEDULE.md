# Saved news and three daily pulls

Implemented on 3 October 2026. News readers use approved records from the existing private `enerqa_connectors.external_records` table. Authenticated `GET /api/ingest/news` performs scheduled news-provider pulls; an explicit local operator command can perform a manual pull. This change creates no tables and requires no database migration.

## Schedule

`vercel.json` contains three separate daily jobs. Vercel uses UTC:

| Manila time (Asia/Manila) | UTC | Cron expression |
| --- | --- | --- |
| 6 AM | 10 PM on the previous UTC date | `0 22 * * *` |
| 2 PM | 6 AM | `0 6 * * *` |
| 10 PM | 2 PM | `0 14 * * *` |

As of the 11 October local industry coverage fix, each job fetches four NewsData topic baskets and twelve unique domain query groups once, plus a rotating batch of industry discovery queries. Each of the thirteen industries has one discovery query requiring both a sector term and an energy/environment/climate topic. Those thirteen queries are split into batches of five, five and three across the three daily slots. The NewsData baseline is **21 / 21 / 19 calls per pull, or 61 per day**, within the unchanged shared limits of 25 requests per 15 minutes and 150 per day. GDELT's shared `all` query is fetched once per job, EIA RSS once and the three EEA RSS channels once. Existing shared budgets, provider disable checks, request spacing and backoff remain active. The job awaits fresh replies rather than receiving an old reply while a cache refresh runs in the background.

Home, domain pages, industry pages, Global Intelligence’s first load, ordinary news search and official EIA/EEA news reads use saved records. All domain and industry page-basket configurations select saved content without extra NewsData queries during browsing. Domains and industries also use reviewed related terms, such as solar and diesel for Energy or local food and farming for Agriculture, so relevant saved stories do not need to repeat a narrow query phrase. Original page query groups are preserved. The scheduler requests the twelve domain groups and the current industry batch; industry pages select from the shared results. When a URL is returned by several queries, its saved record retains every matching query. The page recognizes its original narrow query provenance, but broad industry discovery provenance alone does not establish sector relevance: a food article quoting a university must not become a campus-estates story.

| Scheduled slot, Manila | Industry discovery batch | Total NewsData calls |
| --- | --- | --- |
| 6 AM | Government, Finance, Energy, Oil/Gas, Manufacturing | 21 |
| 2 PM | Infrastructure, Transport, Water/Waste, Agriculture, Mining | 21 |
| 10 PM | Tourism, Technology, Healthcare/Education | 19 |

Every slot still updates the shared store used by every news panel. This rotation adds daily sector discovery; it does not promise new eligible stories or a new dedicated query for every industry at every slot. The query syntax uses NewsData's documented [Boolean search operators](https://newsdata.io/documentation), with every query kept inside the existing 100-character cap.

## Interactive Global Intelligence searches

As of 11 October, Global Intelligence first reads saved news, research, official reports and disclosures from the same private table. Loading or reloading a filtered URL does not contact providers. Domains and industries come from Payload collections; topic, content type, date and geography choices come from site settings. The source filter lists enabled providers even when a provider has no saved records. Languages combine common language codes with saved metadata.

Changing a filter or keyword only edits the pending selection. Click Search or Apply filters (or submit the form with Enter) to apply that selection and request `GET /api/intelligence/search` immediately. Cards, result counts, applied-filter chips, the URL and pagination keep the last submitted selection until then. Clear All and chip removal also wait for submission. A pending-change notice explains when Apply filters is needed. This avoids spending provider requests while visitors are still choosing filters. The server requests relevant enabled providers, checks every result against the complete filter selection, and saves verified original metadata. Fresh discoveries are combined with saved verified records. NewsData and keyword research use bounded targeted searches; EIA/EEA refresh their RSS channels, and SEC refreshes submissions from its existing issuer watchlist, then those results are filtered locally. These providers do not all offer the same native facets. Unsupported constraints are enforced after retrieval. Results are limited to fetched candidates plus the saved collection; pagination is local, not an exhaustive traversal of each provider’s entire archive.

Identical normalized selections share a 60-second cache and simultaneous requests are combined. Provider-cache bypass still uses the existing shared accounting, backoff, approved publishers, dates, rights and anonymous reading checks. Interactive NewsData requests consume the same 150/day and 25/15-minute allowance as ingestion. The 61/day schedule baseline excludes these interactive calls. Heavy search traffic can reduce the allowance available to later scheduled pulls; a larger plan or fewer live news searches is the next capacity step if this occurs.

The browser cancels superseded requests and ignores old replies; cancellation does not refund upstream requests already started. Paging reuses fetched results. Failures retain matching saved cards with an explicit notice, and API keys remain server-only. ReliefWeb and DOAJ stay paused according to the existing provider registry. Initial saved research respects access-check expiry and newer refusals.

Local verification on 11 October: a real browser also confirmed zero initial search requests, one request after selecting Energy / News / NewsData, 7 visible cards, and no browser errors. First-load HTTP 200, 12 visible saved cards and zero provider attempts during rendering. An Energy / News / NewsData filter request returned HTTP 200 and 7 matching cards, `sourcesFailed: false`, with exactly one NewsData attempt in shared request accounting. This verifies the local request and database paths; deployed interactive searches had not yet been verified at that point.

Validation: the full suite passed with 557 tests across 72 files. After adding the query-metadata preservation regression, all 47 saved-news tests passed. TypeScript, changed-file ESLint, `git diff --check`, and the production build passed; the build used `PAYLOAD_SCHEMA_PUSH=false`. Interactive searches preserve existing domain/industry query evidence when updating an article.

Before the new key was added, a local Research / OpenAlex / Solar / Past 30 days request returned an explicit source failure with no upstream attempt. Shared request accounting showed 80 OpenAlex calls already used in the UTC day; the local environment has no OpenAlex key, so the configured 80/day guard correctly refused another call. No research record was fabricated or written by this check.

After the user added `OPENALEX_API_KEY` and deployed on 11 October, the deployed Solar / Research / OpenAlex / Past 30 days request succeeded at `2026-10-11T06:35:51.226Z`: HTTP 200, seven matching papers, no source failure, one recorded OpenAlex attempt and seven verified original records saved. The key was also present locally and raised the configured allowance to 800/day. The existing local server still retained its earlier provider state; restarting only this workspace's development server with `PAYLOAD_SCHEMA_PUSH=false` restored live local searches. A subsequent local Renewable Energy / Energy Domain / Research / OpenAlex search returned five cards, no source failure and one upstream attempt. No credentials were printed or written to these notes.

- [x] Verify successful live OpenAlex search after restoring provider allowance.
  - Evidence: deployed seven-paper search and local five-card search succeeded, with shared request accounting and stored access evidence checked.
- [x] Verify provider-backed interactive searches after deployment.
  - Evidence: a real browser at `https://enerqa-co-uk.vercel.app/knowledge-hub/global-intelligence` made zero initial search requests and showed twelve saved cards. Selecting Research / OpenAlex and searching `renewable energy` made one search request and showed five cards with five original Read Full Paper links. Both stages had zero browser errors.
- [ ] Deploy and verify the button-submitted filtering change.
  - Local evidence: nine focused tests, TypeScript, changed-file ESLint and `git diff --check` passed. A real browser showed twelve saved cards and zero search requests before and after editing Research / OpenAlex / `renewable energy`. Clicking Apply filters made one successful search request and showed five papers, with no source failure or browser errors. Clear All reset the controls while retaining those results and the applied URL without another request.
  - Next action: deploy the latest changes, then confirm selecting filters and typing sends no search requests until Search or Apply filters is clicked.

Provider query syntax follows [OpenAlex Boolean search](https://help.openalex.org/api/searching/) and [date and language filter rules](https://help.openalex.org/api/filtering/). OpenAlex receives native publication-date and language constraints; every result still passes the full local selection. NewsData receives up to five selected languages under its [documented language parameter](https://newsdata.io/documentation).

## What the 2 PM pull updates

The 2 PM Manila job refreshes the shared news store used by homepage Global News and Major Markets, domain Latest News, all thirteen Industry News sections, Knowledge Hub news, Global Intelligence and news search. It also updates the saved EIA/EEA news records used by their official-update panels. A successful run invalidates the `saved-news` and `global-intelligence` cache tags; pages select the updated records on subsequent reads. Cache refresh and job processing can delay visible changes beyond the scheduled start time.

A completed poll does not guarantee a different card on every page. A provider can fail independently, an otherwise healthy source can return no relevant articles, and eligibility checks can reject candidates. Previous eligible stories remain available, with their original publication dates. The free NewsData source has a publication delay of up to twelve hours. Enerqa CMS publications, tools, datasets, research connectors and other specialist providers have separate update workflows.

The three news expressions remain 6 AM, 2 PM and 10 PM Manila. Per [Vercel cron accuracy](https://vercel.com/docs/cron-jobs/manage-cron-jobs#cron-jobs-accuracy), a Hobby invocation can occur anywhere within its configured hour: the 2 PM job may start between 2 PM and 2:59 PM. Other plans invoke within the configured minute, subject to delivery/processing. Verify the actual run in Vercel Settings → Cron Jobs → View Logs rather than treating the scheduled time as confirmed completion.

## Failure and freshness rules

- A provider failure never clears previously saved articles. Healthy providers continue independently.
- Articles retain original publication and retrieval times. The last successful provider poll is stored separately and displayed as the feed refresh time.
- Repeated articles update existing provider/source records. Display deduplication uses the canonical article URL and prefers richer provider metadata.
- Publisher limits apply after deduplication and sorting by publication date. Older NewsData metadata therefore cannot consume publisher slots before newer GDELT stories. Major Markets compares eligible saved news with saved EIA commentary on every render and picks the newest publications, excluding the default Global News cards. It does not prefer older news over newer commentary because of provider order or because two news slots were already filled.
- A shared database control record claims one eight-hour schedule slot atomically. Duplicate calls in that slot skip provider work, including duplicate calls from another deployment sharing the database. A ten-minute lease also prevents overlapping runs. The route has a five-minute execution limit.
- Each provider verifies at most 80 approved articles per run, considering new results and previous saved candidates. Unverified destinations are withheld. Page visits never run those article checks.
- Existing publication-date rules still reject articles over 60 days old. Access evidence expires after seven days. Newer refused access evidence excludes a previously approved destination immediately on a fresh database read; the shared read cache can delay that change by up to its normal 60-second refresh interval.
- Saved database reads share a 60-second cache. Failed database reads are not cached as healthy empty feeds; an existing cached result can remain available. Publication and access expiry checks are applied again when selecting cards.
- Provider failures and missed successful polls produce stale notices. A successful empty provider reply records a healthy poll, adds no articles and preserves still-eligible saved records.
- A failed scheduled run consumes its slot. There are no automatic same-slot retries. After fixing configuration, the next scheduled slot can try again. Authenticated endpoint requests always use this guard, including requests containing `?manual=true`.

## Explicit manual pull

When an operator requests fresh news before the next scheduled slot, run `npx tsx scripts/pull-news.ts --manual` from the repository. It loads the local server environment and writes approved news to the configured shared database. A working `DATABASE_URI` and provider configuration are required; the local command does not need `CRON_SECRET` because it is not an HTTP endpoint.

The manual option allows one requested pull in an already used slot. It still acquires the same ten-minute lease, so an active run prevents overlap. It uses the same fresh topic/domain/current-industry requests, shared daily and rolling request limits, spacing, backoff, relevance rules and anonymous-access checks. The job records its `trigger` as `manual`, retains existing articles and reports provider failures separately from storage success. Manual runs spend additional provider credits; do not run the command repeatedly to address an upstream refusal or quota limit.

For requested industry coverage maintenance, use `npx tsx scripts/pull-news.ts --manual --industries`. This performs thirteen NewsData industry discovery calls, skips topic/domain/RSS/GDELT requests, and saves eligible results through the same access checks and job lease. It rechecks NewsData candidates, preserves the saved health and last-success times of untouched providers, and reports `diagnostics.scope: industries`. It requires the manual option; HTTP query parameters cannot select this scope. This is an operator repair command, not an extra automatic refresh schedule.

For a single-sector repair, use `npx tsx scripts/pull-news.ts --manual --industry tourism-hospitality-destinations` (substitute a configured industry slug). This sends one fresh discovery query and keeps the same lease, request budget and candidate-access checks. Unknown/empty sector selections are rejected before the lease is claimed. It avoids spending thirteen credits when only one feed needs investigation; do not repeat it to bypass a provider refusal.

After completion, verify positive saved domain matches and rendered cards. The shared read cache can take its normal 60-second refresh interval plus a background refresh to show changed records. Running the command locally does not deploy scheduler code or establish that the deployed provider key works.

## Deployment setup and remaining checks

These setup findings describe the state on 3 October. Current cron evidence from 11 October appears below.

The user deployed the news changes on 3 October. The authenticated seed completed at 00:30 UTC (8:30 AM Manila), and unauthorized access returned 401. Server database writes and reads are confirmed below. NewsData credentials, GDELT recovery and the three automatic scheduled invocations remain to be verified; local database connectivity is a separate unresolved issue.

1. Fix the active server-side `NEWSDATA_API_KEY` in the Vercel environment serving the site. The user's deployed diagnostic screenshot showed HTTP 401 for all four NewsData queries and HTTP 429 for GDELT.
2. Confirm the configured `DATABASE_URI` can reach the existing operational tables. The read-only `npm run db:check` on 3 October timed out from this workspace on both checked Supabase pooler ports, before authentication. No migration was run.
3. Set a random server-only `CRON_SECRET` in the scheduler-owning Vercel project. The local workspace has no configured secret. Vercel supplies it as a Bearer authorization header for scheduled invocations.
4. Deploy this code and `vercel.json`. Use one project as the news writer if dev and production share the same database. The common job claim protects duplicate slots, but choosing one writer makes ownership clear.
5. Run one authenticated `GET /api/ingest/news` to seed approved articles, then verify the homepage and `/?newsDebug=1`. Confirm `mode: database`, positive saved article counts and a last successful refresh time. A `skipped: true` response means this slot was already claimed; wait for the next slot.
6. Verify a request without authorization returns 401, check the three scheduled invocations, and confirm a provider refusal leaves existing eligible cards visible. For an unconfigured secret the endpoint returns 503.

Vercel cron jobs target production deployments, even when the project is being used as a dev site. Three separate daily expressions are used so each job runs once daily; confirm the deployment accepts them on the current hosting plan. Hobby scheduling can run within the configured hour, so exact-minute execution is not promised. See [Vercel cron management](https://vercel.com/docs/cron-jobs/manage-cron-jobs) and [usage limits](https://vercel.com/docs/cron-jobs/usage-and-pricing).

## Cron verification on 11 October

The user's Vercel screenshot shows the 2 PM job invoked at approximately 2:29 PM Manila and returned HTTP 200. This timing is within Hobby's documented invocation hour. A read-only check of the shared database confirmed `trigger: scheduled`, `lastAttemptAt: 2026-10-11T06:29:24.125Z` and `lastCompletedAt: 2026-10-11T06:29:52.704Z`.

- NewsData had nine upstream attempts in the preceding 15 minutes. The job sent sixteen more, reaching the site's shared 25-per-15-minute guard. Sixteen NewsData queries succeeded and the final five of the planned twenty-one were refused with `request_budget_reached`. The request ledger does not record caller origin, so the nine preceding attempts cannot be attributed individually to local searches, deployed searches or manual maintenance.
- EIA and EEA succeeded. GDELT was unavailable with `request_accounting_unavailable`; this is an internal accounting/storage-path failure, with no provider HTTP status recorded, and is separate from the NewsData rolling limit.
- Storage was `ok`, with 84 verified records processed/saved, including rechecked existing records; this does not mean 84 new articles. The aggregate HTTP 200 reflects partial provider success.
- At `2026-10-11T06:56:29.129Z`, NewsData had zero attempts in the last 15 minutes and sixty in the UTC day, below the 150/day guard. The earlier rolling window had cleared. No new provider request was made to claim upstream recovery or retry the consumed job slot.
- A subsequent public read of the deployed homepage returned HTTP 200, three Global News cards, two Major Markets cards and the latest completed-job timestamp. This confirms the saved page-read path without proving every page received a different article.

- [x] Verify the automatic 2 PM job ran and wrote its saved outcomes.
- [ ] Verify a complete NewsData scheduled batch with sufficient shared rolling allowance.
  - Next action: deploy button-submitted Global Intelligence filtering to reduce unnecessary interactive calls, avoid manual pulls near the scheduled invocation, and inspect the next job's per-query outcomes. Reserving an allowance for scheduled work is a further improvement if visitor searches continue consuming its headroom.
- [ ] Investigate GDELT's shared-request-accounting failure and verify a successful fresh scheduled pull.
  - Next action: inspect database connection/transaction timing during concurrent provider reservations; keep the existing saved stories while investigating.
- [ ] Verify the remaining 6 AM and 10 PM slots against deployed logs and stored completion timestamps.

## Historical verification on 3 October

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
