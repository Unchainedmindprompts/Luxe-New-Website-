import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { BUSINESS } from "@/lib/constants";
import {
  calculatePrice,
  calculateShipping,
  FRACTIONS,
  roundUpToBracket,
  formatMeasurement,
} from "@/lib/pricing";
import {
  FAUX_WOOD_COLORS,
  FAUX_WOOD_WIDTHS,
  FAUX_WOOD_HEIGHTS,
  FAUX_WOOD_MSRP,
} from "@/data/faux-wood-blinds";
import {
  CELLULAR_COLORS,
  CELLULAR_WIDTHS,
  CELLULAR_HEIGHTS,
  CELLULAR_MSRP,
  CELLULAR_TDBU_MSRP_SURCHARGE,
  CELLULAR_MAX_WIDTH,
} from "@/data/cellular-shades";

export const runtime = "nodejs";

type ProductKey = "faux-wood-blinds" | "cellular-shades";
type Lift = "cordless" | "tdbu";

type CheckoutBody = {
  productKey: ProductKey;
  color: string;
  wholeWidth: number;
  fractionWidth: number;
  wholeHeight: number;
  fractionHeight: number;
  lift?: Lift;
  quantity: number;
};

type PricedOrder = {
  productName: string;
  color: string;
  width: string;
  height: string;
  liftSystem: string;
  unitPriceCents: number;
  shippingCents: number;
};

const VALID_FRACTIONS = new Set<number>(FRACTIONS.map((f) => f.value));

const FAUX_WIDTHS_ARR: number[] = [...FAUX_WOOD_WIDTHS];
const FAUX_HEIGHTS_ARR: number[] = [...FAUX_WOOD_HEIGHTS];
const FAUX_COLOR_SET = new Set<string>(FAUX_WOOD_COLORS);

const CEL_ALL_WIDTHS: number[] = [...CELLULAR_WIDTHS];
const CEL_HEIGHTS_ARR: number[] = [...CELLULAR_HEIGHTS];
const CEL_CORDLESS_WIDTHS: number[] = CEL_ALL_WIDTHS.filter(
  (w) => w <= CELLULAR_MAX_WIDTH
);
const CEL_COLOR_SET = new Set<string>(CELLULAR_COLORS);

const fail = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

function priceFauxWood(body: CheckoutBody): PricedOrder | { error: string } {
  const { color, wholeWidth, fractionWidth, wholeHeight, fractionHeight, quantity } = body;
  if (!FAUX_COLOR_SET.has(color)) return { error: "Invalid color" };

  const widthDecimal = wholeWidth + fractionWidth;
  const heightDecimal = wholeHeight + fractionHeight;
  const widthMax = FAUX_WIDTHS_ARR[FAUX_WIDTHS_ARR.length - 1];
  const heightMax = FAUX_HEIGHTS_ARR[FAUX_HEIGHTS_ARR.length - 1];
  if (widthDecimal < FAUX_WIDTHS_ARR[0] || widthDecimal > widthMax) {
    return { error: `Width must be between ${FAUX_WIDTHS_ARR[0]} and ${widthMax} inches` };
  }
  if (heightDecimal < FAUX_HEIGHTS_ARR[0] || heightDecimal > heightMax) {
    return { error: `Height must be between ${FAUX_HEIGHTS_ARR[0]} and ${heightMax} inches` };
  }

  const widthBracket = roundUpToBracket(widthDecimal, FAUX_WIDTHS_ARR);
  const heightBracket = roundUpToBracket(heightDecimal, FAUX_HEIGHTS_ARR);
  const w = FAUX_WIDTHS_ARR.indexOf(widthBracket);
  const h = FAUX_HEIGHTS_ARR.indexOf(heightBracket);
  const msrp = FAUX_WOOD_MSRP[h][w];
  const perUnit = calculatePrice(msrp);
  const shipping = calculateShipping(quantity);

  return {
    productName: "SmartPrivacy Cordless Faux Wood Blinds",
    color,
    width: formatMeasurement(wholeWidth, fractionWidth),
    height: formatMeasurement(wholeHeight, fractionHeight),
    liftSystem: "Cordless",
    unitPriceCents: Math.round(perUnit * 100),
    shippingCents: Math.round(shipping * 100),
  };
}

function priceCellular(body: CheckoutBody): PricedOrder | { error: string } {
  const {
    color,
    wholeWidth,
    fractionWidth,
    wholeHeight,
    fractionHeight,
    lift,
    quantity,
  } = body;
  if (!CEL_COLOR_SET.has(color)) return { error: "Invalid color" };
  if (lift !== "cordless" && lift !== "tdbu") {
    return { error: "Invalid lift system" };
  }

  const widthDecimal = wholeWidth + fractionWidth;
  const heightDecimal = wholeHeight + fractionHeight;
  const heightMax = CEL_HEIGHTS_ARR[CEL_HEIGHTS_ARR.length - 1];
  if (widthDecimal < CEL_CORDLESS_WIDTHS[0]) {
    return { error: `Width must be at least ${CEL_CORDLESS_WIDTHS[0]} inches` };
  }
  if (widthDecimal > CELLULAR_MAX_WIDTH) {
    return {
      error: `Cordless shades have a maximum width of ${CELLULAR_MAX_WIDTH} inches`,
    };
  }
  if (heightDecimal < CEL_HEIGHTS_ARR[0] || heightDecimal > heightMax) {
    return { error: `Height must be between ${CEL_HEIGHTS_ARR[0]} and ${heightMax} inches` };
  }

  const widthBracket = roundUpToBracket(widthDecimal, CEL_CORDLESS_WIDTHS);
  const heightBracket = roundUpToBracket(heightDecimal, CEL_HEIGHTS_ARR);
  const w = CEL_ALL_WIDTHS.indexOf(widthBracket);
  const h = CEL_HEIGHTS_ARR.indexOf(heightBracket);
  const msrp = CELLULAR_MSRP[h][w];
  const base = calculatePrice(msrp);
  const surcharge = lift === "tdbu" ? calculatePrice(CELLULAR_TDBU_MSRP_SURCHARGE) : 0;
  const perUnit = base + surcharge;
  const shipping = calculateShipping(quantity);

  return {
    productName: '9/16" Portrait Honeycomb Cell Shades',
    color,
    width: formatMeasurement(wholeWidth, fractionWidth),
    height: formatMeasurement(wholeHeight, fractionHeight),
    liftSystem:
      lift === "tdbu" ? "Top Down Bottom Up (TDBU)" : "Cordless",
    unitPriceCents: Math.round(perUnit * 100),
    shippingCents: Math.round(shipping * 100),
  };
}

export async function POST(request: Request) {
  let raw: Partial<CheckoutBody>;
  try {
    raw = (await request.json()) as Partial<CheckoutBody>;
  } catch {
    return fail("Invalid JSON body");
  }

  const {
    productKey,
    color,
    wholeWidth,
    fractionWidth,
    wholeHeight,
    fractionHeight,
    lift,
    quantity,
  } = raw;

  // Shape validation — server is the source of truth for prices.
  if (productKey !== "faux-wood-blinds" && productKey !== "cellular-shades") {
    return fail("Invalid productKey");
  }
  if (typeof color !== "string" || !color) return fail("Missing color");
  if (
    typeof wholeWidth !== "number" ||
    !Number.isInteger(wholeWidth) ||
    typeof wholeHeight !== "number" ||
    !Number.isInteger(wholeHeight)
  ) {
    return fail("Whole-inch measurements must be integers");
  }
  if (
    typeof fractionWidth !== "number" ||
    typeof fractionHeight !== "number" ||
    !VALID_FRACTIONS.has(fractionWidth) ||
    !VALID_FRACTIONS.has(fractionHeight)
  ) {
    return fail("Invalid fraction value");
  }
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
    return fail("Quantity must be a positive integer");
  }
  if (lift !== undefined && lift !== "cordless" && lift !== "tdbu") {
    return fail("Invalid lift system");
  }

  const validBody = raw as CheckoutBody;

  const priced =
    productKey === "faux-wood-blinds"
      ? priceFauxWood(validBody)
      : priceCellular(validBody);

  if ("error" in priced) return fail(priced.error);
  if (priced.unitPriceCents < 1) return fail("Computed price is invalid");

  const origin = request.headers.get("origin") || BUSINESS.url;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: priced.productName,
              description: `Color: ${priced.color} · Size: ${priced.width} x ${priced.height} · Lift: ${priced.liftSystem}`,
            },
            unit_amount: priced.unitPriceCents,
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
            unit_amount: priced.shippingCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/cancel`,
      shipping_address_collection: { allowed_countries: ["US"] },
      metadata: {
        product: priced.productName,
        color: priced.color,
        width: priced.width,
        height: priced.height,
        liftSystem: priced.liftSystem,
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
