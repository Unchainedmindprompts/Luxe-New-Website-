import { NextResponse } from "next/server";
import { getEventTypeDebugInfo } from "@/lib/calendly";

export const maxDuration = 15;

// Temporary debug endpoint — remove after diagnosing location config issue
export async function GET() {
  try {
    const info = await getEventTypeDebugInfo();
    return NextResponse.json(info);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
