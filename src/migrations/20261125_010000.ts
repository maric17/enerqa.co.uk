import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Store editorial artwork separately from the provider's articles and images.
  await db.execute(sql`
    CREATE TABLE "market_article_images" (
      "id" serial PRIMARY KEY NOT NULL,
      "article_url" varchar NOT NULL,
      "image_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "market_article_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media" ("id") ON DELETE SET NULL
    );
    CREATE UNIQUE INDEX "market_article_images_article_url_idx" ON "market_article_images" ("article_url");
    CREATE INDEX "market_article_images_image_idx" ON "market_article_images" ("image_id");
    CREATE INDEX "market_article_images_updated_at_idx" ON "market_article_images" ("updated_at");
    CREATE INDEX "market_article_images_created_at_idx" ON "market_article_images" ("created_at");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE "market_article_images";`);
}
