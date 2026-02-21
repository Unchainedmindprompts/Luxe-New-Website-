import { NextResponse } from "next/server";

const CALENDLY_BASE = "https://api.calendly.com";

async function cf<T>(path: string): Promise<T> {
  const key = process.env.CALENDLY_API_KEY?.trim();
  const res = await fetch(`${CALENDLY_BASE}${path}`, {
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as T;
}

export const maxDuration = 15;

// Temporary debug endpoint — remove after diagnosing location config
export async function GET() {
  try {
    const me = await cf<{ resource: { uri: string } }>("/users/me");
    const userUri = me.resource.uri;

    const list = await cf<{ collection: unknown[] }>(
      `/event_types?user=${encodeURIComponent(userUri)}&active=true&count=100`
    );

    // Also fetch full detail for the first event type
    const first = (list.collection as Array<{ uri: string }>)[0];
    let detail = null;
    if (first?.uri) {
      const uuid = first.uri.split("/").pop();
      detail = await cf(`/event_types/${uuid}`);
    }

    return NextResponse.json({ list: list.collection, firstDetail: detail });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
