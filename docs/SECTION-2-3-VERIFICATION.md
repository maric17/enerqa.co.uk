# Section 2.3 — footer verification

Completed **11 October 2026** against handoff PDF page 8. **All 9/9 checklist items are built and verified locally against the production build.** Code has not been deployed. No CMS content/schema edits, form submissions, external email sends or service activation were performed for this footer work.

## Changes

- Added a visible footer note directing readers to original providers, licences and reuse requirements in [Sources and Methodology](<../src/app/(frontend)/data-portal/sources/page.tsx>). Its link targets the source directory directly; the existing Data Portal navigation link remains.
- Replaced the publication's visual title/topic trail with an accessible Home → Knowledge Hub → actual record-title breadcrumb. Topic tags remain in the publication summary; they are not presented as parent pages.
- Publication, dataset, dashboard, source and numerical-view templates now share [Breadcrumbs](../src/components/ui/Breadcrumbs.tsx): a named navigation landmark, ordered list, decorative separators and a current-page marker. Long titles wrap; parent links lead to genuine pages.
- [FooterBreadcrumbs](../src/components/FooterBreadcrumbs.tsx) steps aside on those templates and on About/Global Intelligence, which already render their own trails. Missing publication/dataset/dashboard records no longer acquire an invented parent-only footer trail.
- Added the missing Data Explorer footer trail, with its real H1 title under Data Portal. Numerical series and occurrence views now mark their current page; series retain their real source-directory link.
- Corrected the stale source-directory and breadcrumb notes in the task board, its snapshot, route list and Part 12 cross-references. The source directory is already populated by the current enabled/reviewed provider registry; this task does not activate more providers or grant new reuse rights.

## Checklist evidence — 9/9

| Item | Verified result |
|---|---|
| Six navigation groups | Exactly Homepage, Domains and Industries, Knowledge Hub, Data Portal, Tools and About within the named Footer navigation. Lifecycle, industries, Global Intelligence and flagship-tool links remain present. |
| Approved email/contact | `info@enerqa.co.uk` and the genuine `/contact` destination remain visible. |
| Newsletter | Labelled email field and separate initially-unticked consent render. Real action acceptance is recorded in [section 1.3](SECTION-1-3-VERIFICATION.md); no form was submitted during footer acceptance. |
| Source attribution | Visible note links `/data-portal/sources#directory`. Clicking reaches the populated source directory with numerical/news/research categories, provider names, licences, attribution and documentation. |
| Policy utilities | All four approved version-2 policies render as actual footer destinations. Publication/content/version acceptance is recorded in section 1.3. |
| No portfolio material | Footer renders the site logo only; no project/client logos, experience counters or portfolio teaser. |
| Breadcrumbs | Real publication and dataset return 200 with one trail, genuine Home/section links, ordered list and current title matching the H1. Footer emits no duplicate. Missing publication/dataset/dashboard URLs return 404 with no invented footer trail. |
| Language availability | Asking for Arabic preserves the exact page URL, query and fragment, shows the availability notice and retains English language/left-to-right layout. No untranslated page is labelled Arabic. |
| Duplicate footer removed | The single active footer is `src/components/Footer.tsx`; the old layout duplicate remains absent. |

## Validation

| Check | Result |
|---|---|
| Targeted breadcrumb tests | **12 passed in 2 files**, including parent/current semantics, duplicate ownership and missing/trailing-slash record routes |
| Full Vitest suite | **474 passed in 63 files** |
| TypeScript | `npx tsc --noEmit` passes |
| Changed-file ESLint | Passes for footer, breadcrumb components/tests and the six changed page templates |
| Production build | `PAYLOAD_SCHEMA_PUSH=false npm run build` passes; **34 static pages** |
| Browser | Headless Chrome on local `next start` port 3105, reduced motion; all footer scenarios pass |
| Footer accessibility scan | `axe-core` reports zero violations for the selected WCAG A/AA tags within the footer |
| Whitespace | `git diff --check` passes |

Footer/document layout on `/privacy` has no horizontal overflow at **1366, 1024, 390 or 320 px**. At phone widths, the Data Portal footer group opens/closes with Enter, updates its expanded state and reveals the source link. Publication/dataset breadcrumbs have no horizontal overflow at 1366, 390 or 320 px. The source destination shows provider credits/licences and excludes disabled/unapproved OWID, Ember, DOAJ and ReliefWeb entries. All three flagship tool URLs return HTTP 200.

Fresh shared-database reads identify the tested real records: **The Evolution of Climate Change Understanding and Response** and **Adjusted Net Savings by Country**. There are **zero dashboard records**. The dashboard template's breadcrumb markup passes the shared component tests/build, and its missing-record 404 behaviour is verified; no sample dashboard was created or publication claim inferred.

Additional browser checks confirm About, Project Development, the Data Explorer and numerical series/occurrence views each have one current-page breadcrumb. Provider-input error states retain their trail; unknown numerical series show Page Not Found without a footer trail. The Arabic availability check preserves URL query/fragment and `lang="en"`, `dir="ltr"`. External browser requests were blocked; no third-party availability or provider-delivery claim follows from this footer acceptance. The dataset page can read its configured server-side connector under existing cache/quota controls. The unknown numerical-series check renders Page Not Found with a streamed HTTP 200 response, which is documented behaviour in the installed Next.js `not-found` guide; this check establishes breadcrumb suppression, not strict HTTP 404 coverage for that streamed route.

## Remaining release work

- **Deployment owner:** deploy the reviewed code and repeat footer/source-link/record-title/mobile/language checks on the deployed release. Local validation does not identify the currently deployed code.
- **Developer/reviewer (14.3):** complete the separate whole-site responsive, heading/contrast, screen-reader, slow-network and native-browser zoom matrix. The scoped footer scan and widths do not establish whole-site accessibility conformance.
- **Content/provider owners (Parts 9/13):** keep outstanding rights, provider identity/account and download reviews open. Directory attribution does not grant a blanket licence to reuse content.

## References

- [Footer](../src/components/Footer.tsx), [mobile footer groups](../src/components/FooterNavGroup.tsx), [footer breadcrumb ownership](../src/components/FooterBreadcrumbs.tsx), [shared breadcrumbs](../src/components/ui/Breadcrumbs.tsx).
- [Publication detail](<../src/app/(frontend)/knowledge-hub/[slug]/page.tsx>), [dataset detail](<../src/app/(frontend)/data-portal/datasets/[slug]/page.tsx>), [dashboard detail](<../src/app/(frontend)/data-portal/dashboards/[slug]/page.tsx>), [sources](<../src/app/(frontend)/data-portal/sources/page.tsx>), [numerical series](<../src/app/(frontend)/data-portal/series/[dataset]/page.tsx>), [occurrence records](<../src/app/(frontend)/data-portal/occurrences/page.tsx>).
- [Provider registry](../src/lib/api/core/registry.ts), [Part 12 evidence](PART-12-VERIFICATION.md), [Part 13 evidence](PART-13-VERIFICATION.md), [handoff board](HANDOFF-TASKS.md).
