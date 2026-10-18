# Domains and Industries overview — 18 October 2026

The user asked for a centred Our Domains heading, a coherent alternative to the domain icons, and the heading Industries.

## Current result

The local page already contains all three changes. No duplicate page implementation was needed:

- Our Domains and its introduction are centred over the two-column domain grid. This balances the section as a whole; the card text stays left-aligned for reading.
- Consistent small teal labels replace the mixed decorative icons and emoji: 01 / Climate, 02 / Energy, 03 / Environment, 04 / Business. This follows the site's existing numbered navigation treatment and keeps each full domain title and destination clear.
- The industry heading reads Industries. All thirteen industry links remain present.

Fresh browser checks pass at 1366, 1024, 390 and 320 px. They confirm the heading's computed centre alignment, the four numbered labels, no decorative domain images/emoji, four domain destinations, thirteen industry destinations, no page overflow and no browser exceptions. The verification script passes ESLint and whitespace checks. Application code was already correct, so no application build or unit-test rerun was needed for this verification-only work.

## Public deployment still needs updating

The linked public page returned HTTP 200 but showed the older implementation: computed start alignment, mixed icons/emoji, no numbered labels and Industries We Work In. This is a deployment difference, not a browser refresh issue. No public deployment was performed in this task.

- [ ] Deploy the updated application branch through Vercel, then rerun the O01 checks against `https://enerqa-co-uk.vercel.app`.
- [ ] Confirm the live page has the centred heading, four numbered categories and exact Industries heading.

Evidence: [live/local comparison](domains-overview-live-comparison.json), [four-width local checks](domains-overview-verification.json), [old public view](screenshots/domains-overview-live-before.png), [updated desktop preview](screenshots/domains-overview-1366.png), [updated mobile preview](screenshots/domains-overview-390.png).

Repeat the browser checks with `scripts/verify-domains-overview.mjs`. It accepts `FEEDBACK_PREVIEW_URL`, `PLAYWRIGHT_MODULE` and `CHROME_EXECUTABLE`.
