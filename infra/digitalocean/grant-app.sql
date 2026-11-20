-- Allow only the private application role to use the restored connector tables.
GRANT USAGE ON SCHEMA public, enerqa_connectors TO enerqa;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public, enerqa_connectors TO enerqa;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public, enerqa_connectors TO enerqa;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['access_checks', 'external_records', 'provider_requests'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'enerqa_connectors' AND tablename = table_name AND policyname = 'enerqa_app_access'
    ) THEN
      EXECUTE format('CREATE POLICY enerqa_app_access ON enerqa_connectors.%I TO enerqa USING (true) WITH CHECK (true)', table_name);
    END IF;
  END LOOP;
END $$;
