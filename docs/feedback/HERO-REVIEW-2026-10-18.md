# Homepage hero — 18 October 2026

The latest user direction replaces the compact first fold described in the earlier homepage review. The user subsequently confirmed keeping the full-screen hero with a separate Major Markets section below it; see [market implementation](MAJOR-MARKETS-2026-10-18.md). The reference is the EY Philippines homepage and the user's annotated screenshot.

Implemented locally:

- A screen-height background image, with the Enerqa title and search at the upper left.
- One selected headline for each of the four domains. Major Markets has its own section below the hero. The All category is removed.
- Story text at the lower left; category selectors and previous, next and pause controls at the bottom.
- Eight-second rotation. Manual selection and keyboard focus pause rotation. Hover temporarily pauses it. Reduced-motion settings disable automatic rotation.
- Categories use the shared saved news pool. The separate Major Markets section compares saved EIA commentary too. No extra provider requests occur when changing categories.
- Publisher, publication time, delay, retrieval time, cached status and source rights remain visible. Missing content and provider outages have distinct messages. Failed or undersized images use the existing local fallback.
- Category selectors scroll horizontally on phones. Small phones omit suggestion links and, below 780px height, the teaser, keeping the full headline and controls visible. Screens below 640px height allow the hero to grow with its content.

Validation:

- Full Vitest suite: 75 files, 568 tests passed.
- TypeScript, ESLint for changed code, and whitespace checks passed.
- Production build passed with `PAYLOAD_SCHEMA_PUSH=false`.
- Browser checks passed for all four domain categories at 1920×1080, 1366×768, 1024×768, 1024×614, 768×1024, 390×844 and 320×740. Checked page width, search/story separation, footer visibility, selected category visibility, navigation and search.
- The production build was served locally and checked on desktop and mobile. All eight domain/viewport combinations passed text contrast sampling against the actual rendered photos and shade. No browser errors occurred.

Evidence: [layout and interactions](hero-verification.json), [production contrast](hero-production-verification.json), [desktop preview](screenshots/hero-1366-climate.png), [mobile preview](screenshots/hero-390-finance.png).

Repeat browser checks with `scripts/verify-home-hero.mjs` and contrast checks with `scripts/verify-home-hero-contrast.mjs`. Both accept `PLAYWRIGHT_MODULE`, `CHROME_EXECUTABLE` and `FEEDBACK_PREVIEW_URL` for the local runtime.

Production deployment is not part of this local change.
