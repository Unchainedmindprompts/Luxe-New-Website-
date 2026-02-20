import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlotsForRange } from "@/lib/calendly";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start"); // YYYY-MM-DD
  const end = searchParams.get("end");     // YYYY-MM-DD

  if (!start || !end) {
    return NextResponse.json(
      { error: "start and end query params are required (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  try {
    const slots = await getAvailableSlotsForRange(start, end);
    return NextResponse.json({ slots });
  } catch (err) {
    console.error("Availability API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
