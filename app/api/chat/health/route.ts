import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Health check — tests API key validity with a minimal Anthropic call
export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({
      status: "missing_key",
      keyPrefix: "NOT SET",
      version: "2026-02-20-v5",
    });
  }

  const keyPrefix = apiKey.slice(0, 10) + "...";

  try {
    const client = new Anthropic({ apiKey });
    await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 5,
      messages: [{ role: "user", content: "Hi" }],
    });

    return NextResponse.json({
      status: "ok",
      keyPrefix,
      model: "claude-3-5-sonnet-20241022",
      version: "2026-02-20-v5",
    });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({
        status: "api_error",
        httpStatus: err.status,
        detail: err.message,
        keyPrefix,
        keyLength: apiKey.length,
        version: "2026-02-20-v5",
      });
    }

    return NextResponse.json({
      status: "network_error",
      detail: err instanceof Error ? err.message : String(err),
      keyPrefix,
      version: "2026-02-20-v5",
    });
  }
}
