# Industry news hero — 20 October 2026

## Requested behavior

Show recent, relevant industry news in the first viewport of every individual industry page. Keep the industry title visible while stories rotate. Remove the lower Industry News section and Relevant Enerqa Tools section.

## Local implementation

- `src/components/feeds/IndustryHero.tsx` keeps the industry title and breadcrumbs outside the rotating news content. News loading has its own reserved frame, so the title appears immediately.
- Uses the existing `INDUSTRY_FEEDS` phrases and baskets with `fetchNewsForKeywords`, reading up to three saved sector stories. Page browsing does not request new stories from news providers.
- Reuses `GlobalNewsPanel` for story images, licensed teasers, original-article links, publication dates, source/refresh/cache notices, segmented line navigation and previous/next/pause controls.
- A single industry story group can rotate through multiple stories. A feed with zero or one story disables unnecessary controls. Empty and unavailable feeds remain distinct.
- Manual navigation and keyboard focus pause rotation. Reduced-motion preferences disable autoplay. All-news and empty-state links preserve the industry filter.
- The shared industry page no longer renders the lower news and tools sections. Publications use the available width. CMS tool data remains intact.
- Lower section headings wrap their links on narrow screens.

## Verification

- 52 tests passed across the industry hero, industry page, homepage news panel, homepage saved-feed integration and news-formatting helpers.
- Tests cover all 13 configured industry phrase/basket mappings, single-group rotation and wrapping, pause/manual controls, scoped links, cache attribution, removed sections and retained research/data/publications.
- Desktop 1366×768, short desktop 1024×614, mobile 390×844 and narrow mobile 320×640 checks: industry title, news and controls fit above the fold; no horizontal page overflow or browser errors. The longest Financial Institutions title was checked at 320 px.
- All 13 industry routes also passed at 390×844: HTTP 200, title/story/controls above the fold, no removed section headings, no horizontal overflow and no browser errors.
- TypeScript and targeted ESLint passed; `git diff --check` passed.
- Preview screenshots: `/tmp/enerqa-industry-hero-1366.png`, `/tmp/enerqa-industry-hero-1024.png`, `/tmp/enerqa-industry-hero-390.png`, `/tmp/enerqa-industry-hero-320.png`.

## Remaining steps

- At the initial layout check, Energy & Utilities had three matching stories and Financial Institutions had two; Government, Oil & Gas, Water & Waste and Technology each had one. Seven industries showed the empty state. Later repairs added two verified [agriculture stories](AGRICULTURE-NEWS-2026-10-20.md) and one verified [manufacturing story](MANUFACTURING-NEWS-2026-10-20.md).
- News coverage to do: check the next scheduled ingestion and provider results for Infrastructure, Transport, Tourism, Mining and Healthcare/Education. Acquire additional matching stories before claiming all industry heroes have rotating news.
- Review locally at `http://localhost:3000/industries/energy-utilities` and the other industry routes.
- Deploy the reviewed changes, then verify the public pages. No deployment was performed in this task.
