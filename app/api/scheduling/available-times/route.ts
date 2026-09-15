import { NextResponse } from "next/server";
import { processProductionAvailability } from "@/lib/scheduling-handler";

export const runtime = "nodejs";

function log(event: string, detail: Record<string, unknown>) {
  console.error(`[SCHEDULING_${event}]`, JSON.stringify(detail));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const result = await processProductionAvailability(url.searchParams, {
    request: req,
    log,
  });
  return NextResponse.json(result.body, {
    status: result.status,
    ...(result.headers ? { headers: result.headers } : {}),
  });
}
