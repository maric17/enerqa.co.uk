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

## Status — 26 Sep 2026 (read this first)

On 25 Sep, coding agents worked through the open items. Two finished: homepage and header/footer, both covered by tests. The other six (connectors, feeds, Knowledge Hub, tools, forms/search, Data Portal) were stopped partway. After that, the owner's own model ticked many items. **On 26 Sep, every line that changed after the 24 Sep audit (118 lines) was re-checked against the code.** A tick stays only where the code meets the cited spec page. Invented "**Blocked**" notes were replaced with the real dependency, or removed where the work is ordinary code.

| Status | Items |
|---|---|
| ✅ confirmed done | 271 |
| 🟡 partly done | 147 |
| ❌ not done | 13 |
| 🔍 needs a human decision or approved content | 22 |
| ❓ could not be verified | 1 |
| **To do lines** | **165** |

**How this was checked:** by reading the code. `npx tsc --noEmit` is clean and `npx vitest run` passes (**271/271, 24 files**). The redirects were checked statically against the page and slug lists. **Not done this pass:** no dev server, no `npm run build`, and no database reads (declined), so anything that depends on live data or rendering says "not verified live".

### Fixed on 26 Sep during the re-check (they broke the build or the site)
- **The Data Portal didn't compile.** Escaped backticks at `DataPortalClient.tsx:255` and `DataPortalD03.tsx:151` were a syntax error.
- **Every publication page crashed.** `knowledge-hub/[slug]/page.tsx` passed an `onClick` (an `alert()` placeholder for "Cite") from a Server Component. The placeholder is removed; p. 225 bans fake actions anyway.
- **Mistyped URLs had no 404 page.** `global-not-found.tsx` imported `(frontend)/not-found`, which had been moved to `app/not-found.tsx`. It was moved back, because with two root layouts `not-found.tsx` must sit inside `(frontend)`.
- **The next dev start would have prompted for data loss.** `Datasets.accessStatus` had dropped `free`/`restricted`, which all 3 rows use. Both are back as legacy options, and neither counts as publishable.
- **The new `Policies` collection had no types.** They are regenerated (`npm run generate:types`).
- **The sitemap listed the 4 hidden tools,** which 404. It now uses `publishedToolsWhere`.
- **The rebuilt publication bodies (all 24) lived only in a temp folder.** They are saved to `scripts/publication-rebuild/` with their write script. See Part 8 for whether the write ever committed.

### What still needs doing, in priority order
1. **One shared database (owner's decision, 26 Sep 2026).**
   - Local dev, Preview and Production all use the same Supabase database: one `DATABASE_URI` for all environments in Vercel.
   - The new schema and the restored capability data are therefore **already live**. There is nothing to run on Vercel: push the commit and it deploys.
   - `src/migrations/20260926_020023` is kept as a record only. **Don't run `payload migrate` against this database**: the schema is already there, so it would try to re-create existing tables. Don't add it to the Vercel build either, where it would stop at Payload's dev-mode prompt and skip.
   - **Guardrails, because `npm run dev` changes the live database:**
     - Never accept Payload's "Accept warnings?" data-loss prompt without reading the list.
     - Keep collection changes additive.
     - Back up a table before removing or renaming any field.

2. **The policy pages 404.** `/privacy`, `/terms`, `/cookie-choices` and `/accessibility` render only from a `Policies` record, and there are none. The footer, the sitemap and the contact form's privacy line all link to them. Enter the approved text (🔍 legal), or put interim pages back.
3. **Check whether the publication rewrite committed.** Open `/knowledge-hub/sustainable-tourism`: if it still shows the Burger article, run `scripts/publication-rebuild/write_pubs.js --dry`, review the output, then run it for real. The Sudan article was never migrated, so its two redirects land on a 404.
4. **The Data Portal detail work isn't built.**
   - DS02, DS03, DS04 and DS06 are missing.
   - The dataset publish gate doesn't apply on the site: Local API queries skip access rules.
   - None of the p. 161 candidate datasets exists.
   - D03's chart has no table and links to the OWID dataset.
5. **Knowledge Hub / publication detail.**
   - PUBL01/04/05/06 wording and fields.
   - An in-page breadcrumb on publication and dataset detail.
   - The `#stay-informed` and `#publications` anchors don't exist.
6. **Accessibility.**
   - `text-gray-400` → `text-gray-500` on white (list in 14.3).
   - Input focus rings → `--color-primary-deep`.
   - `loading="lazy"` on the two iframes.
   - Run the p. 228 test matrix.
7. **Human decisions (🔍), 22 items:**
   - the AI provider and its free-tier terms
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

## Snapshot — where you are today

| Area | PDF pages | Status (26 Sep 2026) |
|---|---|---|
| 1. Sitemap & page inventory | 3–6 | 🟡 Live-site URLs are now redirected: 33 of 35 live and legacy paths resolve. The exception is the Sudan article, which was never migrated. The **4 policy pages 404** until approved text is entered in the `Policies` collection, which has no migration. The sources directory is generated, but its copy isn't p. 195's. Careers is correctly gated. |
| 2. Header, mega menu, footer | 7–8 | ✅ Header, mega menu, search dialog, focus ring, mobile groups, six footer groups, breadcrumbs and the Arabic notice are done and test-verified. Left: in-page breadcrumbs on publication and dataset detail; footer links to the 404 policy pages; narrow widths not checked in a browser. |
| 3. Homepage | 9–15 | ✅ All 13 segments use the exact PDF copy, with a compact hero, streaming feeds and a pause control. Left: a live first-fold check at 1366×768 (only an offline check was done), the teaser rights review, and removing the unused `react-type-animation`. |
| 4. Domains & Industries overview | 16–20 | ✅ **complete** |
| 5. Four domain pages | 21–60 | 🟡 Research ranking (OpenAlex → DOAJ) and the future-date gate are fixed in code. News card counts, source notes and skeleton sizing were not re-verified live. Relevant Industries needs sign-off (🔍). |
| 6. Thirteen industry pages | 61–138 | 🟡 All copy and 52/52 work-area links are verified. The specialist feeds and news coverage from a stopped agent were not re-verified live. There are no datasets or publications linked. |
| 7. Project Development (lifecycle) | 139–151 | ✅ **complete** |
| 8. Knowledge Hub | 152–156 | 🟡 The publication page crash is fixed (26 Sep) and the redirects work. All 24 bodies were rebuilt from the archive PDF, but **it's unknown whether the DB write committed**. The Sudan article is missing. K02–K06 wording, pagination and tags are still open. Dates and bylines need a human. |
| 9. Data Portal | 157–161 | 🟡 D02/D03/D04/D06 exist. The publish gate **doesn't apply on the site**. D03's chart has no table and links to OWID. None of the p. 161 candidate datasets exist yet. OWID and Ember are not approved providers (🔍). |
| 10. Tools | 162–166 | ✅ T01–T05 are verbatim from pp. 165–166 and CMS-driven. Unvalidated tools are hidden everywhere, including the sitemap. Left: TD02 units, TD03 method and version, TD05 guide and privacy, and the company must confirm the other tools' names and versions (🔍). |
| 11. About | 167–170 | ✅ The A02 side panel and the `/contact` office line are removed. Team content only when approved (🔍). |
| 12. Detail & utility templates | 171–208 | 🟡 Done: contact F01–F04 with URL preselection; search labels, index and failure state. PUBL segments are coded, but four differ from p. 174. **DS02/03/04/06 are not built.** Dashboards ignore `datasetConnector`. The policy pages 404. AI answers need a provider decision (🔍). |
| 13. API provider specs | 209–224 | 🟡 Done and tested: budgets count only real upstream calls; backoff, Retry-After and a circuit breaker; timeouts; the OpenAlex cap; CSV formula injection. Left: the Global Intelligence stale notice, no page links `/api/data`, OECD, and the unused EIA/GBIF Occurrence/OpenAQ connectors. |
| 14. Implementation & acceptance | 225–229 | 🟡 Focus, reduced motion, dialogs and layout-shift items are fixed. Left: apply the migration on production, contrast (`text-gray-400`), accessible chart tables, lazy iframes, the p. 228 test matrix, breadcrumb JSON-LD, email delivery and analytics. |

**Biggest risks right now** (details in each part):
1. ⚠️ **Revoke the old newsapi.org key.** It is in git history (commit `f9c4320`). Deleting the line does not un-publish it, and only the key owner can revoke it. No `NEXT_PUBLIC_` credential remains in `src/`.
2. ⚠️ **One shared database for dev and production** (decision 26 Sep 2026). Every local `npm run dev` pushes schema changes to the live site. Follow the guardrails in the status section (read any data-loss prompt, additive changes only, back up first); a "yes" to that prompt is what wiped the capability data on 24 Sep.
3. ⚠️ **The policy pages 404.** The footer, the sitemap and the contact privacy line link to them (Part 1 / 12.10).
4. ⚠️ **The publication data state is unknown.** A single-transaction rewrite was stopped mid-run. Check `/knowledge-hub/sustainable-tourism` (Part 8).
5. 🔍 **Datasets:** the publish gate doesn't apply to site pages, and Our World in Data and Ember are not approved providers (p. 226). Only the World Bank dataset qualifies.
6. **Production origin:** set `NEXT_PUBLIC_BASE_URL=https://www.enerqa.co.uk`. Canonicals and the sitemap otherwise point at the apex, which redirects.
7. **Stray script:** `scripts/sync.ts` boots Payload, which pushes the schema. Delete it or run it with care. (`fix-tools.ts` was deleted on 26 Sep.)
8. ~~CSV formula injection, open `POST /api/enquiries`, hard-coded `PAYLOAD_SECRET` fallback, NewsData switching itself off~~ — fixed on 25 Sep. Verified in code on 26 Sep; the CSV fix has tests.

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
- [ ] 🟡 `/data-portal/sources` — returns 200 with a source directory built from the connector registry; section copy is not yet the p. 195 text (see 12.6)
  - **To do:** `data-portal/sources/page.tsx` returns 200 with a registry-driven directory (`:72-88`), but the S01/S03/S04 fallback copy (`:46-47`, `:106`, `:125`) is not p. 195's, and S04 claims dashboards and datasets "display raw provider values" although no dashboard exists and dataset pages show no values (see 12.6).
- [ ] 🔍 `/about/careers` — build only when real approved recruitment content exists (p. 4, 205). The template exists but **returns 404** behind `CAREERS_CONTENT_APPROVED = false`: its copy was invented (see 12.9). Nothing links to it.

### 1.3 Utility destinations outside primary nav (p. 4)

- [ ] ❌ `/privacy` — served by `[policy]/page.tsx` from the `Policies` collection; currently 404 because no approved text exists (p. 4, 208)
  - **To do:** `[policy]/page.tsx:57` 404s: the `Policies` collection has no migration and 0 rows, yet `Footer.tsx:138` and `sitemap.ts:34` link to /privacy. Add the migration and enter approved privacy text (14.4) in the CMS, or remove the links until then.
- [ ] ❌ `/terms` — served by `[policy]/page.tsx` from the `Policies` collection; currently 404 because no approved terms exist (p. 4, 208)
  - **To do:** `[policy]/page.tsx:57` 404s (no `Policies` migration, 0 rows) while `Footer.tsx:139` and `sitemap.ts:35` link to /terms. Enter approved terms that respect the open-data rules on p. 226, or remove the links until then.
- [ ] ❌ `/cookie-choices` — served by `[policy]/page.tsx` from the `Policies` collection; currently 404, and no cookie controls exist (p. 208)
  - **To do:** /cookie-choices 404s (`[policy]/page.tsx:57`, 0 rows) while `Footer.tsx:140` and `sitemap.ts:38` link to it, and no consent code exists in `src`. A rich-text CMS page cannot change consent (p. 208): build real cookie controls in code, or publish an approved statement of the cookies actually used.
- [ ] ❌ `/accessibility` — served by `[policy]/page.tsx` from the `Policies` collection; currently 404 because no approved statement exists (p. 208)
  - **To do:** /accessibility 404s (`[policy]/page.tsx:57`, 0 rows) while `Footer.tsx:141` and `sitemap.ts:36` link to it. Enter an approved statement based on actual testing, with a working contact route (p. 208), or remove the links until then.
- [ ] 🟡 404 page — `src/app/(frontend)/not-found.tsx`
  - **To do:** Works for `notFound()` calls, but offers a fixed list, not the nearest relevant section (p. 4), and misses Domains & Industries. Mistyped URLs get Next's bare default 404 (see 12.10).
- [x] ✅ Newsletter confirmation + unsubscribe states — `/newsletter/confirm` (reached by redirect after a successful signup) and `/newsletter/unsubscribe` (a real form that withdraws consent; same reply whether or not the address was subscribed). Both `noindex`, neither in the sitemap.
- [ ] 🟡 "Source unavailable" state pattern — `components/ui/SourceUnavailable.tsx`: "No relevant updates are available." when sources answered with nothing relevant; "This source is temporarily unavailable" plus search and nearest-section links (p. 4) when they failed
  - **To do:** Used by the domain and industry feeds, but the homepage (`FirstFoldFeeds.tsx:78-85`) and Global Intelligence use their own box, which always says "No relevant updates are available." even when a provider failed, with no search/nearest-section link. Use `SourceUnavailable` with `sourcesFailed` on both.

### 1.4 Retire legacy routes (p. 4, 225, 228) — 🟡 all but the Sudan article

All redirects live in `next.config.ts`. Every rule sends HTTP 308 in exactly 1 hop. **Audit 24 Sep 2026: two destinations 404** (see `/insights/{slug}` below), and — more importantly — **these rules cover URLs that do not exist on the live site** (the live `/services` is itself a 404). The live site's real URLs are unredirected; see "Found in the audit" at the end of Part 1.

> Next.js sends **308**, not 301, for `permanent: true`. 308 preserves the request method where 301 lets browsers turn a POST into a GET. Search engines treat it as equally permanent, so this satisfies "permanent closest-equivalent redirect".

- [x] ✅ `/services` → `/domains-and-industries`
- [x] ✅ `/services/climate-change` → `/domains/climate-action-carbon-management`
- [x] ✅ `/services/energy` → `/domains/energy-systems-transition`
- [x] ✅ `/services/environment-esg` → `/domains/sustainable-business-esg-finance` — **decided from the retired page's own content**: its sections were ESG readiness, GRI/SASB frameworks, materiality assessment and ESG reporting, with no environmental or nature content. Despite the slug, it is an ESG page.
- [x] ✅ `/services/business-solutions` → `/domains/sustainable-business-esg-finance`
- [x] ✅ `/insights` → `/knowledge-hub`
- [ ] 🟡 `/insights/{slug}` and each live root article path mapped **article by article** in `next.config.ts:29-54` (the `i-recs-…` entry now uses the DB slug); `sudan-s-energy-balance-2020` has no publication — see below
  - **To do:** `/sudan-s-energy-balance-2020` and `/insights/sudan-s-energy-balance-2020` still point at a publication missing from the 25 Sep DB backup (`next.config.ts:53`; `scripts/add-sudan-energy-balance.ts`, named at `:51`, does not exist). Migrate the article or point both rules at `/knowledge-hub`.
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
| `i-recs-a-catalyst-for-renewable-energy-investment-in-qatar` | `irecs-a-catalyst-…` |
| `smoking-and-climate-change` | `the-hidden-link-between-cigarette-smoking-…` |
| `artisanal-gold-mining-environmental-impacts-of-mercury-use` | `environmental-impacts-of-mercury-use-in-artisanal-gold-mining-…` |

The other 5 (`sudan-s-energy-balance-2020`, `breathing-vs-burning-…`, `climate-forcers-…`, `climate-change-and-war-…`, `weathering-the-storm-…`) have **no publication equivalent**. They were later migrated into Publications (Part 8) — except `sudan-s-energy-balance-2020`, which is missing, so its redirect now 404s.

- [ ] 🟡 Migrated into Publications in Part 8 (7 orphan insights), each with its own rule
  - **To do:** 4 of the 5 unmatched insights exist as publications; `sudan-s-energy-balance-2020` does not (and "7" doesn't match the "5 of 10" table). Migrate the Sudan article.

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

- [ ] 🟡 **The live site's URLs are redirected (p. 228).** All 28 non-homepage URLs in `https://www.enerqa.co.uk/sitemap.xml` are covered: `/about` and `/contact` exist, and `next.config.ts:29-198` maps the 10 root-path articles to `/knowledge-hub/{slug}`, the 9 hash-suffixed service pages to capability anchors (all 9 exist in the DB), the 4 `/contact---*` pages to `/contact?domain=`, plus `/blog`, `/careers` and `/newsletter-subscription`
  - **To do:** Of the 28 non-homepage live URLs, 27 reach a real page. `/sudan-s-energy-balance-2020` ends on a missing publication (`next.config.ts:53`), and `/newsletter-subscription` targets `#stay-informed`, which no element has — add `id="stay-informed"` to the K06 section (`KnowledgeHubClient.tsx:314`).
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
- [ ] ❌ Footer utility links `/accessibility`, `/cookie-choices`, `/data-portal/sources` must be genuine destinations (p. 8)
  - **To do:** The four policy URLs (`/privacy`, `/terms`, `/cookie-choices`, `/accessibility`) now come from the new `Policies` collection via `src/app/(frontend)/[policy]/page.tsx`, which 404s until a record exists; the table has no migration and 0 rows, and the footer links all four. Create the migration, enter approved text (🔍 legal), and re-check each link returns 200.
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
- [ ] 🟡 "Research and Articles" (…**R**)
  - **To do:** All 4 domains show **only DOE OSTI records** (sorted newest-first across providers, and OSTI carries future dates). Rank OpenAlex (`is_oa`) first and DOAJ second (pp. 28, 37); keep OSTI/GBIF out of CR; drop records dated after today; strip HTML from OSTI titles.
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
  - **To do:** A mapping can be derived from the 52 approved work-area links (Climate ← 7 industries, Energy ← 10, Nature ← 9, Business ← 8). Get a quick sign-off, then seed `relevantIndustries` from it.

### 5.2 Climate Action & Carbon Management (pp. 21–30) — `/domains/climate-action-carbon-management`

- [x] ✅ 7 capability sections seeded (C02–C08)
- [x] ✅ C01 narrative + all 7 capability narratives verified **word-for-word** against pp. 26–28
- [x] ✅ **Fixed the domain title**: was `Climate Action and Carbon Management` (the segment-ID label); p. 26 gives the website heading as `Climate Action & Carbon Management`
- [ ] 🟡 CP section: "Policy and Official Updates" + ReliefWeb / UNFCCC / IPCC source line seeded
  - **To do:** The public source note promises "curated verified open-access UNFCCC NDC and BTR submissions, IPCC releases…" that do not exist on the site, and the module is always empty. Build the curated links p. 29 asks for, or reword the note to what is actually shown.
- [ ] 🟡 CN news baskets and CR research themes from p. 30 wired (`lib/feeds/contextual.ts`). CP official updates use ReliefWeb only, as p. 29 specifies — empty until ReliefWeb is registered (13.2)
  - **To do:** p. 29 asks for ReliefWeb **plus** curated UNFCCC/IPCC sources, not ReliefWeb alone. Live: CN shows 1 card (spec: 3); CR is 100% OSTI (see line 325).
- [x] ✅ CD renders one compact dataset card with attribution and canonical link (p. 29) — 🔍 no dataset is linked to this domain yet
- [x] ✅ CT tool link seeded: ESG Readiness Tool → `/tools/esg-readiness` (p. 29)

### 5.3 Energy Systems & Transition (pp. 31–39) — `/domains/energy-systems-transition`

- [x] ✅ 6 capability sections seeded (E02–E07)
- [x] ✅ E01 + all 6 capability narratives verified **word-for-word** against pp. 35–37
- [ ] 🟡 EP "Official Energy Analysis and Research" section added, with the EIA RSS / OSTI source line
  - **To do:** The source note claims "source-filtered national energy authorities and regulators" — implement them or remove the claim.
- [ ] 🟡 EN/ER feeds from p. 38; EP official updates from EIA Today in Energy + OSTI (live)
  - **To do:** OSTI items show "Journal Article" as the organisation and a hard-coded "Technical report" type (`official.ts`, `osti.ts:75`), with future dates (1 Feb 2027). Map the real organisation and document type and reject future dates. EN shows 1 card; ER is all OSTI.
- [x] ✅ ED card renderer wired; `eia-open-data` now verified live — 🔍 no dataset record is linked yet
- [x] ✅ ET tool links seeded: easySOLAR → `/tools/easysolar`, GreenScale Pro → `/tools/greenscale-pro` (p. 38)

### 5.4 Environment, Nature & Circularity (pp. 40–50) — `/domains/environment-nature-circularity`

- [x] ✅ 8 capability sections seeded (N02–N09)
- [x] ✅ N01 + all 8 capability narratives verified **word-for-word** against pp. 45–47
- [ ] 🟡 NP "Environment and Nature Updates" section added, with the EEA RSS / GBIF literature source line
  - **To do:** The source note claims "curated CBD, UNEP and national environment-authority links" that do not exist — curate them (p. 48) or reword.
- [ ] 🟡 NN/NR feeds from p. 49; NP official updates from EEA + GBIF literature (live)
  - **To do:** NN shows 0 items, NR is all OSTI, and a GBIF item shows its organisation as "GBIF Literature API". Fix the research ranking and organisation mapping; review the news pool size.
- [x] ✅ ND card renderer wired — 🔍 no dataset is linked yet
- [x] ✅ NT tool links seeded: GreenScale Pro, ESG Readiness Tool (p. 49)

### 5.5 Sustainable Business, ESG & Finance (pp. 51–60) — `/domains/sustainable-business-esg-finance`

- [x] ✅ 8 capability sections seeded (B02–B09)
- [x] ✅ B01 + all 8 capability narratives verified **word-for-word** against pp. 56–58
- [ ] 🟡 BP "Corporate Disclosures and Finance Updates" section added, with the SEC EDGAR source line
  - **To do:** The source note claims "curated verified open-access finance-regulator and taxonomy sources" — implement or reword.
- [ ] 🟡 BN/BR feeds from p. 60; BP official updates from SEC EDGAR (live)
  - **To do:** BP is live (3 filings with issuer, form, date). BN shows 0 items; BR is OSTI-only and off-topic ("Large language models for transportation research", "Hydrogen applications in airport operations"). Same fix as line 325.
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
- [ ] 🟡 Feeds stream in behind same-size skeletons, so a slow provider never blocks the page (verified live: e.g. Energy shows EIA/OSTI official updates and 4 open-access research records)
  - **To do:** The skeleton reserves 3 cards but 0–1 arrive, so the layout jumps about 490px on mobile. Size the skeleton to what usually arrives (or reserve the empty-state height). The "4 research records" were all OSTI — see line 325.
- [x] ✅ CK shows first-party publications tagged with the domain, labelled "Enerqa Publication" — 🔍 none tagged yet (Part 8)

### Found in the 24 Sep 2026 audit (Parts 5–6)

- [x] ✅ **Research ranking** (`research/index.ts`): OpenAlex (`is_oa:true`) first, DOAJ supplementary, per p. 28 (`SCHOLARLY_PROVIDERS` `:32`, `mergeByProvider` `:379`); OSTI no longer feeds Research and Articles, and off-theme records are dropped (`isOnTheme` `:139`)
- [x] ✅ **Future publication dates are rejected before display** (p. 226): `gateResearch` for research (`research/index.ts:168-173`); `interleaveFeeds`/`secFilings` (`feeds/official.ts:196, 218`) and the news gate `isPlausibleDate` (`news/types.ts:232-241, 344`) for official updates
- [ ] 🟡 OSTI titles keep HTML — the Climate page literally shows `Upgrading Biogas through <em>in situ</em>…`.
- [ ] 🟡 The seeded `policyUpdates.sourceNote` text on all 4 domains advertises curated sources that don't exist (`seed-domains.ts`).
- [ ] 🟡 `RelatedDataset.tsx`: the empty text ("No dataset has been linked to this page yet…") is invented and exposes internal state, and "Browse the full catalogue" is not a link.
- [ ] 🟡 Industry pages print internal provider IDs in public copy ("Recommended sources for this industry: world-bank-indicators, oecd-sdmx.").
- [ ] 🟡 `FooterBreadcrumbs.tsx:25,33` — the footer breadcrumb on every domain and industry page links to `/domains` and `/industries`, which 404, and drops "&" from titles.

---

## PART 6 — The thirteen industry pages (PDF pp. 61–138)

**One reusable template**: `src/app/(frontend)/industries/[slug]/page.tsx`. Each industry has two segments: `I{nn}01` (page intro) and `I{nn}02` (Relevant Domains and Work Areas), plus `I{nn}R` (Research and Official Updates).

### 6.1 Template gaps — fix once, fixes all thirteen (p. 61)

- [x] ✅ "Project Development and Lifecycle Support"
- [ ] 🟡 "Industry News"
  - **To do:** **12 of 13 industry pages show "No relevant updates are available."** (only Oil & Gas has items, and those are EIA official analyses). Query each industry's baskets within the NewsData budget, or widen the shared pool; keep official items out of "news".
- [ ] 🟡 "Research and Official Updates" (I{nn}R)
  - **To do:** p. 65 asks for OpenAlex/DOAJ **plus each industry's specialist feeds** (e.g. I01 reliefweb, I02 sec_edgar, I03 eia_rss + osti). `INDUSTRY_FEEDS` has no specialist list. Live: 12/13 pages are OSTI-only and off-topic. Add the per-industry specialist lists from pp. 66–138 and fix the ranking.
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
- [ ] 🟡 Research goes through the shared connectors and fetch cache using each industry's own research themes (`fetchResearchForThemes`). The uncommitted version searched one generic pool and substring-matched, so industries like Tourism almost never matched
  - **To do:** Themes are passed correctly, but the "Tourism now matches" claim holds only because irrelevant OSTI records match. Fix with line 425.
- [x] ✅ Per-industry news baskets and research themes from each config page (pp. 66–138), all 13 in `lib/feeds/contextual.ts`. Matching also accepts singular forms and US spellings ("carbon market", "decarbonization") — displayed text is never altered
- [x] ✅ I{nn}N, I{nn}R, I{nn}T, I{nn}K and I{nn}A intros and buttons now match the PDF ("View All Industry News", "Explore Related Research", the I{nn}A text, "Discuss Your Project")
- [x] ✅ I{nn}02 work-area links are relationships to Capability records, so they cannot point at a missing anchor (the uncommitted version fell back to `/domains/unknown#…`)
- [ ] 🔍 Dataset preview: one-card renderer wired (dataset `industries` relationship) — 🔍 no dataset is linked to an industry yet; the catalogue link shows meanwhile, as p. 66 requires
  - **To do:** Choose one dataset per industry from its "I{nn}D numerical source" list; only the World Bank dataset currently uses a permitted provider.

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

- [x] ✅ K01 "Knowledge Hub" — copy matches p. 155, unique title + description + canonical added
- [ ] 🟡 K02 "Choose a Collection" — two entry points, sticky, present on both collections
  - **To do:** Add the K02 "Choose a Collection" heading and copy ("Knowledge Hub contains two collections…"), and `aria-current` on the active tab.
- [ ] 🟡 K03 "Find a Publication" — **filters rebuilt, they now actually work**
  - **To do:** Add the "Find a Publication" heading; search the article text and tags too (p. 155 — today only title, excerpt, author); add pagination and a label on the search input. Only 4 of 7 facets can show because Topic/Domain/Industry have no data.
- [ ] 🟡 K04 "Enerqa Publication" — reads `publications`, non-articles excluded
  - **To do:** Add the K04 heading and intro; show domain/industry/topic tags on cards; keep "Read Article" always and add a separate "Download Report" (today a file replaces Read Article). Fix the broken bodies (see new problems below).
- [ ] 🟡 K05 "Global Intelligence" — separate route
  - **To do:** Add the K05 block on `/knowledge-hub` itself (heading, the "Follow open-access news…" copy and an "Explore Global Intelligence" button).
- [ ] 🟡 K06 "Stay Informed" — newsletter + Discuss Your Project
  - **To do:** Use p. 156's sentence ("Receive new Enerqa publications and selected updates."), fix the heading level (h3 with no h2), and do one real test signup.
- [ ] 🟡 Author metadata **recovered for 21 of 25 articles** and a working Year filter (2024 archive stays a filter value, not a third collection)
  - **To do:** The count is **21 of 24**, not 21 of 25; the Year filter offers only 2024. Recover the 3 missing bylines (see line 568).
- [x] ✅ Removed the public **Learning** branch — `LearningMaterialsList.tsx` deleted (it was already orphaned; nothing imported it)
- [x] ✅ Removed the orphaned `GlossarySection.tsx`
- [x] ✅ No public **Authors** branch — authors are byline text + a search facet only, exactly as p. 225 requires
- [x] ✅ No separate archive destination
- [ ] 🟡 Merged `Insights` into `Publications` — one canonical library
  - **To do:** Two retired links now 404: `/insights/i-recs-…` redirects to `/knowledge-hub/irecs-…` (the DB slug is `i-recs-…`, `next.config.ts:31-32`), and `/insights/sudan-s-energy-balance-2020` points at an article that no longer exists. Fix the map entry and restore the Sudan article.
- [x] ✅ **Removed "Case Study" from the publication type options** (p. 229)

#### K03 filters — the old ones were decorative

The sidebar had two hardcoded checkbox groups with no `checked`, no `onChange` and no state wiring: `activeFilters` was read but never set. Clicking a box did nothing. One of its options was "Case Study", which p. 229 bans.

Rebuilt as real facets, with options derived from the data so a filter never offers a value that returns zero results:

| Facet | Status |
|---|---|
| Publication Type | ✅ working |
| Year | ✅ working |
| Language | ✅ working |
| Author | ✅ working (13 distinct bylines) |
| Topic (archive category) | ✅ built, hidden until publications are tagged |
| Domain / Industry | ✅ built — `domains`/`industries` fields added to Publications; the facets appear once a publication is tagged, and `?domain=`/`?industry=` from domain and industry pages pre-select them |

Within a facet values are OR'd, across facets AND'd. Plus a live result count ("Showing 25 of 25 publications", `aria-live="polite"`), removable filter chips, and Clear All — all required by p. 155.

#### Publication import clean-up (p. 225)

- [ ] 🟡 **4 non-articles found and unpublished**: `authors-biographies` (a biography), plus `frameworks-and-methodologies`, `environment-and-society` and `energy-technology-and-finance` (category separators). All four had been imported as `type: Article`. They keep their records via a new `recordKind` field but no longer publish — nothing was deleted.
  - **To do:** Correct this text: the 4 records were **deleted**, not unpublished — the database now holds 24 rows, all `recordKind: article`. The spec (exclude non-articles) is still met.
- [ ] 🟡 **Authors recovered from the source archive PDF**, which carries a `By:` line per article. 21 of 25 articles now have a byline.
  - **To do:** 21 of **24**. Two bylines were missed by `clean-publications.ts` (e.g. `supercritical-water…` fails the slug match) — apply them.
- [ ] 🟡 Orphan insights migrated into Publications under their own slugs (`breathing-vs-burning…`, `climate-forcers…`, `climate-change-and-war…`, `weathering-the-storm…`), so `/insights/{slug}` → `/knowledge-hub/{same-slug}`; `sudan-s-energy-balance-2020` was not migrated
  - **To do:** `sudan-s-energy-balance-2020` is still not a publication (not in the 25 Sep backup; the killed rewrite script only updates existing rows). In that backup the `climate-forcers…` and `weathering-the-storm…` bodies are 56 and 60 characters; check in the admin whether the 25 Sep body rewrite committed, and re-import them if not.

> **A mistake worth recording.** The first migration run used fuzzy title matching to detect duplicates and created 2 duplicate publications — "I-RECs: A Catalyst for…" vs "IRECs - A catalyst for…" are the same article but share no long common substring. Both duplicates were deleted, and the script now uses an explicit `ALREADY_MAPPED` list kept in step with `INSIGHT_SLUG_MAP` in `next.config.ts`. Re-running now migrates 0 — verified idempotent.

#### ❌ Still needs a human: the dates

**All 24 imported publications carry the same date, `2024-12-01`** — exactly the "one artificial date for the whole archive" that p. 225 forbids. The archive PDF has **no per-article dates** (it only says the work spans December 2023 – December 2024), so they cannot be recovered from the sources in this repo.

Rather than leave a placeholder passing as fact, every card now shows **"(date unverified)"** next to its date, driven by a new `dateVerified` checkbox. Ticking it hides the marker.

- [ ] 🔍 Recover each publication's real date from its original source and tick `dateVerified`
  - **To do:** Find each article's real date at its original source (the live enerqa.co.uk site may have them) and tick `dateVerified`.
- [ ] 🔍 **Approve the author bylines.** The source PDF spells several names inconsistently: `Dr. Islam M. Awad` / `Dr. Isalm M. Awad` (typo), and `Reem Almlik` / `Reem Elmalik` / `Reem Almalik`. p. 225 requires an *approved* byline identity, so these were imported verbatim rather than silently normalised. They currently appear as separate Author filter options.
  - **To do:** Also inconsistent: "Dr. Quosay A. Ahmed" / "Quosay A. Ahmed" / "Quosay A. Awad". Joint bylines are one facet value, so "Giovanni Fabbio" cannot be filtered alone — split joint bylines into individual authors once names are approved.
- [ ] 🟡 3 publications had no byline in the 25 Sep DB backup (`ghg-emissions…`, `supercritical…`, `the-imperative-for-esg…`). All 3 can be recovered from the repo: the body says 'BY: Mohamed M. Ahmed'; `archive-authors.json:34-37` gives 'Dr. Muzamil Abdella'; the body says 'By enerQA’s development team'
  - **To do:** Unverified (DB): the 25 Sep backup still has no author on these 3. The killed rewrite (`SP/kh/write_pubs.js`) set them only if it committed. Check in the admin and, if they are missing, set 'Mohamed M. Ahmed', 'Dr. Muzamil Abdella' and 'enerQA’s development team' (confirm the team byline is approved).
- [ ] 🔍 **Tag publications** with Domain / Industry (sidebar in the admin). The fields, filters, and domain/industry "Enerqa Publication" modules are all wired; tagging is an editorial call, so nothing was inferred
  - **To do:** Also: `archiveCategory` is empty on all 24, so the Topic facet is hidden — it can be restored from the archive PDF's section order without a human.
- [x] ✅ `Insights` collection is gone (no table, not in config)
- [ ] 🟡 Learning / Glossary label fields removed from `globals/KnowledgeHubConfig.ts` and `payload-types.ts:1424-1436`; their 8 columns in the empty `knowledge_hub_config_locales` table are still in the committed migration
  - **To do:** Code is done. The DB is unverified: confirm the 8 empty columns have been dropped from `knowledge_hub_config_locales` (accept Payload's drop prompt on the next `npm run dev`), and add a migration so production drops them too (`migrations/20260920_011009.ts:408-415` still creates them). Optional: no page reads this global, so `payload.config.ts:63` could remove it.
- [ ] 🟡 Owned vs external distinction (p. 229): first-party cards are labelled "Enerqa Publication · {type}"; external cards carry the publisher, "News", source date and a "Read full article" off-site link
  - **To do:** The "Enerqa Publication" label exists only in `RelatedPublications.tsx`, which renders nothing until publications are tagged. Add the first-party label to `/knowledge-hub` and search-result cards. (Global Intelligence side confirmed.)
- [ ] 🟡 K06 "Stay Informed" form now saves signups — it only called `preventDefault()`
  - **To do:** Code path is correct, but the `enquiries` table has 0 rows — it has never been proven end-to-end. Submit one test signup and check the row.

> Note (24 Sep 2026): the database now holds 24 publications, all `recordKind: article` — the 4 non-article records described above are no longer present.

> Note: "Case Study:" still appears 3× on `/knowledge-hub`, inside one article's own body text. That is an author's prose, not a Case Study section, so it was left alone — p. 229 bans the surface, not the phrase.

### Found in the 24 Sep 2026 audit

- [ ] 🟡 **Publication bodies are broken**: 4 say "Could not extract content automatically." on the public page (i-recs, supercritical, mercury, DPSIR); 4 are title-only (climate-forcers, weathering-the-storm, burger-pizza, food-waste); several contain *other* articles with their own "By:" lines (driving-climate-action, green-credit-lines, origins-of-urban-greening, scope-4); `sustainable-tourism` shows the Burger-and-Pizza article. Re-import from the archive PDF.
  - **To do:** All 24 bodies were rebuilt from the archive PDF on 25 Sep 2026 and saved in `scripts/publication-rebuild/out/`. The write script (`write_pubs.js`, one transaction) was stopped mid-run, so it either fully committed or fully rolled back. Open `/knowledge-hub/sustainable-tourism` in the admin or on the site: if it still shows the Burger article, run `node --env-file=.env scripts/publication-rebuild/write_pubs.js --dry`, review, then run it without `--dry`.
- [ ] 🟡 `/knowledge-hub` ships every publication's full rich text to the browser (2.76 MB HTML); the client uses only title, excerpt, author, date. Add a `select`.
- [ ] 🟡 Dates are formatted without a time zone (`KnowledgeHubClient.tsx:278`): stored `2024-11-30T16:00Z` renders "1 December 2024" on the server but "30 November 2024" in UK browsers — a hydration mismatch.
- [ ] 🟡 `knowledge-hub/[slug]/page.tsx` has no `recordKind: article` filter (unlike the list and sitemap).
- [ ] 🟡 Orphan components still in `src/`: `KnowledgeHubList.tsx` (Case Study option, fake .xlsx download), `DatasetList.tsx`, `ToolsList.tsx`, `tools/CarbonCalculator.tsx`.

---

## PART 9 — Data Portal (PDF pp. 157–161)

Route `/data-portal`. Segments D01–D06.

- [ ] 🟡 D01 "Data Portal" page exists, reads the `datasets` collection
  - **To do:** Use the p. 160 D01 copy ("…relevant to climate, energy, environment, nature, circularity, business and finance") and add a canonical.
- [ ] 🟡 D02 "Find Data" (p. 160) — search box with the spec placeholder plus Domain, Topic, Geography, Observation Period, Source, Frequency and Format filters in `DataPortalClient.tsx`; Domain and Topic do not work with current data
  - **To do:** `DataPortalClient.tsx:92-94` heading reads "Filters", not "Find Data"; the Domain checkboxes (`:33`) match category titles, and with 0 categories any tick returns "No datasets found"; Topic (`:124-127`) offers only "All Topics"; Frequency/Format never appear (no data, no migration); label "Format" should be "Available Format". Match Domain on the `domains` relation.
- [ ] 🟡 D03 "Explore a Dataset" (p. 160) — `DataPortalD03` on `/data-portal` shows World Bank CO2 per capita with a geography chooser, chart/table switch and an Open Dataset button
  - **To do:** `DataPortalD03.tsx:42-44` copy is not p. 160's; Observation Period (`:71-76`) is a read-only label, not a chooser; "Open Dataset" (`:46`) always opens the OWID `global-co2-emissions` record, not the World Bank series shown; the chart uses a mock "High/Mid/0" axis (`:138-143`) and draws missing values as zero-height bars (`:151`, p. 227); no source or licence line.
- [ ] 🟡 D04 "Dataset Catalogue" (p. 160) — heading, cards with provider, unit, geography and licence, UK-format date and an Explore Dataset link (`DataPortalClient.tsx:237-309`)
  - **To do:** `DataPortalClient.tsx:241` intro is invented ("Browse and download our curated collection of datasets."); use p. 160's "Browse source-backed datasets with clear descriptions, units, geographic coverage and update information." "Updated" (`:250`) shows `date`, the seed timestamp, not provider update information; the catalogue lists every dataset regardless of `status` (`data-portal/page.tsx:17-22`).
- [x] ✅ D05 "Dashboards and Data Stories"
- [x] ✅ D06 "Sources and Methodology" link block (p. 161) — spec heading, copy and "Sources and Methodology → /data-portal/sources" button (`DataPortalClient.tsx:316-327`)
- [ ] 🟡 Broaden from "Climate Data Portal" to **Data Portal across all four domains** (p. 225)
  - **To do:** Only 3 datasets, none tagged to a domain, none for environment or nature. Add datasets across all four domains and tag them.
- [ ] ❌ Build the candidate dataset list from pp. 160–161 (provider + initial view per dataset) — no candidate exists as a dataset record yet
  - **To do:** `src/scripts/seed-data-portal.ts:34-114` still defines only OWID CO2, Ember and World Bank adjusted net savings, none of the 10 pp. 160–161 candidates. Create connector-backed records for the candidates (`api/data/[dataset]/route.ts:47-98` already has Climate TRACE, World Bank, OECD waste and NASA POWER handlers).
- [ ] 🟡 Extend the `Datasets` collection with the p. 225–226 fields — `Datasets.ts` now defines provider, identifier, version, licence + URL, unit, geographic level, observation period, retrieval time, methodology, `datasetDownloadUrl`, `accessStatus` (verified_open/unknown/gated/broken/embargoed), `accessCheckedAt`, `accessEvidence`, reuse/redistribution/modification flags, attribution, source release date, frequency and format
  - **To do:** The fields now exist in `Datasets.ts`, but no migration adds the new columns; all 3 rows and the seed (`seed-data-portal.ts:50,77,103`) hold `accessStatus: 'free'`, which is no longer an option, and `search/loadIndex.ts:53` still filters on 'free'; `accessEvidence` is "HTTP 200…" (not enough, p. 227) and is not rendered; `methodology`, `frequency`, `format` and `sourceReleaseDate` are empty; `version` is not a real version.
- [ ] 🟡 Every published dataset must have an **ungated free anonymous download** (p. 226, 229)
  - **To do:** All three download anonymously, but they are raw provider files (a World Bank ZIP, a 49 MB Ember CSV), not connector-derived CSVs with attribution, units and methodology (p. 226). Serve downloads through `/api/data` connector exports.
- [ ] 🔍 **Provider compliance (found 24 Sep 2026):** `global-co2-emissions` (Our World in Data) and `renewable-capacity` (Ember) come from providers that are **not on the approved list** (pp. 209–224); p. 226 requires every value to derive from a permitted free API connector. Only `adjusted-net-savings` (World Bank) qualifies. Their `accessStatus` is `free`, not a verified value. No dataset has a chart yet (`embedUrl` empty on all three)

### Found in the 24 Sep 2026 audit

- [ ] ❌ `Datasets` has a `status` (draft / verified_open) field and a REST read rule, but the public pages do not apply it, so unverified datasets still publish (p. 227)
  - **To do:** The `status` rule in `Datasets.ts:9-14` covers only REST/GraphQL; the site's Local API queries skip access (`data-portal/page.tsx:17`, `datasets/[slug]/page.tsx:41`, `sitemap.ts:14`), so unverified datasets still publish. Add a `verified_open` filter to each (one field, not both `status` and `accessStatus`), and stop `seed-data-portal.ts:59,85,112` marking OWID and Ember `verified_open` on "HTTP 200" evidence.
- [ ] 🟡 Dataset `retrievalTime` / `accessCheckedAt` are seeded constants, not real connector checks, and dates render in US format.

---

## PART 10 — Tools (PDF pp. 162–166)

Route `/tools`. Segments T01, **T02** (flagship tools — missing from this list before the audit), T03, T04, T05.

- [x] ✅ T02 flagship tools — `tools/page.tsx:62-104` reads the three validated flagships from the CMS in p. 165 order, shows the p. 165 copy from each record's `desc`, and offers "Explore Tool → /tools/{slug}" and "Request Access → /contact?intent=tool&tool={slug}"

- [x] ✅ T01 "Enerqa Tools" catalogue page — H1, intro and meta title match p. 165 (`tools/page.tsx:14-19,84-87`)
- [x] ✅ T03 "Other Enerqa Tools" — p. 165 heading and copy; lists only validated non-flagship tools (none yet) with p. 166 availability labels (`tools/page.tsx:108-124`, `access.ts:12-18,29`)
- [x] ✅ T04 "Using the Tools" — p. 166 heading and copy, verbatim (`tools/page.tsx:127-136`)
- [x] ✅ T05 "Request Tool Access" — p. 166 heading, copy and both buttons: "Request Tool Access → /contact?intent=tool" and "Discuss Your Project → /contact?intent=project" (`tools/page.tsx:139-156`)
- [ ] 🔍 Validate names and versions for **GHG365 / GHG Emissions Calculator, MRV Tool, ESIA Risk Assessment Tool, Green Project Scoring Tool** (p. 166) — awaiting company confirmation; all four are `validated: false` with no version
  - **To do:** The company must confirm the names and versions before anyone ticks `validated`. Versions are cleared and all four tools are hidden (404; not on `/tools`, in search, contact or the sitemap).
- [ ] 🟡 Reconcile the sitemap's three flagship slugs — `/tools/esg-readiness`, `/tools/easysolar`, `/tools/greenscale-pro` (p. 3) — with the tool names on p. 166
  - **To do:** The record title is "ESG Readiness Diagnostic"; pp. 3 and 165 call it "ESG Readiness Tool". Rename it.
- [ ] 🟡 Remove placeholder / non-functional downloads (p. 225)
  - **To do:** No fake file downloads, but: ESIA "Open Tool" and MRV lead to an empty "Access the Tool" section, and the flagship mock UIs show fabricated numbers (250 kWp, 18.5% IRR, −40% emissions) at `tools/page.tsx:65-194`. Remove the mocks and fix the access states.
- [ ] 🟡 Extend the `Tools` collection — it currently has `slug`, `category`, `type`, `title`, `desc`, `image`, `link`, `iframeUrl`, `file`, `industries`. The spec (p. 225) requires: purpose, inputs, outputs, method, version, access, privacy
  - **To do:** Fields exist and render, but filled for few records: purpose 7/7, inputs 2/7, outputs 4/7, method 1/7, privacy 1/7. Flagship content contradicts p. 165 and the company profile (GreenScale Pro is a buildings/infrastructure sustainability-and-resilience tool; easySOLAR assumes a 25-year life; the ESG tool is a free Excel tool). The access options don't match p. 166; no "assumptions" field.

### Found in the 24 Sep 2026 audit

- [ ] 🟡 `tools/page.tsx:302-315` adds an invented "Custom Tool Development" service section.
- [ ] 🟡 `/contact` ignores `?intent=` and `?tool=`, so every tool/project CTA on the site lands on an un-preselected form.

---

## PART 11 — About (PDF pp. 167–170)

Route `/about`. Segments A01–A05.

- [x] ✅ A01 "About Enerqa"
- [ ] 🟡 A02 "Our Approach"
  - **To do:** Remove (or get approved) the invented side panel at `about/page.tsx:47-62` ("Evidence & Assessment"…), which is not in the spec.
- [x] ✅ A03 "Our Domains"
- [x] ✅ A04 "People and Organisation"
- [x] ✅ A05 "Connect with Enerqa"
- [ ] 🔍 Team information inside About — **only when approved** (p. 4)
- [ ] 🔍 Additional addresses, regional presence and phone numbers — **only after company approval** (p. 170)
  - **To do:** `contact/page.tsx:49-53` already publishes "Office: London, United Kingdom" — remove it until approved.
- [x] ✅ No external API needed on this page (p. 170)

---

## PART 12 — Detail and utility templates (PDF pp. 171–208)

### 12.1 Enerqa publication detail (pp. 171–174) — `/knowledge-hub/{publication-slug}`

- [x] ✅ Route exists
- [ ] 🟡 PUBL01 "Publication Header" and PUBL02–PUBL06 (p. 174): all six sections are coded in `knowledge-hub/[slug]/page.tsx`; JSON-LD author and `datePublished` fixed; PUBL01/04/05/06 still differ from the spec
  - **To do:** The render crash (an `onClick` alert placeholder on a server-rendered link) was removed on 26 Sep 2026, along with the fake Cite action. Still to match p. 174: show the language in PUBL01; add a real citation field and "Cite This Publication"; label the source link "Read Original Publication" — `originalUrl` (`:274`) is not a Publications field yet, so it never shows; pick PUBL05 by domain/industry tags plus dataset/tool links (`:169` uses `topic`); PUBL06 needs "Explore the Knowledge Hub" + "Discuss Your Project → /contact?intent=project" (`:310`); add an in-page breadcrumb with the title (its `#publications` anchor at `:200` doesn't exist).
- [ ] 🟡 Verified title, type, and author on every imported record
  - **To do:** Title/author/type were **not** verified: 3 of 24 have no author; several names misspelled; **bodies are misaligned** (`/knowledge-hub/sustainable-tourism` shows the "Hidden Costs of Your Burger and Pizza" article); 4 bodies say "Could not extract content automatically.", 5 are title-only, several contain tables of contents or other articles. Re-import each article from the archive PDF and unpublish empty records.

### 12.2 Global Intelligence (pp. 175–179) — `/knowledge-hub/global-intelligence`

- [x] ✅ Route exists (now 467 lines)
- [ ] 🟡 X01 "Global Intelligence" — the page has its own H1
  - **To do:** The H1 is right now, but the intro drops the p. 178 X01 text ("Every result links to complete reading… distinct from Enerqa-authored publications"); the collection switcher has no `aria-current`.
- [ ] 🟡 X02 "Search Global Intelligence"
  - **To do:** No "Search Global Intelligence" heading; the only filters are Topic links, one Geography select, Source, Language, Timeframe. Missing: Domain, Industry, Continent/Region/Country and Content Type controls, removable chips, Clear All, pagination, and the empty text "No open-access results match these filters". Topic links drop the other filters. Research/official modes have no search.
- [ ] 🟡 X03 "External Content Cards"
  - **To do:** Research and official items appear only with `?domain=&type=`; no Corporate Disclosure cards anywhere; every action says "Read full article". Open access is judged by a domain allowlist (which includes metered reuters.com), not per item; Guardian items carry multi-paragraph summaries. Make all four content types one collection with per-type action labels and per-item access checks.
- [ ] 🟡 X04 "Sources and Context"
  - **To do:** Add the "public reading ≠ permission to republish" rights sentence and contextual links to Enerqa domains, publications, datasets and tools.
- [ ] 🟡 Continent / region / country coverage filters, combining consistently with domain, industry, source, type, language and date (p. 225, 229): `?domain=`, `?industry=` and `?type=` narrow Global Intelligence; geography is one region select, with no continent or country level
  - **To do:** Geography is still one select of 10 region buckets (`news/geography.ts:28-39`, `global-intelligence/page.tsx:258-269`). Build a continent → region → country registry with multi-select, OR within a field and AND across fields (p. 179). `?domain=`, `?industry=` and `?type=` already work.
- [ ] 🟡 Geography = the **subject and locations covered**, never the publisher's HQ or a researcher's affiliation (p. 179, 226)
  - **To do:** Regions come from the text (correct), but matching mis-tags: EIA "New England natural gas…" → Europe; "eastern New Mexico" → Latin America; the pronoun "us" → North America (`geography.ts:21,25,41`). Untagged items default to "Global" instead of "Not Specified". Match countries properly and add Not Specified / Multiple Regions.

### 12.3 Dataset detail (pp. 180–183) — `/data-portal/datasets/{dataset-slug}`

- [ ] 🟡 **Route exists.** Build all six segments:
  - **To do:** The route returns 200, but most segments are missing (below).
- [ ] 🟡 DS01 "Dataset Summary" — what is measured, by whom, where, for what period
  - **To do:** No "Dataset Summary" heading; version is "…current release" (not a real version); retrieval time is a seeded constant shown in US format (`datasets/[slug]/page.tsx:239`).
- [ ] ❌ DS02 "Explore the Data" (p. 183) — not built; the dataset page has only an `embedUrl` iframe slot, empty on every dataset
  - **To do:** `datasets/[slug]/page.tsx:146-161` still renders only an iframe when `embedUrl` is set (null on all 3), so the section never appears. Build connector-driven filters that update the chart and table and persist in the URL (p. 183).
- [ ] ❌ DS03 "Chart, Table and Map" (p. 183) — not built
  - **To do:** `datasets/[slug]/page.tsx` has no chart, table or "Chart Table and Map" heading, and no page renders `DataSeriesTable` (only `feeds.test.ts` imports a helper from it). Render a chart and accessible table from the connector, with unit, geography, period, source and latest-observation status (p. 183).
- [ ] ❌ DS04 "Download and Cite" (p. 183) — only a "Free Download" link to the provider's raw file exists
  - **To do:** `datasets/[slug]/page.tsx:192` heading reads "Download Data", and its one button (`:194-197`) links to the provider's raw file. Add Download CSV via `/api/data` with a metadata readme, Download Source File, Copy Citation (`citation` is null on all 3) and View Original Source (p. 183).
- [ ] 🟡 DS05 "Sources and Methodology" (p. 183) — heading and attribution render; the other p. 183 fields do not
  - **To do:** `datasets/[slug]/page.tsx:167-186` renders the heading, attribution and `methodology` (empty on all 3). Add series ID, licence URL, coverage, frequency, units, release date/version, missing-value rules, transformations, limitations, the original method link and last-retrieved time (p. 183); the retrieval date sits in DS04 in the server's default locale format (`:239`).
- [ ] ❌ DS06 "Related Data and Domains" (p. 183) — not met; the related block is hidden (no tags) and never links to domain or industry pages
  - **To do:** `datasets/[slug]/page.tsx:255-292` has no "Related Data and Domains" heading, shows category topics as plain text (`:261-265`), ignores the `domains`/`industries` relations, and stays hidden because no dataset is tagged. Tag datasets and link them to the domain and industry pages (p. 183).

### 12.4 Dashboard template (pp. 184–187) — `/data-portal/dashboards/{dashboard-slug}`

- [x] ✅ **Route exists.** Publish only when a real dashboard is built (p. 3).
- [ ] 🟡 DB01–DB05 dashboard template (p. 187) — `dashboards/[slug]/page.tsx` shows the title and description, a `DataPortalD03` panel when `datasetConnector` is set, and interpretation and source lists; no dashboard records exist
  - **To do:** `dashboards/[slug]/page.tsx` lacks the p. 187 headings (it uses "Analysis & Interpretation" and "Underlying Data", and none for Overview, Controls or Primary Views). `DataPortalD03` (`:75`) ignores `datasetConnector` and always shows one World Bank CO2-per-capita view, with a hard-coded OWID "Open Dataset" link and no shareable state. There is no `generateMetadata`, and `datasetConnector` has no migration. With 0 dashboards the route 404s, which p. 3 allows.

### 12.5 Tool detail template (pp. 188–191) — `/tools/{tool-slug}`

- [x] ✅ Route exists
- [x] ✅ TD01 "Tool Overview" (p. 191) — heading, validated name, the p. 165 T02 purpose, an availability line and Request Access as the default action (`tools/[slug]/page.tsx:116-139`, `access.ts:50-70`); unvalidated tools 404
- [ ] 🟡 TD02 "Inputs and Outputs" (p. 191) — heading and Inputs/Outputs panels render from the CMS; approved input/output lists with units are still missing
  - **To do:** The heading exists (`tools/[slug]/page.tsx:145`), but no flagship lists actual inputs with units, parameters or expected user skill: the ESG inputs are profile narrative, easySOLAR's describe the UI and result sheets, and GreenScale's outputs (ESRQ score, roadmap) are filed under Inputs (`seed-tools.ts:176-179`). Get the real input/output lists from the company, and move GreenScale's list to `outputs`.
- [ ] 🔍 TD03 "Methodology and Limits" (p. 191) — the section renders method, assumptions/limits and version when present; easySOLAR has a method and limits, GreenScale Pro one line, ESG Readiness none
  - **To do:** The code is ready (`tools/[slug]/page.tsx:169-186`), but ESG Readiness has no method or limits (section hidden), GreenScale Pro has one sentence and no limits, and no tool has a version/date or source-data versions. The company must supply the method, limits and version/date (p. 191).
- [ ] 🟡 TD04 "Access the Tool" (p. 191) — an `#access` section with a conditional Download Tool / Launch Tool / Request Access action; Request Access opens the contact form with the tool preselected
  - **To do:** The flagships correctly show Request Access → `/contact?intent=tool&tool={slug}` (`tools/[slug]/page.tsx:193-203`), and the contact form preselects the tool. But the download branch (`:205-217`) shows only file type, version and size; p. 191 also requires licence and system requirements, so add those fields to `Tools.ts` and render them.
- [ ] 🟡 TD05 "Guidance and Support" (p. 191) — heading, the p. 166 support line and a Contact Support link; no user guide or input-handling text yet
  - **To do:** `tools/[slug]/page.tsx:248-275` has the heading and a Contact Support button (`/contact?intent=tool&tool={slug}`), but there is no user-guide field or link; `privacy` is empty for all 3 flagships, so no input-handling note shows; and no tool has `domains` set. Add a user-guide field and approved input-handling text (p. 191).

### 12.6 Sources and Methodology (pp. 192–195) — `/data-portal/sources`

- [x] ✅ **Route exists.**
- [ ] 🟡 S01 "Sources and Methodology" / S02 "Source Directory" / S03 "Attribution and Reuse" / S04 "Understanding the Data" (p. 195) — all four headings render on `/data-portal/sources`; S02 lists the enabled registry providers
  - **To do:** The headings match p. 195, but the fallback copy is not the spec's: S01 (`sources/page.tsx:46-47`), S03 (`:106`) and S04 (`:125`, which claims dashboards and datasets "display raw provider values"). S02 (`:72-88`) mixes data and news/research providers without separate labels; it omits docsUrl, dataset IDs, coverage, frequency and refresh schedule; and it leaves out OWID and Ember, which supply 2 of the 3 datasets.
- [ ] 🟡 Reachable from **every** numerical view (p. 4)
  - **To do:** Reachable only from the footer and the Data Portal index. Add a sources link beside every chart/table and on dataset detail.

### 12.7 Contact and project enquiry (pp. 196–198) — `/contact`

- [ ] 🟡 F01 "Contact Enerqa"
  - **To do:** The H1 is right but the copy is not p. 198's; it adds an unapproved "London, United Kingdom" office and links to the retired `/projects` (`contact/page.tsx:49-53, 64`). Use the spec copy and link `/project-development`.
- [x] ✅ F02 "Tell Us About Your Enquiry" (p. 198): Name, Email, Enquiry Type (3 spec options) and Message required; Organisation, Domain, Industry, Project Location and Current Stage optional, with explicit labels (`ContactForm.tsx:135-230`); `?intent=`/`?tool=`/`?domain=`/`?industry=` prefill stays editable (`lib/forms/contact.ts:95-107`)
- [x] ✅ F03 "Send Your Enquiry" (p. 198): the spec's privacy line, a "Send Enquiry" button and a separate, unticked, optional newsletter box (`ContactForm.tsx:233-262`)
- [x] ✅ F04 "Submission States" (p. 198): the spec's loading, success and error wording; input kept on errors; submit disabled while sending; focus moved to the result (`ContactForm.tsx:56-126, 255-261`)
- [ ] 🟡 Server-side validation (p. 228)
  - **To do:** The contact action validates with zod, but `Enquiries` allows public `create`, so REST `POST /api/enquiries` skips all validation; the tool-request action has none. Lock collection create to the server actions and validate the tool form.
- [ ] 🟡 Spam protection (p. 228)
  - **To do:** Honeypot on contact and newsletter only; no rate limit; bypassable through the REST API and the tool form.
- [x] ✅ Marketing consent kept **optional and separate** from the enquiry (p. 228)

### 12.8 AI search and answer page (pp. 199–202) — `/search?q={query}`

- [x] ✅ Route exists with keyword search over CMS collections
- [ ] 🟡 AI01 "Ask and Explore" — keep the user's query editable and preserved
  - **To do:** The input has no label and the icon-only submit button has no accessible name (`search/page.tsx:99-108`); placeholder differs from the spec.
- [ ] 🟡 AI02 "Answer and Sources" — a source-led generated answer
  - **To do:** Uses Google Gemini (`gemini-2.5-flash`, `AIResponse.tsx`), but no `GEMINI_API_KEY` is set. `AnswerUnavailable` fallback is currently active. Depends on the AI provider decision (🔍 item below): choose a free-tier provider, set its key, and enable `gemini` (or its replacement) in `core/registry.ts`.
- [x] ✅ AI03 "Relevant Enerqa Content" — results grouped as p. 202 lists (`search/page.tsx:96`), canonical URLs (publications link to `/knowledge-hub/{slug}`, `loadIndex.ts:111`), term matching (the spec chip "What does ESG readiness involve?" finds the ESG Readiness Tool, `searchIndex.test.ts:84`)
- [ ] 🟡 AI04 "Other Sources and States"
  - **To do:** No external results; loading/empty/failure texts don't match the spec; no privacy/feedback guidance. Depends on the AI provider decision (🔍 item below): choose a free-tier provider, set its key, and enable `gemini` (or its replacement) in `core/registry.ts`.
- [x] ✅ **`SITE_INDEX` fixed**: `search/siteIndex.ts:10-66` lists only six existing hub routes; the retired routes and the 404ing `/data-portal/datasets` are gone (tested `searchIndex.test.ts:195`)
- [x] ✅ Index canonical first-party domain, capability (anchored), industry, lifecycle, publication, dataset and tool pages, returned with excerpt, category and date (p. 227): `search/loadIndex.ts:24-141`
- [ ] 🟡 Keep drafts, confidential briefs, internal CMS records and restricted tool inputs out of the public index (p. 227)
  - **To do:** The index filters tools (`validated`), datasets (`accessStatus: free`) and non-article publications, and never reads Enquiries (`loadIndex.ts:43-64`). But no collection has a draft/approval status, so a publication is indexed the moment it is saved. Enable `versions: { drafts: true }` on Publications and filter `_status: 'published'`.
- [ ] 🟡 Do not force an Enerqa result into unrelated answers (p. 13, 227)
  - **To do:** Depends on the AI provider decision (🔍 item below): choose a free-tier provider, set its key, and enable `gemini` (or its replacement) in `core/registry.ts`.
- [ ] ❓ Never fabricate company work, credentials or data; cite only what was actually retrieved (p. 227)
  - **To do:** Depends on the AI provider decision (🔍 item below): choose a free-tier provider, set its key, and enable `gemini` (or its replacement) in `core/registry.ts`.
- [ ] 🔍 Inference must use a **free corporate-use service within its free quota**, or a self-hosted appropriately licensed model — no paid tier (p. 13)
  - **To do:** Decide on the provider and confirm its free-tier terms for corporate use (UK/EEA, use of prompts). Gemini is registered but disabled in `core/registry.ts`, and search falls back to keyword results, so nothing can incur charges today.
- [ ] 🟡 Test: general non-Enerqa queries, project questions, ambiguous terms, **Arabic queries**, conflicting sources, retrieval failures (p. 227). Keyword search and the prompt are tested; generated answers cannot be tested while no AI provider is approved
  - **To do:** Keyword search is tested for general, project, ambiguous, Arabic and retrieval-failure queries (`searchIndex.test.ts:113-230`), and the prompt rules are tested (`aiAnswer.test.ts:58-89`). Add a conflicting-sources case, and test generated answers once an AI provider is approved (`registry.ts:347` `enabled: false`).
- [x] ✅ `noindex` on search results and low-value filter combinations (p. 227)

### 12.9 Conditional careers template (pp. 203–205) — `/about/careers`

- [ ] 🟡 Q01 "Purpose and Scope" / Q02 "Main Content" / Q03 "Next Action" template exists
  - **To do:** Hard-coded, not CMS-driven; headings are "Careers at Enerqa" / "Our Culture & Scope" / "Open Positions", not the spec's; Q03 uses an unapproved careers@ mailbox with no privacy line.
- [ ] 🔍 Publish **only** with actual approved recruitment content — **correction:** this was ticked, but the page was live with invented claims ("a team of data scientists, energy analysts, and software engineers", "remote-first, globally distributed"). It now returns 404 until approved text replaces them and `CAREERS_CONTENT_APPROVED` is set to `true`

### 12.10 Policy, accessibility and error pages (pp. 206–208)

- [x] ✅ U01 "Utility Page Titles" — four distinct destinations: Privacy Notice, Terms of Use, Cookie Choices, Accessibility Statement
- [ ] 🔍 U02 "Approved Text and Status" — use real approved legal text, not placeholder (p. 208); no approved text exists yet, and the policy pages 404
  - **To do:** No approved policy text exists: the four old pages were deleted, and `Policies` has 0 rows and no migration, so nothing renders. The company must approve privacy, terms, cookie and accessibility text that reflects the actual hosting, analytics, AI, newsletter, forms, cookies and processors (p. 208). `Policies.ts` also has no approval-status field.
- [ ] ❌ U03 "Actions" (p. 208) — not met: no cookie controls exist, and the privacy and accessibility pages 404
  - **To do:** No cookie-consent code exists in `src`, so no control changes actual consent (p. 208). Privacy and accessibility have no working contact route, because both pages 404 (`[policy]/page.tsx:57`). Build cookie controls, and give both pages an approved contact route.
- [x] ✅ 404 page: `src/app/(frontend)/not-found.tsx` for `notFound()` inside the site, and `src/app/global-not-found.tsx` (enabled by `experimental.globalNotFound` in `next.config.ts`) for mistyped URLs, both with header and footer
- [x] ✅ 404 directs visitors to search and the nearest relevant section (p. 4): p. 208's title, message and buttons (Search Enerqa, Go to Homepage, Explore Domains and Industries) plus "Go to {section}" from the URL
- [ ] ❌ No fake utility destinations, and no Contact page disguised as legal or accessibility information (p. 8, 225) — footer links are not routed to Contact, but all four lead to 404s
  - **To do:** `Footer.tsx:138-141` and `sitemap.ts:34-38` link to /privacy, /terms, /cookie-choices and /accessibility, which all 404 until `Policies` rows exist. Publish the approved pages, or remove the links until then (p. 4, 225).

### Found in the 24 Sep 2026 audit

- [x] ✅ `FooterBreadcrumbs.tsx`: dataset and dashboard trails now link only to `/data-portal` (no more 404 parents, p. 4)
- [x] ✅ `Enquiries` create is limited to logged-in staff (`Enquiries.ts:14`), so `POST /api/enquiries` no longer bypasses validation and the honeypot; the server actions write through the Local API
- [x] ✅ Tool-access requests: the unvalidated inline form (`tools/[slug]/actions.ts`, `RequestAccessForm.tsx`) was removed; "Request Access" now links to `/contact?intent=tool&tool={slug}`, which preselects the tool and uses the validated contact action
- [x] ✅ `search/AIResponse.tsx` shows the public AI04 failure text (`AnswerUnavailable`, `:15-21`) instead of the GEMINI_API_KEY developer message; the prompt asks for plain text without Markdown (`aiAnswer.ts:116`), and the answer renders as text with linked citations
- [x] ✅ The Global Intelligence Language filter lists one ISO 639-1 code per language: every news item passes `normaliseLanguage` (`core/language.ts:35`, `news/index.ts:149-155`) before the option list is built (`news/index.ts:261`)
- [x] ✅ `/data-portal/sources` has its own title and canonical (`sources/page.tsx:12-16`); policy pages take their title from the CMS record plus the " | Enerqa" template, so the brand is not doubled (`[policy]/page.tsx:31-34`)
- [x] ✅ No unapproved mailboxes are published (p. 8): `info@enerqa.co.uk` is the only address in `src/`; the hard-coded accessibility page is gone (now the CMS `[policy]` route), and careers returns 404 until approved content exists (`about/careers/page.tsx:30, 39`)
- [ ] 🟡 Heading levels: tool detail runs h1 → h2 → h3; dataset detail no longer has an h4 under an h2, but its DS04 heading is still an h3
  - **To do:** Tool detail is fixed. On dataset detail, the DS04 "Download Data" heading is an h3 (`datasets/[slug]/page.tsx:192`) under DS05's h2, and it becomes an h1 → h3 skip whenever DS05 is hidden (no attribution or methodology). Make each DS segment heading an h2.

---

## PART 13 — API provider specifications (PDF pp. 209–224)

**Hard rule (p. 209):** every connector must be free and open-access. No paid API, trial, paid fallback, overage or licence purchase.

### 13.0 What was built

```
src/lib/api/
  core/       registry, shared fetch, provenance, CSV, destination rules
  data/       7 numerical connectors (pp. 218–224)
  research/   6 research and disclosure connectors (pp. 212–217)
  news/       4 news connectors (pp. 210–216)
```

`core/registry.ts` is the switchboard: one row per provider with its licence, attribution, published limits, cache lifetime, key variable and an `enabled` flag. Setting `enabled: false` removes a provider from every page at once, which is what p. 227 asks for when a provider goes chargeable.

`core/fetch.ts` is the only way a connector reaches the internet, so the shared cache, the descriptive User-Agent, the per-provider budget, the disabled check and typed failure happen once instead of thirteen times.

**Verified live (11):** Climate TRACE, World Bank, OECD municipal waste, NASA POWER, GBIF Occurrence, OpenAQ v3, OpenAlex, DOAJ, GBIF Literature, SEC EDGAR, **EIA Open Data** (24 Sep 2026: US net generation 2020–2023 returned with the configured key). **OSTI** now answers (3 verified-open records) but drops some parallel connections — intermittent.

**Blocked, with the reason recorded in the connector (4):**

| Provider | Blocker | To unblock |
|---|---|---|
| ~~EIA Open Data~~ | ✅ key set and verified live | — |
| ReliefWeb | appname not registered (403) | register, set `RELIEFWEB_APPNAME`, flip `enabled` |
| OSTI | reachable now; some parallel requests closed by the server | watch the `[osti]` log lines; consider one request at a time |
| OECD Rio markers | data route 403 from this origin | generate a narrow key in Data Explorer |

#### Findings from live testing

These are the things that cost time and would cost it again:

1. **OECD returns HTTP 500 — not 406 — when sent `Accept: application/json`**, and 200 when sent `*/*`. The shared fetch sets that header by default, so the connector overrides it.
2. **OECD serves different subject areas from different bases.** Rio markers lives under `/dcd-public/`, not `/public/`; the wrong base gives a 500. The dataflow's own `self` link is what reveals it.
3. **The same OECD endpoint answers in SDMX-JSON 1.0 or 2.0** — `structure` singular versus `structures` array. Handling only one produced an empty chart rather than an error.
4. **NASA POWER marks missing observations as `-999.0`.** Parsed naively that becomes "-999 °C" on a chart. The fill value is read from the response header rather than hardcoded.
5. **GBIF's first unfiltered Qatar result was CC BY-NC**, which p. 223 bars from corporate reuse. The licence filter runs in the query and again on the response.
6. **OpenAQ returns `licenses: null` on many locations.** Unknown is not open, so those are excluded — 23 of 30 stations were dropped for Texas.
7. **Bare `doi.org` links are not a reading destination.** p. 212 asks us not to *prefer* the DOI over a repository copy, so resolvers sort last rather than being banned — a hybrid OA article often lives only at the publisher.

#### Fabricated content removed

| What | Where | Why it mattered |
|---|---|---|
| `generateMockWorldBankData()` | `lib/api/worldBank.ts` | invented country emissions on API failure |
| `generateMockNoaaData()` | `lib/api/noaa.ts` | invented climate readings when the token was missing |
| `generateMockOpenAQData()` | `lib/api/openaq.ts` | invented **air-quality measurements** |
| `mockEmissionsData` | `app/api/climate/emissions/route.ts` | a public endpoint serving invented per-country emissions with a `source` field, plus an invented policy `target` line |
| `mockTempData` | `app/api/climate/temperature/route.ts` | invented temperature anomalies labelled "World Bank CCKP API (Mock)" |

All eight files in `src/lib/api/*.ts` were orphaned — nothing had imported them since Part 3 removed `SustainabilityData`. The two API routes were reachable by anyone. Deleting `noaa.ts` also removed the last `NEXT_PUBLIC_` credential in the codebase.

### 13.1 Architecture requirements (pp. 209–211, 226)

- [x] ✅ Server-side connectors behind a **shared cache** — every news, research and data call goes through `fetchFromProvider` / cached `fetch` with `next.revalidate` (audit 24 Sep 2026)
- [ ] 🟡 Store original IDs and URLs, source timestamps, retrieval time, provider, rights status, provenance — the `Provenance` type in `core/types.ts`, filled by every connector
  - **To do:** The provenance fields travel on each record in memory but are never stored (`external_items` has 0 rows), and `accessCheckedAt` is set at render time — it claims a check that never happened (`provenance.ts`). News items carry no access status. Persist ingested records with a real check time.
- [x] ✅ Reuse filtered records across home, domains, industries and Global Intelligence — one news pool, no per-page upstream queries
- [x] ✅ **No `NEXT_PUBLIC_` credential remains** — `noaa.ts` was deleted with the orphaned connectors; the only `NEXT_PUBLIC_` variable left is the non-secret `NEXT_PUBLIC_BASE_URL`. Spec: p. 226, p. 228
- [ ] 🟡 URL deduplication, relevance filtering and publication-date validation before display (news). DOI dedup and geography tags belong to the research connectors, still to build
  - **To do:** News gate and DOI dedupe work, but research items carry no geography or language tags. Add coverage-geography tags.
- [x] ✅ Respect the NewsData query cap using **separate topic baskets** — four queries, each well under the 100-character limit
- [ ] 🟡 Per-provider request budgets that count real upstream calls only, plus 429/503 backoff with Retry-After and a circuit breaker (`core/fetch.ts`, `core/health.ts`; pp. 209, 226). Retrieval time comes from the provider's `Date` header, and `stale` is computed and shown on home, domain/industry feeds and data tables
  - **To do:** Only one gap is left: the Global Intelligence news list shows 'Retrieved …' but ignores `result.stale` (`global-intelligence/page.tsx:426`), so show the stale notice there. Upstream-only counting (`core/fetch.ts:117`), backoff + Retry-After + breaker (`core/health.ts:169-259`) and the no-key OpenAlex cap of 80 (`health.ts:50, 70`) are done.
- [ ] 🟡 Loading states reserve card dimensions — domain, industry and Global Intelligence feeds stream in behind same-size `FeedSkeleton`s (motion-safe pulse). Data Portal charts: none exist yet
  - **To do:** Domain, industry and GI feeds use `FeedSkeleton`, but the homepage `FirstFoldFeeds` has no Suspense and blocks the whole render (first `GET /` took 22 s). Wrap H03/H04 in Suspense with a skeleton.
- [x] ✅ Empty results say "No relevant updates are available"; every provider returns `[]` on failure rather than throwing or inventing content
- [ ] 🟡 `accessStatus` / `accessCheckedAt` / `accessEvidence` recorded; `publishableOnly()` enforces the `verified_open` gate, and an unstated status defaults to `unknown` so a connector that forgets fails closed
  - **To do:** The gate exists, but every connector **hard-codes `'verified_open'`** — no anonymous check of the final destination is ever made (pp. 209, 227), and news bypasses the gate entirely. Validate links at ingestion and recheck periodically; gate news too.
- [ ] 🟡 A provider going chargeable disables the connector pending review — `enabled: false` in `core/registry.ts` takes it off every page at once (ReliefWeb is currently off this way)
  - **To do:** Works for the 13 registry providers, but NewsData, GDELT, EIA RSS, EEA RSS and Gemini are not in the registry, so they cannot be switched off. Register them.

### 13.2 News and research connectors

- [ ] 🟡 **NewsData.io** (`newsdata`) — p. 210 — delayed free feed, four topic baskets, 48 credits/day
  - **To do:** Delay label and allowlist are present, but its own budget shuts it off (see the budgets item); article destinations are never validated; `reuters.com` is allowlisted despite its registration wall (a human decision).
- [ ] 🟡 **GDELT** (`gdelt`) — p. 211 — legacy news coverage, `domainis:` allowlisting
  - **To do:** `domainis:` is used, but the log shows 96 rate-limit replies and 64 timeouts with no backoff, so GDELT contributes almost nothing. Add backoff/circuit breaker; don't cache rate-limit text.
- [ ] 🟡 **OpenAlex** (`openalex`) — p. 212 — verified live, `filter=is_oa:true` enforced, repository copy preferred over the DOI resolver
  - **To do:** `is_oa` and URL preference are correct, but it contributes **zero cards** on the pages — newest-first sorting lets OSTI win every time. No licence/version/preprint labels; usage headers untracked; cap above the allowance.
- [ ] 🔍 **DOAJ** (`doaj`) — p. 213 — verified live. ⚠️ **Launch gate**: p. 213 records that the quota could not be reverified, so it must be confirmed before go-live and never advertised as unlimited
  - **To do:** Confirm the quota before launch. Also: no per-article licence captured, a "Peer reviewed" badge asserted for every DOAJ item (`doaj.ts:84`), no ≤ 2 req/s throttle, and zero items shown on the pages.
- [ ] 🟡 **ReliefWeb** (`reliefweb`) — pp. 213–214 — connector built but **disabled in the registry**. An unregistered appname returns HTTP 403; register at https://reliefweb.int/help/api, set `RELIEFWEB_APPNAME`, then flip `enabled` to true
  - **To do:** Before enabling: it marks every report page open with no attachment check (`reliefweb.ts:100`), which p. 214 forbids — reject summary-only reports.
- [x] ✅ **U.S. EIA Today in Energy RSS** (`eia_rss`) — p. 214 — keyless RSS, public domain, text only (no EIA photos or logo)
- [ ] 🟡 **DOE OSTI.GOV API v1** (`osti`) — p. 215 — **reachable as of 24 Sep 2026** (returned verified-open records), but the server closes some parallel connections. Now feeds the Energy domain's EP module. Confirm stability before launch
  - **To do:** Also: titles render raw `<em>` markup, and OSTI crowds out every other research provider. Limit concurrency, strip markup, rebalance.
- [ ] 🟡 **EEA** (`eea_rss`) — pp. 215–216 — keyless RSS, CC-BY with attribution. Two live feeds; `/en/publications/rss.xml` returned 404 on 19 Sep 2026 and was left out rather than guessed at
  - **To do:** Both feeds render, but there is no publication feed, no Europe-focus label, and no rights/access check. Add the label; find the current publication feed URL.
- [ ] 🟡 **GBIF Literature** (`gbif-literature`) — pp. 216–217 — verified live, `openAccess=true` enforced and bare DOI resolvers rejected
  - **To do:** Filter and DOI rejection are correct and it renders on the Environment page, but researcher country vs coverage country is not captured and the `websites` link is not verified open.
- [ ] 🟡 **SEC EDGAR** (`sec-edgar`) — p. 217 — verified live. A curated issuer watchlist, not keyword ESG search, labelled "Corporate disclosure"
  - **To do:** Renders on the Business domain, but labelled "SEC Form 8-K" — "Corporate disclosure" appears nowhere (`official.ts`); filings are not curated for ESG content; the watchlist (Exxon, Chevron, Duke, NextEra) is a human choice.

### 13.3 Numerical data connectors (pp. 218–224)

- [ ] 🟡 **Climate TRACE** (`climate-trace`) — p. 218 — verified live. p. 218 says to confirm v7: v7 serves `/definitions/*` but every emissions route 404s, so data comes from v6. GWP horizon is part of the unit, never implied
  - **To do:** The CSV route returns live values, but no inventory release/version is recorded, there is no beta warning, and the route accepts years 1960–2100 — a single request fans out to 141 upstream calls (`route.ts:37-40`). No page uses it. Record the release; cap the year span.
- [x] ✅ **World Bank Indicators API v2** (`world-bank-indicators`) — p. 219 — verified live. The old `worldBank.ts` actually called Climate Watch and **generated mock data** on failure; deleted, not patched
  - **To do:** Confirmed live via `/api/data/world-bank-indicator` (release 2026-07-13, units, nulls) — but no page links to it.
- [ ] 🟡 **OECD SDMX** (`oecd-sdmx`) — p. 220 — municipal waste was verified live on 19 Sep; **failing on 24 Sep**. Climate-related development finance is blocked (data route 403 from this origin).
  - **To do:** `/api/data/municipal-waste` currently returns **503** (OECD answers HTTP 500). No 60-downloads-per-hour cap. Rio markers still blocked. Fix the default key, add the hourly cap, generate the Rio query.
- [ ] 🟡 **U.S. EIA Open Data** (`eia-open-data`) — p. 221 — **verified live** with the configured `EIA_API_KEY` (24 Sep 2026)
  - **To do:** The connector works (one-off probe, 24 Sep), but `fetchEiaSeries` is **called nowhere in `src/`**. Wire it into the Energy data preview and the Data Portal.
- [x] ✅ **NASA POWER** (`nasa-power`) — p. 222 — rewritten and verified live. The old one ignored POWER's `-999` fill value, which charts as "-999 °C"
  - **To do:** Confirmed: CSV returns 200 with version v2.10.0, the fill-value note and the time standard; the −999 case is tested.
- [ ] 🟡 **GBIF Occurrence** (`gbif-occurrence`) — p. 223 — verified live. CC0/CC BY enforced twice, in the query and again on the response. The first unfiltered Qatar result was CC BY-NC, which p. 223 bars
  - **To do:** Licence filter is correct and tested, but the connector is used nowhere, and there is no download DOI/ZIP or dataset DOI (p. 223). Wire it and add a DOI extract.
- [ ] 🟡 **OpenAQ v3** (`openaq-v3`) — p. 224 — rewritten and verified live. Licence flags checked per source; 23 of 30 stations were excluded as unknown or non-commercial. The old one returned `generateMockOpenAQData()` when the key was missing
  - **To do:** Fetches station metadata only, not concentrations; ignores `modificationAllowed` and share-alike (`openaq.ts:78-81`); used nowhere. Add measurements and the full licence flags.

### 13.4 Existing connectors not in the spec

Decide: keep with a documented licence, or retire.

- [x] ✅ Retired — `cckp.ts`, `noaa.ts`, `osm.ts`, `unOcha.ts` and `unSdg.ts` are no longer in `src/lib/api/` (checked 24 Sep 2026)

### 13.5 Data integrity rules (pp. 226–227)

- [ ] 🟡 Separate labels for observation period, source release date and Enerqa retrieval time — carried on every record and rendered by `sourceLabel()`
  - **To do:** `sourceLabel()` is rendered only by `DataSeriesTable`, which no page uses (feeds do keep retrieval vs publication time apart). Render it on data views.
- [ ] 🟡 Accessible tabular equivalent built — `components/data/DataSeriesTable.tsx`, a real `<table>` with `scope`d headers, a caption and the provenance block. Charts themselves are Part 9
  - **To do:** Built, but only a test imports it. Use it on the dataset pages.
- [ ] 🟡 CSV downloads carry attribution, licence, methodology link, source release, retrieval time, a stale notice and transformation notes, and neutralise formula cells: `GET /api/data/[dataset]`, ungated as pp. 221/223 require
  - **To do:** Formula injection and the stale line are fixed (`csv.ts:22-40, 93-95`). Still to do: link `/api/data/{dataset}` from dataset pages, which only link the provider's `datasetDownloadUrl` (`datasets/[slug]/page.tsx:194`), and point 'Methodology:' at a real methodology page instead of API docs (`csv.ts:87` uses `registry.ts` `docsUrl`).
- [x] ✅ Never fill missing values with zero — `value: number | null` throughout, empty cells in CSV, em dash in tables, covered by tests
- [ ] 🟡 Never silently mix annual and monthly observations, modelled estimates and national inventories, nominal and constant currency, or different CO2e GWP horizons — `mixedMeasureReason()` (exported from `DataSeriesTable.tsx` for charts to reuse) refuses differing frequency, unit or measure basis and says why in plain words; covered by tests
  - **To do:** `mixedMeasureReason` works and is tested, but runs only inside the unused table — not in the CSV route or any chart. Apply it wherever series are combined.
- [ ] 🟡 Failures return a typed reason and an honest message, no connector ever fabricates, and the table shows "Showing the latest cached release, retrieved {date}" when data is stale (p. 227)
  - **To do:** Typed failures are true; the stale notice never renders anywhere because no data view uses the table.

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
  - **To do:** A `Policies` collection now holds the policy text behind `/[policy]` (privacy, terms, cookie-choices, accessibility), but it has 0 rows and no migration, and consent/state rules are not modelled. Enter the approved text once legal signs off (🔍).
- [x] ✅ Remove Project / Case Study / Experience record types
- [ ] 🟡 Taxonomy: domain, industry, capability, lifecycle stage, topic, covered country codes, region IDs, continent IDs, geographic scope, content type, first-party/external, source, author, date, language, access/status, data frequency/format
  - **To do:** No fields for lifecycle stage, covered country codes, region/continent IDs, geographic scope, first-party/external or data frequency/format. Add them.
- [ ] 🟡 Keep author affiliations and publisher locations **separate** from subject-coverage geography
  - **To do:** Only a single free-text `geography` field; the GBIF researcher-vs-coverage split is not captured. Add structured coverage fields.

### 14.2 SEO and canonical content (p. 227)

- [ ] 🟡 Unique descriptive title + meta description on every substantive page
  - **To do:** `/data-portal/sources` uses the legacy default title and description; privacy, terms, accessibility, cookies and search share "Climate, Energy & ESG Advisory"; titles read "Privacy Notice - Enerqa | Enerqa"; 4 publications have "Could not extract content automatically." as their meta description. Write per-page metadata.
- [ ] 🟡 Exactly one H1 and a coherent H2/H3 hierarchy per page
  - **To do:** Header and footer are fixed (no heading before the H1; the footer uses visible h2s). Check publication and tool detail pages for H1 → H3 jumps.
- [x] ✅ Stable heading-derived anchor slugs for domain capabilities
- [ ] 🟡 Consolidate first-party article duplicates item by item
  - **To do:** `/insights/i-recs-…` 308s to `/knowledge-hub/irecs-…`, which 404s (the real slug is `i-recs-…`). Fix the map in `next.config.ts`.
- [ ] 🟡 **XML sitemap** — `src/app/sitemap.ts` + `robots.ts`. Fixed 24 Sep 2026: `/cookies` → `/cookie-choices` (was a 404), added `/domains-and-industries`, `/project-development`, `/knowledge-hub/global-intelligence`, `/data-portal/sources`; non-article publications excluded
  - **To do:** Valid XML with 65 URLs, but it advertises the broken publication pages and the 2 non-compliant datasets. Exclude them.
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
  - **To do:** Tokens fixed (`--green-deep` #007a75 = 5.2:1, `--color-primary-deep`, focus ring); the "Open access" badge is now 4.81:1. Still to do: `text-gray-400` on white → `text-gray-500` in `KnowledgeHubClient.tsx`, the GI page, `DataPortalClient.tsx`, `ui/Accordion.tsx`, `home/NewsCard.tsx` and the dashboard page (not `project-development/page.tsx:269`, which sits on navy); input focus rings `--color-primary` → `--color-primary-deep`.
- [x] ✅ Reduced-motion support: the framer-motion components use `useReducedMotion`, Lenis starts only without `prefers-reduced-motion`, and the H05 cards have a pause control and never auto-rotate under reduced motion
- [ ] 🟡 Charts: accessible tables + non-colour-only labels
  - **To do:** The only first-party chart (`DataPortalD03.tsx`) is a colour-only bar chart with hover-only values and no table. Render `DataSeriesTable` beside it and add visible period/value labels (p. 228).
- [x] ✅ Dialog/menu focus trapping and Escape by keyboard: search dialog (focus in, trap, Escape, focus returned) and mobile nav (trap, Escape, focus returned to the menu button) — `Header.test.tsx`
- [ ] 🔍 Long Arabic labels must not clip — needs approved Arabic content first
  - **To do:** Test once approved Arabic content exists.
- [x] ✅ Reserve feed/widget dimensions: homepage H03/H04 stream inside `<Suspense>` with same-size skeletons; domain/industry/GI feeds use `FeedSkeleton`
- [ ] 🟡 Lazy-load below-fold charts and large external widgets
  - **To do:** The hero video no longer autoplays. Add `loading="lazy"` to the tool iframe (`tools/[slug]/page.tsx:227`) and the dataset iframe (`data-portal/datasets/[slug]/page.tsx:152`); no `next/dynamic` is used for below-fold widgets.
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
- [ ] 🔍 Approved privacy text for the chosen processors, retention and data flows
- [ ] 🔍 Handover pack: editable CMS templates, taxonomy guide, provider credentials + account owners, request budgets, connector/error logs, source-rights register, redirect list, analytics configuration, bilingual editing guidance, tested download/tool access

### 14.5 Launch acceptance checklist (p. 229)

- [x] ✅ Six primary menu sections and mega menu work by pointer, keyboard and mobile; all 13 industries + the exact lifecycle link reachable (audit 24 Sep 2026: 13 + 4 + lifecycle links rendered)
- [ ] 🟡 Homepage search, meaningful news and a compliant free market/commentary panel fit the reference initial viewport; source/delay labels legible
  - **To do:** The homepage passes an offline 1366×768 first-fold check (compact hero; H02, H03 and H04 visible). Confirm on the live server with real feeds, and confirm NewsData stays within its daily budget (13.1).
- [x] ✅ No Projects, Experience, Case Studies, history counters or project-client galleries anywhere (audit 24 Sep 2026: none rendered; routes and collection gone)
- [x] ✅ Four domain narratives, 29 capability descriptions, 13 industry narratives and contextual lifecycle modules mapped to the correct pages
- [x] ✅ The lifecycle page has five sections including Start a Project, without featured examples
- [ ] 🟡 External source cards, datasets, download files and tool actions are genuine, rights-cleared and tested; unavailable states work
  - **To do:** No destination validation, non-approved datasets, mock tool figures, broken publications.
- [ ] 🟡 Owned publications and external items cannot be confused; imported titles, types, authors and dates verified
  - **To do:** Dates and authors are unverified and several bodies are broken (Part 8).
- [ ] 🟡 Charts/tables/CSV agree with filter selections; source, unit, geography, period, version and licence visible
  - **To do:** There are no charts; datasets link to provider files.
- [ ] 🟡 Canonical URLs, item-level redirects, metadata, XML sitemap and real bilingual equivalents validated
  - **To do:** No canonical on about, data-portal, sources, tools, datasets, publications, contact or policy pages; the i-recs redirect lands on a 404; the hreflang tags are wrong.
- [ ] 🟡 Policy destinations, privacy/consent controls, form delivery, analytics and CMS handover complete
  - **To do:** No analytics anywhere, no email delivery, and the privacy/handover items are still open.
- [ ] 🔍 Sitemap infographic is editable, has no suggested URLs, preserves all six sections / four domains / thirteen industries / the lifecycle link
- [x] ✅ Knowledge Hub has exactly two searchable collections; no Learning or Authors public branch, no separate archive (public side confirmed; config residue remains — Part 8)
- [ ] 🟡 Keyword/topic search works in both collections; Global Intelligence continent/region/country filters reflect subject coverage and combine consistently
  - **To do:** Keyword search works in both, but Global Intelligence has only one "Geography" filter guessed from headline keywords (`'us'` matches the pronoun); no country or continent IDs (see 12.2).
- [ ] 🟡 All enabled APIs permit free public corporate use within documented allowances, with hard budgets and no paid fallback
  - **To do:** Gemini (not an approved provider) with no budget guard; budgets count cache hits; no OECD hourly cap.
- [ ] 🟡 Every full-reading/dataset button, contextual preview and AI source destination is verified open access; every dataset has an ungated free download
  - **To do:** `verified_open` is hard-coded and no link is ever checked (13.1).

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
