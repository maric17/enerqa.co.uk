# Policy pages: confirmed facts and operational status

Company decisions come from the supplied [Content Questionnaire](<EnerQA - Content Questionnaire.md>) and subsequent replies. On **11 October 2026**, the owner authorised completion/publication of the replacements. All four policies are now approved as **version 2**, recording **Islam Abuhiss, Director**, and **11 October 2026**. The exact public source is [POLICIES-APPROVED.md](questionnaire/POLICIES-APPROVED.md); [section 1.3 verification](SECTION-1-3-VERIFICATION.md) records publication and local production-build acceptance. All six schema columns are installed. Code deployment and operational activation remain separate.

## Confirmed company decisions

- Website entity: **Enerqa Ltd**, company number **14034864**.
- Registered address: **College House, 17 King Edwards Road, Ruislip, London, HA4 7AE**. This is a registered address; no additional office street address is inferred.
- Offices shown: London and Doha only, email/no phone numbers. No individual team cards.
- Enquiries: info@enerqa.co.uk. Privacy requests: **Privacy Contact — Enerqa** at the same address.
- Policy approver: **Islam Abuhiss, Director**; published replacement version **2**, approved **11 October 2026**.
- Accessibility target: WCAG 2.2 AA. Do not claim full conformance without the outstanding checks.
- Terms: each dataset's own licence governs reuse. Articles, news, images, logos and tools are not covered by a blanket reuse permission.

## Enquiries, newsletters and retention

The contact form stores name, email, organisation, enquiry type, message, optional newsletter choice and optional tool/domain/industry/project details. Server actions validate public submissions and apply spam controls; anonymous REST/GraphQL creation cannot bypass them. Only signed-in staff can read, update or delete the records.

The confirmed enquiry basis is legitimate interests for general/business enquiries, supported by a documented legitimate-interests assessment. Personally requested steps towards a contract may use the contract/pre-contract basis instead. The approved public wording describes this basis; completing the documented assessment and operational processor review remains in 14.4. Newsletter consent is optional, separate and unticked; an enquiry without that tick creates no newsletter subscription.

Enquiries expire **two years after the last substantive contact**, with a separate client-record policy for engagements and documented reviewed legal exceptions. A routine editor change does not restart that period. Active newsletters remain until withdrawal or the newsletter ends; only minimum suppression data remains afterward. Separate consent-evidence retention must be documented.

Prepared code implements separate newsletter records, substantive-contact/hold fields, exact-address unsubscribe, provider retry markers and a gated daily maintenance route. The 11 October follow-up confirms all six fields (five enquiry fields and one policy version) **are installed**. All four replacement pages render, and real database-backed signup/unsubscribe acceptance passes, including neutral replies, exact matching and recoverable errors. Only unique test fixtures were used and all were removed. The cleanup remains inactive in the checked local configuration; installing fields does not activate it. Legacy contact dates/client transfers, mailbox/export/provider retention and backup restoration still require verification.

## Email processing

SendPulse is the chosen newsletter provider. A private server-side adapter is also prepared for enquiry notifications to info@enerqa.co.uk. Notifications contain a protected editor link rather than the visitor's email/message. Saved records survive a provider failure; pending delivery can retry. No confirmation email or newsletter send is promised by the local save alone.

**Not verified live:** SendPulse account, API credentials, verified sender, mailing-list configuration, processor agreement/region, delivery and unsubscribe/suppression behaviour. `SENDPULSE_ENABLED` remains an explicit activation gate. Do not publish wording that says the provider is already receiving data until those checks pass.

## Analytics

The user selected the **free open-source self-hosted Umami** product and approved **90-day raw-event/session retention with matching backup limits**. Self-hosted software can be free while its server still costs money.

Prepared code uses independent prior opt-in for aggregate page visits, dataset downloads and tool access. It excludes contact/search/newsletter/admin/API routes and removes query strings, fragments, original page titles, referrers and extra event properties. It does not call user identification, load replay or advertising code. Umami can internally derive pseudonymous sessions; the policy review must describe the actual deployed processing.

**Analytics is not active.** `ANALYTICS_RELEASE_READY` gates the component, and each send rechecks consent. A pinned dedicated instance and website-scoped purge script are prepared but not deployed. Confirm the host/account, HTTPS, no-request-before-consent and withdrawal behaviour, install the daily purge and verify backup/restoration at the same 90-day limit before enabling it. No statistical-purpose exemption was approved; cookie-free software alone does not establish one.

## AI search

**Deferred by the user's latest instruction because no API key exists.** The provider and release switches remain off. The earlier $50/month decision and catalogue draft are saved for a future restart; they do not activate calls, promotions or budget enforcement. There is no active AI processing to describe as deployed. A future restart must complete the separate [AI task board](AI-SEARCH-TASKS.md), including processor/privacy review.

## Hosting, storage and external content

The configured hosting is Vercel, file storage is Vercel Blob and the content database is Supabase/PostgreSQL. One website database serves local, preview and production environments. Verify the actual account owners, regions, access permissions and backup limits; they were not supplied by the questionnaire. Avoid historical migrations and automatic schema pushes against this shared database.

External embeds load only after a visitor's one-item choice or saved embed consent. They can involve their own storage and processing; the published notice explains this processing without asserting unverified provider regions. Review actual provider terms and locations as part of the remaining operational work. Analytics and embed choices are separate; old embed consent never opts a visitor into analytics.

| Storage | Purpose |
|---|---|
| payload-token cookie | Staff authentication in the content editor |
| enerqa-consent browser storage | Independent embed and analytics choices |
| enerqa-lang browser storage | Language preference; no published Arabic equivalent is implied |

The site's news/research connectors fetch public material server-side. Verify actual processor/data flows against deployed configuration; public source access does not by itself establish redistribution rights.

## Accessibility evidence

Existing tests and recorded browser checks cover several keyboard controls, focus/reduced-motion behaviour, forms, consent-gated embeds and mobile data views. These do not complete the handoff p. 228 matrix or establish whole-site conformance. Follow [HANDOFF-TASKS.md section 14.3](HANDOFF-TASKS.md#143-accessibility-responsive-performance-p-228) for remaining checks, including page headings, contrast, zoom, blocked scripts, slow networks and third-party limitations.

## Approval and publication — complete for section 1.3

The owner installed the six reviewed additive fields and initially set policy versions to 1. With the later explicit approval to finish 1.3, four complete replacement texts were prepared from the supplied decisions and actual inactive-service state, then published as version 2. The approved source excludes editorial questions and activation instructions.

[scripts/questionnaire/publish-policies.mjs](../scripts/questionnaire/publish-policies.mjs) backed up all four previous rows privately before one transaction. It changed policy content/approval/version only; it made no schema change. A subsequent read-only preview reports **0/4 replacements**, confirming the stored rows match the source. Publication used direct SQL, so it does not invoke the content editor's cache-refresh hook. The fresh local production build includes the replacements; redeploy code and verify the public release separately.

SendPulse, analytics, AI and automated cleanup remain off in the tested local configuration. No email was sent, retention job run, analytics instance provisioned or code deployed. Completing the privacy assessment, processor/account verification, retention across systems and the whole-site accessibility matrix remains in 14.3/14.4. Update and approve active-service wording before any later activation.
