import { readFileSync } from 'node:fs';

const translations = JSON.parse(readFileSync(new URL('../src/lib/i18n/domain-copy.json', import.meta.url), 'utf8'));
const payload = JSON.stringify(translations);
if (payload.includes('$translation$')) throw new Error('Unexpected SQL delimiter in domain copy');

// Pass the generated SQL to psql connected to the isolated preview.
process.stdout.write(`
BEGIN;
DO $guard$
BEGIN
  IF current_database() <> 'enerqa_translation_preview' THEN
    RAISE EXCEPTION 'Domain localization requires the isolated translation preview database';
  END IF;
END $guard$;
SET LOCAL ROLE enerqa_translation_preview;

CREATE TABLE IF NOT EXISTS domains_locales (
  id serial PRIMARY KEY,
  _locale _locales NOT NULL,
  _parent_id integer NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  title varchar, hero_narrative varchar, cta_text varchar,
  lifecycle_narrative varchar, topic_phrase varchar,
  policy_updates_heading varchar, policy_updates_narrative varchar, policy_updates_source_note varchar,
  meta_title varchar, meta_description varchar,
  UNIQUE (_locale, _parent_id)
);
CREATE TABLE IF NOT EXISTS capabilities_locales (
  id serial PRIMARY KEY,
  _locale _locales NOT NULL,
  _parent_id integer NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  heading varchar, narrative varchar,
  UNIQUE (_locale, _parent_id)
);

CREATE TEMP TABLE domain_copy ON COMMIT DROP AS
SELECT key AS slug, value AS copy FROM jsonb_each($translation$${payload}$translation$::jsonb);

DO $coverage$
BEGIN
  IF (SELECT count(*) FROM domain_copy JOIN domains USING (slug)) <> (SELECT count(*) FROM domains)
    OR (SELECT count(*) FROM capabilities c JOIN domains d ON d.id = c.domain_id
        JOIN domain_copy a ON a.slug = d.slug WHERE a.copy->'capabilities' ? c.slug) <> (SELECT count(*) FROM capabilities) THEN
    RAISE EXCEPTION 'Domain or capability slugs do not match the preview CMS';
  END IF;
END $coverage$;

-- Preserve English and all shared fields. Re-running leaves existing locale edits intact.
INSERT INTO domains_locales (
  _locale, _parent_id, title, hero_narrative, cta_text, lifecycle_narrative, topic_phrase,
  policy_updates_heading, policy_updates_narrative, policy_updates_source_note, meta_title, meta_description
)
SELECT 'en', id, title, hero_narrative, cta_text, lifecycle_narrative, topic_phrase,
  policy_updates_heading, policy_updates_narrative, policy_updates_source_note, meta_title, meta_description
FROM domains ON CONFLICT (_locale, _parent_id) DO NOTHING;

INSERT INTO capabilities_locales (_locale, _parent_id, heading, narrative)
SELECT 'en', id, heading, narrative FROM capabilities ON CONFLICT (_locale, _parent_id) DO NOTHING;

INSERT INTO domains_locales (
  _locale, _parent_id, title, hero_narrative, cta_text, lifecycle_narrative, topic_phrase,
  policy_updates_heading, policy_updates_narrative, policy_updates_source_note, meta_title, meta_description
)
SELECT 'ar', d.id, a.copy->>'title', a.copy->>'introduction', 'ناقش مشروعك',
  a.copy->>'lifecycle', a.copy->>'topic', a.copy->>'policyHeading',
  CASE WHEN d.policy_updates_narrative IS NOT NULL THEN
    'تابع التقارير والمستجدات المتعلقة بهذا المجال من مصادرها الأصلية، مع توضيح الجهة الناشرة ونوع الوثيقة وتاريخ النشر.'
  END,
  a.copy->>'sourceNote', a.copy->>'title', a.copy->>'metaDescription'
FROM domains d JOIN domain_copy a USING (slug) ON CONFLICT (_locale, _parent_id) DO NOTHING;

INSERT INTO capabilities_locales (_locale, _parent_id, heading, narrative)
SELECT 'ar', c.id, a.copy->'capabilities'->c.slug->>'heading', a.copy->'capabilities'->c.slug->>'narrative'
FROM capabilities c JOIN domains d ON d.id = c.domain_id JOIN domain_copy a ON a.slug = d.slug
ON CONFLICT (_locale, _parent_id) DO NOTHING;

-- Keep the legacy values as a backup while allowing new rows to use locale fields.
ALTER TABLE domains ALTER COLUMN title DROP NOT NULL, ALTER COLUMN hero_narrative DROP NOT NULL;
ALTER TABLE capabilities ALTER COLUMN heading DROP NOT NULL, ALTER COLUMN narrative DROP NOT NULL;

SELECT _locale, count(*) AS domains FROM domains_locales GROUP BY _locale ORDER BY _locale;
SELECT _locale, count(*) AS capabilities FROM capabilities_locales GROUP BY _locale ORDER BY _locale;
COMMIT;
`);
