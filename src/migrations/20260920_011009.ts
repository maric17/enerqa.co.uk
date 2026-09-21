import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_publications_type" AS ENUM('White Paper', 'Article', 'Research', 'Conference Paper');
  CREATE TYPE "public"."enum_publications_language" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_publications_archive_category" AS ENUM('climate-science-and-impacts', 'energy-technology-and-finance', 'environment-and-society', 'frameworks-and-methodologies');
  CREATE TYPE "public"."enum_publications_record_kind" AS ENUM('article', 'category-heading', 'biography');
  CREATE TYPE "public"."enum_publications_bg_gradient_type" AS ENUM('Green', 'Red', 'Blue', 'Dark');
  CREATE TYPE "public"."enum_tools_type" AS ENUM('interactive', 'informational');
  CREATE TYPE "public"."enum_tools_access" AS ENUM('Request Access', 'Public', 'Enterprise');
  CREATE TYPE "public"."enum_datasets_access_status" AS ENUM('free', 'restricted');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "publications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"heading" varchar NOT NULL,
  	"excerpt" varchar NOT NULL,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_keywords" varchar,
  	"og_image_id" integer,
  	"type" "enum_publications_type" NOT NULL,
  	"author" varchar,
  	"language" "enum_publications_language" DEFAULT 'en',
  	"archive_category" "enum_publications_archive_category",
  	"record_kind" "enum_publications_record_kind" DEFAULT 'article' NOT NULL,
  	"date_verified" boolean DEFAULT false,
  	"date" timestamp(3) with time zone NOT NULL,
  	"file_id" integer,
  	"bg_gradient_type" "enum_publications_bg_gradient_type" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "publications_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "tools" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"category" varchar NOT NULL,
  	"type" "enum_tools_type" DEFAULT 'informational' NOT NULL,
  	"title" varchar NOT NULL,
  	"desc" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"link" varchar,
  	"iframe_url" varchar,
  	"file_id" integer,
  	"version" varchar,
  	"access" "enum_tools_access" DEFAULT 'Request Access',
  	"purpose" jsonb,
  	"inputs" jsonb,
  	"outputs" jsonb,
  	"method" jsonb,
  	"privacy" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tools_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"industries_id" integer
  );
  
  CREATE TABLE "team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"bio" varchar NOT NULL,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "domains_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"narrative" varchar NOT NULL
  );
  
  CREATE TABLE "domains_relevant_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "domains" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"hero_image_id" integer,
  	"hero_narrative" varchar NOT NULL,
  	"cta_text" varchar DEFAULT 'Discuss Your Project',
  	"policy_updates_heading" varchar,
  	"policy_updates_narrative" varchar,
  	"policy_updates_source_note" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "domains_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"industries_id" integer
  );
  
  CREATE TABLE "industries_work_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "industries_relevant_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "industries_data_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"provider" varchar NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "industries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"hero_image_id" integer,
  	"hero_narrative" varchar NOT NULL,
  	"cta_text" varchar,
  	"lifecycle_narrative" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_keywords" varchar,
  	"og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datasets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"file_id" integer,
  	"api_endpoint" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"provider" varchar,
  	"identifier" varchar,
  	"version" varchar,
  	"licence" varchar,
  	"licence_url" varchar,
  	"original_unit" varchar,
  	"geographic_level" varchar,
  	"observation_period" varchar,
  	"retrieval_time" timestamp(3) with time zone,
  	"dataset_download_url" varchar,
  	"access_status" "enum_datasets_access_status",
  	"access_checked_at" timestamp(3) with time zone,
  	"access_evidence" varchar,
  	"corporate_reuse" boolean,
  	"redistribution" boolean,
  	"attribution" varchar,
  	"embed_url" varchar,
  	"citation" varchar,
  	"methodology" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datasets_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"datasets_id" integer
  );
  
  CREATE TABLE "dashboards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"embed_url" varchar NOT NULL,
  	"controls_info" jsonb,
  	"interpretation" jsonb,
  	"external_sources" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "dashboards_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"datasets_id" integer
  );
  
  CREATE TABLE "external_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"provider" varchar NOT NULL,
  	"source" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"type" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"geography" varchar,
  	"access_evidence" varchar,
  	"rights" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "external_items_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"domains_id" integer,
  	"industries_id" integer
  );
  
  CREATE TABLE "glossary" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"term" varchar NOT NULL,
  	"term_ar" varchar,
  	"definition" varchar NOT NULL,
  	"category" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"category" varchar DEFAULT 'General Climate Questions' NOT NULL,
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"company" varchar,
  	"nature_of_enquiry" varchar,
  	"message" varchar,
  	"marketing_consent" boolean DEFAULT false,
  	"tool_requested_id" integer,
  	"source" varchar DEFAULT 'General Enquiry',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"publications_id" integer,
  	"tools_id" integer,
  	"team_id" integer,
  	"categories_id" integer,
  	"authors_id" integer,
  	"domains_id" integer,
  	"industries_id" integer,
  	"datasets_id" integer,
  	"dashboards_id" integer,
  	"external_items_id" integer,
  	"glossary_id" integer,
  	"faqs_id" integer,
  	"enquiries_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "knowledge_hub_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "knowledge_hub_config_locales" (
  	"hero_title" varchar DEFAULT 'A searchable library of our published work and resources.' NOT NULL,
  	"hero_title_ar" varchar DEFAULT 'مكتبة قابلة للبحث لأعمالنا المنشورة ومواردنا.' NOT NULL,
  	"publications_eyebrow" varchar DEFAULT 'Publications & Reports' NOT NULL,
  	"publications_eyebrow_ar" varchar DEFAULT 'المنشورات والتقارير' NOT NULL,
  	"learning_materials_eyebrow" varchar DEFAULT 'Learning Materials' NOT NULL,
  	"learning_materials_eyebrow_ar" varchar DEFAULT 'مواد تعليمية' NOT NULL,
  	"glossary_eyebrow" varchar DEFAULT 'Glossary of Terms' NOT NULL,
  	"glossary_eyebrow_ar" varchar DEFAULT 'مسرد المصطلحات' NOT NULL,
  	"glossary_title" varchar DEFAULT 'Climate & Sustainability Dictionary' NOT NULL,
  	"glossary_title_ar" varchar,
  	"glossary_description" varchar DEFAULT 'Explore definitions for technical jargon, acronyms, and key concepts used throughout the portal.' NOT NULL,
  	"glossary_description_ar" varchar,
  	"faqs_eyebrow" varchar DEFAULT 'Frequently Asked Questions' NOT NULL,
  	"faqs_eyebrow_ar" varchar DEFAULT 'أسئلة مكررة' NOT NULL,
  	"faqs_title" varchar DEFAULT 'Got questions?' NOT NULL,
  	"faqs_title_ar" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "data_portal_sources_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"s01_intro" jsonb,
  	"s02_directory" jsonb,
  	"s03_attribution" jsonb,
  	"s04_understanding" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publications" ADD CONSTRAINT "publications_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "publications" ADD CONSTRAINT "publications_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "publications_rels" ADD CONSTRAINT "publications_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publications_rels" ADD CONSTRAINT "publications_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools" ADD CONSTRAINT "tools_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tools" ADD CONSTRAINT "tools_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tools_rels" ADD CONSTRAINT "tools_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_rels" ADD CONSTRAINT "tools_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "domains_capabilities" ADD CONSTRAINT "domains_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "domains_relevant_tools" ADD CONSTRAINT "domains_relevant_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "domains" ADD CONSTRAINT "domains_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "domains_rels" ADD CONSTRAINT "domains_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "domains_rels" ADD CONSTRAINT "domains_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_work_areas" ADD CONSTRAINT "industries_work_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_relevant_tools" ADD CONSTRAINT "industries_relevant_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_data_sources" ADD CONSTRAINT "industries_data_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries" ADD CONSTRAINT "industries_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "industries" ADD CONSTRAINT "industries_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datasets" ADD CONSTRAINT "datasets_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "datasets_rels" ADD CONSTRAINT "datasets_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datasets_rels" ADD CONSTRAINT "datasets_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datasets_rels" ADD CONSTRAINT "datasets_rels_datasets_fk" FOREIGN KEY ("datasets_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "dashboards_rels" ADD CONSTRAINT "dashboards_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."dashboards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "dashboards_rels" ADD CONSTRAINT "dashboards_rels_datasets_fk" FOREIGN KEY ("datasets_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "external_items_rels" ADD CONSTRAINT "external_items_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."external_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "external_items_rels" ADD CONSTRAINT "external_items_rels_domains_fk" FOREIGN KEY ("domains_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "external_items_rels" ADD CONSTRAINT "external_items_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_tool_requested_id_tools_id_fk" FOREIGN KEY ("tool_requested_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publications_fk" FOREIGN KEY ("publications_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_domains_fk" FOREIGN KEY ("domains_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_datasets_fk" FOREIGN KEY ("datasets_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_dashboards_fk" FOREIGN KEY ("dashboards_id") REFERENCES "public"."dashboards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_external_items_fk" FOREIGN KEY ("external_items_id") REFERENCES "public"."external_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_glossary_fk" FOREIGN KEY ("glossary_id") REFERENCES "public"."glossary"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_hub_config_locales" ADD CONSTRAINT "knowledge_hub_config_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."knowledge_hub_config"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "publications_slug_idx" ON "publications" USING btree ("slug");
  CREATE INDEX "publications_og_image_idx" ON "publications" USING btree ("og_image_id");
  CREATE INDEX "publications_file_idx" ON "publications" USING btree ("file_id");
  CREATE INDEX "publications_updated_at_idx" ON "publications" USING btree ("updated_at");
  CREATE INDEX "publications_created_at_idx" ON "publications" USING btree ("created_at");
  CREATE INDEX "publications_rels_order_idx" ON "publications_rels" USING btree ("order");
  CREATE INDEX "publications_rels_parent_idx" ON "publications_rels" USING btree ("parent_id");
  CREATE INDEX "publications_rels_path_idx" ON "publications_rels" USING btree ("path");
  CREATE INDEX "publications_rels_categories_id_idx" ON "publications_rels" USING btree ("categories_id");
  CREATE UNIQUE INDEX "tools_slug_idx" ON "tools" USING btree ("slug");
  CREATE INDEX "tools_image_idx" ON "tools" USING btree ("image_id");
  CREATE INDEX "tools_file_idx" ON "tools" USING btree ("file_id");
  CREATE INDEX "tools_updated_at_idx" ON "tools" USING btree ("updated_at");
  CREATE INDEX "tools_created_at_idx" ON "tools" USING btree ("created_at");
  CREATE INDEX "tools_rels_order_idx" ON "tools_rels" USING btree ("order");
  CREATE INDEX "tools_rels_parent_idx" ON "tools_rels" USING btree ("parent_id");
  CREATE INDEX "tools_rels_path_idx" ON "tools_rels" USING btree ("path");
  CREATE INDEX "tools_rels_industries_id_idx" ON "tools_rels" USING btree ("industries_id");
  CREATE INDEX "team_image_idx" ON "team" USING btree ("image_id");
  CREATE INDEX "team_updated_at_idx" ON "team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "team" USING btree ("created_at");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE INDEX "domains_capabilities_order_idx" ON "domains_capabilities" USING btree ("_order");
  CREATE INDEX "domains_capabilities_parent_id_idx" ON "domains_capabilities" USING btree ("_parent_id");
  CREATE INDEX "domains_relevant_tools_order_idx" ON "domains_relevant_tools" USING btree ("_order");
  CREATE INDEX "domains_relevant_tools_parent_id_idx" ON "domains_relevant_tools" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "domains_slug_idx" ON "domains" USING btree ("slug");
  CREATE INDEX "domains_hero_image_idx" ON "domains" USING btree ("hero_image_id");
  CREATE INDEX "domains_updated_at_idx" ON "domains" USING btree ("updated_at");
  CREATE INDEX "domains_created_at_idx" ON "domains" USING btree ("created_at");
  CREATE INDEX "domains_rels_order_idx" ON "domains_rels" USING btree ("order");
  CREATE INDEX "domains_rels_parent_idx" ON "domains_rels" USING btree ("parent_id");
  CREATE INDEX "domains_rels_path_idx" ON "domains_rels" USING btree ("path");
  CREATE INDEX "domains_rels_industries_id_idx" ON "domains_rels" USING btree ("industries_id");
  CREATE INDEX "industries_work_areas_order_idx" ON "industries_work_areas" USING btree ("_order");
  CREATE INDEX "industries_work_areas_parent_id_idx" ON "industries_work_areas" USING btree ("_parent_id");
  CREATE INDEX "industries_relevant_tools_order_idx" ON "industries_relevant_tools" USING btree ("_order");
  CREATE INDEX "industries_relevant_tools_parent_id_idx" ON "industries_relevant_tools" USING btree ("_parent_id");
  CREATE INDEX "industries_data_sources_order_idx" ON "industries_data_sources" USING btree ("_order");
  CREATE INDEX "industries_data_sources_parent_id_idx" ON "industries_data_sources" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "industries_slug_idx" ON "industries" USING btree ("slug");
  CREATE INDEX "industries_hero_image_idx" ON "industries" USING btree ("hero_image_id");
  CREATE INDEX "industries_og_image_idx" ON "industries" USING btree ("og_image_id");
  CREATE INDEX "industries_updated_at_idx" ON "industries" USING btree ("updated_at");
  CREATE INDEX "industries_created_at_idx" ON "industries" USING btree ("created_at");
  CREATE UNIQUE INDEX "datasets_slug_idx" ON "datasets" USING btree ("slug");
  CREATE INDEX "datasets_file_idx" ON "datasets" USING btree ("file_id");
  CREATE INDEX "datasets_updated_at_idx" ON "datasets" USING btree ("updated_at");
  CREATE INDEX "datasets_created_at_idx" ON "datasets" USING btree ("created_at");
  CREATE INDEX "datasets_rels_order_idx" ON "datasets_rels" USING btree ("order");
  CREATE INDEX "datasets_rels_parent_idx" ON "datasets_rels" USING btree ("parent_id");
  CREATE INDEX "datasets_rels_path_idx" ON "datasets_rels" USING btree ("path");
  CREATE INDEX "datasets_rels_categories_id_idx" ON "datasets_rels" USING btree ("categories_id");
  CREATE INDEX "datasets_rels_datasets_id_idx" ON "datasets_rels" USING btree ("datasets_id");
  CREATE UNIQUE INDEX "dashboards_slug_idx" ON "dashboards" USING btree ("slug");
  CREATE INDEX "dashboards_updated_at_idx" ON "dashboards" USING btree ("updated_at");
  CREATE INDEX "dashboards_created_at_idx" ON "dashboards" USING btree ("created_at");
  CREATE INDEX "dashboards_rels_order_idx" ON "dashboards_rels" USING btree ("order");
  CREATE INDEX "dashboards_rels_parent_idx" ON "dashboards_rels" USING btree ("parent_id");
  CREATE INDEX "dashboards_rels_path_idx" ON "dashboards_rels" USING btree ("path");
  CREATE INDEX "dashboards_rels_datasets_id_idx" ON "dashboards_rels" USING btree ("datasets_id");
  CREATE INDEX "external_items_updated_at_idx" ON "external_items" USING btree ("updated_at");
  CREATE INDEX "external_items_created_at_idx" ON "external_items" USING btree ("created_at");
  CREATE INDEX "external_items_rels_order_idx" ON "external_items_rels" USING btree ("order");
  CREATE INDEX "external_items_rels_parent_idx" ON "external_items_rels" USING btree ("parent_id");
  CREATE INDEX "external_items_rels_path_idx" ON "external_items_rels" USING btree ("path");
  CREATE INDEX "external_items_rels_domains_id_idx" ON "external_items_rels" USING btree ("domains_id");
  CREATE INDEX "external_items_rels_industries_id_idx" ON "external_items_rels" USING btree ("industries_id");
  CREATE INDEX "glossary_updated_at_idx" ON "glossary" USING btree ("updated_at");
  CREATE INDEX "glossary_created_at_idx" ON "glossary" USING btree ("created_at");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE INDEX "enquiries_tool_requested_idx" ON "enquiries" USING btree ("tool_requested_id");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_publications_id_idx" ON "payload_locked_documents_rels" USING btree ("publications_id");
  CREATE INDEX "payload_locked_documents_rels_tools_id_idx" ON "payload_locked_documents_rels" USING btree ("tools_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_domains_id_idx" ON "payload_locked_documents_rels" USING btree ("domains_id");
  CREATE INDEX "payload_locked_documents_rels_industries_id_idx" ON "payload_locked_documents_rels" USING btree ("industries_id");
  CREATE INDEX "payload_locked_documents_rels_datasets_id_idx" ON "payload_locked_documents_rels" USING btree ("datasets_id");
  CREATE INDEX "payload_locked_documents_rels_dashboards_id_idx" ON "payload_locked_documents_rels" USING btree ("dashboards_id");
  CREATE INDEX "payload_locked_documents_rels_external_items_id_idx" ON "payload_locked_documents_rels" USING btree ("external_items_id");
  CREATE INDEX "payload_locked_documents_rels_glossary_id_idx" ON "payload_locked_documents_rels" USING btree ("glossary_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "knowledge_hub_config_locales_locale_parent_id_unique" ON "knowledge_hub_config_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "publications" CASCADE;
  DROP TABLE "publications_rels" CASCADE;
  DROP TABLE "tools" CASCADE;
  DROP TABLE "tools_rels" CASCADE;
  DROP TABLE "team" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "domains_capabilities" CASCADE;
  DROP TABLE "domains_relevant_tools" CASCADE;
  DROP TABLE "domains" CASCADE;
  DROP TABLE "domains_rels" CASCADE;
  DROP TABLE "industries_work_areas" CASCADE;
  DROP TABLE "industries_relevant_tools" CASCADE;
  DROP TABLE "industries_data_sources" CASCADE;
  DROP TABLE "industries" CASCADE;
  DROP TABLE "datasets" CASCADE;
  DROP TABLE "datasets_rels" CASCADE;
  DROP TABLE "dashboards" CASCADE;
  DROP TABLE "dashboards_rels" CASCADE;
  DROP TABLE "external_items" CASCADE;
  DROP TABLE "external_items_rels" CASCADE;
  DROP TABLE "glossary" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "knowledge_hub_config" CASCADE;
  DROP TABLE "knowledge_hub_config_locales" CASCADE;
  DROP TABLE "data_portal_sources_config" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_publications_type";
  DROP TYPE "public"."enum_publications_language";
  DROP TYPE "public"."enum_publications_archive_category";
  DROP TYPE "public"."enum_publications_record_kind";
  DROP TYPE "public"."enum_publications_bg_gradient_type";
  DROP TYPE "public"."enum_tools_type";
  DROP TYPE "public"."enum_tools_access";
  DROP TYPE "public"."enum_datasets_access_status";`)
}
