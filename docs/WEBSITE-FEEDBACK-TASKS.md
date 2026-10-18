# Enerqa Website — Feedback Task Board

Created 15 October 2026 from [Website comments.md](<Website comments.md>) and [Website comments.docx](<Website comments.docx>). The wording in both sources was checked, and the embedded news reference image was inspected.

**24 tasks are implemented or researched; 6 remain open.** Checked implementation tasks refer to local verification, not deployment. Provider research tasks are complete as recommendations; they do not authorize a subscription or activation. Keep unresolved provider and editorial decisions open.

These comments update the affected requirements in [HANDOFF-TASKS.md](HANDOFF-TASKS.md). Earlier completion records remain historical evidence and do not establish acceptance of this feedback. In particular, H04 now requests an evaluation of live market data alongside commentary, changing the earlier commentary-only direction. The separate [AI Search deferral](AI-SEARCH-TASKS.md) remains in effect.

## H01 — Homepage hero

- [x] **WF-01 — Add the introductory sentence below the hero title.**
  - **Source:** H01, “Project Development for a Sustainable Future.”
  - **Done when:** The sentence below appears beneath that title and remains readable on desktop and mobile:
    > From an initial idea to feasibility, finance and implementation, Enerqa develops projects across climate action, energy transition, environment, nature, circularity, ESG and sustainable finance.

## H03 — Global News

- [x] **WF-02 — Contain news imagery within the news component.**
  - **Source:** “The news image background should not cover the entire section.”
  - **Done when:** News imagery is contained within its slide or panel and no longer backgrounds the surrounding homepage section. Check text contrast and image cropping at desktop and mobile widths.

- [x] **WF-03 — Remove the background-selection control.**
  - **Source:** “The selection of Background should be removed.”
  - **Done when:** The background selector and any instructions or settings used only by that selector are removed from the homepage experience.

- [x] **WF-04 — Build a wider Global News slideshow with headline arrows.**
  - **Source:** H03 layout request and the embedded example.
  - **Reference:** [News slideshow image extracted from the DOCX](assets/website-comments/global-news-reference.png). Use its wide image, headline treatment and arrow navigation as visual guidance within Enerqa's design.
  - **Done when:** The panel spans the available content width inside the site's side indentation, has a landscape rather than tall layout, and supports at least five news items with coverage across Enerqa's domains and main topics when available. Previous/next arrows change the image, headline and destination together. Keyboard and touch users can navigate it. A short or empty feed has an honest fallback without repeated or invented stories.
  - **Dependency:** Coordinate the final dimensions with WF-09; provider coverage is evaluated in WF-07.

- [x] **WF-05 — Diagnose and fix poor news-image resolution.**
  - **Source:** Images look low resolution despite high-resolution originals; determine whether the API causes it.
  - **Done when:** Compare publisher originals, API-returned images, stored image URLs, image transformations and actual browser rendering. Record the cause and fix the controllable bottleneck. Verify sharp images at the new panel size; document any provider-imposed limitation and missing-image fallback.
  - **Dependency:** Recheck against WF-04's final dimensions and any provider change selected through WF-07.

- [ ] **WF-06 — Investigate delayed news updates.**
  - **To do:** Developer: inspect the NewsData HTTP 422 validation response without logging credentials; correct the request/account issue and verify two successful scheduled refreshes. Latest read-only audit on 18 October still records failed attempts.
  - **Source:** NewsData.io appears a day or more behind and seems to change about every two days.
  - **Done when:** Compare source publication times, provider availability, ingestion schedules, cache ages and displayed results. Identify whether the delay comes from the subscription, provider, ingestion, cache or deployment. Document a fix and verify the resulting update interval without claiming fresher data than the provider supplies.

- [x] **WF-07 — Research news-provider alternatives and assess Exa.**
  - **Source:** Consider paid services around **USD 10–20/month** and check whether EXA is legitimate and recommended.
  - **Done when:** Produce a dated comparison with official pricing/documentation links, topic filtering, freshness, image quality, request limits, commercial display rights, attribution and estimated monthly usage. Cover climate change/action, energy transition, nature, circularity/environment, and sustainable business/finance/ESG. Evaluate Exa's suitability as a news source, including publication-date reliability and image availability, and give a supported recommendation. State clearly if no suitable plan meets the budget.
  - **Dependency:** Use findings from WF-05 and WF-06. Record the provider selection before any replacement integration.

## H04 — Major Markets and shared news/markets layout

- [x] **WF-08 — Propose paid market-data APIs with commentary and costs.**
  - **Source:** H04 requests live company ticker updates, upward/downward point changes, graphs and commentary.
  - **Done when:** Produce a dated shortlist with official sources for pricing, exchange/company coverage, quote latency, point and percentage changes, chart history, commentary availability, request limits and public display/redistribution rights. Distinguish real-time from delayed data, include exchange or licensing surcharges, and state whether commentary requires a separate source. Recommend an option with an estimated total monthly cost; no market-data budget was specified in this feedback.
  - **Dependency:** Record the chosen provider and scope before implementing provider-dependent data or layout behavior. The news budget in WF-07 does not automatically apply to markets.

- [x] **WF-09 — Arrange Global News and Major Markets as separate equal-height subsections.**
  - **Source:** Stop placing the two panels side by side; try equal-height subsections within the first page fold.
  - **Done when:** Create and review a layout showing the two panels one above the other with equal heights at agreed desktop viewport sizes, targeting visibility within the first fold. Show how H01, navigation and both panels fit together. If the available height conflicts with readability, show that constraint in the preview and record the selected compromise. Mobile remains readable and can extend below the fold.
  - **Dependency:** Coordinate with WF-04 and WF-10; confirm the desktop viewport and layout through the design preview.

- [x] **WF-10 — Split Major Markets into data and commentary columns.**
  - **Implemented free scope — 18 October:** TradingView’s free delayed stock-price/chart widget is separate from sourced commentary. The user chose to keep the full-screen hero and place this section directly below it. Six initial U.S. company symbols are configured; no paid feed is active. See [implementation and proposal](feedback/MAJOR-MARKETS-2026-10-18.md).
  - **Future paid upgrade:** Confirm the final company/exchange list and obtain an external-display quote before replacing the free widget with a paid API. This is not needed to use the current free display.
  - **Source:** One column for tickers, changes and graphs; another for commentary, with widths chosen to suit the API.
  - **Done when:** The selected market feed supplies a readable data column and a distinct commentary column. Column widths suit their content and stack on small screens. Quotes and commentary show their relevant timestamps, sources and delayed/unavailable states without implying unsupported live coverage.
  - **Dependency:** Current scope selects the free TradingView display. The user confirmed full-screen hero plus markets below, superseding the earlier combined-first-fold target.

- [ ] **WF-11 — Review and simplify the news/markets footnote.**
  - **To do:** Developer: keep the current attribution and delay/cache disclosures; finalize mandatory wording and placement against the selected provider contract.
  - **Source:** Determine whether the footnote is legally necessary, can move to Sources, or should be shorter and smaller.
  - **Done when:** Check the applicable provider terms and required rights-of-use notices. Record what must remain beside the panels and what may move to the Sources page. Implement a concise, smaller but readable note with a Sources link where appropriate; retain mandatory attribution and disclosures.
  - **Dependency:** WF-07 and WF-08 determine the applicable provider terms.

## H05 — Explore Our Domains

- [x] **WF-12 — Remove domain-panel background images.**
  - **Source:** H05, “Remove the background images.”
  - **Done when:** Explore Our Domains uses an image-free treatment consistent with the website, with readable titles and no empty image placeholders.

- [x] **WF-13 — Make domain panels static with interaction-based reveals.**
  - **Source:** Remove rotation and “pause rotation”; reveal Discover and the text snippet on hover.
  - **Done when:** Panels no longer rotate automatically and the pause-rotation control is removed. Hovering a domain reveals its Discover link and snippet beneath the title. Keyboard focus provides the same access, and touch users can reach the content and destination without a hover requirement.

## H07 — Industries

- [x] **WF-14 — Rename the homepage industry heading to “Industries”.**
  - **Source:** H07, remove “We Work In.”
  - **Done when:** The homepage heading reads exactly “Industries,” including any corresponding accessible label or editable heading value.

## H11 — About Enerqa

- [x] **WF-15 — Remove the gas manhole-cover image.**
  - **Source:** H11 identifies the image as irrelevant.
  - **Done when:** The image is removed from About Enerqa and the layout remains balanced without a broken image or empty reserved space.

- [x] **WF-16 — Evaluate Enerqa's logo symbol as the replacement visual.**
  - **Source:** Optional suggestion to try the symbol supplied with the logo files.
  - **Done when:** Locate the supplied brand symbol, preview it in H11 and record whether it improves the section. Use the supplied asset if selected; if it is unavailable, record the missing asset and retain a finished image-free layout pending a decision.
  - **Dependency:** Coordinate with WF-15. This is a design evaluation, not a requirement to invent a new logo.

## Domains and Industries megamenu

- [x] **WF-17 — Redesign the Domains and Industries megamenu.**
  - **Source:** Improve the current presentation; design direction is left to the developer.
  - **Done when:** Prepare a preview with clearer grouping, spacing, typography and link hierarchy, then implement the selected design. Domain/industry destinations remain correct and the menu works with pointer, keyboard and mobile navigation.

## O01 — Domains and Industries overview

**Deployment gap verified 18 October:** The public Vercel page still has the left-aligned heading, mixed domain icons/emoji and “Industries We Work In.” The local page already implements WF-18–WF-20 and passed fresh checks at 1366, 1024, 390 and 320 px. [Comparison and next action](feedback/DOMAINS-OVERVIEW-2026-10-18.md). These checked implementation tasks do not mean the public deployment is updated.

- [x] **WF-18 — Evaluate centering the “Our Domains” title.**
  - **Source:** “See if it would be better to centre” the title.
  - **Done when:** Compare centered and current alignment in context on desktop and mobile, record the selected treatment and apply it. Treat centering as a proposal to evaluate rather than a confirmed requirement.

- [x] **WF-19 — Replace the domain icons with a more suitable visual treatment.**
  - **Source:** Current icons do not fit the website's feel; propose another idea.
  - **Done when:** Preview a coherent alternative using Enerqa's established visual language, choose the direction and apply it across all domains. Domain identity and link clarity remain understandable without relying on decoration alone.

- [x] **WF-20 — Rename the overview industry heading to “Industries”.**
  - **Source:** O01 repeats the request to remove “We Work In.”
  - **Done when:** The heading on `/domains-and-industries` reads exactly “Industries,” including its corresponding accessible label or editable heading value.

- [ ] **WF-21 — Review related-data sections across every domain and industry with the client.**
  - **To do:** Client and developer: review the 17 rows in feedback/RELATED-DATA-REVIEW.md and agree the measures, geography and source mapping.
  - **Source:** Revise these sections together, dependent on the proposed API changes.
  - **Done when:** Inventory every domain and industry related-data section, prepare a proposed mapping of relevant datasets/feeds, identify gaps and review it with the client. Implement the agreed mapping with accurate sources, update expectations and unavailable-data behavior, then verify all affected pages.
  - **Dependency:** WF-07/WF-08 recommendations and the selected provider scope. Client input is needed for the joint content review.

## Knowledge Hub and article pages

- [ ] **WF-22 — Audit and restore incomplete article content.**
  - **To do:** Editor: resolve the source-edition and reference differences in feedback/publication-text-comparison.json before replacing article body text.
  - **Source:** “The articles are incomplete.”
  - **Done when:** Compare every published article with its supplied original and record missing sections, text, tables and other content in a per-article checklist. Restore the missing material and verify the saved content and rendered pages. Track infographic restoration under WF-23.
  - **Dependency:** Coordinate with WF-24 so the explicitly requested Executive Summary removal is not reversed during restoration.

- [ ] **WF-23 — Restore missing article infographics.**
  - **To do:** Editor and developer: compare every original page against the 80 recovered visuals, including non-image drawings, captions and exact placement.
  - **Source:** “All infographics are not there!”
  - **Done when:** Inventory expected infographics against original publication files and available assets, match each to its article and restore it in the correct position with readable rendering, captions/credits where supplied and useful alternative text. Record unavailable originals as explicit content gaps. Verify every affected article on desktop and mobile.
  - **Dependency:** Use WF-22's article inventory and the existing [publication-image notes](PUBLICATION-IMAGES.md).

- [x] **WF-24 — Remove the “Executive Summary” section from all articles.**
  - **Source:** Remove the part “Executive Summary” from all articles.
  - **Done when:** Audit every article and remove the Executive Summary section, including its heading, associated summary content and any contents-list anchor. Preserve the remaining article body and check for duplicated or accidentally removed substantive content. If a source uses this label ambiguously, identify that article for editorial review.

- [x] **WF-25 — Change “Find a Publication” to “Search a topic”.**
  - **Source:** Knowledge Hub search-label request.
  - **Done when:** The search heading/label reads exactly “Search a topic,” related accessible wording is consistent, and keyword searching still works.

- [x] **WF-26 — Keep only the Domain filter in the Knowledge Hub.**
  - **Source:** Remove Language, year, publication type, industry and topic filters.
  - **Done when:** Only Domain remains as a filter alongside keyword search. Remove the specified filter controls and their active-filter chips, counts and query-state effects. Old URLs do not silently keep removed filters applied. Domain filtering, search, reset and pagination remain consistent.

## Global Intelligence

- [x] **WF-27 — Rename “Sources and Context” to “Sources”.**
  - **Source:** Global Intelligence title change.
  - **Done when:** The section heading reads exactly “Sources,” with matching accessible labels and no stale reference to the old title in that page's navigation.

- [x] **WF-28 — Reduce the Sources section to essential rights-of-use fine print.**
  - **Source:** Make the section small and include only what is essential and necessary for rights of use.
  - **Done when:** Review the rights/attribution requirements of the sources displayed on this page, retain essential notices and links, remove unnecessary explanatory copy, and style the result as small, readable fine print. Link to fuller source information where needed.
  - **Dependency:** Coordinate with WF-11 and any provider changes from WF-07/WF-08 that affect this page.

- [x] **WF-29 — Rename “External Content Cards” to “Results”.**
  - **Source:** Replace the current label with Results or another appropriate term.
  - **Done when:** The user-facing heading reads “Results,” with consistent accessible wording and empty/loading states. Result behavior remains intact.

- [ ] **WF-30 — Review and improve the overall Global Intelligence page.**
  - **To do:** Client: review the implemented Global Intelligence preview in feedback/DESIGN-REVIEW.md and identify the remaining layout/content changes.
  - **Source:** “This page needs a lot of work.”
  - **Done when:** Audit the page's hierarchy, density, result presentation, filtering, source placement and mobile usability. Produce a concrete list of improvements and a design preview for client review, then implement the agreed scope and verify it. WF-27–WF-29 cover the explicit text/source changes; this task captures the broader request without inventing unspecified requirements.
  - **Dependency:** Align the preview with WF-27–WF-29 and any applicable provider decisions. Client feedback is needed to settle the broader redesign scope.

## Suggested order

1. Apply independent copy and removal tasks: WF-01–WF-03, WF-12–WF-15, WF-20 and WF-24–WF-29. Rights-related simplification still follows the terms review in its completion criteria.
2. Start article/content inventories (WF-22–WF-23) and news diagnosis/provider research (WF-05–WF-08).
3. Review design previews (WF-09, WF-16–WF-19 and WF-30); build the slideshow and market layout with the selected dimensions and provider scope (WF-04/WF-10).
4. Finalize provider-dependent notices (WF-11/WF-28) and the joint related-data review (WF-21), then verify the affected pages against this board.

## Implementation update — 15 October 2026

The homepage now includes the requested introduction, contained slideshow and separate equal-height news/market panels. Domain panels are static and image-free. The megamenu, overview domain treatment, About visual, headings, publication finder, article summary template and Global Intelligence labels/source presentation are updated. The slideshow supports eight eligible stories; current upstream failures leave only three eligible default headlines, which are not duplicated to fill slots.

Restored **80 original images, tables and diagrams across all 25 articles**: 64 archive images, 15 skipped table/vector crops and the Sudan Sankey diagram from Enerqa's original article. Twenty-four archive-edition PDFs preserve the full original text, tables and footnotes. The CMS body text remains intact. [Publication restoration checklist](feedback/PUBLICATION-RESTORATION.md).

**Verification:** 563 tests and the production build pass; changed-file ESLint has no errors (one existing unused-variable warning in Button). Desktop checks place the complete feed band at approximately 741 px at 1366 × 768 and 730 px at 1024 × 768. Desktop/mobile checks have no horizontal overflow. The per-article and final browser evidence is recorded in [browser-verification.json](feedback/browser-verification.json); design screenshots are collected in the [design review](feedback/DESIGN-REVIEW.md). No code deployment or CMS-content publication was performed.

| Open task | Current result and remaining work |
| --- | --- |
| WF-06 | Saved jobs record NewsData HTTP 422 and GDELT HTTP 429; current local NewsData checks stop before a request because the key is absent. Restore valid provider access, identify the specific validation error and verify successful scheduled freshness. |
| WF-10 — completed 18 October | Free delayed TradingView quotes/charts now sit beside eligible commentary. A future paid API is a separate upgrade decision. |
| WF-11 | Existing footnotes are shorter and retain provider/delay/cache notices plus Sources. Final mandatory placement depends on the selected provider/exchange contract. |
| WF-21 | All four domains and thirteen industries are inventoried in the [joint review matrix](feedback/RELATED-DATA-REVIEW.md). Agree measures, geography and source scope before changing saved mappings. |
| WF-23 | 80 recovered visuals load correctly across all 25 articles, and complete archive PDFs are available. Final source-by-source comparison of remaining non-image drawings/callouts and exact placement remains part of the publication review; this task is not closed solely because the recovered files render. |
| WF-22 | All 25 CMS texts match the saved reconstruction; a full source comparison now identifies source-edition, table, caption and reference differences. Original archive editions and recovered artwork are available. Review the [text comparison](feedback/publication-text-comparison.json) before replacing remaining edited body passages or references. |
| WF-30 | A concrete Global Intelligence improvement is implemented, with clearer result cards, secondary metadata disclosure and concise Sources. The [preview](feedback/DESIGN-REVIEW.md) needs the client's broader review to define any additional redesign scope. |

Provider research is in [API-RECOMMENDATIONS.md](feedback/API-RECOMMENDATIONS.md), including prices, Exa suitability, usage estimates and unresolved public-display/image rights. No paid provider was activated, and the separate AI Search deferral remains in effect.

## Homepage review — 18 October 2026

**The comments are not all complete: 23 tasks are implemented/researched and seven remain open.** Research completion does not mean a paid feed is integrated. Local implementation does not establish production deployment or client acceptance.

The refreshed homepage preserves the approved copy and section order, stacked equal-height news/market sections, contained slideshow images, manual headline arrows, static image-free domains and Industries heading. It separates the navy introduction/search from a light feed band, improves text contrast and market-column separation, replaces the washed-out newsletter/contact treatment with solid navy, and removes the unused Data Portal column when no eligible dataset exists. No prices, stories or datasets were fabricated, and no CMS content was changed.

A fresh read-only database audit confirms 25 published article bodies still match the saved reconstruction. The template supplies recovered visuals separately, so zero image blocks inside those CMS bodies does not mean zero rendered figures. The news scheduler last attempted a refresh at **06:29 on 18 October (Asia/Manila)**; NewsData returned **HTTP 422**, GDELT returned **HTTP 429**, and EIA/EEA succeeded. NewsData's last successful refresh remains 12 October UTC. These are saved-job observations, not a fresh direct provider probe. See [current audit](feedback/current-content-audit.json).

See [homepage review and evidence](feedback/HOMEPAGE-REVIEW-2026-10-18.md) for validation, screenshots and the seven outstanding actions. The existing provider recommendations are dated 15 October; no prices or provider terms were revalidated during this visual review.


## Latest hero and market direction — 18 October 2026

**Current total: 24 tasks implemented/researched; six remain open.** Earlier implementation reviews above are historical. The latest user direction supersedes the compact hero, contained-image and shared-first-fold layout: keep the EY-inspired full-screen news hero, with one headline per domain, and put Major Markets in its own section immediately below it. Major Markets is removed from the hero categories.

WF-10 is now implemented for the selected free scope: delayed company quotes, daily absolute/percentage changes and a chart in a wider column, with separate sourced commentary. The free widget retains TradingView attribution, explicit delay labels and embedded-content consent. The initial watchlist is NEE, FSLR, TSLA, XOM, SHEL and MSFT. Paid real-time coverage has not been activated. WF-11 remains open for the full provider-specific rights/footnote review; a later paid exchange contract can introduce additional terms.

[Implementation and paid proposal](feedback/MAJOR-MARKETS-2026-10-18.md), [market browser checks](feedback/major-markets-verification.json), [hero browser checks](feedback/hero-verification.json), [desktop market preview](feedback/screenshots/major-markets-1366.png), [mobile market preview](feedback/screenshots/major-markets-390.png).

Verified locally: 577 tests across 77 files, TypeScript, changed-code ESLint and the production build. The actual free widget was checked for prices, signed daily changes and chart rendering; blocked-provider and consent-withdrawal states were exercised. Hero/markets occupy equal screen heights at 1366×768 and 1024×768, with no page overflow at those widths or 390/320px mobile. These checks do not establish public deployment.
