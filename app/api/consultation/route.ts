import { NextResponse } from "next/server";
import { Resend } from "resend";
import { BUSINESS } from "@/lib/constants";

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
 * Maximum accepted length for every field a caller may supply.
 *
 * Nothing bounded these before, so one request could push megabytes of text
 * into an email body. The numbers sit where a real homeowner has room to spare
 * and an abuser has none: 2,000 characters is a long description of a house's
 * windows, and 30 covers a phone number written any way anyone actually writes
 * one.
 *
 * `_hp` is absent on purpose — it is anti-spam plumbing rather than customer
 * input, and it is handled before any of this runs.
 */
const LIMITS = {
  name: 100,
  firstName: 100,
  lastName: 100,
  phone: 30,
  email: 200,
  address: 200,
  city: 100,
  message: 2000,
  needs: 2000,
  contactMethod: 50,
  problem: 100,
  source: 50,
} as const;

type FieldName = keyof typeof LIMITS;
const FIELD_NAMES = Object.keys(LIMITS) as FieldName[];

/** The two fields where a line break is something the customer meant to type. */
const MULTILINE: ReadonlySet<FieldName> = new Set<FieldName>(["message", "needs"]);

// Everything except tab and newline, plus DEL. The multiline variant keeps both
// whitespace characters; every other field keeps neither.
// eslint-disable-next-line no-control-regex
const CONTROLS_KEEPING_BREAKS = /[\u0000-\u0008\u000B-\u001F\u007F]/g;
// eslint-disable-next-line no-control-regex
const CONTROLS_ALL = /[\u0000-\u001F\u007F]/g;

/**
 * Strips control characters and normalises line endings.
 *
 * Stripped rather than rejected, unlike over-length input: a stray control
 * character is invisible paste residue, and losing a lead over something the
 * sender cannot see would be absurd. Length is the opposite case — quietly
 * shortening what someone wrote changes their meaning without telling them, so
 * that gets a 400.
 *
 * It matters most for `name` and `problem`, which are interpolated into the
 * email subject. Resend takes JSON rather than raw SMTP, so this is not classic
 * header injection; it stops a subject line from being dressed up to look like
 * something other than a consultation request.
 */
function clean(field: FieldName, raw: string): string {
  const normalised = raw.replace(/\r\n?/g, "\n");
  const controls = MULTILINE.has(field) ? CONTROLS_KEEPING_BREAKS : CONTROLS_ALL;
  return normalised.replace(controls, "").trim();
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FailureMeta {
  readonly source: string;
  readonly present: Record<string, boolean>;
  readonly lengths: Record<string, number>;
  readonly replyToOmitted: boolean;
}

/**
 * Operational metadata only — never field values.
 *
 * These logs used to carry the whole payload: name, phone, email, address. That
 * put customer PII into Vercel's log retention, which is the wrong place for
 * it, and removing it is the reason this route was touched.
 *
 * ACCEPTED TEMPORARY LIMITATION, written down so nobody rediscovers it by
 * accident. The old log doubled as a crude lead-recovery mechanism: if Resend
 * rejected the send, Mark could read the customer's details out of the logs and
 * call them anyway. That is gone. A delivery failure now returns a non-2xx and
 * a reference id, and the submitter has to retry — which both browser forms
 * already surface. Durable persistence is the real fix and is deliberately not
 * being built here.
 */
function logFailure(
  ref: string,
  failureClass: string,
  detail: Record<string, unknown>,
  meta: FailureMeta
) {
  console.error(
    "[CONSULTATION_LEAD_SEND_FAILED]",
    JSON.stringify({ ref, at: new Date().toISOString(), failureClass, ...detail, ...meta })
  );
}

export async function POST(req: Request) {
  // One id per request, echoed on delivery failures so a customer saying "it
  // told me it failed" can be matched to a log line without either of us
  // needing their details to find it.
  const ref = crypto.randomUUID();

  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const body = parsed as Record<string, unknown>;

  // Honeypot first, so a bot learns nothing from validation, and typed so a
  // non-string value cannot throw. It used to call .trim() on whatever arrived:
  // `{"_hp": 1}` crashed the route into an empty 500.
  const hp = body._hp;
  if (typeof hp === "string" && hp.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const values: Partial<Record<FieldName, string>> = {};
  const notStrings: FieldName[] = [];
  const tooLong: FieldName[] = [];

  for (const field of FIELD_NAMES) {
    const value = body[field];
    if (value === undefined || value === null) continue;
    // The same crash the honeypot had, on every other field: `{"phone": 5551234}`
    // reached .trim() on a number and took the request down with an empty 500.
    // A number where text belongs is a caller mistake, so it is answered as one.
    if (typeof value !== "string") {
      notStrings.push(field);
      continue;
    }
    if (value.length > LIMITS[field]) {
      tooLong.push(field);
      continue;
    }
    values[field] = clean(field, value);
  }

  if (notStrings.length > 0) {
    return NextResponse.json(
      { error: "Expected text for these fields.", fields: notStrings },
      { status: 400 }
    );
  }
  if (tooLong.length > 0) {
    return NextResponse.json(
      {
        error: "Some fields are longer than allowed.",
        fields: tooLong.map((field) => ({ field, max: LIMITS[field] })),
      },
      { status: 400 }
    );
  }

  const name =
    values.name || [values.firstName, values.lastName].filter(Boolean).join(" ").trim();
  const phone = values.phone ?? "";
  const email = values.email ?? "";
  const address = values.address ?? "";
  const city = values.city ?? "";
  const message = values.message || values.needs || "";
  const contactMethod = values.contactMethod ?? "";
  const problem = values.problem ?? "";
  const source = values.source || "unknown";

  if (!name || !phone) {
    return NextResponse.json(
      { error: "Missing required fields: name and phone." },
      { status: 400 }
    );
  }

  // A malformed address must not cost Luxe the lead. Resend can reject a bad
  // replyTo and fail the whole send, so an unusable one is simply left off. The
  // address still prints in the body, where Mark can read the typo and work out
  // what the customer meant.
  const replyToUsable = email !== "" && EMAIL_SHAPE.test(email);

  const logMeta: FailureMeta = {
    source,
    present: {
      email: email !== "",
      address: address !== "",
      city: city !== "",
      message: message !== "",
      contactMethod: contactMethod !== "",
      problem: problem !== "",
    },
    lengths: { name: name.length, phone: phone.length, message: message.length },
    replyToOmitted: email !== "" && !replyToUsable,
  };

  const sourcePath =
    source === "book"
      ? "/book"
      : source === "contact"
      ? "/contact"
      : `/${source}`;
  const subject = problem
    ? `New Consultation Request — ${name} — ${problem}`
    : `New Consultation Request — ${name}`;
  const text = [
    `New consultation request from ${BUSINESS.url}${sourcePath}`,
    ``,
    problem ? `PROBLEM:  ${problem}` : null,
    problem ? `` : null,
    `Name:     ${name}`,
    `Phone:    ${phone}`,
    `Email:    ${email || "(not provided)"}`,
    address ? `Address:  ${address}` : null,
    city ? `City:     ${city}` : null,
    contactMethod ? `Prefers:  ${contactMethod}` : null,
    ``,
    `Message:`,
    message || "(no message)",
    ``,
    `— Source: ${sourcePath}`,
    // Carried into the email as well, so a failed-then-retried submission can
    // be told apart from a genuine duplicate without a datastore.
    `— Reference: ${ref}`,
    `— Timestamp: ${new Date().toISOString()}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const resend = getResend();
    // FROM address: use Resend's pre-verified `onboarding@resend.dev` until
    // luxewindowworks.com is verified in the Resend Domains dashboard. Display
    // name stays "Luxe Window Works" so the inbox rendering still reads clean.
    // Once the domain is verified in Resend, swap this back to
    // `orders@luxewindowworks.com`.
    const result = await resend.emails.send({
      from: `${BUSINESS.name} <onboarding@resend.dev>`,
      to: BUSINESS.email,
      subject,
      text,
      // Set replyTo so Mark can hit reply and reach the lead directly.
      ...(replyToUsable ? { replyTo: email } : {}),
    });

    if (result.error) {
      // Provider error NAME only. Its message can echo the addresses involved,
      // which is exactly what these logs may no longer hold.
      logFailure(ref, "resend-error", { providerErrorName: result.error.name }, logMeta);
      return NextResponse.json({ error: "Could not send the message.", ref }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    // A missing key is a deployment problem rather than a bad request, and it
    // is worth telling the two apart at a glance in the logs.
    const missingKey = err instanceof Error && err.message.includes("RESEND_API_KEY");
    logFailure(
      ref,
      missingKey ? "config-missing-api-key" : "exception",
      { errorName: err instanceof Error ? err.name : typeof err },
      logMeta
    );
    return NextResponse.json({ error: "Could not send the message.", ref }, { status: 500 });
  }
}
