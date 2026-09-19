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

## Snapshot — where you are today

| Area | PDF pages | Status |
|---|---|---|
| 1. Sitemap & page inventory | 3–6 | 🟡 **redirects done**; 4 routes still to build (1.2, 1.3) |
| 2. Header, mega menu, footer | 7–8 | 🟡 menu links all present but hover-only; footer has 3 dead links |
| 3. Homepage | 9–15 | ✅ all 13 segments, fold verified at 753px; news needs Part 13 keys |
| 4. Domains & Industries overview | 16–20 | ✅ **complete** — copy verified, metadata added |
| 5. Four domain pages | 21–60 | 🟡 all 9 segments now render; feeds await Part 13 |
| 6. Thirteen industry pages | 61–138 | 🟡 all 13 complete; only the news/research feeds await Part 13 |
| 7. Project Development (lifecycle) | 139–151 | ✅ **complete** — 48/48 paragraphs verified, metadata added |
| 8. Knowledge Hub | 152–156 | 🟡 structure + filters done; true dates still need a human |
| 9. Data Portal | 157–161 | 🟡 index page only, 3 sub-routes missing |
| 10. Tools | 162–166 | 🟡 catalogue exists, detail template thin |
| 11. About | 167–170 | ✅ all 5 segments present |
| 12. Detail & utility templates | 171–208 | ❌ 6 of 10 templates missing |
| 13. API provider specs | 209–224 | 🟡 **13 of 17 connectors built**, 9 verified live; 4 blocked on keys/registration/provider |
| 14. Implementation & acceptance | 225–229 | 🟡 see the full checklist |

**Biggest risks right now** (details in each part):
1. ~~Two API keys are exposed to the browser~~ — `NEXT_PUBLIC_NEWS_API_KEY` is gone with newsapi.org. **`NEXT_PUBLIC_NOAA_TOKEN` is still client-side** (p. 226, 228). ⚠️ The old newsapi.org key was also hardcoded in `global-intelligence/page.tsx` and is in git history (commit `f9c4320`) — **it must be revoked at newsapi.org**; deleting the line does not un-publish it.
2. The footer links to three pages that do not exist — the spec calls this out by name (p. 8).
3. The homepage markets panel is a TradingView embed plus two YouTube live streams; the spec requires a free, corporate-display-licensed source and warns against heavy video embeds in the first fold (p. 13, 228).
4. No redirects are configured, so the retired `/services/*` and `/insights` URLs will 404 or duplicate content (p. 228).
5. The mega menu opens on CSS `:hover` / `:focus-within` only — no click activation, no Escape, no outside-click. This is acceptance-checklist item #1 (p. 7, 229).

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
- [x] ✅ `/tools/{tool-slug}`
- [x] ✅ `/contact`
- [x] ✅ `/search?q=` (page exists — see Part 12.8 for the AI behaviour gap)
- [ ] ❌ `/data-portal/datasets/{dataset-slug}` — **route does not exist**
- [ ] ❌ `/data-portal/dashboards/{dashboard-slug}` — **route does not exist** (spec says build only when a real dashboard exists)
- [ ] ❌ `/data-portal/sources` — **route does not exist, but the footer already links to it**
- [ ] 🔍 `/about/careers` — build only when real approved recruitment content exists (p. 4, 205)

### 1.3 Utility destinations outside primary nav (p. 4)

- [x] ✅ `/privacy`
- [x] ✅ `/terms`
- [ ] ❌ `/cookie-choices` — **footer links to it; page missing**
- [ ] ❌ `/accessibility` — **footer links to it; page missing**
- [x] ✅ 404 page — `src/app/(frontend)/not-found.tsx`
- [ ] ❌ Newsletter confirmation + unsubscribe states
- [ ] ❌ "Source unavailable" state pattern

### 1.4 Retire legacy routes (p. 4, 225, 228) — ✅ DONE

All redirects live in `next.config.ts`. **Every rule verified against the running server: HTTP 308, correct destination, destination returns 200, exactly 1 hop (no chains).**

> Next.js sends **308**, not 301, for `permanent: true`. 308 preserves the request method where 301 lets browsers turn a POST into a GET. Search engines treat it as equally permanent, so this satisfies "permanent closest-equivalent redirect".

- [x] ✅ `/services` → `/domains-and-industries`
- [x] ✅ `/services/climate-change` → `/domains/climate-action-carbon-management`
- [x] ✅ `/services/energy` → `/domains/energy-systems-transition`
- [x] ✅ `/services/environment-esg` → `/domains/sustainable-business-esg-finance` — **decided from the retired page's own content**: its sections were ESG readiness, GRI/SASB frameworks, materiality assessment and ESG reporting, with no environmental or nature content. Despite the slug, it is an ESG page.
- [x] ✅ `/services/business-solutions` → `/domains/sustainable-business-esg-finance`
- [x] ✅ `/insights` → `/knowledge-hub`
- [x] ✅ `/insights/{slug}` mapped **article by article** — see below
- [x] ✅ `/projects` → `/domains-and-industries`, route deleted
- [x] ✅ `/team` → `/about`, route deleted
- [x] ✅ `/faq` and `/country-profiles/{code}` routes deleted (your call: app is not live, so no redirect needed). The 4 FAQ records remain in the CMS.
- [x] ✅ No redirect chains, and nothing redirects to the homepage
- [x] ✅ Internal links updated (p. 228 requires this, not just the redirects)
- [ ] ❌ Remove `Projects` collection from `payload.config.ts` (p. 226) — **deliberately not done**: your call was "delete routes, keep collections", so no Supabase tables were dropped. Both collections hold 0 records, so this stays a safe one-line change whenever you want it.

#### Article-level `/insights/{slug}` map

Matched by comparing each insight's title against all 24 publications. 5 of 10 have a real equivalent:

| Retired insight | Destination |
|---|---|
| `ghg-emissions-the-burden-on-our-planet` | same slug in Publications |
| `driving-climate-action-through-renewable-energy-finance` | `…-insights-from-an-expert` |
| `i-recs-a-catalyst-for-renewable-energy-investment-in-qatar` | `irecs-a-catalyst-…` |
| `smoking-and-climate-change` | `the-hidden-link-between-cigarette-smoking-…` |
| `artisanal-gold-mining-environmental-impacts-of-mercury-use` | `environmental-impacts-of-mercury-use-in-artisanal-gold-mining-…` |

The other 5 (`sudan-s-energy-balance-2020`, `breathing-vs-burning-…`, `climate-forcers-…`, `climate-change-and-war-…`, `weathering-the-storm-…`) have **no publication equivalent**. They currently go to `/knowledge-hub` — the closest equivalent, and explicitly not the homepage.

- [ ] ❌ **Part 8 should migrate those 5 into Publications**, then give each its own rule so nobody lands on a list page.

#### Files deleted (all committed, so `git checkout HEAD -- <path>` restores any)

`services/` (5 pages), `insights/` (2), `projects/`, `team/`, `faq/`, `country-profiles/`, and `components/home/InsightsTeaser.tsx`.

`InsightsTeaser` was the duplicate first-party article surface on the homepage — it read the `insights` collection while `KnowledgeTeaser` already reads `publications`. p. 225 calls for **one** canonical library, so it went with the routes.

- [x] ✅ Fixed a dangling anchor this exposed: the Hero's scroll-down button pointed at `#insights-teaser`, which no longer existed. Now `#news-slider`.
- [x] ✅ Updated `src/app/(frontend)/page.test.tsx`, which was **already stale** — it asserted `impact-stats` and `global-network` render on the homepage, but both were removed in an earlier commit. Added a test for p. 229 ("no Projects, Experience or Case Studies anywhere").

> ⚠️ **The test suite cannot run in this environment.** `npx vitest run` fails at startup with `Cannot find native binding` / `Cannot find module '@rolldown/binding-wasm32-wasi'`. This is a broken optional dependency, not a test failure, and it predates these changes. Fix with `rm -rf node_modules package-lock.json && npm i`. The updated test is therefore **written but unverified**.

### 1.5 Scope rules (p. 4)

- [ ] ❌ Do **not** create a standalone page per capability. Capabilities stay as anchored H2/H3 sections inside the parent domain page.
- [ ] ❌ Give every capability heading a stable, heading-derived anchor slug (p. 227)

---

## PART 2 — Shared navigation, mega menu, footer (PDF pp. 7–8)

### 2.1 Header (p. 7)

- [x] ✅ Sticky header, logo left, primary links centre, language + search + Contact right — `src/components/Header.tsx`
- [x] ✅ Wide mega menu under the header for Domains and Industries
- [x] ✅ All 4 domains and all 13 industries directly reachable from the menu
- [x] ✅ Exact canonical lifecycle link "Project Development and Lifecycle Support" in the menu
- [x] ✅ Language selection (EN / AR toggle)
- [x] ✅ Search access, with an Escape key handler
- [ ] ❌ **Mega menu opens on hover only** — `public/assets/css/style.css:386` and `src/app/(frontend)/style.css:411` use `.nav-item:hover .mega, .nav-item:focus-within .mega`. The spec (p. 7) requires click *and* keyboard activation, not hover alone. `:focus-within` gives tab-through access, so this is partial, not absent.
- [ ] ❌ **Escape does not close the mega menu** — the Escape handler in `Header.tsx` only closes the search overlay
- [ ] ❌ **Outside-click does not close the mega menu** — same: search overlay only
- [ ] ❌ Visible focus ring following the visual reading order through the menu
- [ ] ❌ `aria-expanded` / `aria-controls` on the mega menu trigger — the trigger is a plain `<Link>`, not a button
- [ ] 🟡 Mobile: same groups as labelled expandable sections (mobile nav exists — confirm all 13 industries survive)
- [ ] ❌ Delete the dead duplicate `src/components/layout/Header.tsx` (61 lines, only links `/` and `/knowledge-hub`, not used by the layout)

### 2.2 Segment-internal placement rules (p. 7–8)

- [ ] ❌ Heading top-left, narrative below, main action below the narrative — audit every segment
- [ ] ❌ Two-column capability rows: matching top alignment, natural wrapping
- [ ] ❌ Domain/industry intro actions sit below the opening narrative — **never** a floating enquiry button
- [ ] 🟡 AI input full width, submit at right, suggestion chips immediately below (input exists; chips missing)
- [ ] ❌ News cards: headline + permitted teaser above the source/date/original-link row
- [ ] ❌ Market panel: instrument rows above a short sourced commentary item
- [ ] ❌ Dataset views: filters above the chart; source/unit/period below it; download & citation beneath the visual
- [ ] 🟡 Tool cards: purpose first, access button bottom-left

### 2.3 Footer (p. 8)

- [x] ✅ Six navigation groups repeated with concise links — `src/components/Footer.tsx`
- [x] ✅ `info@enerqa.co.uk`, Contact link
- [ ] ❌ Newsletter access — `SubscribeForm.tsx` exists but is **not** rendered in `src/components/Footer.tsx`
- [ ] ❌ Data-source attribution block
- [ ] ❌ **Fix 3 dead footer links**: `/accessibility`, `/cookie-choices`, `/data-portal/sources` (p. 8 explicitly forbids labels that lead nowhere)
- [x] ✅ No project logos, experience counters or portfolio teaser in the footer
- [ ] ❌ Breadcrumbs identifying current section and parent page
- [ ] ❌ Language switching keeps the equivalent page, or explains availability — never silently returns to the homepage
- [ ] ❌ Delete the dead duplicate `src/components/layout/Footer.tsx`

---

## PART 3 — Homepage (PDF pp. 9–15) — ✅ DONE

All 13 segments H01–H13 now render, in the order the spec lists them. **First fold measured in a real browser at 1366×768: the whole composition ends at 753px, inside the 768px fold.**

### 3.1 First fold (pp. 9–13, 225)

- [x] ✅ H01 — "Project Development for a Sustainable Future" is now the actual `<h1>`. It had been demoted to an eyebrow while a rotating `TypeAnimation` held the h1.
- [x] ✅ **Removed the rotating hero** (p. 225) and the `100vh` height. The hero keeps its video backdrop, glass search pill and chip styling, so the page still looks like itself.
- [x] ✅ H02 — one input, spec placeholder, submit button, and a loading state (`Searching…`, plus an `aria-live` announcement)
- [x] ✅ H02 suggestion chips — the exact three from p. 13. They now **run the search**; before, they navigated to `/knowledge-hub` instead.
- [x] ✅ H03 Global News — lead story + two shorter stories, inside the fold
- [x] ✅ H03 card anatomy — headline above a source / date / original-link row (p. 7)
- [x] ✅ H03 filters — All | Climate | Energy | Environment and Nature | Business and Finance
- [x] ✅ H04 Major Markets — sourced commentary panel
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

- [x] ✅ H05 "Explore Our Domains" — was headed "Action Pillars" with off-spec copy
- [x] ✅ **H06 "Project Development and Lifecycle Support" — added (was missing entirely).** This closes the last of the six inbound links p. 145 requires to the canonical lifecycle page.
- [x] ✅ **H07 "Industries We Work In" — added (was missing entirely).** All 13 industries, equal-status links (p. 20).
- [x] ✅ H08 "Enerqa Publication" — was "Research & Publications"
- [x] ✅ H09 "Explore the Data Portal" — **one compact card**, as p. 15 demands
- [x] ✅ H10 "Enerqa Tools" — was "PROPRIETARY Tools"
- [x] ✅ H11 "About Enerqa" — was an eyebrow above an `<h3>`, which skipped a heading level (p. 227); now the section's `<h2>`
- [x] ✅ H12 "Stay Informed" / H13 "Discuss Your Project"

### Two pieces of fabricated content found and removed

Both would have published invented company work — p. 226 ("a temporary failed call does not become fabricated content") and p. 229 ("never fabricate company work").

1. **`LatestNews`** shipped a hardcoded fallback that fired whenever the news API failed, inventing announcements such as *"enerQA announces strategic partnership with MENA renewable initiative"* with Unsplash stock photos and links to the retired `/insights`. Since its provider (newsapi.org) is not licensed for production use, this fallback was likely to be what visitors actually saw.
2. **`KnowledgeTeaser`** had `defaultPublications` — invented publications with fabricated titles, **future dates** ("June 2026", "November 2025"), fake PDF paths and a `Case Study` type that p. 229 bans. Now returns an empty list instead.

### Deleted

`LiveFeeds` (TradingView + 2 YouTube embeds), `LatestNews`, `NewsSlider`, `ImpactStats`, `GlobalNetwork`, and `SustainabilityData` (494 lines that fetched **eight live APIs on every homepage render** — a full dashboard where p. 15 allows one card).

**Live API calls on first paint: 9 → 1** (a single cached GDELT request).

### Also fixed

- [x] ✅ `KnowledgeTeaser` now excludes the non-article records from Part 8
- [x] ✅ Homepage `metadata` with canonical
- [x] ✅ A dead `/tools/esg-readiness` link in the Tools section and a dead `/data-portal/sources` link in the H09 card — both pointed at routes that do not exist (p. 4 forbids this)
- [x] ✅ **Every internal link on the homepage resolves**, except the three known footer links tracked in Part 2.3 (`/accessibility`, `/cookie-choices`, `/data-portal/sources`)
- [x] ✅ `page.test.tsx` updated for the new section list

### Still open

- [x] ✅ **NewsData.io primary + GDELT supplementary** (p. 13), plus EIA and EEA RSS for licensed summary text
- [ ] ❌ H04 instrument rows. p. 13 allows a numerical feed only if it is free for public corporate display of those exact instruments; no such feed is enabled, so the panel carries commentary only
- [x] ✅ H03 "permitted short description" per card — supplied by NewsData.io and the two RSS feeds; GDELT items correctly show a headline only
- [ ] 🔍 The eight unused connectors in `src/lib/api/` were left in place: `nasa-power`, `openaq-v3` and `world-bank-indicators` are on the approved provider list and Part 13 needs them
- [ ] ❌ `TransitionPriorities` auto-rotates every 4s with no `prefers-reduced-motion` guard

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

### 5.2 Climate Action & Carbon Management (pp. 21–30) — `/domains/climate-action-carbon-management`

- [x] ✅ 7 capability sections seeded (C02–C08)
- [x] ✅ C01 narrative + all 7 capability narratives verified **word-for-word** against pp. 26–28
- [x] ✅ **Fixed the domain title**: was `Climate Action and Carbon Management` (the segment-ID label); p. 26 gives the website heading as `Climate Action & Carbon Management`
- [x] ✅ CP section: "Policy and Official Updates" + ReliefWeb / UNFCCC / IPCC source line seeded
- [ ] ❌ CP news query baskets: `"climate change" OR "climate policy" OR "NDC"`; `"carbon markets" OR "carbon credits" OR "decarbonisation"` (p. 30) — needs the Part 13 connectors
- [ ] ❌ CD data sources wired (p. 29)
- [x] ✅ CT tool link seeded: ESG Readiness Tool → `/tools/esg-readiness` (p. 29)

### 5.3 Energy Systems & Transition (pp. 31–39) — `/domains/energy-systems-transition`

- [x] ✅ 6 capability sections seeded (E02–E07)
- [x] ✅ E01 + all 6 capability narratives verified **word-for-word** against pp. 35–37
- [x] ✅ EP "Official Energy Analysis and Research" section added, with the EIA RSS / OSTI source line
- [ ] ❌ ED data sources: `eia-open-data` (generation mix, demand, price series), `nasa-power` (solar resource), `world-bank-indicators` (electricity access) — p. 39
- [x] ✅ ET tool links seeded: easySOLAR → `/tools/easysolar`, GreenScale Pro → `/tools/greenscale-pro` (p. 38)

### 5.4 Environment, Nature & Circularity (pp. 40–50) — `/domains/environment-nature-circularity`

- [x] ✅ 8 capability sections seeded (N02–N09)
- [x] ✅ N01 + all 8 capability narratives verified **word-for-word** against pp. 45–47
- [x] ✅ NP "Environment and Nature Updates" section added, with the EEA RSS / GBIF literature source line
- [ ] ❌ ND data sources (p. 48)
- [x] ✅ NT tool links seeded: GreenScale Pro, ESG Readiness Tool (p. 49)

### 5.5 Sustainable Business, ESG & Finance (pp. 51–60) — `/domains/sustainable-business-esg-finance`

- [x] ✅ 8 capability sections seeded (B02–B09)
- [x] ✅ B01 + all 8 capability narratives verified **word-for-word** against pp. 56–58
- [x] ✅ BP "Corporate Disclosures and Finance Updates" section added, with the SEC EDGAR source line
- [ ] ❌ BD data sources (p. 59)
- [x] ✅ BT tool links seeded: ESG Readiness Tool, GreenScale Pro (p. 59)

> Acceptance (p. 229) requires **29 capability descriptions** across the four domains. Seeded count: 7 + 6 + 8 + 8 = **29** ✅ — and **all 29 narratives and all 4 hero narratives were verified word-for-word against the PDF**. Zero content drift.

### 5.6 Database — done

- [x] ✅ Schema pushed to the remote Supabase database (no `migrations/` folder, so Payload's postgres adapter pushes on init)
- [x] ✅ Seed run: `npx tsx --env-file=.env scripts/seed-domains.ts` — all four domains updated
- [x] ✅ Verified in the database: 4 domains, 29 capabilities intact (7/6/8/8), 4 distinct policy headings, 4 meta descriptions, Climate title corrected
- [x] ✅ Verified rendering on the running dev server: all four pages HTTP 200, one H1 each, heading order matches the spec, no `Coming Soon` and no `var(--secondary)` leaks

> **`--env-file=.env` is required.** `src/payload.config.ts` does not import `dotenv`, so a bare `npx tsx scripts/seed-domains.ts` silently falls back to `postgres://127.0.0.1:5432/enerqa` and writes to the wrong place (or fails). Worth adding `dotenv/config` to the config file, or an `npm run seed:domains` script that carries the flag.

### 5.7 Relevant Enerqa Tools — blocked on real tool records

The `tools` collection contains only **`water-conservation-toolkit`, `global-temperature-map`, `carbon-calculator`**. None of the three tools the handoff names exist:

| Handoff tool (pp. 29, 38, 49, 59) | Route | In CMS? |
|---|---|---|
| ESG Readiness Tool | `/tools/esg-readiness` | ❌ |
| easySOLAR | `/tools/easysolar` | ❌ |
| GreenScale Pro | `/tools/greenscale-pro` | ❌ |

`/tools/[slug]` calls `notFound()` for an unknown slug, so publishing those links would have put **7 dead links across the four live domain pages** — forbidden by p. 4 (no empty or fake links) and p. 29 (do not label a tool public before it is tested).

The seed script now checks the `tools` collection and publishes only links that resolve. The Relevant Enerqa Tools section stays hidden on all four domains until the records exist.

- [ ] 🔍 Create the three tool records (see Part 10 — their names and versions still need validating against p. 166)
- [ ] Re-run `npx tsx --env-file=.env scripts/seed-domains.ts` — the links then publish themselves, no code change needed
- [ ] 🔍 Set **Relevant Industries** for each domain in the admin UI (handoff never enumerates the mapping, so it is a content decision)

---

## PART 6 — The thirteen industry pages (PDF pp. 61–138)

**One reusable template**: `src/app/(frontend)/industries/[slug]/page.tsx`. Each industry has two segments: `I{nn}01` (page intro) and `I{nn}02` (Relevant Domains and Work Areas), plus `I{nn}R` (Research and Official Updates).

### 6.1 Template gaps — fix once, fixes all thirteen (p. 61)

- [x] ✅ "Project Development and Lifecycle Support"
- [x] ✅ "Industry News"
- [x] ✅ "Research and Official Updates" (I{nn}R)
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
- [ ] ❌ `getIndustryResearch()` calls OpenAlex directly per page, not through the shared server-side cache required by p. 226
- [ ] ❌ Per-industry news query baskets and research themes (each industry's config page)
- [ ] ❌ Real dataset previews wired to each industry's recommended providers

### 6.2 Per-industry content verification

**All 13 verified against the PDF and confirmed live.** Checks run: 13/13 page titles match the spec "Website heading"; 26/26 hero paragraphs and 13/13 lifecycle narratives match **word-for-word**; all 52 offering links match the PDF mapping and **every anchor was confirmed to resolve to a real section on the rendered target domain page**; all 13 pages return HTTP 200 with exactly one H1 and no undefined-variable leaks.

Still needing a human: each industry's news query baskets, research themes and source priorities (captured in the PDF, consumed by Part 13).

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
- [x] ✅ **Full narrative verified word-for-word against pp. 145–151: 48/48 paragraphs match exactly.** No content drift.
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
| **Homepage** | ❌ **missing** |

- [ ] ❌ **The homepage has no link to `/project-development`.** That is segment H06, already tracked in Part 3.2. Five of the six required inbound links are in place; this is the sixth.

#### Noted while verifying (Part 2 scope, not fixed here)

- [ ] ❌ The header mega-menu column titles ("Domains", "Industries") are `<h3>` elements, so **every page in the site emits three `<h3>`s before its own `<h1>`**. That breaks the "coherent H2/H3 hierarchy" rule in p. 227. They should be a non-heading element, or `<h2>` inside a labelled nav landmark.

---

## PART 8 — Knowledge Hub (PDF pp. 152–156)

Route `/knowledge-hub`. Segments K01–K06. **Exactly two collections**: Enerqa Publication and Global Intelligence.

- [x] ✅ K01 "Knowledge Hub" — copy matches p. 155, unique title + description + canonical added
- [x] ✅ K02 "Choose a Collection" — two entry points, sticky, present on both collections
- [x] ✅ K03 "Find a Publication" — **filters rebuilt, they now actually work**
- [x] ✅ K04 "Enerqa Publication" — reads `publications`, non-articles excluded
- [x] ✅ K05 "Global Intelligence" — separate route
- [x] ✅ K06 "Stay Informed" — newsletter + Discuss Your Project
- [x] ✅ Author metadata **recovered for 21 of 25 articles** and a working Year filter (2024 archive stays a filter value, not a third collection)
- [x] ✅ Removed the public **Learning** branch — `LearningMaterialsList.tsx` deleted (it was already orphaned; nothing imported it)
- [x] ✅ Removed the orphaned `GlossarySection.tsx`
- [x] ✅ No public **Authors** branch — authors are byline text + a search facet only, exactly as p. 225 requires
- [x] ✅ No separate archive destination
- [x] ✅ Merged `Insights` into `Publications` — one canonical library
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
| Domain / Industry | ❌ needs those tags on Publications first |

Within a facet values are OR'd, across facets AND'd. Plus a live result count ("Showing 25 of 25 publications", `aria-live="polite"`), removable filter chips, and Clear All — all required by p. 155.

#### Publication import clean-up (p. 225)

- [x] ✅ **4 non-articles found and unpublished**: `authors-biographies` (a biography), plus `frameworks-and-methodologies`, `environment-and-society` and `energy-technology-and-finance` (category separators). All four had been imported as `type: Article`. They keep their records via a new `recordKind` field but no longer publish — nothing was deleted.
- [x] ✅ **Authors recovered from the source archive PDF**, which carries a `By:` line per article. 21 of 25 articles now have a byline.
- [x] ✅ **7 orphan insights migrated** into Publications, keeping their slugs, so `/insights/{slug}` → `/knowledge-hub/{same-slug}` and every retired article lands on its own page rather than a list. The Part 1.4 catch-all was updated accordingly.

> **A mistake worth recording.** The first migration run used fuzzy title matching to detect duplicates and created 2 duplicate publications — "I-RECs: A Catalyst for…" vs "IRECs - A catalyst for…" are the same article but share no long common substring. Both duplicates were deleted, and the script now uses an explicit `ALREADY_MAPPED` list kept in step with `INSIGHT_SLUG_MAP` in `next.config.ts`. Re-running now migrates 0 — verified idempotent.

#### ❌ Still needs a human: the dates

**All 24 imported publications carry the same date, `2024-12-01`** — exactly the "one artificial date for the whole archive" that p. 225 forbids. The archive PDF has **no per-article dates** (it only says the work spans December 2023 – December 2024), so they cannot be recovered from the sources in this repo.

Rather than leave a placeholder passing as fact, every card now shows **"(date unverified)"** next to its date, driven by a new `dateVerified` checkbox. Ticking it hides the marker.

- [ ] ❌ Recover each publication's real date from its original source and tick `dateVerified`
- [ ] 🔍 **Approve the author bylines.** The source PDF spells several names inconsistently: `Dr. Islam M. Awad` / `Dr. Isalm M. Awad` (typo), and `Reem Almlik` / `Reem Elmalik` / `Reem Almalik`. p. 225 requires an *approved* byline identity, so these were imported verbatim rather than silently normalised. They currently appear as separate Author filter options.
- [ ] ❌ 4 articles have no byline in the archive PDF: `the-imperative-for-esg-readiness-tools-…`, `sudan-s-energy-balance-2020`, and 2 others
- [ ] ❌ Tag publications with Topic / Domain / Industry to enable the remaining K03 filters
- [ ] ❌ Drop the now-empty `Insights` collection and the `learningMaterialsEyebrow` / `glossaryEyebrow` leftovers in `KnowledgeHubConfig`
- [ ] ❌ Owned vs external visual distinction (p. 229) — needs the Global Intelligence card design in Part 12.2

> Note: "Case Study:" still appears 3× on `/knowledge-hub`, inside one article's own body text. That is an author's prose, not a Case Study section, so it was left alone — p. 229 bans the surface, not the phrase.

---

## PART 9 — Data Portal (PDF pp. 157–161)

Route `/data-portal`. Segments D01–D06.

- [x] ✅ D01 "Data Portal" page exists, reads the `datasets` collection
- [ ] 🟡 D02 "Find Data" — filters
- [ ] 🟡 D03 "Explore a Dataset"
- [ ] 🟡 D04 "Dataset Catalogue"
- [ ] ❌ D05 "Dashboards and Data Stories"
- [ ] ❌ D06 "Sources and Methodology" link block
- [ ] ❌ Broaden from "Climate Data Portal" to **Data Portal across all four domains** (p. 225)
- [ ] ❌ Build the candidate dataset list from p. 161 (provider + initial view per dataset)
- [ ] ❌ Extend the `Datasets` collection — it currently has only `title`, `description`, `file`, `apiEndpoint`, `topic`, `date`. The spec (p. 225–226) requires: provider, series/dataset identifier, version/release, licence + licence URL, original unit, geographic level, observation period, retrieval time, method, `datasetDownloadUrl`, `accessStatus`, `accessCheckedAt`, `accessEvidence`, corporate-reuse flag, redistribution flag, attribution
- [ ] ❌ Every published dataset must have an **ungated free anonymous download** (p. 226, 229)

---

## PART 10 — Tools (PDF pp. 162–166)

Route `/tools`. Segments T01, T03, T04, T05.

- [x] ✅ T01 "Enerqa Tools" catalogue page
- [ ] 🟡 T03 "Other Enerqa Tools"
- [ ] ❌ T04 "Using the Tools"
- [ ] ❌ T05 "Request Tool Access"
- [ ] 🔍 Validate names and versions for **GHG365 / GHG Emissions Calculator, MRV Tool, ESIA Risk Assessment Tool, Green Project Scoring Tool** (p. 166)
- [ ] 🔍 Reconcile the sitemap's three flagship slugs — `/tools/esg-readiness`, `/tools/easysolar`, `/tools/greenscale-pro` (p. 3) — with the tool names on p. 166
- [ ] ❌ Remove placeholder / non-functional downloads (p. 225)
- [ ] ❌ Extend the `Tools` collection — it currently has `slug`, `category`, `type`, `title`, `desc`, `image`, `link`, `iframeUrl`, `file`, `industries`. The spec (p. 225) requires: purpose, inputs, outputs, method, version, access, privacy

---

## PART 11 — About (PDF pp. 167–170)

Route `/about`. Segments A01–A05.

- [x] ✅ A01 "About Enerqa"
- [x] ✅ A02 "Our Approach"
- [x] ✅ A03 "Our Domains"
- [x] ✅ A04 "People and Organisation"
- [x] ✅ A05 "Connect with Enerqa"
- [ ] 🔍 Team information inside About — **only when approved** (p. 4)
- [ ] 🔍 Additional addresses, regional presence and phone numbers — **only after company approval** (p. 170)
- [x] ✅ No external API needed on this page (p. 170)

---

## PART 12 — Detail and utility templates (PDF pp. 171–208)

### 12.1 Enerqa publication detail (pp. 171–174) — `/knowledge-hub/{publication-slug}`

- [x] ✅ Route exists
- [x] ✅ PUBL01 "Publication Header" and the remaining PUBL segments (p. 174)
- [ ] ❌ Verified title, type, author and actual date on every imported record (p. 229)

### 12.2 Global Intelligence (pp. 175–179) — `/knowledge-hub/global-intelligence`

- [x] ✅ Route exists (215 lines)
- [ ] 🟡 X01 "Global Intelligence" — page H1 currently reads "Knowledge Hub"; should be its own H1
- [ ] ❌ X02 "Search Global Intelligence"
- [ ] 🟡 X03 "External Content Cards"
- [ ] ❌ X04 "Sources and Context"
- [ ] ❌ Continent / region / country coverage filters, combining consistently with domain, industry, source, type, language and date (p. 225, 229)
- [ ] ❌ Geography = the **subject and locations covered**, never the publisher's HQ or a researcher's affiliation (p. 179, 226)

### 12.3 Dataset detail (pp. 180–183) — `/data-portal/datasets/{dataset-slug}`

- [ ] ❌ **Route does not exist.** Build all six segments:
- [ ] ❌ DS01 "Dataset Summary" — what is measured, by whom, where, for what period
- [ ] ❌ DS02 "Explore the Data"
- [ ] ❌ DS03 "Chart, Table and Map"
- [ ] ❌ DS04 "Download and Cite"
- [ ] ❌ DS05 "Sources and Methodology"
- [ ] ❌ DS06 "Related Data and Domains"

### 12.4 Dashboard template (pp. 184–187) — `/data-portal/dashboards/{dashboard-slug}`

- [ ] ❌ **Route does not exist.** Publish only when a real dashboard is built (p. 3).
- [ ] ❌ DB01 "Dashboard Overview" / DB02 "Dashboard Controls" / DB03 "Primary Views" / DB04 "Interpretation" / DB05 "Underlying Sources"

### 12.5 Tool detail template (pp. 188–191) — `/tools/{tool-slug}`

- [x] ✅ Route exists
- [x] ✅ TD01 "Tool Overview" — validated name, purpose, current availability; **"Request Access" is the default action** until a tool is genuinely self-serve
- [x] ✅ TD02 "Inputs and Outputs"
- [x] ✅ TD03 "Methodology and Limits"
- [x] ✅ TD04 "Access the Tool"
- [x] ✅ TD05 "Guidance and Support"

### 12.6 Sources and Methodology (pp. 192–195) — `/data-portal/sources`

- [ ] ❌ **Route does not exist, and the footer already links to it.**
- [ ] ❌ S01 "Sources and Methodology" / S02 "Source Directory" / S03 "Attribution and Reuse" / S04 "Understanding the Data"
- [ ] ❌ Reachable from **every** numerical view (p. 4)

### 12.7 Contact and project enquiry (pp. 196–198) — `/contact`

- [x] ✅ F01 "Contact Enerqa"
- [x] ✅ F02 "Tell Us About Your Enquiry" (rendered as "Get in Touch" / "Send an Enquiry" — verify against p. 198)
- [ ] 🟡 F03 "Send Your Enquiry"
- [ ] ❌ F04 "Submission States" — success, validation error, delivery error
- [ ] ❌ Server-side validation (p. 228)
- [ ] ❌ Spam protection (p. 228)
- [ ] ❌ Marketing consent kept **optional and separate** from the enquiry (p. 228)

### 12.8 AI search and answer page (pp. 199–202) — `/search?q={query}`

- [x] ✅ Route exists with keyword search over CMS collections
- [ ] ❌ AI01 "Ask and Explore" — keep the user's query editable and preserved
- [ ] ❌ AI02 "Answer and Sources" — a source-led generated answer
- [ ] ❌ AI03 "Relevant Enerqa Content"
- [ ] ❌ AI04 "Other Sources and States"
- [ ] ❌ **Fix the hardcoded `SITE_INDEX`** in `src/app/(frontend)/search/page.tsx` — it still points at the retired `/services`, `/projects`, `/team`, `/insights`
- [ ] ❌ Index canonical first-party domain/capability, industry, lifecycle, publication, dataset metadata and tool pages (p. 227)
- [ ] ❌ Keep drafts, confidential briefs, internal CMS records and restricted tool inputs out of the public index (p. 227)
- [ ] ❌ Do not force an Enerqa result into unrelated answers (p. 13, 227)
- [ ] ❌ Never fabricate company work, credentials or data; cite only what was actually retrieved (p. 227)
- [ ] ❌ Inference must use a **free corporate-use service within its free quota**, or a self-hosted appropriately licensed model — no paid tier (p. 13)
- [ ] ❌ Test: general non-Enerqa queries, project questions, ambiguous terms, **Arabic queries**, conflicting sources, retrieval failures (p. 227)
- [ ] ❌ `noindex` on search results and low-value filter combinations (p. 227)

### 12.9 Conditional careers template (pp. 203–205) — `/about/careers`

- [ ] 🔍 Q01 "Purpose and Scope" / Q02 "Main Content" / Q03 "Next Action"
- [ ] 🔍 Publish **only** with actual approved recruitment content; it is subordinate to `/about`

### 12.10 Policy, accessibility and error pages (pp. 206–208)

- [ ] ❌ U01 "Utility Page Titles" — four distinct destinations: Privacy Notice, Terms of Use, Cookie Choices, Accessibility Statement
- [ ] 🔍 U02 "Approved Text and Status" — use real approved legal text, not placeholder
- [ ] ❌ U03 "Actions"
- [x] ✅ 404 page exists
- [ ] ❌ 404 directs visitors to search and the nearest relevant section (p. 4)
- [ ] ❌ No fake utility destinations, and no Contact page disguised as legal or accessibility information (p. 8, 225)

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

**Verified live (9):** Climate TRACE, World Bank, OECD municipal waste, NASA POWER, GBIF Occurrence, OpenAQ v3, OpenAlex, DOAJ, GBIF Literature, SEC EDGAR.

**Blocked, with the reason recorded in the connector (4):**

| Provider | Blocker | To unblock |
|---|---|---|
| EIA Open Data | free key not registered | register, set `EIA_API_KEY` |
| ReliefWeb | appname not registered (403) | register, set `RELIEFWEB_APPNAME`, flip `enabled` |
| OSTI | host unreachable from here | re-test from another network |
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

- [x] ✅ Server-side connectors behind a **shared cache** — done for news; still outstanding for the numerical connectors
- [x] ✅ Store original IDs and URLs, source timestamps, retrieval time, provider, rights status, provenance — the `Provenance` type in `core/types.ts`, filled by every connector
- [x] ✅ Reuse filtered records across home, industries and Global Intelligence — one pool, no per-page upstream queries. Domain pages still to wire up
- [ ] 🟡 **`NEXT_PUBLIC_NOAA_TOKEN` is still client-side.** `NEXT_PUBLIC_NEWS_API_KEY` is done — newsapi.org is gone from the codebase and `NEWSDATA_API_KEY` is read only inside Server Components (verified: the key does not appear in any rendered HTML). Spec: p. 226, p. 228
- [x] ✅ URL deduplication, relevance filtering and publication-date validation before display (news). DOI dedup and geography tags belong to the research connectors, still to build
- [x] ✅ Respect the NewsData query cap using **separate topic baskets** — four queries, each well under the 100-character limit
- [x] 🟡 Per-provider request budgets and 429 handling done in `core/fetch.ts`. **Stale-cache notices still to build** — `ConnectorSuccess.stale` exists but nothing sets it yet
- [ ] ❌ Loading states reserve card/chart dimensions (no layout shift) — belongs with the Data Portal UI, Part 9
- [x] ✅ Empty results say "No relevant updates are available"; every provider returns `[]` on failure rather than throwing or inventing content
- [x] ✅ `accessStatus` / `accessCheckedAt` / `accessEvidence` recorded; `publishableOnly()` enforces the `verified_open` gate, and an unstated status defaults to `unknown` so a connector that forgets fails closed
- [x] ✅ A provider going chargeable disables the connector pending review — `enabled: false` in `core/registry.ts` takes it off every page at once (ReliefWeb is currently off this way)

### 13.2 News and research connectors

- [x] ✅ **NewsData.io** (`newsdata`) — p. 210 — delayed free feed, four topic baskets, 48 credits/day
- [x] ✅ **GDELT** (`gdelt`) — p. 211 — legacy news coverage, `domainis:` allowlisting
- [x] ✅ **OpenAlex** (`openalex`) — p. 212 — verified live, `filter=is_oa:true` enforced, repository copy preferred over the DOI resolver
- [x] 🟡 **DOAJ** (`doaj`) — p. 213 — verified live. ⚠️ **Launch gate**: p. 213 records that the quota could not be reverified, so it must be confirmed before go-live and never advertised as unlimited
- [ ] 🟡 **ReliefWeb** (`reliefweb`) — pp. 213–214 — connector built but **disabled in the registry**. An unregistered appname returns HTTP 403; register at https://reliefweb.int/help/api, set `RELIEFWEB_APPNAME`, then flip `enabled` to true
- [x] ✅ **U.S. EIA Today in Energy RSS** (`eia_rss`) — p. 214 — keyless RSS, public domain, text only (no EIA photos or logo)
- [ ] 🟡 **DOE OSTI.GOV API v1** (`osti`) — p. 215 — connector built to the documented query, **not verified live**: osti.gov resolves but every TCP connection timed out from here. p. 215 records the same during the spec review. Confirm before launch
- [x] ✅ **EEA** (`eea_rss`) — pp. 215–216 — keyless RSS, CC-BY with attribution. Two live feeds; `/en/publications/rss.xml` returned 404 on 19 Sep 2026 and was left out rather than guessed at
- [x] ✅ **GBIF Literature** (`gbif-literature`) — pp. 216–217 — verified live, `openAccess=true` enforced and bare DOI resolvers rejected
- [x] ✅ **SEC EDGAR** (`sec-edgar`) — p. 217 — verified live. A curated issuer watchlist, not keyword ESG search, labelled "Corporate disclosure"

### 13.3 Numerical data connectors (pp. 218–224)

- [x] ✅ **Climate TRACE** (`climate-trace`) — p. 218 — verified live. p. 218 says to confirm v7: v7 serves `/definitions/*` but every emissions route 404s, so data comes from v6. GWP horizon is part of the unit, never implied
- [x] ✅ **World Bank Indicators API v2** (`world-bank-indicators`) — p. 219 — verified live. The old `worldBank.ts` actually called Climate Watch and **generated mock data** on failure; deleted, not patched
- [x] 🟡 **OECD SDMX** (`oecd-sdmx`) — p. 220 — municipal waste verified live. **Climate-related development finance is blocked**: its data route answers 403 from this origin, which p. 220 anticipates ("Some large CRS query parameters are restricted"). Base, dataflow, version, all 12 dimensions and the codelists are recorded in the connector
- [ ] 🟡 **U.S. EIA Open Data** (`eia-open-data`) — p. 221 — connector built, **needs a free key**. Register at https://www.eia.gov/opendata/register.php and set `EIA_API_KEY`. Without it the connector reports `not_configured` and shows nothing
- [x] ✅ **NASA POWER** (`nasa-power`) — p. 222 — rewritten and verified live. The old one ignored POWER's `-999` fill value, which charts as "-999 °C"
- [x] ✅ **GBIF Occurrence** (`gbif-occurrence`) — p. 223 — verified live. CC0/CC BY enforced twice, in the query and again on the response. The first unfiltered Qatar result was CC BY-NC, which p. 223 bars
- [x] ✅ **OpenAQ v3** (`openaq-v3`) — p. 224 — rewritten and verified live. Licence flags checked per source; 23 of 30 stations were excluded as unknown or non-commercial. The old one returned `generateMockOpenAQData()` when the key was missing

### 13.4 Existing connectors not in the spec

Decide: keep with a documented licence, or retire.

- [ ] 🔍 `src/lib/api/cckp.ts` (World Bank Climate Change Knowledge Portal)
- [ ] 🔍 `src/lib/api/noaa.ts`
- [ ] 🔍 `src/lib/api/osm.ts`
- [ ] 🔍 `src/lib/api/unOcha.ts`
- [ ] 🔍 `src/lib/api/unSdg.ts`

### 13.5 Data integrity rules (pp. 226–227)

- [x] ✅ Separate labels for observation period, source release date and Enerqa retrieval time — carried on every record and rendered by `sourceLabel()`
- [x] ✅ Accessible tabular equivalent built — `components/data/DataSeriesTable.tsx`, a real `<table>` with `scope`d headers, a caption and the provenance block. Charts themselves are Part 9
- [x] ✅ CSV downloads carry attribution, licence, methodology link, source release, retrieval time and transformation notes — `GET /api/data/[dataset]`, ungated as pp. 221/223 require
- [x] ✅ Never fill missing values with zero — `value: number | null` throughout, empty cells in CSV, em dash in tables, covered by tests
- [ ] ❌ Never silently mix annual and monthly observations, modelled estimates and national inventories, nominal and constant currency, or different CO2e GWP horizons
- [ ] 🟡 Failures return a typed reason and an honest message (`failureMessage()`), and no connector ever fabricates. **The stale-cache notice is still to build**

---

## PART 14 — Implementation and acceptance (PDF pp. 225–229)

### 14.1 CMS content model (pp. 225–226)

- [ ] ❌ **Domain** record: title, narrative, capability sections, domain tags, CTAs
- [ ] ❌ **Industry** record: title, narrative, related capability links, lifecycle module
- [ ] ❌ **Capability section** record: heading, slug, narrative, parent domain
- [ ] ❌ **Publication** record: title, body, author, actual date, type, file, tags, language
- [ ] ❌ **External item** record: provider, source/date/type, full-reading URL, covered geography, access evidence, rights — **this collection does not exist yet**
- [ ] ❌ **Dataset** record: see Part 9
- [ ] ❌ **Tool** record: see Part 10
- [ ] ❌ **Author metadata**: internal only — bylines and search filters, no public branch
- [ ] ❌ **Utility/form** record: approved page text, route, consent/state rules
- [ ] ❌ Remove Project / Case Study / Experience record types
- [ ] ❌ Taxonomy: domain, industry, capability, lifecycle stage, topic, covered country codes, region IDs, continent IDs, geographic scope, content type, first-party/external, source, author, date, language, access/status, data frequency/format
- [ ] ❌ Keep author affiliations and publisher locations **separate** from subject-coverage geography

### 14.2 SEO and canonical content (p. 227)

- [ ] ❌ Unique descriptive title + meta description on every substantive page
- [ ] ❌ Exactly one H1 and a coherent H2/H3 hierarchy per page
- [ ] ❌ Stable heading-derived anchor slugs for domain capabilities
- [ ] ❌ Consolidate first-party article duplicates item by item
- [ ] ❌ **XML sitemap** — no `sitemap.ts` or `robots.ts` exists in `src/app/`
- [ ] ❌ Organisation, article and breadcrumb structured data, from verified fields only
- [ ] ❌ No manufactured review ratings, FAQ claims or experience figures
- [ ] 🟡 Bilingual: Payload localisation is configured (`en`, `ar`) — still needs accurate Arabic translation, RTL layout, language metadata and reciprocal `hreflang` **only for real corresponding pages**

### 14.3 Accessibility, responsive, performance (p. 228)

- [ ] ❌ Semantic navigation and headings throughout
- [ ] ❌ Visible keyboard focus everywhere
- [ ] ❌ Labelled form controls and buttons
- [ ] ❌ Sufficient colour contrast
- [ ] ❌ Reduced-motion support — `framer-motion` animates `FadeIn`, `StaggerContainer`, `CountUpNumber` and `Accordion` with no `prefers-reduced-motion` guard
- [ ] ❌ Charts: accessible tables + non-colour-only labels
- [ ] ❌ Dialog/menu focus trapping and Escape behaviour by keyboard
- [ ] ❌ Long Arabic labels must not clip
- [ ] ❌ Reserve feed/widget dimensions to prevent layout shift
- [ ] ❌ Lazy-load below-fold charts and large external widgets
- [ ] ❌ Test at: typical laptop widths, mobile, slow network, blocked third-party scripts, provider timeout, long headlines, **125% zoom**

### 14.4 Forms, privacy, handover (p. 228)

- [ ] ❌ Server-side validation on enquiry + newsletter forms
- [ ] ❌ Spam protection
- [ ] ❌ Confirmation and delivery-error handling
- [ ] 🔍 Approved privacy text for the chosen processors, retention and data flows
- [ ] ❌ Handover pack: editable CMS templates, taxonomy guide, provider credentials + account owners, request budgets, connector/error logs, source-rights register, redirect list, analytics configuration, bilingual editing guidance, tested download/tool access

### 14.5 Launch acceptance checklist (p. 229)

- [ ] 🟡 Six primary menu sections and mega menu work by pointer, keyboard and mobile; all 13 industries + the exact lifecycle link reachable
- [ ] ❌ Homepage search, meaningful news and a compliant free market/commentary panel fit the reference initial viewport; source/delay labels legible
- [ ] 🟡 No Projects, Experience, Case Studies, history counters or project-client galleries anywhere (components removed from render; routes and collection still exist)
- [ ] 🟡 Four domain narratives, 29 capability descriptions, 13 industry narratives and contextual lifecycle modules mapped to the correct pages
- [x] ✅ The lifecycle page has five sections including Start a Project, without featured examples
- [ ] ❌ External source cards, datasets, download files and tool actions are genuine, rights-cleared and tested; unavailable states work
- [ ] ❌ Owned publications and external items cannot be confused; imported titles, types, authors and dates verified
- [ ] ❌ Charts/tables/CSV agree with filter selections; source, unit, geography, period, version and licence visible
- [ ] ❌ Canonical URLs, item-level redirects, metadata, XML sitemap and real bilingual equivalents validated
- [ ] ❌ Policy destinations, privacy/consent controls, form delivery, analytics and CMS handover complete
- [ ] 🔍 Sitemap infographic is editable, has no suggested URLs, preserves all six sections / four domains / thirteen industries / the lifecycle link
- [ ] ❌ Knowledge Hub has exactly two searchable collections; no Learning or Authors public branch, no separate archive
- [ ] ❌ Keyword/topic search works in both collections; Global Intelligence continent/region/country filters reflect subject coverage and combine consistently
- [ ] ❌ All enabled APIs permit free public corporate use within documented allowances, with hard budgets and no paid fallback
- [ ] ❌ Every full-reading/dataset button, contextual preview and AI source destination is verified open access; every dataset has an ungated free download

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
```
