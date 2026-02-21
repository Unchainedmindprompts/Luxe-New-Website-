import { NextResponse } from "next/server";
import { createSchedulingLink, getConsultationSchedulingUrl } from "@/lib/calendly";

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Try to create a personalised one-time scheduling link (requires paid Calendly plan).
    // If that fails, fall back to the event type's public scheduling URL with prefill params.
    try {
      const url = await createSchedulingLink(name, email);
      return NextResponse.json({ url });
    } catch (linkErr) {
      console.warn("[booking-link] scheduling_links failed, falling back to scheduling URL:", linkErr);
      const baseUrl = await getConsultationSchedulingUrl();
      if (!baseUrl) throw linkErr;
      const url = new URL(baseUrl);
      url.searchParams.set("name", name);
      url.searchParams.set("email", email);
      return NextResponse.json({ url: url.toString() });
    }
  } catch (err) {
    console.error("[booking-link] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create booking link" },
      { status: 500 }
    );
  }
}
