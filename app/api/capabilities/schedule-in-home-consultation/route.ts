import { NextResponse } from "next/server";
import { schedulingDiscoveryDocument } from "@/lib/scheduling";

export const runtime = "nodejs";

/**
 * Read-only agent discovery for direct Calendly scheduling.
 *
 * Built from lib/scheduling.ts on each request so readiness cannot drift
 * from whether CALENDLY_API_KEY is actually present. No secrets, no
 * abuse thresholds, no invented Calendly questions.
 */
export async function GET() {
  return NextResponse.json(schedulingDiscoveryDocument(), {
    headers: {
      "Cache-Control": "public, max-age=60",
    },
  });
}
