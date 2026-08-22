import { NextResponse } from "next/server";
import { Resend } from "resend";
import { processProductionConsultation } from "@/lib/consult-handler";

type ResendSendOptions = NonNullable<Parameters<Resend["emails"]["send"]>[1]>;

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
 * Operational metadata only — never field values or raw IPs.
 *
 * Production wires Redis-backed rate limiting and idempotency through
 * processProductionConsultation. That adapter cannot receive the test-only
 * execution override. Agent-intended requests never fall through to the
 * human-form path.
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

function logInfraUnavailable(requestId: string, stage: string) {
  console.error(
    "[CONSULTATION_INFRA_UNAVAILABLE]",
    JSON.stringify({ request_id: requestId, stage })
  );
}

export async function POST(req: Request) {
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = await processProductionConsultation(parsed, {
    request: req,
    sendEmail: async (message) => {
      const resend = getResend();
      const options: ResendSendOptions | undefined = message.idempotencyKey
        ? { idempotencyKey: message.idempotencyKey }
        : undefined;
      const sent = await resend.emails.send(
        {
          from: message.from,
          to: message.to,
          subject: message.subject,
          text: message.text,
          ...(message.replyTo ? { replyTo: message.replyTo } : {}),
        },
        options
      );
      return { error: sent.error ? { name: sent.error.name } : undefined };
    },
    logFailure,
    logInfraUnavailable,
  });

  return NextResponse.json(result.body, {
    status: result.status,
    ...(result.headers ? { headers: result.headers } : {}),
  });
}
