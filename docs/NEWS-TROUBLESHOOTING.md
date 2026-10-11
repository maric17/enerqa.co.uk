# Troubleshoot empty news sections

Global News uses NewsData.io and GDELT. Major Markets can use a separate EIA RSS fallback, so market cards do not prove Global News is healthy.

## Domain Latest News: verified 11 October 2026

The Energy, Environment and Business domain pages use **NewsData.io and GDELT** for Latest News. ReliefWeb belongs to the separate Policy and Official Updates section; its disabled/unapproved appname does not cause these news panels to be empty.

Before the coverage fix, read-only checks confirmed:

- Saved news storage is reachable. The news-provider pool contains 60 articles after the existing topic, date, source and duplicate checks, but the three domain phrase selections each return **0 cards**.
- Scheduled ingestion requests the four broad NewsData topic groups and the shared GDELT query. It does not request the domain pages' narrower query groups. Public pages match exact phrases or previously saved page-query metadata, so broad-topic retrieval alone does not guarantee domain coverage.
- The latest saved job completed at **11 October, 06:29 Manila / 10 October, 22:29 UTC**. All four NewsData calls recorded **HTTP 401**; GDELT recorded `request_accounting_unavailable`, a database usage-tracking failure before an upstream request. These are the saved job outcomes, not fresh tests of the local credentials.
- One fresh, usage-tracked local NewsData Energy request succeeded at **11 October, 10:09 Manila / 02:09 UTC**, returning ten mapped articles. The local key is therefore working for that request. No credential was printed, no article was saved by this check, and publication/access eligibility was not asserted.
- The local environment has no `CRON_SECRET`. Local page visits read saved news and do not trigger ingestion; the local authenticated ingestion endpoint is not configured. Existing shared-database job records do not prove all deployed cron slots are healthy.

## Follow-up: updated keys and local coverage fix

The user confirmed that the key was updated in both local `.env` and Vercel. A fresh tracked local Energy request at **11 October, 10:20 Manila / 02:20 UTC** returned **10 mapped NewsData articles**. The key was not printed. This confirms local request success, not deployed credentials or stored/displayable articles.

The local scheduler now requests the four broad topic groups **plus twelve unique domain groups**. Its baseline is **16 NewsData calls per pull / 48 per day**, within the unchanged shared budget. It keeps every matching query when duplicate URLs are merged, including matches retained from older saved copies. Public page reads still make no provider or article-access requests, and source, topic, date and anonymous-access checks remain active.

Verification: **108 tests in 9 files**, TypeScript and changed-source ESLint pass. Regression checks cover domain query provenance surviving duplicates, public reads making zero provider calls, budgets and skipped duplicate job slots.

The guarded refresh returned `skipped: true`, `storedItems: 0`: the **6 AM Manila** slot had already completed. The main job's claim was not reset or bypassed. The next slot begins at **2 PM Manila on 11 October**; provider success and newly visible domain cards must still be checked after that run.

A fresh GDELT probe reached the upstream-request stage but failed with a connection timeout. That failure differs from the older job's database-accounting failure and is not corrected by changing the NewsData key. Healthy NewsData pulls can still contribute independently. The deployed homepage's saved diagnostics still show the earlier **06:29 Manila** job, so they cannot yet confirm the changed Vercel key.

No Vercel project link, CLI authentication or deployment tool is available in this workspace. The coverage code has **not been deployed**. The local authenticated endpoint remains unconfigured without `CRON_SECRET`; direct maintenance used the normal database slot guard and performed no full provider pull.

Remaining actions:

- [x] Confirm the updated local NewsData key through the tracked connector. The user reports updating Vercel too; deployed request success is still unverified.
- [x] Add the domain query groups to scheduled ingestion and preserve query provenance through duplicate removal; verify tests, types and lint locally.
- [x] The user reports deploying the corrected scheduler and domain/market selection changes; public Energy and Major Markets output confirms those selection fixes. Fresh deployed key success and automatic execution still require verification.
- [ ] Check GDELT recovery during the next scheduled attempt. Retain its spacing and backoff rules; a connection timeout is different from database tracking or an upstream 429.
- [x] Verify positive eligible domain matches and visible cards on all three pages after the selection fix below. The initial manual pull alone returned zero cards.

## Explicit manual pull: 11 October, 12:44 PM Manila

The user subsequently requested a manual news pull before the next scheduled slot. Added the local operator command `npx tsx scripts/pull-news.ts --manual` and ran it once. It permits an explicitly requested pull in an already used slot while keeping the shared lease, provider budgets, spacing, backoff and access checks. The authenticated HTTP endpoint continues to enforce scheduled slots; `?manual=true` cannot enable this operator mode.

The manual job completed at **2026-10-11T04:44:49.791Z / 12:44:49 PM Manila**, with `skipped: false`, **76 saved/updated approved records** and `storage: ok`. This total includes previous eligible records, rather than 76 newly published news stories. All **16 NewsData calls succeeded**, producing 38 mapped results before duplicates and relevance/access checks. EIA returned 15 mapped records and EEA returned 75; total mapped results were 128. The job considered 84 candidates and approved 76; one was gated and seven had unknown access.

GDELT failed with `request_accounting_unavailable` before fetching upstream. Its previously saved eligible articles were retained. The aggregate `sourcesFailed: false` means at least one provider succeeded; it does not indicate that GDELT recovered. Its last successful poll remains 10 October at 06:29 UTC.

Read-only verification confirms the job state and storage are reachable. The saved eligible pool now contains 14 NewsData records and 53 GDELT records, with 65 surviving combined display gates. Nevertheless, the Energy, Environment and Business domain selections each still return **zero cards**. None of the eligible saved stories matches those pages' narrow phrases or their saved domain-query provenance. All domain query calls answered successfully, including genuinely empty replies. The solar-apartment technology story in the saved pool illustrates a coverage gap: its headline/teaser is relevant to energy, but does not contain the current exact energy phrases. Provider recovery and ingestion are verified; domain coverage remains unresolved and requires a reviewed matching/query adjustment, retaining the existing source, date and access checks.

Rendered verification: the local homepage and all three domain pages returned HTTP 200. The homepage rendered **three news cards**, with diagnostics containing the completed manual job timestamp. Each domain Latest News section still rendered its empty state with zero cards, matching the database selections above.

Validation of the manual option: **28 tests in 3 files**, TypeScript, changed-source/script ESLint and `git diff --check` pass. Tests cover normal scheduled claims, manual lease enforcement, fresh domain/topic calls, unavailable leases and the HTTP endpoint retaining its guard. No schema migration or code deployment was performed.

- [x] Run the explicitly authorized manual pull and verify saved records and per-provider outcomes.
- [x] Improve domain coverage with reviewed relevance rules; verify real rendered cards on all three pages. See the subsequent selection fix below.
- [ ] Diagnose GDELT request-tracking failures without removing shared accounting or rate limits.
- [ ] Deploy scheduler coverage changes and verify automatic runs with the deployed key.

## Domain matching and Major Markets selection fix: 11 October

The user reported that Energy was still empty and Major Markets still showed older content after the manual pull. A fresh read confirmed that relevant solar/fuel stories were already saved, but the Energy page's exact phrases did not select them. It also confirmed newer eligible market records dated 8 October (Guardian fuel prices) and 7 October (EIA winter energy expenditures).

Two ordering problems affected Major Markets. The shared pool applied publisher limits while records were ordered by provider preference, before sorting by publication date. Older NewsData stories could therefore exclude newer GDELT stories from the same publisher. The homepage also appended EIA commentary after already selected news, preserving an older news story first, and skipped EIA entirely when two news cards were present.

Implemented fixes:

- Domain selection recognizes reviewed related terms alongside the original query phrases. Energy includes solar, electricity, batteries, hydrogen, fuel and related energy terms. The other three domains receive appropriate climate, environmental and sustainable-business vocabulary. Original provider query groups remain unchanged, so this selection change spends no additional credits.
- Duplicate copies still prefer richer licensed metadata and retain query provenance. The surviving articles are sorted by original publication date before applying publisher limits, on ingestion and public reads.
- Major Markets always compares saved NewsData/GDELT candidates with saved EIA commentary and selects the newest publications, excluding stories already in the default Global News view. Both reads use the shared saved-news cache. Source, topic, publication-date and access checks remain active; EIA remains separately attributed and cannot supply Global News cards.

Local rendered verification returned HTTP 200 for all four domain pages and the homepage:

| Section | Visible cards | Verified result |
| --- | --- | --- |
| Energy Latest News | 3 | Fuel stories dated 10/9 October and the solar technology story dated 9 October |
| Environment Latest News | 3 | Local-food environmental impact and forest-restoration/management stories |
| Sustainable Business Latest News | 2 | Solar sustainability award and sustainability funding commentary |
| Climate Latest News | 3 | Climate policy, food-related emissions and the UN climate report |
| Homepage Major Markets | 2 | Guardian fuel-pricing story, **8 October**; EIA winter energy expenditures, **7 October**, in that order |

The page output matches native saved-record selections. Public reads perform zero article-access checks. No additional ingestion or provider probe was run for this selection fix; it uses the records already saved by the authorized manual pull. Publication dates are preserved, rather than changed to today's date.

Validation: **154 tests across 12 files**, TypeScript, changed-source ESLint and `git diff --check` pass. Regression tests cover domain vocabulary without provider calls, exclusion of unrelated/unknown-access/official news candidates, recent GDELT surviving a publisher cap, publication ordering across providers, and recent EIA replacing two older market stories. The existing no-duplicate-Global-News, outage, attribution and source-gate tests still pass.

The localhost issues are resolved. Deploy these changes to apply the selection fix to Vercel; automatic scheduling and GDELT request-tracking recovery remain separate outstanding checks.

## Deployed domain fixes and industry coverage: 11 October

The user subsequently reported pushing the previous fixes to Vercel. Public checks of `https://enerqa-co-uk.vercel.app` confirmed the Energy domain renders three news cards and Major Markets renders the Guardian 8 October fuel-pricing story followed by EIA's 7 October winter expenditures commentary. The deployed Agriculture page still rendered its empty state, matching localhost before the industry fix. The deployed ingestion endpoint returned HTTP 401 without authorization. This establishes the public fixes and endpoint protection, not a successful automatic cron invocation or a fresh deployed provider request.

Read-only selection checks found twelve of thirteen industries empty despite appropriate saved food, farming, mining, transport and data-centre stories. Those pages had only narrow handoff phrases, such as `sustainable food systems` or `food carbon footprint`, which did not select headlines about local food's environmental impact or farmers' sustainability funding.

Added reviewed related vocabulary to all thirteen industry configurations while retaining their original provider queries. Headlines must still pass the existing site-topic, source, date, duplicate and anonymous-access checks. Sector terms are checked as words/phrases: Agriculture recognizes farming, farmers, local food, food production, irrigation and aquaculture; it deliberately excludes the generic word `farm` so solar farms do not become agriculture news. There are no additional news-provider calls during page visits or in the scheduled job because of this selection change.

The Agriculture “View All Industry News” link initially retained an old empty selection from the cached Global Intelligence index. Its cache identity now includes domain/industry definitions, so changed vocabulary rebuilds the cached tags rather than retaining the previous rules for an hour. A follow-up localhost request returned HTTP 200 and the local-food story, without the previous no-results state. Scheduled ingestion still invalidates that index after a completed run.

Rendered localhost checks confirmed HTTP 200 on all thirteen industry pages, with counts matching native saved-record selections:

| Industry | Visible news cards |
| --- | --- |
| Government, Regulators and Public Institutions | 3 |
| Financial Institutions, Investors and Development Finance | 2 |
| Energy and Utilities | 3 |
| Oil, Gas and Petrochemicals | 3 |
| Industry, Manufacturing and Materials | 1 |
| Infrastructure, Real Estate and Industrial Zones | 3 |
| Transport, Logistics and Mobility | 3 |
| Water, Waste and Circular Economy | 3 |
| Agriculture, Food and Aquaculture | 3 |
| Mining and Natural Resources | 2 |
| Tourism, Hospitality and Destinations | 0 |
| Technology, Telecoms and Data Infrastructure | 3 |
| Healthcare, Education and Institutional Estates | 0 |

The Agriculture cards are local food/environmental impact, a farmer's opposition to a copper mine affecting land/water, and sustainability funding for farmers. Tourism and Healthcare/Education have no eligible sector matches in the current saved pool; their empty states remain appropriate. More specific future sourcing can improve coverage, but unrelated general climate stories must not be substituted to fill a sector panel.

Validation: 177 tests in thirteen files passed for the news pipeline, schedule/HTTP protection, contextual selection, Global Intelligence filters and homepage feeds. The additional cache-invalidation regression passed with the Global Intelligence suite (thirteen tests in two files). TypeScript, changed-source ESLint and diff checks pass. Tests cover all thirteen industries, exclusion of solar farms/unrelated farming/general climate stories from Agriculture, one completed scheduled refresh being available to homepage/domain/industry reads, and vocabulary changes invalidating stale search tags.

- [x] Confirm the user's previous deployment through real Energy and Major Markets page output.
- [x] Fix matching across all thirteen industries and verify Agriculture's three rendered cards.
- [ ] Deploy the new industry vocabulary and Global Intelligence cache fix, then recheck the live Agriculture page.
- [ ] Verify the automatic 2 PM Manila job in Vercel logs and saved completion/per-provider timestamps. Scheduled time is not guaranteed completion; Hobby invocations may start within the following hour.
- [ ] If Tourism/Healthcare coverage stays empty after healthy scheduled pulls, design budgeted sector sourcing. Do not append all 26 industry query groups to one run: that would increase NewsData from 16 to 42 calls, above the existing 25-request rolling limit.
- [ ] Resolve the separate GDELT request-tracking failure while keeping quotas and access checks.

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
  - Reload the debug URL after updating the key and allowing the GDELT pause to expire. Confirm NewsData reports `ok`, then check article counts and visible Global News cards. Fresh news-provider recovery remains unverified; the later saved-news deployment retained visible cards as described below.

## Existing key double-check: 3 October 2026

One direct credential-check request to NewsData's `/api/1/latest` using the existing key loaded by the local Next.js environment returned HTTP 200, `status: success` and 10 articles. The configured local value had no surrounding whitespace. No credential or request URL was printed, no key was regenerated, and this check did not store articles or rerun the scheduled ingestion job. It was one manual provider request, separate from the scheduled ingestion ledger.

The live homepage still reported all four NewsData baskets as HTTP 401 from the completed `2026-10-03T00:30:14.706Z` refresh. Its saved database news remained visible (three Global News cards). This establishes that the key available locally is valid for that basic request, but does not establish that Vercel has the same value or that key restrictions permit requests from Vercel. Compare the Production `NEWSDATA_API_KEY` with the working local/dashboard value, check accidental literal quotation marks and environment overrides, and redeploy. If identical, inspect NewsData key restrictions. Regeneration is not required merely because the last deployed request failed. After configuration is corrected, verify the next scheduled pull; the current slot guard will not permit another full pull in the same slot.
