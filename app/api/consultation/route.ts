import { NextResponse } from "next/server";
import { Resend } from "resend";
import { processConsultation } from "@/lib/consult-handler";

export const runtime = "nodejs";

// Lazy-init Resend so a missing key doesn't crash the build.
let _resend: Resend | undefined;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not configured");
    _resend = new Resend(key);
  }
  return _resend;
}

/**
 * Operational metadata only — never field values.
 *
 * These logs used to carry the whole payload: name, phone, email, address. That
 * put customer PII into Vercel's log retention, which is the wrong place for
 * it. A delivery failure now returns a non-2xx and a reference id.
 *
 * ACCEPTED TEMPORARY LIMITATION. Durable persistence of the lead itself is
 * deliberately not being built here. Agent-mode idempotency, when a store is
 * injected in tests, records only request_id + outcome — never PII.
 *
 * Production has no durable rate limiter and no durable idempotency store.
 * Agent traffic shares this endpoint and does not receive a bypass, because
 * there is no limiter to bypass. Readiness stays not-ready.
 */
function logFailure(
  ref: string,
  failureClass: string,
  detail: Record<string, unknown>,
  meta: {
    readonly source: string;
    readonly present: Record<string, boolean>;
    readonly lengths: Record<string, number>;
    readonly replyToOmitted: boolean;
  }
) {
  console.error(
    "[CONSULTATION_LEAD_SEND_FAILED]",
    JSON.stringify({ ref, at: new Date().toISOString(), failureClass, ...detail, ...meta })
  );
}

export async function POST(req: Request) {
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = await processConsultation(parsed, {
    sendEmail: async (message) => {
      const resend = getResend();
      const result = await resend.emails.send({
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        ...(message.replyTo ? { replyTo: message.replyTo } : {}),
      });
      return { error: result.error ? { name: result.error.name } : undefined };
    },
    logFailure,
    // No durable store is configured. Do not invent an in-process cache that
    // would look like idempotency on a serverless host.
  });

  return NextResponse.json(result.body, { status: result.status });
}
