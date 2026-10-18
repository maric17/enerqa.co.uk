# Domain official updates

Verified locally on 11 October 2026 (Manila time).

The `Domains.policyUpdates` group stores the section heading, description and source note. It does not store report entries. The list comes from the specialist providers configured in `src/lib/feeds/contextual.ts`.

| Domain | Automatic sources | Current finding |
| --- | --- | --- |
| Climate Action & Carbon Management | ReliefWeb | Disabled. The configured app name returned HTTP 403 with an appname error. The page now explains the disabled automatic feed. |
| Energy Systems & Transition | EIA RSS and OSTI | Three official cards returned, including on a repeated request. |
| Environment, Nature & Circularity | EEA RSS, GBIF literature and ReliefWeb | One EEA card returned. Disabled ReliefWeb contributes no reports. |
| Sustainable Business, ESG & Finance | SEC EDGAR | Three official filing cards returned. |

ReliefWeb requires a pre-approved application name; setting an arbitrary `RELIEFWEB_APPNAME` does not satisfy that requirement. See the [official appname documentation](https://apidoc.reliefweb.int/parameters). Adding text to the CMS source note does not enable a provider.

## Completed fixes

- [x] Keep original saved provider records when displaying official cards. The old aggregator saved the card under the same provider/record key and replaced fields such as `provider`, `publisher`, `rights`, `summary` and `regions`. The saved-news reader then correctly rejected that incomplete record, which made subsequent lists shrink.
- [x] Verify and store SEC filings in their original research-record format before creating display cards. RSS and keyword-research records already pass through their own storage and access gates.
- [x] Distinguish disabled automatic updates, successful empty searches and failed providers. A disabled provider no longer masks a failure in the enabled providers.
- [x] Explain the disabled Climate feed and direct visitors to the existing official source links.
- [x] Restore 11 affected saved RSS records using the original EIA/EEA connectors and current access evidence. Shared request budgets and access checks remained in place. The original 14 affected rows were backed up in `/tmp/enerqa-official-records-before-repair.json` before repair. No CMS schema or content was changed.
- [x] Confirm repeated local page visits preserve the repaired RSS records: 16 readable EIA records and four readable EEA records remained after verification.
- [x] Pass 72 targeted tests, TypeScript and ESLint checks.

## Remaining work

- [ ] Enable Climate's automatic ReliefWeb reports.
  - **Blocker:** The configured app name returned HTTP 403. The registry remains disabled.
  - **To do:** Request an approved organisational app name through the form linked in ReliefWeb's documentation. Set `RELIEFWEB_APPNAME` on the server, confirm a successful API response and an anonymously readable complete report/PDF, then enable the `reliefweb` registry entry and restart the app. Repeat the check on the deployed site.
- [ ] Recover three older EIA records if historical coverage is needed.
  - **Blocker:** Their original entries are no longer in the current RSS response. They remain excluded from saved-news reads.
  - **To do:** Restore exact source metadata from a trusted backup, or ingest the original archived documents with normal rights and access checks. Do not reconstruct lost summaries from card titles.
- [ ] Deploy the code fix and verify repeated page visits on the deployed site.
  - **To do:** Include the official aggregator and component changes in the deployment. The database is shared; a deployment still running the old aggregator can overwrite source records again.

## Checks

Run `npm run db:check` to verify database connectivity without changing its schema. The 11 October check passed authentication and found all three connector tables.

Run `npx vitest run src/lib/feeds/official.test.ts src/lib/feeds/feeds.test.ts src/components/feeds/OfficialFeed.test.tsx src/components/ui/SourceUnavailable.test.tsx src/lib/api/news/storage.test.ts src/lib/api/news/savedNews.test.ts src/lib/api/research/research.test.ts` for the relevant regression checks.

Open the four domain pages locally. Repeated visits must keep RSS records readable. Only actual provider results with verified access may populate the list.
