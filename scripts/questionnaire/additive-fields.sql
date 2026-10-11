-- Reviewed, additive columns only. Do not run the historical Payload migrations.
-- Apply after connectivity is restored, before enabling the forms maintenance job.
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS last_substantive_contact_at timestamptz;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS retention_hold_reason text;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS retention_hold_until timestamptz;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS notification_sent_at timestamptz;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS newsletter_synced_at timestamptz;
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS policy_version varchar;
