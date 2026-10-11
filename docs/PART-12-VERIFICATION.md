# Part 12 implementation and verification

Updated 2 October 2026. Scope: handoff PDF pp. 171–208 and Part 12 of `HANDOFF-TASKS.md`.

The owner requested that missing company-approved content remain pending. No tool specifications, legal facts, recruitment content or AI approvals were invented. No deployment, commit or paid AI request was made.

**Utility completion — 11 October 2026:** all six owner-installed fields are verified. The owner authorised the four complete replacements, now published as version 2 with Islam Abuhiss, Director, and 11 October 2026. Real newsletter persistence/confirmation, exact-address withdrawal, neutral replies and recoverable-error input preservation pass; all fixtures were removed. Both 404 route shapes now have correct titles and mobile layouts. The full suite passes 472 tests/62 files, and the schema-disabled production build passes. [Section 1.3 evidence](SECTION-1-3-VERIFICATION.md) records browser acceptance and publication details. No schema change, email send, service activation or code deployment occurred; whole-site/operational work remains in 14.3/14.4.

**Footer follow-up — 11 October 2026:** section 2.3 is 9/9. Added visible source attribution and semantic record-title trails on publication/dataset/dashboard/source templates; footer ownership now prevents duplicate trails, including About/Global Intelligence. Real publication/dataset pages and populated source directory pass browser acceptance; missing detail records show no invented footer breadcrumb. Data Explorer has its missing footer trail, and numerical series/occurrence views use current-page markers. Footer layout/keyboard checks pass at 1366/1024/390/320 px, and the scoped footer accessibility scan finds zero violations. Latest suite: 474 tests/63 files; TypeScript, changed-file ESLint and the schema-disabled build pass. No CMS content/schema changes or deployment occurred for this footer work. [Footer evidence](SECTION-2-3-VERIFICATION.md).

**Questionnaire follow-up — 3 October 2026 (historical verification):** Q1–Q7 supplied the company/privacy decisions and named approver; Q13 supplied careers direction. Replacement policy/careers text was drafted for review, not published. The policy template supports a version and recorded approver, and the careers page/footer/sitemap share one approval gate. AI launch remains deferred by the user's latest instruction. The [3 October verification](questionnaire/STATUS.md) recorded 467 passing tests and TypeScript/changed-file ESLint, while the production build stopped on a database connection timeout after compilation. The successful build/browser/database evidence below belongs to the 2 October run.

## Delivered

- **Global Intelligence:** one cached collection combining news, scholarly research, official updates and selected-issuer disclosures. Every type uses the same query/facets, count, removable selections and pagination. Existing per-destination open-access checks run before indexing. Type-specific reading actions, authors/DOIs, organisation/filing labels, dates and source/retrieval information remain visible. Only short permitted news descriptions are displayed.
- **Geography:** a maintained country/area registry, linked continent/region/country multi-select controls and OR-within/AND-between matching. Country selections set parents; editing parents clears conflicting children with feedback. Cross-region country selections work. Coverage is derived from subject text, never publisher headquarters or author affiliations; uncertain coverage is Not Specified. Global and Multiple Regions are explicit values.
- **Dataset detail:** DS01–DS06 in order; registered connectors feed URL-persisted series/area/period controls, labelled charts and accessible tables. Different measures have separate panels. Missing figures stay missing. The CSV route uses the exact same selection function, carries provenance and enforces the publication/open-access/redistribution flags. Citation copying works and offers a manual fallback. No uncleared map layer is introduced.
- **Public search:** editable labelled query and exact handoff states; canonical internal groups plus verified external results, privacy and feedback guidance. Publication drafts are excluded from public pages, API reads, search, related cards and sitemap. Publish/unpublish operations refresh the page cache.
- **AI repairs, still disabled:** typed output-item parsing, actual citation offsets, refusal/incomplete/missing-evidence handling, completed-search requirement and no guessed dates. Removed keyword-source substitution, unapproved company promotions, the memory fallback and the incorrect filesystem cost ledger. The response always has `enerqa: null`. Stop/retry/clear-search and feedback guidance are available.
- **Tools:** verified that licence/system requirements and user-guide fields and conditional rendering already exist. GreenScale's seed already puts generated results in Outputs. Remaining tool work is approved content, not missing template fields.

## Verification results

| Check | Result |
|---|---|
| TypeScript (`npx tsc --noEmit`) | Pass |
| ESLint on Part 12 changed/new code and schema scripts | Pass |
| Production build (`PAYLOAD_SCHEMA_PUSH=false npm run build`) | Pass; 31 static pages generated, dynamic detail/search routes present |
| Full Vitest suite | 337 passed, 3 pre-existing failures; 35 test files |
| New Part 12 deterministic tests | 22 passed: geography/filtering, cross-region linked controls, selection/CSV consistency, connector URL allowlist, answer parsing and disabled AI route |
| Existing search page tests | 2 passed; mock updated for the new independent external-results section |
| Browser | Chromium, 1366×900 and 390×844; all three smoke scenarios passed |
| Draft access against shared database | Pass in a rolled-back transaction; new draft private, 25 existing articles public |
| Schema apply idempotency | Pass; second invocation reports existing schema and changes no records |

Dashboard repair on 2 October 2026: all 25 published rows were present, but their version table was empty. Payload's dashboard queries the latest versions when drafts are enabled, so its list showed no results. `scripts/backfill-publication-versions.mjs --apply` created the missing versions after a private backup, with preservation checks inside a transaction. Public and draft-list API queries now both return 25 articles with matching original fields. A second run seeded zero versions. The initial draft setup now also seeds versions, and the draft-access verification checks dashboard coverage as well as public visibility.

The three full-suite failures are outside Part 12 and were present in the committed implementation:

1. Two homepage tests mock `Hero` without rendering its children, although the committed homepage already nests `FirstFoldFeeds` inside `Hero`. They consequently miss the feed segment.
2. The provider-registry test expects ReliefWeb to be disabled; the committed registry already enables it. During the browser run ReliefWeb returned HTTP 403. Its registration/settings need review in Part 13.

`git diff --check` is clean for this work. The user's pre-existing `DataExplorerClient.tsx` change has three whitespace warnings and was left untouched.

### Browser evidence

- `/data-portal/datasets/adjusted-net-savings` displays all six dataset headings in the required order, a real World Bank series and an accessible table.
- Selecting `from=2025&to=2025` persists in the page URL. Download CSV returned HTTP 200 and exactly the selected observation. The provider supplied no value for that period, so the CSV cell is empty rather than zero. Unit tests also exercise negative values and reversed/unknown selections.
- The dataset page has no horizontal overflow at 390 px. [Mobile dataset screenshot](part-12/screenshots/dataset-selection-mobile.png).
- Global Intelligence returned 44 verified items in the observed cached collection, paginated by 12. This count is a snapshot, not a permanent catalogue size.
- Selecting Qatar sets Asia and Western Asia. Changing the continent to Europe clears the conflicting country/region and announces it. A separate component test verifies Qatar and Germany can be selected together.
- Research and Corporate Disclosures selections survived submission as repeated `type` parameters, alongside the selected continent. The filtered page has no horizontal overflow at 390 px. [Mobile filter screenshot](part-12/screenshots/intelligence-filters-mobile.png).
- `/search?q=solar` renders Answer and Sources, Relevant Enerqa Content, and Other Sources and States. The disabled AI route returns HTTP 503 with the public failure text; no company-promotion card is rendered. Keyword and external search remain independent of generation.

The initial cold external-index build was slow while access checks ran. The final batch is bounded to 24 news, 16 research and 16 specialist candidates before cross-feed deduplication, shared for one hour. Concurrent search and Global Intelligence requests reuse one in-flight build per process. Cold latency still depends on provider responses and anonymous access checks; route/loading boundaries provide honest loading states. GDELT, GBIF and ReliefWeb failures were observed and did not fabricate replacement content.

## Publication database change

This project shares its database between local, preview and production. The reviewed update was applied on 1 October 2026; its schema is already present.

- Read-only schema inspection reported no data-loss warnings. An unrelated proposed `users.login_attempts` default adjustment was excluded.
- Backed up all 25 publication rows and the publication relationship table before changing anything. The durable local backup is `scripts/part12-backups/publications-before-drafts-2026-10-01.json` (ignored by git).
- Added Payload publication version tables, status enums, `_status` and indexes. Required-column database constraints were relaxed so incomplete drafts can be saved; application validation still applies on publication. No content columns or rows were removed.
- Preserved the public status of the 25 existing article records. New records default to drafts. Compared all pre-existing publication field values before committing the transaction: unchanged.
- `scripts/part12-publication-drafts.sql` records the reviewed schema. `scripts/apply-part12-publication-drafts.mjs` applies it transactionally only when `_status` is absent and creates a backup first. It is a no-op on the current shared database.
- `scripts/check-part12-publication-drafts.ts` creates a draft and verifies anonymous visibility inside a transaction that is always rolled back. No test article remains in the database.
- `PAYLOAD_SCHEMA_PUSH=false` disables automatic schema changes for verification/builds. **Do not run the old Payload migration history against the shared database.**

## Still pending — reconciled with the 3 October questionnaire

| Item | Needed |
|---|---|
| TD02 | Approved tool input/output lists, units, supported parameters and expected user skill |
| TD03 | Approved scoring/calculation methods, assumptions, limitations, tool dates/versions and source-data versions |
| TD05 | Actual user-guide files, input storage/processing/deletion/third-party-use text and related-domain taxonomy |
| Careers | Review/publish the prepared Q13 expert-roster draft and confirm CV handling; page remains gated |
| Privacy operations | Policy text/version/date are approved and published (11 Oct). Complete the documented assessment, processor/account review and retention verification across systems before operational activation (14.4). |
| Generated AI answers | Deferred by the user because no API key exists; keep switches off. Remaining launch requirements are retained in `AI-SEARCH-TASKS.md` for a future restart |

`providerEnabled('openai')` and `AI_SEARCH_CONFIG.releaseReady` both remain off. Do not turn the latter on merely because output parsing now works. The installed SDK omits `max_tool_calls` from its create overload; the request carries the documented parameter through an explicit type extension, pending the staging compatibility check. No claim is made that the separate AI Search project is launch-ready.

## References and maintenance

- Product wording: local revised handoff PDF, pp. 178–179, 183, 191, 202 and 208; separate AI Search handoff §§2, 8, 10–13.
- Country/area hierarchy: [UN Statistics Division M49](https://unstats.un.org/unsd/methodology/m49/), retrieved 1 October 2026. `src/lib/feeds/geography-registry.json` carries 248 countries/areas. Geographic groups follow the source's hierarchy; Antarctica has its own explicit fallback grouping because the table gives it no parent region. The Americas are kept as the M49 parent group. Place aliases and ambiguity exclusions live in `coverage.ts`.
- Framework behavior: installed `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` and Context7 Next.js/Payload documentation.
- Answer parsing: [official OpenAI web-search documentation](https://developers.openai.com/api/docs/guides/tools-web-search), the installed SDK declarations and the local AI Search handoff. Live compatibility remains untested.

To review locally, run `PAYLOAD_SCHEMA_PUSH=false npm run dev`, then open `/knowledge-hub/global-intelligence`, `/data-portal/datasets/adjusted-net-savings`, and `/search?q=solar`. The schema is already applied; these review steps should not change it.
