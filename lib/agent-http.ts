import { NextResponse } from "next/server";

export const DISCOVERY_CACHE = "public, max-age=3600, stale-while-revalidate=86400";

export function jsonDocument(body: string) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": DISCOVERY_CACHE,
    },
  });
}

export function textDocument(body: string, contentType: string) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": DISCOVERY_CACHE,
    },
  });
}
