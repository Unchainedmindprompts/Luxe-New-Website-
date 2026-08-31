import { NextResponse } from "next/server";
import { processProductionBooking } from "@/lib/scheduling-handler";

export const runtime = "nodejs";

function log(event: string, detail: Record<string, unknown>) {
  console.error(`[SCHEDULING_${event}]`, JSON.stringify(detail));
}

export async function POST(req: Request) {
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = await processProductionBooking(parsed, {
    request: req,
    log,
  });
  return NextResponse.json(result.body, {
    status: result.status,
    ...(result.headers ? { headers: result.headers } : {}),
  });
}
