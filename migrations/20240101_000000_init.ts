import type {
  MigrateUpArgs,
  MigrateDownArgs,
} from "@payloadcms/db-vercel-postgres";
import { sql } from "drizzle-orm";

export const name = "20240101_000000_init";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // enum must exist before tables that reference it
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_partners_business_type"
        AS ENUM('Dentist', 'MedicalClinic', 'Physician', 'LocalBusiness');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$
  `);

  // ── users (auth collection) ───────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "users" (
      "id"                         serial PRIMARY KEY NOT NULL,
      "updated_at"                 timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at"                 timestamp(3) with time zone DEFAULT now() NOT NULL,
      "email"                      varchar NOT NULL,
      "reset_password_token"       varchar,
      "reset_password_expiration"  timestamp(3) with time zone,
      "salt"                       varchar,
      "hash"                       varchar,
      "login_attempts"             numeric DEFAULT 0,
      "lock_until"                 timestamp(3) with time zone
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx"
      ON "users" USING btree ("email")
  `);

  // ── media (upload collection) ─────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "media" (
      "id"            serial PRIMARY KEY NOT NULL,
      "alt"           varchar NOT NULL,
      "updated_at"    timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at"    timestamp(3) with time zone DEFAULT now() NOT NULL,
      "url"           varchar,
      "thumbnail_url" varchar,
      "filename"      varchar,
      "mime_type"     varchar,
      "filesize"      numeric,
      "width"         numeric,
      "height"        numeric,
      "focal_x"       numeric,
      "focal_y"       numeric
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx"
      ON "media" USING btree ("filename")
  `);

  // ── partners ──────────────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "partners" (
      "id"                        serial PRIMARY KEY NOT NULL,
      "name"                      varchar NOT NULL,
      "slug"                      varchar NOT NULL,
      "business_type"             "enum_partners_business_type" NOT NULL,
      "description"               varchar,
      "url"                       varchar,
      "telephone"                 varchar,
      "email"                     varchar,
      "address_street_address"    varchar,
      "address_address_locality"  varchar,
      "address_address_region"    varchar,
      "address_postal_code"       varchar,
      "address_address_country"   varchar DEFAULT 'US',
      "generated_schema"          varchar,
      "updated_at"                timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at"                timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "partners_slug_idx"
      ON "partners" USING btree ("slug")
  `);

  // ── partners.sameAs (array field) ─────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "partners_same_as" (
      "_order"     integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id"         varchar PRIMARY KEY NOT NULL,
      "url"        varchar
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "partners_same_as_order_idx"
      ON "partners_same_as" USING btree ("_order")
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "partners_same_as_parent_idx"
      ON "partners_same_as" USING btree ("_parent_id")
  `);
  await db.execute(sql`
    ALTER TABLE "partners_same_as"
      ADD CONSTRAINT "partners_same_as_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "partners"("id")
      ON DELETE cascade ON UPDATE no action
  `);

  // ── payload_preferences ───────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload_preferences" (
      "id"         serial PRIMARY KEY NOT NULL,
      "key"        varchar,
      "value"      jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx"
      ON "payload_preferences" USING btree ("key")
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
      "id"        serial PRIMARY KEY NOT NULL,
      "order"     integer,
      "parent_id" integer NOT NULL,
      "path"      varchar NOT NULL,
      "users_id"  integer
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx"
      ON "payload_preferences_rels" USING btree ("order")
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx"
      ON "payload_preferences_rels" USING btree ("parent_id")
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx"
      ON "payload_preferences_rels" USING btree ("path")
  `);
  await db.execute(sql`
    ALTER TABLE "payload_preferences_rels"
      ADD CONSTRAINT "payload_preferences_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "payload_preferences"("id")
      ON DELETE cascade ON UPDATE no action
  `);
  await db.execute(sql`
    ALTER TABLE "payload_preferences_rels"
      ADD CONSTRAINT "payload_preferences_rels_users_fk"
      FOREIGN KEY ("users_id") REFERENCES "users"("id")
      ON DELETE cascade ON UPDATE no action
  `);

  // ── payload_migrations ────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload_migrations" (
      "id"         serial PRIMARY KEY NOT NULL,
      "name"       varchar,
      "batch"      numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `);

  // ── payload_locked_documents ──────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
      "id"          serial PRIMARY KEY NOT NULL,
      "global_slug" varchar,
      "updated_at"  timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at"  timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
      "id"          serial PRIMARY KEY NOT NULL,
      "order"       integer,
      "parent_id"   integer NOT NULL,
      "path"        varchar NOT NULL,
      "users_id"    integer,
      "media_id"    integer,
      "partners_id" integer
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx"
      ON "payload_locked_documents_rels" USING btree ("order")
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx"
      ON "payload_locked_documents_rels" USING btree ("parent_id")
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx"
      ON "payload_locked_documents_rels" USING btree ("path")
  `);
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "payload_locked_documents"("id")
      ON DELETE cascade ON UPDATE no action
  `);
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_users_fk"
      FOREIGN KEY ("users_id") REFERENCES "users"("id")
      ON DELETE cascade ON UPDATE no action
  `);
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_media_fk"
      FOREIGN KEY ("media_id") REFERENCES "media"("id")
      ON DELETE cascade ON UPDATE no action
  `);
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_partners_fk"
      FOREIGN KEY ("partners_id") REFERENCES "partners"("id")
      ON DELETE cascade ON UPDATE no action
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "partners_same_as" DROP CONSTRAINT IF EXISTS "partners_same_as_parent_id_fk"`);
  await db.execute(sql`ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_parent_fk"`);
  await db.execute(sql`ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_users_fk"`);
  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_parent_fk"`);
  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_users_fk"`);
  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_media_fk"`);
  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_partners_fk"`);
  await db.execute(sql`DROP TABLE IF EXISTS "payload_locked_documents_rels"`);
  await db.execute(sql`DROP TABLE IF EXISTS "payload_locked_documents"`);
  await db.execute(sql`DROP TABLE IF EXISTS "payload_migrations"`);
  await db.execute(sql`DROP TABLE IF EXISTS "payload_preferences_rels"`);
  await db.execute(sql`DROP TABLE IF EXISTS "payload_preferences"`);
  await db.execute(sql`DROP TABLE IF EXISTS "partners_same_as"`);
  await db.execute(sql`DROP TABLE IF EXISTS "partners"`);
  await db.execute(sql`DROP TABLE IF EXISTS "media"`);
  await db.execute(sql`DROP TABLE IF EXISTS "users"`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_partners_business_type"`);
}
