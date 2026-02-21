import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, phone, email, address, message } = await req.json();

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[contact] RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Email service not configured. Please call Mark at 208-660-8643." },
        { status: 500 }
      );
    }

    const submittedAt = new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Georgia, serif; color: #2C2C2C; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="border-top: 4px solid #C9A96E; padding-top: 24px; margin-bottom: 24px;">
    <h1 style="font-size: 22px; margin: 0 0 4px;">New Consultation Request</h1>
    <p style="color: #9C9589; font-size: 13px; margin: 0;">Submitted ${submittedAt} Pacific</p>
  </div>

  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #E8E4DE; width: 140px; color: #9C9589; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Name</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #E8E4DE; font-size: 15px; font-weight: bold;">${firstName} ${lastName}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #E8E4DE; color: #9C9589; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Phone</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #E8E4DE; font-size: 15px;"><a href="tel:${phone}" style="color: #C9A96E;">${phone}</a></td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #E8E4DE; color: #9C9589; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Email</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #E8E4DE; font-size: 15px;"><a href="mailto:${email}" style="color: #C9A96E;">${email}</a></td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #E8E4DE; color: #9C9589; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Address</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #E8E4DE; font-size: 15px;">${address || "—"}</td>
    </tr>
  </table>

  ${message ? `
  <div style="margin-top: 24px; background: #FAF7F2; border-radius: 8px; padding: 16px;">
    <p style="color: #9C9589; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">About Their Project</p>
    <p style="font-size: 15px; line-height: 1.6; margin: 0;">${message}</p>
  </div>
  ` : ""}

  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E8E4DE; color: #9C9589; font-size: 12px;">
    Sent from luxewindowworks.com — reply directly to this email to respond to ${firstName}.
  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Luxe Window Works <noreply@luxewindowworks.com>",
        to: ["mark@luxewindowworks.com"],
        reply_to: email,
        subject: `Consultation Request — ${firstName} ${lastName}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[contact] Resend error:", err);
      return NextResponse.json(
        { error: "Failed to send your request. Please call Mark at 208-660-8643." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please call Mark at 208-660-8643." },
      { status: 500 }
    );
  }
}
