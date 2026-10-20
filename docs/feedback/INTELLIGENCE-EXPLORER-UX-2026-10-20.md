# Global Intelligence and Data Explorer UX — 20 October 2026

## Implemented locally

### Global Intelligence

- Checkbox filter panel on the left and results on the right at desktop widths.
- Each group has a bounded, independently scrollable list with keyboard access. Country selections retain the existing linked continent/region behavior.
- Additional filters start closed, including bookmarked searches, and show a selected-count summary. Content type, language and date remain available inside.
- Removed the Source filter. Old page URLs with `source=` do not create invisible restrictions; source attribution remains on result cards.
- Preserved the explicit Search/Apply flow: selecting checkboxes does not spend a provider request. Pagination, staged edits, cancellation and saved-result fallback remain intact.
- On phones, Show filters/Hide filters controls the panel. Collection tabs wrap at narrow widths instead of overflowing.

### Data Explorer

- Replaced the separate axis search box and native select with one searchable combobox per axis.
- Focus/typing opens suggestions. Typing replaces the current label; choosing a suggestion or pressing Enter applies it immediately.
- Searches indicator names, topics and identifiers, with word matching and one-letter typo tolerance. Search covers the full catalogue while the visible list is bounded to 80 choices.
- Supports arrow navigation, Escape, focus dismissal and touch selection. Searching keeps the plotted indicator stable until a suggestion is chosen.
- Existing time aggregation, country/date pairing, zero/missing handling, tables and download behavior remain covered by tests.
- Original Gapminder Chart remains available as a temporary comparison view, with the existing embed-consent behavior.

### Attribution

Replaced the generated disclaimer with Gapminder's exact adapted-material credit:

> Based on free material from GAPMINDER.ORG, CC-BY LICENSE

The text links to Gapminder and CC BY 4.0. Original provider credit and indicator licence/terms remain separate and visible. The unchanged original comparison view uses Gapminder's unchanged-material citation.

The metadata API/download now includes the exact credit, original source, original licence URL, pinned dataset version and actual Enerqa transformations. Unfinished “describe actual transformations” instructions are no longer returned in its attribution.

Verified wording: [Gapminder Free material](https://www.gapminder.org/free-material/) and [Gapminder data attribution](https://www.gapminder.org/data/), accessed 20 October 2026. The displayed Gapminder credit does not replace an indicator's original provider terms.

## Verification

- 31 tests passed across filter controls, staged searches, axis/plot interactions, metadata attribution, country pairing and period aggregation.
- TypeScript, targeted ESLint and `git diff --check` passed.
- Browser checks at 1366, 390 and 320 px: left/right desktop placement, mobile panel toggle, independent country-list scrolling, closed additional filters, no Source inputs/native filter dropdowns, automatic axis suggestions, immediate selection and no browser errors.
- Final 320/1366 px checks: no horizontal overflow; old `source=newsdata` URLs still show the unrestricted 138-record saved collection.
- Real bubble-chart render and downloaded metadata verified at desktop and touch phone widths. Comparing the selected life-expectancy series produced 325 matched observations, with the exact credit and actual transformation note in JSON.
- Screenshots: `/tmp/enerqa-intelligence-filters-{1366,390,320}.png`, `/tmp/enerqa-axis-suggestions-{1366,320}.png`, `/tmp/enerqa-explorer-final-{1366,320}.png`.

## Remaining steps

- Review `/knowledge-hub/global-intelligence` and `/data-portal/explorer` locally.
- Remove the original Gapminder comparison only once the custom explorer is finalized.
- Deploy the reviewed changes and verify the public pages; no deployment was performed in this task.
