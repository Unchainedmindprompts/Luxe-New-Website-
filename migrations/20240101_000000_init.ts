import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-vercel-postgres";
import { sql } from "drizzle-orm";

export const name = "20240101_000000_init";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Enum for partners.businessType
    DO $$ BEGIN
      CREATE TYPE "public"."enum_partners_business_type"
        AS ENUM('Dentist', 'MedicalClinic', 'Physician', 'LocalBusiness');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    -- users (auth collection)
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
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx"
      ON "users" USING btree ("email");

    -- media (upload collection)
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
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx"
      ON "media" USING btree ("filename");

    -- partners collection
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
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "partners_slug_idx"
      ON "partners" USING btree ("slug");

    -- partners.sameAs array table
    CREATE TABLE IF NOT EXISTS "partners_same_as" (
      "_order"     integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id"         varchar PRIMARY KEY NOT NULL,
      "url"        varchar
    );
    CREATE INDEX IF NOT EXISTS "partners_same_as_order_idx"
      ON "partners_same_as" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "partners_same_as_parent_idx"
      ON "partners_same_as" USING btree ("_parent_id");

    -- payload internals
    CREATE TABLE IF NOT EXISTS "payload_preferences" (
      "id"         serial PRIMARY KEY NOT NULL,
      "key"        varchar,
      "value"      jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx"
      ON "payload_preferences" USING btree ("key");

    CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
      "id"        serial PRIMARY KEY NOT NULL,
      "order"     integer,
      "parent_id" integer NOT NULL,
      "path"      varchar NOT NULL,
      "users_id"  integer
    );
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx"
      ON "payload_preferences_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx"
      ON "payload_preferences_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx"
      ON "payload_preferences_rels" USING btree ("path");

    CREATE TABLE IF NOT EXISTS "payload_migrations" (
      "id"         serial PRIMARY KEY NOT NULL,
      "name"       varchar,
      "batch"      numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
      "id"          serial PRIMARY KEY NOT NULL,
      "global_slug" varchar,
      "updated_at"  timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at"  timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
      "id"          serial PRIMARY KEY NOT NULL,
      "order"       integer,
      "parent_id"   integer NOT NULL,
      "path"        varchar NOT NULL,
      "users_id"    integer,
      "media_id"    integer,
      "partners_id" integer
    );
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx"
      ON "payload_locked_documents_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx"
      ON "payload_locked_documents_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx"
      ON "payload_locked_documents_rels" USING btree ("path");

    -- Foreign keys (added after all tables exist)
    ALTER TABLE "partners_same_as"
      ADD CONSTRAINT "partners_same_as_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "partners"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload_preferences_rels"
      ADD CONSTRAINT "payload_preferences_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "payload_preferences"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload_preferences_rels"
      ADD CONSTRAINT "payload_preferences_rels_users_fk"
      FOREIGN KEY ("users_id") REFERENCES "users"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "payload_locked_documents"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_users_fk"
      FOREIGN KEY ("users_id") REFERENCES "users"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_media_fk"
      FOREIGN KEY ("media_id") REFERENCES "media"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_partners_fk"
      FOREIGN KEY ("partners_id") REFERENCES "partners"("id")
      ON DELETE cascade ON UPDATE no action;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "partners_same_as" DROP CONSTRAINT IF EXISTS "partners_same_as_parent_id_fk";
    ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_parent_fk";
    ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_users_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_parent_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_users_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_media_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_partners_fk";
    DROP TABLE IF EXISTS "payload_locked_documents_rels";
    DROP TABLE IF EXISTS "payload_locked_documents";
    DROP TABLE IF EXISTS "payload_migrations";
    DROP TABLE IF EXISTS "payload_preferences_rels";
    DROP TABLE IF EXISTS "payload_preferences";
    DROP TABLE IF EXISTS "partners_same_as";
    DROP TABLE IF EXISTS "partners";
    DROP TABLE IF EXISTS "media";
    DROP TABLE IF EXISTS "users";
    DROP TYPE IF EXISTS "public"."enum_partners_business_type";
  `);
}
