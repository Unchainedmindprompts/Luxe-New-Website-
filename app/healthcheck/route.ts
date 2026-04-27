import { NextResponse } from "next/server";
import config from "@payload-config";
import { getPayload } from "payload";

export async function GET() {
  try {
    await getPayload({ config });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ status: "error", message, stack }, { status: 500 });
  }
}
