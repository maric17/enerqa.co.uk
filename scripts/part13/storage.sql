-- Isolate operational storage from Payload schema-push and Supabase public APIs.
CREATE SCHEMA IF NOT EXISTS enerqa_connectors;
DO $$ BEGIN
  IF to_regclass('public.enerqa_provider_requests') IS NOT NULL AND to_regclass('enerqa_connectors.provider_requests') IS NULL THEN
    ALTER TABLE public.enerqa_provider_requests SET SCHEMA enerqa_connectors;
    ALTER TABLE enerqa_connectors.enerqa_provider_requests RENAME TO provider_requests;
  END IF;
  IF to_regclass('public.enerqa_external_records') IS NOT NULL AND to_regclass('enerqa_connectors.external_records') IS NULL THEN
    ALTER TABLE public.enerqa_external_records SET SCHEMA enerqa_connectors;
    ALTER TABLE enerqa_connectors.enerqa_external_records RENAME TO external_records;
  END IF;
  IF to_regclass('public.enerqa_access_checks') IS NOT NULL AND to_regclass('enerqa_connectors.access_checks') IS NULL THEN
    ALTER TABLE public.enerqa_access_checks SET SCHEMA enerqa_connectors;
    ALTER TABLE enerqa_connectors.enerqa_access_checks RENAME TO access_checks;
  END IF;
END $$;
-- Dedicated operational tables: existing CMS content and schema are untouched.
CREATE TABLE IF NOT EXISTS enerqa_connectors.provider_requests (
  provider text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS provider_requests_time ON enerqa_connectors.provider_requests(provider, requested_at);
CREATE TABLE IF NOT EXISTS enerqa_connectors.external_records (
  provider text NOT NULL,
  source_id text NOT NULL,
  destination text NOT NULL,
  access_status text NOT NULL,
  access_checked_at timestamptz,
  retrieved_at timestamptz NOT NULL,
  record jsonb NOT NULL,
  PRIMARY KEY (provider, source_id)
);
-- These tables contain internal evidence, not a public Supabase endpoint.
ALTER TABLE enerqa_connectors.provider_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE enerqa_connectors.external_records ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS enerqa_connectors.access_checks (
  url text PRIMARY KEY,
  verdict jsonb NOT NULL,
  expires_at timestamptz NOT NULL
);
ALTER TABLE enerqa_connectors.access_checks ENABLE ROW LEVEL SECURITY;
