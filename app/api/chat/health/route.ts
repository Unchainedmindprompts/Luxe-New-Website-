import { NextResponse } from "next/server";

// Health check — tests API key validity with a minimal Anthropic call
export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({
      status: "missing_key",
      keyPrefix: "NOT SET",
      version: "2026-02-17-v4",
    });
  }

  const keyPrefix = apiKey.slice(0, 10) + "...";

  // Actually test the key with a tiny request
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 5,
        messages: [{ role: "user", content: "Hi" }],
      }),
    });

    if (res.ok) {
      return NextResponse.json({
        status: "ok",
        keyPrefix,
        model: "claude-3-5-sonnet-20241022",
        version: "2026-02-17-v4",
      });
    }

    const errBody = await res.text();
    let detail = "";
    try {
      const parsed = JSON.parse(errBody);
      detail = parsed?.error?.message || errBody.slice(0, 300);
    } catch {
      detail = errBody.slice(0, 300);
    }

    return NextResponse.json({
      status: "api_error",
      httpStatus: res.status,
      detail,
      keyPrefix,
      keyLength: apiKey.length,
      version: "2026-02-17-v4",
    });
  } catch (err) {
    return NextResponse.json({
      status: "network_error",
      detail: err instanceof Error ? err.message : String(err),
      keyPrefix,
      version: "2026-02-17-v4",
    });
  }
}
