import { NextResponse } from "next/server";
import {
  discoveryOriginFromRequest,
  discoveryResponseHeaders,
} from "@/lib/discovery-origin";
import { llmsTextForOrigin } from "@/lib/discovery-public";

export const runtime = "nodejs";

/**
 * Host-aware /llms.txt.
 *
 * Only the agent discovery-chain links are rewritten. Product, blog, and
 * human /book links stay on https://www.luxewindowworks.com.
 */
export async function GET(request: Request) {
  const origin = discoveryOriginFromRequest(request);
  return new NextResponse(llmsTextForOrigin(origin), {
    headers: {
      ...discoveryResponseHeaders(),
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
