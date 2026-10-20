# Client feedback delivery — 20 October 2026

## Included changes

- Larger desktop homepage project-development heading on one line, smaller news titles, and segmented progress lines replacing article dots.
- Up to three news stories per homepage domain and domain-page news section, with per-story attribution, date and cache information.
- Restored Explore Our Domains shared-background hover/focus design using four dedicated commercially usable Unsplash photos. Source/licence records are in [the image review](DOMAIN-CARD-IMAGES-2026-10-20.md).
- Original vector planet symbol used in About Enerqa.
- [Industry hero news](INDUSTRY-HERO-2026-10-20.md) with a persistent industry title; lower Industry News and Relevant Enerqa Tools sections removed.
- TheNewsAPI-only news trial and dedicated stock-market searches/commentary for US, London and regional markets. No legacy news-provider fallback or subscription purchase.
- [Agriculture](AGRICULTURE-NEWS-2026-10-20.md) and [manufacturing](MANUFACTURING-NEWS-2026-10-20.md) discovery/relevance repairs with verified saved articles.
- [Global Intelligence](INTELLIGENCE-EXPLORER-UX-2026-10-20.md) checkbox sidebar, independently scrollable groups, closed additional filters, removed Source selection and mobile filter toggle.
- Searchable X/Y indicator controls that open suggestions while typing and apply a selection immediately. Exact Gapminder credit and CC BY 4.0 links replace generated disclaimer text; original-provider terms and metadata are retained.
- The original Gapminder comparison chart remains available while the custom explorer is reviewed.

## Final local checks

- Full Vitest suite: **85 files / 659 tests passed**.
- ESLint passed on all **56 changed source files** compared with `origin/main`, including new files.
- `PAYLOAD_SCHEMA_PUSH=false npm run build` passed using Next.js 16.3.1, including TypeScript and static-page generation.
- `git diff --check` passed.
- Targeted browser results and screenshots are recorded in the linked feature reports. They cover desktop/mobile layout, hover/focus/touch behavior, axis selection/downloads, and news attribution/link handling.

## Remaining follow-up

- Review the selected domain photos and final presentation.
- Improve saved-news coverage for Infrastructure, Transport, Tourism, Mining and Healthcare/Education. Other sectors with one story keep rotation disabled until additional verified stories exist.
- Remove the original Gapminder comparison after the custom explorer is finalized.
- Merge and verify production deployment separately; local validation does not establish the public deployment state.
