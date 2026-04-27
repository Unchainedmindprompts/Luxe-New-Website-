import type {
  MigrateUpArgs,
  MigrateDownArgs,
} from "@payloadcms/db-vercel-postgres";
import { sql } from "drizzle-orm";

export const name = "20240201_000001_add_posts";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ── posts category enum ───────────────────────────────────────────────────
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_posts_category"
        AS ENUM(
          'Buying Guide',
          'Product Focus',
          'Installation',
          'Design Tips',
          'Energy Efficiency',
          'Motorization',
          'Local Insights',
          'Industry'
        );
    EXCEPTION WHEN duplicate_object THEN null;
    END $$
  `);

  // ── posts ─────────────────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts" (
      "id"                  serial PRIMARY KEY NOT NULL,
      "title"               varchar NOT NULL,
      "slug"                varchar NOT NULL,
      "excerpt"             varchar,
      "content"             varchar,
      "featured_image_id"   integer,
      "published"           boolean DEFAULT false,
      "published_date"      timestamp(3) with time zone,
      "date_modified"       timestamp(3) with time zone,
      "category"            "enum_posts_category",
      "meta_description"    varchar,
      "generated_schema"    varchar,
      "updated_at"          timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at"          timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "posts_slug_idx"
      ON "posts" USING btree ("slug")
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "posts_created_at_idx"
      ON "posts" USING btree ("created_at")
  `);
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD CONSTRAINT "posts_featured_image_id_media_id_fk"
      FOREIGN KEY ("featured_image_id") REFERENCES "media"("id")
      ON DELETE set null ON UPDATE no action
  `);

  // ── posts_tags (array field) ──────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts_tags" (
      "_order"     integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id"         varchar PRIMARY KEY NOT NULL,
      "tag"        varchar
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "posts_tags_order_idx"
      ON "posts_tags" USING btree ("_order")
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "posts_tags_parent_idx"
      ON "posts_tags" USING btree ("_parent_id")
  `);
  await db.execute(sql`
    ALTER TABLE "posts_tags"
      ADD CONSTRAINT "posts_tags_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "posts"("id")
      ON DELETE cascade ON UPDATE no action
  `);

  // ── posts_faqs (array field) ──────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts_faqs" (
      "_order"     integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id"         varchar PRIMARY KEY NOT NULL,
      "question"   varchar NOT NULL,
      "answer"     varchar NOT NULL
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "posts_faqs_order_idx"
      ON "posts_faqs" USING btree ("_order")
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "posts_faqs_parent_idx"
      ON "posts_faqs" USING btree ("_parent_id")
  `);
  await db.execute(sql`
    ALTER TABLE "posts_faqs"
      ADD CONSTRAINT "posts_faqs_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "posts"("id")
      ON DELETE cascade ON UPDATE no action
  `);

  // ── payload_kv (Payload 3.84+ internal key-value store) ───────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload_kv" (
      "id"   serial PRIMARY KEY NOT NULL,
      "key"  varchar,
      "data" jsonb
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "payload_kv_key_idx"
      ON "payload_kv" USING btree ("key")
  `);

  // ── wire posts into existing rels tables ──────────────────────────────────
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "posts_id" integer
  `);
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_posts_fk"
      FOREIGN KEY ("posts_id") REFERENCES "posts"("id")
      ON DELETE cascade ON UPDATE no action
  `);

  await db.execute(sql`
    ALTER TABLE "payload_preferences_rels"
      ADD COLUMN IF NOT EXISTS "posts_id" integer
  `);
  await db.execute(sql`
    ALTER TABLE "payload_preferences_rels"
      ADD CONSTRAINT "payload_preferences_rels_posts_fk"
      FOREIGN KEY ("posts_id") REFERENCES "posts"("id")
      ON DELETE cascade ON UPDATE no action
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_posts_fk"`);
  await db.execute(sql`ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "posts_id"`);
  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_posts_fk"`);
  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "posts_id"`);
  await db.execute(sql`DROP TABLE IF EXISTS "payload_kv"`);
  await db.execute(sql`ALTER TABLE "posts_faqs" DROP CONSTRAINT IF EXISTS "posts_faqs_parent_id_fk"`);
  await db.execute(sql`DROP TABLE IF EXISTS "posts_faqs"`);
  await db.execute(sql`ALTER TABLE "posts_tags" DROP CONSTRAINT IF EXISTS "posts_tags_parent_id_fk"`);
  await db.execute(sql`DROP TABLE IF EXISTS "posts_tags"`);
  await db.execute(sql`ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_featured_image_id_media_id_fk"`);
  await db.execute(sql`DROP TABLE IF EXISTS "posts"`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_posts_category"`);
}
