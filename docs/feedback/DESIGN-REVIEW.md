# Feedback implementation — design review

**Latest homepage refinement:** [18 October review, previews and outstanding work](HOMEPAGE-REVIEW-2026-10-18.md). The screenshots below now show the refreshed homepage. The original design rationale follows.

Prepared 15 October 2026. Local preview: [homepage](http://localhost:3000), [Domains and Industries](http://localhost:3000/domains-and-industries), [Knowledge Hub](http://localhost:3000/knowledge-hub), [Global Intelligence](http://localhost:3000/knowledge-hub/global-intelligence).

**Latest homepage preview — 18 October:** The user chose the full-screen hero plus a separate market section below it. [Current hero](HERO-REVIEW-2026-10-18.md), [free chart and commentary](MAJOR-MARKETS-2026-10-18.md), [desktop markets](screenshots/major-markets-1366.png), [mobile markets](screenshots/major-markets-390.png). This supersedes the earlier homepage layout and quote-column status described below.

## Implemented direction

- Homepage: restore the requested introduction, contain news imagery within a wide slideshow, replace background selection with headline arrows, and stack equal-height news/market panels. Keep the mobile layout free to expand. The slideshow supports eight eligible items; the current failing upstream feeds supply only three eligible headlines for the default view.
- Domains: static image-free panels; snippets and Discover reveal on pointer hover or keyboard focus. Touch devices show the details without needing hover. Remove automatic rotation and its controls.
- About Enerqa: replace the unrelated gas-cover image with the supplied white wordmark. A separate symbol asset was not found in the repository; no new logo was invented.
- Navigation: number the four domain links, arrange the thirteen industries in two columns and retain overview, project-development, Knowledge Hub and contact links. Preserve existing keyboard, touch and Escape behavior.
- Overview: center Our Domains and its introduction. Use consistent numbered category labels instead of mixed icons and emoji. Both industry section headings now read Industries.
- Knowledge Hub: Search a topic, Domain as the only listing filter, and removal of the repeated Executive Summary section. Removed URL filters cannot silently narrow the list. All 25 articles now have recovered source visuals: 80 images, tables and diagrams in total. Archive-edition PDFs retain the complete original material; recovered vector/table content includes expandable text.
- Global Intelligence: distinguish the search area from results, make result titles usable links, shorten visible summaries and move secondary author/DOI/coverage metadata into Details and coverage. Keep reading actions, provider names, publication/retrieval dates and stale notices. Reduce Sources to readable fine print and place related Enerqa links outside it.

## Preview files

| Area | Preview |
| --- | --- |
| Homepage desktop | [1366 px](screenshots/home-1366.png), [1024 px](screenshots/home-1024.png) |
| Homepage mobile | [390 px](screenshots/home-390.png), [320 px](screenshots/home-320.png) |
| Domains/industries megamenu | [Directory layout](screenshots/megamenu.png) |
| Static domain panels | [Domain layout](screenshots/domains-static.png) |
| About Enerqa | [Brand visual](screenshots/about-enerqa.png) |
| Overview domains | [Numbered domains](screenshots/domains-overview.png) |
| Publication finder | [Search and Domain filter](screenshots/knowledge-hub.png) |
| Global Intelligence results | [Results](screenshots/intelligence-results.png) |
| Global Intelligence Sources | [Fine print](screenshots/intelligence-sources.png) |
| Restored article image | [Climate forcers infographic](screenshots/climate-forcers-the-hidden-drivers-of-global-warming.png) |
| Restored Sudan diagram | [Energy balance](screenshots/sudan-s-energy-balance-2020.png) |

## Decisions still open

The live quote column needs a selected provider, ticker/exchange list and public-display rights. The current two-column market content remains sourced commentary; it contains no placeholder prices or implied live quotes. Review the [API decision brief](API-RECOMMENDATIONS.md) before choosing that integration.

WF-30 remains open for the client's broader Global Intelligence review. The current layout is a concrete implemented proposal with screenshots; additional changes should be specified against this preview. WF-21 requires the requested joint review of the [17 related-data rows](RELATED-DATA-REVIEW.md). Full article paragraph/table comparison remains in WF-22. WF-23 remains open for the final source artwork and placement comparison after recovering 80 visuals.

No deployment, CMS-content publication, paid subscription or provider activation was performed. The separate AI Search deferral remains in effect.
