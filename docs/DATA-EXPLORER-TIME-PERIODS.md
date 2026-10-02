# Data Explorer time periods — enhancement 6.3

Verified locally on 2 October 2026 at `/data-portal/explorer`.

## Implemented

- The Time period selector offers Daily, Weekly, Monthly and Yearly. Yearly is the default, matching the existing Gapminder catalogue.
- Each country has one average per selected calendar period. Weeks start on Monday; dates and timestamp boundaries use UTC. Missing periods remain missing, and real zero values remain zero.
- Indicator comparisons match exact country/date pairs before averaging both axes. Unmatched observations are excluded.
- The Y-axis recalculates from the displayed averages, with padding for visibility. Bar charts retain a zero baseline. Constant and all-zero series still have a visible axis range.
- Charts, tables and Filtered CSV downloads share the same grouped values. JSON Meta records the requested and effective periods, mean aggregation, Monday week start and UTC time zone. Full CSV remains the original source export.
- Period changes reuse the loaded observations without extra network requests. Automatic top-five country selection stays consistent between periods.

## Source limitation and next action

The current Explorer catalogue and observations route use Gapminder series. The real dataset checked locally contains yearly observations. Selecting a finer period retains the available yearly values and displays a notice. Annual or monthly values are never expanded into invented daily observations.

To make finer views useful with real data, connect a source that publishes daily or monthly observations to this Explorer's catalogue, metadata and observations interface. Existing connector pages are separate from this Gapminder Explorer. Choose any provider-specific aggregation method before adding totals: this implementation uses an unweighted average of available observations, which does not represent a period total.

The Original Gapminder Chart tab remains an external embedded visualization; these controls apply to the site's Data Explorer charts.

## Verification

- Targeted Vitest: 17 tests passed across the Explorer component, indicator-pairing helper and time-period helper.
- `npx tsc --noEmit`: passed.
- Targeted ESLint for the changed implementation and time-period tests: passed.
- Real local browser: HTTP 200, all four selector options, yearly-source notice and chart canvas verified.
- Browser-only daily fixtures: Daily 5, Weekly 4, Monthly 3 and Yearly 2 rows, with expected averages. Filtered CSV and JSON metadata downloads verified. Line, bar and comparison bubble charts rendered without browser errors.
- Mobile browser at 390px: weekly table verified; no page-level horizontal overflow.

Daily browser fixtures were intercepted only in the verification browser. They were not written to the catalogue, database or provider data. This verification covers the local running application; no production deployment was performed.
