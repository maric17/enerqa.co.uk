# Troubleshoot empty homepage news

Global News uses NewsData.io and GDELT. Major Markets can use a separate EIA RSS fallback, so market cards do not prove Global News is healthy.

News now reads approved saved articles from the database. The new authenticated `/api/ingest/news` job pulls providers three times daily, at 6 AM, 2 PM and 10 PM Manila time. See [NEWS-SCHEDULE.md](NEWS-SCHEDULE.md) for the UTC configuration, saved-article rules and deployment blockers. Browsing no longer triggers news-provider calls.

## Browser console

After deploying this change, open `https://enerqa-co-uk.vercel.app/?newsDebug=1`. Open Chrome Developer Tools → Console and filter for `[enerqa:news:homepage]`. Keep the **Info** log level enabled. The JSON summary shows each provider call, filtering counts and the number of cards available in each theme. It describes the feed rendered for that visit, including cached provider replies; adding the query does not force a refresh or spend extra provider credits.

The browser only receives safe counters, fixed failure labels and retrieval times. Raw error messages, response bodies, request URLs, API keys and database connection strings are excluded. The query controls logging only; the safe summary travels with the homepage even when logging is off.

## Vercel logs

Set `NEWS_DEBUG=true` on the Vercel environment serving this dev URL, then redeploy and load the homepage. In the deployment's runtime logs, filter for `[enerqa:news]`. Logs are enabled by default with local `npm run dev`; `NEWS_DEBUG=false` disables them. Deployed builds keep summary logging off unless explicitly enabled.

The server logs a database-read summary per `fetchNews` call and a `mode: refresh` summary per scheduled pull. The homepage normally has an `all` read for Global News and a `business` read for the EIA fallback. Provider entries on database summaries describe the latest saved job outcomes, rather than requests made by this visitor. Existing provider warnings can provide more detail in the scheduled job's runtime logs. If the page is served from a page cache, the browser summary may be available without a new runtime log.

## Read the summary

| Field or value | Meaning and next action |
| --- | --- |
| `mode: database` | The visit used saved news. Provider entries show the last scheduled pull's outcomes; `counts.received` counts eligible saved records. |
| `mode: refresh` | The scheduler ran provider work. Its `afterGate` count includes previous saved candidates considered for rechecking. |
| `refresh.lastSuccessAt` | Last successful poll per provider, separate from article retrieval and publication times. |
| No provider entries and no saved articles | No completed scheduled job is recorded yet. Configure the secret/database and run an authenticated seed job. |
| `outcome: not_configured` for NewsData | Check `NEWSDATA_API_KEY` in the Vercel environment serving this URL, then redeploy. Keep this key server-side; do not give it a `NEXT_PUBLIC_` prefix. |
| `issue: request_accounting_not_configured` | Shared database accounting is missing. Check server `DATABASE_URI`. |
| `issue: request_accounting_unavailable` | Database accounting failed before the upstream request. Follow `docs/DATABASE-TROUBLESHOOTING.md` and inspect existing server warnings. |
| `outcome: rate_limited` or `httpStatus: 429` | A quota, backoff or request-spacing rule stopped the call. Allow the pause to expire; repeated refreshes will not bypass it. |
| `httpStatus: 401` or `403` | The provider refused the request. Check credentials and account access. |
| `issue: request_timeout` | The upstream request timed out. Check subsequent server logs for recovery. |
| `issue: invalid_provider_response` | The provider returned an error payload or unreadable data. Inspect its server warning. |
| `counts.received > 0`, `relevant: 0` | Connectors produced articles, but none matched the selected topic. |
| `counts.relevant > counts.afterGate` | The allowlist, publication-date checks, duplicate removal or publisher cap removed articles. |
| `access.gated`, `access.unknown`, `access.broken` | Anonymous article-access checks rejected candidates. Keep these checks so visitors are not sent to inaccessible articles. |
| `storage: failed` | Articles passed access checks but their evidence could not be stored, so they were withheld. Check database availability. |
| `stale: true` in a provider entry | An older cached provider response is being used. Check runtime warnings for the failed refresh. |
| `counts.returned > 0` but `viewCounts.all: 0` | The provider pipeline returned articles but homepage selection removed them. Inspect `src/components/home/firstFoldNews.ts`. |

On refresh summaries, `counts.received` counts mapped connector articles, rather than every raw upstream record. `accessChecked` counts only candidates actually checked on the scheduled job. Database reads make no access-check requests. Failed recent provider outcomes can coexist with positive returned/card counts because previously approved saved articles are retained.

## Deployed diagnostics: 3 October 2026

The dev homepage showed Global News unavailable while EIA supplied two Major Markets cards. The subsequently supplied browser-console screenshot confirms the deployed diagnostics are working:

- All four NewsData topic calls returned `httpStatus: 401`, with zero articles. The provider refused authentication. A nonempty key was present, since missing configuration would have returned `not_configured` without a request; the screenshot does not establish whether the key is incorrect, expired, revoked or otherwise unauthorized.
  - Copy the active key from the NewsData account dashboard into server `NEWSDATA_API_KEY` in the Vercel environment serving this deployment. Check environment scope and any branch override, then redeploy. Do not share the key in chat or give it a `NEXT_PUBLIC_` prefix.
- GDELT returned `httpStatus: 429` and `outcome: rate_limited`. This is an upstream refusal, rather than a local budget or request-accounting classification. The exact rate-limit duration is not in this screenshot.
  - Allow the existing backoff and any upstream `Retry-After` delay to expire. Inspect GDELT runtime warnings if refusals continue; repeated refreshes do not bypass the limit.
- `received`, `relevant`, `afterGate`, `accessChecked`, `verifiedOpen` and `returned` were all zero, with `storage: not_attempted`. No articles reached filtering, access checks or record storage on this visit.
  - Reload the debug URL after updating the key and allowing the GDELT pause to expire. Confirm NewsData reports `ok`, then check article counts and visible Global News cards. Provider recovery and content restoration remain unverified.
