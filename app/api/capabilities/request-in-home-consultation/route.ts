import { NextResponse } from "next/server";
import {
  discoveryOriginFromRequest,
  discoveryResponseHeaders,
} from "@/lib/discovery-origin";
import { publicConsultationDiscoveryDocument } from "@/lib/discovery-public";

export const runtime = "nodejs";

/**
 * Read-only agent discovery for the consultation-request capability.
 *
 * Built from lib/capabilities.ts on each request so this document cannot
 * drift from the contract the POST route actually executes. Related
 * scheduling URLs use the current deployment host. No secrets, no inbox
 * addresses beyond what the public site already publishes, no abuse
 * thresholds.
 */
export async function GET(request: Request) {
  const origin = discoveryOriginFromRequest(request);
  return NextResponse.json(publicConsultationDiscoveryDocument(origin), {
    headers: discoveryResponseHeaders(),
  });
}
