# Client feedback — 23 October 2026

Scope: the five Enerqa requests in the supplied chat screenshot. The screenshot's unrelated account credentials were not used or copied into this report.

## Changes

| Client request | Implementation |
| --- | --- |
| More space between the header and homepage title | Increased hero padding by 24 px on desktop and 16 px on phones. Narrow phones allow the hero to grow so wrapped text and news do not overlap. |
| Screen news by subject, beyond matching words | Collection now separates candidate discovery from editorial approval. A structured semantic review evaluates the headline together with the licensed description, assigns the actual topic, and rejects incidental mentions, mixed newspaper digests and uncertain results. Public reads require approval for the exact saved text and current review version, plus the existing anonymous-access checks. Stock-market reporting stays in Major Markets. |
| Remove Relevant Tools from individual domains and industries | Removed the domain section. The industry template already omitted it. The Tools directory remains available through the site's navigation. |
| Recommend up to five relevant datasets and open the Gapminder-style portal | Replaced the single CMS/provider fallback with ordered, page-specific recommendations from the Explorer's existing open-data catalogue. All 4 domains and 13 industries have 2–5 indicators. Cards show their purpose, original source, licence and verified observation years. Both cards and section actions open the relevant indicator in `/data-portal/explorer`. The Explorer validates the requested indicator and supports an optional country selection. |
| Use Publications in the plural | Changed collection headings, links, navigation, search groups, cover labels and footer wording to “Publications.” Labels describing one individual publication remain singular. |

## Current saved-news review

Reviewed the original headlines and licensed descriptions of all 48 active-provider saved records. Applied 41 approvals and 7 rejections through `scripts/apply-news-editorial-review.ts`, after a successful dry run and an exact-text preflight. Verified the resulting counts directly in the database. The screenshot's newspaper digest is rejected, as is the Scotland newspaper roundup.

These are one-time Codex editorial assessments, not results from a newly enabled external model. The review manifest records each exact title, description, category and reason: [NEWS-EDITORIAL-REVIEW-2026-10-23.json](NEWS-EDITORIAL-REVIEW-2026-10-23.json). The update changed only editorial-review metadata, preserving original text, publication/retrieval dates, rights and access evidence. No article records were deleted.

The application code and its new publication gate still need deployment. Saving review decisions does not mean the deployed older application enforces them.

## Automatic-review dependency

Automatic review is implemented but remains disabled by the existing OpenAI provider approval switch and the separate `NEWS_EDITORIAL_REVIEW_ENABLED` opt-in. The public AI-search feature retains its independent release switch. No paid model requests were made for this task.

- [ ] Resolve the existing provider approval and budget requirements in `src/lib/api/core/registry.ts` and `docs/AI-SEARCH-TASKS.md` before enabling the provider for this purpose.
- [ ] Confirm the approved review model in `src/lib/api/ai-search/config.ts`, configure `NEWS_EDITORIAL_REVIEW_ENABLED=true` in the deployment environment, then verify one manual news refresh and its editorial counters.
- [ ] Until automatic review is enabled, review new items through the same private operator workflow. Prepare a fresh manifest, run `npx tsx scripts/apply-news-editorial-review.ts --check --manifest <path>`, then apply that reviewed file with `--apply --manifest <path>`. Unknown, failed, incomplete, outdated and low-confidence decisions remain unpublished. Existing approved stories can remain visible only while their publication dates and anonymous-access evidence are valid.

Reviews run at collection time, not on visitor page requests. A pull reviews at most 80 candidates in batches of 10, reuses unchanged positive and negative decisions, disables automatic retries, and uses the existing distributed request ledger. The OpenAI request allowance is capped at 24 requests per UTC day. This request limit does not replace the existing model/budget approval requirement.

## Related Data coverage

The 36 distinct recommended indicators reuse the Explorer's existing catalogue and recorded open reuse terms. `scripts/check-related-indicators.mjs` successfully fetched every recorded source CSV and recorded the actual observation periods in `src/lib/data-portal/related-indicator-coverage.json`. An indicator is withheld if that coverage snapshot does not match its catalogue version.

Recommendations are country comparisons. They do not claim Qatar/GCC coverage for every indicator or year. Some historical series end in 2015 or 2021; their dates are visible on the cards. Tourism, technology and institutional pages explicitly describe national context where direct sector data is unavailable. Those pages show fewer than five cards rather than padding the list with weak matches.

- [ ] Review the selected indicators with the client, particularly geography and sectors with only contextual coverage. Add sector-specific sources only when their real data coverage and reuse terms are established.

## Verification and release

- Passed all 682 tests across 88 test files.
- Passed the production build, including TypeScript checking, with `PAYLOAD_SCHEMA_PUSH=false`.
- Passed ESLint for all changed source and verification files, and `git diff --check`.
- Verified the saved review decisions in the shared database: 41 approved, 7 rejected, with the screenshot digest rejected.
- Passed browser checks against the local production build at five homepage sizes and all 17 detail pages at 1366 px and 390 px. No overflow or browser exceptions were found. Clicking a real recommendation selected the correct Explorer indicator and loaded a data table with 109 observation rows.
- Checked all 11 available homepage news slides on the final production build. Neither rejected newspaper digest appears, and no browser errors occurred.

Evidence: [browser checks](client-feedback-verification.json), [desktop homepage](screenshots/client-feedback-home-1366.png), [mobile homepage](screenshots/client-feedback-home-390.png), [related indicators](screenshots/client-feedback-data-1366.png), and [linked Explorer](screenshots/client-feedback-explorer.png).

The browser script checks five homepage sizes, all seventeen detail pages at desktop and phone widths, absence of Relevant Tools, plural headings, recommendation counts, destination parameters, overflow, title spacing and a real recommendation-to-Explorer-to-data-table interaction. Source checks and tests do not run provider collection jobs or enable inference.

- [ ] Verify the deployment of this PR through the normal Vercel release process. A merged PR and local validation are separate from a successful public deployment.
- [ ] After deployment, recheck the saved-review counts. An older deployed ingestion job can replace review metadata before this version ships; if that happens, rerun the manifest preflight and reapply only unchanged reviewed text.
- [ ] Run `scripts/verify-client-feedback.mjs` with `FEEDBACK_PREVIEW_URL` set to the deployment URL, then confirm that the screenshot digest is absent and the new editorial-approved stories remain visible.

The previous one-card presentation proposal in [RELATED-DATA-REVIEW.md](RELATED-DATA-REVIEW.md) is superseded by this client's up-to-five-indicator request. Its broader geography and source-coverage review remains useful.
