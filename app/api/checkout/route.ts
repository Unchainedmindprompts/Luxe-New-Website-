import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { BUSINESS } from "@/lib/constants";

export const runtime = "nodejs";

type CheckoutBody = {
  product: string;
  color: string;
  width: string;
  height: string;
  liftSystem: string;
  quantity: number;
  /** Already converted to integer cents by the client. */
  unitPrice: number;
  /** Already converted to integer cents by the client. */
  shippingCost: number;
  /** Already in cents; informational — Stripe re-totals from line items. */
  orderTotal: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CheckoutBody>;
    const {
      product,
      color,
      width,
      height,
      liftSystem,
      quantity,
      unitPrice,
      shippingCost,
    } = body;

    if (
      !product ||
      !color ||
      !width ||
      !height ||
      !liftSystem ||
      typeof quantity !== "number" ||
      quantity < 1 ||
      typeof unitPrice !== "number" ||
      unitPrice < 1 ||
      typeof shippingCost !== "number" ||
      shippingCost < 0
    ) {
      return NextResponse.json(
        { error: "Missing or invalid order fields" },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || BUSINESS.url;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product,
              description: `Color: ${color} · Size: ${width} x ${height} · Lift: ${liftSystem}`,
            },
            unit_amount: Math.round(unitPrice),
          },
          quantity,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Shipping",
              description: "Actual freight cost",
            },
            unit_amount: Math.round(shippingCost),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/cancel`,
      shipping_address_collection: { allowed_countries: ["US"] },
      metadata: {
        product,
        color,
        width,
        height,
        liftSystem,
        quantity: String(quantity),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
