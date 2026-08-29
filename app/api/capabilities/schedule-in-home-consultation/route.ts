import { NextResponse } from "next/server";
import {
  discoveryOriginFromRequest,
  discoveryResponseHeaders,
} from "@/lib/discovery-origin";
import { publicSchedulingDiscoveryDocument } from "@/lib/discovery-public";

export const runtime = "nodejs";

/**
 * Read-only agent discovery for direct Calendly scheduling.
 *
 * Built from lib/scheduling.ts on each request so readiness cannot drift
 * from whether CALENDLY_API_KEY is actually present. Availability and
 * booking URLs use the current deployment host so Preview agents do not
 * follow production 404s. No secrets, no abuse thresholds, no invented
 * Calendly questions.
 */
export async function GET(request: Request) {
  const origin = discoveryOriginFromRequest(request);
  return NextResponse.json(publicSchedulingDiscoveryDocument(origin), {
    headers: discoveryResponseHeaders(),
  });
}
