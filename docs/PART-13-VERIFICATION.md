# Part 13 verification — 2 October 2026

Part 13 was checked against the revised handoff PDF, pp. 209–224 and 226–227, the current source, database evidence, live numerical providers and a local production build. The current checklist is [HANDOFF-TASKS.md](HANDOFF-TASKS.md#part-13--api-provider-specifications-pdf-pp-209224).

The available implementation is finished. **Eight items remain unchecked**: complete destination/rights launch review, deployment scheduler, DOAJ confirmation, ReliefWeb registration, SEC editorial approval, Climate TRACE inventory release identity, OECD Rio-marker query and GBIF public ZIP workflow. Each has a specific to-do directly beneath it in Part 13. They are not counted as complete.

## Changes

- Added persistent records and access verdicts in a private database schema, separate from Payload content. News keeps original provider IDs, the final checked URL and actual check evidence. Research/official records keep identifiers, separate dates and rights metadata. Invalid/uncertain destination verdicts remain unpublished and can be rechecked after expiry.
- Added shared database reservations before actual upstream requests. A database transaction locks one provider while counting/reserving its allowance. Cache hits do not spend a request. Daily and rolling budgets survive server restarts and multiple server instances. Local request spacing, backoff, Retry-After and circuit breakers remain; OSTI is serialized.
- Added a protected scheduled-ingestion endpoint and bounded request-history cleanup. It is not activated because the deployment scheduler and `CRON_SECRET` are absent.
- Paused DOAJ until its documented launch gate is resolved. Restored ReliefWeb's disabled state because no approved appname is configured. Existing OpenAI/Gemini launch switches remain off; AI Search work remains in its separate board.
- Added EIA annual U.S. generation to the Data Portal preview, the Energy related-data fallback, a numerical detail view and ungated CSV. The Energy fallback runs when no compliant CMS dataset is already linked; an existing approved dataset retains priority.
- Added GBIF's real occurrence table and bounded, licensed CSV extract. Dataset names/DOIs, coordinate uncertainty and source withholding/generalization notes travel with the extract. It never claims that its first 100 returned records represent a complete inventory or abundance estimate.
- Added OpenAQ daily sensor measurements after checking station/sensor ownership and all required licence flags. Per-source attribution/share-alike obligations, quality warnings, station age and UTC averaging intervals are preserved. Daily observations use the provider's local calendar dates where supplied. A sensor with no returned readings stays empty.
- Shared table/chart/CSV selection includes the whole selected year/day. Unlike measures render separately; long-form CSV adds an explicit comparison warning and retains the unit/frequency/basis on each row. Negative, missing and genuine zero values remain distinct.
- Replaced the Data Portal preview's hover-only chart with visible period/value labels and an equivalent scoped table. Fixed a long series selector that caused mobile overflow. Every registered numerical connector is reachable from Sources and Methodology; unapproved OWID/Ember entries no longer appear as approved providers.
- Corrected the homepage test fixture so it renders the actual hero's feed children. Provider parser/breaker tests explicitly enable their DOAJ fixture and restore the paused production setting afterward.

## Automated checks

| Check | Result |
|---|---|
| TypeScript | `npx tsc --noEmit` passed |
| Full tests | `npx vitest run`: 355/355 tests, 38 files passed |
| ESLint | Passed on Part 13 changes and touched verification files |
| Production build | `PAYLOAD_SCHEMA_PUSH=false npm run build` passed |
| Real database concurrency | Exactly 2 of 5 simultaneous reservations permitted with a limit of 2; 3 refused |
| Schema apply | Idempotent; repeated application preserves existing records |
| Diff whitespace | Part 13 changes clean; the user's pre-existing `DataExplorerClient.tsx` has three trailing-space warnings and was left untouched |

Tests cover transaction locking/rollback/release, daily/hourly exhaustion, unconfigured accounting, retained timestamps, abstract/teaser rejection, licence flags, sensor ownership, measurement flags and empty values, reversed/wide selections, matching period selection and scheduler authentication. They do not call paid inference.

The build observed GDELT's shared request-spacing refusal and completed with the honest fallback. An earlier cold build also observed temporary shared-accounting unavailability; it prevented those upstream requests. This is availability protection, not evidence that every provider contributed a card.

## Live numerical observations

These are snapshots, not permanent dataset sizes or future availability guarantees. The probe uses the same shared ledger as the site and never prints credentials.

| Source/selection | Observed result |
|---|---|
| World Bank adjusted net savings, Qatar 2020–2023 | 1 series, 4 observations, `% of GNI` |
| EIA U.S. generation, 2020–2023 | 1 series, 4 observations, `thousand megawatthours` |
| OECD municipal waste, France/Germany 2020–2022 | 12 returned series, 36 observations; distinct units retained |
| NASA POWER, default selected point, 2023 | 2 series, 24 observations; solar and temperature units separate |
| Climate TRACE, Qatar 2023 | 1 annual modelled estimate; inventory version remains unknown |
| GBIF occurrences, Qatar | 100 licensed returned records; 3 contributing dataset DOIs found |
| OpenAQ locations | 19 licence-cleared stations in the inspected 100-location response |
| OpenAQ location 33, PM10 sensor 4612 | Daily local dates 28–30 Sep 2026; 23.8, 23.1, 25.8 µg/m³; original UTC averaging intervals retained |

An initial OpenAQ nitrogen-monoxide sensor returned no measurements. It was not filled with sample values; the subsequent PM10 probe verified real measurements. OECD municipal waste succeeding does not establish Rio-marker access. No inventory release was inferred from Climate TRACE's API version.

## Browser verification

A local production server ran on port 3001 with automatic Payload schema changes disabled. Headless Chrome checked:

- EIA generation, GBIF occurrences, a selected OpenAQ sensor and Sources and Methodology returned HTTP 200 with one H1 each. Successful data views rendered a real table.
- The Data Portal preview switched to EIA, showed United States geography and its equivalent table, linked the real CSV, and stayed within the mobile viewport. The unconfigured scheduler returned HTTP 503 before ingestion.
- Selecting 2022 in the EIA view persisted in the URL. Its CSV returned HTTP 200 with exactly one observation, included 2022 and excluded 2021.
- The initial EIA mobile check found a selector extending to 474 px on a 390 px viewport. Its flex item and select now shrink within the available width.
- Final checks at 390 × 844 px found no horizontal document overflow on EIA, GBIF or the selected OpenAQ view; screenshots were refreshed from the final build.

Screenshots: [EIA generation](part-13/screenshots/energy-generation-mobile.png), [GBIF occurrences](part-13/screenshots/occurrences-mobile.png), [OpenAQ measurements](part-13/screenshots/air-quality-mobile.png).

This is focused Part 13 browser coverage, not the full p. 228 accessibility/performance acceptance matrix. Earlier browser attempts used a missing Playwright browser revision and navigated away from streaming pages too early. The final run used installed Chrome, awaited visible tables and ran against the finished production build.

## Shared database change

`node --env-file=.env scripts/part13/apply-storage.mjs` installed three operational tables in `enerqa_connectors`:

- `provider_requests`: shared allowance accounting, with a provider/time index.
- `external_records`: normalized records, original IDs/URLs, actual rights/check evidence and separate retrieval times.
- `access_checks`: destination verdicts and expiry times, including rejected/uncertain checks.

The schema is private and all three tables have row-level security enabled. It is outside Payload's `public` schema, so a future automatic Payload schema check does not treat these tables as unmanaged CMS content. The initial operational tables were moved from public into this schema transactionally, preserving their evidence. No pre-existing CMS table, row, publication status or relationship was changed. Real test fixture ledger rows are deleted after the concurrency test; genuine provider evidence remains.

Do not run the old Payload migrations. No deployment, paid API call, provider registration or external message was made.

## Remaining to-dos

| Item | Required next action |
|---|---|
| Final source review | Review complete anonymous reading/download and current reuse terms, including external numerical source pages; suppress uncertain items |
| Scheduler | Set deployment `CRON_SECRET`, configure an authenticated schedule within the hosting plan, verify job completion/rejected unauthorized access |
| DOAJ | Obtain current official schema/quota confirmation, verify a full-text sample, update review evidence and then enable |
| ReliefWeb | Obtain/set a pre-approved organisational appname, verify a complete report and then enable |
| SEC | Approve the issuer watchlist and identify/tag ESG-relevant passages; preserve the corporate-disclosure label |
| Climate TRACE | Obtain a release identifier tied to the actual response/download; recheck v7 emissions availability |
| OECD finance | Generate and verify a narrow Data Explorer Rio-marker query on an allowed origin |
| GBIF ZIP | Set free organisational download credentials; generate/persist a public ZIP/download DOI; verify anonymous access and link beside the CSV |

## Rechecking locally

```bash
# Verify source/data rules without changing the live CMS schema.
npx tsc --noEmit
npx vitest run
PAYLOAD_SCHEMA_PUSH=false npm run build

# This idempotent script prepares only the private operational schema if needed.
node --env-file=.env scripts/part13/apply-storage.mjs

# A low-volume real-provider check spends the shared free allowance on cache misses.
node --import tsx --env-file=.env scripts/part13/verify-live.ts

# Review the pages while preventing automatic changes to the shared CMS schema.
PAYLOAD_SCHEMA_PUSH=false npm run dev
```

Open `/data-portal/series/energy-generation`, `/data-portal/occurrences?country=QA`, `/data-portal/series/air-quality?location=33&sensor=4612&from=2026-09-28&to=2026-10-01`, and `/data-portal/sources`. The OpenAQ example is a verified historical selection, not a claim of current live readings.

## References

- Local revised handoff PDF, pp. 209–224 and 226–227.
- Installed Next.js 16.3.1 guides: Route Handlers, `fetch`, and `unstable_cache`. The existing project cache model was retained; Cache Components migration is separate work.
- [node-postgres transactions](https://node-postgres.com/features/transactions): one client per transaction, rollback and release.
- [OpenAQ measurement definitions](https://docs.openaq.org/resources/measurements): daily means follow local station time; UTC averaging intervals are preserved.
- [ReliefWeb appname requirements](https://apidoc.reliefweb.int/parameters): a pre-approved appname is required.
- [DOAJ v4 documentation](https://doaj.org/api/v4/docs): access returned HTTP 403 during this check; no new numeric quota was invented.
- Provider methodology links now use scientific/source notes separately from API instructions: [Climate TRACE data guidance](https://climatetrace.org/data), [World Bank methodologies](https://datahelpdesk.worldbank.org/knowledgebase/articles/906531-methodologies), [OECD municipal waste definition](https://www.oecd.org/en/data/indicators/municipal-waste.html), [EIA electricity source data](https://www.eia.gov/electricity/data.php), [NASA POWER methodology](https://power.larc.nasa.gov/docs/methodology/), [GBIF occurrence data](https://www.gbif.org/occurrence-data), and OpenAQ above.
