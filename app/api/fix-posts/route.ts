import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { sql } from "drizzle-orm";
import config from "@payload-config";

// Long, random key so search engines and randos can't trigger this
const SECRET = "fix-posts-7c4e9a8b3f6d-2026";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get("key") !== SECRET) {
    return new NextResponse("Not authorized", { status: 403 });
  }

  try {
    const payload = await getPayload({ config });

    // Run the same SQL as the migration file. ADD COLUMN IF NOT EXISTS is
    // idempotent — safe to hit this URL more than once.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drizzle = (payload.db as any).drizzle;

    await drizzle.execute(sql`
      ALTER TABLE "posts"
        ADD COLUMN IF NOT EXISTS "review_reviewer_name"      varchar,
        ADD COLUMN IF NOT EXISTS "review_reviewer_job_title" varchar,
        ADD COLUMN IF NOT EXISTS "review_review_body"        varchar,
        ADD COLUMN IF NOT EXISTS "review_review_rating"      numeric DEFAULT 5,
        ADD COLUMN IF NOT EXISTS "review_review_date"        timestamp(3) with time zone,
        ADD COLUMN IF NOT EXISTS "review_review_url"         varchar
    `);

    return new NextResponse(
      `<!DOCTYPE html><html><head><title>Fixed</title><meta name="robots" content="noindex"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 60px 40px; max-width: 600px; margin: 0 auto; text-align: center; background: #f9fafb;">
  <div style="font-size: 72px; line-height: 1; margin-bottom: 8px;">&#10003;</div>
  <h1 style="color: #16a34a; margin: 16px 0; font-size: 32px;">Fixed!</h1>
  <p style="color: #4b5563; font-size: 18px; line-height: 1.5;">The database has been updated. Your Posts page should work now.</p>
  <a href="/admin/collections/posts" style="display: inline-block; margin-top: 24px; background: #1f2937; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open Posts &rarr;</a>
</body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const escaped = msg.replace(/[<>&]/g, (c) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" } as Record<string, string>)[c]
    );
    return new NextResponse(
      `<!DOCTYPE html><html><head><title>Error</title><meta name="robots" content="noindex"></head>
<body style="font-family: -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
  <h1 style="color: #dc2626;">Something went wrong</h1>
  <pre style="background: #f3f4f6; padding: 20px; border-radius: 6px; overflow-x: auto; white-space: pre-wrap;">${escaped}</pre>
  <p>Copy this whole error and paste it back to Claude.</p>
</body></html>`,
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
