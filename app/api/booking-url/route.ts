import { NextResponse } from "next/server";
import { getConsultationSchedulingUrl } from "@/lib/calendly";

export async function GET() {
  try {
    const url = await getConsultationSchedulingUrl();
    if (!url) {
      return NextResponse.json(
        { error: "Scheduling URL not found. Please call Mark at 208-660-8643." },
        { status: 500 }
      );
    }
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get booking URL" },
      { status: 500 }
    );
  }
}
