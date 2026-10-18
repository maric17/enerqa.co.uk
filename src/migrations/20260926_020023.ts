import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_datasets_status" AS ENUM('draft', 'verified_open');
  CREATE TYPE "public"."enum_dashboards_dataset_connector" AS ENUM('wb-api', 'climate-trace');
  ALTER TYPE "public"."enum_tools_access" ADD VALUE 'Download Available';
  ALTER TYPE "public"."enum_tools_access" ADD VALUE 'Online Tool';
  ALTER TYPE "public"."enum_tools_access" ADD VALUE 'Client Only';
  ALTER TYPE "public"."enum_tools_access" ADD VALUE 'In Development';
  ALTER TYPE "public"."enum_datasets_access_status" ADD VALUE 'verified_open' BEFORE 'free';
  ALTER TYPE "public"."enum_datasets_access_status" ADD VALUE 'unknown' BEFORE 'free';
  ALTER TYPE "public"."enum_datasets_access_status" ADD VALUE 'gated' BEFORE 'free';
  ALTER TYPE "public"."enum_datasets_access_status" ADD VALUE 'broken' BEFORE 'free';
  ALTER TYPE "public"."enum_datasets_access_status" ADD VALUE 'embargoed' BEFORE 'free';
  CREATE TABLE "industries_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"capabilities_id" integer
  );
  
  CREATE TABLE "capabilities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"narrative" varchar NOT NULL,
  	"domain_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "policies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "domains_capabilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "industries_work_areas" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "domains_capabilities" CASCADE;
  DROP TABLE "industries_work_areas" CASCADE;
  ALTER TABLE "tools" ALTER COLUMN "image_id" DROP NOT NULL;
  ALTER TABLE "publications_rels" ADD COLUMN "domains_id" integer;
  ALTER TABLE "publications_rels" ADD COLUMN "industries_id" integer;
  ALTER TABLE "tools" ADD COLUMN "validated" boolean DEFAULT false;
  ALTER TABLE "tools" ADD COLUMN "assumptions" jsonb;
  ALTER TABLE "tools_rels" ADD COLUMN "domains_id" integer;
  ALTER TABLE "domains" ADD COLUMN "lifecycle_narrative" varchar;
  ALTER TABLE "domains" ADD COLUMN "topic_phrase" varchar;
  ALTER TABLE "domains_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "domains_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "datasets" ADD COLUMN "source_release_date" timestamp(3) with time zone;
  ALTER TABLE "datasets" ADD COLUMN "frequency" varchar;
  ALTER TABLE "datasets" ADD COLUMN "format" varchar;
  ALTER TABLE "datasets" ADD COLUMN "modification_permission" boolean;
  ALTER TABLE "datasets" ADD COLUMN "status" "enum_datasets_status" DEFAULT 'draft';
  ALTER TABLE "datasets_rels" ADD COLUMN "domains_id" integer;
  ALTER TABLE "datasets_rels" ADD COLUMN "industries_id" integer;
  ALTER TABLE "dashboards" ADD COLUMN "dataset_connector" "enum_dashboards_dataset_connector";
  ALTER TABLE "enquiries" ADD COLUMN "domain_id" integer;
  ALTER TABLE "enquiries" ADD COLUMN "industry_id" integer;
  ALTER TABLE "enquiries" ADD COLUMN "project_location" varchar;
  ALTER TABLE "enquiries" ADD COLUMN "current_stage" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "policies_id" integer;
  ALTER TABLE "industries_rels" ADD CONSTRAINT "industries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_rels" ADD CONSTRAINT "industries_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "capabilities" ADD CONSTRAINT "capabilities_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "industries_rels_order_idx" ON "industries_rels" USING btree ("order");
  CREATE INDEX "industries_rels_parent_idx" ON "industries_rels" USING btree ("parent_id");
  CREATE INDEX "industries_rels_path_idx" ON "industries_rels" USING btree ("path");
  CREATE INDEX "industries_rels_capabilities_id_idx" ON "industries_rels" USING btree ("capabilities_id");
  CREATE INDEX "capabilities_domain_idx" ON "capabilities" USING btree ("domain_id");
  CREATE INDEX "capabilities_updated_at_idx" ON "capabilities" USING btree ("updated_at");
  CREATE INDEX "capabilities_created_at_idx" ON "capabilities" USING btree ("created_at");
  CREATE UNIQUE INDEX "policies_slug_idx" ON "policies" USING btree ("slug");
  CREATE INDEX "policies_updated_at_idx" ON "policies" USING btree ("updated_at");
  CREATE INDEX "policies_created_at_idx" ON "policies" USING btree ("created_at");
  ALTER TABLE "publications_rels" ADD CONSTRAINT "publications_rels_domains_fk" FOREIGN KEY ("domains_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publications_rels" ADD CONSTRAINT "publications_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_rels" ADD CONSTRAINT "tools_rels_domains_fk" FOREIGN KEY ("domains_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "domains_rels" ADD CONSTRAINT "domains_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "domains_rels" ADD CONSTRAINT "domains_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datasets_rels" ADD CONSTRAINT "datasets_rels_domains_fk" FOREIGN KEY ("domains_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datasets_rels" ADD CONSTRAINT "datasets_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_policies_fk" FOREIGN KEY ("policies_id") REFERENCES "public"."policies"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "publications_rels_domains_id_idx" ON "publications_rels" USING btree ("domains_id");
  CREATE INDEX "publications_rels_industries_id_idx" ON "publications_rels" USING btree ("industries_id");
  CREATE INDEX "tools_rels_domains_id_idx" ON "tools_rels" USING btree ("domains_id");
  CREATE INDEX "domains_rels_capabilities_id_idx" ON "domains_rels" USING btree ("capabilities_id");
  CREATE INDEX "domains_rels_categories_id_idx" ON "domains_rels" USING btree ("categories_id");
  CREATE INDEX "datasets_rels_domains_id_idx" ON "datasets_rels" USING btree ("domains_id");
  CREATE INDEX "datasets_rels_industries_id_idx" ON "datasets_rels" USING btree ("industries_id");
  CREATE INDEX "enquiries_domain_idx" ON "enquiries" USING btree ("domain_id");
  CREATE INDEX "enquiries_industry_idx" ON "enquiries" USING btree ("industry_id");
  CREATE INDEX "payload_locked_documents_rels_capabilities_id_idx" ON "payload_locked_documents_rels" USING btree ("capabilities_id");
  CREATE INDEX "payload_locked_documents_rels_policies_id_idx" ON "payload_locked_documents_rels" USING btree ("policies_id");
  ALTER TABLE "dashboards" DROP COLUMN "embed_url";
  ALTER TABLE "knowledge_hub_config_locales" DROP COLUMN "learning_materials_eyebrow";
  ALTER TABLE "knowledge_hub_config_locales" DROP COLUMN "learning_materials_eyebrow_ar";
  ALTER TABLE "knowledge_hub_config_locales" DROP COLUMN "glossary_eyebrow";
  ALTER TABLE "knowledge_hub_config_locales" DROP COLUMN "glossary_eyebrow_ar";
  ALTER TABLE "knowledge_hub_config_locales" DROP COLUMN "glossary_title";
  ALTER TABLE "knowledge_hub_config_locales" DROP COLUMN "glossary_title_ar";
  ALTER TABLE "knowledge_hub_config_locales" DROP COLUMN "glossary_description";
  ALTER TABLE "knowledge_hub_config_locales" DROP COLUMN "glossary_description_ar";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "domains_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"narrative" varchar NOT NULL
  );
  
  CREATE TABLE "industries_work_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  ALTER TABLE "industries_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "capabilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "policies" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "industries_rels" CASCADE;
  DROP TABLE "capabilities" CASCADE;
  DROP TABLE "policies" CASCADE;
  ALTER TABLE "publications_rels" DROP CONSTRAINT "publications_rels_domains_fk";
  
  ALTER TABLE "publications_rels" DROP CONSTRAINT "publications_rels_industries_fk";
  
  ALTER TABLE "tools_rels" DROP CONSTRAINT "tools_rels_domains_fk";
  
  ALTER TABLE "domains_rels" DROP CONSTRAINT "domains_rels_capabilities_fk";
  
  ALTER TABLE "domains_rels" DROP CONSTRAINT "domains_rels_categories_fk";
  
  ALTER TABLE "datasets_rels" DROP CONSTRAINT "datasets_rels_domains_fk";
  
  ALTER TABLE "datasets_rels" DROP CONSTRAINT "datasets_rels_industries_fk";
  
  ALTER TABLE "enquiries" DROP CONSTRAINT "enquiries_domain_id_domains_id_fk";
  
  ALTER TABLE "enquiries" DROP CONSTRAINT "enquiries_industry_id_industries_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_capabilities_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_policies_fk";
  
  ALTER TABLE "tools" ALTER COLUMN "access" SET DATA TYPE text;
  ALTER TABLE "tools" ALTER COLUMN "access" SET DEFAULT 'Request Access'::text;
  DROP TYPE "public"."enum_tools_access";
  CREATE TYPE "public"."enum_tools_access" AS ENUM('Request Access', 'Public', 'Enterprise');
  ALTER TABLE "tools" ALTER COLUMN "access" SET DEFAULT 'Request Access'::"public"."enum_tools_access";
  ALTER TABLE "tools" ALTER COLUMN "access" SET DATA TYPE "public"."enum_tools_access" USING "access"::"public"."enum_tools_access";
  ALTER TABLE "datasets" ALTER COLUMN "access_status" SET DATA TYPE text;
  DROP TYPE "public"."enum_datasets_access_status";
  CREATE TYPE "public"."enum_datasets_access_status" AS ENUM('free', 'restricted');
  ALTER TABLE "datasets" ALTER COLUMN "access_status" SET DATA TYPE "public"."enum_datasets_access_status" USING "access_status"::"public"."enum_datasets_access_status";
  DROP INDEX "publications_rels_domains_id_idx";
  DROP INDEX "publications_rels_industries_id_idx";
  DROP INDEX "tools_rels_domains_id_idx";
  DROP INDEX "domains_rels_capabilities_id_idx";
  DROP INDEX "domains_rels_categories_id_idx";
  DROP INDEX "datasets_rels_domains_id_idx";
  DROP INDEX "datasets_rels_industries_id_idx";
  DROP INDEX "enquiries_domain_idx";
  DROP INDEX "enquiries_industry_idx";
  DROP INDEX "payload_locked_documents_rels_capabilities_id_idx";
  DROP INDEX "payload_locked_documents_rels_policies_id_idx";
  ALTER TABLE "tools" ALTER COLUMN "image_id" SET NOT NULL;
  ALTER TABLE "dashboards" ADD COLUMN "embed_url" varchar NOT NULL;
  ALTER TABLE "knowledge_hub_config_locales" ADD COLUMN "learning_materials_eyebrow" varchar DEFAULT 'Learning Materials' NOT NULL;
  ALTER TABLE "knowledge_hub_config_locales" ADD COLUMN "learning_materials_eyebrow_ar" varchar DEFAULT 'مواد تعليمية' NOT NULL;
  ALTER TABLE "knowledge_hub_config_locales" ADD COLUMN "glossary_eyebrow" varchar DEFAULT 'Glossary of Terms' NOT NULL;
  ALTER TABLE "knowledge_hub_config_locales" ADD COLUMN "glossary_eyebrow_ar" varchar DEFAULT 'مسرد المصطلحات' NOT NULL;
  ALTER TABLE "knowledge_hub_config_locales" ADD COLUMN "glossary_title" varchar DEFAULT 'Climate & Sustainability Dictionary' NOT NULL;
  ALTER TABLE "knowledge_hub_config_locales" ADD COLUMN "glossary_title_ar" varchar;
  ALTER TABLE "knowledge_hub_config_locales" ADD COLUMN "glossary_description" varchar DEFAULT 'Explore definitions for technical jargon, acronyms, and key concepts used throughout the portal.' NOT NULL;
  ALTER TABLE "knowledge_hub_config_locales" ADD COLUMN "glossary_description_ar" varchar;
  ALTER TABLE "domains_capabilities" ADD CONSTRAINT "domains_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_work_areas" ADD CONSTRAINT "industries_work_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "domains_capabilities_order_idx" ON "domains_capabilities" USING btree ("_order");
  CREATE INDEX "domains_capabilities_parent_id_idx" ON "domains_capabilities" USING btree ("_parent_id");
  CREATE INDEX "industries_work_areas_order_idx" ON "industries_work_areas" USING btree ("_order");
  CREATE INDEX "industries_work_areas_parent_id_idx" ON "industries_work_areas" USING btree ("_parent_id");
  ALTER TABLE "publications_rels" DROP COLUMN "domains_id";
  ALTER TABLE "publications_rels" DROP COLUMN "industries_id";
  ALTER TABLE "tools" DROP COLUMN "validated";
  ALTER TABLE "tools" DROP COLUMN "assumptions";
  ALTER TABLE "tools_rels" DROP COLUMN "domains_id";
  ALTER TABLE "domains" DROP COLUMN "lifecycle_narrative";
  ALTER TABLE "domains" DROP COLUMN "topic_phrase";
  ALTER TABLE "domains_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "domains_rels" DROP COLUMN "categories_id";
  ALTER TABLE "datasets" DROP COLUMN "source_release_date";
  ALTER TABLE "datasets" DROP COLUMN "frequency";
  ALTER TABLE "datasets" DROP COLUMN "format";
  ALTER TABLE "datasets" DROP COLUMN "modification_permission";
  ALTER TABLE "datasets" DROP COLUMN "status";
  ALTER TABLE "datasets_rels" DROP COLUMN "domains_id";
  ALTER TABLE "datasets_rels" DROP COLUMN "industries_id";
  ALTER TABLE "dashboards" DROP COLUMN "dataset_connector";
  ALTER TABLE "enquiries" DROP COLUMN "domain_id";
  ALTER TABLE "enquiries" DROP COLUMN "industry_id";
  ALTER TABLE "enquiries" DROP COLUMN "project_location";
  ALTER TABLE "enquiries" DROP COLUMN "current_stage";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "policies_id";
  DROP TYPE "public"."enum_datasets_status";
  DROP TYPE "public"."enum_dashboards_dataset_connector";`)
}
