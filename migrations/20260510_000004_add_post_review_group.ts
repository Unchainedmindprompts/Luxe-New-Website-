import type {
  MigrateUpArgs,
  MigrateDownArgs,
} from "@payloadcms/db-vercel-postgres";
import { sql } from "drizzle-orm";

export const name = "20260510_000004_add_post_review_group";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD COLUMN IF NOT EXISTS "review_reviewer_name"      varchar,
      ADD COLUMN IF NOT EXISTS "review_reviewer_job_title" varchar,
      ADD COLUMN IF NOT EXISTS "review_review_body"        varchar,
      ADD COLUMN IF NOT EXISTS "review_review_rating"      numeric DEFAULT 5,
      ADD COLUMN IF NOT EXISTS "review_review_date"        timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "review_review_url"         varchar
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
      DROP COLUMN IF EXISTS "review_reviewer_name",
      DROP COLUMN IF EXISTS "review_reviewer_job_title",
      DROP COLUMN IF EXISTS "review_review_body",
      DROP COLUMN IF EXISTS "review_review_rating",
      DROP COLUMN IF EXISTS "review_review_date",
      DROP COLUMN IF EXISTS "review_review_url"
  `);
}
