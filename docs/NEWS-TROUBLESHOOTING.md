# Troubleshoot empty homepage news

Global News uses NewsData.io and GDELT. Major Markets can use a separate EIA RSS fallback, so market cards do not prove Global News is healthy.

## Browser console

After deploying this change, open `https://enerqa-co-uk.vercel.app/?newsDebug=1`. Open Chrome Developer Tools → Console and filter for `[enerqa:news:homepage]`. Keep the **Info** log level enabled. The JSON summary shows each provider call, filtering counts and the number of cards available in each theme. It describes the feed rendered for that visit, including cached provider replies; adding the query does not force a refresh or spend extra provider credits.

The browser only receives safe counters, fixed failure labels and retrieval times. Raw error messages, response bodies, request URLs, API keys and database connection strings are excluded. The query controls logging only; the safe summary travels with the homepage even when logging is off.

## Vercel logs

Set `NEWS_DEBUG=true` on the Vercel environment serving this dev URL, then redeploy and load the homepage. In the deployment's runtime logs, filter for `[enerqa:news]`. Logs are enabled by default with local `npm run dev`; `NEWS_DEBUG=false` disables them. Deployed builds keep summary logging off unless explicitly enabled.

The server logs one summary per `fetchNews` call. The homepage normally has an `all` call for Global News and a `business` call for the EIA fallback. Four NewsData entries in the `all` summary are its four cached topic requests, followed by GDELT. Existing provider warnings can provide more detail in server logs. If the page is served from a page cache, the browser summary may be available without a new runtime log.

## Read the summary

| Field or value | Meaning and next action |
| --- | --- |
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

`counts.received` counts mapped connector articles, rather than every raw upstream record. `accessChecked` counts only the candidates actually checked; the check stops at the existing result/check limits.

## Deployment verification still needed

The dev homepage was checked on 3 October 2026: Global News showed the unavailable state while EIA supplied two Major Markets cards. That verifies the symptom, but does not identify which provider or database failure occurred on Vercel.

- Deploy the diagnostic changes to the dev environment.
- Open the debug URL and inspect the provider outcomes and filtering counts.
- Apply the indicated configuration or provider fix, then reload and confirm news cards render.
