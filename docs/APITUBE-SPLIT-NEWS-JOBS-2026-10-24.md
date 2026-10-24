# Separate general, stock and industry refresh jobs — 24 October 2026

Implemented and validated on `trial/apitube-news-2026-10-24`. Stock commentary now has
its own scheduled function, separate from general/domain discovery and the three
industry batches. The evidence below verifies local behavior; production deployment
and actual scheduled execution must be checked separately after release.

## Schedule and request budget

Every cycle searches all thirteen industries. The local cron configuration spaces
the five jobs one hour apart. Each job still runs three times daily, eight hours
apart. All times below are Manila time:

| Unit | Route | Daily Manila times | APITube searches |
| --- | --- | --- | ---: |
| General/homepage/domain news | `/api/ingest/news` | 6 AM, 2 PM, 10 PM | 4 |
| Stock commentary | `/api/ingest/news/stocks` | 7 AM, 3 PM, 11 PM | 3 |
| First five industries | `/api/ingest/news/industries-1` | 8 AM, 4 PM, midnight | 5 |
| Next five industries | `/api/ingest/news/industries-2` | 9 AM, 5 PM, 1 AM | 5 |
| Last three industries | `/api/ingest/news/industries-3` | 10 AM, 6 PM, 2 AM | 3 |

The cycle starting at 10 PM finishes at 2 AM the following day. Vercel expressions
use UTC; the existing eight-hour cycle calculation keeps all five jobs in the
same cycle across both UTC and Manila midnight. The last industry batch runs four
hours after general discovery. Production activation still requires deployment.

That is 20 requests per cycle, or 60 per day before retries/manual searches.
The existing 80-request daily cap, eight-per-minute limit, serialized local
requests, shared database accounting and 8.5-second request spacing remain in
place. Each HTTP invocation retains its 300-second maximum duration. Confirm
actual runtime and the hosting plan's scheduling precision before activation.

The industry batches are deterministic and cover 5/5/3 sectors each cycle.
The old daily rotation is retained only for the older combined maintenance
path; these five scheduled routes do not use that rotation.

## Isolation and publication

- One shared pipeline performs APITube category/context screening, reviewed
  industry assignment, anonymous article-access checks and database writes.
  Each job selects a different fixed request scope; no fallback news provider
  or third-party AI is enabled.
- Stocks requests only the three market searches. Its candidates must pass the
  market category/context rules before storage. Other topic stories returned by
  a market query cannot fill the stock pool.
- Existing records are rechecked only for the selected job's scope. Successful
  writes upsert article records and do not delete other jobs' saved news.
- Each job has a separate trial control record, such as
  `scheduled-news-apitube-v1/stocks`, with its own lease, diagnostics, attempts,
  status and successful-refresh time. No schema migration is required.
- Stock pages use stock-job health; industry heroes use their batch's health.
  A healthy general refresh cannot hide a failed stock refresh or advance its
  successful-refresh time. Saved approved stories remain available after failure.
- A partial provider failure marks the selected scheduled job failed, even if
  another query succeeded. Failed storage also prevents successful completion.
- Every endpoint requires `CRON_SECRET`. Query parameters cannot enable manual
  bypasses or choose arbitrary industry scopes. Successful storage invalidates
  the saved-news and intelligence caches through the shared HTTP handler.

## Duplicate calls and retries

A successful job is skipped when invoked again in the same eight-hour cycle.
An active lease prevents concurrent attempts of that job. A failed job can be
invoked again after a one-minute backoff, with at most two scheduled attempts
per cycle. An interrupted job becomes retryable when its ten-minute lease expires.
The next cycle resets its attempt count. Lease ownership is checked on completion.

Retrying stocks repeats that job's three searches, including any searches that
succeeded within its failed attempt. It does not repeat general or industry jobs.
Industry retries similarly repeat only their selected batch. This is job-level
retry protection, not per-query checkpointing.

Vercel does not automatically retry failed cron invocations. These changes make
failed jobs safe to reinvoke; they do not add an automatic retry scheduler.
See [Vercel cron management](https://vercel.com/docs/cron-jobs/manage-cron-jobs).

An operator can rerun one fixed job without triggering the other four:

```sh
# Retry only stock discovery through the same screening, storage and job state.
npx tsx scripts/pull-news.ts --manual --job stocks

# Run only the final industry batch, which includes tourism, technology and estates.
npx tsx scripts/pull-news.ts --manual --job industries-3
```

Explicit CLI manual runs can bypass the completed-slot/attempt guard, as before,
but still require an expired lease and the normal provider budget. The HTTP routes
never enable this bypass. Older manual scope flags remain maintenance commands;
prefer `--job` when diagnosing or retrying the new scheduled units.

## Validation

- After changing the gaps to one hour, all 24 focused route/discovery tests
  passed, including schedule mapping and cycle tracking across UTC and Manila
  midnight. Targeted ESLint and `git diff --check` passed. No provider requests
  were made for the timing change.
- All 751 tests across 92 files passed during release preparation, including the
  hourly spacing follow-up. TypeScript and ESLint for all 51 changed code files passed.
  Tests cover fixed request scopes, all thirteen sectors per cycle, market-only
  storage, partial failures, independent saved health, authentication and schedule
  mapping. No live APITube requests were made for this scheduler change.
- The production Webpack build passed in an isolated temporary copy with schema
  changes disabled; compilation reported warnings. The user's development server
  was left running. See [release validation](feedback/APITUBE-RELEASE-VALIDATION-2026-10-24.json).
- The real PostgreSQL guard statements passed eight checks against temporary
  records inside a transaction. These confirmed five independent claims,
  active-lease exclusion, retry backoff/cap/reset, successful-job duplicate skips
  and stale-token rejection. All temporary records were rolled back.
- All five routes compiled on the existing localhost server. Each refused an
  unauthenticated request with HTTP 503, explicitly reporting that `CRON_SECRET`
  is not configured locally. Authenticated route dispatch was verified in tests;
  no real authenticated refresh was attempted.
- A fresh read-only saved-feed audit still found news in all thirteen industries
  and three saved market stories. The APITube ledger stayed at 134 requests.
- [Database guard evidence](feedback/APITUBE-SPLIT-JOB-GUARDS-2026-10-24.json)
- [Local route protection](feedback/APITUBE-SPLIT-CRON-ROUTES-2026-10-24.json)
- [Saved-feed and zero-request audit](feedback/APITUBE-SPLIT-JOB-SAVED-2026-10-24.json)

## Activation still pending

- Configure `CRON_SECRET` for the deployment; local HTTP checks confirmed it is
  currently missing on the running development server. Do not paste it into chat.
- Run and time a complete five-job cycle with available API budget. Today's local
  ledger already exceeds the normal 80-request cap because earlier credential-
  verified diagnostic batches were explicitly budgeted. No cap override was used
  for this change. A real scheduled cycle was not verified here.
- Merge/deploy the reviewed trial when authorized, then verify all five actual
  scheduled outcomes and displayed results. Local development does not execute
  the `vercel.json` cron schedule by itself.
- Continue assessing London/regional stock coverage and repeated daily freshness.
  Separating jobs does not guarantee a qualifying article in every search.
