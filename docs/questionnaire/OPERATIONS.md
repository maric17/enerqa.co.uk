# Questionnaire operational setup — 3 October 2026

These are the deployment steps for the prepared implementation, not a claim that it is running. AI search is deferred by the latest user instruction. Do not run historical Payload migrations against the shared website database.

## Database and additive fields

**11 October completion:** read-only preview confirms **6/6 questionnaire columns** installed by the owner. All four approved replacement policies are published as **version 2** with the recorded approver/date; the fresh local production build and real database-backed utility form acceptance pass. The agent made no schema changes. [Section 1.3 evidence](../SECTION-1-3-VERIFICATION.md) records policy publication, test-fixture cleanup and the remaining deployment checks.

**The field installation below is already complete.** Use the read-only preview to recheck; proceed to content preview or acceptance tests rather than rerunning installation as a pending task.

```sh
# Read-only check first; all connector table checks must pass.
npm run db:check
# Preview which questionnaire columns exist; this does not change the schema.
node scripts/questionnaire/apply-fields.mjs
# Preview the approved domain relationships and byline normalization.
node scripts/questionnaire/apply-content.mjs
# Back up those content rows privately, then apply Q14/Q16 in one transaction.
node scripts/questionnaire/apply-content.mjs --apply
# Keep automatic schema writes off when starting against the shared database.
PAYLOAD_SCHEMA_PUSH=false npm run dev
```

The content script does not publish policies, careers, tag proposals, Arabic or datasets. Runtime domain reads and publication bylines already use the supplied approvals; the script aligns the saved CMS values. The 3 October previews stopped on the connection timeout; the latest 11 October preview confirms all six columns are installed by the owner. The Q14/Q16 content preview was not repeated during utility completion. The agent published only the authorised policy replacements and created/removed unique form fixtures; no schema changes were made. Direct database updates need a redeployment to refresh generated pages.

## Approved policy publication — complete

The exact public source is [POLICIES-APPROVED.md](POLICIES-APPROVED.md). The owner authorised completion on 11 October; all four policies record **version 2**, **Islam Abuhiss, Director**, and **11 October 2026**. The publisher locks the four existing rows, validates versions/inactive service flags, backs up prior rows privately in the ignored `scripts/questionnaire/backups/` directory and applies content/approval/version in one transaction. No historical migration or schema push is involved.

```sh
# Read-only: already reports 0/4 replacements because publication is complete.
node scripts/questionnaire/publish-policies.mjs
# Build without automatic schema changes; a fresh local build already passes.
PAYLOAD_SCHEMA_PUSH=false npm run build
```

The publisher's `--apply` was already run successfully; do not treat it as pending work. It uses direct SQL rather than the CMS cache hook, so deploy the reviewed code and verify generated policy pages on the deployed release. Keep provider/analytics/retention activation off until their separate operational checks below pass. Future policy revisions need a reviewed source/version/date and active-state verification; this script is scoped to the authorised version-2 replacement.

## Enquiry and newsletter delivery

Server environment variables (private; never prefix these with NEXT_PUBLIC):

| Variable | Value / purpose |
|---|---|
| SENDPULSE_CLIENT_ID | Existing Enerqa SendPulse API ID |
| SENDPULSE_CLIENT_SECRET | Existing API secret |
| SENDPULSE_FROM_EMAIL | A sender verified in Enerqa’s SendPulse account |
| SENDPULSE_ADDRESSBOOK_ID | Numeric ID of the newsletter mailing list |
| SENDPULSE_ENABLED | Set true only after processor/policy review and live testing |
| CRON_SECRET | Scheduler authentication secret |
| FORMS_RETENTION_ENABLED | Set true only after additive fields, legacy-record review and deletion verification |
| NEWSLETTER_ENDED | Set true when the newsletter permanently closes; maintenance withdraws active subscriptions |

Contact submissions remain saved if SendPulse is off or delivery fails. Notifications go to info@enerqa.co.uk and contain the protected CMS record link, not the visitor’s message or email address. Pending notifications are retried by the maintenance job. Newsletter opt-in creates a separate newsletter record, preventing ordinary enquiry expiry from deleting an active subscription. Contact submission without the newsletter checkbox creates no subscription. Unsubscribe clears exact matching contact opt-ins and turns newsletter records into minimal suppression records; provider suppression is queued if delivery is unavailable.

The separate optional newsletter save can fail after an enquiry succeeds. The contact confirmation then states the enquiry is saved and asks the visitor to retry the newsletter form. It does not ask them to resubmit the enquiry.

Before activation, test an enquiry notification to the approved mailbox, a subscription, an unsubscribe, a provider timeout, and a provider-originated unsubscribe. SendPulse remains authoritative for its own suppression list; this integration never clears blacklists. Confirm that newsletter sends cannot resurrect a suppressed address and that provider-side unsubscribes do not create fresh opt-ins. Confirm the actual API payload contract against the chosen account. [Official SendPulse API documentation](https://sendpulse.com/integrations/api/api-email-en), [SMTP API](https://sendpulse.com/integrations/api/smtp).

## Retention beyond the database

The enquiry scheduler is `/api/maintenance/forms`, declared for 19:30 UTC daily (03:30 the following day in Manila). It requires both the activation flag and CRON_SECRET. It retains active newsletters and documented holds, deletes enquiries two calendar years after the last substantive contact, rechecks the latest row, and uses an atomic updatedAt condition to preserve a concurrent staff edit. Routine edits do not reset retention. Provider work is bounded to ten pending records per invocation so an outage does not consume the whole job deadline.

Staff must record actual substantive contact in the new date field. A legal/client-transfer exception needs a documented reason and a dated review/expiry. Transfer client engagement records to the separate client system before deleting the website copy; the client-record policy remains to be confirmed.

Before the first deletion run, review old records for the true contact date, relevant client transfers and legal holds. A date absent from the website record falls back to the original submission date. Never infer that a later generic updatedAt means a client was contacted.

Also implement the same agreed limits in staff mailboxes, exports, provider records, client systems and backup restoration. Notifications deliberately avoid copying enquiry contents to email, but older/manual emails and exports may contain them. Record the actual backup lifetime and reapply expiry/suppression after a restore. These account-level controls remain open; a website cleanup job alone does not complete Q2 “across relevant systems”.

The prepared job currently has one scheduler path. Verify overlap and timeout behaviour in staging before enabling it. A provider acknowledgement followed by a failed local marker write may repeat a notification; newsletter add/unsubscribe is retried without removing provider suppressions. Do not claim exactly-once email delivery.

## Self-hosted Umami

**The user approved 90 days on 3 October 2026**, including matching backup limits. Prior opt-in remains the consent method; no exemption was approved.

[infra/umami/compose.yaml](../../infra/umami/compose.yaml) contains a dedicated Umami/Postgres setup. The Umami 3.4.0 image digest was checked against GHCR; its [tagged schema](https://github.com/umami-software/umami/blob/v3.4.0/prisma/schema.prisma) was used for the cleanup script. The instance was not provisioned. Confirm the host, HTTPS domain, costs and Enerqa administrator before starting it.

Provide an ignored infra/umami/.env with three independent random hex values: UMAMI_DB_PASSWORD, UMAMI_APP_SECRET and UMAMI_2FA_KEY (the last must be 64 hex characters). The listener is bound to localhost:3001; publish it only behind a configured HTTPS reverse proxy. Use a dedicated analytics database, not the shared CMS database. Change the initial admin password and enable two-factor authentication. Keep recorder_enabled false; install no replay script, advertising pixel, user-identity calls or performance collection.

```sh
# Validate Compose with the private environment file before deployment.
docker compose --env-file infra/umami/.env -f infra/umami/compose.yaml config --quiet
# Start on the confirmed Enerqa host; local execution is not a public deployment.
docker compose --env-file infra/umami/.env -f infra/umami/compose.yaml up -d
# Preview expiry counts with dedicated UMAMI_DATABASE_URI and UMAMI_WEBSITE_ID configured.
node scripts/questionnaire/prune-umami.mjs
# Run daily on that host; only --apply deletes the expired data.
node scripts/questionnaire/prune-umami.mjs --apply
```

The purge is scoped to the configured website and handles event children explicitly because the pinned Prisma schema does not rely on database cascades. It refuses the shared CMS URI, unknown website or enabled recording. Expired sessions and their children are deleted even if a later event references the old session; undated raw records are also expired, rather than kept indefinitely. Preview counts include those associated events. It was checked statically and fails closed without analytics credentials; no real deletion was run. Install a daily host scheduler with alerts for nonzero exit status, seed an expired/recent staging fixture and verify the 90-day boundary before activating tracking.

Umami can internally derive pseudonymous sessions even without an identify call. Use aggregate dashboards, keep identity and replay disabled, and include that actual processing in the privacy review. Do not describe the self-hosted collector as zero-processing. Configure edge/server access logs to omit query strings and avoid long-lived visitor identifiers.

On the website, set UMAMI_SCRIPT_URL to the self-hosted HTTPS script and UMAMI_WEBSITE_ID to the created website UUID. Set ANALYTICS_RELEASE_READY=true only after policy reapproval, no-request-before-consent testing and purge/backup verification. The browser component suppresses automatic tracking, allows page views and two fixed event names, strips titles/referrers/query strings/extra event properties, excludes private routes and checks consent before every send, including after withdrawal. It rejects identify and other event types. It never calls umami.identify.

Backup retention must also meet the approved limit: avoid whole-database snapshots that preserve expired raw analytics after day 90, or use selective backups/restoration that enforce the same original-record cutoff. A 90-day-old backup plus 90-day live retention can otherwise preserve records for much longer than 90 days. Verify restoration as well as backup rotation.

The [Umami tracker configuration](https://docs.umami.is/docs/tracker-configuration) supports these controls. The [ICO statistical-purpose guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/) explains why an exemption needs its own review, clear information and a simple free opt-out. No reliance on that exemption is implemented here.

## Account handover

Use Enerqa-owned accounts and individual invitations instead of sharing passwords. Ask the existing administrators to transfer Vercel, Supabase, SendPulse, Umami and provider ownership to a named Enerqa administrator and add a backup administrator. Record the owner, recovery contact, hosting/data region, plan/allowance and renewal responsibility in a private account register. Enable two-factor authentication, check recovery access and perform a supervised restore/export and CMS editing walkthrough.

Credentials and account owners were not supplied by Q26. The questionnaire’s request for assistance is recorded; this procedure is prepared, but account transfer and training are not completed. Keep secrets out of the public repository and review pack.
