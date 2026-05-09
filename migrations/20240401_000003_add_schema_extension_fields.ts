import type {
  MigrateUpArgs,
  MigrateDownArgs,
} from "@payloadcms/db-vercel-postgres";
import { sql } from "drizzle-orm";

export const name = "20240401_000003_add_schema_extension_fields";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ── geographic_focus enum ─────────────────────────────────────────────────
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_posts_geographic_focus"
        AS ENUM(
          'Coeur d''Alene',
          'Post Falls',
          'Hayden',
          'Rathdrum',
          'Spirit Lake',
          'Sandpoint',
          'Kootenai County',
          'North Idaho'
        );
    EXCEPTION WHEN duplicate_object THEN null;
    END $$
  `);

  // ── geographic_focus column on posts ─────────────────────────────────────
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD COLUMN IF NOT EXISTS "geographic_focus" "enum_posts_geographic_focus"
  `);

  // ── mentioned_entities enum ───────────────────────────────────────────────
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_posts_mentioned_entities_entity_type"
        AS ENUM(
          'Place',
          'GovernmentOrganization',
          'Organization',
          'LocalBusiness'
        );
    EXCEPTION WHEN duplicate_object THEN null;
    END $$
  `);

  // ── posts_mentioned_entities (array field) ────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts_mentioned_entities" (
      "_order"      integer NOT NULL,
      "_parent_id"  integer NOT NULL,
      "id"          varchar PRIMARY KEY NOT NULL,
      "entity_type" "enum_posts_mentioned_entities_entity_type" NOT NULL,
      "name"        varchar NOT NULL,
      "url"         varchar,
      "description" varchar
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "posts_mentioned_entities_order_idx"
      ON "posts_mentioned_entities" USING btree ("_order")
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "posts_mentioned_entities_parent_idx"
      ON "posts_mentioned_entities" USING btree ("_parent_id")
  `);
  await db.execute(sql`
    ALTER TABLE "posts_mentioned_entities"
      ADD CONSTRAINT "posts_mentioned_entities_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "posts"("id")
      ON DELETE cascade ON UPDATE no action
  `);

  // ── posts_cited_sources (array field) ────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts_cited_sources" (
      "_order"        integer NOT NULL,
      "_parent_id"    integer NOT NULL,
      "id"            varchar PRIMARY KEY NOT NULL,
      "name"          varchar NOT NULL,
      "url"           varchar NOT NULL,
      "publisher"     varchar,
      "date_accessed" timestamp(3) with time zone
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "posts_cited_sources_order_idx"
      ON "posts_cited_sources" USING btree ("_order")
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "posts_cited_sources_parent_idx"
      ON "posts_cited_sources" USING btree ("_parent_id")
  `);
  await db.execute(sql`
    ALTER TABLE "posts_cited_sources"
      ADD CONSTRAINT "posts_cited_sources_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "posts"("id")
      ON DELETE cascade ON UPDATE no action
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "posts_cited_sources" DROP CONSTRAINT IF EXISTS "posts_cited_sources_parent_id_fk"`);
  await db.execute(sql`DROP TABLE IF EXISTS "posts_cited_sources"`);
  await db.execute(sql`ALTER TABLE "posts_mentioned_entities" DROP CONSTRAINT IF EXISTS "posts_mentioned_entities_parent_id_fk"`);
  await db.execute(sql`DROP TABLE IF EXISTS "posts_mentioned_entities"`);
  await db.execute(sql`ALTER TABLE "posts" DROP COLUMN IF EXISTS "geographic_focus"`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_posts_mentioned_entities_entity_type"`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_posts_geographic_focus"`);
}
