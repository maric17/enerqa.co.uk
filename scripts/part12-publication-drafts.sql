-- Generated from the installed Payload schema; reviewed 1 October 2026.
-- Add draft/version storage; preserve every existing publication field and row.
CREATE TYPE "public"."enum_publications_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."enum__publications_v_version_type" AS ENUM('White Paper', 'Article', 'Research', 'Conference Paper');
CREATE TYPE "public"."enum__publications_v_version_language" AS ENUM('en', 'ar');
CREATE TYPE "public"."enum__publications_v_version_archive_category" AS ENUM('climate-science-and-impacts', 'energy-technology-and-finance', 'environment-and-society', 'frameworks-and-methodologies');
CREATE TYPE "public"."enum__publications_v_version_record_kind" AS ENUM('article', 'category-heading', 'biography');
CREATE TYPE "public"."enum__publications_v_version_bg_gradient_type" AS ENUM('Green', 'Red', 'Blue', 'Dark');
CREATE TYPE "public"."enum__publications_v_version_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."enum__publications_v_published_locale" AS ENUM('en', 'ar');
CREATE TABLE "_publications_v" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"version_title" varchar,
	"version_slug" varchar,
	"version_heading" varchar,
	"version_excerpt" varchar,
	"version_content" jsonb,
	"version_citation" varchar,
	"version_original_url" varchar,
	"version_meta_title" varchar,
	"version_meta_description" varchar,
	"version_meta_keywords" varchar,
	"version_og_image_id" integer,
	"version_type" "enum__publications_v_version_type",
	"version_author" varchar,
	"version_language" "enum__publications_v_version_language" DEFAULT 'en',
	"version_archive_category" "enum__publications_v_version_archive_category",
	"version_record_kind" "enum__publications_v_version_record_kind" DEFAULT 'article',
	"version_date_verified" boolean DEFAULT false,
	"version_date" timestamp(3) with time zone,
	"version_file_id" integer,
	"version_bg_gradient_type" "enum__publications_v_version_bg_gradient_type",
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__publications_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__publications_v_published_locale",
	"latest" boolean
);

CREATE TABLE "_publications_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"categories_id" integer,
	"domains_id" integer,
	"industries_id" integer,
	"datasets_id" integer,
	"tools_id" integer
);

ALTER TABLE "publications" ALTER COLUMN "title" DROP NOT NULL;
ALTER TABLE "publications" ALTER COLUMN "slug" DROP NOT NULL;
ALTER TABLE "publications" ALTER COLUMN "heading" DROP NOT NULL;
ALTER TABLE "publications" ALTER COLUMN "excerpt" DROP NOT NULL;
ALTER TABLE "publications" ALTER COLUMN "type" DROP NOT NULL;
ALTER TABLE "publications" ALTER COLUMN "record_kind" DROP NOT NULL;
ALTER TABLE "publications" ALTER COLUMN "date" DROP NOT NULL;
ALTER TABLE "publications" ALTER COLUMN "bg_gradient_type" DROP NOT NULL;
ALTER TABLE "publications" ADD COLUMN "_status" "enum_publications_status" DEFAULT 'draft';
ALTER TABLE "_publications_v" ADD CONSTRAINT "_publications_v_parent_id_publications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."publications"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_publications_v" ADD CONSTRAINT "_publications_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_publications_v" ADD CONSTRAINT "_publications_v_version_file_id_media_id_fk" FOREIGN KEY ("version_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_publications_v_rels" ADD CONSTRAINT "_publications_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_publications_v"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_publications_v_rels" ADD CONSTRAINT "_publications_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_publications_v_rels" ADD CONSTRAINT "_publications_v_rels_domains_fk" FOREIGN KEY ("domains_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_publications_v_rels" ADD CONSTRAINT "_publications_v_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_publications_v_rels" ADD CONSTRAINT "_publications_v_rels_datasets_fk" FOREIGN KEY ("datasets_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_publications_v_rels" ADD CONSTRAINT "_publications_v_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "_publications_v_parent_idx" ON "_publications_v" USING btree ("parent_id");
CREATE INDEX "_publications_v_version_version_slug_idx" ON "_publications_v" USING btree ("version_slug");
CREATE INDEX "_publications_v_version_version_og_image_idx" ON "_publications_v" USING btree ("version_og_image_id");
CREATE INDEX "_publications_v_version_version_file_idx" ON "_publications_v" USING btree ("version_file_id");
CREATE INDEX "_publications_v_version_version_updated_at_idx" ON "_publications_v" USING btree ("version_updated_at");
CREATE INDEX "_publications_v_version_version_created_at_idx" ON "_publications_v" USING btree ("version_created_at");
CREATE INDEX "_publications_v_version_version__status_idx" ON "_publications_v" USING btree ("version__status");
CREATE INDEX "_publications_v_created_at_idx" ON "_publications_v" USING btree ("created_at");
CREATE INDEX "_publications_v_updated_at_idx" ON "_publications_v" USING btree ("updated_at");
CREATE INDEX "_publications_v_snapshot_idx" ON "_publications_v" USING btree ("snapshot");
CREATE INDEX "_publications_v_published_locale_idx" ON "_publications_v" USING btree ("published_locale");
CREATE INDEX "_publications_v_latest_idx" ON "_publications_v" USING btree ("latest");
CREATE INDEX "_publications_v_rels_order_idx" ON "_publications_v_rels" USING btree ("order");
CREATE INDEX "_publications_v_rels_parent_idx" ON "_publications_v_rels" USING btree ("parent_id");
CREATE INDEX "_publications_v_rels_path_idx" ON "_publications_v_rels" USING btree ("path");
CREATE INDEX "_publications_v_rels_categories_id_idx" ON "_publications_v_rels" USING btree ("categories_id");
CREATE INDEX "_publications_v_rels_domains_id_idx" ON "_publications_v_rels" USING btree ("domains_id");
CREATE INDEX "_publications_v_rels_industries_id_idx" ON "_publications_v_rels" USING btree ("industries_id");
CREATE INDEX "_publications_v_rels_datasets_id_idx" ON "_publications_v_rels" USING btree ("datasets_id");
CREATE INDEX "_publications_v_rels_tools_id_idx" ON "_publications_v_rels" USING btree ("tools_id");
CREATE INDEX "publications__status_idx" ON "publications" USING btree ("_status");
