import type {
  MigrateUpArgs,
  MigrateDownArgs,
} from "@payloadcms/db-vercel-postgres";
import { sql } from "drizzle-orm";

export const name = "20240301_000002_fix_media_thumbnail_col";

// Payload 3.84's drizzle adapter converts camelCase `thumbnailURL` to
// `thumbnail_u_r_l` (one underscore per capital letter), but the init
// migration created the column as `thumbnail_url`. Rename to match.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media"
      RENAME COLUMN "thumbnail_url" TO "thumbnail_u_r_l"
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media"
      RENAME COLUMN "thumbnail_u_r_l" TO "thumbnail_url"
  `);
}
