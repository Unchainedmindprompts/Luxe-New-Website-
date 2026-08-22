import { NextResponse } from "next/server";
import { consultationDiscoveryDocument } from "@/lib/capabilities";

export const runtime = "nodejs";

/**
 * Read-only agent discovery for the consultation-request capability.
 *
 * Built from lib/capabilities.ts on each request so this document cannot
 * drift from the contract the POST route actually executes. No secrets,
 * no inbox addresses beyond what the public site already publishes, no
 * abuse thresholds.
 */
export async function GET() {
  return NextResponse.json(consultationDiscoveryDocument(), {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
