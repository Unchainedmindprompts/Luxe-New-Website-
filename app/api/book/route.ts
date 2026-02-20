import { NextRequest, NextResponse } from "next/server";
import { createInvitee } from "@/lib/calendly";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, address, startTime } = await request.json();

    if (!name || !email || !startTime) {
      return NextResponse.json(
        { error: "name, email, and startTime are required" },
        { status: 400 }
      );
    }

    const invitee = await createInvitee({ name, email, startTime });

    return NextResponse.json({
      success: true,
      appointment: {
        name: invitee.name,
        email: invitee.email,
        startTime: invitee.start_time,
        uri: invitee.uri,
      },
    });
  } catch (err) {
    console.error("Booking API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Booking failed" },
      { status: 500 }
    );
  }
}
