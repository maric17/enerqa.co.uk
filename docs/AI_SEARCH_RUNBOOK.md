> **2 Oct 2026 repair note:** AI search is still disabled. Both `providerEnabled('openai')` and `AI_SEARCH_CONFIG.releaseReady` must pass before a paid call. The old classifier, company promotions, memory fallback and filesystem ledger described below were removed during Part 12 maintenance. Parser/UI repairs are covered by offline tests; no live model call was made. Do not enable the feature until Phase 0 and the distributed budget/session/idempotency controls in [AI-SEARCH-TASKS.md](AI-SEARCH-TASKS.md) are complete. The following runbook is the historical 26 Sep operational snapshot and needs a full operational rewrite when those controls exist.

# AI Search — Operations Runbook

**Status (26 Sep 2026): switched off** (`enabled: false` in `registry.ts`), because the feature isn't ready for public traffic. The spec's Phase 0 sign-offs don't exist, and Phase 1 doesn't work yet: the route never shows an answer. Keep it off (section 2) until `docs/AI-SEARCH-TASKS.md` clears Phase 1.

- **Spec:** `docs/reenerqawebsitedeveloperhandoff/Enerqa_AI_Search_Developer_Handoff.docx` ("§" below means its sections)
- **Task board:** `docs/AI-SEARCH-TASKS.md`

This runbook describes **what the code does today**. Where the spec asks for more, that is marked **Target** and tracked on the board.

---

## 1. What runs, and where

```text
/search?q=…  (page.tsx, server)
  └─ AIResponse.tsx (browser) ── POST /api/ai-search ──┐
                                                       ▼
                     src/app/api/ai-search/route.ts (server)
                       1. provider switch + key check
                       2. in-memory rate limits
                       3. kb-index.json word match   (local, free)
                       4. OpenAI Responses API, gpt-5.6-terra + web_search  (paid)
                       5. OpenAI chat completions, gpt-4o classifier        (paid)
                       6. cost line → ./logs/ai-search-ledger.jsonl
```

| Piece | File |
|---|---|
| On/off switch | `src/lib/api/core/registry.ts` → `openai.enabled` |
| Key | `OPENAI_API_KEY` (local `.env`; Vercel project environment variables). **Not issued yet** — the local line is empty (26 Sep 2026), so the route stops at its key check. |
| Route | `src/app/api/ai-search/route.ts` |
| Company records | `src/lib/api/ai-search/kb-index.json`, searched by `vectorStore.ts` |
| Answer UI | `src/app/(frontend)/search/AIResponse.tsx` |

The keyword results on `/search` don't depend on any of this. They come from the site's own index and keep working when AI Search is off or failing.

## 2. Turning it off and on

**Off (the default until Phase 1 passes):**

1. Set `enabled: false` on the `openai` entry in `registry.ts`.
2. Deploy.

The route then returns `503` before any paid call, and the page shows *"Search is temporarily unavailable; use site navigation or keyword search."* above the keyword results.

**Faster emergency stop:** remove `OPENAI_API_KEY` from the Vercel project's environment variables and redeploy. Env changes only apply to new deployments. The route then returns `500` before any paid call, and the page shows the same message.

**Also revoke the key** in the OpenAI dashboard if it may be exposed (section 6).

**Target (§15):** separate feature flags for search, for company cards and for each model configuration. Today there is one switch for everything, so the cards can't be turned off on their own.

## 3. Limits in force today

| Limit | Value | Where |
|---|---|---|
| All visitors, per day | 50 requests | `route.ts:26` |
| All visitors, per minute | 4 requests | `route.ts:26` |
| Per visitor, per hour | 10 requests | `route.ts:26` |
| Question length | 300 characters | `route.ts:58` |

**Caveats. Don't treat these as a budget:**
- **Per instance.** Counters live in each server instance's memory (`src/lib/forms/rateLimit.ts`). Every Vercel instance and every cold start or deploy starts again from zero.
- **Spoofable visitor key.** The "visitor" is the raw `x-forwarded-for` header, which a client can set to anything.
- **Invalid requests count.** Quota is used before the request body is checked.
- **No `Retry-After`.** The `429` doesn't carry one, and the page shows the generic failure text.

**Target (§13):** atomic shared counters; per session 5/min and 30/day; per IP 20/min and 100/day; 1 active request per session; 2,000-character questions; a 25 s total deadline.

## 4. Cost

**Once a key exists, each successful request makes at least two paid calls:**
1. The Terra answer, including one or more web searches. Nothing caps the number of searches.
2. The gpt-4o classifier, which runs every time, even though no approved company catalogue exists.

**Planning figure (§14, verified 14 Sep 2026):** about **USD 0.038 per request** (8,000 input tokens, 1,000 output tokens, one web search), or **USD 380 per 10,000 requests**. Rates:

| Item | Rate |
|---|---|
| gpt-5.6-terra input | USD 2.00 / million tokens |
| gpt-5.6-terra cached input | USD 0.20 / million tokens |
| gpt-5.6-terra output | USD 12.00 / million tokens |
| web_search | USD 10.00 / 1,000 calls, plus search content tokens |

**The ledger can't be trusted yet.**
- `route.ts` multiplies total tokens by a flat USD 0.03 per 1,000, which isn't any real rate.
- It writes to `./logs/ai-search-ledger.jsonl`. On Vercel that path is read-only, so every write fails silently (only `Ledger append error` appears in the logs).
- Until it's fixed, **the OpenAI dashboard's usage page is the only cost record.** Set a monthly budget and a hard limit on the OpenAI project too, but know the spec says a dashboard budget "is not a substitute for application admission control".
- Locally, the ledger lands in `logs/` at the repo root, which isn't gitignored. Don't commit it: each line holds a session ID.

**Target (§14):** a named owner sets a monthly budget B. Alert at 50 % and 80 %, restrict expensive paths at 90 %, stop new paid calls at 100 %. Keep an atomic reservation ledger, reconciled with actual usage.

## 5. Monitoring

**Today** there are only server logs, in the Vercel project's runtime logs for `/api/ai-search`:

| Log line | Meaning |
|---|---|
| `AI Search Error:` | The Terra call or request handling threw; the visitor got `500` |
| `Classifier failed, suppressing cards:` | The gpt-4o call or its JSON failed; the answer was still returned |
| `Ledger append error` | Normal on Vercel (read-only filesystem) — see section 4 |

There are no dashboards, no alerts and no analytics events yet.

**Target alerts (§15):**
- Provider or application errors above 5 % over 10 minutes, with at least 50 requests.
- p95 latency above 20 s for 15 minutes.
- Classifier failures above 2 %.
- Any secret exposure or unapproved company claim.
- The budget thresholds from section 4.
- A missing active knowledge owner.

## 6. Incidents

| Situation | What happens today | What to do |
|---|---|---|
| **Every answer reads "No answer generated."** | Known bug: `route.ts:87` reads `output.text`, which the SDK doesn't return. Each request is still billed. | Switch off (section 2). Fix is Phase 1 on the board. |
| **OpenAI slow or down** | No fallback. The SDK waits up to **10 minutes** and **retries twice** (its defaults; the route sets neither), so requests can hang long before a `500`. The gpt-4o branch at `route.ts:91-103` never runs, whatever the runbook used to say. | Switch off until OpenAI's status page is green. **Target:** `timeout: 18000`, `maxRetries: 0`, 25 s deadline. |
| **Visitors see "temporarily unavailable" a lot** | Usually the in-memory limits (section 3); check for `429` in the logs. | Expected at 4/min. Raise limits only after budget B exists. |
| **An Enerqa claim appears that isn't approved** | The "Relevant Company Context" panel shows any `kb-index.json` record sharing a word of 4+ letters with the question. The file has been empty since 26 Sep 2026 (its 5 unapproved records were deleted), so nothing should show until approved records are loaded. | Switch off, delete the record(s) from `kb-index.json`, redeploy. (§15: company-claim incidents disable cards immediately; today that means switching off search too.) |
| **Unexpected spend** | Limits are per instance, so parallel instances multiply them. | Switch off, then check OpenAI usage for the period. Revoke the key if the traffic isn't yours. |
| **Key may be exposed** (committed, pasted, logged) | — | Revoke it in the OpenAI dashboard **first**, create a new one, update the Vercel env var, redeploy. Deleting it from git doesn't un-publish it. |

**After any incident:** keep redacted evidence, name an incident owner, and re-run the affected checks before switching back on (§15).

## 7. Rollback

- **There is no automatic model fallback.** Rolling back means switching AI Search off (keyword results carry on) or redeploying the previous build in Vercel.
- The model IDs are hard-coded (`route.ts:83`, `:94`, `:109`), so changing a model means a code change and a deploy.
- **Target (§4, §17):** `ANSWER_MODEL` and `CLASSIFIER_MODEL` in versioned server config, a recorded known-good configuration, and a rehearsed rollback that turns off cards separately from search.

## 8. Data and privacy

- **The question text goes to OpenAI.** The browser also sends a session ID it made itself (`'session-' + Date.now()`); this is not the server-issued cookie §8 asks for.
- **OpenAI keeps each response for at least 30 days.** The route doesn't set `store: false`, and the SDK's default is to store. **Target (§4):** `store: false` (the spec notes this still isn't zero retention).
- **The ledger doesn't store the question text,** only request ID, session ID, model, tokens and an estimate. Error logs may include provider error details.
- **The privacy notice doesn't cover this yet.** `/privacy` currently shows generic placeholder text (main board, 12.10). §13: confirm provider and hosting arrangements before publishing the notice.

## 9. Before switching it on

The full list is in `docs/AI-SEARCH-TASKS.md`. At minimum:

1. **Phase 0 signed off:**
   - budget B and a named owner
   - an approved service catalogue and URL registry
   - a staging smoke test of `gpt-5.6-terra` with `web_search`
   - owners and deputies named
2. **Phase 1 fixed:**
   - answer and citation parsing
   - `store: false`, timeouts and retry settings
   - request validation, shared limits and a working cost ledger
   - the §2 states
   - tests
3. **Company cards off until Phase 2 passes:** keep `kb-index.json` empty (done 26 Sep) and turn off the classifier.
4. **This runbook rewritten** to match the new code. Names for each owner below filled in.

## 10. Owners (§17 — to be named)

| Role | Name | Deputy |
|---|---|---|
| Product owner (scope, budget, release) | — | — |
| Content owner (catalogue, claims, corrections) | — | — |
| Engineering lead | — | — |
| Operations owner (quotas, alerts, cost, incidents) | — | — |
| Privacy owner (notice, retention, deletion) | — | — |
