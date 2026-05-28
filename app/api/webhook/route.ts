import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { Resend } from "resend";
import type Stripe from "stripe";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "Luxe Window Works <orders@luxewindowworks.com>";
const MARK_EMAIL = "mark@luxewindowworks.com";

const fmtCurrency = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const m = session.metadata || {};
    const customerEmail =
      session.customer_details?.email || session.customer_email || "";
    const orderTotal = fmtCurrency(session.amount_total ?? 0);

    const summary = [
      `Product: ${m.product || "—"}`,
      `Color: ${m.color || "—"}`,
      `Width: ${m.width || "—"}`,
      `Height: ${m.height || "—"}`,
      `Lift System: ${m.liftSystem || "—"}`,
      `Quantity: ${m.quantity || "—"}`,
      `Order Total: ${orderTotal}`,
      `Customer Email: ${customerEmail || "—"}`,
      `Stripe Session: ${session.id}`,
    ].join("\n");

    const customerBody = [
      "Thank you for your order!",
      "",
      "Here is your order summary:",
      `Product: ${m.product || "—"}`,
      `Color: ${m.color || "—"}`,
      `Size: ${m.width || "—"} x ${m.height || "—"}`,
      `Lift System: ${m.liftSystem || "—"}`,
      `Quantity: ${m.quantity || "—"}`,
      "",
      "Your custom window treatments will be made to your exact specifications. We will be in touch to confirm production and delivery timeline.",
      "",
      "Questions? Call us or reply to this email.",
      "mark@luxewindowworks.com",
    ].join("\n");

    try {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: MARK_EMAIL,
        subject: `New Luxe Order — ${m.product || "window treatment"}`,
        text: `New order received on Luxe Window Works.\n\n${summary}`,
      });

      if (customerEmail) {
        await resend.emails.send({
          from: FROM_ADDRESS,
          to: customerEmail,
          subject: "Your Luxe Window Works Order",
          text: customerBody,
        });
      }
    } catch (err) {
      // Payment is already processed — log but still ack to Stripe so it
      // doesn't keep retrying. Failed emails can be backfilled manually.
      console.error("Order email send failed:", err);
    }
  }

  return NextResponse.json({ received: true });
}
