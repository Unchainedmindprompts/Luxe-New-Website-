import { NextResponse } from "next/server";
import { getConsultationSchedulingUrl } from "@/lib/calendly";

// Returns the event type's public scheduling URL with prefill params.
// Uses GET /event_types (always accessible) — no paid-plan endpoints needed.
export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const baseUrl = await getConsultationSchedulingUrl();
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Could not find Calendly scheduling URL. Please call Mark at 208-660-8643." },
        { status: 500 }
      );
    }

    const url = new URL(baseUrl);
    url.searchParams.set("name", name);
    url.searchParams.set("email", email);
    return NextResponse.json({ url: url.toString() });
  } catch (err) {
    console.error("[booking-link] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get booking URL" },
      { status: 500 }
    );
  }
}
