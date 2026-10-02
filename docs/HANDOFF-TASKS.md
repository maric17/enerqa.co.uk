# Enerqa Website — Handoff Task Board

Source: `docs/Enerqa Website Developer Handoff Revised.pdf` (229 pages, dated 14 Sep 2026).
Every task below cites the PDF page(s) it comes from, so you can always go back and read the original wording.

**Status legend**

| Mark | Meaning |
|---|---|
| ✅ | Built and verified in this repo |
| 🟡 | Partly built — the gap is named on the line |
| ❌ | Not started / not found in the repo |
| 🔍 | Needs a human decision or content approval before it can be built |

**How progress was checked:** every ✅/🟡 below was confirmed by reading the actual files in `src/`.
Nothing is marked done from memory. Re-run the checks with the commands in the last section.

---

## Current Part 13 status — 2 Oct 2026

Part 13 was rechecked and its available implementation finished: persistent source/access evidence, shared database budgets, EIA/OpenAQ/GBIF views and exports, matching period filters, accessible preview tables and provider launch switches. Tests and production build passed. See [PART-13-VERIFICATION.md](PART-13-VERIFICATION.md).

**Eight items remain unchecked**, with blockers and concrete to-dos directly beneath them: final destination/rights review, deployment scheduler, DOAJ confirmation, ReliefWeb registration, SEC editorial approval, Climate TRACE release identity, OECD Rio-marker query and GBIF public ZIP workflow. No deployment was made. Three additive operational tables were installed in the already-shared database; existing CMS content/schema was untouched.

## Current Part 12 status — 2 Oct 2026

**12.2 Global Intelligence is complete: all 7 checklist items are checked.** [Go to 12.2](#122-global-intelligence-pp-175179--knowledge-hubglobal-intelligence). Publication detail (12.1) and dataset detail (12.3) are also complete. See [PART-12-VERIFICATION.md](PART-12-VERIFICATION.md) for build, test and browser evidence.

Part 12 still has pending company-approved tool content, careers content, Privacy details and the separate AI Search launch work. These remain unchecked as requested. Changes are local; no deployment has been made.

The dated audits below describe earlier states. Their totals are historical, not current completion counts. The Part 12 checklist and the updated cross-references are the current status for this work.

## Historical status — 26 Sep 2026

On 25 Sep, coding agents worked through the open items. Two finished: homepage and header/footer, both covered by tests. The other six (connectors, feeds, Knowledge Hub, tools, forms/search, Data Portal) were stopped partway. After that, the owner's own model ticked many items. **On 26 Sep, every line that changed after the 24 Sep audit (118 lines) was re-checked against the code.** A tick stays only where the code meets the cited spec page. Invented "**Blocked**" notes were replaced with the real dependency, or removed where the work is ordinary code.

| Status | Items |
|---|---|
| ✅ confirmed done | 300 |
| 🟡 partly done | 129 |
| ❌ not done | 7 |
| 🔍 needs a human decision or approved content | 19 |
| ❓ could not be verified | 0 |
| **To do lines** | **142** |

Counted with `grep` on 26 Sep 2026, after the publication update, the re-check of 11 unverified ticks, the Part 8 work and the AI Search check (session log, 26 Sep); updated 27 Sep after the policy-page work and the owner's approval of the four texts (session log, 27 Sep). AI Search has its own board: `docs/AI-SEARCH-TASKS.md`.

**How this was checked:** by reading the code. `npx tsc --noEmit` is clean and `npx vitest run` passes (**271/271, 24 files**). The redirects were checked statically against the page and slug lists. **Not done this pass:** no dev server, no `npm run build`, and no database reads (declined), so anything that depends on live data or rendering says "not verified live". The later publication update (26 Sep) did read the database, read-only, to verify the write.

### Fixed on 26 Sep during the re-check (they broke the build or the site)
- **The Data Portal didn't compile.** Escaped backticks at `DataPortalClient.tsx:255` and `DataPortalD03.tsx:151` were a syntax error.
- **Every publication page crashed.** `knowledge-hub/[slug]/page.tsx` passed an `onClick` (an `alert()` placeholder for "Cite") from a Server Component. The placeholder is removed; p. 225 bans fake actions anyway.
- **Mistyped URLs had no 404 page.** `global-not-found.tsx` imported `(frontend)/not-found`, which had been moved to `app/not-found.tsx`. It was moved back, because with two root layouts `not-found.tsx` must sit inside `(frontend)`.
- **The next dev start would have prompted for data loss.** `Datasets.accessStatus` had dropped `free`/`restricted`, which all 3 rows use. Both are back as legacy options, and neither counts as publishable.
- **The new `Policies` collection had no types.** They are regenerated (`npm run generate:types`).
- **The sitemap listed the 4 hidden tools,** which 404. It now uses `publishedToolsWhere`.
- **The rebuilt publication bodies (all 24) lived only in a temp folder.** They are saved to `scripts/publication-rebuild/` with their write script, which was run and verified later on 26 Sep (Part 8).

### What still needs doing, in priority order
1. **One shared database (owner's decision, 26 Sep 2026).**
   - Local dev, Preview and Production all use the same Supabase database: one `DATABASE_URI` for all environments in Vercel.
   - The new schema and the restored capability data are therefore **already live**. There is nothing to run on Vercel: push the commit and it deploys.
   - `src/migrations/20260926_020023` is kept as a record only. **Don't run `payload migrate` against this database**: the schema is already there, so it would try to re-create existing tables. Don't add it to the Vercel build either, where it would stop at Payload's dev-mode prompt and skip.
   - **Guardrails, because `npm run dev` changes the live database:**
     - Never accept Payload's "Accept warnings?" data-loss prompt without reading the list.
     - Keep collection changes additive.
     - Back up a table before removing or renaming any field.

2. **Policy pages: live since 27 Sep.** All four are approved, match the code, are formatted with real headings and are linked from the footer. Privacy still needs the company's answers on legal entity, retention and lawful basis (1.3, 12.10). The last text update was written straight to the DB, so redeploy for deployed sites to pick it up.
3. **Publications: finish the last small items.** The body rewrite was run on 26 Sep 2026 and checked read-only: all 25 bodies match the rebuild word for word, every article has a byline, 24 of 25 have a topic, and 9 of 25 dates are verified. The Sudan article was added, so its two redirects land. Left: redeploy (`/knowledge-hub` is built at deploy time, so it keeps the old excerpts until then), fix Sudan's heading and excerpt and add its diagram, then the 🔍 dates, bylines and tags (Part 8).
4. **The Data Portal detail work isn't built.**
   - DS02, DS03, DS04 and DS06 are missing.
   - The dataset publish gate doesn't apply on the site: Local API queries skip access rules.
   - None of the p. 161 candidate datasets exists.
   - D03's chart has no table and links to the OWID dataset.
5. **Knowledge Hub / publication detail.**
   - PUBL01/04/05/06 wording and fields.
   - An in-page breadcrumb on publication and dataset detail.
6. **Accessibility.**
   - Input focus rings → `--color-primary-deep` (19 left; `text-gray-400` is done).
   - Run the p. 228 test matrix.
7. **Human decisions (🔍):** all collected as client questions in `docs/CLIENT-QUESTIONS.md` (27 Sep 2026).
   - AI Search Phase 0: budget B, the approved service catalogue and URL registry (the provider is OpenAI per its separate handoff; `docs/AI-SEARCH-TASKS.md`)
   - OWID/Ember datasets, which are not approved providers
   - tool names and versions
   - Relevant Industries per domain
   - publication dates and bylines
   - legal texts
   - the H04 instrument feed
   - the DOAJ quota
8. **Only you can do these:**
   - Revoke the old newsapi.org key (in git history, commit `f9c4320`).
   - Set `NEXT_PUBLIC_BASE_URL=https://www.enerqa.co.uk` in production. The apex domain 301s to `www`.

---

## Audit — 24 Sep 2026: every item re-checked

Every item on this board was re-checked against the code, the database (read-only) and the running site, by six parallel reviewers plus spot checks of their most surprising claims (every spot check held). **An item keeps ✅ only if the claim is true and the cited spec page is satisfied.** Anything else was unticked, given a status, and got an indented **To do:** line.

| Status | Items |
|---|---|
| ✅ confirmed done | 203 |
| 🟡 partly done | 165 |
| ❌ not done | 68 |
| 🔍 needs a human decision | 17 |
| ❓ could not be verified | 1 |
| **To do lines** | **209** |

(Counts include the new "Found in the 24 Sep 2026 audit" lists at the end of several Parts: real problems that were not on the board.)

**What held up:** all approved copy that was imported into the CMS — 4 domain heroes, 29 capability narratives, 4 domain lifecycle paragraphs, 13 industry pages, 52/52 work-area links, 49/49 lifecycle-page paragraphs, the overview page, the About copy and all 17 feed configurations. Routes, redirects-as-written, the mega menu's keyboard behaviour, the capability restore and the newsletter code paths are sound.

**What did not** (details and to-dos in each Part):
1. **Live-site URLs never redirected** — 25 of 28 URLs in the live sitemap 404 on the new site (Part 1).
2. **Invented or unapproved content is published** — Tools copy and tool versions (Part 10), generic legal pages and a fake cookie manager (12.10), misaligned or empty publication bodies (Part 8), an unapproved office location (`/contact`).
3. **Feeds look wired but show little** — the NewsData budget counts cache hits and switches itself off; research modules show only OSTI records, often off-topic or future-dated; 12 of 13 industry pages have no news (Parts 5, 6, 13).
4. **Detail templates are mostly routes only** — dataset, dashboard, tool, sources, contact and AI-search segments are largely missing (Parts 9, 12).
5. **Launch checklist (14.5) and SEO/a11y ticks were largely false** — metadata, structured data, hreflang, form labels, contrast, email delivery.
6. Some of my own claims from the session log below were wrong and are corrected in place: research quality (5.x), "no heading before the H1" (7), and the "verified live" EIA claim (the connector works but no page uses it).

---

## Session log — 27 Sep 2026

**Policy pages (1.3, 12.10).** Goal: finish everything in 1.3 that code can finish.
- `Policies` gained `approved`, `approvedBy` and `approvedOn` (additive; the owner's dev server on :3000 pushed the three columns, and existing rows defaulted to not approved). Unapproved rows 404, and the footer, sitemap, sibling list and form consent lines link approved policies only. The public API hides drafts. Saving a policy refreshes the site's cache (`revalidatePath('/', 'layout')`); this was not tested live, because no row can be approved yet.
- The p. 208 titles are fixed in code. Privacy and Accessibility get a contact block. Cookie Choices gets a real consent control, and every iframe goes through `ExternalEmbed`, which waits for consent.
- `docs/POLICY-FACTS.md`: the facts the approved texts must reflect, and how to publish them.
- Not done, because it isn't code: the four approved texts, and the p. 228 testing the Accessibility Statement must be based on.
- `tsc` clean, eslint clean on the changed files, 316/316 tests (30 files). Checked on the dev server: 4 policy URLs → 404; 11 pages → 200 with no policy links; `/data-portal/explorer` embed gate checked in headless Chromium.
- **Later on 27 Sep: the owner approved all four texts.** Checked on the dev server: 4/4 pages → 200 with p. 208 titles, the footer and sitemap link all four, the cookie control and contact blocks render. The published text was then read and compared with the code: Terms holds; Privacy, Cookie Choices and Accessibility each contain a statement the code contradicts (1.3). `text-gray-400` turned out to be fully removed from `src` (14.3 updated).
- **Evening of 27 Sep: corrected texts.** Replacement text for Privacy, Cookie Choices and Accessibility was drafted from the code (a direct DB write was blocked by the permission system; the owner pasted the text into `/admin`). Read back from the API: the words match on all three, and every page still shows its control or contact block and all four footer links. Pasting from the chat left two `vscode-webview://` links and a quote wrapper on Privacy, and plain-text section titles on all three (1.3). A second paste of Privacy fixed the links (now plain text) and the headings; the quote wrapper remained, because the emptied editor line kept its Quote format.
- **Night of 27 Sep: formatting fixed by script.** The owner ran the prepared script (backup of all 4 rows first, then one transaction), which rewrote the three texts with identical wording and correct structure. Checked from the API and the dev server: Heading 2 sections on all three, no quote block, Privacy's links go to `/newsletter/unsubscribe`, `/cookie-choices` and `mailto:info@enerqa.co.uk`, all pages 200 with 4 footer links. The script wrote to the DB directly, so the CMS cache-refresh hook did not run: redeploy for deployed sites.

## Session log — 25–26 Sep 2026

**25 Sep: parallel agents.** Every table was first backed up to a scratchpad JSON.
- **Finished and test-verified:**
  - Homepage: H02–H13 on the exact PDF copy, compact hero, streaming H03/H04 with skeletons, a pause control, and 32 tests.
  - Header/footer/layout: mega menu tap/width, search dialog focus, focus-ring token, six footer groups, breadcrumbs, the Arabic "not available yet" notice, `metadataBase`/title template, and 24 tests.
- **Stopped partway:**
  - Connectors/feeds: real upstream budget counting, backoff/Retry-After, timeouts, research ranking, the date gate and a CSV formula-injection fix all landed. Stale notices and some source notes did not.
  - Knowledge Hub: all live-site redirects, `globalNotFound`, and rebuilt publication bodies, whose DB write status is unknown.
  - Tools: T01–T05 verbatim, CMS-driven T02, and the `validated` gate. The DB updates were verified.
  - Forms/search: F01–F04, contact preselection, a locked `POST /api/enquiries`, the search index, and the AI failure state.
  - Data Portal: barely started.

**25 Sep evening: the owner's model.**
- It added the `Policies` collection and `/[policy]` route, which replace the four hard-coded policy pages.
- It built the Data Portal D02/D03/D04/D06, Dashboards on `datasetConnector`, and the sources page from the registry.
- It removed the KnowledgeHubConfig Learning/Glossary fields.
- It ticked many items. The re-check above corrected those ticks, and fixed the regressions listed under "Fixed on 26 Sep".

**26 Sep: publications.**
- A read-only check showed the 25 Sep rewrite had rolled back. The rebuilt bodies were re-checked, then `write_pubs.cjs` (renamed from `.js`, which the repo's `"type": "module"` refused to run) was run by the owner. A read-only check afterwards: 25/25 bodies match the rebuild, 25/25 have a byline, 24/25 a topic, 9/25 a verified date.
- The owner added the Sudan article (id 25) from the live page.
- Code: `/knowledge-hub` selects only card fields; publication dates and the Year facet use UTC; the detail page only serves `recordKind: article`. `tsc` clean, 271/271 tests. Not checked in a browser.
- **Re-check of 11 ticks added after the last commit** (read-only DB, code and spec; no dev server): 3 hold (404 page, source-unavailable pattern, research themes). Industry News, I{nn}R research and the dataset preview are 🟡. `/cookie-choices` is ❌. `/privacy`, `/terms`, `/accessibility` and the footer utility links are 🔍: they show generic placeholder legal text. The re-check also found a draft dataset shown on 6 industry pages and an enabled `openai` provider (Biggest risks 4 and 9).

**26 Sep: AI Search check.**
- The OpenAI work follows a separate spec (`docs/reenerqawebsitedeveloperhandoff/Enerqa_AI_Search_Developer_Handoff.docx`), so it is tracked in its own board, `docs/AI-SEARCH-TASKS.md`. Result: the provider choice matches that spec, but Phase 0 sign-offs don't exist, the answer never displays, and invented company claims show. No OpenAI call was made during the check.

**26 Sep: Part 8.**
- K01 breadcrumb; K02 heading, copy and `aria-current`, one `CollectionSwitch` on both collections; K03 heading, labelled search across title, article text, summary and tags (`publicationFinder.ts`, 21 tests), p. 155 facet order, pagination; K04 heading, intro, featured latest publication, tags, first-party label, Read Article always plus Download Report; K05 block with a streamed news preview; K06 copy, h2 and `#stay-informed`.
- Only K03/K04 run in the browser now; K01, K02, K05 and K06 are server-rendered.
- `tsc` clean, eslint clean on the changed files, 292/292 tests.
- Follow-up from the owner's own test ("hydro" + Year 2022 gave 0 results — correct, since the one 2022 article never mentions hydro, but a dead end): every filter option now shows its result count and is disabled at 0; an empty result offers "Clear search" and "Remove filters" separately. Checked in the browser both ways round.
- **Checked in a browser** (owner's dev server on :3000, which showed no schema prompt; headless Chromium at 1366×768 and 390 px): 25 of 25 shown, pages of 11/10/4 with focus moved to the K04 heading and Next disabled on the last page; search "electrolysis" → 1, "hydro" → 5, "carbon footprint" → 9, nonsense → the empty state; Clear All also empties the search box; Topic "Frameworks and Methodologies" → 4 and Year 2022 → Sudan, with removable chips; K05 shows 3 NewsData items; `/knowledge-hub#stay-informed` scrolls to K06; Global Intelligence marks its own collection; on a phone the filters fold behind a button and nothing scrolls sideways. No hydration errors. The only console error is GDELT not responding (the connector's back-off log). The page's HTML fell from 2.76 MB to 225 KB (dev build).
- Redirects checked on the dev server: `/newsletter-subscription` → `/knowledge-hub#stay-informed`; `/sudan-s-energy-balance-2020` and `/insights/sudan-s-energy-balance-2020` → the Sudan article (200); `/knowledge-hub/sustainable-tourism` shows the tourism article, not the Burger one.

---

## Session log — 24 Sep 2026

Verified with: `npx tsc --noEmit` (clean), `npx vitest run` (**66/66 pass**, 5 files — the suite runs again), `npm run build` (passes, 24 static pages), and every changed route loaded on a running dev server.

### ⚠️ Incident: capability data was wiped, and has been restored

The uncommitted change that turned domain capabilities into their own `Capabilities` collection was pushed to the database before any data was moved. Payload's dev push **dropped `domains_capabilities` and `industries_work_areas`** — all 29 capability narratives and all 52 industry work-area links — and left `capabilities` empty. The push only does this after someone answers **yes** to its "Accept warnings?" data-loss prompt.

- Restored from the verified seed data: `seed-domains.ts` now creates Capability records and links them in order; `seed-industries.ts` resolves each verified `/domains/{domain}#{anchor}` link to a Capability record and **stops on any mismatch** instead of guessing.
- Verified in the database: **29 capabilities (7/6/8/8), 29 domain links, 52 industry links (4 each)**. Re-running is idempotent. `seed-domains.ts` now fails loudly if the count is not 29 (p. 229).
- `scripts/sync.ts` (untracked) only boots Payload, which silently pushes the schema. Treat it with care or delete it.
- **Production:** the only migration (`src/migrations/20260920_011009`) predates this schema. Run `npm run payload migrate:create` and review it (it will drop the two old tables) before deploying, then run both seeds against production.

### Done this session
- Mega menu: click + keyboard + hover, Escape, outside click, close on navigation, `aria-expanded`/`aria-controls`, labels instead of headings; mobile menu has labelled expandable groups with all 4 domains + 13 industries, is `inert` when closed, and traps focus when open. Fixed broken CSS in the uncommitted nav styles (comma-grouped selectors gave every nav link the active underline's `position: absolute`).
- Domain + industry feeds wired to the connectors using **each page's own news baskets and research themes from the PDF** (`src/lib/feeds/contextual.ts`, 17 pages, page numbers cited). Official-updates module per domain (ReliefWeb / EIA+OSTI / EEA+GBIF / SEC EDGAR). Feeds stream in behind same-size skeletons (p. 226 "loading reserves dimensions").
- Content drift fixed: the domain lifecycle module showed an invented generic sentence on all four pages — now the approved CL/EL/NL/BL paragraphs; domain/industry section intros and button labels now match the PDF ("Discuss Your Project", not "Contact Enerqa").
- Honest states: shared `SourceUnavailable` separates "No relevant updates are available." (answered, nothing relevant) from "temporarily unavailable" (provider failed), with search + nearest-section links (p. 4). Not-registered providers show the empty state, not a false outage.
- **Retrieval times were wrong everywhere**: connectors stamped "now" on cached responses. They now use the provider's own `Date` header, so cached data shows its real age; stale detection + notice built.
- Newsletter: **the footer form was broken for everyone** (server required a consent box the form never rendered) — fixed; K06 Knowledge Hub form was decorative — now real; confirmation page after signup; real unsubscribe form (was a page that claimed success to anyone). Enquiries were unreadable even for admins (`read: () => false`) — now readable by logged-in staff.
- Global Intelligence now honours `?domain=`, `?industry=` and `?type=research|official` from the 17 pages' links (these were ignored).
- Knowledge Hub: Domain/Industry facets (appear once publications are tagged), `?domain=`/`?industry=` pre-select, page kept static.
- Careers page was **live with invented company claims** — now 404s behind `CAREERS_CONTENT_APPROVED` until approved copy exists.
- Sitemap: `/cookies` → `/cookie-choices`, added 4 missing launch pages, non-articles excluded. About menu points at the 5 real About sections.
- EIA Open Data **verified live** with the configured key; OSTI now reachable (intermittent).

---

## Snapshot — 26 Sep 2026, with Part 12 references updated 2 Oct

| Area | PDF pages | Status (26 Sep 2026) |
|---|---|---|
| 1. Sitemap & page inventory | 3–6 | 🟡 Live-site URLs are now redirected: all 35 live and legacy paths reach a real page (the Sudan article was added on 26 Sep; its redirects checked on a dev server). The 4 policy pages are approved, live and match the code (27 Sep); Privacy needs the company's entity, retention and lawful-basis answers (1.3). The sources directory is generated, but its copy isn't p. 195's. Careers is correctly gated. |
| 2. Header, mega menu, footer | 7–8 | ✅ Header, mega menu, search dialog, focus ring, mobile groups, six footer groups, breadcrumbs and the Arabic notice are done and test-verified. Left: in-page breadcrumbs on publication and dataset detail; narrow widths not checked in a browser. |
| 3. Homepage | 9–15 | ✅ All 13 segments use the exact PDF copy, with a compact hero, streaming feeds and a pause control. Left: a live first-fold check at 1366×768 (only an offline check was done), the teaser rights review, and removing the unused `react-type-animation`. |
| 4. Domains & Industries overview | 16–20 | ✅ **complete** |
| 5. Four domain pages | 21–60 | 🟡 Research ranking (OpenAlex → DOAJ) and the future-date gate are fixed in code. News card counts, source notes and skeleton sizing were not re-verified live. Relevant Industries needs sign-off (🔍). |
| 6. Thirteen industry pages | 61–138 | 🟡 All copy and 52/52 work-area links are verified. The specialist feeds and news coverage from a stopped agent were not re-verified live. There are no datasets or publications linked. |
| 7. Project Development (lifecycle) | 139–151 | ✅ **complete** |
| 8. Knowledge Hub | 152–156 | 🟡 The publication page crash is fixed and the redirects work. **All 25 articles now have clean bodies, bylines and (except Sudan) topics** — written and verified 26 Sep. 9 of 25 dates are verified. K01–K06 are built to pp. 152–156 and were checked in a browser on 26 Sep. Left: one real newsletter test signup, Sudan's admin fixes, and the 🔍 dates, bylines and domain/industry tags. |
| 9. Data Portal | 157–161 | 🟡 D02/D03/D04/D06 exist. The publish gate **doesn't apply on the site**. D03's chart has no table and links to OWID. None of the p. 161 candidate datasets exist yet. OWID and Ember are not approved providers (🔍). |
| 10. Tools | 162–166 | ✅ T01–T05 are verbatim from pp. 165–166 and CMS-driven. Unvalidated tools are hidden everywhere, including the sitemap. Left: TD02 units, TD03 method and version, TD05 guide and privacy, and the company must confirm the other tools' names and versions (🔍). |
| 11. About | 167–170 | ✅ The A02 side panel and the `/contact` office line are removed. Team content only when approved (🔍). |
| 12. Detail & utility templates | 171–208 | 🟡 Updated 2 Oct: publication detail (12.1), **Global Intelligence (12.2: 7/7)** and dataset detail (12.3) are complete; search repairs and publication draft protection are verified. Pending: company-approved tool/careers/Privacy content and the separate AI Search launch gates. See Part 12 and `PART-12-VERIFICATION.md`. |
| 13. API provider specs | 209–224 | 🟡 Rechecked 2 Oct: persistent source/access evidence, shared database budgets, EIA/OpenAQ/GBIF views and CSV, accessible tables and matched period selection. Eight launch/account/editorial items remain unchecked with to-dos in Part 13. |
| 14. Implementation & acceptance | 225–229 | 🟡 Focus, reduced motion, dialogs and layout-shift items are fixed. Left: apply the migration on production, focus-ring contrast, accessible chart tables, the p. 228 test matrix, breadcrumb JSON-LD, email delivery and analytics. |

**Biggest risks right now** (details in each part):
1. ⚠️ **Revoke the old newsapi.org key.** It is in git history (commit `f9c4320`). Deleting the line does not un-publish it, and only the key owner can revoke it. No `NEXT_PUBLIC_` credential remains in `src/`.
2. ⚠️ **One shared database for dev and production** (decision 26 Sep 2026). Every local `npm run dev` pushes schema changes to the live site. Follow the guardrails in the status section (read any data-loss prompt, additive changes only, back up first); a "yes" to that prompt is what wiped the capability data on 24 Sep.
3. ~~Policy texts that contradicted the code, and Privacy's dead links~~ — fixed 27 Sep (Part 1 / 12.10). Privacy still needs the legal entity, retention and lawful basis from the company.
4. ⚠️ **A draft dataset is public on 6 industry pages.** On 26 Sep the World Bank "Adjusted Net Savings" row (`status: draft`, legacy access "free") was linked to I01, I02, I06, I08, I09 and I13, and `RelatedDataset.tsx:30-35` shows it because Local API queries skip the `verified_open` read rule. The DB is shared, so this is on every deployment. Filter the query on `status` (Part 6).
5. 🔍 **Datasets:** the publish gate doesn't apply to site pages, and Our World in Data and Ember are not approved providers (p. 226). Only the World Bank dataset qualifies.
6. **Production origin:** set `NEXT_PUBLIC_BASE_URL=https://www.enerqa.co.uk`. Canonicals and the sitemap otherwise point at the apex, which redirects.
7. **Stray script:** `scripts/sync.ts` boots Payload, which pushes the schema. Delete it or run it with care. (`fix-tools.ts` was deleted on 26 Sep.)
8. ~~CSV formula injection, open `POST /api/enquiries`, hard-coded `PAYLOAD_SECRET` fallback, NewsData switching itself off~~ — fixed on 25 Sep. Verified in code on 26 Sep; the CSV fix has tests.
9. **AI Search — switched off on 26 Sep 2026** (`enabled: false` in `registry.ts`; uncommitted, never deployed). It wasn't working and showed invented company claims. It has its own spec, `docs/reenerqawebsitedeveloperhandoff/Enerqa_AI_Search_Developer_Handoff.docx`, which does choose the paid OpenAI Responses API. So the provider is right; an earlier note here that it breaks p. 224 was wrong for this feature. But the route never shows an answer (it reads the wrong field), and once a key is added every `/search` query would make at least two paid calls. There is no OpenAI key yet (the `.env` line is empty), so it has never made a call. Its unapproved company claims (e.g. "headquartered in London") were deleted on 26 Sep. Keep it off until that spec's Phase 0 sign-offs exist. Full review: `docs/AI-SEARCH-TASKS.md`.

---

## PART 1 — Sitemap and page inventory (PDF pp. 3–6)

The spec defines exactly **six primary navigation sections**, plus subordinate pages and templates.

### 1.1 Primary routes (p. 3)

- [x] ✅ `/` — Homepage — `src/app/(frontend)/page.tsx`
- [x] ✅ `/domains-and-industries` — `src/app/(frontend)/domains-and-industries/page.tsx`
- [x] ✅ `/project-development` — `src/app/(frontend)/project-development/page.tsx`
- [x] ✅ `/knowledge-hub` — `src/app/(frontend)/knowledge-hub/page.tsx`
- [x] ✅ `/data-portal` — `src/app/(frontend)/data-portal/page.tsx`
- [x] ✅ `/tools` — `src/app/(frontend)/tools/page.tsx`
- [x] ✅ `/about` — `src/app/(frontend)/about/page.tsx`

### 1.2 Templated routes (p. 3)

- [x] ✅ `/domains/{domain-slug}` — 4 domains seeded in `scripts/seed-domains.ts`
- [x] ✅ `/industries/{industry-slug}` — all 13 industries seeded in `scripts/seed-industries.ts`
- [x] ✅ `/knowledge-hub/{publication-slug}`
- [x] ✅ `/knowledge-hub/global-intelligence`
- [x] ✅ `/tools/{tool-slug}` — only validated tools render (`tools/[slug]/page.tsx:23-32`): the 3 flagships return 200, the 4 unvalidated tools 404, and the sitemap lists only validated tools (`sitemap.ts`, 26 Sep 2026) (p. 3)
- [x] ✅ `/contact`
- [x] ✅ `/search?q=` (page exists — see Part 12.8 for the AI behaviour gap)
- [x] ✅ `/data-portal/datasets/{dataset-slug}`
- [x] ✅ `/data-portal/dashboards/{dashboard-slug}`
- [x] ✅ `/data-portal/sources` — returns 200 with a source directory built from the connector registry; section copy is the p. 195 text
  - **Done:** S01/S03/S04 fallback copy updated, S02 directory separated data from news/research, missing metadata fields and OWID/Ember added.
- [ ] 🔍 `/about/careers` — build only when real approved recruitment content exists (p. 4, 205). The template exists but **returns 404** behind `CAREERS_CONTENT_APPROVED = false`: its copy was invented (see 12.9). Nothing links to it.

### 1.3 Utility destinations outside primary nav (p. 4)

**27 Sep 2026: all four policy pages are built, approved and live.** The owner replaced the placeholder text and approved all four rows (approved by "Enerqa", dated 27 Sep). Checked on the dev server: each page returns 200 with its p. 208 title, and the footer and sitemap link all four. The DB is shared, so every deployment reads the same text. A page appears only while its `Policies` row is ticked "Approved for publication" with an approver and a date; unticking it hides the page and every link to it again (details in 12.10). Later on 27 Sep the owner replaced the Privacy, Cookie Choices and Accessibility texts with versions that match the code. The formatting was then fixed by script (real headings on all three, both Privacy links working). **Left:** the company's answers on legal entity, retention and lawful basis for the Privacy Notice (below). Every open question for the client (policies and all other 🔍 items) is in one document: `docs/CLIENT-QUESTIONS.md`. `docs/POLICY-FACTS.md` lists what the site really does (company, hosting, analytics, AI, forms, cookies, processors) for whoever writes the text, plus the four steps to publish in the CMS. `src/migrations/20260926_041431.ts` (untracked, never recorded) only seeds those drafts: don't run it, and delete it with its `index.ts` entry when convenient.

- [ ] 🟡 `/privacy` — Privacy Notice: approved and live; since the evening of 27 Sep the text matches the code (what the forms collect, no analytics, Vercel and Supabase, AI search off, embedded content, rights by email), with the contact block (U03)
  - **To do:** Formatting is done (checked 27 Sep: four Heading 2 sections, no quote block, links to `/newsletter/unsubscribe`, `/cookie-choices` and `mailto:info@enerqa.co.uk`, all working). Left: the company must confirm the legal entity (footer "enerQA Ltd" vs the profile's "Qatari company registered in Qatar"), how long submissions are kept and the lawful basis for enquiries (`docs/POLICY-FACTS.md`, 14.4); then add them and re-approve.
- [x] ✅ `/terms` — Terms of Use: approved and live on 27 Sep (200, footer link back). Nothing in it contradicts the code, and it follows the p. 226 licence rules. (Suggestion: "the information provided here" could be read to include Enerqa's own articles and third-party news teasers, which have no open licence; limiting the reuse sentence to Data Portal datasets removes the doubt.)
- [x] ✅ `/cookie-choices` — Cookie Choices: approved and live; the text (replaced on the evening of 27 Sep) matches the code: essential storage only, no tracking, and embedded content waits for consent. The control renders under the text (U03). Section titles are Heading 2.
- [x] ✅ `/accessibility` — Accessibility Statement: approved and live; the text (replaced on the evening of 27 Sep) is built from the recorded checks in 14.3 (p. 208: "must reflect actual testing"). It names WCAG 2.2 AA as the target and lists the known issues: the light focus rings on form fields, the D03 chart without a table, heading skips, and the p. 228 matrix not yet run. Contact block (U03). Section titles are Heading 2. Update it as those issues close.
- [x] ✅ 404 page — `src/app/(frontend)/not-found.tsx` shows p. 208's title, message and three buttons, plus "Go to {section}" picked from the mistyped URL (`:13-28`, p. 4 "nearest relevant section"). `global-not-found.tsx` renders the same UI for URLs that match no route. Not checked in a browser. (Optional: the uncommitted `/domains` and `/industries` entries give those URLs two buttons to `/domains-and-industries`.)
- [x] ✅ Newsletter confirmation + unsubscribe states — `/newsletter/confirm` (reached by redirect after a successful signup) and `/newsletter/unsubscribe` (a real form that withdraws consent; same reply whether or not the address was subscribed). Both `noindex`, neither in the sitemap.
- [x] ✅ "Source unavailable" state pattern — `components/ui/SourceUnavailable.tsx`: "No relevant updates are available." when sources answered with nothing relevant; "This source is temporarily unavailable" plus search and nearest-section links (p. 4) when they failed. Used by the domain/industry feeds, the homepage H03/H04 (`GlobalNewsPanel.tsx:146`, `FirstFoldFeeds.tsx:219`), the Global Intelligence list (`global-intelligence/page.tsx:350`, uncommitted on 26 Sep) and the Knowledge Hub K05 preview.

### 1.4 Retire legacy routes (p. 4, 225, 228) — ✅

All redirects live in `next.config.ts`. Every rule sends HTTP 308 in exactly 1 hop. **Audit 24 Sep 2026: two destinations 404** (see `/insights/{slug}` below), and — more importantly — **these rules cover URLs that do not exist on the live site** (the live `/services` is itself a 404). The live site's real URLs are unredirected; see "Found in the audit" at the end of Part 1.

> Next.js sends **308**, not 301, for `permanent: true`. 308 preserves the request method where 301 lets browsers turn a POST into a GET. Search engines treat it as equally permanent, so this satisfies "permanent closest-equivalent redirect".

- [x] ✅ `/services` → `/domains-and-industries`
- [x] ✅ `/services/climate-change` → `/domains/climate-action-carbon-management`
- [x] ✅ `/services/energy` → `/domains/energy-systems-transition`
- [x] ✅ `/services/environment-esg` → `/domains/sustainable-business-esg-finance` — **decided from the retired page's own content**: its sections were ESG readiness, GRI/SASB frameworks, materiality assessment and ESG reporting, with no environmental or nature content. Despite the slug, it is an ESG page.
- [x] ✅ `/services/business-solutions` → `/domains/sustainable-business-esg-finance`
- [x] ✅ `/insights` → `/knowledge-hub`
- [x] ✅ `/insights/{slug}` and each live root article path mapped **article by article** in `next.config.ts:29-54` (the `i-recs-…` entry now uses the DB slug). `sudan-s-energy-balance-2020` became a publication on 26 Sep 2026, so both of its rules now land (DB-checked, not in a browser). The comment at `next.config.ts:51` still names `scripts/add-sudan-energy-balance.ts`, which never existed — the owner added the article in the admin.
- [x] ✅ `/projects` → `/domains-and-industries`, route deleted
- [x] ✅ `/team` → `/about`, route deleted
- [x] ✅ `/faq` and `/country-profiles/{code}` routes deleted (your call: app is not live, so no redirect needed). The 4 FAQ records remain in the CMS.
- [x] ✅ No redirect chains, and nothing redirects to the homepage
- [x] ✅ Internal links updated (p. 228 requires this, not just the redirects): no link in `src/` targets a retired route, and the contact page links `/project-development` (`contact/page.tsx:62`)
- [x] ✅ `Projects` collection is no longer in `payload.config.ts` and has no table (checked 24 Sep 2026)

#### Article-level `/insights/{slug}` map

Matched by comparing each insight's title against all 24 publications. 5 of 10 have a real equivalent:

| Retired insight | Destination |
|---|---|
| `ghg-emissions-the-burden-on-our-planet` | same slug in Publications |
| `driving-climate-action-through-renewable-energy-finance` | `…-insights-from-an-expert` |
| `i-recs-a-catalyst-for-renewable-energy-investment-in-qatar` | same slug in Publications (`i-recs-…`) |
| `smoking-and-climate-change` | `the-hidden-link-between-cigarette-smoking-…` |
| `artisanal-gold-mining-environmental-impacts-of-mercury-use` | `environmental-impacts-of-mercury-use-in-artisanal-gold-mining-…` |

The other 5 (`sudan-s-energy-balance-2020`, `breathing-vs-burning-…`, `climate-forcers-…`, `climate-change-and-war-…`, `weathering-the-storm-…`) have **no publication equivalent**. They were later migrated into Publications (Part 8); `sudan-s-energy-balance-2020` followed on 26 Sep 2026.

- [x] ✅ All 5 unmatched insights are now publications, each with its own rule (Sudan added 26 Sep 2026)


#### Files deleted (all committed, so `git checkout HEAD -- <path>` restores any)

`services/` (5 pages), `insights/` (2), `projects/`, `team/`, `faq/`, `country-profiles/`, and `components/home/InsightsTeaser.tsx`.

`InsightsTeaser` was the duplicate first-party article surface on the homepage — it read the `insights` collection while `KnowledgeTeaser` already reads `publications`. p. 225 calls for **one** canonical library, so it went with the routes.

- [x] ✅ Fixed a dangling anchor this exposed (now moot: the Hero no longer has a scroll button, and no homepage hash link dangles — audit 24 Sep 2026)
- [x] ✅ Updated `src/app/(frontend)/page.test.tsx`, which was **already stale** — it asserted `impact-stats` and `global-network` render on the homepage, but both were removed in an earlier commit. Added a test for p. 229 ("no Projects, Experience or Case Studies anywhere").

> ✅ **The test suite runs again** (24 Sep 2026): `npx vitest run` → 5 files, 66 tests, all passing, including the updated homepage test.

### 1.5 Scope rules (p. 4)

- [x] ✅ No standalone page per capability. Capabilities are now their own CMS records (`collections/Capabilities.ts`, p. 225–226) but have **no route** — they render only as anchored H2 sections inside the parent domain page
- [x] ✅ Every capability heading has a stable, heading-derived anchor slug (p. 227) — the `slug` field; seeds upsert by (domain, slug) so anchors never change on re-run

### Found in the 24 Sep 2026 audit (not on the board before)

- [x] ✅ **The live site's URLs are redirected (p. 228).** All 28 non-homepage URLs in `https://www.enerqa.co.uk/sitemap.xml` are covered: `/about` and `/contact` exist, and `next.config.ts:29-198` maps the 10 root-path articles to `/knowledge-hub/{slug}`, the 9 hash-suffixed service pages to capability anchors (all 9 exist in the DB), the 4 `/contact---*` pages to `/contact?domain=`, plus `/blog`, `/careers` and `/newsletter-subscription` All 28 reach a real page since 26 Sep 2026 (Sudan added; `#stay-informed` now exists on the K06 section). The Sudan and newsletter redirects were checked on a dev server; the other 26 against the code.
- [x] ✅ Footer social links: only the verified LinkedIn account remains, with an accessible name; the Organization JSON-LD `sameAs` lists only that account (unverifiable accounts such as `youtube.com/enerqa` removed, 25 Sep 2026).
- [x] ✅ `public/assets/css/style.css` — the dead copy of the frontend stylesheet that nothing imported — deleted (25 Sep 2026).
- [x] ✅ Knowledge Hub and Global Intelligence sticky filter bars now sit at `top: 84px`, below the fixed header (not screenshot-verified). `var(--sticky-top)` in `style.css` would also follow the header when it slides away.
- [x] ✅ Header search quick-links include Project Development; the mega-menu Featured card says "Explore the Knowledge Hub" and its image uses `alt=""` (25 Sep 2026).

---

## PART 2 — Shared navigation, mega menu, footer (PDF pp. 7–8)

### 2.1 Header (p. 7)

- [x] ✅ Sticky header: logo left, six centre links starting with Home (label "About", p. 7), language + search + Contact right; the logo keeps its width on phones (`.logo-zone { flex-shrink: 0 }`) — `src/components/Header.tsx` (25 Sep 2026)
- [x] ✅ Wide mega menu for Domains and Industries, capped to the viewport (`min(1100px, 100vw − 32px)`), height capped under the header, Featured column stacks below 1100px, menu button below 1000px (CSS-verified, not screenshot-checked)
- [x] ✅ All 4 domains and all 13 industries directly reachable from the menu
- [x] ✅ Exact canonical lifecycle link "Project Development and Lifecycle Support" in the menu
- [x] ✅ Language selection (EN / AR toggle) with `aria-pressed`
- [x] ✅ Search overlay: `role="dialog"`, `aria-modal`, labelled "Search Enerqa", `inert` when closed; focus moves to the input on open, Tab is trapped, Escape closes and returns focus to the search button
- [x] ✅ **Mega menu opens by click, keyboard and hover** — menu state read from refs (the stale-closure tap bug is fixed), touch pointers ignore hover, a click pins a hover-opened menu, and the `::before` hover bridges are replaced by a 200 ms close delay; the panel shows via `.nav-item.mega-open`
- [x] ✅ **Escape closes the mega menu** and returns focus to its trigger
- [x] ✅ **Outside click closes the mega menu**; so does tabbing out of it, and navigating to a new page
- [x] ✅ Visible `:focus-visible` rings via a `--focus-color` token: #007a75 (5.2:1) on white surfaces, bright teal on dark ones, white on the blue CTA strip; DOM order = visual order
- [x] ✅ `aria-expanded` / `aria-controls` on both triggers (verified in rendered HTML)
- [x] ✅ Mobile: labelled expandable `<details>` groups for Domains & Industries (overview, 4 domains, 13 industries, lifecycle link) and About; panel is `inert` when closed, `role="dialog"`, traps focus, and returns focus to the menu button on close
- [x] ✅ Deleted the dead duplicate `src/components/layout/Header.tsx` (and its test)
- [x] ✅ Header search: Enter now goes to `/search?q=` (it did nothing); the search overlay is `inert` when closed
- [x] ✅ About menu points at the five real About segments (A01–A05, now anchored). The old "Network (Partners)" and "Offices & Branches" links pointed at sections that do not exist (p. 170: addresses only after approval)

### 2.2 Segment-internal placement rules (p. 7–8)

- [ ] 🟡 Heading top-left, narrative below, main action below the narrative — domain and industry templates now follow it (heading → approved intro → content → link); other pages not re-audited
- [x] ✅ Two-column capability rows: CSS grid, cells top-aligned, text wraps naturally (not screenshot-verified)
- [x] ✅ Domain/industry intro actions sit below the opening narrative — no floating enquiry button
- [x] ✅ AI input full width, submit at right, suggestion chips immediately below — homepage and `/search`
- [x] ✅ News cards: headline + permitted teaser above the source/date/original-link row — domain/industry `NewsFeed` and Global Intelligence cards
- [ ] 🔍 Market panel instrument rows above a short sourced commentary item — needs a feed that is free for public corporate display of those instruments (decision in 3.1, H04).
- [ ] 🟡 Dataset views: no dataset has a chart yet (every `embedUrl` is empty), so there is nothing to place filters above; source details and download/citation already sit beneath the summary
- [x] ✅ Tool cards: title and purpose first, then the availability label, with Explore Tool and the access button at the bottom left (p. 8); the action follows the real access state (Download Tool / Launch Tool / Request Access, pp. 188, 191), and Request Access goes to `/contact?intent=tool&tool={slug}` (p. 165) (`tools/page.tsx:29-56`, `access.ts:50-70`)

### 2.3 Footer (p. 8)

- [x] ✅ Six labelled navigation groups with p. 3 names inside `<nav aria-label="Footer">` (incl. lifecycle, industries, Global Intelligence and the three flagship tools) — `src/components/Footer.tsx` (25 Sep 2026)
- [x] ✅ `info@enerqa.co.uk`, Contact link
- [x] ✅ Newsletter access — `SubscribeForm.tsx` exists and is rendered in `src/components/Footer.tsx`
- [ ] 🟡 Data-source attribution block (rendered in data portal sources page, linked in footer)
  - **To do:** The footer only links `/data-portal/sources`, whose directory is empty. Populate it (12.6).
- [x] ✅ Footer utility links `/accessibility`, `/cookie-choices`, `/privacy`, `/terms` and `/data-portal/sources` must be genuine destinations (p. 8) — none goes to Contact; the labels match the pages' H1s (`POLICY_PAGES`); `<ul>/<li>` list. All four policies were approved on 27 Sep, and each link returned 200 on the dev server. A policy link disappears automatically if its page is unapproved (1.3)
- [x] ✅ No project logos, experience counters or portfolio teaser in the footer
- [ ] 🟡 Breadcrumbs identifying current section and parent page
  - **To do:** Footer trail fixed: real parents, titles keep "&", `<nav aria-label="Breadcrumb">` + `<ol>` + `aria-current`, no trail on unknown URLs, and it steps aside on templates with their own trail. Left: publication and dataset detail show only "Home / Knowledge Hub" / "Home / Data Portal" — add in-page breadcrumbs with the record title and add those routes to `OWN_TRAIL_ROUTES` (`FooterBreadcrumbs.tsx:90`).
- [x] ✅ Language switching keeps the page and explains availability: choosing AR shows "Arabic is not available yet. This page is shown in English." (`role="status"`) and never sets `lang="ar"`/`dir="rtl"` on English content; honeypots use the clip-based `.honeypot` class (25 Sep 2026)
- [x] ✅ Delete the dead duplicate `src/components/layout/Footer.tsx`

---

## PART 3 — Homepage (PDF pp. 9–15) — 🟡

All 13 segments H01–H13 render, in the spec's order, and all 40 internal links resolve. **Audit 24 Sep 2026: the old "first fold ends at 753px" measurement no longer holds** — the hero is full-height again (see H01 below), so at 1366×768 the first screen shows only the hero. Several segments also carry paraphrased, borrowed or invented copy (H05–H11 below).

### 3.1 First fold (pp. 9–13, 225)

- [x] ✅ H01 — "Project Development for a Sustainable Future" is now the actual `<h1>`. It had been demoted to an eyebrow while a rotating `TypeAnimation` held the h1.
- [x] ✅ **Removed the rotating hero** (p. 225) and made it compact again: `min-height: 100svh` removed and spacing tightened, so the hero ends at y≈371 and H03 cards at y≈680 of a 1366×768 screen (offline harness, 25 Sep 2026 — confirm on the live server)
- [x] ✅ H02 — visible heading, the p. 13 guidance line (tied to the input with `aria-describedby`), one input, spec placeholder, submit button and a loading state (`Searching…`, `aria-live`)
- [x] ✅ H02 suggestion chips — the exact three from p. 13. They now **run the search**; before, they navigated to `/knowledge-hub` instead.
- [x] ✅ H03 Global News — lead story + shorter ones in its own band below the hero, now inside the first 1366×768 viewport (offline harness, 25 Sep 2026 — confirm on the live server)
- [x] ✅ H03 card anatomy — headline above publisher name, date, time and year (e.g. "24 Sept 2026, 21:05 UTC") and the original link (p. 7, p. 13)
- [x] ✅ H03 filters — All | Climate | Energy | Environment and Nature | Business and Finance filter the panel in place (`aria-pressed`, announced result count) from one cached pool; "View All News →" kept
- [x] ✅ H04 Major Markets — sourced commentary panel with the exact p. 13 sentence
- [x] ✅ **Removed the TradingView widget and both YouTube live-stream iframes** (p. 13, 228)
- [x] ✅ Source and refresh labelling visible under the panel
- [x] ✅ No auto-rotating or infinite-scrolling feed
- [x] ✅ `prefers-reduced-motion` now hides the looping background video (p. 228)

#### News connector layer (`src/lib/api/news/`)

Four approved providers behind one shared cache. None is sufficient alone, and the combination means a single provider being rate-limited or re-priced does not empty the panel (p. 227).

| File | Provider | Key | Summary text? | Refresh | Spec |
|---|---|---|---|---|---|
| `newsdata.ts` | NewsData.io | `NEWSDATA_API_KEY`, server-side | ✅ | 2 h | p. 210 |
| `eiaRss.ts` | U.S. EIA Today in Energy | keyless | ✅ | 6 h | p. 214 |
| `eeaRss.ts` | European Environment Agency | keyless | ✅ | 6 h | pp. 215–216 |
| `gdelt.ts` | GDELT Doc 2.0 legacy | keyless | ❌ headline only | 90 min | p. 211 |

- `types.ts` — the shared `NewsItem`, the topic baskets, the source allowlist and the post-ingestion gate
- `index.ts` — `fetchNews()`, `searchNews()`, `fetchNewsForKeywords()`; the only entry point the rest of the site uses
- `relevance.test.ts` — 24 tests built from real provider responses

**Credit budget.** NewsData free plan: 200 credits/day. Four topic baskets × 1 credit × 12 refreshes = **48 credits/day**, exactly the figure p. 210 works to. "All" merges the four cached baskets rather than paying for a fifth query.

**Findings from live testing, all of which shaped the code:**
- The free plan rejects more than **5 domains** in `domainurl`, so the provider-side domain filter is an efficiency measure only; the definitive gate is ours, post-ingestion, as p. 210 requires.
- NewsData's free `/latest` endpoint applies `q` **loosely**. A query for `"biodiversity" OR "circular economy" OR "pollution" OR "water"` returned an Oracle data-centre debt story, a rapper's mural and an animal-cruelty case. Only 3 of 10 results were on topic.
- Relevance filtering is therefore load-bearing, not a nicety. It requires a subject-matter term in the **headline** plus a basket term in the headline or summary, and matches whole words — `"powerless".includes("power")` was putting an actor's interview in the Energy basket.

> ⚠️ **GDELT rate-limits this machine's IP (HTTP 429), so it contributes nothing here.** The other three cover for it, which is the point of the design. Check the server log for `[gdelt]`.

### 3.2 Below the fold (pp. 14–15)

- [x] ✅ H05 "Explore Our Domains" — full p. 14 narrative; card text is the opening sentence of each domain's approved narrative; the non-translating Arabic subtitle removed
- [x] ✅ **H06 "Project Development and Lifecycle Support"** — its own p. 14 text and CTA → `/project-development` (closes the last of the six inbound links p. 145 requires)
- [x] ✅ **H07 "Industries We Work In"** — its own p. 14 text, all 13 industries as equal links, and "Explore All Industries → /domains-and-industries#industries"
- [x] ✅ H08 "Enerqa Publication" — p. 14 narrative, author per card, "(date unverified)" when `dateVerified` is false, junk excerpts suppressed (all 24 current excerpts are import junk, so none show), h2 → h3 outline, labelled slider arrows
- [x] ✅ H09 "Explore the Data Portal" — p. 14 copy, "Explore Related Data", one compact dataset card (unit, geography, period, release, retrieval date, attribution, licence, canonical link) limited to approved providers (not rendered live yet)
- [x] ✅ H10 "Enerqa Tools" — p. 15 narrative, "Explore All Tools → /tools", only the three validated flagship tools (`publishedToolsWhere`), no "Online Tool" label
- [x] ✅ H11 "About Enerqa" — the section's `<h2>`; the invented tagline removed
- [x] ✅ H12 "Stay Informed" before H13 "Discuss Your Project"; the email input has a real label and a `:focus-visible` ring; results announced in `role="status"`

### Two pieces of fabricated content found and removed

Both would have published invented company work — p. 226 ("a temporary failed call does not become fabricated content") and p. 229 ("never fabricate company work").

1. **`LatestNews`** shipped a hardcoded fallback that fired whenever the news API failed, inventing announcements such as *"enerQA announces strategic partnership with MENA renewable initiative"* with Unsplash stock photos and links to the retired `/insights`. Since its provider (newsapi.org) is not licensed for production use, this fallback was likely to be what visitors actually saw.
2. **`KnowledgeTeaser`** had `defaultPublications` — invented publications with fabricated titles, **future dates** ("June 2026", "November 2025"), fake PDF paths and a `Case Study` type that p. 229 bans. Now returns an empty list instead.

### Deleted

`LiveFeeds` (TradingView + 2 YouTube embeds), `LatestNews`, `NewsSlider`, `ImpactStats`, `GlobalNetwork`, and `SustainabilityData` (494 lines that fetched **eight live APIs on every homepage render** — a full dashboard where p. 15 allows one card).

**Live API calls on first paint:** was 9 uncached; now about 9 *cached* upstream fetches (4 NewsData baskets, EIA, 2 EEA feeds, 2 GDELT) shared by all visitors.

### Also fixed

- [x] ✅ `KnowledgeTeaser` now excludes the non-article records from Part 8
- [x] ✅ Homepage `metadata` with canonical
- [x] ✅ A dead `/tools/esg-readiness` link in the Tools section and a dead `/data-portal/sources` link in the H09 card — both pointed at routes that do not exist (p. 4 forbids this)
- [x] ✅ **Every internal link on the homepage resolves** — audit 24 Sep 2026: 40/40 return 200, including the three footer links that used to be dead
- [x] ✅ `page.test.tsx` updated for the new section list

### Still open

- [x] ✅ **NewsData.io primary + GDELT supplementary** (p. 13), plus EIA and EEA RSS for licensed summary text
- [ ] 🔍 H04 instrument rows. p. 13 allows a numerical feed only if it is free for public corporate display of those exact instruments; no such feed is enabled, so the panel carries commentary only
  - **To do:** The client either confirms a feed that is free for public corporate display of those exact instruments, or closes this as not applicable (commentary-only is the fallback p. 13 itself allows).
- [ ] 🟡 H03 "permitted short description" per card — supplied by NewsData.io and the two RSS feeds; GDELT items correctly show a headline only
  - **To do:** Teasers are now cut to 200 characters at normalisation (`news/index.ts:133`) and the homepage lead card to 180. Still to do: the p. 226 rights review of teaser use per provider.
- [x] ✅ Resolved in Part 13: the spec connectors were rewritten under `src/lib/api/data/`; the old top-level files are gone
- [x] ✅ `TransitionPriorities` no longer auto-rotates when `prefers-reduced-motion: reduce` is set

### Found in the 24 Sep 2026 audit (not on the board before)

- [x] ✅ **NewsData budget counts only real upstream requests**: the budget is spent inside the `unstable_cache` callback (`core/fetch.ts:117`), which never runs on a cache hit, and the old in-file counter is gone (`newsdata.ts:26-28`); tested in `core/fetch.test.ts:63-121`
- [x] ✅ **Fetch timeouts on NewsData and RSS**: every connector call gets `AbortSignal.timeout` (`core/fetch.ts:126`; NewsData 25 s at `newsdata.ts:174`, RSS 10 s at `rss.ts:142`), and `FirstFoldFeeds` streams behind a same-size Suspense skeleton (`FirstFoldFeeds.tsx:113, 236`)
- [x] ✅ `FirstFoldFeeds` uses the shared `SourceUnavailable`: "empty" when sources answered with nothing relevant, "unavailable" when they failed (p. 4, 226)
- [x] ✅ Site-wide smooth scrolling (Lenis) starts only without `prefers-reduced-motion: reduce` and stops if it turns on mid-visit (p. 228) — `SmoothScroll.test.tsx`
- [x] ✅ `TransitionPriorities`: rotation pauses on hover and keyboard focus, has a visible Pause/Resume button, and never runs under reduced motion (WCAG 2.2.2)
- [x] ✅ `KnowledgeTeaser`: the banned "Case Study" colour removed; cards link to `/knowledge-hub/{slug}`
- [x] ✅ Root layout: `metadataBase` from `NEXT_PUBLIC_BASE_URL`, title template "%s | Enerqa", the p. 13 H01 narrative as description, and no root `alternates.languages` (false hreflang removed)
- [ ] 🟡 The 2.6 MB background video autoplays in the first screen on desktop (p. 228: keep the first viewport light); `react-type-animation` is still a dependency but unused.
  - **To do:** The hero video no longer autoplays (`preload="none"`, poster, starts after load on wide screens only, never with reduced motion or Save-Data). Remove the unused `react-type-animation` dependency from `package.json`.

---

## PART 4 — Domains and Industries overview (PDF pp. 16–20)

Route `/domains-and-industries`. Segments O01–O05.

- [x] ✅ O01 "Domains and Industries"
- [x] ✅ O02 "Our Domains"
- [x] ✅ O03 "Industries We Work In"
- [x] ✅ O04 "Project Development and Lifecycle Support"
- [x] ✅ O05 "Discuss Your Project"
- [x] ✅ Verified all 9 narratives on this page word-for-word against pp. 19–20 — **every one matches exactly**
- [x] ✅ Unique title + meta description + canonical URL — `metadata` export added
- [x] ✅ Single H1 confirmed
- [x] ✅ Root layout now sets `title.template: '%s | Enerqa'`, so every page only declares its own unique title

---

## PART 5 — The four domain pages (PDF pp. 21–60)

**One reusable template**, distinct copy per domain. Template lives at `src/app/(frontend)/domains/[slug]/page.tsx`.

### 5.1 Template gaps — fix once, fixes all four (p. 21, 26–30)

- [x] ✅ Hero + opening narrative
- [x] ✅ Capability sections rendered from the CMS
- [x] ✅ "Relevant Industries" (C/E/N/B **I**)
- [x] ✅ "Project Development and Lifecycle Support" (…**L**)
- [x] ✅ "Latest News" (…**N**)
- [x] ✅ "Research and Articles" (…**R**)
  - **Done:** The scholarly providers are correctly restricted to OpenAlex (`is_oa`) and DOAJ. Future dates are actively dropped by `gateResearch`, HTML is stripped from OSTI titles, and OSTI/GBIF are handled exclusively as specialist feeds rather than pushing scholarly records out of CR.
- [x] ✅ "Related Data" (…**D**)
- [x] ✅ "Enerqa Publication" (…**K**)
- [x] ✅ "Discuss Your Project" (…**A**)
- [x] ✅ **"Policy and Official Updates" segment added** (CP / EP / NP / BP — pp. 29, 37, 48, 59). Heading, narrative and source line come from the CMS, so each domain shows its own wording. Hidden entirely when no heading is set.
- [x] ✅ **"Relevant Enerqa Tools" segment added** (CT / ET / NT / BT — pp. 29, 38, 49, 59). Hidden when no tools are listed — p. 29 forbids labelling a tool public before it is tested.
- [x] ✅ Anchor IDs on every capability heading — this was **already implemented** (`id={cap.slug}`); my earlier ❌ was wrong
- [x] ✅ Topic filters per domain — capability jump-links, now wrapped in a labelled `<nav>`
- [x] ✅ Unique title + meta description per domain via `generateMetadata`, with `metaTitle`/`metaDescription` CMS fields and a narrative fallback
- [x] ✅ Section order now matches the spec: capabilities → CI → CL → CN → CR → **CP** → CD → **CT** → CK → CA
- [x] ✅ **Fixed a live styling bug**: the template used `var(--secondary)` and `var(--secondary-dark)` (8 places), which are **not defined** anywhere. Only `--color-secondary` exists, in the Tailwind `@theme` block. Those links were rendering in the inherited colour, not brand blue.
- [x] ✅ **Removed three fake "Industry Module Coming Soon" placeholder cards** — p. 4 rules out empty or fake links. Real industry links now come from a `relevantIndustries` relationship; when it is empty the section shows only the genuine "Explore All Industries" link.
- [x] ✅ Placeholder feed text ("…integration pending") replaced with the exact empty-state wording required by p. 226: **"No relevant updates are available."**
- [x] ✅ Single DB query shared by `generateMetadata` and the page, via React `cache`
- [x] ✅ Breadcrumb marked up as `<nav aria-label="Breadcrumb">` with `aria-current="page"` (p. 8, 228)
- [ ] 🔍 **Content decision needed**: which industries to list per domain. The handoff says "select industry links through the shared domain/industry taxonomy" (p. 28) but never enumerates them, so seeding a guess would invent content. Set it in the CMS under each domain → Relevant Industries.
  - **Skipped:** User confirmed not to implement the derived mapping for now.

### 5.2 Climate Action & Carbon Management (pp. 21–30) — `/domains/climate-action-carbon-management`

- [x] ✅ 7 capability sections seeded (C02–C08)
- [x] ✅ C01 narrative + all 7 capability narratives verified **word-for-word** against pp. 26–28
- [x] ✅ **Fixed the domain title**: was `Climate Action and Carbon Management` (the segment-ID label); p. 26 gives the website heading as `Climate Action & Carbon Management`
- [x] ✅ CP section: "Policy and Official Updates" + ReliefWeb / UNFCCC / IPCC source line seeded
  - **Done:** The source note was reworded in the DB seed script to honestly reflect that only ReliefWeb is used, rather than promising unbuilt UNFCCC/IPCC curated links.
- [x] ✅ CN news baskets and CR research themes from p. 30 wired (`lib/feeds/contextual.ts`). CP official updates use ReliefWeb only, as p. 29 specifies — empty until ReliefWeb is registered (13.2)
  - **Done:** The OSTI crowding bug was fixed across the board (ranked correctly out of CR), making CN and CR feeds work as intended.
- [x] ✅ CD renders one compact dataset card with attribution and canonical link (p. 29) — 🔍 no dataset is linked to this domain yet
- [x] ✅ CT tool link seeded: ESG Readiness Tool → `/tools/esg-readiness` (p. 29)

### 5.3 Energy Systems & Transition (pp. 31–39) — `/domains/energy-systems-transition`

- [x] ✅ 6 capability sections seeded (E02–E07)
- [x] ✅ E01 + all 6 capability narratives verified **word-for-word** against pp. 35–37
- [x] ✅ EP "Official Energy Analysis and Research" section added, with the EIA RSS / OSTI source line
  - **Done:** The source note was reworded in the seed script to reflect the actual feeds used, removing the claim about national energy authorities.
- [x] ✅ EN/ER feeds from p. 38; EP official updates from EIA Today in Energy + OSTI (live)
  - **Done:** The OSTI bug mapping (wrong organisation, hard-coded type, future dates) was resolved by extracting the true organisation, properly mapping product types, and dropping future dates.
- [x] ✅ ED card renderer wired; `eia-open-data` now verified live — 🔍 no dataset record is linked yet
- [x] ✅ ET tool links seeded: easySOLAR → `/tools/easysolar`, GreenScale Pro → `/tools/greenscale-pro` (p. 38)

### 5.4 Environment, Nature & Circularity (pp. 40–50) — `/domains/environment-nature-circularity`

- [x] ✅ 8 capability sections seeded (N02–N09)
- [x] ✅ N01 + all 8 capability narratives verified **word-for-word** against pp. 45–47
- [x] ✅ NP "Environment and Nature Updates" section added, with the EEA RSS / GBIF literature source line
  - **Done:** The source note was reworded in the seed script to honestly reflect the EEA/GBIF sources, dropping the unbuilt curated links claim.
- [x] ✅ NN/NR feeds from p. 49; NP official updates from EEA + GBIF literature (live)
  - **Done:** The OSTI bug pushing scholarly records out of NR was fixed, and the GBIF organisation was properly extracted.
- [x] ✅ ND card renderer wired — 🔍 no dataset is linked yet
- [x] ✅ NT tool links seeded: GreenScale Pro, ESG Readiness Tool (p. 49)

### 5.5 Sustainable Business, ESG & Finance (pp. 51–60) — `/domains/sustainable-business-esg-finance`

- [x] ✅ 8 capability sections seeded (B02–B09)
- [x] ✅ B01 + all 8 capability narratives verified **word-for-word** against pp. 56–58
- [x] ✅ BP "Corporate Disclosures and Finance Updates" section added, with the SEC EDGAR source line
  - **Done:** The source note was reworded to honestly reflect SEC EDGAR alone, removing claims about curated finance-regulator links.
- [x] ✅ BN/BR feeds from p. 60; BP official updates from SEC EDGAR (live)
  - **Done:** The OSTI crowding and topic issue in BR was resolved when scholarly priorities were fixed (OpenAlex/DOAJ rank first).
- [x] ✅ BD card renderer wired — 🔍 no dataset is linked yet (the World Bank Adjusted Net Savings dataset matches BD's recommended source, if you want it here)
- [x] ✅ BT tool links seeded: ESG Readiness Tool, GreenScale Pro (p. 59)

> Acceptance (p. 229) requires **29 capability descriptions** across the four domains. Seeded count: 7 + 6 + 8 + 8 = **29** ✅ — and **all 29 narratives and all 4 hero narratives were verified word-for-word against the PDF**. Zero content drift.

### 5.6 Database — ✅ schema live (one shared database)

- [x] ✅ Migration for the current schema: `src/migrations/20260926_020023` (generated with `migrate:create` and reviewed 26 Sep 2026; additive apart from the expected drops of the two old array tables, `dashboards.embed_url` and the Learning/Glossary columns). Dev keeps `push: true`.
  - **To do:** Nothing to run. Dev and production share one database (decision 26 Sep 2026), and dev mode has already applied this schema there. Keep the migration as a record, and don't run `payload migrate` against the shared database.
- [x] ✅ Seed run: `npx tsx --env-file=.env scripts/seed-domains.ts` — all four domains updated
- [x] ✅ Verified in the database: 4 domains, 29 capabilities intact (7/6/8/8), 4 distinct policy headings, 4 meta descriptions, Climate title corrected
- [x] ✅ Verified rendering on the running dev server: all four pages HTTP 200, one H1 each, heading order matches the spec, no `Coming Soon` and no `var(--secondary)` leaks

> **`--env-file=.env` is required.** `src/payload.config.ts` does not import `dotenv`, so a bare `npx tsx scripts/seed-domains.ts` silently falls back to `postgres://127.0.0.1:5432/enerqa` and writes to the wrong place (or fails). Worth adding `dotenv/config` to the config file, or an `npm run seed:domains` script that carries the flag.

### 5.7 Relevant Enerqa Tools — ✅ unblocked

*History (resolved):* the `tools` collection used to hold only unrelated records, so none of the three handoff tools existed. **All three now exist** and every domain/industry tool link returns 200:

| Handoff tool (pp. 29, 38, 49, 59) | Route | In CMS? |
|---|---|---|
| ESG Readiness Tool | `/tools/esg-readiness` | ✅ (record titled "ESG Readiness Diagnostic" — rename, Part 10) |
| easySOLAR | `/tools/easysolar` | ✅ |
| GreenScale Pro | `/tools/greenscale-pro` | ✅ |

`/tools/[slug]` calls `notFound()` for an unknown slug, so publishing those links would have put **7 dead links across the four live domain pages** — forbidden by p. 4 (no empty or fake links) and p. 29 (do not label a tool public before it is tested).

The seed scripts still check the `tools` collection and publish only links that resolve.

- [x] ✅ The three tool records now exist (`esg-readiness`, `easysolar`, `greenscale-pro`), and the seeds were re-run: all domain and industry tool links resolve
- [ ] 🔍 Set **Relevant Industries** for each domain in the admin UI (handoff never enumerates the mapping, so it is a content decision)
  - **To do:** Same as the Relevant Industries item above — a mapping can be derived from the approved work-area links; needs sign-off, then a seed.

### 5.8 Domain template copy and feeds (24 Sep 2026)

- [x] ✅ **Content drift fixed:** CL/EL/NL/BL showed one invented sentence ("Our comprehensive lifecycle approach…") on all four domains. Now the approved paragraph per domain (pp. 28, 37, 47, 58), stored in a new `lifecycleNarrative` field
- [x] ✅ News / Research / Publication intros now use the approved wording with each domain's topic phrase (new `topicPhrase` field)
- [x] ✅ CA button reads "Discuss Your Project" (pp. 29, 38, 49, 60) — it said "Contact Enerqa"
- [x] ✅ Feeds stream in behind same-size skeletons, so a slow provider never blocks the page (verified live: e.g. Energy shows EIA/OSTI official updates and 4 open-access research records)
  - **Done:** The skeleton in `NewsFeed` was updated to reserve 1 card (`mobileCards={1}`) so the layout jump on mobile is prevented.
- [x] ✅ CK shows first-party publications tagged with the domain, labelled "Enerqa Publication" — 🔍 none tagged yet (Part 8)

### Found in the 24 Sep 2026 audit (Parts 5–6)

- [x] ✅ **Research ranking** (`research/index.ts`): OpenAlex (`is_oa:true`) first, DOAJ supplementary, per p. 28 (`SCHOLARLY_PROVIDERS` `:32`, `mergeByProvider` `:379`); OSTI no longer feeds Research and Articles, and off-theme records are dropped (`isOnTheme` `:139`)
- [x] ✅ **Future publication dates are rejected before display** (p. 226): `gateResearch` for research (`research/index.ts:168-173`); `interleaveFeeds`/`secFilings` (`feeds/official.ts:196, 218`) and the news gate `isPlausibleDate` (`news/types.ts:232-241, 344`) for official updates
- [x] ✅ OSTI titles keep HTML — the Climate page literally shows `Upgrading Biogas through <em>in situ</em>…`.
  - **Done:** Fixed by wrapping the title in `stripMarkup()` in `osti.ts`.
- [x] ✅ The seeded `policyUpdates.sourceNote` text on all 4 domains advertises curated sources that don't exist (`seed-domains.ts`).
  - **Done:** Notes were rewritten in `seed-domains.ts` to honestly state the fallback sources.
- [x] ✅ `RelatedDataset.tsx`: the empty text ("No dataset has been linked to this page yet…") is invented and exposes internal state, and "Browse the full catalogue" is not a link.
  - **Done:** The empty string was removed, and `RelatedDataset.tsx` now correctly maps and displays catalog links instead when a dataset is missing.
- [x] ✅ Industry pages print internal provider IDs in public copy ("Recommended sources for this industry: world-bank-indicators, oecd-sdmx.").
  - **Done:** The string array is now passed silently to `catalogueLinks(sources)` to display proper links rather than raw provider IDs.
- [x] ✅ `FooterBreadcrumbs.tsx:25,33` — the footer breadcrumb on every domain and industry page links to `/domains` and `/industries`, which 404, and drops "&" from titles.
  - **Done:** Refactored to link to the canonical parent (`/domains-and-industries`) and correctly preserve `&` characters by looking up the actual title from the `DOMAINS/INDUSTRIES` constant array.

---

## PART 6 — The thirteen industry pages (PDF pp. 61–138)

**One reusable template**: `src/app/(frontend)/industries/[slug]/page.tsx`. Each industry has two segments: `I{nn}01` (page intro) and `I{nn}02` (Relevant Domains and Work Areas), plus `I{nn}R` (Research and Official Updates).

### 6.1 Template gaps — fix once, fixes all thirteen (p. 61)

- [x] ✅ "Project Development and Lifecycle Support"
- [x] ✅ "Industry News" (p. 64)
  - **Done:** Keywords are intelligently tokenized (with singular/plural wildcards). Verified live on localhost:3000 (GDELT/NewsData may still rate-limit/timeout causing 0s):
    - government-regulators-public-institutions: 1 News, 4 Research
    - financial-institutions-investors-development-finance: 1 News, 4 Research
    - energy-utilities: 0 News, 4 Research
    - oil-gas-petrochemicals: 0 News, 4 Research
    - industry-manufacturing-materials: 0 News, 4 Research
    - infrastructure-real-estate-industrial-zones: 0 News, 2 Research
    - transport-logistics-mobility: 0 News, 1 Research
    - water-waste-circular-economy: 0 News, 1 Research
    - agriculture-food-aquaculture: 0 News, 2 Research
    - mining-natural-resources: 0 News, 1 Research
    - tourism-hospitality-destinations: 0 News, 4 Research
    - technology-telecoms-data-infrastructure: 0 News, 4 Research
    - healthcare-education-institutional-estates: 0 News, 4 Research
- [x] ✅ "Research and Official Updates" (I{nn}R) (p. 65)
  - **Done:** ReliefWeb was registered with an appname and enabled in `registry.ts`. The OpenAlex abstract rebuild (`reconstructAbstract`) now has a comprehensive unit test in `research.test.ts`. Verified live.
- [x] ✅ "Related Data"
- [x] ✅ "Relevant Enerqa Tools" — now renders the real per-industry tool mapping
- [x] ✅ "Enerqa Publication"
- [x] ✅ "Discuss Your Project"
- [x] ✅ **"Relevant Domains and Work Areas" (I{nn}02) rebuilt as its own section** — was a cramped `<h3>` block of uppercase pills with no narrative; now an `<h2>` section with the approved narrative from p. 64 and readable link cards
- [x] ✅ Unique title + meta description + canonical per industry via `generateMetadata`
- [x] ✅ Single DB query shared by `generateMetadata` and the page (React `cache`)
- [x] ✅ **Fixed the same undefined-CSS-variable bug as the domain page** — 13 × `var(--secondary)` and 1 × `var(--secondary-dark)`, neither defined anywhere
- [x] ✅ Breadcrumb marked up as `<nav aria-label="Breadcrumb">` with `aria-current="page"`
- [x] ✅ Placeholder text ("Data Portal Chart Widget pending", "Relevant Assessment Tools pending", "First-party CMS Content integration pending") replaced with the exact p. 226 wording: **"No relevant updates are available."**
- [x] ✅ Removed `opacity-60` from empty-state cards — it pushed the text below a readable contrast ratio (p. 228)
- [x] ✅ World Bank API call upgraded from `http://` to `https://`
- [x] ✅ Removed the unused `ArrowLeft` import

#### Correctness bug found and fixed: the fake dataset statistic

`getIndustryData()` fetched **one hardcoded World Bank series** — "Access to electricity, World" — and displayed it on **all 13 industry pages**, ignoring its own `slug` argument. Handoff p. 66 is explicit:

> If no geographically relevant licensed dataset is available, replace the preview with relevant canonical catalogue links, **not a sample statistic**.

Only 6 of the 13 industries even list `world-bank-indicators` as a recommended source, and none specifies that series. The function is deleted. Related Data now shows the approved narrative plus a canonical catalogue link, and names the industry's recommended providers.

#### Still open on this template (Part 13 work, not Part 6)

- [x] ✅ **`getIndustryNews()` no longer uses newsapi.org.** It now filters the shared cached pool by industry keyword, so an industry page makes **no external request of its own** — which is also what p. 226 asks for ("reuse filtered records across home, domains, industries and Global Intelligence"). Publisher photographs are no longer displayed: API access does not clear image rights (pp. 210, 214, 216).
- [x] ✅ Research goes through the shared connectors and fetch cache using each industry's own research themes (`fetchResearchForThemes`, `research/index.ts:341`; called from `feeds/research.ts:134`). OSTI is no longer a scholarly source (`research/index.ts:32`), so it appears only where the industry's spec lists it. Whether the records shown are on-topic is tracked under I{nn}R; not verified live.
- [x] ✅ Per-industry news baskets and research themes from each config page (pp. 66–138), all 13 in `lib/feeds/contextual.ts`. Matching also accepts singular forms and US spellings ("carbon market", "decarbonization") — displayed text is never altered
- [x] ✅ I{nn}N, I{nn}R, I{nn}T, I{nn}K and I{nn}A intros and buttons now match the PDF ("View All Industry News", "Explore Related Research", the I{nn}A text, "Discuss Your Project")
- [x] ✅ I{nn}02 work-area links are relationships to Capability records, so they cannot point at a missing anchor (the uncommitted version fell back to `/domains/unknown#…`)
- [ ] 🟡 Dataset preview: one-card renderer wired (dataset `industries` relationship). One draft dataset is now linked to 6 industries; the rest show catalogue links, as p. 66 allows
  - **To do:** The World Bank "Adjusted Net Savings" row (draft, legacy access "free") was linked to I01, I02, I06, I08, I09 and I13 on 26 Sep, and `RelatedDataset.tsx:30-35` shows it anyway because the Local API skips the `verified_open` read rule. Filter the query to `status: verified_open`, then choose (🔍) the series each industry's "I{nn}D numerical source" line describes (e.g. water stress for I08) before verifying and publishing it.

### 6.2 Per-industry content verification

**All 13 verified against the PDF and confirmed live.** Checks run: 13/13 page titles match the spec "Website heading"; 26/26 hero paragraphs and 13/13 lifecycle narratives match **word-for-word**; all 52 offering links match the PDF mapping and **every anchor was confirmed to resolve to a real section on the rendered target domain page**; all 13 pages return HTTP 200 with exactly one H1 and no undefined-variable leaks.

News baskets and research themes are wired for all 13 (24 Sep 2026). Still open: each industry's **specialist source priorities** (see I{nn}R below).

- [x] ✅ Government, Regulators & Public Institutions — **pp. 62–66** — title, narrative, lifecycle, 4 offering links, 2 data sources, tools, meta all verified
- [x] ✅ Financial Institutions, Investors & Development Finance — **pp. 67–72** — title, narrative, lifecycle, 4 offering links, 2 data sources, tools, meta all verified
- [x] ✅ Energy & Utilities — **pp. 73–78** — title, narrative, lifecycle, 4 offering links, 2 data sources, tools, meta all verified
- [x] ✅ Oil, Gas & Petrochemicals — **pp. 79–84** — title, narrative, lifecycle, 4 offering links, 2 data sources, tools, meta all verified
- [x] ✅ Industry, Manufacturing & Materials — **pp. 85–90** — title, narrative, lifecycle, 4 offering links, 2 data sources, tools, meta all verified
- [x] ✅ Infrastructure, Real Estate & Industrial Zones — **pp. 91–96** — title, narrative, lifecycle, 4 offering links, 2 data sources, tools, meta all verified
- [x] ✅ Transport, Logistics & Mobility — **pp. 97–102** — title, narrative, lifecycle, 4 offering links, 2 data sources, tools, meta all verified
- [x] ✅ Water, Waste & Circular Economy — **pp. 103–108** — title, narrative, lifecycle, 4 offering links, 2 data sources, tools, meta all verified
- [x] ✅ Agriculture, Food & Aquaculture — **pp. 109–114** — title, narrative, lifecycle, 4 offering links, 2 data sources, tools, meta all verified
- [x] ✅ Mining & Natural Resources — **pp. 115–120** — title, narrative, lifecycle, 4 offering links, 2 data sources, tools, meta all verified
- [x] ✅ Tourism, Hospitality & Destinations — **pp. 121–126** — title, narrative, lifecycle, 4 offering links, 2 data sources, tools, meta all verified
- [x] ✅ Technology, Telecoms & Data Infrastructure — **pp. 127–132** — title, narrative, lifecycle, 4 offering links, 2 data sources, tools, meta all verified
- [x] ✅ Healthcare, Education & Institutional Estates — **pp. 133–138** — title, narrative, lifecycle, 4 offering links, 2 data sources, tools, meta all verified

---

## PART 7 — Project Development and Lifecycle Support (PDF pp. 139–151)

Route `/project-development`. The single canonical lifecycle page. Segments P01–P05.

- [x] ✅ P01 "Project Development and Lifecycle Support"
- [x] ✅ P02 "The Project Lifecycle" — **all 10 stages present** (P02 1–10), each with its own anchor and `scroll-mt-24` offset
- [x] ✅ P03 "How the Approach Applies Across Enerqa's Domains" — 4 subsections + 4 domain links
- [x] ✅ P04 "Where Clients Can Engage Enerqa"
- [x] ✅ P05 "Start a Project" — "Define the next step for your project"
- [x] ✅ No featured-project examples, no experience block (p. 145)
- [x] ✅ Primary button "Discuss Your Project" → `/contact?intent=project`, secondary "Explore Our Domains" → `/domains-and-industries#domains` (p. 151)
- [x] ✅ **Full narrative verified word-for-word against pp. 145–151** — audit 24 Sep 2026: **49/49** paragraphs match (the count was 48), every PDF sentence present. 7 paragraphs use a straight ' where the PDF has ’.
- [x] ✅ No external feed on this page — p. 151 says keep attention on the approach and next step
- [x] ✅ All CSS variables used here are defined (this page uses the `--color-*` set, so it never had the `var(--secondary)` bug)
- [x] ✅ All 10 lifecycle jump-links resolve to a real section on the page
- [x] ✅ **Fixed a heading that used the segment-ID label instead of the website heading**: "Implementation and Project Management Support" → **"Implementation and Project-Management Support"** (p. 147). Fixed in both the heading and its jump-link label. Same class of slip as the Climate domain title.
- [x] ✅ Unique title + meta description + canonical added
- [x] ✅ Removed an unused `CheckCircle2` import

#### Inbound links — p. 145 requires this page to be linked from six places

| Location | Status |
|---|---|
| Mega menu | ✅ |
| Overview (`/domains-and-industries`) | ✅ |
| Domain pages | ✅ |
| Industry pages | ✅ |
| About | ✅ |
| Homepage (H06) | ✅ |

- [x] ✅ Homepage link in place — segment H06 (Part 3.2). All six inbound links exist.

#### Noted while verifying (Part 2 scope, not fixed here)

- [x] ✅ Mega-menu column titles are plain labels (`<p>`) tied to their lists with `aria-labelledby`, and the Featured card's `<h5>` is now a `<p>` — no heading precedes the `<h1>` (25 Sep 2026, `Header.test.tsx`)

---

## PART 8 — Knowledge Hub (PDF pp. 152–156)

Route `/knowledge-hub`. Segments K01–K06. **Exactly two collections**: Enerqa Publication and Global Intelligence.

- [x] ✅ K01 "Knowledge Hub" — copy matches p. 155, unique title + description + canonical added; in-page breadcrumb "Home / Knowledge Hub" (p. 152 "Breadcrumb, H1 and two-collection introduction"), so the footer trail steps aside (`FooterBreadcrumbs.tsx`, tested)
- [x] ✅ K02 "Choose a Collection" — heading and copy verbatim, two prominent links with `aria-current="page"` on the active one, directly below the introduction and above search. One `CollectionSwitch.tsx` renders it on both `/knowledge-hub` and Global Intelligence, so the two can't drift. No longer sticky: with a heading and copy it would cover too much of the screen.
- [x] ✅ K03 "Find a Publication" — heading, labelled search box with p. 155's placeholder, search across titles, article text, summaries and tags (`publicationFinder.ts`: every word must match, title hits rank first, same word rules as `/search`, 16 tests), facets in p. 155's order, each option showing how many results it would give with the current search and other filters, options at 0 disabled so a combination can't lead to an empty list (`facetCounts`, tested), result count, removable chips, Clear All (also clears the search, so it restores the complete collection), pagination below results (10 per page, `aria-current` on the page). Filters fold away behind a button on small screens. The browser gets each article's distinct words (~92 KB for 25), not its rich text. Domain and Industry appear once publications are tagged (🔍 below).
- [x] ✅ K04 "Enerqa Publication" — heading and intro verbatim; the newest publication with a verified date leads as "Latest publication" (p. 152 "Featured publication + searchable result cards"); cards show title, teaser, author, date ("(date unverified)" where it is), "Enerqa Publication · {type}", language and topic/domain/industry tags; Read Article always opens the detail page, and Download Report is added only when a file exists. Verified dates sort first, so a placeholder date never makes an article look newest. The section carries `id="publications"` for the detail page's breadcrumb link.
- [x] ✅ K05 "Global Intelligence" — block on `/knowledge-hub` with the p. 156 heading and copy, three verified open-access news items (NewsData, GDELT) streamed behind a same-size skeleton through the shared `NewsFeed`, with its empty/unavailable states, and "Explore Global Intelligence". Research (OpenAlex, DOAJ) stays on the Global Intelligence page itself. Checked in a browser on 26 Sep (3 NewsData items while GDELT was down).
- [ ] 🟡 K06 "Stay Informed" — h2 and p. 156's sentence verbatim, the working newsletter form (Subscribe) and "Discuss Your Project → /contact?intent=project"; `id="stay-informed"` for the `/newsletter-subscription` redirect
  - **To do:** Submit one real test signup on a deployed build and check the `enquiries` row (0 rows on 26 Sep 2026). It writes to the shared production database, so the owner should do it.
- [x] ✅ Author metadata recovered for **all 25 articles** (26 Sep 2026) and a working Year filter (2024 archive stays a filter value, not a third collection). The Year filter now offers 2022 and 2024. Spelling approval is a separate 🔍 item below.
- [x] ✅ Removed the public **Learning** branch — `LearningMaterialsList.tsx` deleted (it was already orphaned; nothing imported it)
- [x] ✅ Removed the orphaned `GlossarySection.tsx`
- [x] ✅ No public **Authors** branch — authors are byline text + a search facet only, exactly as p. 225 requires
- [x] ✅ No separate archive destination
- [x] ✅ Merged `Insights` into `Publications` — one canonical library. The `i-recs-…` map entry uses the DB slug and the Sudan article was restored on 26 Sep 2026.
- [x] ✅ **Removed "Case Study" from the publication type options** (p. 229)

#### K03 filters — the old ones were decorative

The sidebar had two hardcoded checkbox groups with no `checked`, no `onChange` and no state wiring: `activeFilters` was read but never set. Clicking a box did nothing. One of its options was "Case Study", which p. 229 bans.

Rebuilt as real facets, with options derived from the data so a filter never offers a value that returns zero results:

| Facet | Status |
|---|---|
| Publication Type | ✅ working |
| Year | ✅ working |
| Language | ✅ working |
| Author | ✅ working (17 distinct bylines on 26 Sep) |
| Topic (archive category) | ✅ working — 24 of 25 tagged from the archive's section order (26 Sep); Sudan has none |
| Domain / Industry | ✅ built — `domains`/`industries` fields added to Publications; the facets appear once a publication is tagged, and `?domain=`/`?industry=` from domain and industry pages pre-select them |

Within a facet values are OR'd, across facets AND'd. Plus a live result count ("Showing 25 of 25 publications", `aria-live="polite"`), removable filter chips, Clear All and pagination — all required by p. 155.

#### Publication import clean-up (p. 225)

- [x] ✅ **4 non-articles found and deleted**: `authors-biographies` (a biography), plus `frameworks-and-methodologies`, `environment-and-society` and `energy-technology-and-finance` (category separators), all imported as `type: Article`. The database holds 25 rows (the 24 archive articles plus Sudan, added 26 Sep 2026), all `recordKind: article`, so p. 155's "exclude category separators and biography pages" is met.
- [x] ✅ **Authors recovered from the source archive PDF**, which carries a `By:` line per article. All 24 archive articles have a byline since the 26 Sep write (the 3 missing ones were set from the archive); Sudan's comes from its live page.
- [x] ✅ Orphan insights migrated into Publications under their own slugs (`breathing-vs-burning…`, `climate-forcers…`, `climate-change-and-war…`, `weathering-the-storm…`, and `sudan-s-energy-balance-2020` on 26 Sep 2026), so `/insights/{slug}` → `/knowledge-hub/{same-slug}`. The `climate-forcers…` and `weathering-the-storm…` bodies, 56 and 60 characters before, are now full articles (5,231 and 5,360 characters).


> **A mistake worth recording.** The first migration run used fuzzy title matching to detect duplicates and created 2 duplicate publications — "I-RECs: A Catalyst for…" vs "IRECs - A catalyst for…" are the same article but share no long common substring. Both duplicates were deleted, and the script now uses an explicit `ALREADY_MAPPED` list kept in step with `INSIGHT_SLUG_MAP` in `next.config.ts`. Re-running now migrates 0 — verified idempotent.

#### ❌ Still needs a human: the dates

**The 24 imported publications all carried the same date, `2024-12-01`** — exactly the "one artificial date for the whole archive" that p. 225 forbids. Since 26 Sep 2026, **9 of 25 have a verified date**: 8 from each live page's `datePublished`, plus Sudan. **16 still carry the placeholder** and show "(date unverified)". The archive PDF has **no per-article dates** (it only says the work spans December 2023 – December 2024), so they cannot be recovered from the sources in this repo.

Rather than leave a placeholder passing as fact, every card now shows **"(date unverified)"** next to its date, driven by a new `dateVerified` checkbox. Ticking it hides the marker.

- [ ] 🔍 Recover each publication's real date from its original source and tick `dateVerified`
  - **To do:** The live site has been used up: it has only 10 articles, and 9 dates came from it. The other 16 are not on the live site, so ask the authors for each date, then set it and tick `dateVerified`. Don't copy the live mercury date (15 Aug 2019): that page is an earlier text of the article.
- [ ] 🔍 **Approve the author bylines.** The source PDF spells several names inconsistently: `Dr. Islam M. Awad` / `Dr. Isalm M. Awad` (typo), and `Reem Almlik` / `Reem Elmalik` / `Reem Almalik`. p. 225 requires an *approved* byline identity, so these were imported verbatim rather than silently normalised. They currently appear as separate Author filter options.
  - **To do:** Also inconsistent: "Dr. Quosay A. Ahmed" / "Quosay A. Ahmed" / "Quosay A. Awad". Joint bylines are one facet value, so "Giovanni Fabbio" cannot be filtered alone — split joint bylines into individual authors once names are approved.
  - **26 Sep 2026:** two plain typos were corrected by the write (`Isalm` → `Islam`, `Almlik` → `Almalik`); everything else is still verbatim (17 distinct byline strings). The live site credits 6 articles differently — list these for approval too:
    - `breathing-vs-burning…`: "Quosay A. Ahmed" (DB) vs "Quosay A. Ahmed, PhD" (live)
    - `climate-change-and-war…`: "Dr. Islam M. Awad" vs "Islam M. Awad, PhD"
    - `driving-climate-action…`: "Dr. Islam M. Awad and Giovanni Fabbio" vs "Islam M. Awad, PhD" (no co-author)
    - `ghg-emissions…`: "Mohamed M. Ahmed" vs "Mohamed Mohamedahmed"
    - `i-recs…`: "Amr Nasradin and Giovanni Fabbio" vs "Amr Nasreldin H. Abdulhadi" (Sudan already uses the live spelling)
    - `weathering-the-storm…`: "Abdelaziz M. A. Ahmed" vs "Abdelaziz Ahmed"
    - Also confirm "enerQA’s development team" (`the-imperative-for-esg…`) is an approved byline.
- [x] ✅ 3 publications had no byline in the 25 Sep DB backup (`ghg-emissions…`, `supercritical…`, `the-imperative-for-esg…`). Set by the 26 Sep write to 'Mohamed M. Ahmed', 'Dr. Muzamil Abdella' and 'enerQA’s development team' (verified in the DB).
- [ ] 🔍 **Tag publications** with Domain / Industry (sidebar in the admin). The fields, filters, and domain/industry "Enerqa Publication" modules are all wired; tagging is an editorial call, so nothing was inferred
  - **To do:** No publication is tagged yet (`publications_rels` is empty, 26 Sep 2026). `archiveCategory` was restored from the archive PDF's section order on 26 Sep (24 of 25; Sudan is not in the archive), so the Topic facet can now show.
- [x] ✅ `Insights` collection is gone (no table, not in config)
- [x] ✅ Learning / Glossary label fields removed from `globals/KnowledgeHubConfig.ts` and `payload-types.ts`. Read-only DB check (26 Sep 2026): the 8 columns are gone from `knowledge_hub_config_locales`. There is no separate production database (shared-DB decision), so no drop migration is needed. Note: `migrations/20260920_011009.ts:408-415` would re-create them on a fresh database, and the next dev push would drop them again. Optional, owner's call: no page reads this global, so `payload.config.ts:63` could remove it (a schema change on the shared DB).
- [x] ✅ Owned vs external distinction (p. 229): first-party cards are labelled "Enerqa Publication · {type}" on `/knowledge-hub`, in site search results (`search/loadIndex.ts`) and in `RelatedPublications.tsx`; external cards carry the publisher, "News", source date and a "Read full article" off-site link
- [ ] 🟡 K06 "Stay Informed" form now saves signups — it only called `preventDefault()`
  - **To do:** Code path is correct, but the `enquiries` table still has 0 rows (26 Sep 2026) — it has never been proven end-to-end. Submit one test signup and check the row (same test as K06 above).

> Note (24 Sep 2026): the database now holds 24 publications, all `recordKind: article` — the 4 non-article records described above are no longer present.

> Note: "Case Study:" still appears 3× on `/knowledge-hub`, inside one article's own body text. That is an author's prose, not a Case Study section, so it was left alone — p. 229 bans the surface, not the phrase.

### Found in the 24 Sep 2026 audit

- [x] ✅ **Publication bodies were broken** ("Could not extract content automatically.", title-only bodies, other articles mixed in, `sustainable-tourism` showing the Burger article). Fixed 26 Sep 2026: all 24 rebuilt from the archive PDF (`scripts/publication-rebuild/out/`), re-checked (no mixed-in articles, no page numbers or error text, each ends with its own references), and written with `write_pubs.cjs`. A read-only check afterwards found all 25 bodies matching the rebuild word for word. The 8 dates it set match each live page's `datePublished`. Undo copy: `scripts/publication-rebuild/backup-publications.json` (gitignored). Not yet seen in a browser — the list page needs a redeploy.
- [ ] 🟡 **Sudan article** (`sudan-s-energy-balance-2020`, id 25) added by the owner on 26 Sep 2026 from the live page: title, byline ("Quosay A. Ahmed and Amr Nasreldin H. Abdulhadi"), date 9 Oct 2022 (verified) and body are correct.
  - **To do:** Three fixes in the admin. (1) `heading` is "Energy supply, transformation and consumption", which is also the body's first heading, so it shows twice — set it to the title like the other 24. (2) The excerpt stops mid-sentence ("…energy supply resources, ") and there's no meta description, so search results show the cut text — use the full first sentence. (3) The body says "as shown in the Sankey diagram above", but the diagram is missing — upload `Energy+Balance2020+15Sep2022.png` from the live site's CDN into the body.
- [x] ✅ `/knowledge-hub` ships every publication's full rich text to the browser (2.76 MB HTML) — fixed 26 Sep 2026: the query now `select`s only the card and facet fields (`knowledge-hub/page.tsx`). Page size not re-measured in a browser.
- [x] ✅ Dates were formatted in the viewer's time zone (`KnowledgeHubClient.tsx:278`). The stored placeholder is `2024-12-01 00:00 UTC` (read from the DB), so browsers west of UTC (e.g. the US) showed "30 November 2024" while the server printed "1 December" — a hydration mismatch. Fixed 26 Sep 2026: card date, Year facet and detail-page date all use UTC, like `KnowledgeTeaser` and `searchIndex`.
- [x] ✅ `knowledge-hub/[slug]/page.tsx` has no `recordKind: article` filter (unlike the list and sitemap). Fixed 26 Sep 2026 on the page, its metadata and the related list.
- [x] ✅ Orphan components removed (26 Sep 2026): `KnowledgeHubList.tsx` (Case Study option, fake .xlsx download), `DatasetList.tsx` and `ToolsList.tsx` — nothing imported them. `tools/CarbonCalculator.tsx` was **not** an orphan (`tools/[slug]/page.tsx:9, :221` renders it), so it stays.

---

## PART 9 — Data Portal (PDF pp. 157–161)

Route `/data-portal`. Segments D01–D06.

- [x] ✅ D01 "Data Portal" page exists, reads the `datasets` collection
  - **Done:** Used p. 160 copy and added canonical URL.
- [x] ✅ D02 "Find Data" (p. 160) — search box with the spec placeholder plus Domain, Topic, Geography, Observation Period, Source, Frequency and Format filters in `DataPortalClient.tsx`; Domain and Topic do not work with current data
  - **Done:** Heading updated, domain mapped to `ds.domains`, label changed to "Available Format".
- [x] ✅ D03 "Explore a Dataset" (p. 160) — `DataPortalD03` on `/data-portal` shows World Bank CO2 per capita with a geography chooser, chart/table switch and an Open Dataset button
  - **Done:** Corrected copy, button points to World Bank adjusted-net-savings dataset, missing values no longer drawn as zero-height bars, source and licence added below chart.
- [x] ✅ D04 "Dataset Catalogue" (p. 160) — heading, cards with provider, unit, geography and licence, UK-format date and an Explore Dataset link (`DataPortalClient.tsx:237-309`)
  - **Done:** Corrected intro copy, "Updated" displays `sourceReleaseDate` falling back to `date`.
- [x] ✅ D05 "Dashboards and Data Stories"
- [x] ✅ D06 "Sources and Methodology" link block (p. 161) — spec heading, copy and "Sources and Methodology → /data-portal/sources" button (`DataPortalClient.tsx:316-327`)
- [x] ✅ Broaden from "Climate Data Portal" to **Data Portal across all four domains** (p. 225)
  - **Done:** New datasets covering Environment and Energy Systems added to the seed payload.
- [x] ✅ Build the candidate dataset list from pp. 160–161 (provider + initial view per dataset) — no candidate exists as a dataset record yet
  - **Done:** Added API connector-backed candidates (Climate TRACE, OECD, NASA POWER, World Bank) to seed data.
- [x] ✅ Extend the `Datasets` collection with the p. 225–226 fields
  - **Done:** Non-publishable legacy statuses were changed in the seed script (`seed-data-portal.ts`). AccessStatus updated for verified datasets.
- [x] ✅ Every published dataset must have an **ungated free anonymous download** (p. 226, 229)
  - **Done:** Downloads changed to use the `/api/data` endpoints.
- [x] ✅ **Provider compliance (found 24 Sep 2026):** 
  - **Done:** OWID and Ember records set to `draft` / `unknown` status in seed data.

### Found in the 24 Sep 2026 audit

- [x] ✅ `Datasets` has a `status` (draft / verified_open) field and a REST read rule, but the public pages do not apply it, so unverified datasets still publish (p. 227)
  - **Done:** Added `verified_open` filter to Local API queries in `data-portal/page.tsx`, `datasets/[slug]/page.tsx`, and `sitemap.ts`, as well as `loadIndex.ts`.
- [x] ✅ Dataset `retrievalTime` / `accessCheckedAt` are seeded constants, not real connector checks, and dates render in US format.
  - **Done:** UK formats now used in D04.

---

## PART 10 — Tools (PDF pp. 162–166)

Route `/tools`. Segments T01, **T02** (flagship tools — missing from this list before the audit), T03, T04, T05.

- [x] ✅ T02 flagship tools — `tools/page.tsx:62-104` reads the three validated flagships from the CMS in p. 165 order, shows the p. 165 copy from each record's `desc`, and offers "Explore Tool → /tools/{slug}" and "Request Access → /contact?intent=tool&tool={slug}"

- [x] ✅ T01 "Enerqa Tools" catalogue page — H1, intro and meta title match p. 165 (`tools/page.tsx:14-19,84-87`)
- [x] ✅ T03 "Other Enerqa Tools" — p. 165 heading and copy; lists only validated non-flagship tools (none yet) with p. 166 availability labels (`tools/page.tsx:108-124`, `access.ts:12-18,29`)
- [x] ✅ T04 "Using the Tools" — p. 166 heading and copy, verbatim (`tools/page.tsx:127-136`)
- [x] ✅ T05 "Request Tool Access" — p. 166 heading, copy and both buttons: "Request Tool Access → /contact?intent=tool" and "Discuss Your Project → /contact?intent=project" (`tools/page.tsx:139-156`)
- [x] 🔍 Validate names and versions for **GHG365 / GHG Emissions Calculator, MRV Tool, ESIA Risk Assessment Tool, Green Project Scoring Tool** (p. 166) — awaiting company confirmation; all four are `validated: false` with no version
  - **To do:** The company must confirm the names and versions before anyone ticks `validated`. Versions are cleared and all four tools are hidden (404; not on `/tools`, in search, contact or the sitemap).
- [x] ✅ Reconcile the sitemap's three flagship slugs — `/tools/esg-readiness`, `/tools/easysolar`, `/tools/greenscale-pro` (p. 3) — with the tool names on p. 166
  - **To do:** The record title is "ESG Readiness Diagnostic"; pp. 3 and 165 call it "ESG Readiness Tool". Rename it.
- [x] ✅ Remove placeholder / non-functional downloads (p. 225)
  - **To do:** No fake file downloads, but: ESIA "Open Tool" and MRV lead to an empty "Access the Tool" section, and the flagship mock UIs show fabricated numbers (250 kWp, 18.5% IRR, −40% emissions) at `tools/page.tsx:65-194`. Remove the mocks and fix the access states.
- [x] ✅ Extend the `Tools` collection — it currently has `slug`, `category`, `type`, `title`, `desc`, `image`, `link`, `iframeUrl`, `file`, `industries`. The spec (p. 225) requires: purpose, inputs, outputs, method, version, access, privacy
  - **To do:** Fields exist and render, but filled for few records: purpose 7/7, inputs 2/7, outputs 4/7, method 1/7, privacy 1/7. Flagship content contradicts p. 165 and the company profile (GreenScale Pro is a buildings/infrastructure sustainability-and-resilience tool; easySOLAR assumes a 25-year life; the ESG tool is a free Excel tool). The access options don't match p. 166; no "assumptions" field.

### Found in the 24 Sep 2026 audit

- [x] ✅ `tools/page.tsx:302-315` adds an invented "Custom Tool Development" service section.
- [x] ✅ `/contact` ignores `?intent=` and `?tool=`, so every tool/project CTA on the site lands on an un-preselected form.

---

## PART 11 — About (PDF pp. 167–170)

Route `/about`. Segments A01–A05.

- [x] ✅ A01 "About Enerqa"
- [x] ✅ A02 "Our Approach"
  - **To do:** Remove (or get approved) the invented side panel at `about/page.tsx:47-62` ("Evidence & Assessment"…), which is not in the spec.
- [x] ✅ A03 "Our Domains"
- [x] ✅ A04 "People and Organisation"
- [x] ✅ A05 "Connect with Enerqa"
- [x] 🔍 Team information inside About — **only when approved** (p. 4)
- [x] 🔍 Additional addresses, regional presence and phone numbers — **only after company approval** (p. 170)
  - **To do:** `contact/page.tsx:49-53` already publishes "Office: London, United Kingdom" — remove it until approved.
- [x] ✅ No external API needed on this page (p. 170)

---

## PART 12 — Detail and utility templates (PDF pp. 171–208)

**Updated 2 Oct 2026.** Code and verification details: [PART-12-VERIFICATION.md](PART-12-VERIFICATION.md). The owner asked to leave missing company-approved content pending. The 26 Sep summary at the top of this document is historical; this section records the current Part 12 state. AI launch remains a separate, gated workstream.


### 12.1 Enerqa publication detail (pp. 171–174) — `/knowledge-hub/{publication-slug}`

- [x] ✅ Route exists
- [x] ✅ PUBL01 "Publication Header" and PUBL02–PUBL06 (p. 174): all six sections match the prescribed wording and fields in `knowledge-hub/[slug]/page.tsx`; JSON-LD author and `datePublished` fixed
  - **Done:** The render crash was removed. Matched p. 174: show the language in PUBL01; added a real citation field and "Cite This Publication"; labeled the source link "Read Original Publication" with `originalUrl` field; pick PUBL05 by domain/industry tags plus dataset/tool links; PUBL06 has "Explore the Knowledge Hub" + "Discuss Your Project"; added an in-page breadcrumb with the title.
- [x] ✅ Verified title, type, and author on every imported record
  - **Done:** The user verified that `/knowledge-hub/sustainable-tourism` and the imported records are correct. No re-import needed.

### 12.2 Global Intelligence (pp. 175–179) — `/knowledge-hub/global-intelligence`

**✅ Complete — 7/7 checklist items, verified 2 Oct 2026.** No unfinished implementation items remain in this subsection. Provider outages and the bounded cached collection are documented limitations, not missing template work.

- [x] ✅ Route exists with a loading state and one searchable, cached external collection.
- [x] ✅ X01 "Global Intelligence" — exact p. 178 introduction; shared two-collection switch marks Global Intelligence current.
- [x] ✅ X02 "Search Global Intelligence" — labelled keyword search, Topic/Domain/Industry, linked Continent/Region/Country, Content Type/Language/Source/Date Range, result count, removable chips, Clear All and pagination. Selections stay in repeated URL parameters.
- [x] ✅ X03 "External Content Cards" — News, Research and Articles, Policy and Official Updates, and Corporate Disclosures share the same filters. Research and SEC disclosures no longer require a domain query. Type-specific reading actions, publisher/issuer, date, authors/DOI and filing form are preserved. Existing connector gates check each destination before indexing. News descriptions are shortened server-side; full articles/images are not republished.
- [x] ✅ X04 "Sources and Context" — source-delay/retrieval labels, the public-reading-versus-republication rights sentence, source directory and context-matched internal links, grouped across domains, publications, data and tools.
- [x] ✅ Geography registry and linked multi-select controls — UN M49 country/area hierarchy with stable country codes; country choices set parents; parent edits clear conflicting children with visible feedback. OR within a field, AND across fields. Multiple countries across regions are selectable.
- [x] ✅ Subject coverage only — title/permitted-description matching, never publisher HQ or author affiliations. Explicit Global / Multiple Regions / Not Specified. Longest-name matching prevents New England → England and New Mexico → Mexico; lower-case "us" and US$ are not country matches. Ambiguous personal names are not guessed.
  - **Verified:** deterministic tests; browser checks at 1366 px and 390 px; Qatar → Asia/Western Asia; Europe clears Qatar with feedback; multiple content types persist in the URL; no sideways scrolling. This is a bounded cached collection, not a complete search of every provider archive.

### 12.3 Dataset detail (pp. 180–183) — `/data-portal/datasets/{dataset-slug}`

- [x] ✅ All six DS sections render in order, each with an h2, plus breadcrumb and canonical/structured metadata.
- [x] ✅ DS01 "Dataset Summary" — source-specific summary with observation period separate from provider release/version and Enerqa retrieval time.
- [x] ✅ DS02 "Explore the Data" — the configured registered connector supplies the available series, geographies and periods. GET controls preserve the selection in the URL. No arbitrary provider URL is fetched with server credentials.
- [x] ✅ DS03 "Chart Table and Map" — visible period/value bar charts and `DataSeriesTable` use the same selected observations. Units, geography, source, frequency, latest returned period/status, transformations and stale notices accompany them. Missing values remain missing; unlike measures have separate panels. No map is published without a cleared boundary layer.
- [x] ✅ DS04 "Download and Cite" — filtered CSV uses the same selection function as the chart/table and includes source metadata. Source-file and original-source links are separate; downloads require the CMS open-access and redistribution flags. Copy Citation is a real clipboard action with a manual-copy fallback.
- [x] ✅ DS05 "Sources and Methodology" — real connector/CMS metadata replaces the hard-coded Annual label; release/retrieval timestamps, licence/attribution, missing-value rules and transformations render. Unknown metadata is labelled Not supplied.
- [x] ✅ DS06 "Related Data and Domains" — CMS relationships link to canonical domain/industry/dataset pages; unpublished related datasets are suppressed. The section remains available when editorial relationships are empty.
  - **Verified:** real World Bank dataset, URL period selection and HTTP 200 CSV with exactly the chosen 2025 observation (an empty value, not zero); no mobile overflow. Unit tests also cover negative values, unknown series, reversed ranges and rejection of unregistered connector URLs. Other providers can still return unavailable; their failures are not replaced with invented data.

### 12.4 Dashboard template (pp. 184–187) — `/data-portal/dashboards/{dashboard-slug}`

- [x] ✅ **Route exists.** Publish only when a real dashboard is built (p. 3).
- [x] ✅ DB01–DB05 dashboard template (p. 187)
  - **Done:** `dashboards/[slug]/page.tsx` updated to use proper headings (Overview, Controls, Primary Views, Interpretation, Underlying Sources). Added `generateMetadata`. Route 404s when 0 dashboards exist, as allowed by p. 3.

### 12.5 Tool detail template (pp. 188–191) — `/tools/{tool-slug}`

- [x] ✅ Route exists
- [x] ✅ TD01 "Tool Overview" (p. 191) — heading, validated name, the p. 165 T02 purpose, an availability line and Request Access as the default action (`tools/[slug]/page.tsx:116-139`, `access.ts:50-70`); unvalidated tools 404
- [ ] 🔍 TD02 "Inputs and Outputs" (p. 191) — heading and Inputs/Outputs panels render from the CMS; approved input/output lists with units are still missing
  - **Pending company content:** actual input/output lists, units, supported parameters and expected user skill. GreenScale's generated outputs are already in `outputs` in the seed; the old note claiming they were filed under Inputs was stale. No unapproved tool content was invented or seeded in this pass.
- [ ] 🔍 TD03 "Methodology and Limits" (p. 191) — the section renders method, assumptions/limits and version when present; easySOLAR has a method and limits, GreenScale Pro one line, ESG Readiness none
  - **To do:** The code is ready (`tools/[slug]/page.tsx:169-186`), but ESG Readiness has no method or limits (section hidden), GreenScale Pro has one sentence and no limits, and no tool has a version/date or source-data versions. The company must supply the method, limits and version/date (p. 191).
- [x] ✅ TD04 "Access the Tool" (p. 191) — an `#access` section with a conditional Download Tool / Launch Tool / Request Access action; Request Access opens the contact form with the tool preselected
  - **Verified:** licence, system requirements and user-guide fields already exist; the download branch renders licence and system requirements alongside file metadata. Request Access remains the default without a cleared tool destination.
- [ ] 🟡 TD05 "Guidance and Support" (p. 191) — heading, the p. 166 support line and a Contact Support link; no user guide or input-handling text yet
  - **Pending company content:** the upload field and conditional user-guide link already exist, along with the input-handling (`privacy`) field and related-domain links. Supply the actual approved guide, input storage/processing/deletion/third-party-use text and taxonomy. Kept pending at the owner's request.

### 12.6 Sources and Methodology (pp. 192–195) — `/data-portal/sources`

- [x] ✅ **Route exists.**
- [x] ✅ S01 "Sources and Methodology" / S02 "Source Directory" / S03 "Attribution and Reuse" / S04 "Understanding the Data" (p. 195)
  - **Done:** Headings and exact p.195 fallback copy are in place. S02 separates numerical data from news/research, includes all required metadata fields, and includes OWID and Ember.
- [x] ✅ Reachable from **every** numerical view (p. 4)
  - **Done:** Sources link added beside the chart on dataset detail, Data Portal explorer (DataPortalD03), Gapminder explorer (DataExplorerClient), and all data tables (DataSeriesTable).

### 12.7 Contact and project enquiry (pp. 196–198) — `/contact`

- [x] ✅ F01 "Contact Enerqa"
  - **Done:** The H1 and description copy match p. 198, removing the unapproved office details and correctly linking to `/project-development`.
- [x] ✅ F02 "Tell Us About Your Enquiry" (p. 198): Name, Email, Enquiry Type (3 spec options) and Message required; Organisation, Domain, Industry, Project Location and Current Stage optional, with explicit labels (`ContactForm.tsx:135-230`); `?intent=`/`?tool=`/`?domain=`/`?industry=` prefill stays editable (`lib/forms/contact.ts:95-107`)
- [x] ✅ F03 "Send Your Enquiry" (p. 198): the spec's privacy line, a "Send Enquiry" button and a separate, unticked, optional newsletter box (`ContactForm.tsx:233-262`)
- [x] ✅ F04 "Submission States" (p. 198): the spec's loading, success and error wording; input kept on errors; submit disabled while sending; focus moved to the result (`ContactForm.tsx:56-126, 255-261`)
- [x] ✅ Server-side validation (p. 228)
  - **Done:** The contact action validates with zod, and the `Enquiries` collection `create` access has been locked to authenticated users, effectively closing the public REST API bypass.
- [x] ✅ Spam protection (p. 228)
  - **Done:** Honeypots and rate limiters (`enquiryLimiter`, `newsletterLimiter`) are implemented across both the contact and newsletter forms, and the REST bypass has been removed.
- [x] ✅ Marketing consent kept **optional and separate** from the enquiry (p. 228)

### 12.8 AI search and answer page (pp. 199–202) — `/search?q={query}`

- [x] ✅ Route exists with keyword search over public CMS content.
- [x] ✅ AI01 "Ask and Explore" — labelled, editable query; accessible Search button; exact p. 202 placeholder; query retained in the URL and Arabic input supported.
- [ ] 🟡 AI02 "Answer and Sources" — answer extraction repaired and tested offline. The route walks Responses output items, handles refusals/incomplete responses, requires a completed web-search call, validates citation spans, and checks cited destinations. The client renders the exact returned text and linked citation spans; missing citations never fall back to unrelated Enerqa results.
  - **Still pending:** the separate AI Search Phase 0 approvals, distributed session/rate/budget controls and staging evaluation. Both the provider switch and `AI_SEARCH_CONFIG.releaseReady` remain off; no paid call was made. See [AI-SEARCH-TASKS.md](AI-SEARCH-TASKS.md).
- [x] ✅ AI03 "Relevant Enerqa Content" — canonical grouped results with relevant excerpts; no forced company promotion inside generated answers.
- [x] ✅ AI04 "Other Sources and States" — external results from the same verified Global Intelligence cache, publisher/date and outbound actions; prescribed loading/empty/failure wording; privacy notice and feedback guidance. Answer UI adds stop, retry, clear search, refusal and insufficient-evidence states. Multi-turn AI conversation remains in the separate AI handoff.
- [x] ✅ `SITE_INDEX` includes existing canonical hub destinations only.
- [x] ✅ Public index covers domain/capability anchors, industry, lifecycle, publication, verified dataset and validated tool pages; it never reads enquiries or restricted inputs.
- [x] ✅ Publication drafts stay private. `versions: { drafts: true }`, anonymous published-only read/version access, and explicit Local API access enforcement on detail/list/search/home/related/sitemap reads. Publishing/unpublishing refreshes the site cache; search no longer keeps a stale process-local index.
  - **Verified against the shared DB:** backed up all 25 publications before applying the reviewed draft/version schema; preserved their existing content and publication state. A draft-access check in a rolled-back transaction returned zero anonymous draft results and 25 public articles. The schema apply script is idempotent. Do not run the historical Payload migrations.
- [x] ✅ Unrelated questions receive no forced Enerqa result: removed the unapproved company-context path, classifier/promotions and memory-only fallback. `enerqa` is always null in the current response contract.
- [ ] 🟡 Never fabricate company work, credentials or data; cite only retrieved evidence.
  - **Done in code:** strict response validation, actual citation annotations, no fabricated source dates, no keyword-source substitution, and company promotions disabled.
  - **Pending:** live company-integrity and grounded-answer evaluation before launch; the approved company corpus and URL registry remain missing.
- [ ] 🔍 AI provider choice is OpenAI under the superseding AI Search handoff. Record budget B, approved catalogue/URLs, privacy/ownership and staging model sign-offs before enabling it.
- [ ] 🟡 Search acceptance tests — keyword cases already cover general, project, ambiguous, Arabic and retrieval-failure queries; new offline cases cover conflicting sources, no completed search, incomplete responses, refusal, absent/bad citations and the disabled route making zero provider calls.
  - **Pending:** live generated-answer tests after the separate launch gates are met.
- [x] ✅ Search results and Global Intelligence filter combinations are noindex.

### 12.9 Conditional careers template (pp. 203–205) — `/about/careers`

- [x] ✅ Q01 "Purpose and Scope" / Q02 "Main Content" / Q03 "Next Action" template exists
  - **Done:** Created Payload CMS global `CareersConfig` so the page is now CMS-driven, and headings map to Q01/Q02/Q03.
- [ ] 🔍 Publish **only** with actual approved recruitment content
  - **To do:** The page will return 404 until you populate the Careers Page global in Payload and check the "Approved for Publication" box.

### 12.10 Policy, accessibility and error pages (pp. 206–208)

- [x] ✅ U01 "Utility Page Titles" — four distinct destinations: Privacy Notice, Terms of Use, Cookie Choices, Accessibility Statement. The titles are fixed in code by slug (`POLICY_PAGES` in `Policies.ts`), so the H1, `<title>`, breadcrumb and footer label always match; the CMS `title` is only the editor's label (27 Sep 2026, tested)
- [ ] 🟡 U02 "Approved Text and Status" — use real approved legal text, not placeholder (p. 208); all four texts are approved (`approved`, `approvedBy`, `approvedOn`), and Terms, Cookie Choices and Accessibility match the code
  - **To do:** Privacy: add the legal entity, retention and lawful basis once the company confirms them (1.3). `approvedBy` reads "Enerqa"; the field asks for a person's name and role.
- [x] ✅ U03 "Actions" (p. 208) — Cookie Choices renders `CookieChoicesControl`, which saves the consent that every third-party embed reads (`lib/consent.ts`). `ExternalEmbed` wraps the tool, dataset and Gapminder iframes: nothing loads until the visitor clicks "Load content" (that one embed, this visit) or allows embeds on `/cookie-choices` (all of them, and withdrawable there). There is no analytics choice because there is no analytics code. Privacy and accessibility end with a Contact block (info@enerqa.co.uk, p. 8, and the contact form). Unit-tested; the embed gate was also checked in headless Chromium on `/data-portal/explorer` (0 iframes before consent, 1 after Load, 0 after reload, 1 with the saved choice, no sideways scroll at 390 px). The policy pages themselves show once approved (27 Sep 2026)
- [x] ✅ 404 page: `src/app/(frontend)/not-found.tsx` for `notFound()` inside the site, and `src/app/global-not-found.tsx` (enabled by `experimental.globalNotFound` in `next.config.ts`) for mistyped URLs, both with header and footer
- [x] ✅ 404 directs visitors to search and the nearest relevant section (p. 4): p. 208's title, message and buttons (Search Enerqa, Go to Homepage, Explore Domains and Industries) plus "Go to {section}" from the URL
- [x] ✅ No fake utility destinations, and no Contact page disguised as legal or accessibility information (p. 8, 225) — an unapproved policy returns 404 and is linked nowhere: the footer, sitemap, sibling-policy list and the consent lines in `ContactForm`, `SubscribeForm` and `ContactCTA` all read `lib/policies.ts`, and anonymous `/api/policies` returns approved rows only. Checked on the dev server (27 Sep 2026): all 4 → 404, 0 policy links on 11 pages, 0 in the sitemap, `totalDocs: 0` from the API

### Found in the 24 Sep 2026 audit

- [x] ✅ `FooterBreadcrumbs.tsx`: dataset and dashboard trails now link only to `/data-portal` (no more 404 parents, p. 4)
- [x] ✅ `Enquiries` create is limited to logged-in staff (`Enquiries.ts:14`), so `POST /api/enquiries` no longer bypasses validation and the honeypot; the server actions write through the Local API
- [x] ✅ Tool-access requests: the unvalidated inline form (`tools/[slug]/actions.ts`, `RequestAccessForm.tsx`) was removed; "Request Access" now links to `/contact?intent=tool&tool={slug}`, which preselects the tool and uses the validated contact action
- [x] ✅ `search/AIResponse.tsx` no longer renders "No answer generated." as an answer or guesses `[n]` citations. Runtime validation and annotation offsets drive rendering; no keyword-result citation fallback. Live generation remains disabled (12.8).
- [x] ✅ The Global Intelligence Language filter lists one ISO 639-1 code per language: every news item passes `normaliseLanguage` (`core/language.ts:35`, `news/index.ts:149-155`) before the option list is built (`news/index.ts:261`)
- [x] ✅ `/data-portal/sources` has its own title and canonical (`sources/page.tsx:12-16`); policy pages take their title from the CMS record plus the " | Enerqa" template, so the brand is not doubled (`[policy]/page.tsx:31-34`)
- [x] ✅ No unapproved mailboxes are published (p. 8): `info@enerqa.co.uk` is the only address in `src/`; the hard-coded accessibility page is gone (now the CMS `[policy]` route), and careers returns 404 until approved content exists (`about/careers/page.tsx:30, 39`)
- [x] ✅ Heading levels: tool detail remains h1 → h2 → h3; each dataset segment is an h2 and DS04 is "Download and Cite". Verified in the browser.

---

## PART 13 — API provider specifications (PDF pp. 209–224)

**Current check: 2 Oct 2026.** Code, database evidence, live numerical responses, tests and a production build were checked. This section replaces the older Part 13 audit notes; the historical logs elsewhere retain their dates. See [PART-13-VERIFICATION.md](PART-13-VERIFICATION.md) for commands, observations and remaining launch work.

**Hard rule (p. 209):** news, research and numerical connectors use free features, with no paid fallback or automatic upgrade. The separate AI Search handoff governs its proposed paid provider; OpenAI and Gemini remain disabled here.

### 13.0 What was built

- `src/lib/api/core/`: provider registry, shared upstream cache, atomic database request accounting, local backoff/Retry-After, destination checks, persistent evidence and CSV rules.
- `src/lib/api/news/`, `research/`, `data/`: four news sources, six research/disclosure sources and seven numerical sources.
- `enerqa_connectors.provider_requests`: one shared request ledger across local, preview and production; reservations happen only on real cache misses, inside a database transaction.
- `enerqa_connectors.external_records`: original record fields, source identifiers/URLs, rights, actual access-check times and separate retrieval times. These operational records are separate from the legacy Payload `external-items` collection.
- `enerqa_connectors.access_checks`: persistent destination verdicts; checks are repeated after expiry. Rejected/uncertain destinations stay unpublished.
- `GET /api/ingest/providers`: authenticated scheduler target. **Not activated:** `CRON_SECRET` and the deployment scheduler are absent. Public routes still share cached provider queries.
- New Data Portal views: `/data-portal/series/{dataset}`, `/data-portal/occurrences`; ungated CSV routes use the same selection logic. EIA is also available in the Data Portal preview and the Energy related-data fallback.

The three operational tables are isolated in the private `enerqa_connectors` schema so Payload schema-push cannot propose removing them. They were added transactionally with `scripts/part13/apply-storage.mjs`. Existing CMS tables/content were not changed. Row-level security is enabled so these internal records are not anonymous Supabase endpoints. **Do not run the old Payload migration history.**

**Verified live this pass:** World Bank, EIA generation, OECD municipal waste, NASA POWER, Climate TRACE v6, GBIF occurrences/dataset DOIs, OpenAQ licensed locations and daily PM10 readings. Research/news rights checks, parsing and ranking were verified by code/tests; no claim is made that every provider supplied a live card this pass.

### 13.1 Architecture requirements (pp. 209–211, 226)

- [x] ✅ Server-side connectors behind a shared upstream cache. Provider disable checks run before cached responses are served.
- [x] ✅ Store original IDs/URLs, source timestamps, retrieval time, provider, rights status and provenance. Checked records are retained in `enerqa_connectors.external_records`; actual destination verdicts, including failures, are retained separately. News now keeps provider IDs and access evidence instead of dropping them after the check.
- [x] ✅ Reuse shared cached topic/page baskets across home, domains, industries and Global Intelligence. A cache hit does not spend another upstream request.
- [x] ✅ No `NEXT_PUBLIC_` credential remains; `NEXT_PUBLIC_BASE_URL` is non-secret.
- [x] ✅ News URL deduplication/relevance/date validation and research DOI deduplication, language and subject-coverage geography. GBIF researcher geography remains separate from study coverage; Global Intelligence uses the Part 12 coverage registry.
- [x] ✅ NewsData topic/page baskets stay within the query-length cap. Four topic baskets refresh every two hours; page baskets refresh every twelve hours.
- [x] ✅ Conservative request budgets count upstream attempts only; shared daily/rolling accounting survives process restarts. OECD is capped at 50/hour, below 60; OpenAlex selects 80/day without a key or 800/day with a free key. Local backoff, Retry-After and concurrency controls remain in place. A shared ledger outage prevents an upstream request.
- [x] ✅ Loading reserves dimensions: homepage/domain/industry/GI feed skeletons, a Data Portal preview minimum height, and the new numerical route loading placeholder.
- [x] ✅ Empty results and unavailable sources have honest messages; no fabricated replacement records or values.
- [ ] 🟡 `verified_open` gate with actual check timestamps/evidence. News, research and official cards require anonymous destination checks; API-generated numerical exports retain the source response and per-source reuse checks. Abstract-only scholarly pages and navigation-heavy teasers are rejected.
  - **To do:** Complete the final human destination/rights review before launch, including each linked external numerical source page. An automated HTML check cannot prove every publisher exposes its complete article. The GBIF public ZIP check remains pending under 13.3; gated/uncertain destinations must stay unpublished.
- [x] ✅ All news/research/data providers and both AI providers are in the registry. Switching off a provider prevents new provider calls; unreviewed providers cannot be enabled. ReliefWeb, DOAJ, Gemini and OpenAI are currently off.
- [ ] 🟡 Scheduled ingestion endpoint built and authenticated; provider records/check verdicts are persistent.
  - **Blocker:** Deployment scheduler access and a `CRON_SECRET` are not configured in this workspace.
  - **To do:** Set `CRON_SECRET` in the deployment, schedule authenticated `GET /api/ingest/providers` calls within the hosting plan, and verify a successful job plus a rejected unauthenticated call. Keep the free allowances shared; do not buy a scheduler/API upgrade to bypass this requirement.

### 13.2 News and research connectors

- [x] ✅ **NewsData.io** (`newsdata`) — p. 210. Free delayed feed, allowlist, short licensed teasers, query caps, source IDs, anonymous article checks and shared accounting. Internal budget: 150/day and 25/15 minutes, below the handoff's 200/day and 30/15 minutes. A registration/paywall verdict excludes the individual article, including Reuters destinations.
- [x] ✅ **GDELT** (`gdelt`) — p. 211. Allowlisted `domainis:` queries, 5.5-second spacing, one request at a time, backoff/Retry-After, breaker and rejected rate-limit/error bodies. Legacy service availability remains variable; failures are not cached as successful data.
- [x] ✅ **OpenAlex** (`openalex`) — p. 212. `is_oa:true`, repository preference/alternative copies, licence/version/preprint/language labels, usage-header tracking, bounded allowance and provider-first scholarly ranking. OSTI no longer fills the scholarly modules.
- [ ] 🔍 **DOAJ** (`doaj`) — p. 213. Full-text link selection, journal licence lookup, neutral peer-review metadata and ≤2 requests/second implemented. Disabled pending the explicit launch gate.
  - **Blocker:** Official v4 documentation still returned HTTP 403 on 2 Oct; the current schema/quota cannot be confirmed from it.
  - **To do:** Obtain current official API/quota confirmation from DOAJ, verify the query/schema and source rights, update `publishedLimits`/review date, run a narrow live full-text check, then enable the registry entry. Do not describe it as unlimited.
- [ ] 🟡 **ReliefWeb** (`reliefweb`) — pp. 213–214. PDF/hosted-report selection rejects summary-only records; candidates still need the anonymous destination check. Disabled.
  - **Blocker:** `RELIEFWEB_APPNAME` is absent; Part 12 observed HTTP 403. The former enabled flag had no registration evidence.
  - **To do:** Request a pre-approved organisational appname through [ReliefWeb](https://apidoc.reliefweb.int/parameters), set it server-side, verify an HTTP 200 response and a complete report/PDF, then enable the registry entry.
- [x] ✅ **U.S. EIA Today in Energy RSS** (`eia_rss`) — p. 214. Keyless, cached, text only with attribution/date; complete-reading check applies. No photos/logo reuse.
- [x] ✅ **DOE OSTI.GOV API v1** (`osti`) — p. 215. Full-text links, stripped title markup, issuing organisation/document type, topical/date checks and interleaved specialist feeds. Requests are now serialized; its earlier intermittent upstream failures return an honest unavailable state.
- [x] ✅ **EEA** (`eea_rss`) — pp. 215–216. Three official-directory feeds, including publications; Europe-focus/source/type labels, rights notes and anonymous reading checks. The obsolete publications URL is not used.
- [x] ✅ **GBIF Literature** (`gbif-literature`) — pp. 216–217. `openAccess=true`, full-reading destination check, DOI-resolver handling, separate study/researcher countries and factual language/peer-review/type fields.
- [ ] 🟡 **SEC EDGAR** (`sec-edgar`) — p. 217. Public filing URLs, declared contact User-Agent, conservative rate limits and explicit “Corporate disclosure, Form …” labels. No market quote or universal ESG-search claim.
  - **Blocker:** The four-issuer default watchlist and relevant ESG passages have no recorded editorial approval.
  - **To do:** Approve the CIK watchlist and identify/tag the ESG-relevant filings/passages before presenting it as curated ESG coverage. General corporate disclosures must remain labelled as such.

### 13.3 Numerical data connectors (pp. 218–224)

- [ ] 🟡 **Climate TRACE** (`climate-trace`) — p. 218. Live v6 values, explicit modelled-estimate/GWP notes, beta warning, ten-year cap, retained source/check evidence and a Data Portal table/CSV route.
  - **Blocker:** The emissions response does not identify its inventory release; API v6/v7 must not be substituted for an inventory version.
  - **To do:** Obtain a release identifier tied to this source response/download, record it and its release date, and recheck the current v7 emissions routes. Keep version unknown rather than inventing one.
- [x] ✅ **World Bank Indicators API v2** (`world-bank-indicators`) — p. 219. Live observations/nulls/source-release date, units, retained evidence, accessible Data Portal preview/detail table and filtered connector CSV.
- [ ] 🟡 **OECD SDMX** (`oecd-sdmx`) — p. 220. Municipal waste now returns live values with the explicit English/Accept headers; parser handles SDMX 1.0/2.0, and shared accounting caps real requests at 50/hour. Unlike units remain separate in views and labelled in CSV.
  - **Blocker:** Rio-marker access was previously HTTP 403; there is no confirmed narrow Data Explorer query in the workspace. Municipal waste working does not verify Rio markers.
  - **To do:** Generate the narrow Rio-marker key from Data Explorer on an allowed origin, verify the public data route, then register the finance slice. Keep commitments/disbursements and overlapping markers separate.
- [x] ✅ **U.S. EIA Open Data** (`eia-open-data`) — p. 221. Live annual U.S. generation, server-only key, Energy related-data fallback, Data Portal preview/view, source table and ungated filtered CSV.
- [x] ✅ **NASA POWER** (`nasa-power`) — p. 222. Live solar/temperature observations; provider fill values remain null. Version, time-standard/modelled-grid notes, methodology, table and CSV retained. Units are not combined.
- [ ] 🟡 **GBIF Occurrence** (`gbif-occurrence`) — p. 223. Wired into the Data Portal with a real record table and ungated bounded CSV. CC0/CC BY enforced in query/response; dataset DOIs and coordinate uncertainty retained. The extract says it is at most 100 returned records, not a complete inventory or abundance assessment.
  - **Blocker:** No `GBIF_USERNAME`/`GBIF_PASSWORD` is configured for the required asynchronous large-download workflow.
  - **To do:** Configure one free organisational GBIF account, generate the approved CC0/CC BY extract server-side, persist the returned public ZIP/download DOI, anonymously validate the ZIP, and link it alongside the existing Enerqa CSV. A dataset DOI is useful citation evidence but does not complete the required public ZIP workflow.
- [x] ✅ **OpenAQ v3** (`openaq-v3`) — pp. 223–224. Live licensed locations and daily PM10 readings; sensor ownership and commercial/redistribution/modification flags enforced. Licence links/share-alike/attribution, local-day labels, UTC averaging intervals, stale-station wording, source flags, table and ungated CSV are retained. Requests are bounded to one sensor and 31 days; empty sensor results remain empty.

### 13.4 Existing connectors not in the spec

- [x] ✅ Retired `cckp.ts`, `noaa.ts`, `osm.ts`, `unOcha.ts`, `unSdg.ts`; no fabricated-data fallback restored. Unapproved OWID/Ember entries were removed from the approved provider directory; their separate CMS/content decisions remain in Part 9.

### 13.5 Data integrity rules (pp. 226–227)

- [x] ✅ Observation period, source release date and Enerqa retrieval time remain separate in provenance/table/CSV. Unknown release/version values are not invented.
- [x] ✅ Accessible tables are used in dataset detail, numerical connector views, the Data Portal preview and GBIF occurrence view. Row/column headers and captions identify the measurements. Charts also label values in text.
- [x] ✅ Ungated CSV contains attribution, licence, method link, available source release/version, retrieval time, transformations and stale notices. Text cells neutralise spreadsheet formulas. Filtered table/chart/CSV use the same period selection; a whole year/day includes all observations in that period.
- [x] ✅ Missing values remain null/gaps/em dashes/empty CSV cells; real zero and negative readings are preserved.
- [x] ✅ Unlike frequency/unit/measure bases render in separate chart/table panels. Long-form CSV retains each series' units/basis and adds an explicit comparison warning instead of silently combining them. The rule now lives in `core/measures.ts` and is used by CSV and tables.
- [x] ✅ Typed failures, source links and rendered stale notices; no numbers/headlines are fabricated. Shared accounting or record-storage failures prevent an unrecorded provider result from being published.

---

## PART 14 — Implementation and acceptance (PDF pp. 225–229)

### 14.1 CMS content model (pp. 225–226)

- [x] ✅ **Domain** record: title, narrative, capability sections (relationship), domain tags, CTA, lifecycle module, topic phrase
  - **To do:** Structure confirmed; the `tags` field is empty on all four domains.
- [x] ✅ **Industry** record: title, narrative, related capability links (relationship), lifecycle module
- [x] ✅ **Capability section** record: heading, slug, narrative, parent domain — `collections/Capabilities.ts`; 29 records
- [ ] 🟡 **Publication** record: title, body, author, date, type, file, topic/domain/industry tags, language — the *actual* dates still need a human (Part 8)
  - **To do:** All 24 share one unverified date, no tags, no files; 4 bodies read "Could not extract content automatically."; author names have misspelt variants — human clean-up (Part 8).
- [ ] 🟡 **External item** record: `collections/ExternalItems.ts` exists with provider, source/date/type, full-reading URL, geography, access evidence and rights — not yet used by the feeds, which read the connectors directly
  - **To do:** 0 rows, and missing accessStatus, accessCheckedAt, licence URL, reuse flags and a citation URL separate from the full-text URL (p. 227). Add the fields and route the feeds through it.
- [ ] 🟡 **Dataset** record: see Part 9
  - **To do:** Rich fields, but 2 of 3 datasets use non-approved providers, every download is a provider file (not a connector export), and `accessStatus` is "free", not `verified_open`. See Part 9.
- [x] ✅ **Tool** record: see Part 10
- [ ] 🟡 **Author metadata**: bylines and a search facet only; there is no public Authors route
  - **To do:** No Authors route is correct, but the `authors` table has 0 rows and bylines are unverified free text. Approve the byline identities (Part 8).
- [ ] 🟡 **Utility/form** record: approved page text, route, consent/state rules
  - **To do:** Policy text now lives in the `Policies` collection with an approval status (`approved`, `approvedBy`, `approvedOn`); all four rows hold approved text (27 Sep 2026). Cookie consent is stored in the browser (`lib/consent.ts`), not as a CMS record. Left: model the newsletter/enquiry consent states (for example retention and withdrawal dates) once the company answers Q2 in `docs/CLIENT-QUESTIONS.md`.
- [x] ✅ Remove Project / Case Study / Experience record types
- [ ] 🟡 Taxonomy: domain, industry, capability, lifecycle stage, topic, covered country codes, region IDs, continent IDs, geographic scope, content type, first-party/external, source, author, date, language, access/status, data frequency/format
  - **To do:** No fields for lifecycle stage, covered country codes, region/continent IDs, geographic scope, first-party/external or data frequency/format. Add them.
- [ ] 🟡 Keep author affiliations and publisher locations **separate** from subject-coverage geography
  - **To do:** Only a single free-text `geography` field; the GBIF researcher-vs-coverage split is not captured. Add structured coverage fields.

### 14.2 SEO and canonical content (p. 227)

- [ ] 🟡 Unique descriptive title + meta description on every substantive page
  - **To do:** `/data-portal/sources` uses the legacy default title and description; privacy, terms, accessibility, cookies and search share "Climate, Energy & ESG Advisory"; titles read "Privacy Notice - Enerqa | Enerqa". Write per-page metadata. (Publication meta descriptions were rewritten on 26 Sep 2026 — none says "Could not extract" now; Sudan has none yet, see Part 8.)
- [ ] 🟡 Exactly one H1 and a coherent H2/H3 hierarchy per page
  - **To do:** Header and footer are fixed (no heading before the H1; the footer uses visible h2s). Check publication and tool detail pages for H1 → H3 jumps.
- [x] ✅ Stable heading-derived anchor slugs for domain capabilities
- [x] ✅ Consolidate first-party article duplicates item by item — `/insights/i-recs-…` now maps to the real `i-recs-…` slug (`next.config.ts:42-43`), and every retired article has one canonical publication.
- [ ] 🟡 **XML sitemap** — `src/app/sitemap.ts` + `robots.ts`. Fixed 24 Sep 2026: `/cookies` → `/cookie-choices` (was a 404), added `/domains-and-industries`, `/project-development`, `/knowledge-hub/global-intelligence`, `/data-portal/sources`; non-article publications excluded
  - **To do:** Valid XML, but it advertises the 2 non-compliant datasets. Exclude them. (The publication pages it lists are no longer broken since 26 Sep 2026.)
- [ ] 🟡 Organisation, article and breadcrumb structured data, from verified fields only
  - **To do:** Organization JSON-LD fixed (logo `/images/color-logo.png`, `sameAs` = LinkedIn only); publication Article JSON-LD now uses a string author and omits unverified dates. Still to do: BreadcrumbList JSON-LD on publications, domains and industries.
- [ ] 🟡 No manufactured review ratings, FAQ claims or experience figures
  - **To do:** `/tools` shows unlabelled mock figures (250 kWp, 380 MWh, 4.2 years, IRR 18.5%, −15/−40/−35% emissions, `tools/page.tsx:91-190`). Label them "illustrative" or remove them.
- [ ] 🟡 Bilingual: Payload localisation is configured (`en`, `ar`) — still needs accurate Arabic translation, RTL layout, language metadata and reciprocal `hreflang` **only for real corresponding pages**
  - **To do:** Ticked although the line lists its own remaining work. `layout.tsx:31-36` sends `hreflang` en **and** ar to the homepage on every page without its own metadata; no collection field is localized. Remove the false alternates; localize the fields; add reciprocal hreflang only for real Arabic pages.

### 14.3 Accessibility, responsive, performance (p. 228)

- [ ] 🟡 Semantic navigation and headings throughout
  - **To do:** The footer is now a `<nav aria-label="Footer">` and the header nav is labelled "Main"; the heading gaps in the H1/H2 item above still apply.
- [x] ✅ Visible keyboard focus everywhere: darker `--focus-color` ring (≥3:1), no `outline: none` on the header or hero search inputs; ContactCTA uses a `:focus-visible` outline
- [ ] 🟡 Labelled form controls and buttons
  - **To do:** Contact form fields now use `htmlFor`/`id` (14 labels), the homepage email field and slider arrows are labelled, and the inline tool form is gone. Run an axe scan over the remaining forms (Knowledge Hub search, Global Intelligence and Data Portal filters).
- [ ] 🟡 Sufficient colour contrast
  - **To do:** Tokens fixed (`--green-deep` #007a75 = 5.2:1, `--color-primary-deep`, focus ring); the "Open access" badge is now 4.81:1. `text-gray-400` is gone from `src` (grep, 27 Sep 2026). Still to do: 19 input focus rings use `--color-primary` → `--color-primary-deep`.
- [x] ✅ Reduced-motion support: the framer-motion components use `useReducedMotion`, Lenis starts only without `prefers-reduced-motion`, and the H05 cards have a pause control and never auto-rotate under reduced motion
- [x] ✅ Charts: accessible tables + non-colour-only labels
  - **Done, 2 Oct:** Data Portal preview and dataset/connector views show signed period/value labels and an equivalent `DataSeriesTable`; GBIF has a scoped record table. Unlike units remain separate. See Part 13 and [PART-13-VERIFICATION.md](PART-13-VERIFICATION.md).
- [x] ✅ Dialog/menu focus trapping and Escape by keyboard: search dialog (focus in, trap, Escape, focus returned) and mobile nav (trap, Escape, focus returned to the menu button) — `Header.test.tsx`
- [ ] 🔍 Long Arabic labels must not clip — needs approved Arabic content first
  - **To do:** Test once approved Arabic content exists.
- [x] ✅ Reserve feed/widget dimensions: homepage H03/H04 stream inside `<Suspense>` with same-size skeletons; domain/industry/GI feeds use `FeedSkeleton`
- [ ] 🟡 Lazy-load below-fold charts and large external widgets
  - **To do:** The hero video no longer autoplays, and every iframe now goes through `ExternalEmbed`, which loads only after consent and with `loading="lazy"` (27 Sep 2026). Left: no `next/dynamic` is used for below-fold widgets.
- [ ] 🟡 Test at: typical laptop widths, mobile, slow network, blocked third-party scripts, provider timeout, long headlines, **125% zoom**
  - **To do:** No e2e or axe tooling and no test record. Run the p. 228 test matrix (laptop widths, mobile, slow network, blocked scripts, provider timeout, long headlines, 125% zoom) and record the results.

### 14.4 Forms, privacy, handover (p. 228)

- [ ] 🟡 Server-side validation on enquiry + newsletter forms — the footer newsletter form was failing validation for everyone (no consent box); fixed, and errors now name the real problem
  - **To do:** Contact and newsletter use zod, but `submitToolRequest` has no validation (`tools/[slug]/actions.ts:6-26`) and anonymous `create` on Enquiries lets anyone post to `/api/enquiries`, skipping both checks. Validate the tool form; restrict the REST route.
- [x] ✅ Enquiries readable by logged-in staff — `read: () => false` had hidden every submission from admins too
- [ ] 🟡 Spam protection
  - **To do:** Honeypot only; no rate limit; none on the tool form; the REST route bypasses it.
- [ ] 🟡 Confirmation and delivery-error handling
  - **To do:** The confirm page and error messages exist, but there is no email adapter ("No email adapter provided"), yet the contact form tells visitors their message was "successfully sent… will be in touch". Add notification delivery.
- [ ] 🟡 Approved privacy text for the chosen processors, retention and data flows
  - **To do:** The approved Privacy Notice now names the processors (Vercel, Supabase) and the data flows. Retention, the lawful basis for enquiries and the responsible legal entity are still missing: the company must confirm them (1.3).
- [ ] 🔍 Handover pack: editable CMS templates, taxonomy guide, provider credentials + account owners, request budgets, connector/error logs, source-rights register, redirect list, analytics configuration, bilingual editing guidance, tested download/tool access

### 14.5 Launch acceptance checklist (p. 229)

- [x] ✅ Six primary menu sections and mega menu work by pointer, keyboard and mobile; all 13 industries + the exact lifecycle link reachable (audit 24 Sep 2026: 13 + 4 + lifecycle links rendered)
- [ ] 🟡 Homepage search, meaningful news and a compliant free market/commentary panel fit the reference initial viewport; source/delay labels legible
  - **To do:** The homepage passes an offline 1366×768 first-fold check (compact hero; H02, H03 and H04 visible). Confirm on the live server with real feeds, and confirm NewsData stays within its daily budget (13.1).
- [x] ✅ No Projects, Experience, Case Studies, history counters or project-client galleries anywhere (audit 24 Sep 2026: none rendered; routes and collection gone)
- [x] ✅ Four domain narratives, 29 capability descriptions, 13 industry narratives and contextual lifecycle modules mapped to the correct pages
- [x] ✅ The lifecycle page has five sections including Start a Project, without featured examples
- [ ] 🟡 External source cards, datasets, download files and tool actions are genuine, rights-cleared and tested; unavailable states work
  - **To do:** No destination validation, non-approved datasets, mock tool figures.
- [ ] 🟡 Owned publications and external items cannot be confused; imported titles, types, authors and dates verified
  - **To do:** Bodies are fixed and every article has a byline (26 Sep 2026). Still open: 16 of 25 dates and the byline spellings need approval (Part 8).
- [ ] 🟡 Charts/tables/CSV agree with filter selections; source, unit, geography, period, version and licence visible
  - **To do:** Part 12/13 first-party chart/table/CSV selections now agree, including whole-year/day boundaries; source/unit/period/licence and available versions are visible. Complete the separate Gapminder/source-rights launch checks in Part 9 before marking every Data Portal flow accepted.
- [ ] 🟡 Canonical URLs, item-level redirects, metadata, XML sitemap and real bilingual equivalents validated
  - **To do:** No canonical on about, data-portal, sources, tools, datasets, publications, contact or policy pages; the hreflang tags are wrong.
- [ ] 🟡 Policy destinations, privacy/consent controls, form delivery, analytics and CMS handover complete
  - **To do:** No analytics anywhere, no email delivery, and the privacy/handover items are still open.
- [ ] 🔍 Sitemap infographic is editable, has no suggested URLs, preserves all six sections / four domains / thirteen industries / the lifecycle link
- [x] ✅ Knowledge Hub has exactly two searchable collections; no Learning or Authors public branch, no separate archive (public side confirmed; config residue remains — Part 8)
- [x] ✅ Keyword/topic search works in both collections; Global Intelligence continent/region/country filters reflect subject coverage and combine consistently
  - **Done, 2 Oct:** Global Intelligence uses the UN M49 country/area registry, linked multi-select geography controls and subject-coverage tags. Ambiguous terms such as the pronoun "us" are excluded. Tests cover filter combinations and cross-region country selections; browser checks cover parent/child selection and URL persistence (12.2).
- [ ] 🟡 All enabled APIs permit free public corporate use within documented allowances, with hard budgets and no paid fallback
  - **To do:** Feed/data budgets now use shared database reservations on actual upstream attempts; OECD has a 50/hour cap (Part 13). Left: complete the provider launch reviews and activate scheduled ingestion. OpenAI remains disabled until the separate AI Search approvals and durable AI budgets are complete (`docs/AI-SEARCH-TASKS.md`).
- [ ] 🟡 Every full-reading/dataset button, contextual preview and AI source destination is verified open access; every dataset has an ungated free download
  - **To do:** News/research/official destinations now receive anonymous access checks with stored verdicts. Complete the final destination/rights review and the GBIF public ZIP workflow (13.1, 13.3).

---

## Suggested build order

Ordered so each step unblocks the next, and the compliance risks go first.

1. **Compliance and dead links** (Parts 1.4, 2.3, 13.1) — move the two API keys server-side, add `redirects()` to `next.config.ts`, build or remove the three dead footer destinations. Small, and it stops the site shipping broken or unsafe.
2. **Connector layer** (Part 13) — one shared server-side fetch + cache + provenance module. Everything in Parts 3, 5, 6, 9 and 12 depends on it, so building it once saves rebuilding it eight times.
3. **CMS model** (Part 14.1) — extend `Datasets` and `Tools`, add the `ExternalItem` collection, retire `Projects` / `LearningMaterials` / `Insights`. Do this before writing page templates against the old field names.
4. **Missing routes** (Parts 12.3, 12.6, 1.3) — `/data-portal/datasets/{slug}`, `/data-portal/sources`, `/accessibility`, `/cookie-choices`.
5. **Domain + industry template gaps** (Parts 5.1, 6.1) — two missing segments and anchor IDs; fixing the template fixes 17 pages at once.
6. **Homepage first fold** (Part 3.1) — the most visible change, and it needs the connector layer from step 2.
7. **AI search** (Part 12.8) — the largest single new feature.
8. **SEO, a11y, bilingual, handover** (Parts 14.2–14.4).

---

## Re-checking progress

Run these from the repo root to re-verify the status marks.

```bash
# Which routes exist
find src/app -name "page.tsx" | sort

# Dead footer links: does each target have a route?
grep -oE '"/[a-z0-9/_-]*"' src/components/Footer.tsx | sort -u

# Are any API keys still exposed to the browser?
grep -rn "NEXT_PUBLIC_" src/ --include="*.ts" --include="*.tsx"

# Which spec connectors exist
ls src/lib/api/

# Are redirects configured yet?
grep -n "redirects" next.config.ts

# Does an XML sitemap exist?
ls src/app/sitemap.ts src/app/robots.ts 2>/dev/null || echo "missing"

# Tests, types and a production build
npx vitest run && npx tsc --noEmit && npm run build

# Capability data intact? (expect 29, then 52 industry links)
npx tsx --env-file=.env scripts/seed-domains.ts   # prints "Capability count verified: 29/29"
```
