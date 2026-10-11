# Section 1.3 — utility destinations: completed verification

Completed **11 October 2026** against handoff PDF pages 4 and 206–208. **All seven checklist items pass in the repository and a local production build.** The owner installed the six additive fields, added the initial policy versions and then explicitly approved completion/publication. Four replacement policies are now published in the shared database as **version 2**, recording **Islam Abuhiss, Director**, and **11 October 2026**.

The code has **not been deployed**. Direct policy SQL updates do not invoke the CMS cache-refresh hook; deployed generated pages need a fresh deployment. The release checks below remain in Part 14.5. No schema changes, external email sends, service activation, retention job or analytics provisioning were performed during completion.

## Checklist evidence — 7/7

| Item | Verified result |
|---|---|
| Privacy Notice | HTTP 200; correct title/H1, version/approver/date, real footer/sitemap/contact links. Published company, lawful-basis, retention-policy, newsletter, hosting/external-content, inactive analytics/AI and rights wording. Cleanup/provider delivery are explicitly described as inactive. |
| Terms of Use | HTTP 200; matching title/H1/approval details and links. Complete text includes informational use, individual dataset licences, other content rights, external services and contact; no blanket reuse grant. |
| Cookie Choices | HTTP 200 and accurate approved text. Fresh optional choices start off; toggling one preserves the other, choices survive reload and both can be withdrawn. No analytics requests with the release setting off. |
| Accessibility Statement | HTTP 200, approval details and working email/contact destinations. Statement names tested features, chart/table alternatives and remaining limitations; it does not claim whole-site WCAG conformance. Automated scans of utility main content pass after contrast fixes. |
| 404 | Single-segment and nested Data Portal missing URLs return HTTP 404, **Page Not Found \| Enerqa**, correct heading/message, search/home/domain actions and the relevant Data Portal action. No horizontal overflow at 1366, 390 or 320 px, or 125% CSS zoom. |
| Newsletter states | Real database-backed signup saves once and redirects to confirmation. Exact-address unsubscribe preserves neighbouring subscribers and enquiry contents, gives the same reply for an absent address, and saves a minimal suppression record. Both forms retain input after recoverable rejection. Pages have correct titles and `noindex, nofollow`, outside primary nav/sitemap. |
| Source unavailable | Passing component tests distinguish successful empty results from failed sources. Failed status includes search and nearest-section links; the page remains available. Existing provider-failure tests also pass. Shared callers cover homepage/domain/industry/Global Intelligence/Knowledge Hub feeds. |

Header/homepage search and the sources directory have their own checklist entries in 1.2/12.8 and 1.2/12.6/Parts 9/13. Utility completion adds no primary-navigation entries; AI search remains deferred.

## Policy publication and schema

The exact public source is [POLICIES-APPROVED.md](questionnaire/POLICIES-APPROVED.md). It contains four complete documents with proper headings and labelled links; its approval introduction is excluded from public content. [POLICY-DRAFTS.md](questionnaire/POLICY-DRAFTS.md) is retained as historical review material.

The owner ran the field installer before completion. Read-only verification confirms **6/6 columns**:

| Table | Present columns |
|---|---|
| `policies` | `policy_version` |
| `enquiries` | `last_substantive_contact_at`, `retention_hold_reason`, `retention_hold_until`, `notification_sent_at`, `newsletter_synced_at` |

The authorised [publisher](../scripts/questionnaire/publish-policies.mjs) locks the four existing rows, checks expected versions and inactive service settings, writes a private backup of all prior policy rows in the ignored `scripts/questionnaire/backups/` directory, then publishes content/approval/version in one transaction. It made **no schema change** and ran no historical Payload migration. A subsequent read-only preview reports **0/4 replacements**, confirming the saved policies match their approved source and metadata. Version 1 and September approval records are preserved in the private backup.

Privacy wording distinguishes the agreed two-year retention policy from inactive automated deletion. It names current hosting/storage and explains external embeds without inventing processor regions or transfer agreements. SendPulse, Umami and AI remain inactive in the tested configuration. Remaining assessment, processor/region, client-record, consent-evidence and cross-system retention work stays in 14.4; policy publication is not evidence those operations are complete.

## Fixes made

- Unknown single-segment policy paths now generate **Page Not Found** metadata instead of inheriting the site-only title; drafts still return 404.
- Decorative 404 number uses responsive sizing, removing the original 413 px document overflow at a 390 px viewport.
- Darker policy-sidebar text and newsletter-confirmation button colour fix the contrast failures found by the browser scan.
- Unsubscribe input has a dark visible keyboard outline.
- Signup and unsubscribe return submitted values on recoverable errors and rebuild the form from them, preserving the address and the visitor's explicit consent after React resets the action form. Component regression tests cover changed and repeated addresses.

## Validation results

| Check | Result |
|---|---|
| Full Vitest suite | **472 tests passed, 62 files** |
| TypeScript | `npx tsc --noEmit` passes; the final build also completes TypeScript |
| ESLint | All changed/new utility code, regression tests and policy publisher pass |
| Production build | `PAYLOAD_SCHEMA_PUSH=false npm run build` passes; **34 static pages** generated, including all four replacement policies |
| Read-only schema/policy previews | **6/6 fields present**, publisher reports **0/4 replacements** |
| Browser acceptance | Headless Chrome against `next start` on local port 3104; policy/consent/404/newsletter/embed checks pass |
| Real form fixture cleanup | **4 unique test rows removed, zero remaining**; no real subscriber/enquiry used |
| Whitespace | `git diff --check` passes |

Chrome acceptance used reduced motion at 1366 × 768, with 404 checks also at 390 × 844 and 320 × 844. The zoom check used **125% CSS zoom**, not the full native-browser zoom matrix. `axe-core` found zero violations for the selected WCAG A/AA tags within the main content of the four policy pages and both newsletter pages after the fixes. This automated subset does not establish whole-site or screen-reader conformance.

Keyboard checks open the search dialog and mobile menu with Enter, close them with Escape and confirm focus returns to the trigger. Existing header tests additionally cover focus trapping. All four policies appear in footer/sitemap; policy and newsletter entries are absent from primary navigation, and newsletter states are excluded from sitemap.

A fresh browser profile confirms independent initially-off consent, persistence and withdrawal. On the Data Explorer, no Gapminder iframe exists before permission; a one-item load adds it and a reload requires permission again. Changing saved automatic permission in another tab adds/removes the iframe in the already-open explorer. External requests were blocked, and first-party data APIs were replaced with unavailable responses for this gate check, avoiding provider fetches. This verifies the gate and withdrawal, not the third party's service availability or accessibility.

Real newsletter tests used unique `example.com` fixtures and the actual server actions/shared database. They verified confirmation metadata after navigation, repeat signup without duplicates, exact withdrawal, unaffected neighbouring addresses, preserved enquiry message/company and neutral absent-address suppression. Exhausting the local test visitor's rate limit exercised recoverable rejection: both forms showed honest errors, remained usable and retained their values. SendPulse was off, so these checks sent no email and establish no provider delivery/suppression claim. All four fixture rows were removed in cleanup and the remaining count was zero.

## Remaining release work — outside section 1.3

- **Deployment owner:** deploy the reviewed code through the normal project process. Direct policy publication skips the CMS cache hook; verify the generated pages on the deployed release. Keep automatic schema push off against the shared database.
- **Developer/reviewer:** repeat `/privacy`, `/terms`, `/cookie-choices`, `/accessibility`, both missing-URL shapes and the newsletter flow on that release. Check footer/sitemap, approval details, no-request-before-consent and withdrawal; use a dedicated test address and remove only its fixtures.
- **Accessibility reviewer (14.3):** finish the whole-site page/heading/contrast/screen-reader/third-party, slow-network, long-content and native-browser zoom matrix. Approved Arabic equivalents remain separate work. Maintain the published statement as results change.
- **Company/privacy and service owners (14.4):** complete the documented legitimate-interests assessment, processor/region/account review, client-record and consent-evidence periods, legacy-record review and retention across mailboxes/exports/providers/backups. Verify mailbox/request handling. Keep automated cleanup off until deletion/restore checks pass.
- **Sending/analytics owners (14.4):** verify SendPulse notification/delivery/provider suppression and retry/overlap; provision Umami and verify active consent/withdrawal and the 90-day purge/backup-restore limit. Approve active-service wording before activation. AI remains deferred.

## Earlier states — historical

The initial 11 October audit found 0/6 columns, policy-loader HTTP 500 failures, September policy bodies, the single-segment 404 title mismatch and mobile overflow. After the owner's installer/version changes, the field preview showed 6/6, all four version-1 pages returned 200, and footer links returned. Those changes restored access but did not replace policy bodies. The later explicit completion approval, publication, fixes and acceptance above supersede both earlier snapshots. The 3 October database timeout is also historical; no news-ingestion or deployed scheduler recovery is inferred from these utility checks.

## References

- [Policy collection](../src/collections/Policies.ts), [published-policy loader](../src/lib/policies.ts), [public policy template](<../src/app/(frontend)/[policy]/page.tsx>), [footer](../src/components/Footer.tsx), [sitemap](../src/app/sitemap.ts).
- [Cookie controls](../src/components/CookieChoicesControl.tsx), [consent store](../src/lib/consent.ts), [embed gate](../src/components/ExternalEmbed.tsx), [analytics gate](../src/components/WebsiteAnalytics.tsx).
- [404 UI](<../src/app/(frontend)/not-found.tsx>), [global 404](../src/app/global-not-found.tsx), [inline source status](../src/components/ui/SourceUnavailable.tsx).
- [Newsletter actions](<../src/app/(frontend)/actions/newsletter.ts>), [signup form](../src/components/SubscribeForm.tsx), [unsubscribe form](<../src/app/(frontend)/newsletter/unsubscribe/UnsubscribeForm.tsx>), [subscription/retention logic](../src/lib/forms/lifecycle.ts).
- [Operations](questionnaire/OPERATIONS.md), [questionnaire ledger](questionnaire/STATUS.md), [policy facts](POLICY-FACTS.md), [Part 12 evidence](PART-12-VERIFICATION.md).

Policy wording review used the [ICO privacy-information guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/) for the information a notice should cover. Accessibility wording follows the [W3C conformance requirements](https://www.w3.org/TR/WCAG22/#conformance) and [evaluation methodology](https://www.w3.org/TR/WCAG-EM/): the tested utility subset supports the recorded checks, not a whole-site conformance claim.
