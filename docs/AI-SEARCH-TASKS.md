# Enerqa AI Search — Task Board

Source: `docs/reenerqawebsitedeveloperhandoff/Enerqa_AI_Search_Developer_Handoff.docx` (text copy: `….txt` in the same folder; OpenAI facts verified 14 Sep 2026). "§" numbers are that document's sections.

This is a **separate task** from `docs/HANDOFF-TASKS.md` (owner, 26 Sep 2026). That board's 12.8 covers `/search` keyword search; this one covers the generated answer behind it (`POST /api/ai-search`).

| Mark | Meaning |
|---|---|
| ✅ | Built and meets the cited section |
| 🟡 | Partly built — the gap is named on the line |
| ❌ | Not built, or built against the spec |
| 🔍 | Needs an owner decision or approved content |

---

## Status — 26 Sep 2026 (read this first)

**Checked by reading the code** against the handoff and the installed SDK (`openai` 7.23.0). No OpenAI call was made. The route has never run locally: there is no ledger file, and `/api/ai-search` doesn't appear in the dev log.

**What exists (all uncommitted):** `src/app/api/ai-search/route.ts`, `src/lib/api/ai-search/vectorStore.ts` and `kb-index.json`, a rewritten client-side `src/app/(frontend)/search/AIResponse.tsx`, an `openai` entry in `src/lib/api/core/registry.ts` (switched off on 26 Sep), and `docs/AI_SEARCH_RUNBOOK.md`. **There is no OpenAI API key:** the `OPENAI_API_KEY` line in the local `.env` is empty (checked 26 Sep; the owner confirms none exists). So the route has always stopped at its key check (`route.ts:39-41`, `500`) and has never made a paid call, locally or anywhere else. The cost and data risks below apply only once a key is added.

**Direction is right, the build is not:** the spec's choice (Responses API + `web_search`, `gpt-5.6-terra`) is what the route calls. But Phase 0 hasn't happened, Phase 1 doesn't work, and Phase 2 pieces were built ahead of their gates with invented company content.

### Do first
1. ~~**Switch it off** until Phase 0~~ — **done 26 Sep 2026**: `enabled: false` on `openai` in `registry.ts`. Checked on the dev server: `/api/ai-search` returns 503 before any paid call, `/search` shows the failure text above working keyword results, and `/data-portal/sources` no longer lists OpenAI. The OpenAI code was never committed, so production never ran it.
2. ~~**Delete the invented company records**~~ — **done 26 Sep 2026**: `kb-index.json` is now `[]`. The file was never committed, so the records never entered git history.
3. Get the **Phase 0 sign-offs** below before any further build.

---

## Phase 0 — Foundations (§17; "Launch dependencies", p. 1)

Exit gate: "Approved public corpus and a deployable configuration".

- [ ] 🔍 Product owner signs scope and a **monthly budget B**, with alerts at 50 and 80 %, restriction at 90 % and a stop at 100 % (§14 "Budget enforcement")
- [ ] 🔍 Content owner approves the **service catalogue, public claims and canonical service/contact URL registry** (§5). Until then, "Company promotions remain disabled."
- [ ] 🔍 Engineering confirms account access and runs a **staging smoke test of `gpt-5.6-terra` with `web_search`** (§4: "a candidate, not a quality guarantee")
- [ ] 🔍 Named owners and deputies: product, content, engineering, QA, operations, privacy (§17 "Ownership")
- [ ] 🔍 Privacy notice covers OpenAI processing, retention and `store: false` limits (§13 "Data handling"). Depends on HANDOFF-TASKS 12.10: `/privacy` currently shows generic placeholder text.

## Phase 1 — Research MVP (§2–§4, §8, §10, §12–§14)

Exit gate: "General search works with cards disabled".

- [x] ✅ Uses the Responses API with `web_search` and the spec's launch candidate `gpt-5.6-terra` (§4); the SDK version is fixed by `package-lock.json`
- [ ] ❌ **The answer never displays.** `route.ts:87-88` reads `research.output?.text` and `.citations`, but `output` is an array of items (`node_modules/openai/resources/responses/responses.d.ts:843`). So the answer is always "No answer generated." and there are no citations. `AIResponse.tsx:61-64` then shows that string as the answer, and fills "Sources" with Enerqa keyword hits.
  - **To do:** Walk the output items: collect `output_text` segments and their `url_citation` annotations, handle refusals, and check a web search action completed (§10 "Response parsing", §12).
- [ ] ❌ **Request settings missing** (§4, §10).
  - **To do:** Add `store: false`, `instructions` (the §11 web answer prompt), `tool_choice: 'required'`, `include: ['web_search_call.action.sources']`, `max_tool_calls: 3`, `max_output_tokens: 2400` and `external_web_access: true`. On the client, set `maxRetries: 0, timeout: 18000`: the SDK defaults are 2 retries and a 10-minute timeout, so the 25 s deadline (§3) isn't enforced.
- [ ] ❌ **The "gpt-4o fallback" never runs, and must not.** `route.ts:63` tests `'responses' in client`, which is always true with SDK 7, so the branch at `:91-103` is dead. A Terra outage throws into the outer catch and returns 500. If it did run, it would answer from model memory without web search, which §3 forbids ("A failed web branch must not yield a supposedly current answer from memory"). `docs/AI_SEARCH_RUNBOOK.md` §5 describes it as the rollback plan.
  - **To do:** Remove it. On provider failure show the §2 "Unavailable" state. Keep a known-good model configuration for rollback (§4 "Model release gate").
- [ ] ❌ **Model IDs are hard-coded** (`route.ts:83, :94, :109`).
  - **To do:** Move `ANSWER_MODEL` and `CLASSIFIER_MODEL` into a versioned server configuration (§4).
- [ ] ❌ **Admission and validation** (§3 step 1, §8, §13).
  - Unknown fields aren't rejected, and `request_id` and `session_id` aren't validated.
  - The session ID is made by the browser (`'session-' + Date.now()`, `AIResponse.tsx:51`). §8 wants it server-issued and bound to a secure same-site cookie.
  - The query cap is 300 characters (`route.ts:58`); §8 says 2,000.
  - There's no moderation screening before the paid call (§13), and no idempotency.
- [ ] ❌ **Rate limits and budget** (§13, §14).
  - The counters live in memory, one set per server instance (`route.ts:26-52`). §13 needs atomic distributed counters.
  - The visitor key is the raw `x-forwarded-for` header (`route.ts:43`), which anyone can change to dodge the per-visitor limit. The previous code used `getClientKey()`.
  - Quota is used up before the body is validated, so invalid requests spend it.
  - There's no budget reservation ledger and no monthly budget B.
  - §13's defaults are 5/min and 30/day per session, 20/min and 100/day per IP, and 1 active request per session.
- [ ] ❌ **Cost ledger** (§14).
  - The rate is a flat USD 0.03 per 1,000 tokens (`route.ts:90`). The verified rates are USD 2.00/M input, 12.00/M output and USD 10.00 per 1,000 web-search calls.
  - It appends to `./logs/ai-search-ledger.jsonl` (`route.ts:12-15`). Vercel's filesystem is read-only there, so it fails silently in production.
  - `logs/` isn't in `.gitignore`, and each entry stores the session ID.
- [ ] ❌ **Errors and response contract** (§8).
  - A missing key returns 500; §8 says 503. The 429 has no `Retry-After`.
  - Error bodies aren't `{request_id, error: {code, message, retry_after_seconds}}`.
  - The response (`answer.text`, `company_knowledge`, `call_to_action`, `status: 'success'`) isn't the §8 `SearchResult` (`schema_version: "1.0"`, `status`, `basis`, `answer[]` with citation offsets, `sources[]`, `enerqa`).
  - There are no status events.
- [ ] 🟡 **UX states** (§2, P05, P06). Loading, success and failure exist.
  - **To do:** Add the notice "AI answers can make mistakes. Check the linked sources. Please do not share confidential information." Add stop/cancel, retry, clear conversation, feedback, follow-up questions, and the clarification, weak-evidence, limited and refused states. Replace `linkifyCitations` (`AIResponse.tsx:8-20`): it looks for `[n]` markers, which the Responses API doesn't produce (it returns `url_citation` offsets, §12).
- [ ] 🟡 **Two calls per search in development.** `AIResponse.tsx:30-79` fetches from an effect. React's development Strict Mode runs effects twice, and the dev server logged two `/api/ai-search` requests per search (26 Sep). A production build calls once, but with AI on, every search during development is billed twice.
  - **To do:** Start the request from the server (or dedupe by `request_id` on the route, which §8's idempotency asks for anyway).
- [ ] 🟡 **The old guard was dropped.** The committed `AIResponse` was a server component that checked `aiAnswersEnabled()` and `aiQuota` before any call (`git show HEAD:"src/app/(frontend)/search/AIResponse.tsx"`). The new client component relies on the route alone. That's fine once the route's own admission control meets §13; until then, nothing else stops a call.
- [ ] 🟡 **Registry entry** (`registry.ts`, `openai`).
  - Its licence says "Approved for Research MVP", but no approval is recorded anywhere. It has been `enabled: false` since 26 Sep.
  - `data_portal_sources_config` has 0 rows, so `/data-portal/sources` falls back to `enabledProviders()`. While OpenAI was enabled it was listed there as a data source; switching it on again would bring that back.
  - **To do:** Record the Phase 0 approval date. Keep OpenAI out of the public Source Directory: it isn't a data provider.
- [ ] ❌ **No tests.** Nothing covers `route.ts` or `vectorStore.ts`, and `search/page.test.tsx:7` mocks `AIResponse` away.
  - **To do:** Start with §16's deterministic fixtures: no citations, malformed offsets, 429, provider timeout, duplicate request, cancelled request and exhausted budget.

## Phase 2 — Grounded company layer (§5–§9)

Must stay **disabled** until Phase 0 approves the catalogue and URL registry. It was built anyway, so each piece below is live whenever `openai` is enabled.

- [ ] 🟡 **Invented company content** (`kb-index.json`, P03 "No invented projects, clients, credentials or pricing") — **records deleted on 26 Sep 2026; the file is `[]`**. What they were, for the record:
  - The file has 5 unapproved records with none of §5's fields (`status`, `approved_by`, `effective_from`, `public_url`…). They include:
    - "Enerqa is headquartered in London": the unapproved office location removed from `/contact` on 24 Sep.
    - "carbon offset strategies": §5 says to disable carbon markets unless approved.
    - "climate modeling, environmental risk assessment".
  - `AIResponse.tsx:115-127` shows matches verbatim as "Relevant Company Context".
  - The match is any shared word of 4+ letters (`vectorStore.ts:24-45`). Tested locally on 26 Sep: the spec's own chip "What does ESG readiness involve?" returns the Data Portal record, only because both contain "does". "how does solar energy work" returns two records.
  - **To do:** Build the §5 approved-record registry and ingestion workflow, and load only records the content owner has approved.
- [ ] ❌ **Retrieval** is word matching over a JSON file, not vector-store search with attribute filters and backend re-checks of active, public, in-date records (§5 "Ingestion and retrieval", "Grounding gate").
- [ ] ❌ **Classifier** (§6, §9).
  - It uses `chat.completions` with `response_format: json_object` on `gpt-4o` (`route.ts:108-115`). §9 specifies Responses `text.format` with `json_schema` and `strict: true`, the §9 schema, and the same validated model.
  - Scores are three 0–10 numbers with made-up thresholds of 12/18/24 (`route.ts:125-131`). §6 defines four anchored components with bands; §7 defines a deterministic policy with evidence gates.
  - It runs, and bills, on every query, even though no approved catalogue exists.
- [ ] ❌ **Calls to action** (§7, §9).
  - The links (`/contact`, `/domains-and-industries`, `/knowledge-hub`) and copy are hard-coded. "Enerqa provides expertise in this domain." (`route.ts:130`) is invented copy.
  - The model's free-text service names show as "Suggested: …" (`AIResponse.tsx:143-145`). §9: "The model never supplies a final CTA URL, commercial text or authoritative display mode."
  - There's no URL registry.
- [ ] ❌ **Opt-out and cooldown** (§7, §8).
  - Dismissing one card sets a `sessionStorage` flag, which the browser then sends as `promotion_opt_out` (`AIResponse.tsx:44, :134`). The server trusts it.
  - §8 needs the opt-out as persistent server session state. §7 needs a two-turn cooldown and at most 2 cards per session.
  - Dismissing a card isn't the same as "No promotions please".

## Phases 3–5 and operations (§15–§17)

- [ ] ❌ Analytics events (§15: `search_submitted` … `request_cost_settled`)
- [ ] ❌ Dashboards, alerts, and feature flags that switch search and cards off independently (§15 "Alerts and incident response")
- [ ] ❌ Evaluation set of at least 250 labelled queries, and the §16 acceptance gates
- [ ] 🟡 `docs/AI_SEARCH_RUNBOOK.md` — rewritten on 26 Sep 2026 to describe the code as it is: the off switch, the real limits and their caveats, cost and the broken ledger, logs, an incident table, rollback, and data retention (`store` defaults to 30 days). Spec targets are marked **Target**. The old version described a gpt-4o fallback that never runs.
  - **To do:** Update it again when Phase 1 lands, and name the owners in its section 10.
- [ ] Arabic UI and RTL (P09) — Phase 2 by the spec's own plan; not started, which is expected

---

## Relationship to HANDOFF-TASKS.md

- **`docs/CLIENT_REPLY_PLAN.md` is not reliable for AI Search.** It ticks Phases 0–4 as done, including 250+ labelled queries, a load test, a gradual production traffic ramp and alerts. The 26 Sep review found none of that in the code: the AI code was never committed or deployed, has no tests, and its "approved" company records were invented. No Phase 0 approval (budget, catalogue, URL registry) is recorded anywhere in the repo. Use this board instead.

- The main handoff (pp. 13, 224) asked for a free-tier AI provider with no paid fallback. This handoff chooses a paid OpenAI setup with budget controls. For AI search, follow this document. The main board's free-tier 🔍 (12.8) is settled in favour of OpenAI once Phase 0 records the budget.
- The previous Gemini path (`search/aiAnswer.ts`, `gemini` in `registry.ts`) is no longer called by `AIResponse`; only `toAiSources` and the `AiSource` type are still used. Remove the rest once the OpenAI path passes Phase 1.
