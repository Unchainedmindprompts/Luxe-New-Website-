import { NextResponse } from "next/server";

// Quick health check — is the API key configured?
export async function GET() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  const keyPrefix = hasKey
    ? process.env.ANTHROPIC_API_KEY!.slice(0, 7) + "..."
    : "NOT SET";

  return NextResponse.json({
    status: hasKey ? "ok" : "missing_key",
    keyPrefix,
    version: "2024-02-17-v3",
  });
}
