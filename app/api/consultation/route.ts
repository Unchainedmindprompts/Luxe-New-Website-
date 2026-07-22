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

interface ConsultationPayload {
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  message?: string;
  needs?: string;
  contactMethod?: string;
  // Populated when the visitor came through the "Show Me My Options" flow.
  // Value is one of the eight problem labels shown in step 1.
  problem?: string;
  source?: string;
  // Honeypot — hidden field bots love to fill, humans never see.
  _hp?: string;
}

export async function POST(req: Request) {
  let body: ConsultationPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot: pretend to succeed so bots don't retry.
  if (body._hp && body._hp.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name =
    body.name ||
    [body.firstName, body.lastName].filter(Boolean).join(" ").trim();
  const phone = (body.phone || "").trim();
  const email = (body.email || "").trim();
  const address = (body.address || "").trim();
  const city = (body.city || "").trim();
  const message = (body.message || body.needs || "").trim();
  const contactMethod = (body.contactMethod || "").trim();
  const problem = (body.problem || "").trim();
  const source = body.source || "unknown";

  if (!name || !phone) {
    return NextResponse.json(
      { error: "Missing required fields: name and phone." },
      { status: 400 }
    );
  }

  const sourcePath =
    source === "book"
      ? "/book"
      : source === "contact"
      ? "/contact"
      : source === "show-me-my-options"
      ? "/show-me-my-options"
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
      ...(email ? { replyTo: email } : {}),
    });

    if (result.error) {
      // Log with a grep-able marker so nothing is ever silently lost.
      console.error(
        "[CONSULTATION_LEAD_SEND_FAILED]",
        JSON.stringify({
          resendError: result.error,
          payload: { name, phone, email, address, city, problem, message, contactMethod, source },
          at: new Date().toISOString(),
        })
      );
      return NextResponse.json({ error: "Could not send the message." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Same failsafe log for exceptions (missing key, transport crash, etc.).
    console.error(
      "[CONSULTATION_LEAD_SEND_FAILED]",
      JSON.stringify({
        exception: String(err),
        payload: { name, phone, email, address, city, problem, message, contactMethod, source },
        at: new Date().toISOString(),
      })
    );
    return NextResponse.json({ error: "Could not send the message." }, { status: 500 });
  }
}
