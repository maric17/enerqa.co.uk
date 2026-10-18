# Homepage and website-comments review — 18 October 2026

## Are all comments finished?

No. The source comments map to **30 tasks: 23 implemented or researched, seven open**. The [task board](../WEBSITE-FEEDBACK-TASKS.md) retains the exact acceptance criteria and now has a concrete To do beneath each open item. Checked tasks describe local implementation or research; they do not establish client acceptance or production deployment.

| Client area | Current implementation | Still needed |
| --- | --- | --- |
| H01 introduction | Exact requested title and introduction | Deployment/client review |
| H03 Global News | Contained wide slideshow, manual arrows, no background selector, up to eight eligible stories; provider comparison including Exa prepared | WF-06: resolve failed NewsData requests and demonstrate scheduled freshness. Existing fallback bitmap is 768 px wide and can soften on desktop; small/missing publisher images use that branded fallback. Source image availability/rights remain provider dependent. |
| H04 Major Markets | Stacked equal-height panels on reference desktop widths, two commentary columns, dated provider recommendations | WF-10: select/licence a quote feed before implementing real tickers/charts. WF-11: confirm final mandatory footnote wording/placement for the chosen contract. |
| H05 domains | Static image-free cards; hover and keyboard reveal; visible details on touch | Deployment/client review |
| H07 industries | Heading reads Industries | Deployment/client review |
| H11 About | Removed unrelated image; supplied Enerqa wordmark displayed | Standalone logo symbol was not found; the wordmark is the implemented proposal |
| Megamenu and O01 | Grouped directory menu, numbered domain treatment, centered Our Domains, Industries heading | WF-21: jointly approve related-data mapping for four domains and thirteen industries |
| Knowledge Hub | Search a topic, Domain-only filter, summary template removed; 80 recovered visuals across 25 articles; archive editions available | WF-22: resolve original-versus-edited text/reference differences. WF-23: final source artwork/caption/placement comparison. |
| Global Intelligence | Results and Sources labels, fine-print attribution and clearer result presentation | WF-30: client review of the implemented broader redesign |

The API comparison is dated 15 October. This review did not recheck pricing, buy subscriptions or activate providers.

## Implemented homepage improvements

The visual direction uses the existing navy, white and teal palette. A two-column introduction/search layout gives the approved title more readable line breaks on wide screens. It returns to a centered layout on smaller screens. A light editorial band separates the stacked news/market panels from the introduction and the static domain section. Dark headings, deep-teal links and a restrained divider make commentary easier to scan.

The newsletter/project section now uses solid navy instead of translucent layers over white. Its text and consent label are readable, and flexible columns fit narrow phones. Existing submission, consent and access rules are preserved. The Data Portal teaser only reserves a dataset column when an eligible record exists; the query and eligibility rules are unchanged.

No fabricated quotes, articles or datasets were added. AI search remains deferred. No CMS records were written and no deployment was performed.

## Preview

- [Desktop first screen](screenshots/home-1366.png), [1024 px first screen](screenshots/home-1024.png).
- [390 px first screen](screenshots/home-390.png), [320 px first screen](screenshots/home-320.png).
- [Full desktop homepage](screenshots/home-full-1366.png), [full mobile homepage](screenshots/home-full-390.png).
- [Desktop newsletter/contact](screenshots/home-contact-1366.png), [mobile newsletter/contact](screenshots/home-contact-390.png).

## Validation

- All 563 tests across 73 files pass.
- Production build and TypeScript pass with schema push disabled. Changed-component ESLint and whitespace checks pass.
- [Homepage geometry and measured contrast](homepage-refresh-verification.json): no horizontal overflow at 320, 390, 768, 1024, 1199, 1200 and 1366 px. At the reference desktop widths, the feed band ends at approximately 761 px (1366) and 764 px (1024), within a 768 px viewport. Mobile expands naturally.
- Measured text contrast samples range from 4.98:1 to 14.42:1 against their rendered surfaces. These are targeted samples, not a whole-site accessibility certification.
- The broader [production-browser report](browser-verification.json), run at http://localhost:3002, passes: slideshow navigation, equal panel heights, four domain/thirteen industry menu links, Domain-only publication filters, and all 80 recovered figures across 25 articles. All article pages return HTTP 200, have zero broken recovered images and no Executive Summary heading. There are zero browser exceptions. The verifier now waits for streamed content and hydration before inspecting figures.
- [Read-only CMS/scheduler audit](current-content-audit.json): 25 published article bodies still match the saved reconstruction. Images are added by the article template. Saved latest scheduler diagnostics show NewsData HTTP 422, GDELT HTTP 429 and successful EIA/EEA retrievals. NewsData's last successful refresh was 12 October UTC; these saved observations do not verify provider recovery or current deployment.

## What to do next

1. Review the desktop/mobile previews against the client's comments and deploy the agreed homepage change.
2. Fix NewsData's validation error and verify two successful scheduled refreshes; keep stale-data disclosures meanwhile.
3. Use the existing provider brief, related-data matrix and publication comparison to settle the seven open task-board items with the client/editor.
