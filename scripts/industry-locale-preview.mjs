import { readFileSync } from 'node:fs';

const copy = readFileSync(new URL('../src/lib/i18n/industry-copy.json', import.meta.url), 'utf8');
if (copy.includes('$translation$')) throw new Error('Unexpected SQL delimiter in industry copy');

// Pipe the generated SQL to psql on the isolated translation preview.
process.stdout.write(`
BEGIN;
DO $guard$
BEGIN
  IF current_database() <> 'enerqa_translation_preview' THEN
    RAISE EXCEPTION 'Industry localization requires the isolated translation preview database';
  END IF;
END $guard$;
SET LOCAL ROLE enerqa_translation_preview;

CREATE TABLE IF NOT EXISTS industries_locales (
  id serial PRIMARY KEY,
  _locale _locales NOT NULL,
  _parent_id integer NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
  title varchar, hero_narrative varchar, cta_text varchar, lifecycle_narrative varchar,
  meta_title varchar, meta_description varchar, meta_keywords varchar,
  UNIQUE (_locale, _parent_id)
);

CREATE TEMP TABLE industry_copy ON COMMIT DROP AS
SELECT key AS slug, value AS copy FROM jsonb_each($translation$${copy}$translation$::jsonb);

DO $coverage$
BEGIN
  IF (SELECT count(*) FROM industry_copy JOIN industries USING (slug)) <> (SELECT count(*) FROM industries) THEN
    RAISE EXCEPTION 'Industry slugs do not match the preview CMS';
  END IF;
END $coverage$;

-- Keep existing translations and editor changes if this script is run again.
INSERT INTO industries_locales (
  _locale, _parent_id, title, hero_narrative, cta_text, lifecycle_narrative,
  meta_title, meta_description, meta_keywords
)
SELECT 'en', id, title, hero_narrative, cta_text, lifecycle_narrative,
  meta_title, meta_description, meta_keywords
FROM industries ON CONFLICT (_locale, _parent_id) DO NOTHING;

INSERT INTO industries_locales (
  _locale, _parent_id, title, hero_narrative, cta_text, lifecycle_narrative,
  meta_title, meta_description
)
SELECT 'ar', i.id, a.copy->>'title', a.copy->>'introduction', 'ناقش مشروعك معنا',
  a.copy->>'lifecycle', a.copy->>'title', a.copy->>'description'
FROM industries i JOIN industry_copy a USING (slug)
ON CONFLICT (_locale, _parent_id) DO NOTHING;

-- Retain the legacy English columns while letting new rows use localized fields.
ALTER TABLE industries ALTER COLUMN title DROP NOT NULL, ALTER COLUMN hero_narrative DROP NOT NULL;

SELECT _locale, count(*) AS industries FROM industries_locales GROUP BY _locale ORDER BY _locale;
COMMIT;
`);
