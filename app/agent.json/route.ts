import { NextResponse } from "next/server";
import { agentDiscoveryDocument } from "@/lib/agent-document";
import {
  discoveryOriginFromRequest,
  discoveryResponseHeaders,
} from "@/lib/discovery-origin";

export const runtime = "nodejs";

/**
 * Host-aware /agent.json.
 *
 * Preview must publish scheduling URLs on the Preview host. Production keeps
 * https://www.luxewindowworks.com. Built from lib/agent-document.ts so this
 * cannot drift from the capability registry paths.
 */
export async function GET(request: Request) {
  const origin = discoveryOriginFromRequest(request);
  return NextResponse.json(agentDiscoveryDocument(origin), {
    headers: discoveryResponseHeaders(),
  });
}
