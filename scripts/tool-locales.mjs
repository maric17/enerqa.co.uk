import { readFileSync } from 'node:fs';

const databases = {
  preview: 'enerqa_translation_preview',
  production: 'enerqa_production',
};
const target = process.argv[2];
if (!Object.hasOwn(databases, target)) throw new Error('Choose preview or production.');
const database = databases[target];
const copy = readFileSync(new URL('../src/lib/i18n/tool-copy.json', import.meta.url), 'utf8');
if (copy.includes('$translation$')) throw new Error('Unexpected SQL delimiter in tool copy');

// Pipe to psql with ON_ERROR_STOP after backing up the chosen database.
process.stdout.write(`
BEGIN;
SET LOCAL lock_timeout = '5s';
DO $guard$
BEGIN
  IF current_database() <> '${database}' THEN
    RAISE EXCEPTION 'Unexpected database for the Tools localization update';
  END IF;
END $guard$;

CREATE TABLE IF NOT EXISTS tools_locales (
  id serial PRIMARY KEY,
  _locale _locales NOT NULL,
  _parent_id integer NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  title varchar, "desc" varchar, category varchar, licence varchar,
  purpose jsonb, inputs jsonb, outputs jsonb, method jsonb,
  assumptions jsonb, privacy jsonb, system_requirements jsonb,
  UNIQUE (_locale, _parent_id)
);

CREATE FUNCTION pg_temp.translate_tool_text(source jsonb, dictionary jsonb)
RETURNS jsonb LANGUAGE sql IMMUTABLE STRICT AS $function$
  SELECT CASE jsonb_typeof(source)
    WHEN 'array' THEN (
      SELECT coalesce(jsonb_agg(pg_temp.translate_tool_text(entry, dictionary) ORDER BY position), '[]')
      FROM jsonb_array_elements(source) WITH ORDINALITY AS entries(entry, position)
    )
    WHEN 'object' THEN (
      SELECT coalesce(jsonb_object_agg(key, CASE
        WHEN key = 'text' AND jsonb_typeof(entry) = 'string'
          THEN coalesce(dictionary->(entry #>> '{}'), entry)
        WHEN key = 'direction' AND entry = '"ltr"'::jsonb THEN '"rtl"'::jsonb
        ELSE pg_temp.translate_tool_text(entry, dictionary)
      END), '{}')
      FROM jsonb_each(source) AS entries(key, entry)
    )
    ELSE source
  END;
$function$;

INSERT INTO tools_locales (
  _locale, _parent_id, title, "desc", category, licence, purpose, inputs, outputs,
  method, assumptions, privacy, system_requirements
)
SELECT 'en', id, title, "desc", category, licence, purpose, inputs, outputs,
  method, assumptions, privacy, system_requirements
FROM tools ON CONFLICT (_locale, _parent_id) DO NOTHING;

-- Preserve the English source, editor formatting, links, and existing Arabic edits.
WITH translation AS (SELECT $translation$${copy}$translation$::jsonb AS copy)
INSERT INTO tools_locales (
  _locale, _parent_id, title, "desc", category, licence, purpose, inputs, outputs,
  method, assumptions, privacy, system_requirements
)
SELECT 'ar', t.id, coalesce(c.copy->>t.title, t.title), c.copy->>t."desc", c.copy->>t.category,
  coalesce(c.copy->>t.licence, t.licence),
  pg_temp.translate_tool_text(t.purpose, c.copy), pg_temp.translate_tool_text(t.inputs, c.copy),
  pg_temp.translate_tool_text(t.outputs, c.copy), pg_temp.translate_tool_text(t.method, c.copy),
  pg_temp.translate_tool_text(t.assumptions, c.copy), pg_temp.translate_tool_text(t.privacy, c.copy),
  pg_temp.translate_tool_text(t.system_requirements, c.copy)
FROM tools t CROSS JOIN translation c
WHERE c.copy ? t."desc" AND c.copy ? t.category
ON CONFLICT (_locale, _parent_id) DO NOTHING;

DO $verify$
BEGIN
  IF EXISTS (
    SELECT 1 FROM tools t
    LEFT JOIN tools_locales en ON en._parent_id = t.id AND en._locale = 'en'
    LEFT JOIN tools_locales ar ON ar._parent_id = t.id AND ar._locale = 'ar'
    WHERE en.title IS NULL OR ar.title IS NULL OR ar."desc" IS NULL OR ar.category IS NULL
  ) THEN
    RAISE EXCEPTION 'Tools translations do not cover the existing records';
  END IF;
END $verify$;

-- Payload inserts the shared record before its locale rows.
ALTER TABLE tools ALTER COLUMN title DROP NOT NULL, ALTER COLUMN "desc" DROP NOT NULL,
  ALTER COLUMN category DROP NOT NULL;
${target === 'production'
  ? `GRANT SELECT, INSERT, UPDATE, DELETE ON tools_locales TO enerqa;
GRANT USAGE, SELECT ON SEQUENCE tools_locales_id_seq TO enerqa;
GRANT SELECT ON tools_locales TO enerqa_ci_build;`
  : `GRANT SELECT, INSERT, UPDATE, DELETE ON tools_locales TO enerqa_translation_preview;
GRANT USAGE, SELECT ON SEQUENCE tools_locales_id_seq TO enerqa_translation_preview;`}

SELECT _locale, count(*) AS tools FROM tools_locales GROUP BY _locale ORDER BY _locale;
COMMIT;
`);
